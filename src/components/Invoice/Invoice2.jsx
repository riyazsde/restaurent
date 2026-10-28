import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
// import { FiSearch, FiFilter } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
// import { FaEye, FaEdit, FaTrash, FaPrint, FaDraft } from 'react-icons/fa';
// import { IoClose } from 'react-icons/io5';
import { FiArrowLeft, FiDownload } from "react-icons/fi";
import { toast } from 'react-toastify';

import draft from '../assets/draft.svg';
import print from '../assets/print.svg';
import { useInvoices } from '../../hooks/queries/useInvoice';
import invoiceService from '../../services/invoiceService';
import posService from '../../services/posService';
import { useRestaurant } from '../../hooks/queries/usePos';
import { resolveCurrencySymbol } from '../../utils/currencyUtils';
import useSearchStore from '../../store/searchStore';
import InvoiceViewModal from './InvoiceViewModal';

const ReservationsHeader = () => {
    const { t } = useTranslation('invoice');
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const { data: restaurantData } = useRestaurant();
    const currency = resolveCurrencySymbol(restaurantData?.currency);

    const { data: response, isLoading } = useInvoices();

    let data = [];
    if (response?.data?.invoices) {
        data = response.data.invoices;
    } else if (Array.isArray(response?.data)) {
        data = response.data;
    }

    const tableHeaders = [
        t('table.invoiceId'),
        t('table.tokens'),
        t('table.date'),
        t('table.tax'),
        t('table.subtotal'),
        t('table.serviceCharge'),
        t('table.total'),
        t('table.deliveryType'),
        t('table.customerType'),
        t('table.table'),
        t('table.action')
    ];

    // Format data safe mapper with dynamic currency & full POS invoice flat fields
    const formattedData = data.map(item => {
        const invId = item.Invoices_id ?? item.invoice_id ?? item.invoiceId ?? item.id ?? item.PaymentByRestaurant_id ?? t('na');
        const tokenVal = item.Tokens ?? item.tokens ?? t('na');
        const rawDate = item.Date || item.date || item.CreateAt || item.createdAt;
        const formattedDate = rawDate
            ? (!isNaN(new Date(rawDate).getTime()) ? new Date(rawDate).toLocaleString() : String(rawDate))
            : t('na');
        const itemCurrency = item.currency || currency;
        const rawTax = item.Tax ?? item.tax ?? item.Order_id?.Tax ?? 0;
        const rawSubtotal = item.SubTotal ?? item.subtotal ?? item.Order_id?.SubTotal ?? 0;
        const rawServiceCharge = item.Service_Charge ?? item.serviceCharge ?? item.ServiceCharge ?? 0;
        const rawTotal = item.Total ?? item.total_price ?? item.total ?? item.Order_id?.Total ?? 0;
        const delivery = item.Delivery_Type || item.deliveryType || item.Dining_Option || item.Order_id?.Dining_Option || t('na');
        const custType = item.Customer_Type || item.customerType || t('na');
        const tableVal = item.Table_name || item.table || item.Table?.['Table-name'] || item.Table?.Table_name || (item.Table_id ? `Table ${item.Table_id}` : (item.Order_id?.Table_id ? `Table ${item.Order_id.Table_id}` : t('na')));

        return {
            invoiceId: invId,
            tokens: tokenVal,
            date: formattedDate,
            tax: `${rawTax} ${itemCurrency}`,
            subtotal: `${rawSubtotal} ${itemCurrency}`,
            serviceCharge: `${rawServiceCharge} ${itemCurrency}`,
            total: `${rawTotal} ${itemCurrency}`,
            deliveryType: delivery,
            customerType: custType,
            table: tableVal,
            rawItem: item
        };
    });

    const handleExportCsv = async () => {
        try {
            setIsExporting(true);
            const blob = await invoiceService.exportInvoices();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoices_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success(t('exportSuccess', 'Invoices exported successfully!'));
        } catch (err) {
            toast.error(err.message || t('exportFailed', 'Failed to export invoices'));
        } finally {
            setIsExporting(false);
        }
    };

    const handleViewInvoice = async (row) => {
        setSelectedInvoice(row);
        setIsViewModalOpen(true);

        const raw = row?.rawItem || row;
        const invId = raw?.Invoices_id ?? raw?.invoice_id ?? raw?.id ?? row?.invoiceId;
        const orderId = raw?.POS_Order_id || raw?.order?.POS_Order_id || raw?.Order_id || raw?.order_id;

        // If items are not already attached, fetch details in background to populate line items
        const hasItems = (Array.isArray(raw?.items) && raw.items.length > 0) || (Array.isArray(raw?.order?.items) && raw.order.items.length > 0);
        if (!hasItems) {
            try {
                if (invId && /^\d+$/.test(String(invId))) {
                    const res = await invoiceService.getInvoiceById(invId);
                    const fetchedInvoice = res?.data || res;
                    if (fetchedInvoice && (fetchedInvoice.items || fetchedInvoice.order)) {
                        setSelectedInvoice(prev => ({
                            ...prev,
                            rawItem: { ...raw, ...fetchedInvoice }
                        }));
                        return;
                    }
                }
                if (orderId && /^\d+$/.test(String(orderId))) {
                    const orderRes = await posService.getOrderById(orderId);
                    const fetchedOrder = orderRes?.data || orderRes;
                    if (fetchedOrder) {
                        setSelectedInvoice(prev => ({
                            ...prev,
                            rawItem: {
                                ...raw,
                                order: fetchedOrder,
                                items: fetchedOrder.items || fetchedOrder.order_items || raw?.items
                            }
                        }));
                    }
                }
            } catch (e) {
                console.log('Background invoice item fetch fallback:', e);
            }
        }
    };

    const handlePrintInvoice = async (row) => {
        const invoiceData = row || selectedInvoice;
        if (!invoiceData) return;

        const raw = invoiceData.rawItem || invoiceData;
        const orderId = raw.POS_Order_id || raw.order?.POS_Order_id || raw.Order_id || raw.order_id || (invoiceData.tokens && /^\d+$/.test(String(invoiceData.tokens)) ? invoiceData.tokens : null);

        if (orderId && /^\d+$/.test(String(orderId))) {
            try {
                setIsPrinting(true);
                toast.info(t('actions.preparingPrint', 'Preparing receipt for print...'));
                const pdfBlob = await posService.getOrderPdf(orderId);
                const blobUrl = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));

                const iframe = document.createElement('iframe');
                iframe.style.position = 'fixed';
                iframe.style.right = '0';
                iframe.style.bottom = '0';
                iframe.style.width = '0';
                iframe.style.height = '0';
                iframe.style.border = '0';
                iframe.src = blobUrl;
                document.body.appendChild(iframe);
                iframe.onload = () => {
                    try {
                        iframe.focus();
                        iframe.contentWindow.print();
                    } catch (e) {
                        window.open(blobUrl, '_blank');
                    }
                };
                return;
            } catch (err) {
                console.warn('Server PDF print failed, falling back to receipt modal print:', err);
            } finally {
                setIsPrinting(false);
            }
        }

        // Fallback: open view modal and trigger browser print
        setSelectedInvoice(invoiceData);
        setIsViewModalOpen(true);
        setTimeout(() => {
            window.print();
        }, 300);
    };

    const { searchQuery, setSearchPlaceholder } = useSearchStore();

    useEffect(() => {
        setSearchPlaceholder(t('searchPlaceholder', 'Search invoices...'));
        return () => setSearchPlaceholder('');
    }, [setSearchPlaceholder, t]);

    const filteredData = useMemo(() => {
        if (!searchQuery || !searchQuery.trim()) return formattedData;
        const q = searchQuery.toLowerCase().trim();
        return formattedData.filter(item => {
            return String(item.invoiceId).toLowerCase().includes(q) ||
                   String(item.tokens).toLowerCase().includes(q) ||
                   String(item.deliveryType).toLowerCase().includes(q) ||
                   String(item.customerType).toLowerCase().includes(q) ||
                   String(item.table).toLowerCase().includes(q);
        });
    }, [formattedData, searchQuery]);

    return (
        <>
            <div className="p-4 sm:p-6 font-[Poppins] space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl sm:text-[32px] font-bold">{t('title')}</h2>
                    </div>

                    <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                        {/* <div className="flex items-center border border-gray-300 rounded-md px-2 py-[10px] bg-white w-full sm:w-[200px]">
                            <input
                                type="text"
                                placeholder="Search Invoice"
                                className="text-sm w-full outline-none bg-transparent"
                            />
                            <FiSearch className="text-gray-500" />
                        </div> */}

                        {/* <button
                            style={{
                                background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)'
                            }}
                            className="px-4 py-[6px] text-base sm:text-[18px] text-white rounded-md"
                        >
                            Search
                        </button> */}

                        {/* <button onClick={() => setShowModal(true)} className="p-2">
                            <FiFilter className="text-gray-600" />
                        </button> */}
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <>
                        {/* Backdrop */}
                        <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setShowModal(false)} />

                        {/* Modal Content */}
                        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                            <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-md">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-6">
                                    {/* <h2 className="text-lg font-bold flex items-center gap-2">
                                        <FiFilter /> Filter
                                    </h2> */}
                                    {/* <button onClick={() => setShowModal(false)}>
                                        <IoClose className="text-xl" />
                                    </button> */}
                                </div>

                                {/* Form */}
                                <div className="space-y-4">
                                    {/* Sort by Day */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('filter.sortByDay')}</label>
                                        <select
                                            className="w-full border border-purple-300 text-sm rounded-md px-3 py-2 outline-none bg-white"
                                        >
                                            <option>{t('filter.today')}</option>
                                            <option>{t('filter.yesterday')}</option>
                                            <option>{t('filter.thisWeek')}</option>
                                            <option>{t('filter.thisMonth')}</option>
                                        </select>
                                    </div>

                                    {/* From and To Dates */}
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="w-full sm:w-1/2">
                                            <label className="block text-sm mb-1">{t('filter.from')}</label>
                                            <input
                                                type="date"
                                                className="w-full border border-purple-300 text-sm rounded-md px-3 py-2 outline-none bg-gradient-to-r from-[#F5EBFF] to-[#FDF3F3]"
                                            />
                                        </div>
                                        <div className="w-full sm:w-1/2">
                                            <label className="block text-sm mb-1">{t('filter.to')}</label>
                                            <input
                                                type="date"
                                                className="w-full border border-purple-300 text-sm rounded-md px-3 py-2 outline-none bg-gradient-to-r from-[#F5EBFF] to-[#FDF3F3]"
                                            />
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <div className="pt-4">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="w-full py-2 text-white rounded-md font-medium bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F]"
                                        >
                                            {t('filter.save')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Second Row: Left text */}
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="w-full flex flex-wrap items-center justify-between">
                        <p className="text-base sm:text-[20px] text-gray-500 mb-2 sm:mb-0">
                            {t('showingToday', 'Showing Invoices for Today')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6 font-[Poppins]">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        {/* Table for desktop */}
                        <table className="hidden sm:table w-full text-center border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-[#F9EAF2] border-b border-gray-200">
                                    {tableHeaders.map((heading, i) => (
                                        <th key={i} className="px-4 py-4 text-xs font-bold text-gray-600 whitespace-nowrap border-r border-gray-200 last:border-r-0">
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                            {isLoading ? (
                                <>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <tr key={i} className="animate-pulse border-b border-gray-200">
                                            <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                            <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-10"></div></td>
                                            <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                            <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                            <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                            <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                            <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                            <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                            <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                            <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                                            <td className="px-4 py-4">
                                                <div className="flex gap-2">
                                                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                                                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="p-8 text-center text-gray-500 font-medium">
                                        {searchQuery ? t('common.noResults', 'No invoices found') : t('noInvoices')}
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((row, i) => (
                                    <tr
                                        key={i}
                                        className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors bg-white"
                                    >
                                        <td className="px-4 py-4 text-xs font-bold text-gray-800 border-r border-gray-200">{row.invoiceId}</td>
                                        <td className="px-4 py-4 text-xs font-bold text-gray-800 border-r border-gray-200">{row.tokens}</td>
                                        <td className="px-4 py-4 text-xs font-bold text-gray-800 border-r border-gray-200">{row.date}</td>
                                        <td className="px-4 py-4 text-xs font-bold text-gray-800 border-r border-gray-200">{row.tax}</td>
                                        <td className="px-4 py-4 text-xs font-bold text-gray-800 border-r border-gray-200">{row.subtotal}</td>
                                        <td className="px-4 py-4 text-xs font-bold text-gray-800 border-r border-gray-200">{row.serviceCharge}</td>
                                        <td className="px-4 py-4 text-xs font-bold text-gray-800 border-r border-gray-200">{row.total}</td>
                                        <td className="px-4 py-4 text-xs font-bold text-gray-800 border-r border-gray-200">{row.deliveryType}</td>
                                        <td className="px-4 py-4 text-xs font-bold text-gray-800 border-r border-gray-200">{row.customerType}</td>
                                        <td className="px-4 py-4 text-xs font-bold text-gray-800 border-r border-gray-200">{row.table}</td>
                                        <td className="px-4 py-4 text-xs font-bold text-gray-800 border-r border-gray-200 last:border-r-0">
                                            <div className="flex items-center justify-center gap-2 text-[14px]">
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewInvoice(row)}
                                                    title={t('actions.view', 'View Invoice')}
                                                    className="p-1.5 rounded-full bg-gradient-to-b from-[#6A1B9A]/10 to-[#D32F2F]/10 hover:from-[#6A1B9A]/20 hover:to-[#D32F2F]/20 transition-colors cursor-pointer"
                                                >
                                                    <img src={draft} alt="Draft" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handlePrintInvoice(row)}
                                                    disabled={isPrinting}
                                                    title={t('actions.print', 'Print')}
                                                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                                                >
                                                    <img src={print} alt="Print" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Card layout for mobile */}
                    <div className="sm:hidden space-y-4">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm animate-pulse">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                            <div className="col-span-2 flex items-center gap-2 mt-4">
                                                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                                                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 font-medium border border-gray-300 rounded-lg">
                                {searchQuery ? t('common.noResults', 'No invoices found') : t('noInvoices')}
                            </div>
                        ) : (
                            filteredData.map((row, i) => (
                                <div
                                    key={i}
                                    className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm"
                                >
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="font-medium">{t('table.invoiceId')}:</span> {row.invoiceId}
                                        </div>
                                    <div>
                                        <span className="font-medium">{t('table.tokens')}:</span> {row.tokens}
                                    </div>
                                    <div>
                                        <span className="font-medium">{t('table.date')}:</span> {row.date}
                                    </div>
                                    <div>
                                        <span className="font-medium">{t('table.tax')}:</span> {row.tax}
                                    </div>
                                    <div>
                                        <span className="font-medium">{t('table.subtotal')}:</span> {row.subtotal}
                                    </div>
                                    <div>
                                        <span className="font-medium">{t('table.serviceCharge')}:</span> {row.serviceCharge}
                                    </div>
                                    <div>
                                        <span className="font-medium">{t('table.total')}:</span> {row.total}
                                    </div>
                                    <div>
                                        <span className="font-medium">{t('table.deliveryType')}:</span> {row.deliveryType}
                                    </div>
                                    <div>
                                        <span className="font-medium">{t('table.customerType')}:</span> {row.customerType}
                                    </div>
                                    <div>
                                        <span className="font-medium">{t('table.table')}:</span> {row.table}
                                    </div>
                                    <div className="col-span-2 flex items-center gap-2 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => handleViewInvoice(row)}
                                            title={t('actions.view', 'View Invoice')}
                                            className="rounded-full p-2 bg-gradient-to-b from-[#6A1B9A]/10 to-[#D32F2F]/10 hover:from-[#6A1B9A]/20 hover:to-[#D32F2F]/20 transition-colors cursor-pointer"
                                        >
                                            <img src={draft} alt="Draft" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePrintInvoice(row)}
                                            disabled={isPrinting}
                                            title={t('actions.print', 'Print')}
                                            className="rounded-full p-2 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            <img src={print} alt="Print" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )))}
                    </div>
                </div>
            </div>
        </div>

        <InvoiceViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                invoice={selectedInvoice}
                currency={currency}
                restaurantData={restaurantData}
                onPrint={handlePrintInvoice}
                isPrinting={isPrinting}
            />
        </>
    );
};

export default ReservationsHeader;