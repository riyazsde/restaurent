import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQrOrders } from '../../../hooks/queries/useQrOrders';
import { formatCurrency } from '../../../utils/currencyUtils';

const QRMenuOrdersModal = ({ isOpen, onClose, currency = 'XOF', onLoadOrder }) => {
    const { t } = useTranslation('pos');
    const { qrOrders, isLoading, acceptOrder } = useQrOrders();
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    if (!isOpen) return null;

    // Robust mapping for both standard pos_order backend items and QR format
    const displayOrders = qrOrders.map(order => {
        const qrId = order.qr_order_id ?? order.id ?? order.QR_Order_id ?? order.POS_Order_id ?? order.Order_id;
        const customerName = order.Customer?.Name || order.customerName || 'Walk-in guest';
        const tableInfo = order.tableInfo || (order.Table?.Table_No ? `Table ${order.Table.Table_No.toString().padStart(2, '0')}` : (order.Table?.table_name || order.Dining_Option || 'Pickup'));
        const items = order.items || [];
        const isAccepted = order.isAccepted ?? (
            order.Order_Status === 'Accepted' ||
            order.Order_Status === 'In_Kitchen' ||
            order.Order_Status === 'Preparing' ||
            order.Order_Status === 'Completed' ||
            order.status === 'Accepted'
        );

        return {
            id: qrId || 'N/A',
            orderId: qrId,
            qrOrderId: qrId,
            displayId: order.displayId || `QR-${order.POS_Order_id || order.id || qrId || Math.floor(Math.random() * 10000)}`,
            timeAgo: order.timeAgo || 'Just now',
            customerName,
            tableInfo,
            items,
            total: order.Total ?? order.total ?? order.Tax ?? 0,
            isAccepted,
            originalOrder: order
        };
    });

    const handleAccept = (order) => {
        const targetId = order.qrOrderId || order.originalOrder?.qr_order_id || order.originalOrder?.id || order.orderId || order.originalOrder?.POS_Order_id;
        if (!targetId) return;

        setUpdatingOrderId(targetId);
        acceptOrder.mutate(targetId, {
            onSuccess: () => {
                setUpdatingOrderId(null);
                if (onLoadOrder) {
                    onLoadOrder(order);
                }
            },
            onError: () => {
                setUpdatingOrderId(null);
                if (onLoadOrder) {
                    onLoadOrder(order);
                }
            },
            onSettled: () => {
                setUpdatingOrderId(null);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-[24px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="px-8 pt-8 pb-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-[22px] font-bold text-gray-900 mb-1">{t('qrModalTitle', 'QR Menu Orders')}</h2>
                        <p className="text-[14px] text-gray-500 font-medium">{t('qrModalSubtitle', 'Review orders placed from the digital menu.')}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2.5 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Orders List */}
                <div className="px-8 pb-8 flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                    ) : displayOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 font-medium">{t('noQrOrders', 'No QR orders at the moment.')}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {displayOrders.map((order, idx) => {
                                const targetId = order.orderId || order.originalOrder?.POS_Order_id || order.originalOrder?.Order_id || order.originalOrder?.id;
                                const isUpdatingThis = updatingOrderId === targetId;

                                return (
                                    <div key={idx} className="border border-gray-200 rounded-[18px] p-5 bg-white">
                                        {/* Top Row: ID + Badge */}
                                        <div className="flex justify-between items-center mb-1.5">
                                            <div className="flex items-center gap-2.5">
                                                <span className="font-bold text-gray-900 text-[15.5px]">{order.displayId}</span>
                                                <span className="text-gray-400 text-[13px] font-normal">{order.timeAgo}</span>
                                            </div>
                                            <div>
                                                {order.isAccepted ? (
                                                    <span className="px-3 py-1 bg-[#FDE2EC] text-[#BE185D] rounded-full text-[12px] font-semibold">
                                                        {t('accepted', 'Accepted')}
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-[#FDE2EC] text-[#BE185D] rounded-full text-[12px] font-semibold">
                                                        {t('newOrder', 'New order')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Customer Row */}
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-gray-500 text-[13.5px]">{order.customerName}</span>
                                            <span className="text-gray-800 font-medium text-[13.5px]">{order.tableInfo}</span>
                                        </div>

                                        {/* Items List */}
                                        <div className="border-t border-b border-gray-100 py-3.5 my-3.5 space-y-1.5">
                                            {order.items.map((item, itemIdx) => {
                                                const qty = item.item_Quentry || item.quantity || 1;
                                                const name = item.item_name || item['item-name'] || item.Item?.item_name || `Item #${item.item_id || itemIdx + 1}`;
                                                return (
                                                    <div key={itemIdx} className="flex gap-2 text-[14px] text-gray-800 font-medium">
                                                        <span>{qty} ×</span>
                                                        <span>{name}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Footer Row */}
                                        <div className="flex justify-between items-center pt-0.5">
                                            <span className="font-bold text-gray-900 text-[16px]">
                                                {formatCurrency(order.total, currency)}
                                            </span>
                                            <button 
                                                onClick={() => handleAccept(order)}
                                                disabled={order.isAccepted || isUpdatingThis || acceptOrder.isPending}
                                                className={`px-5 py-2.5 rounded-[10px] text-[13.5px] font-medium transition-all flex items-center justify-center gap-2 min-w-[155px] ${
                                                    order.isAccepted 
                                                    ? 'bg-[#B8B1BD] text-white cursor-not-allowed' 
                                                    : isUpdatingThis
                                                        ? 'bg-purple-600/80 text-white cursor-wait opacity-90'
                                                        : 'bg-gradient-to-r from-[#8B206F] to-[#D32F2F] text-white hover:opacity-95 shadow-sm'
                                                }`}
                                            >
                                                {isUpdatingThis ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                                        </svg>
                                                        <span>{t('updating', 'Updating...')}</span>
                                                    </>
                                                ) : order.isAccepted ? (
                                                    t('alreadyAccepted', 'Already accepted')
                                                ) : (
                                                    t('acceptAndLoad', 'Accept & load order')
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QRMenuOrdersModal;
