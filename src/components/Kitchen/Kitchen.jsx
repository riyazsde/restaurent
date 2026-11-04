import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { toast } from 'react-toastify';
import refresh from '../assets/refresh.svg';
import { useSearchStore } from '../../store/searchStore';
import { 
    useKitchenOrders, 
    useUpdateOrderStatus,
    useUpdateItemStatus
} from '../../hooks/queries/useKitchen';
import { useTables } from '../../hooks/queries/useTables';
import { canMarkOrderReady, getOrderStatusKey } from '../../utils/orderStatus';

// Reference sample orders matching the Figma design when no live backend orders are active
const SAMPLE_KITCHEN_ORDERS = [
    {
        _id: 'sample-1',
        POS_Order_id: 12,
        Dining_Option: 'Bar',
        bar_tab_name: 'Ahmed',
        Order_Status: 'Ready',
        items: [
            { item_id: 1, item_Quentry: 2, item_status: 'Ready', Item: { item_name: 'Whiskey on the rocks', 'item-name': 'Whiskey on the rocks' } },
            { item_id: 2, item_Quentry: 1, item_status: 'Ready', item_note: 'extra lime', Item: { item_name: 'Mojito', 'item-name': 'Mojito' } }
        ]
    },
    {
        _id: 'sample-2',
        POS_Order_id: 12,
        Dining_Option: 'Dine in',
        Table_id: 12,
        Table: { 'Table-name': '12' },
        Order_Status: 'Ready',
        items: [
            { item_id: 3, item_Quentry: 3, item_status: 'Ready', Item: { item_name: 'Margherita Pizza', 'item-name': 'Margherita Pizza' } },
            { item_id: 4, item_Quentry: 1, item_status: 'Ready', Item: { item_name: 'Garlic Bread', 'item-name': 'Garlic Bread' } }
        ]
    },
    {
        _id: 'sample-3',
        POS_Order_id: 12,
        Dining_Option: 'Dine in',
        Table_id: 5,
        Table: { 'Table-name': '5' },
        Order_Status: 'Ready',
        items: [
            { item_id: 5, item_Quentry: 2, item_status: 'Ready', Item: { item_name: 'Beef Tenderloin', 'item-name': 'Beef Tenderloin' } },
            { item_id: 6, item_Quentry: 1, item_status: 'Ready', Item: { item_name: 'Truffle Risotto', 'item-name': 'Truffle Risotto' } }
        ]
    },
    {
        _id: 'sample-4',
        POS_Order_id: 12,
        Dining_Option: 'Dine in',
        Table_id: 7,
        Table: { 'Table-name': '7' },
        Order_Status: 'Ready',
        items: [
            { item_id: 7, item_Quentry: 1, item_status: 'Ready', item_note: 'no onions', Item: { item_name: 'Wagyu Burger', 'item-name': 'Wagyu Burger' } },
            { item_id: 8, item_Quentry: 2, item_status: 'Ready', Item: { item_name: 'Truffle Fries', 'item-name': 'Truffle Fries' } },
            { item_id: 9, item_Quentry: 2, item_status: 'Ready', Item: { item_name: 'Mango Lemonade', 'item-name': 'Mango Lemonade' } }
        ]
    },
    {
        _id: 'sample-5',
        POS_Order_id: 12,
        Dining_Option: 'Dine in',
        Table_id: 3,
        Table: { 'Table-name': '3' },
        Order_Status: 'Ready',
        items: [
            { item_id: 10, item_Quentry: 1, item_status: 'Ready', Item: { item_name: 'Caesar Salad', 'item-name': 'Caesar Salad' } },
            { item_id: 11, item_Quentry: 2, item_status: 'Ready', Item: { item_name: 'Grilled Salmon', 'item-name': 'Grilled Salmon' } }
        ]
    },
    {
        _id: 'sample-6',
        POS_Order_id: 12,
        Dining_Option: 'Takeaway',
        takeaway_code: 'T24',
        Order_Status: 'Ready',
        items: [
            { item_id: 12, item_Quentry: 1, item_status: 'Ready', Item: { item_name: 'Shawarma Wrap', 'item-name': 'Shawarma Wrap' } },
            { item_id: 13, item_Quentry: 2, item_status: 'Ready', Item: { item_name: 'Cola', 'item-name': 'Cola' } }
        ]
    }
];

