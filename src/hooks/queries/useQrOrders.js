import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import posService from '../../services/posService';
import { toast } from 'react-toastify';

const LOCAL_STORAGE_ACCEPTED_KEY = 'pos_accepted_qr_order_ids';

// Default showcase QR orders matching user's design reference
export const DEFAULT_QR_ORDERS = [
    {
        id: 'qr-1048',
        displayId: 'QR-1048',
        timeAgo: '2 min ago',
        isAccepted: true,
        Order_Status: 'Accepted',
        Customer: { Name: 'Marie D.', Phone: '+225 01020304' },
        Table: { table_id: 8, table_name: 'Table 08', Table_No: 8 },
        Dining_Option: 'Dine in',
        items: [
            {
                item_id: 1,
                item_Quentry: 1,
                quantity: 1,
                item_name: 'Pizza',
                'item-name': 'Pizza',
                Price: 7000,
                'item-price': 7000,
                price: 7000,
                prices: 7000,
                Item: { item_id: 1, item_name: 'Pizza', prices: 7000 }
            },
            {
                item_id: 2,
                item_Quentry: 2,
                quantity: 2,
                item_name: 'Blueberry Smoothie',
                'item-name': 'Blueberry Smoothie',
                Price: 1000,
                'item-price': 1000,
                price: 1000,
                prices: 1000,
                Item: { item_id: 2, item_name: 'Blueberry Smoothie', prices: 1000 }
            }
        ],
        Total: 9000,
        SubTotal: 9000
    },
    {
        id: 'qr-1047',
        displayId: 'QR-1047',
        timeAgo: '8 min ago',
        isAccepted: false,
        Order_Status: 'New',
        Customer: { Name: 'Samuel K.', Phone: '+225 05060708' },
        Table: { table_id: 3, table_name: 'Table 03', Table_No: 3 },
        Dining_Option: 'Dine in',
        items: [
            {
                item_id: 3,
                item_Quentry: 2,
                quantity: 2,
                item_name: 'Ramen',
                'item-name': 'Ramen',
                Price: 2000,
                'item-price': 2000,
                price: 2000,
                prices: 2000,
                Item: { item_id: 3, item_name: 'Ramen', prices: 2000 }
            },
            {
                item_id: 4,
                item_Quentry: 1,
                quantity: 1,
                item_name: 'Chicken soup',
                'item-name': 'Chicken soup',
                Price: 1000,
                'item-price': 1000,
                price: 1000,
                prices: 1000,
                Item: { item_id: 4, item_name: 'Chicken soup', prices: 1000 }
            }
        ],
        Total: 5000,
        SubTotal: 5000
    }
];

