import React, { useEffect, useRef, useState, useMemo } from "react";
import { useTranslation } from 'react-i18next';
// import { FaCheckCircle } from "react-icons/fa";
// import { MdMoreVert } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { FaPlus, FaMinus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import cancel from '../assets/cancel.svg'
import vectors from '../assets/vectors.svg'
import { BsThreeDotsVertical } from "react-icons/bs";
import herocoins from '../assets/herocoins.svg'
import { HiOutlineDocumentText } from "react-icons/hi";
import { FaPrint, FaTimes, FaInfo, FaMoneyBill } from "react-icons/fa";
import { IoCheckmarkCircle } from 'react-icons/io5';
import { FaGift, FaCreditCard, FaApple, FaGooglePay } from 'react-icons/fa';
import refresh from '../assets/refresh.svg'
import Google from '../assets/Google.svg'
import Apple from '../assets/ApplePay.svg'
import split from '../assets/split.svg'
import qr from '../assets/Qr2.svg'
import cancel2 from '../assets/cancel2.svg'
import { formatCurrency } from '../../utils/currencyUtils';
import { useOrders, useUpdateOrderStatus, useUpdateOrderItemStatus } from '../../hooks/queries/useOrders';
import { useSearchStore } from '../../store/searchStore';
import posService from '../../services/posService';
import { getOrderStatusKey, getPaymentStatusKey } from '../../utils/orderStatus';
import { resolveOrderTotal } from './orderTotals';
import { getStripeCheckoutUrl, rememberStripeOrderId } from '../../utils/stripeCheckout';