export default function Kitchen() {
    const { t } = useTranslation('kitchen');
    const [showLoadedMessage, setShowLoadedMessage] = useState(false);
    const [updatingOrders, setUpdatingOrders] = useState({});
    const [readyOrderIds, setReadyOrderIds] = useState(() => new Set());
    const { searchQuery, setSearchPlaceholder } = useSearchStore();

    // Consistent order key helper
    const getOrderKey = useCallback((order, fallbackIdx = 0) => {
        return order?._id ?? order?.POS_Order_id ?? order?.id ?? order?.Order_id ?? fallbackIdx;
    }, []);

    // Get order status across possible API casing/properties
    const getOrderStatus = useCallback((order) => {
        return order?.Order_Status || order?.order_status || order?.status || '';
    }, []);

    // Cancelled and finished orders, as well as locally marked-ready orders, cannot be marked ready again.
    const isOrderReadyOrFinished = useCallback((order, fallbackIdx = 0) => {
        const key = getOrderKey(order, fallbackIdx);
        const rawStatus = getOrderStatus(order);
        const statusKey = getOrderStatusKey(rawStatus);
        if (['cancelled', 'ready', 'served', 'completed'].includes(statusKey)) return true;
        return readyOrderIds.has(key);
    }, [getOrderKey, getOrderStatus, readyOrderIds]);

    // Hook search placeholder
    useEffect(() => {
        setSearchPlaceholder(t('searchPlaceholder', 'Search kitchen orders...'));
        return () => setSearchPlaceholder('');
    }, [setSearchPlaceholder, t]);

    // TanStack Query Hooks for Kitchen Orders (GET /api/v1/restaurant/pos_order/my-orders)
    const { 
        data: kitchenOrders = [], 
        isLoading: isKitchenLoading, 
        isFetching: isKitchenFetching,
        refetch: refetchKitchen 
    } = useKitchenOrders();
    const updateOrderStatusMutation = useUpdateOrderStatus();
    const updateItemStatusMutation = useUpdateItemStatus();

    // Fetch tables to resolve Table_id when order.Table is null in my-orders payload
    const { getTables } = useTables();
    const tableNameMap = useMemo(() => {
        const list = Array.isArray(getTables?.data) ? getTables.data : [];
        const map = {};
        list.forEach((tbl) => {
            const id = tbl.Table_id ?? tbl.table_id ?? tbl.id;
            const name = tbl['Table-name'] || tbl.Table_name || tbl.table_name || tbl.name || tbl['Table-code'];
            if (id != null && name) {
                map[id] = String(name);
            }
        });
        return map;
    }, [getTables?.data]);

    const handleRefresh = async () => {
        try {
            await refetchKitchen();
            setShowLoadedMessage(true);
            setTimeout(() => {
                setShowLoadedMessage(false);
            }, 2000);
        } catch (err) {
            console.warn('Error refetching kitchen orders:', err);
        }
    };

    // Format human-readable card title from my-orders object matching Figma
    const getOrderTitle = useCallback((order) => {
        const diningOption = String(order.Dining_Option || '').trim();
        const normalizedDining = diningOption.toLowerCase().replace(/\s+/g, '');

        // 1. Bar Tab
        if (normalizedDining === 'bar' || order.order_type === 'Bar' || order.bar_tab_name) {
            const name = order.bar_tab_name || order.Customer?.Name || order.Customer_name || `#${order.POS_Order_id ?? ''}`;
            return `Bar Tab - ${name}`;
        }

        // 2. Table (handles order.Table object OR order.Table_id when order.Table is null)
        const rawTableId = order.Table_id ?? order.table_id ?? order.Table?.Table_id;
        const rawTableName =
            order.Table?.['Table-name'] ||
            order.Table?.Table_name ||
            order.Table?.name ||
            (rawTableId != null ? tableNameMap[rawTableId] : null) ||
            order.table_number ||
            order.Table_number ||
            (rawTableId != null ? String(rawTableId) : null);

        if (rawTableName) {
            const cleanName = String(rawTableName).trim();
            if (/^table\b/i.test(cleanName)) {
                return cleanName;
            }
            return `${t('card.table', 'Table')} ${cleanName}`;
        }

        // 3. Takeaway
        if (normalizedDining === 'takeaway') {
            const code = order.takeaway_code || (order.POS_Order_id ? `T${order.POS_Order_id}` : 'T24');
            return `${t('card.takeaway', 'Takeaway')} #${code}`;
        }

        // 4. Delivery
        if (normalizedDining === 'delivery') {
            const customerName = order.Customer?.Name || order.Customer_name;
            return customerName
                ? `Delivery - ${customerName}`
                : `Delivery #${order.POS_Order_id ?? ''}`;
        }

        // 5. Fallback for Dine-in without Table_id
        if (order.Customer?.Name || order.Customer_name) {
            return `${diningOption || 'Dine in'} - ${order.Customer?.Name || order.Customer_name}`;
        }

        return order.POS_Order_id
            ? `${diningOption || 'Dine in'} #${order.POS_Order_id}`
            : (diningOption || 'Dine in');
    }, [t, tableNameMap]);

    // Extract item list with quantity, size, variants, addons, and notes from my-orders item schema
    const getItems = useCallback((order) => {
        if (!order?.items || !Array.isArray(order.items)) return [];
        return order.items.map((item) => {
            const itemId = item.item_id ?? item.Item?.Items_id ?? item.Item?.item_id;
            const qty = item.item_Quentry ?? item.quantity ?? 1;
            const name =
                item.Item?.item_name ||
                item.Item?.['item-name'] ||
                item.item_name ||
                item['item-name'] ||
                item.Title ||
                `Item #${itemId ?? ''}`;

            // Collect all modifiers from my-orders object: item_size, Variant.Variants, Addon.Addons, item_note
            const rawModifiers = [
                item.Variant?.Variants,
                item.Addon?.Addons,
                item.item_size,
                item.item_note,
                item.notes,
                item.special_instructions
            ].filter(Boolean);

            // Deduplicate modifiers case-insensitively (e.g. when item_size === Variant.Variants)
            const uniqueModifiers = [];
            const seen = new Set();
            rawModifiers.forEach((mod) => {
                const str = String(mod).trim();
                const key = str.toLowerCase();
                if (str && !seen.has(key)) {
                    seen.add(key);
                    uniqueModifiers.push(str);
                }
            });

            return {
                itemId,
                qty,
                name,
                notes: uniqueModifiers.join(', '),
                status: item.item_status || item.item_status_label || order.Order_Status || order.order_status || 'Preparing',
                size: item.item_size || null
            };
        });
    }, []);

    const formatStatusLabel = useCallback((status) => {
        return t(`status.${getOrderStatusKey(status || 'Preparing')}`);
    }, [t]);

    // Active orders (uses backend data from /restaurant/pos_order/my-orders when available)
    const activeOrders = useMemo(() => {
        if (kitchenOrders && Array.isArray(kitchenOrders) && kitchenOrders.length > 0) {
            return kitchenOrders;
        }
        return SAMPLE_KITCHEN_ORDERS;
    }, [kitchenOrders]);

    // Contextual Search Filtering across title, token (POS_Order_id), customer, table, and items
    const displayedOrders = useMemo(() => {
        if (!searchQuery || !searchQuery.trim()) return activeOrders;
        const q = searchQuery.toLowerCase().trim();
        return activeOrders.filter((order) => {
            const title = getOrderTitle(order).toLowerCase();
            const token = String(order.POS_Order_id ?? order._id ?? '').toLowerCase();
            const dining = String(order.Dining_Option || '').toLowerCase();
            const customer = String(order.Customer?.Name || order.Customer?.phone || '').toLowerCase();
            const status = String(order.Order_Status || '').replace(/_/g, ' ').toLowerCase();
            const items = getItems(order);
            const itemMatch = items.some(
                (itm) =>
                    itm.name.toLowerCase().includes(q) ||
                    itm.notes.toLowerCase().includes(q)
            );
            return (
                title.includes(q) ||
                token.includes(q) ||
                dining.includes(q) ||
                customer.includes(q) ||
                status.includes(q) ||
                itemMatch
            );
        });
    }, [activeOrders, searchQuery, getOrderTitle, getItems]);

    // Handle Ready button action (PATCH /api/v1/restaurant/pos_order/update-status)
    const handleOrderStatusToggle = async (order, idx = 0) => {
        const uniqueKey = getOrderKey(order, idx);
        const rawStatus = getOrderStatus(order);

        // A cancelled or finished order cannot transition to Ready from the kitchen.
        if (readyOrderIds.has(uniqueKey) || !canMarkOrderReady(rawStatus)) {
            return;
        }

        // Instantly mark as ready locally to block any further clicks immediately
        setReadyOrderIds((prev) => new Set(prev).add(uniqueKey));

        const posOrderId = order.POS_Order_id ?? order.id ?? order.Order_id;
        const newStatus = 'Ready';

        const isSample = SAMPLE_KITCHEN_ORDERS.some((o) => o === order);
        if (isSample) {
            toast.success(t('messages.markedAs', { status: t('card.ready', 'Ready'), defaultValue: 'Order marked as Ready' }));
            return;
        }

        try {
            setUpdatingOrders((prev) => ({ ...prev, [uniqueKey]: true }));

            // Update order status via PATCH /restaurant/pos_order/update-status
            await updateOrderStatusMutation.mutateAsync({
                id: Number(posOrderId),
                Order_Status: newStatus
            });

            // Also sync individual items status if marking order Ready
            if (newStatus === 'Ready' && Array.isArray(order.items)) {
                await Promise.allSettled(
                    order.items
                        .filter((itm) => itm.item_id && itm.item_status !== 'Ready' && itm.item_status !== 'Completed')
                        .map((itm) =>
                            updateItemStatusMutation.mutateAsync({
                                id: Number(posOrderId),
                                item_id: Number(itm.item_id),
                                item_status: 'Ready'
                            })
                        )
                );
            }

            // Resync from server to keep TanStack query cache pristine
            await refetchKitchen();

            toast.success(
                t('messages.markedAs', {
                    status: newStatus,
                    defaultValue: `Order #${posOrderId} marked as ${newStatus}`
                })
            );
        } catch (error) {
            // Revert ready state on failure
            setReadyOrderIds((prev) => {
                const next = new Set(prev);
                next.delete(uniqueKey);
                return next;
            });
            toast.error(error?.message || t('messages.updateError', 'Failed to update order status'));
        } finally {
            setUpdatingOrders((prev) => {
                const next = { ...prev };
                delete next[uniqueKey];
                return next;
            });
        }
    };

    return (
        <div className="p-6 md:p-8 font-poppins min-h-screen">
            {/* Header: Title & Refresh Button */}
            <div className="flex items-center gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-poppins leading-tight">
                    {t('title', 'Kitchen')}
                </h1>
                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={isKitchenLoading || isKitchenFetching}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-xl border border-pink-400 bg-white hover:bg-pink-50 text-gray-800 font-medium text-sm transition-all shadow-xs disabled:opacity-50 cursor-pointer font-poppins"
                >
                    <img 
                        src={refresh} 
                        className={`w-4 h-4 ${isKitchenLoading || isKitchenFetching ? 'animate-spin' : ''}`} 
                        alt="Refresh" 
                    />
                    <span>{t('refresh', 'Refresh')}</span>
                </button>
                {showLoadedMessage && (
                    <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg animate-in fade-in">
                        <IoCheckmarkCircle className="text-green-600 text-sm" />
                        <span>{t('ordersLoaded', 'Orders Loaded')}</span>
                    </div>
                )}
            </div>

            {/* Kitchen Orders 3-Column Grid */}
            {isKitchenLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <div 
                            key={idx} 
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 border-t-[5px] border-t-green-200 animate-pulse flex flex-col justify-between h-[210px]"
                        >
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <div className="h-5 bg-gray-200 rounded w-28"></div>
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <div className="h-3.5 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3.5 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                            <div className="h-9 bg-gray-200 rounded-full w-full"></div>
                        </div>
                    ))}
                </div>
            ) : displayedOrders.length === 0 ? (
                <div className="text-center py-16 text-gray-500 font-poppins">
                    <p className="text-lg font-medium">{t('noOrdersMatch', 'No orders match your search query')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedOrders.map((order, idx) => {
                        const uniqueKey = getOrderKey(order, idx);
                        const isUpdating = Boolean(updatingOrders[uniqueKey]);
                        const orderTitle = getOrderTitle(order);
                        const items = getItems(order);
                        const tokenNumber = order.POS_Order_id ?? order.id ?? '12';
                        const rawStatus = getOrderStatus(order);
                        const isReady = isOrderReadyOrFinished(order, idx);
                        const isCancelled = getOrderStatusKey(rawStatus) === 'cancelled';
                        const effectiveStatus = isReady
                            ? (['cancelled', 'served', 'completed'].includes(getOrderStatusKey(rawStatus)) ? rawStatus : 'Ready')
                            : (rawStatus || 'Preparing');
                        const statusLabel = formatStatusLabel(effectiveStatus);
                        const isStatusReady = !isCancelled && (isReady || getOrderStatusKey(effectiveStatus) === 'ready');

                        return (
                            <div
                                key={uniqueKey}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden p-5 flex flex-col justify-between border-t-[5px] border-t-[#0A8728]"
                            >
                                <div>
                                    {/* Top Card Header: Order Title & Token / Ready Pill Badge */}
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <h3
                                            title={orderTitle}
                                            className="font-bold text-[18px] text-gray-900 truncate font-poppins"
                                        >
                                            {orderTitle}
                                        </h3>
                                        <div className="flex items-center gap-1.5 flex-shrink-0 text-xs font-poppins">
                                            <span className="font-semibold text-[#D81B60]">
                                                Token : {tokenNumber}
                                            </span>
                                            <span
                                                className={`font-bold px-2.5 py-0.5 rounded-full ${
                                                    isCancelled
                                                        ? 'text-red-700 bg-red-50 border border-red-200'
                                                        : isStatusReady
                                                        ? 'text-[#0A8728] bg-[#E8F5E9] border border-green-200/60'
                                                        : 'text-[#E65100] bg-[#FFF3E0] border border-[#FFE0B2]'
                                                }`}
                                            >
                                                {statusLabel}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="space-y-1 mb-6">
                                        {items.map((item, itemIdx) => (
                                            <p 
                                                key={item.itemId ? `${item.itemId}-${itemIdx}` : itemIdx} 
                                                className="text-[13px] text-gray-700 font-normal leading-relaxed font-poppins"
                                            >
                                                <span>{item.qty}x {item.name}{item.notes ? ` - ${item.notes}` : ''}</span>
                                                <span className="ml-2 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                                    {formatStatusLabel(item.status)}
                                                </span>
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {/* Full-Width Action Button */}
                                <button
                                    type="button"
                                    onClick={() => handleOrderStatusToggle(order, idx)}
                                    disabled={isUpdating || isStatusReady || isCancelled}
                                    className={`w-full py-2.5 rounded-full font-semibold text-sm transition-all shadow-xs flex items-center justify-center font-poppins ${
                                        isCancelled
                                            ? 'bg-red-50 text-red-700 border border-red-200 cursor-not-allowed opacity-90'
                                            : isStatusReady
                                            ? 'bg-[#E8F5E9] text-[#0A8728] border border-[#0A8728]/30 cursor-not-allowed opacity-90'
                                            : 'bg-[#0A8728] hover:bg-[#087322] active:bg-[#06611c] text-white cursor-pointer disabled:opacity-70'
                                    }`}
                                >
                                    {isUpdating ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            <span>{t('status.updating', 'Updating...')}</span>
                                        </span>
                                    ) : isCancelled ? (
                                        <span>{statusLabel}</span>
                                    ) : isStatusReady ? (
                                        <span className="flex items-center gap-1.5">
                                            <IoCheckmarkCircle className="text-base text-[#0A8728]" />
                                            <span>{statusLabel}</span>
                                        </span>
                                    ) : (
                                        t('card.ready', 'Ready')
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
