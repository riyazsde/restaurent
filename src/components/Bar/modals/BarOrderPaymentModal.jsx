import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Minus, Plus, ArrowLeft, CreditCard } from 'lucide-react';
import { formatCurrency } from '../../../utils/currencyUtils';
import posService from '../../../services/posService';
import { toast } from 'react-toastify';
import { getStripeCheckoutUrl, rememberStripeOrderId } from '../../../utils/stripeCheckout';

const BarOrderPaymentModal = ({
    isOpen = false,
    onClose,
    cartItems = [],
    onUpdateQuantity,
    onRemoveItem,
    selectedTable = '04',
    selectedFloor = 'F - 01',
    selectedPersons = 1,
    currency = 'XOF',
    taxRate = 0.06,
    restaurantId,
    onPaymentSuccess
}) => {
    const { t } = useTranslation('common');

    // Step state: 1 = "YOUR_ORDER", 2 = "PAYMENT_OPTIONS"
    const [step, setStep] = useState(1);
    const [selectedMethod, setSelectedMethod] = useState('cash');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState(null);

    // Reset step whenever modal opens
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSelectedMethod('cash');
            setIsSubmitting(false);
            setCreatedOrderId(null);
        }
    }, [isOpen]);

    // Financial calculations
    const itemsNetTotal = useMemo(() => {
        return cartItems.reduce((acc, it) => acc + (Number(it.price) || 0) * (it.quantity || 1), 0);
    }, [cartItems]);

    const taxes = useMemo(() => {
        return Math.round(itemsNetTotal * taxRate);
    }, [itemsNetTotal, taxRate]);

    const grandTotal = useMemo(() => {
        return itemsNetTotal + taxes;
    }, [itemsNetTotal, taxes]);

    if (!isOpen) return null;

    // Handle payment completion
    const handleCompletePayment = async () => {
        if (cartItems.length === 0) {
            toast.warn(t('bar.payment.cartEmpty', 'Your cart is empty'));
            return;
        }

        setIsSubmitting(true);
        try {
            // Map payment method title for backend
            const methodTitles = {
                cash: 'Cash',
                gift_card: 'Gift Card',
                debit_card: 'Debit Card',
                credit_card: 'Credit Card',
                stripe: 'Stripe Checkout'
            };
            const methodTitle = methodTitles[selectedMethod] || selectedMethod || 'Cash';

            // 1. Create POS order with Bar type
            const orderPayload = {
                items: cartItems.map(item => ({
                    item_id: item.item?.Items_id || item.item?.id || item.id || 1,
                    item_Quentry: item.quantity || 1,
                    item_size: item.size || 'Regular',
                    item_status: 'Preparing',
                    notes: item.notes || item.addonsText || ''
                })),
                Tax: taxes,
                SubTotal: itemsNetTotal,
                Total: grandTotal,
                Dining_Option: 'Dine in',
                Order_Type: 'Bar',
                Table_id: isNaN(Number(selectedTable)) ? 128 : Number(selectedTable),
                Restaurant_id: restaurantId || 18,
                Kitchen_id: 1,
                payment_method: methodTitle
            };

            let orderId = createdOrderId;
            if (!orderId) {
                const orderResponse = await posService.createPosOrder(orderPayload);
                orderId = orderResponse?.data?.POS_Order_id ||
                    orderResponse?.data?.id ||
                    orderResponse?.POS_Order_id ||
                    orderResponse?.id;
                if (orderId) setCreatedOrderId(orderId);
            }

            if (!orderId) {
                throw new Error(t('bar.payment.orderCreateError', 'The order was created without an order ID.'));
            }

            if (selectedMethod === 'stripe') {
                const stripeResponse = await posService.createStripePaymentLink(orderId);
                const paymentUrl = getStripeCheckoutUrl(stripeResponse);
                if (!paymentUrl) {
                    throw new Error(t('bar.payment.stripeLinkError', 'Stripe did not return a payment link.'));
                }
                rememberStripeOrderId(orderId);
                window.location.assign(paymentUrl);
                return;
            }

            // 2. Record payment transaction if possible
            try {
                await posService.createPayment({
                    Payment_Options_id: 1,
                    paymentStatus: 'Success',
                    Order_id: orderId,
                    amount: grandTotal,
                    payment_method: methodTitle
                });
            } catch (payErr) {
                console.warn('Optional payment record notification:', payErr);
            }

            toast.success(t('bar.payment.orderCompleted', 'Payment successful! Order completed.'));
            onPaymentSuccess?.({
                orderId,
                paymentMethod: methodTitle,
                total: grandTotal
            });
            onClose();
        } catch (error) {
            console.error('Error completing payment:', error);
            toast.error(error?.response?.data?.message || error?.message || t('bar.payment.paymentError', 'Payment could not be completed.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            {/* Modal Card */}
            <div 
                className="bg-white rounded-[28px] max-w-[460px] w-full p-8 shadow-2xl relative flex flex-col font-sans max-h-[92vh] overflow-y-auto hide-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-6 right-6 p-1.5 rounded-full text-gray-800 hover:text-black hover:bg-gray-100 transition-colors z-10"
                    aria-label="Close"
                >
                    <X className="w-5 h-5 stroke-[2.5]" />
                </button>

                {/* ======================================================== */}
                {/* STEP 1: YOUR ORDER SUMMARY (media_1792071142495_9a9fb9e7.png) */}
                {/* ======================================================== */}
                {step === 1 && (
                    <div className="flex flex-col flex-1">
                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="text-[26px] font-bold text-gray-950 tracking-tight leading-none mb-2">
                                {t('bar.payment.yourOrder', 'Your Order')}
                            </h2>
                            <p className="text-[15px] font-semibold text-[#A2236E]">
                                {t('bar.payment.checkOrderSummary', 'Check your Order Summary')}
                            </p>
                        </div>

                        {/* Order Items List */}
                        <div className="space-y-3 mb-6">
                            {cartItems.length === 0 ? (
                                <p className="text-gray-400 text-sm py-8 text-center">
                                    {t('bar.noItemsYet', 'No items in order')}
                                </p>
                            ) : (
                                cartItems.map((item, idx) => {
                                    const qty = item.quantity || 1;
                                    const lineTotal = (Number(item.price) || 0) * qty;

                                    return (
                                        <div key={item.id || idx} className="border-b border-[#F5B8CB]/70 pb-3">
                                            <div className="flex items-center justify-between gap-3">
                                                {/* Item Name */}
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <h4 className="text-[14.5px] font-medium text-gray-900 truncate">
                                                        {item.title}
                                                    </h4>
                                                    {item.size && (
                                                        <span className="text-[11px] text-gray-500">
                                                            {item.size}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Stepper Buttons: [-] [qty] [+] */}
                                                <div className="flex items-center shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (qty > 1) {
                                                                onUpdateQuantity?.(item.id, qty - 1);
                                                            } else {
                                                                onRemoveItem?.(item.id);
                                                            }
                                                        }}
                                                        className="w-7 h-7 rounded-[6px] bg-gradient-to-r from-[#8B206F] to-[#D32F2F] text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-xs"
                                                    >
                                                        <Minus className="w-3.5 h-3.5 stroke-[3]" />
                                                    </button>
                                                    <span className="font-bold text-[16px] text-gray-950 px-3 min-w-[28px] text-center select-none">
                                                        {qty}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => onUpdateQuantity?.(item.id, qty + 1)}
                                                        className="w-7 h-7 rounded-[6px] bg-gradient-to-r from-[#8B206F] to-[#D32F2F] text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-xs"
                                                    >
                                                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                                    </button>
                                                </div>

                                                {/* Line Price */}
                                                <div className="min-w-[85px] text-right font-medium text-[13.5px] text-gray-600">
                                                    {formatCurrency(lineTotal, currency)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Order Totals Breakdown */}
                        <div className="space-y-3 mb-8">
                            <div className="flex justify-between items-center border-b border-[#F5B8CB]/70 pb-3 text-[14px]">
                                <span className="font-medium text-gray-900">
                                    {t('bar.payment.itemsNetTotal', 'Items Net Total')}
                                </span>
                                <span className="font-semibold text-gray-900">
                                    {formatCurrency(itemsNetTotal, currency)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center border-b border-[#F5B8CB]/70 pb-3 text-[14px]">
                                <span className="font-medium text-gray-900">
                                    {t('bar.payment.taxes', 'Taxes')}
                                </span>
                                <span className="font-semibold text-gray-900">
                                    {formatCurrency(taxes, currency)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center border-b border-[#F5B8CB]/70 pb-3 text-[15px]">
                                <span className="font-bold text-gray-950">
                                    {t('bar.payment.total', 'Total')}
                                </span>
                                <span className="font-bold text-gray-950">
                                    {formatCurrency(grandTotal, currency)}
                                </span>
                            </div>
                        </div>

                        {/* CTA: Choose Payment Option */}
                        <button
                            type="button"
                            disabled={cartItems.length === 0}
                            onClick={() => setStep(2)}
                            className="w-full py-4 rounded-[12px] font-bold text-white text-[16px] bg-gradient-to-r from-[#8B206F] to-[#D32F2F] hover:opacity-95 active:scale-[0.99] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed select-none"
                        >
                            {t('bar.payment.choosePaymentOption', 'Choose Payment Option')}
                        </button>
                    </div>
                )}

                {/* ======================================================== */}
                {/* STEP 2: PAYMENT OPTIONS (media_1792071180358_667db6ff.png) */}
                {/* ======================================================== */}
                {step === 2 && (
                    <div className="flex flex-col flex-1 animate-fadeIn">
                        {/* Header with Back Arrow */}
                        <div className="flex items-center gap-3 mb-6 pr-8">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="p-1 rounded-lg text-gray-700 hover:text-black hover:bg-gray-100 transition-colors"
                                title="Back to Order"
                            >
                                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                            </button>
                            <h2 className="text-[26px] font-bold text-gray-950 tracking-tight leading-none">
                                {t('bar.payment.paymentOptions', 'Payment Options')}
                            </h2>
                        </div>

                        {/* Payment Methods Cards */}
                        <div className="space-y-2.5 flex-1">
                            {/* Option 1: Pay with Cash */}
                            <div
                                onClick={() => setSelectedMethod('cash')}
                                className={`w-full border rounded-[10px] px-4 py-3 flex items-center justify-between cursor-pointer transition-all ${
                                    selectedMethod === 'cash'
                                        ? 'border-[#8B206F] ring-1 ring-[#8B206F] bg-pink-50/20'
                                        : 'border-[#2C2C2C] hover:border-gray-800 hover:bg-gray-50/50'
                                }`}
                            >
                                <span className="text-[14.5px] font-medium text-gray-900">
                                    {t('bar.payment.payWithCash', 'Pay with Cash')}
                                </span>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    selectedMethod === 'cash' ? 'border-[#8B206F]' : 'border-[#2C2C2C]'
                                }`}>
                                    {selectedMethod === 'cash' && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#8B206F]" />
                                    )}
                                </div>
                            </div>

                            {/* Option 2: Gift Cards 🎁 */}
                            <div
                                onClick={() => setSelectedMethod('gift_card')}
                                className={`w-full border rounded-[10px] px-4 py-3 flex items-center justify-between cursor-pointer transition-all ${
                                    selectedMethod === 'gift_card'
                                        ? 'border-[#8B206F] ring-1 ring-[#8B206F] bg-pink-50/20'
                                        : 'border-[#2C2C2C] hover:border-gray-800 hover:bg-gray-50/50'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-[14.5px] font-medium text-gray-900">
                                        {t('bar.payment.giftCards', 'Gift Cards')}
                                    </span>
                                    <span className="text-[15px]">🎁</span>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    selectedMethod === 'gift_card' ? 'border-[#8B206F]' : 'border-[#2C2C2C]'
                                }`}>
                                    {selectedMethod === 'gift_card' && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#8B206F]" />
                                    )}
                                </div>
                            </div>

                            {/* Section: Card Payments */}
                            <h4 className="text-[13px] font-medium text-gray-500 pt-3 pb-1">
                                {t('bar.payment.cardPayments', 'Card Payments')}
                            </h4>

                            {/* Stripe Checkout */}
                            <div
                                onClick={() => setSelectedMethod('stripe')}
                                className={`w-full border rounded-[10px] px-4 py-3 flex items-center justify-between cursor-pointer transition-all ${
                                    selectedMethod === 'stripe'
                                        ? 'border-[#8B206F] ring-1 ring-[#8B206F] bg-pink-50/20'
                                        : 'border-[#2C2C2C] hover:border-gray-800 hover:bg-gray-50/50'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-[14.5px] font-medium text-gray-900">
                                        {t('bar.payment.stripeCheckout', 'Pay with Stripe')}
                                    </span>
                                    <CreditCard className="w-4 h-4" aria-hidden="true" />
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    selectedMethod === 'stripe' ? 'border-[#8B206F]' : 'border-[#2C2C2C]'
                                }`}>
                                    {selectedMethod === 'stripe' && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#8B206F]" />
                                    )}
                                </div>
                            </div>

                            {/* Option 3: Debit Card Payment 💳 */}
                            <div
                                onClick={() => setSelectedMethod('debit_card')}
                                className={`w-full border rounded-[10px] px-4 py-3 flex items-center justify-between cursor-pointer transition-all ${
                                    selectedMethod === 'debit_card'
                                        ? 'border-[#8B206F] ring-1 ring-[#8B206F] bg-pink-50/20'
                                        : 'border-[#2C2C2C] hover:border-gray-800 hover:bg-gray-50/50'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-[14.5px] font-medium text-gray-900">
                                        {t('bar.payment.debitCardPayment', 'Debit Card Payment')}
                                    </span>
                                    <span className="text-[15px]">💳</span>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    selectedMethod === 'debit_card' ? 'border-[#8B206F]' : 'border-[#2C2C2C]'
                                }`}>
                                    {selectedMethod === 'debit_card' && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#8B206F]" />
                                    )}
                                </div>
                            </div>

                            {/* Option 4: Credit Card Payment 💳 */}
                            <div
                                onClick={() => setSelectedMethod('credit_card')}
                                className={`w-full border rounded-[10px] px-4 py-3 flex items-center justify-between cursor-pointer transition-all ${
                                    selectedMethod === 'credit_card'
                                        ? 'border-[#8B206F] ring-1 ring-[#8B206F] bg-pink-50/20'
                                        : 'border-[#2C2C2C] hover:border-gray-800 hover:bg-gray-50/50'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-[14.5px] font-medium text-gray-900">
                                        {t('bar.payment.creditCardPayment', 'Credit Card Payment')}
                                    </span>
                                    <span className="text-[15px]">💳</span>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    selectedMethod === 'credit_card' ? 'border-[#8B206F]' : 'border-[#2C2C2C]'
                                }`}>
                                    {selectedMethod === 'credit_card' && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#8B206F]" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* CTA: Pay Total Amount Button */}
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleCompletePayment}
                            className="w-full mt-8 py-4 rounded-[12px] font-bold text-white text-[16px] bg-gradient-to-r from-[#8B206F] to-[#D32F2F] hover:opacity-95 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 select-none disabled:opacity-75 disabled:cursor-wait"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                    <span>{t('bar.payment.processing', 'Processing...')}</span>
                                </>
                            ) : (
                                <span>
                                    {t('bar.payment.payAmount', 'Pay {{amount}}', {
                                        amount: formatCurrency(grandTotal, currency)
                                    })}
                                </span>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BarOrderPaymentModal;