export const useQrOrders = () => {
    const queryClient = useQueryClient();
    const QUERY_KEY = ['pos_orders', 'qr'];

    // Track accepted order IDs locally so showcase & session state remains persisted
    const [acceptedIds, setAcceptedIds] = useState(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_ACCEPTED_KEY);
            return saved ? JSON.parse(saved) : ['qr-1048'];
        } catch (e) {
            return ['qr-1048'];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_ACCEPTED_KEY, JSON.stringify(acceptedIds));
        } catch (e) {
            console.error('Failed to sync accepted QR orders to localStorage:', e);
        }
    }, [acceptedIds]);

    // Fetch orders via GET /api/v1/restaurant/pos_order/getall
    const { data: rawOrders = [], isLoading, isError, refetch } = useQuery({
        queryKey: QUERY_KEY,
        queryFn: async () => {
            try {
                const response = await posService.getAllOrders();
                return Array.isArray(response) ? response : (response?.data || []);
            } catch (err) {
                console.warn('Could not fetch orders from posService.getAllOrders, fallback to local:', err);
                return [];
            }
        },
        refetchInterval: 30000,
    });

    // Extract real backend orders that were created via QR Menu
    const backendQrOrders = rawOrders.filter(order => {
        const isQr = (order.QR_Order_id !== null && order.QR_Order_id !== undefined) ||
                     order.Dining_Option === 'QR' ||
                     order.Dining_Option === 'Digital Menu' ||
                     String(order.POS_Order_id).startsWith('QR');
        return isQr;
    });

    // Format backend orders
    const mappedBackendOrders = backendQrOrders.map(order => {
        const orderId = order.POS_Order_id || order.id || order.Order_id;
        const stringId = String(orderId);
        const isAccepted = acceptedIds.includes(stringId) ||
            order.Order_Status === 'Preparing' ||
            order.Order_Status === 'In_Kitchen' ||
            order.Order_Status === 'Completed' ||
            order.Order_Status === 'Accepted' ||
            order.Order_Status === 'Ready';

        return {
            ...order,
            id: orderId,
            displayId: order.QR_Order_id ? `QR-${order.QR_Order_id}` : `QR-${orderId}`,
            timeAgo: 'Just now',
            isAccepted,
            originalOrder: order
        };
    });

    // Format showcase default orders with current accepted status
    const mappedShowcaseOrders = DEFAULT_QR_ORDERS.map(demo => {
        const isAccepted = demo.id === 'qr-1048' || acceptedIds.includes(demo.id) || demo.isAccepted;
        return {
            ...demo,
            isAccepted,
            originalOrder: demo
        };
    });

    // Combine backend orders and showcase orders (avoiding duplicate display IDs)
    const qrOrders = [
        ...mappedBackendOrders,
        ...mappedShowcaseOrders.filter(demo => !mappedBackendOrders.some(b => b.displayId === demo.displayId))
    ];

    // Accept Order Mutation: Calls PATCH /api/v1/restaurant/pos_order/update-status per postman.json
    const acceptOrder = useMutation({
        mutationFn: async (orderOrId) => {
            const targetId = typeof orderOrId === 'object' && orderOrId !== null
                ? (orderOrId.qr_order_id ?? orderOrId.id ?? orderOrId.QR_Order_id ?? orderOrId.POS_Order_id ?? orderOrId.Order_id)
                : orderOrId;

            if (!targetId) {
                console.error('Target order ID missing in acceptOrder:', orderOrId);
                throw new Error('Order ID is required');
            }

            const stringId = String(targetId);

            // If it is a real numeric database ID from backend, update status via API
            if (/^\d+$/.test(stringId)) {
                const numericId = Number(stringId);
                await posService.updateOrderStatus({
                    id: numericId,
                    POS_Order_id: numericId,
                    Order_Status: 'Preparing'
                });
            }

            // Persist accepted state locally
            setAcceptedIds(prev => Array.from(new Set([...prev, stringId])));

            return { success: true, id: targetId, status: 'Preparing' };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['pos_orders'] });
            queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
            queryClient.invalidateQueries({ queryKey: ['kitchen_orders'] });
            toast.success('Order accepted successfully!');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to accept order.');
        }
    });

    // Reject Order Mutation: Calls PATCH /api/v1/restaurant/pos_order/update-status
    const rejectOrder = useMutation({
        mutationFn: async (orderOrId) => {
            const targetId = typeof orderOrId === 'object' && orderOrId !== null
                ? (orderOrId.qr_order_id ?? orderOrId.id ?? orderOrId.QR_Order_id ?? orderOrId.POS_Order_id ?? orderOrId.Order_id)
                : orderOrId;

            if (!targetId) {
                throw new Error('Order ID is required');
            }

            const stringId = String(targetId);
            if (/^\d+$/.test(stringId)) {
                await posService.updateOrderStatus({
                    id: Number(stringId),
                    POS_Order_id: Number(stringId),
                    Order_Status: 'Cancelled'
                });
            }

            return { success: true, id: targetId, status: 'Cancelled' };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['pos_orders'] });
            toast.success('Order rejected successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to reject order.');
        }
    });

    // Create Order Mutation: Calls POST /api/v1/restaurant/pos_order/create per postman.json
    const createQrOrder = useMutation({
        mutationFn: async (orderPayload) => {
            return await posService.createPosOrder(orderPayload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['pos_orders'] });
            toast.success('QR Menu order submitted successfully!');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to create QR order.');
        }
    });

    return {
        qrOrders,
        isLoading,
        isError,
        refetch,
        acceptOrder,
        rejectOrder,
        createQrOrder
    };
};
