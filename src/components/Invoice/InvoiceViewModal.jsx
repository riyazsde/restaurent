import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiX, FiPrinter, FiDownload } from 'react-icons/fi';
import { formatCurrency } from '../../utils/currencyUtils';

const InvoiceViewModal = ({
    isOpen,
    onClose,
    invoice,
    currency = 'XOF',
    restaurantData,
    onPrint,
    isPrinting = false
}) => {
    const { t } = useTranslation('invoice');
    const receiptRef = useRef(null);

    if (!isOpen || !invoice) return null;

    const raw = invoice.rawItem || invoice;
    const invId = invoice.invoiceId || raw.Invoices_id || raw.invoice_id || raw.id || 'N/A';
    const orderId = raw.POS_Order_id || raw.order?.POS_Order_id || raw.order_id || invoice.tokens || 'N/A';
    const rawDate = invoice.date || raw.Date || raw.invoice_date || raw.CreateAt || new Date().toISOString();
    const formattedDate = !isNaN(new Date(rawDate).getTime()) ? new Date(rawDate).toLocaleString() : String(rawDate);

    const storeName = restaurantData?.store_name || restaurantData?.Name || 'Restaurant Clement';
    const storeAddress = restaurantData?.address || restaurantData?.Store_address || '';
    const storePhone = restaurantData?.phone_number || restaurantData?.phone || '';

    const customerName = raw.order?.Customer?.Name || raw.Customer?.Name || raw.customer_name || invoice.customerType || 'Walk-in Guest';
    const customerPhone = raw.order?.Customer?.phone || raw.Customer?.phone || '';
    const diningOption = invoice.deliveryType || raw.Delivery_Type || raw.Dining_Option || raw.order?.Dining_Option || 'Dine in';
    const tableInfo = invoice.table || raw.Table?.Table_name || raw.Table_name || (raw.Table_id ? `Table ${raw.Table_id}` : 'N/A');
    const paymentStatus = raw.payment_status || raw.order?.payment_status || 'Paid';
    const paymentMethod = raw.payment_method || raw.order?.payment_method || 'Cash';

    // Extract items list
    const itemsList = [
        raw.items,
        raw.order?.items,
        raw.order?.order_items,
        raw.Order_id?.items,
        raw.Order_id?.order_items,
        raw.order_items
    ].find(items => Array.isArray(items) && items.length > 0) || [];

    const rawSubtotal = raw.SubTotal ?? raw.subtotal ?? raw.order?.SubTotal ?? 0;
    const rawTax = raw.Tax ?? raw.tax ?? raw.order?.Tax ?? 0;
    const rawServiceCharge = raw.Service_Charge ?? raw.serviceCharge ?? raw.service_charge ?? 0;
    const rawTotal = raw.Total ?? raw.total_price ?? raw.total ?? raw.order?.Total ?? 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white print:static print:z-auto">
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #invoice-printable-area, #invoice-printable-area * {
                        visibility: visible;
                    }
                    #invoice-printable-area {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 16px;
                        background: white;
                    }
                }
            `}</style>
            <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none">
                {/* Header Banner - hidden in print */}
                <div className="px-6 py-5 bg-gradient-to-r from-[#701A75] via-[#8E1C58] to-[#BD1B2F] text-white flex justify-between items-center print:hidden">
                    <div>
                        <h3 className="text-xl font-bold">{t('modal.title', 'Invoice Details')}</h3>
                        <p className="text-xs text-white/80">{t('table.invoiceId', 'Invoice ID')}: #{invId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Printable Receipt Body */}
                <div id="invoice-printable-area" ref={receiptRef} className="p-6 overflow-y-auto flex-1 font-[Poppins] space-y-5 print:p-8">
                    {/* Store Title Section */}
                    <div className="text-center border-b border-dashed border-gray-300 pb-4">
                        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider">{storeName}</h2>
                        {storeAddress && <p className="text-xs text-gray-500 mt-1">{storeAddress}</p>}
                        {storePhone && <p className="text-xs text-gray-500">{storePhone}</p>}
                        <div className="inline-block mt-2 px-3 py-1 bg-purple-50 text-[#8200DB] rounded-full text-xs font-semibold">
                            {t('modal.officialReceipt', 'Official Invoice Receipt')}
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                        <div>
                            <span className="text-gray-500 block">{t('table.invoiceId', 'Invoice ID')}</span>
                            <span className="font-bold text-gray-800">#{invId}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">{t('table.orderId', 'Order ID')}</span>
                            <span className="font-bold text-gray-800">#{orderId}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">{t('table.date', 'Date & Time')}</span>
                            <span className="font-medium text-gray-800">{formattedDate}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">{t('table.deliveryType', 'Delivery / Dining')}</span>
                            <span className="font-medium text-gray-800">{diningOption}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">{t('modal.customer', 'Customer')}</span>
                            <span className="font-medium text-gray-800">{customerName}</span>
                            {customerPhone && <span className="text-gray-400 block text-[10px]">{customerPhone}</span>}
                        </div>
                        <div>
                            <span className="text-gray-500 block">{t('table.table', 'Table')}</span>
                            <span className="font-medium text-gray-800">{tableInfo}</span>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">
                            {t('modal.orderedItems', 'Ordered Items')}
                        </h4>
                        {itemsList.length === 0 ? (
                            <p className="text-xs text-gray-400 italic py-2 text-center">{t('modal.noItems', 'Order item details summarized in total')}</p>
                        ) : (
                            <div className="space-y-2">
                                {itemsList.map((it, idx) => {
                                    const rawDetails = it.Item || it.itemDetails || it;
                                    const qty = Number(it.item_Quentry ?? it.quantity ?? 1);
                                    const name = it.item_name || it['item-name'] || it.Title || it.Name ||
                                        rawDetails['item-name'] || rawDetails.item_name || rawDetails.Title ||
                                        rawDetails.Name || rawDetails.name || `Item #${it.item_id || idx + 1}`;
                                    const readAmount = (...values) => {
                                        const value = values.find(candidate => candidate !== null && candidate !== undefined && candidate !== '');
                                        const amount = Number(value);
                                        return Number.isFinite(amount) ? { amount, found: value !== undefined } : { amount: 0, found: false };
                                    };
                                    const basePrice = readAmount(it.item_price, it.itemPrice, rawDetails.item_price, rawDetails.itemPrice);
                                    const variantPrice = readAmount(it.variant_price, it.variantPrice);
                                    const addonPrice = readAmount(it.addon_price, it.addonPrice);
                                    const savedUnitPrice = readAmount(it.unit_price, it.unitPrice, it.price);
                                    const catalogUnitPrice = readAmount(
                                        rawDetails.Price,
                                        rawDetails['item-price'],
                                        rawDetails.prices,
                                        rawDetails.price
                                    );
                                    const unitPrice = savedUnitPrice.found
                                        ? savedUnitPrice
                                        : basePrice.found
                                            ? { amount: basePrice.amount + variantPrice.amount + addonPrice.amount, found: true }
                                            : catalogUnitPrice;
                                    const savedLineTotal = readAmount(it.line_total, it.lineTotal, it.total_price, it.Total_price);
                                    const lineTotal = savedLineTotal.found
                                        ? savedLineTotal
                                        : unitPrice.found
                                            ? { amount: unitPrice.amount * qty, found: true }
                                            : { amount: 0, found: false };
                                    const variant = it.variant_name || it.variantName || it.Variant?.Variants ||
                                        it.item_Variants_id?.Variants || it.variantDetails?.Variants;
                                    const addons = it.addon_names || it.addonNames || it.Addons?.map?.(addon => addon.Addons).filter(Boolean).join(', ');

                                    return (
                                        <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-gray-100 last:border-b-0">
                                            <div className="flex-1 pr-2">
                                                <div>
                                                    <span className="font-semibold text-gray-800">{qty} × </span>
                                                    <span className="text-gray-700">{name}</span>
                                                    {it.item_size && <span className="text-gray-400 text-[10px] ml-1">({it.item_size})</span>}
                                                </div>
                                                {variant && <div className="text-gray-500 text-[10px]">{t('modal.variant', 'Variant')}: {variant}</div>}
                                                {addons && <div className="text-gray-500 text-[10px]">{t('modal.addons', 'Add-ons')}: {addons}</div>}
                                                <div className="text-gray-500 text-[10px]">
                                                    {t('modal.unitPrice', 'Unit price')}: {unitPrice.found ? formatCurrency(unitPrice.amount, currency) : '-'}
                                                </div>
                                            </div>
                                            <span className="font-semibold text-gray-800 shrink-0">
                                                {t('modal.lineTotal', 'Line total')}: {lineTotal.found ? formatCurrency(lineTotal.amount, currency) : '-'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Financial Summary */}
                    <div className="border-t-2 border-dashed border-gray-300 pt-3 space-y-1.5 text-xs">
                        <div className="flex justify-between text-gray-600">
                            <span>{t('table.subtotal', 'Subtotal')}</span>
                            <span className="font-medium">{formatCurrency(rawSubtotal, currency)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>{t('table.tax', 'Tax')}</span>
                            <span className="font-medium">{formatCurrency(rawTax, currency)}</span>
                        </div>
                        {Number(rawServiceCharge) > 0 && (
                            <div className="flex justify-between text-gray-600">
                                <span>{t('table.serviceCharge', 'Service Charge')}</span>
                                <span className="font-medium">{formatCurrency(rawServiceCharge, currency)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200 pt-2 mt-1">
                            <span>{t('table.total', 'Total Amount')}</span>
                            <span className="text-base text-[#8200DB]">{formatCurrency(rawTotal, currency)}</span>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="flex justify-between items-center text-xs bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        <div>
                            <span className="text-gray-500 mr-1">{t('table.paymentMethod', 'Payment')}:</span>
                            <span className="font-semibold text-gray-800 capitalize">{paymentMethod}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 mr-1">{t('table.paymentStatus', 'Status')}:</span>
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                                {paymentStatus}
                            </span>
                        </div>
                    </div>

                    {/* Footer Thank You */}
                    <div className="text-center text-gray-400 text-[11px] pt-2">
                        <p>{t('modal.thankYou', 'Thank you for your visit!')}</p>
                    </div>
                </div>

                {/* Modal Action Buttons - hidden in print */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3 print:hidden">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        {t('actions.close', 'Close')}
                    </button>
                    <button
                        type="button"
                        onClick={() => onPrint(invoice)}
                        disabled={isPrinting}
                        className="flex-1 py-2.5 bg-gradient-to-r from-[#701A75] via-[#8E1C58] to-[#BD1B2F] text-white rounded-xl text-xs font-semibold hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                        <FiPrinter className="w-4 h-4" />
                        <span>{isPrinting ? t('actions.printing', 'Printing...') : t('actions.print', 'Print Receipt')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceViewModal;