const OrderCard = ({ order, onRefresh }) => {
    const { t } = useTranslation('orders');
    const [open, setOpen] = useState(false);
    const menuRef = useRef();
    const [showModal2, setShowModal2] = useState(false);
    const [showCancel, setCancel] = useState(false);
    const [showComplete, setComplete] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
    const [isCreatingStripeLink, setIsCreatingStripeLink] = useState(false);
    const [showScanModal, setShowScanModal] = useState(false);
    const [showSuccessModal2, setShowSuccessModal2] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);
    const [updatingItemIndex, setUpdatingItemIndex] = useState(null);
    const [downloadingBill, setDownloadingBill] = useState(false);
    const updateOrderStatusMutation = useUpdateOrderStatus();
    const updateOrderItemStatusMutation = useUpdateOrderItemStatus();

    const handleDownloadBill = async () => {
        const orderId = order?.POS_Order_id ?? order?.id ?? order?.Order_id;
        if (!orderId) {
            toast.error(t('messages.billDownloadError'));
            return;
        }

        setDownloadingBill(true);
        try {
            const pdfBlob = await posService.getOrderPdf(orderId);
            if (!(pdfBlob instanceof Blob) || pdfBlob.size === 0) {
                throw new Error('The order PDF response was empty or invalid.');
            }

            const pdfUrl = URL.createObjectURL(pdfBlob);
            const downloadLink = document.createElement('a');
            downloadLink.href = pdfUrl;
            downloadLink.download = `order-${orderId}.pdf`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
            window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
            setOpen(false);
            setShowModal2(false);
        } catch (error) {
            console.error('Failed to download order PDF:', error);
            toast.error(error?.message || t('messages.billDownloadError'));
        } finally {
            setDownloadingBill(false);
        }
    };

    // Get real data from order object
    const orderItemsList = order?.items || [];
    const orderNumber = order?.POS_Order_id ?? order?.Order_id ?? order?.id ?? '';
    const mapOrderItems = (list) =>
        (list || []).map(item => ({
            name: item.Item?.item_name || item.Item?.['item-name'] || `Item ${item.item_id}`,
            quantity: item.item_Quentry || 1,
            price: item.Item?.['item-price'] || item.Item?.prices || (item.Addon?.prices || 0) + (item.Variant?.prices || 0),
            addon: item.Addon?.Addons || '',
            variant: item.Variant?.Variants || '',
            item_status: item.item_status || 'Preparing',
            item_id: item.item_id,
            item_size: item.item_size || 'Medium'
        }));

    const [items, setItems] = useState(() => mapOrderItems(orderItemsList));
    const [localPaid, setLocalPaid] = useState(false);

    useEffect(() => {
        setItems(mapOrderItems(order?.items || []));
    }, [order?.items]);

    // Handle item deletion (change status to Cancelled)
    const handleDeleteItem = async (index) => {
        const item = items[index];
        setUpdatingItemIndex(index);

        try {
            const orderId = order?.POS_Order_id ?? order?.id ?? order?.Order_id;
            const updateData = {
                id: orderId,
                item_id: item.item_id,
                item_status: 'Cancelled',
                item_size: item.item_size
            };

            const response = await updateOrderItemStatusMutation.mutateAsync(updateData);

            if (response && response.success !== false) {
                // Update local state
                setItems(prev => prev.map((itm, i) =>
                    i === index ? { ...itm, item_status: 'Cancelled' } : itm
                ));
                toast.success(t('messages.itemCancelled'));
                setShowDeleteModal(true);
                setTimeout(() => {
                    setShowDeleteModal(false);
                }, 1500);
            }
        } catch (error) {
            console.error('Error cancelling item:', error);
            toast.error(t('messages.itemCancelError'));
        } finally {
            setUpdatingItemIndex(null);
            setOpenIndex(null);
        }
    };

    // Handle order status update
    const handleOrderStatusUpdate = async (newStatus) => {
        setUpdatingOrderStatus(true);

        try {
            const orderId = order?.POS_Order_id ?? order?.id ?? order?.Order_id;
            const updateData = {
                id: orderId,
                Order_Status: newStatus
            };

            const response = await updateOrderStatusMutation.mutateAsync(updateData);

            if (response && response.success !== false) {
                if (newStatus === 'Completed' || newStatus === 'Served') {
                    setLocalPaid(true);
                    setItems(prev => prev.map(itm =>
                        itm.item_status === 'Cancelled' ? itm : { ...itm, item_status: 'Served' }
                    ));
                }
                toast.success(t('messages.orderUpdated', { status: newStatus.toLowerCase() }));

                // Close modals and dropdown
                setOpen(false);
                setCancel(false);
                setComplete(false);

                // Refresh orders list
                if (onRefresh) {
                    await onRefresh();
                }
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error(t('messages.orderUpdateError'));
        } finally {
            setUpdatingOrderStatus(false);
        }
    };

    const handlePayment = async () => {
        if (selectedPaymentMethod === 'stripe') {
            const orderId = order?.POS_Order_id ?? order?.id ?? order?.Order_id;
            if (!orderId) {
                toast.error(t('messages.stripeOrderRequired'));
                return;
            }

            setIsCreatingStripeLink(true);
            try {
                const response = await posService.createStripePaymentLink(orderId);
                const paymentUrl = getStripeCheckoutUrl(response);
                if (!paymentUrl) {
                    throw new Error(t('messages.stripeCheckoutError'));
                }
                rememberStripeOrderId(orderId);
                window.location.assign(paymentUrl);
            } catch (error) {
                toast.error(
                    error?.response?.data?.message ||
                    error?.message ||
                    t('messages.stripeCheckoutError')
                );
            } finally {
                setIsCreatingStripeLink(false);
            }
            return;
        }

        setShowScanModal(true);
        setShowPaymentModal(false);
        const orderId = order?.POS_Order_id ?? order?.id ?? order?.Order_id;
        try {
            if (orderId) {
                await posService.createPayment({
                    Payment_Options_id: 1,
                    paymentStatus: 'Success',
                    Order_id: orderId,
                    merchant_reference: `ORD-${orderId}-${Date.now()}`
                }).catch(() => {});
                await updateOrderStatusMutation.mutateAsync({
                    id: orderId,
                    Order_Status: 'Completed'
                }).catch(() => {});
            }
        } finally {
            setLocalPaid(true);
            setTimeout(async () => {
                setShowScanModal(false);
                setShowSuccessModal2(true);
                if (onRefresh) {
                    await onRefresh();
                }
            }, 1200);
        }
    };

    const updateQty = (index, change) => {
        setItems(prev =>
            prev.map((item, i) =>
                i === index
                    ? { ...item, quantity: Math.max(1, item.quantity + change) }
                    : item
            )
        );
    };

    const total = resolveOrderTotal(order);
    const tax = order?.Tax || 0;
    const subtotal = order?.SubTotal || 0;
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    const [openIndex, setOpenIndex] = useState(null);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".dropdown")) {
                setOpenIndex(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Get order data
    const orderTax = order?.Tax || 0;
    const orderSubTotal = order?.SubTotal || 0;
    const orderToken = order?.POS_Order_id || 'N/A';
    const orderTime = order?.CreateAt ? new Date(order.CreateAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const orderDiningOption = order?.Dining_Option || 'N/A';
    const orderTableName = order?.Table?.['Table-name'] || order?.Table?.name || (order?.Table_id != null ? String(order.Table_id) : 'N/A');
    const orderCustomerName = order?.Customer?.Name || 'N/A';
    const getStatusLabel = (status) => {
        return t(`status.${getOrderStatusKey(status || 'Preparing')}`);
    };

    return (
        <div className="bg-white shadow-md rounded-xl p-4 w-full border border-[#000000]">
            {/* Header */}
            <div className="py-3 flex justify-between items-start">
                <div style={{ fontFamily: "Poppins" }} className="flex items-center gap-2">
                    <div className="bg-[#f0e6f6] p-1 rounded-full">
                        <img src={vectors} alt="vectors" />
                    </div>
                    <h3 className="font-semibold text-[22px]">{orderDiningOption} / {orderTableName !== 'N/A' ? `Table ${orderTableName}` : orderCustomerName}</h3>
                </div>

                {/* Dropdown */}
                <div className="relative text-end mt-2" ref={menuRef}>
                    <button
                        type="button"
                        aria-label={t('actions.moreOrderActions', { order: orderNumber })}
                        aria-expanded={open}
                        onClick={() => setOpen(!open)}
                    >
                        <BsThreeDotsVertical aria-hidden="true" className="text-gray-500 text-sm" />
                    </button>

                    {open && (
                        <div style={{ fontFamily: 'Manrope' }} className="absolute right-0  top-6 w-48 bg-white rounded-xl shadow-xl p-3 z-50">
                            <ul className="space-y-2 text-sm">
                                <li onClick={() => setShowModal2(true)}

                                    className="flex font-medium items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
                                    <FaPrint className="text-black text-xs" />
                                    <span>{t('actions.printBill')}</span>
                                </li>
                                {showModal2 && (
                                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                                        <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md relative shadow-lg">
                                            {/* Close */}
                                            <div className="flex justify-between items-start mb-6">
                                                <div style={{ fontFamily: 'Manrope' }} className="text-start">
                                                    <h2 className="text-[28px] font-semibold">{t('modals.yourOrder')}</h2>
                                                    <p className="text-[20px] pt-2 text-[#C71585] font-medium bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] bg-clip-text text-transparent">{t('modals.checkSummary')}</p>
                                                </div>
                                                <button
                                                    onClick={() => setShowModal2(false)}
                                                    className="text-2xl font-bold text-gray-700"
                                                >
                                                    &times;
                                                </button>
                                            </div>


                                            {/* Order Items */}
                                            <div className="space-y-5  mb-6">
                                                {items.map((item, index) => (
                                                    <div key={index} className="flex justify-between border-b border-[#D32F2F] pb-2 items-center">
                                                        <p className="text-sm text-start font-medium w-[45%]">{item.name}</p>

                                                        <div className="flex items-center gap-2">
                                                            <button style={{ background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)' }}
                                                                onClick={() => updateQty(index, -1)}
                                                                className="w-6 h-6 flex items-center justify-center text-white rounded"
                                                            >
                                                                <FaMinus className="text-xs" />
                                                            </button>
                                                            <span className="text-sm font-medium">{item.quantity}</span>
                                                            <button style={{ background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)' }}
                                                                onClick={() => updateQty(index, 1)}
                                                                className="w-6 h-6 flex items-center justify-center text-white rounded"
                                                            >
                                                                <FaPlus className="text-xs" />
                                                            </button>
                                                        </div>

                                                        <p className="text-sm font-medium text-right w-[20%]">{formatCurrency(item.price * item.quantity)}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Totals */}
                                            <div className="text-sm font-medium space-y-2">
                                                <div className="flex justify-between  border-b border-[#D32F2F] pb-2  pt-3">
                                                    <span>{t('modals.itemsNetTotal')}</span>
                                                    <span>{formatCurrency(subtotal)}</span>
                                                </div>
                                                <div className="flex justify-between  border-b border-[#D32F2F] pb-2">
                                                    <span>{t('modals.taxes')}</span>
                                                    <span>{formatCurrency(tax)}</span>
                                                </div>
                                                <div className="flex justify-between  border-b border-[#D32F2F] pb-2  pt-2 font-bold text-black">
                                                    <span>{t('modals.total')}</span>
                                                    <span>{formatCurrency(total)}</span>
                                                </div>
                                            </div>

                                            {/* CTA Button */}
                                            <button
                                                onClick={handleDownloadBill}
                                                disabled={downloadingBill}
                                                style={{ background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)' }}
                                                className="w-full mt-6 py-3 text-white font-medium rounded-lg text-[20px] hover:opacity-90 transition disabled:opacity-60 disabled:cursor-wait"
                                            >
                                                {downloadingBill ? t('actions.downloadingBill') : t('actions.printBill')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <li onClick={() => setCancel(true)} className="flex font-medium items-center gap-2 text-red-500 cursor-pointer hover:bg-red-50 px-2 py-1 rounded">
                                    <FaTimes className="text-xs" />
                                    <span>{t('actions.cancel')}</span>
                                </li>
                                {showCancel && (
                                    <>
                                        <div
                                            className="fixed inset-0 bg-black bg-opacity-40 z-40"
                                            onClick={() => !updatingOrderStatus && setCancel(false)}
                                        />
                                        <div style={{ fontFamily: 'Poppins' }} className="fixed z-50 inset-0 flex items-center justify-center px-4">
                                            <div className="bg-white max-w-md w-full p-6 rounded-2xl text-center shadow-lg">
                                                <div className="flex justify-center mb-4">
                                                    <img src={cancel} alt="cancel" />
                                                </div>
                                                <h3 className="text-[24px] pt-2 font-bold text-[#C51800] mb-2">
                                                    {t('modals.cancelOrder')}
                                                </h3>
                                                <p className="text-[24px] pt-3 font-bold text-black mb-6">
                                                    {t('modals.irreversibleProcess')}
                                                </p>
                                                <button
                                                    className="bg-[#C51800] text-white px-8 py-3 mt-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={updatingOrderStatus}
                                                    onClick={() => handleOrderStatusUpdate('Cancelled')}
                                                >
                                                    {updatingOrderStatus ? t('actions.cancelling') : t('actions.continue')}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                                <li onClick={() => setComplete(true)} className="flex font-medium items-center gap-2 text-green-600 cursor-pointer hover:bg-green-50 px-2 py-1 rounded">
                                    <FaCheck className="text-xs" />
                                    <span>{t('actions.complete')}</span>
                                </li>
                                {showComplete && (
                                    <>
                                        <div
                                            className="fixed inset-0 bg-black bg-opacity-40 z-40"
                                            onClick={() => !updatingOrderStatus && setComplete(false)}
                                        />
                                        <div style={{ fontFamily: 'Poppins' }} className="fixed z-50 inset-0 flex items-center justify-center px-4">
                                            <div className="bg-white max-w-md w-full p-6 rounded-2xl text-center shadow-lg">
                                                <div className="flex justify-center mb-4">
                                                    <IoCheckmarkCircle className="text-green-500 text-6xl" />
                                                </div>
                                                <h3 className="text-[24px] font-semibold text-green-600 mb-2">
                                                    {t('modals.completeOrder')}
                                                </h3>
                                                <p className="text-[16px] text-black mb-6 pt-3">
                                                    {t('modals.markAsServed')}
                                                </p>
                                                <button
                                                    className="bg-green-500 text-white px-8 py-3 mt-4 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={updatingOrderStatus}
                                                    onClick={() => handleOrderStatusUpdate('Completed')}
                                                >
                                                    {updatingOrderStatus ? t('actions.completing') : t('actions.continue')}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                                <li onClick={() => setShowPaymentModal(true)}
                                    className="flex font-medium items-center gap-2 text-green-800 cursor-pointer hover:bg-green-100 px-2 py-1 rounded">
                                    <FaMoneyBill className="text-xs" />
                                    <span>{t('actions.payAndComplete')}</span>
                                </li>
                                {showPaymentModal && (
                                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                                        {/* <div className="bg-white w-[90%] sm:w-[450px] rounded-xl shadow-xl p-6 relative"> */}
                                        <div className="bg-white w-[90%] sm:w-[450px] max-h-[80vh] overflow-y-auto rounded-xl hide-scrollbar shadow-xl p-6 relative">

                                            {/* Close Button */}
                                            <button
                                                onClick={() => setShowPaymentModal(false)}
                                                className="absolute top-4 right-5 text-2xl font-bold text-gray-700"
                                            >
                                                &times;
                                            </button>

                                            {/* Modal Header */}
                                            <h2 className="text-[29px] text-start font-semibold mb-12">{t('modals.paymentOptions')}</h2>

                                            {/* Payment Buttons */}                    <div style={{ fontFamily: 'Manrope' }} className="space-y-3 font-semibold text-[#00000099]">
                                                <button type="button" onClick={() => setSelectedPaymentMethod('cash')} className="w-full border rounded-lg px-4 py-2  flex justify-between items-center text-left">
                                                    {t('modals.payWithCash')} <input type="radio" name="payment" checked={selectedPaymentMethod === 'cash'} onChange={() => setSelectedPaymentMethod('cash')} />
                                                </button>
                                                {/* <button className="w-full border rounded-lg px-4 py-2 flex justify-between items-center text-left">
                                                    Gift Cards <FaGift className="text-sm" /> <input type="radio" name="payment" />
                                                </button> */}
                                                <button type="button" onClick={() => setSelectedPaymentMethod('gift_card')} className="w-full border rounded-lg px-4 py-2 flex justify-between items-center text-left">
                                                    <span className="flex items-center gap-2">{t('modals.giftCards')} <FaGift /></span>
                                                    <input type="radio" name="payment" checked={selectedPaymentMethod === 'gift_card'} onChange={() => setSelectedPaymentMethod('gift_card')} />
                                                </button>

                                                <p className="text-sm text-start text-[#00000099] mt-4">{t('modals.onlinePayments')}</p>

                                                <button type="button" onClick={() => setSelectedPaymentMethod('google_pay')} className="w-full border rounded-lg px-4 py-2 flex justify-between items-center text-left">
                                                    <span className="flex items-center gap-2"><img src={Google} alt="google" /> Pay</span>
                                                    <input type="radio" name="payment" checked={selectedPaymentMethod === 'google_pay'} onChange={() => setSelectedPaymentMethod('google_pay')} />
                                                </button>
                                                <button type="button" onClick={() => setSelectedPaymentMethod('apple_pay')} className="w-full border rounded-lg px-4 py-2 flex justify-between items-center text-left">
                                                    <span className="flex items-center gap-2"><img src={Apple} alt="apple" /> Apple Pay</span>
                                                    <input type="radio" name="payment" checked={selectedPaymentMethod === 'apple_pay'} onChange={() => setSelectedPaymentMethod('apple_pay')} />
                                                </button>
                                                <button type="button" onClick={() => setSelectedPaymentMethod('momo')} className="w-full border rounded-lg px-4 py-2 flex justify-between items-center text-left">
                                                    MoMo Money
                                                    <input type="radio" name="payment" checked={selectedPaymentMethod === 'momo'} onChange={() => setSelectedPaymentMethod('momo')} />
                                                </button>
                                                <button type="button" onClick={() => setSelectedPaymentMethod('orange_money')} className="w-full border rounded-lg px-4 py-2 flex justify-between items-center text-left">
                                                    Orange Money
                                                    <input type="radio" name="payment" checked={selectedPaymentMethod === 'orange_money'} onChange={() => setSelectedPaymentMethod('orange_money')} />
                                                </button>

                                                <p className="text-sm text-gray-500 text-start mt-4">{t('modals.cardPayments')}</p>

                                                <button type="button" onClick={() => setSelectedPaymentMethod('stripe')} className="w-full border rounded-lg px-4 py-2 flex justify-between items-center text-left">
                                                    <span className="flex items-center gap-2">{t('modals.stripe')} <FaCreditCard className="text-indigo-600" /></span>
                                                    <input type="radio" name="payment" checked={selectedPaymentMethod === 'stripe'} onChange={() => setSelectedPaymentMethod('stripe')} />
                                                </button>
                                                <button type="button" onClick={() => setSelectedPaymentMethod('debit_card')} className="w-full border rounded-lg px-4 py-2 flex justify-between items-center text-left">
                                                    <span className="flex items-center gap-2">Debit Card Payment <FaCreditCard className="text-black" /></span>
                                                    <input type="radio" name="payment" checked={selectedPaymentMethod === 'debit_card'} onChange={() => setSelectedPaymentMethod('debit_card')} />
                                                </button>
                                                <button type="button" onClick={() => setSelectedPaymentMethod('credit_card')} className="w-full border rounded-lg px-4 py-2 flex justify-between items-center text-left">
                                                    <span className="flex items-center gap-2">Credit Card Payment <FaCreditCard className="text-black" /></span>
                                                    <input type="radio" name="payment" checked={selectedPaymentMethod === 'credit_card'} onChange={() => setSelectedPaymentMethod('credit_card')} />
                                                </button>

                                                <p className="text-sm text-gray-500 text-start mt-4">{t('modals.splitPayments')}</p>

                                                {/* <button className="w-full border rounded-lg px-4 py-2 flex justify-between items-center text-left">
                                                    Split Payment <input type="radio" name="payment" />
                                                </button> */}
                                                <button type="button" onClick={() => setSelectedPaymentMethod('split')} className="w-full border rounded-lg px-4 py-2 flex justify-between items-center text-left">
                                                    <span className="flex items-center gap-2">{t('modals.splitPayments')} <img src={split} alt="split" /></span>
                                                    <input type="radio" name="payment" checked={selectedPaymentMethod === 'split'} onChange={() => setSelectedPaymentMethod('split')} />
                                                </button>
                                            </div>

                                            {/* Pay Button */}
                                            <button onClick={handlePayment} disabled={isCreatingStripeLink} style={{
                                                background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)'
                                            }} className="mt-6 w-full py-3 rounded-lg text-[20px] text-white font-semibold disabled:cursor-wait disabled:opacity-70">
                                                {isCreatingStripeLink ? t('modals.startingStripeCheckout') : <>{t('modals.pay')} {formatCurrency(total)}</>}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {showScanModal && (
                                    <div style={{ fontFamily: 'Poppins' }} className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                                        <div className="bg-white p-6 rounded-2xl text-center max-w-md w-full shadow-lg">
                                            <h2 className="text-[22px] mb-2 font-semibold">{t('modals.readyToScan')}</h2>
                                            <p className="text-black mb-4">{t('modals.transactionSuccessful')}</p>
                                            <div className="flex justify-center mb-6">
                                                <img src={qr} alt="QR Code" className="h-16 w-16" />
                                            </div>
                                            <button
                                                onClick={() => setShowScanModal(false)}
                                                className="bg-gray-100 text-black px-6 py-2 rounded-md font-medium"
                                            >
                                                {t('actions.cancel')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {showSuccessModal2 && (
                                    <>
                                        <div className="fixed inset-0 bg-black bg-opacity-40 z-40" />
                                        <div className="fixed z-50 inset-0 flex items-center justify-center px-4">
                                            <div className="bg-white max-w-md w-full p-6 rounded-2xl text-center shadow-lg">
                                                <div className="flex justify-center mb-4">
                                                    <IoCheckmarkCircle className="text-green-500 mb-2 text-6xl" />
                                                </div>
                                                <h3 className="text-[24px] font-semibold text-green-600 mb-4">
                                                    {t('modals.paymentDone')}
                                                </h3>
                                                <p className="text-[16px] text-black mb-6">
                                                    {t('modals.dishCreated')}
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setShowSuccessModal2(false);

                                                    }}
                                                >
                                                    {t('actions.continue')}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}

                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Number & Status */}
            <div
                style={{
                    background:
                        "linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)",
                }}
                className="mx-2 rounded-xl px-4 py-3 mb-4"
            >
                <div style={{ fontFamily: "Poppins" }} className="py-3 flex flex-wrap justify-between items-start gap-3">
                    {(() => {
                        const allItemsServed = items.length > 0 && items.every(it => it.item_status === 'Served');
                        const effectiveOrderStatus = allItemsServed && (!order?.Order_Status || order?.Order_Status === 'Preparing' || order?.Order_Status === 'Ready')
                            ? 'Served'
                            : (order?.Order_Status || 'Preparing');
                        const isOrderFinished = effectiveOrderStatus === 'Served' || effectiveOrderStatus === 'Completed';
                        const rawPayStatus = order?.payment_status;
                        const effectivePayStatus = localPaid || ['Completed', 'Paid', 'Success'].includes(rawPayStatus)
                            ? (rawPayStatus && ['Completed', 'Paid', 'Success'].includes(rawPayStatus) ? rawPayStatus : 'Completed')
                            : effectiveOrderStatus === 'Cancelled'
                                ? 'Cancelled'
                                : isOrderFinished
                                    ? 'Completed'
                                    : (rawPayStatus || 'Pending');

                        return (
                            <>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-[16px] bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] bg-clip-text text-transparent">
                                        Order #{orderToken}
                                    </h3>
                                    <span className={`text-[12px] font-medium px-2 py-1 rounded ${isOrderFinished ? 'bg-green-100 text-green-700' :
                                            effectiveOrderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {isOrderFinished && effectiveOrderStatus === 'Served'
                                            ? t('status.served')
                                            : getStatusLabel(effectiveOrderStatus)}
                                    </span>
                                </div>
                                <div className="text-end">
                                    <p className="text-[12px] text-gray-600">{orderTime}</p>
                                    <p className={`text-[12px] flex items-center justify-end gap-1 ${effectivePayStatus === "Pending"
                                            ? "text-yellow-600"
                                            : effectivePayStatus === "Completed" || effectivePayStatus === "Paid" || effectivePayStatus === "Success" || effectivePayStatus === "Served"
                                                ? "text-green-600"
                                                : effectivePayStatus === "Failed" || effectivePayStatus === "Cancelled"
                                                    ? "text-red-600"
                                                    : effectivePayStatus === "Processing"
                                                        ? "text-blue-600"
                                                        : "text-gray-600"
                                        } text-[10px] font-medium`}>
                                        <img src={herocoins} alt="coin" className="w-3 h-3" />
                                        {t(`payment.${getPaymentStatusKey(effectivePayStatus)}`)}
                                    </p>
                                </div>
                            </>
                        );
                    })()}
                </div>

                {/* Order Items */}
                <ul style={{ fontFamily: "Poppins" }} className="space-y-3">
                    {items.map((item, index) => {
                        const itemStatus = item.item_status || 'Preparing';
                        const isUpdating = updatingItemIndex === index;

                        return (
                            <li key={index} className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                    {itemStatus === 'Served' ? (
                                        <FaCheck className="text-green-600 text-xs mt-1 flex-shrink-0" />
                                    ) : itemStatus === 'Cancelled' ? (
                                        <FaTimes className="text-red-600 text-xs mt-1 flex-shrink-0" />
                                    ) : (
                                        <div className="w-3 h-3 mt-1 flex-shrink-0 rounded-full border-2 border-yellow-500" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[14px] text-gray-800 break-words [overflow-wrap:anywhere]">
                                            <span className={itemStatus === 'Cancelled' ? 'line-through text-gray-400' : ''}>
                                                {item.name}
                                            </span>
                                            <span className={`inline-block whitespace-nowrap font-medium ml-1 ${itemStatus === 'Cancelled' ? 'text-gray-400' : ''}`}>
                                                x{item.quantity}
                                            </span>
                                        </div>
                                        {item.addon && (
                                            <div className="text-[11px] text-gray-500 mt-0.5">
                                                + {item.addon.toLowerCase()}
                                            </div>
                                        )}
                                        {item.variant && (
                                            <div className="text-[11px] text-gray-500 mt-0.5">
                                                {item.variant.toLowerCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex w-28 sm:w-32 flex-shrink-0 items-start justify-end gap-2 relative dropdown">
                                    <span className={`max-w-full break-words text-right text-[12px] leading-tight font-medium ${itemStatus === 'Served' ? 'text-green-600' :
                                            itemStatus === 'Cancelled' ? 'text-red-600' :
                                                'text-yellow-600'
                                        }`}>
                                        {getStatusLabel(itemStatus)}
                                    </span>

                                    {itemStatus !== 'Cancelled' && (
                                        <button
                                            type="button"
                                            aria-label={t('actions.moreItemActions', { item: item.name, order: orderNumber })}
                                            aria-expanded={openIndex === index}
                                            onClick={() =>
                                                setOpenIndex(openIndex === index ? null : index)
                                            }
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <BsThreeDotsVertical aria-hidden="true" className="text-sm" />
                                        </button>
                                    )}

                                    {openIndex === index && (
                                        <div className="absolute right-0 z-10 mt-6 w-40 bg-white rounded-lg shadow-lg ring-1 ring-black/10">
                                            <button
                                                type="button"
                                                aria-label={t('actions.deleteItemNamed', { item: item.name, order: orderNumber })}
                                                className={`flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 ${isUpdating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                                                    }`}
                                                onClick={() => !isUpdating && handleDeleteItem(index)}
                                                disabled={isUpdating}
                                            >
                                                {isUpdating ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        <span className="text-sm font-medium">{t('actions.cancelling')}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaTimes size={14} className="text-red-500" />
                                                        <span className="text-sm font-medium">{t('actions.deleteItem')}</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </li>
                        );
                    })}

                </ul>

                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/20 z-50 flex justify-center items-center">
                        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
                            <h2 style={{ fontFamily: 'Manrope' }} className="text-[22px] font-semibold mb-2">{t('modals.itemDeleted')}</h2>
                            <p style={{ fontFamily: 'Poppins' }} className="text-[14px] text-black mb-4">
                                {t('modals.foodPreparing')}
                            </p>
                            <div className="flex justify-center">
                                <div className=" rounded-full flex items-center justify-center ">
                                    <img src={cancel2} alt="cancel" />
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Orders = () => {
    const { t } = useTranslation('orders');
    const [showLoadedMessage, setShowLoadedMessage] = useState(false);
    const { data: orders = [], isLoading, refetch: fetchOrders } = useOrders();
    const { searchQuery, setSearchPlaceholder } = useSearchStore();

    useEffect(() => {
        setSearchPlaceholder(t('searchPlaceholder', 'Search by order #, customer, or table...'));
        return () => setSearchPlaceholder('');
    }, [setSearchPlaceholder, t]);

    const filteredOrders = useMemo(() => {
        if (!orders || !Array.isArray(orders)) return [];
        if (!searchQuery || !searchQuery.trim()) return orders;
        const q = searchQuery.toLowerCase().trim();
        return orders.filter(order => {
            const orderId = String(order.POS_Order_id ?? order._id ?? order.id ?? order.Order_id ?? '').toLowerCase();
            const customerName = String(order.Customer?.Name || order.Customer?.phone || order.Customer_name || order.customer?.name || '').toLowerCase();
            const tableNumber = String(order.Table?.['Table-name'] || order.Table_id || order.table_number || order.Table_number || order.table_id || '').toLowerCase();
            const diningOption = String(order.Dining_Option || order.dining_option || '').toLowerCase();
            const orderStatus = String(order.Order_Status || '').toLowerCase();
            const paymentStatus = String(order.payment_status || '').toLowerCase();
            const itemMatch = (order.items || []).some(item => {
                const name = String(item.Item?.item_name || item.Item?.['item-name'] || '').toLowerCase();
                const addon = String(item.Addon?.Addons || '').toLowerCase();
                const variant = String(item.Variant?.Variants || '').toLowerCase();
                return name.includes(q) || addon.includes(q) || variant.includes(q);
            });

            return orderId.includes(q) ||
                   customerName.includes(q) ||
                   tableNumber.includes(q) ||
                   diningOption.includes(q) ||
                   orderStatus.includes(q) ||
                   paymentStatus.includes(q) ||
                   itemMatch;
        });
    }, [orders, searchQuery]);

    const handleRefresh = async () => {
        await fetchOrders();
        // Show "Orders Loaded"
        setShowLoadedMessage(true);

        // Hide after 2 seconds
        setTimeout(() => {
            setShowLoadedMessage(false);
        }, 2000);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 md:gap-8 mb-6 flex-wrap">
                <h2 style={{ fontFamily: 'Poppins' }} className="hidden md:block text-[32px] font-bold">{t('title')}</h2>
                <button onClick={handleRefresh} style={{
                    background: 'linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)', fontFamily: 'Manrope'
                }} className="w-[147px] border border-[#D32F2F] text-[16px] rounded-lg px-4 py-2 flex justify-between items-center text-left cursor-pointer">
                    <span className="flex items-center gap-2"> <img src={refresh} className="w-6 h-6" alt="refresh" />{t('refresh')} </span>
                </button>

                {showLoadedMessage && (
                    <div
                        style={{
                            fontFamily: 'Manrope',
                            background: 'linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)',
                        }}
                        className="w-[190px] border border-[#D32F2F] text-[16px] rounded-lg px-4 py-2 flex justify-between items-center"
                    >
                        <span className="flex items-center gap-2 text-green-800">
                            <span className="text-[16px]">                                                    <IoCheckmarkCircle className="text-green-500  text-xl" />
                            </span>
                            {t('ordersLoaded')}
                        </span>
                    </div>
                )}
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-fluid gap-6">
                    {Array.from({ length: 8 }).map((_, idx) => (
                        <div key={idx} className="bg-white shadow-md rounded-xl p-4 w-full border border-gray-200 animate-pulse">
                            {/* Header Skeleton */}
                            <div className="py-3 flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className="bg-gray-200 rounded-full w-8 h-8"></div>
                                    <div className="bg-gray-200 h-6 w-32 md:w-48 rounded"></div>
                                </div>
                                <div className="bg-gray-200 w-4 h-4 rounded"></div>
                            </div>

                            {/* Order Number & Status Skeleton */}
                            <div className="mx-2 rounded-xl px-4 py-3 mb-4 bg-gray-50 mt-2">
                                <div className="py-3 flex justify-between items-start">
                                    <div className="bg-gray-200 h-5 w-24 rounded"></div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="bg-gray-200 h-3 w-12 rounded"></div>
                                        <div className="bg-gray-200 h-3 w-16 rounded"></div>
                                    </div>
                                </div>

                                {/* Order Items list Skeleton */}
                                <ul className="space-y-4 mt-2 mb-2">
                                    {[1, 2, 3].map((itemIdx) => (
                                        <li key={itemIdx} className="flex justify-between items-center px-2">
                                            <div className="flex items-center gap-3 w-full">
                                                <div className="w-3 h-3 rounded-full bg-gray-200 flex-shrink-0"></div>
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            </div>
                                            <div className="h-4 bg-gray-200 rounded w-16 flex-shrink-0 ml-4"></div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Grid */}
            {!isLoading && (
                <div className="grid grid-cols-fluid gap-6">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <OrderCard key={order._id || order.POS_Order_id || order.id || order.Order_id} order={order} onRefresh={fetchOrders} />
                        ))
                    ) : orders.length > 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            {t('noOrdersMatch', 'No orders match your search query')}
                        </div>
                    ) : (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            {t('noOrders')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Orders;
