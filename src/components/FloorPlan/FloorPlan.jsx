import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import {
    FaEdit,
    FaPlus,
    FaMinus,
    FaRegClock,
    FaReceipt,
    FaGift,
    FaCreditCard,
    FaApple,
    FaCodeBranch
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { IoCheckmarkCircle } from "react-icons/io5";
import { MdRoomService } from "react-icons/md";
import { toast } from "react-toastify";
import {
    useFloors,
    useFloorMap,
    useFloorWithTables,
    useOrderPdf
} from "../../hooks/queries/useFloorPlan";
import { usePaymentOptions, useCreatePayment, useRestaurant as useRestaurantDetails } from "../../hooks/queries/usePos";
import { useTables } from "../../hooks/queries/useTables";
import { useGetCurrentTableOrderMutation, useUpdateOrder, useOrders as usePosOrders } from "../../hooks/queries/useOrders";
import { formatCurrency } from "../../utils/currencyUtils";
import posService from "../../services/posService";
import {
    createVerifiedReceipt,
    calculateTaxForUpdatedSubtotal,
    calculateOrderItemsSubtotal,
    extractOrder,
    getOrderItemUnitPrice,
    getOrderId,
    getOrderSubtotal,
    getOrderTax,
    getOrderTotal,
    isOrderTotalConsistent,
    isOrderForTable,
    isPaymentVerified,
    readOrderAmount
} from "./floorPlanPayment";

const formatShortTableCode = (table, fallbackIndex = 0) => {
    const rawCode = table?.["Table-code"] || table?.Table_code || "";
    const rawName = table?.["Table-name"] || table?.Table_name || "";
    const candidate = (rawCode || rawName).trim();

    if (candidate) {
        // Match patterns like "T-01 -Ground Floor", "t-01", "Table 01", "T01"
        const codeMatch = candidate.match(/^([a-zA-Z]{1,3})-?(\d+)$/);
        if (codeMatch) {
            return `${codeMatch[1].toLowerCase()}-${codeMatch[2].padStart(2, "0")}`;
        }
        const numMatch = candidate.match(/(\d+)$/) || candidate.match(/(\d+)/);
        if (numMatch) {
            return `t-${numMatch[1].padStart(2, "0")}`;
        }
    }

    return `t-${String(fallbackIndex + 1).padStart(2, "0")}`;
};

const getFloorId = (floor) => floor?.Floor_id ?? floor?._id ?? floor?.id ?? floor?.floor_id;
const getFloorName = (floor, index) =>
    floor?.Floor_Name || floor?.floor_name || floor?.Name || floor?.name || `Floor ${index + 1}`;

const getTableSizeVariant = (table, index = 0) => {
    const capacity = Number(table?.["Seating-Persons_Count"] || table?.capacity || 0);
    if (capacity >= 6 || table?.isLarge) return "large"; // 4 chairs top & bottom
    if (capacity > 0 && capacity <= 2) return "small"; // 1 chair top & bottom
    if (capacity === 4) return "medium"; // 2 chairs top & bottom

    // Visually balanced pattern matching the Figma floor plan grid when capacity is unspecified
    const mod = index % 4;
    if (mod === 0) return "large";
    if (mod === 1 || mod === 3) return "small";
    return "medium";
};

const TableGraphic = ({ table, index = 0, onClick }) => {
    const { t } = useTranslation("common");
    const rawStatus =
        table?.["Table-Booking-Status_id"]?.Name ||
        table?.bookingStatus ||
        table?.status ||
        "Empty";

    const statusConfig = {
        Reserved: {
            bg: "bg-[#E4D9FF]",
            text: "text-[#8B5CF6]",
            icon: null,
            label: t("floorPlan.reserved", "Reserved")
        },
        Ready: {
            bg: "bg-[#FDE68A]/80",
            text: "text-[#F59E0B]",
            icon: <MdRoomService className="text-sm" />,
            label: t("floorPlan.ready", "Ready")
        },
        Served: {
            bg: "bg-[#BBF7D0]/85",
            text: "text-[#16A34A]",
            icon: <IoCheckmarkCircle className="text-sm" />,
            label: t("floorPlan.served", "Served")
        },
        Waiting: {
            bg: "bg-[#FECACA]/90",
            text: "text-[#B91C1C]",
            icon: <FaRegClock className="text-xs" />,
            label: table?.waitingTimer || "09:23"
        },
        Occupied: {
            bg: "bg-[#E4D9FF]",
            text: "text-[#8B5CF6]",
            icon: null,
            label: t("floorPlan.reserved", "Reserved")
        },
        Empty: null,
        Available: null
    };

    const config = statusConfig[rawStatus] || null;
    const sizeVariant = getTableSizeVariant(table, index);
    const chairCount = sizeVariant === "large" ? 4 : sizeVariant === "medium" ? 2 : 1;
    const surfaceWidthClass =
        sizeVariant === "large"
            ? "w-[276px]"
            : sizeVariant === "medium"
            ? "w-[154px]"
            : "w-[132px]";
    const tableLabel = formatShortTableCode(table, index);

    return (
        <div
            className="flex flex-col items-center cursor-pointer group select-none transition-transform duration-150 hover:scale-[1.03]"
            onClick={() => onClick(table)}
        >
            {/* Top Chairs */}
            <div className="flex items-center justify-center gap-4 mb-1.5">
                {Array.from({ length: chairCount }).map((_, idx) => (
                    <div
                        key={`top-${idx}`}
                        className="w-11 h-3.5 rounded-t-[10px] bg-[linear-gradient(180deg,_#F1E4F6_0%,_#F7E4EA_100%)]"
                    />
                ))}
            </div>

            {/* Table Surface (Vertical Centered Circle + Pill below, matching Figma second image) */}
            <div
                className={`h-[108px] ${surfaceWidthClass} bg-[linear-gradient(180deg,_#F2E6F7_0%,_#F9E8EC_100%)] rounded-[14px] flex flex-col items-center justify-center px-3 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all`}
            >
                <div className="w-11 h-11 rounded-full bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] text-white flex items-center justify-center text-[13px] font-medium shadow-sm shrink-0">
                    <span>{tableLabel}</span>
                </div>

                {config && (
                    <div
                        className={`mt-2 flex items-center justify-center gap-1.5 px-3.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} shrink-0`}
                    >
                        {config.icon && <span className="flex items-center">{config.icon}</span>}
                        <span>{config.label}</span>
                    </div>
                )}
            </div>

            {/* Bottom Chairs */}
            <div className="flex items-center justify-center gap-4 mt-1.5">
                {Array.from({ length: chairCount }).map((_, idx) => (
                    <div
                        key={`bottom-${idx}`}
                        className="w-11 h-3.5 rounded-b-[10px] bg-[linear-gradient(180deg,_#F1E4F6_0%,_#F7E4EA_100%)]"
                    />
                ))}
            </div>
        </div>
    );
};

const TableSkeleton = ({ isLarge }) => (
    <div className="flex flex-col items-center animate-pulse">
        <div className="flex gap-4 mb-1.5">
            <div className="w-11 h-3.5 rounded-t-[10px] bg-[#F3E8F8]" />
            <div className="w-11 h-3.5 rounded-t-[10px] bg-[#F3E8F8]" />
            {isLarge && (
                <>
                    <div className="w-11 h-3.5 rounded-t-[10px] bg-[#F3E8F8]" />
                    <div className="w-11 h-3.5 rounded-t-[10px] bg-[#F3E8F8]" />
                </>
            )}
        </div>
        <div
            className={`h-[108px] ${
                isLarge ? "w-[276px]" : "w-[154px]"
            } bg-[#F6EDF9] rounded-[14px] flex flex-col items-center justify-center px-4`}
        >
            <div className="w-11 h-11 rounded-full bg-purple-200/70" />
            <div className="mt-2 w-20 h-5 rounded-full bg-purple-200/50" />
        </div>
        <div className="flex gap-4 mt-1.5">
            <div className="w-11 h-3.5 rounded-b-[10px] bg-[#F3E8F8]" />
            <div className="w-11 h-3.5 rounded-b-[10px] bg-[#F3E8F8]" />
            {isLarge && (
                <>
                    <div className="w-11 h-3.5 rounded-b-[10px] bg-[#F3E8F8]" />
                    <div className="w-11 h-3.5 rounded-b-[10px] bg-[#F3E8F8]" />
                </>
            )}
        </div>
    </div>
);

export default function FloorPlan() {
    const { t } = useTranslation("common");
    const navigate = useNavigate();
    const location = useLocation();

    const { data: restaurantData } = useRestaurantDetails();
    const currency = restaurantData?.currency;

    // Floor & Table Queries
    const { data: floors = [], isLoading: isFloorsLoading } = useFloors();
    const [activeFloorId, setActiveFloorId] = useState(location.state?.floorId || null);

    useEffect(() => {
        if (floors.length === 0) return;
        setActiveFloorId((currentFloorId) => {
            if (currentFloorId && floors.some((floor) => String(getFloorId(floor)) === String(currentFloorId))) {
                return currentFloorId;
            }
            const routeFloor = floors.find(
                (floor) => String(getFloorId(floor)) === String(location.state?.floorId)
            );
            return getFloorId(routeFloor || floors[0]);
        });
    }, [floors, location.state?.floorId]);

    const { data: floorMap = {}, isLoading: isMapLoading } = useFloorMap(activeFloorId);
    const { data: floorWithTables } = useFloorWithTables(activeFloorId);
    const { getTables } = useTables();
    const allRestaurantTables = useMemo(() => getTables?.data || [], [getTables?.data]);
    const { data: myOrders = [] } = usePosOrders();

    // Filter state
    const [activeStatus, setActiveStatus] = useState("All");

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [activeTable, setActiveTable] = useState(null);
    const [showBillCard, setShowBillCard] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const [currentOrder, setCurrentOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [tableOrderError, setTableOrderError] = useState(false);
    const [isDownloadingBill, setIsDownloadingBill] = useState(false);

    // Payment & Order Hooks
    const { data: paymentOptions = [] } = usePaymentOptions();
    const createPaymentMutation = useCreatePayment();
    const getTableOrderMutation = useGetCurrentTableOrderMutation();
    const updateOrderMutation = useUpdateOrder();
    const orderPdfMutation = useOrderPdf();

    const [selectedPaymentKey, setSelectedPaymentKey] = useState("cash");
    const [paymentReceipt, setPaymentReceipt] = useState(null);
    const isProcessingPayment = createPaymentMutation.isPending || updateOrderMutation.isPending;

    // Build combined list of tables for the floor plan
    const allTables = useMemo(() => {
        // 1. Mapped tables from /master/floor_map_table/getTablebyFloorid/:floorId
        const mappedList = Object.values(floorMap || {}).reduce((acc, row) => {
            if (row && Array.isArray(row.tables)) {
                acc.push(...row.tables);
            } else if (Array.isArray(row)) {
                acc.push(...row);
            }
            return acc;
        }, []);

        // 2. Tables from /admin/floor/getWithTables/:floorId
        const floorTablesList =
            floorWithTables && Array.isArray(floorWithTables.tables || floorWithTables.Tables)
                ? (floorWithTables.tables || floorWithTables.Tables).filter((tItem) => tItem?.Table_id || tItem?._id)
                : [];

        // Include restaurant tables only when they belong to the selected floor.
        const selectedFloorTables = (Array.isArray(allRestaurantTables) ? allRestaurantTables : []).filter((table) => {
            const tableFloorId =
                table?.Floor_id ??
                table?.floor_id?.Floor_id ??
                table?.floor_id?._id ??
                table?.floor_id ??
                table?.Floor?.Floor_id ??
                table?.Floor?._id ??
                table?.floor?.Floor_id ??
                table?.floor?._id;
            return tableFloorId != null && String(tableFloorId) === String(activeFloorId);
        });

        const combinedMap = new Map();
        [...mappedList, ...floorTablesList, ...selectedFloorTables].forEach(
            (tbl, i) => {
                if (!tbl) return;
                const key = String(tbl.Table_id || tbl.table_id || tbl._id || `idx-${i}`);
                if (!combinedMap.has(key)) {
                    combinedMap.set(key, tbl);
                }
            }
        );

        const baseTables = Array.from(combinedMap.values());

        // Enrich tables with active orders from myOrders if status is Empty
        return baseTables.map((tbl, idx) => {
            const tableId = tbl.Table_id || tbl.table_id;
            const activeOrd = Array.isArray(myOrders)
                ? myOrders.find(
                      (o) =>
                          String(o.Table_id) === String(tableId) &&
                          o.Order_Status !== "Completed" &&
                          o.Order_Status !== "Cancelled" &&
                          o.payment_status !== "Paid" &&
                          o.payment_status !== "Success"
                  )
                : null;

            let derivedStatus = tbl?.["Table-Booking-Status_id"]?.Name;
            if (!derivedStatus || derivedStatus === "Available") {
                if (activeOrd) {
                    if (activeOrd.Order_Status === "Ready") derivedStatus = "Ready";
                    else if (activeOrd.Order_Status === "Served") derivedStatus = "Served";
                    else if (activeOrd.Order_Status === "Preparing" || activeOrd.Order_Status === "Pending")
                        derivedStatus = "Waiting";
                    else derivedStatus = "Reserved";
                } else {
                    derivedStatus = "Empty";
                }
            }

            let waitingTimer = "09:23";
            if (activeOrd?.CreateAt) {
                const diffSec = Math.max(0, Math.floor((Date.now() - new Date(activeOrd.CreateAt).getTime()) / 1000));
                const mins = String(Math.floor((diffSec % 3600) / 60)).padStart(2, "0");
                const secs = String(diffSec % 60).padStart(2, "0");
                waitingTimer = `${mins}:${secs}`;
            }

            const sizeVariant = getTableSizeVariant(tbl, idx);

            return {
                ...tbl,
                _id: tbl._id || `tbl-${tableId || idx}`,
                Table_id: tableId || idx + 1,
                "Table-code": formatShortTableCode(tbl, idx),
                "Table-name": tbl["Table-name"] || tbl.Table_name || `Table ${idx + 1}`,
                "Table-Booking-Status_id": {
                    ...(tbl["Table-Booking-Status_id"] || {}),
                    Name: derivedStatus
                },
                waitingTimer,
                activeOrderFallback: activeOrd || null,
                isLarge: sizeVariant === "large"
            };
        });
    }, [floorMap, floorWithTables, allRestaurantTables, myOrders, activeFloorId]);

    const displayedTables = useMemo(() => {
        if (activeStatus === "All") return allTables;
        return allTables.filter((tbl) => tbl["Table-Booking-Status_id"]?.Name === activeStatus);
    }, [allTables, activeStatus]);

    const mapOrderItems = (orderData) => {
        const itemsList = orderData?.items || [];
        return itemsList.map((item, idx) => ({
            id: item.Item ? item.Item.item_id || item.Item.Items_id : item.item_id || item.id || idx + 1,
            name: item.Item
                ? item.Item["item-name"] || item.Item.item_name
                : item.name || item.item_name || `Item ${idx + 1}`,
            quantity: Number(item.item_Quentry ?? item.quantity ?? 1),
            price: getOrderItemUnitPrice(item),
            variant_id: item.item_Variants_id || null,
            addon_id: item.Addon ? item.Addon.item_Addons_id : null,
            originalItem: item
        }));
    };

    const handleTableClick = async (table) => {
        setActiveTable(table);
        setShowModal(true);
        setShowBillCard(false);
        setPaymentReceipt(null);
        setShowPaymentModal(false);
        setTableOrderError(false);
        setItems([]);
        setCurrentOrder(null);

        setModalLoading(true);
        try {
            const res = await getTableOrderMutation.mutateAsync(table.Table_id);
            const responseOrder = extractOrder(res);
            const orderData = responseOrder && isOrderForTable(responseOrder, table.Table_id)
                ? responseOrder
                : extractOrder(table.activeOrderFallback);
            if (orderData) {
                setCurrentOrder(orderData);
                const orderItems = mapOrderItems(orderData);
                setItems(orderItems);
                if (orderItems.length > 0 && isPaymentVerified(orderData)) {
                    const verifiedReceipt = createVerifiedReceipt(orderData);
                    if (verifiedReceipt) {
                        setPaymentReceipt(verifiedReceipt);
                        setShowBillCard(true);
                    }
                }
            }
        } catch (error) {
            const fallbackOrder = extractOrder(table.activeOrderFallback);
            if (fallbackOrder) {
                setCurrentOrder(fallbackOrder);
                const fallbackItems = mapOrderItems(fallbackOrder);
                setItems(fallbackItems);
                if (fallbackItems.length > 0 && isPaymentVerified(fallbackOrder)) {
                    const verifiedReceipt = createVerifiedReceipt(fallbackOrder);
                    if (verifiedReceipt) {
                        setPaymentReceipt(verifiedReceipt);
                        setShowBillCard(true);
                    }
                }
            } else {
                console.error("Failed to load the selected table's current order:", error);
                setTableOrderError(true);
            }
        } finally {
            setModalLoading(false);
        }
    };

    const updateQty = async (index, change) => {
        const item = items[index];
        if (!item) return;
        const newQty = Math.max(1, item.quantity + change);
        if (newQty === item.quantity) return;

        const oldItems = [...items];
        const updatedItems = items.map((it, i) => (i === index ? { ...it, quantity: newQty } : it));
        setItems(updatedItems);

        if (!currentOrder) return;
        try {
            const currentSubtotal = getOrderSubtotal(
                currentOrder,
                oldItems.reduce((sum, orderItem) => sum + orderItem.price * orderItem.quantity, 0)
            );
            const nextSubtotal = updatedItems.reduce(
                (sum, orderItem) => sum + orderItem.price * orderItem.quantity,
                0
            );
            const payload = {
                id: currentOrder.POS_Order_id || currentOrder._id,
                items: updatedItems.map((it) => ({
                    item_id: it.id,
                    item_Quentry: it.quantity,
                    item_Addons_id: it.addon_id || null,
                    item_Variants_id: it.variant_id || null,
                    item_size: it.originalItem?.item_size || "Regular"
                })),
                Tax: calculateTaxForUpdatedSubtotal(currentOrder, currentSubtotal, nextSubtotal),
                Customer_id: currentOrder.Customer_id,
                Dining_Option: currentOrder.Dining_Option || "Dine in",
                Table_id: activeTable?.Table_id,
                Kitchen_id: currentOrder.Kitchen_id,
                Status: true
            };
            const res = await updateOrderMutation.mutateAsync(payload);
            if (res?.success === false) {
                throw new Error(res.message || t("floorPlan.orderUpdateError", "Failed to update order."));
            }
            const refreshedOrder = extractOrder(await posService.getOrderById(getOrderId(currentOrder)));
            if (!refreshedOrder || !Array.isArray(refreshedOrder.items)) {
                throw new Error(t("floorPlan.orderUpdateError", "Failed to confirm the updated order total."));
            }
            setCurrentOrder(refreshedOrder);
            setItems(mapOrderItems(refreshedOrder));
            toast.success(t("floorPlan.orderUpdateSuccess", "Order updated successfully."));
        } catch (error) {
            setItems(oldItems);
            setCurrentOrder(currentOrder);
            toast.error(error?.message || t("floorPlan.orderUpdateError", "Failed to update order."));
        }
    };

    const calculatedItemsTotal = calculateOrderItemsSubtotal(items);
    const itemsTotal = currentOrder ? getOrderSubtotal(currentOrder, calculatedItemsTotal) : 0;
    const tax = currentOrder ? getOrderTax(currentOrder, itemsTotal) : 0;
    const total = currentOrder ? getOrderTotal(currentOrder, itemsTotal + tax) : 0;

    // Resolve payment option label & backend ID
    const categorizedPayments = useMemo(() => {
        const findBackendOptionId = (label) => {
            const match = paymentOptions.find((opt) =>
                (opt.PaymentOption?.[0]?.option || opt.name || "")
                    .toLowerCase()
                    .includes(label.toLowerCase())
            );
            return match?.Payment_Options_id || paymentOptions[0]?.Payment_Options_id || 1;
        };

        return {
            top: [
                {
                    key: "cash",
                    label: t("floorPlan.payWithCash", "Pay with Cash"),
                    methodName: "Cash",
                    icon: null,
                    optionId: findBackendOptionId("cash")
                },
                {
                    key: "gift_card",
                    label: t("floorPlan.giftCards", "Gift Cards"),
                    methodName: "Gift Card",
                    icon: <FaGift className="text-black text-sm" />,
                    optionId: findBackendOptionId("gift")
                }
            ],
            online: [
                {
                    key: "gpay",
                    label: "Pay",
                    methodName: "G Pay",
                    customContent: (
                        <div className="flex items-center gap-1.5">
                            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                            </svg>
                            <span className="text-sm font-medium text-[#1E1E1E]">Pay</span>
                        </div>
                    ),
                    optionId: findBackendOptionId("g pay")
                },
                {
                    key: "apple_pay",
                    label: "Pay",
                    methodName: "Apple Pay",
                    customContent: (
                        <div className="flex items-center gap-1.5">
                            <FaApple className="text-black text-lg shrink-0" />
                            <span className="text-sm font-medium text-[#1E1E1E]">Pay</span>
                        </div>
                    ),
                    optionId: findBackendOptionId("apple")
                },
                {
                    key: "momo",
                    label: "MoMo Money",
                    methodName: "MoMo Money",
                    customContent: (
                        <span className="text-sm font-medium text-[#1E1E1E]">MoMo Money</span>
                    ),
                    optionId: findBackendOptionId("momo")
                },
                {
                    key: "orange",
                    label: "Orange Money",
                    methodName: "Orange Money",
                    customContent: (
                        <span className="text-sm font-medium text-[#1E1E1E]">Orange Money</span>
                    ),
                    optionId: findBackendOptionId("orange")
                }
            ],
            card: [
                {
                    key: "debit_card",
                    label: t("floorPlan.debitCardPayment", "Debit Card Payment"),
                    methodName: "Debit Card",
                    icon: <FaCreditCard className="text-black text-sm" />,
                    optionId: findBackendOptionId("card")
                }
            ],
            split: [
                {
                    key: "split",
                    label: t("floorPlan.splitPayment", "Split Payment"),
                    methodName: "Split Payment",
                    icon: <FaCodeBranch className="rotate-90 text-black text-sm" />,
                    optionId: findBackendOptionId("split")
                }
            ]
        };
    }, [paymentOptions, t]);

    const allPaymentEntries = useMemo(
        () => [
            ...categorizedPayments.top,
            ...categorizedPayments.online,
            ...categorizedPayments.card,
            ...categorizedPayments.split
        ],
        [categorizedPayments]
    );

    const selectedPaymentEntry =
        allPaymentEntries.find((entry) => entry.key === selectedPaymentKey) || allPaymentEntries[0];

    const finalizePayment = async () => {
        const orderId = getOrderId(currentOrder);
        if (!orderId || items.length === 0 || total <= 0) {
            toast.error(t("floorPlan.noOrderToPay", "There is no active order to pay for."));
            return;
        }

        try {
            if (!isOrderTotalConsistent(currentOrder, total)) {
                const totalFields = {
                    id: orderId,
                    SubTotal: itemsTotal,
                    Tax: tax,
                    Total: total,
                    Grand_Total: total,
                    total_amount: total
                };
                const syncResponse = await updateOrderMutation.mutateAsync(totalFields);
                if (!syncResponse || syncResponse.success === false) {
                    throw new Error(t("floorPlan.orderTotalMismatch", "The saved order total does not match the bill. Payment was not started."));
                }

                const synchronizedOrder = extractOrder(await posService.getOrderById(orderId));
                const synchronizedTotal = readOrderAmount(synchronizedOrder, [
                    "Grand_Total",
                    "grand_total",
                    "GrandTotal",
                    "Total",
                    "total",
                    "Total_Amount",
                    "total_amount",
                    "total_price"
                ]);
                if (!synchronizedOrder || synchronizedTotal === null || !isOrderTotalConsistent(synchronizedOrder, total)) {
                    throw new Error(t("floorPlan.orderTotalMismatch", "The saved order total does not match the bill. Payment was not started."));
                }
                setCurrentOrder(synchronizedOrder);
            }

            if (!selectedPaymentEntry?.optionId) {
                throw new Error(t("floorPlan.paymentMethodUnavailable", "The selected payment method is not configured."));
            }

            const paymentResponse = await createPaymentMutation.mutateAsync({
                Payment_Options_id: selectedPaymentEntry.optionId,
                paymentStatus: "Success",
                Order_id: orderId
            });
            if (!paymentResponse || paymentResponse.success === false) {
                throw new Error(paymentResponse?.message || t("floorPlan.paymentFailed", "Payment could not be confirmed."));
            }

            const updateResponse = await updateOrderMutation.mutateAsync({
                id: orderId,
                payment_status: "Success",
                Order_Status: "Completed"
            });
            if (!updateResponse || updateResponse.success === false) {
                throw new Error(updateResponse?.message || t("floorPlan.paymentFailed", "Payment could not be confirmed."));
            }

            const verificationResponse = await posService.getOrderById(orderId);
            const verifiedOrder = extractOrder(verificationResponse);
            const receiptData = createVerifiedReceipt(verifiedOrder, selectedPaymentEntry.methodName);
            if (!receiptData) {
                throw new Error(t("floorPlan.paymentVerificationFailed", "The transaction is not confirmed yet. No receipt was created."));
            }

            setCurrentOrder(verifiedOrder);
            setItems(mapOrderItems(verifiedOrder));
            setPaymentReceipt(receiptData);
            setShowPaymentModal(false);
            setShowModal(true);
            setShowBillCard(true);
            toast.success(t("floorPlan.paymentSuccess", "Payment Success!"));
        } catch (err) {
            console.error("Floor Plan payment failed or could not be verified:", err);
            toast.error(err?.message || t("floorPlan.paymentFailed", "Payment could not be confirmed."));
        }
    };

    const handleProcessPayment = () => {
        if (!getOrderId(currentOrder) || items.length === 0 || total <= 0) {
            toast.error(t("floorPlan.noOrderToPay", "There is no active order to pay for."));
            return;
        }

        const isOnline = ["gpay", "apple_pay", "momo", "orange"].includes(selectedPaymentKey);
        if (isOnline) {
            toast.error(t("floorPlan.onlinePaymentUnavailable", "Online payment is not available here until a provider confirms the transaction."));
            return;
        }

        finalizePayment();
    };

    const handleDownloadOrPrintReceipt = async () => {
        if (!paymentReceipt) {
            toast.error(t("floorPlan.receiptUnavailable", "A receipt is available only after payment is verified."));
            return;
        }
        window.print();
    };

    const handleDownloadOrderBill = async () => {
        const orderId = getOrderId(currentOrder);
        if (!orderId) {
            toast.error(t("floorPlan.noOrderToPay", "There is no active order to print."));
            return;
        }

        setIsDownloadingBill(true);
        try {
            const pdfBlob = await orderPdfMutation.mutateAsync(orderId);
            if (!(pdfBlob instanceof Blob) || pdfBlob.size === 0) {
                throw new Error(t("floorPlan.billDownloadError", "The order bill could not be downloaded."));
            }
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const link = document.createElement("a");
            link.href = pdfUrl;
            link.download = `order-${orderId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
        } catch (error) {
            console.error("Failed to download the Floor Plan bill:", error);
            toast.error(error?.message || t("floorPlan.billDownloadError", "The order bill could not be downloaded."));
        } finally {
            setIsDownloadingBill(false);
        }
    };

    const formatReceiptDate = (dateString) => {
        if (!dateString) return t("floorPlan.notAvailable", "N/A");
        const d = new Date(dateString);
        if (Number.isNaN(d.getTime())) return t("floorPlan.notAvailable", "N/A");
        return d.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
    };

    const restaurantName = restaurantData?.restaurant_name || restaurantData?.Name || "TRIAXX RESTAURANT";
    const restaurantAddress = restaurantData?.address || restaurantData?.Address || "";
    const restaurantPhone = restaurantData?.phone_number || restaurantData?.Phone || "";

    const displayTotal = paymentReceipt?.orderTotal ?? total;
    const displaySubtotal = paymentReceipt?.subTotal ?? itemsTotal;
    const displayTax = paymentReceipt?.tax ?? tax;
    const displayOrderNumber =
        paymentReceipt?.Order_id ||
        getOrderId(currentOrder) ||
        t("floorPlan.notAvailable", "N/A");
    const displayDateTime = formatReceiptDate(
        paymentReceipt?.CreateAt || currentOrder?.CreateAt || currentOrder?.createdAt || currentOrder?.created_at
    );
    const displayPaymentType =
        paymentReceipt?.paymentMethod ||
        currentOrder?.payment_method ||
        t("floorPlan.notAvailable", "N/A");
    const displayCustomerName =
        paymentReceipt?.customerName || currentOrder?.Customer?.Name || currentOrder?.customer_name || t("floorPlan.notAvailable", "N/A");

    return (
        <div className="bg-white min-h-screen px-6 py-5 font-['Poppins'] overflow-x-auto hide-scrollbar scrollbar-hide">
            {/* Top Header matching Figma node 196-58278 */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
                <h1 className="text-[18px] font-bold text-black">
                    {t("floorPlan.title", "Table")}{" "}
                    <span className="text-[#555555] font-semibold">
                        ({t("floorPlan.subtitle", "Floor Plan")})
                    </span>
                </h1>

                {/* Filter Buttons & Edit Tables Button */}
                <div className="flex flex-wrap items-center gap-2">
                    <label className="sr-only" htmlFor="floor-plan-floor-select">
                        {t("floorPlan.selectFloor", "Select floor")}
                    </label>
                    <select
                        id="floor-plan-floor-select"
                        value={activeFloorId == null ? "" : String(activeFloorId)}
                        onChange={(event) => setActiveFloorId(event.target.value)}
                        disabled={isFloorsLoading || floors.length === 0}
                        className="min-w-[112px] rounded-md border border-[#6A1B9A] bg-white px-3 py-1.5 text-sm font-medium text-[#6A1B9A] outline-none focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {floors.length === 0 && (
                            <option value="">{t("floorPlan.noFloors", "No floors available")}</option>
                        )}
                        {floors.map((floor, index) => {
                            const floorId = getFloorId(floor);
                            return (
                                <option key={floorId || index} value={floorId}>
                                    {getFloorName(floor, index)}
                                </option>
                            );
                        })}
                    </select>

                    <button
                        onClick={() => setActiveStatus("All")}
                        className={`px-5 py-1.5 rounded-md font-medium text-sm transition-all border ${
                            activeStatus === "All"
                                ? "bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] border-transparent text-white shadow-sm"
                                : "bg-white border-[#6A1B9A] text-[#6A1B9A] hover:bg-purple-50/40"
                        }`}
                    >
                        {t("floorPlan.all", "All")}
                    </button>

                    <button
                        onClick={() => setActiveStatus("Reserved")}
                        className={`px-6 py-1.5 rounded-md font-medium text-sm transition-all border border-[#9B8AFB] text-[#8B5CF6] ${
                            activeStatus === "Reserved"
                                ? "bg-[#EDE9FE] shadow-sm font-semibold"
                                : "bg-white hover:bg-purple-50/40"
                        }`}
                    >
                        {t("floorPlan.reserved", "Reserved")}
                    </button>

                    <button
                        onClick={() => setActiveStatus("Ready")}
                        className={`px-6 py-1.5 rounded-md font-medium text-sm transition-all border border-[#FDE68A] text-[#F59E0B] ${
                            activeStatus === "Ready"
                                ? "bg-[#FEF3C7] shadow-sm font-semibold"
                                : "bg-white hover:bg-amber-50/40"
                        }`}
                    >
                        {t("floorPlan.ready", "Ready")}
                    </button>

                    <button
                        onClick={() => setActiveStatus("Served")}
                        className={`px-6 py-1.5 rounded-md font-medium text-sm transition-all border border-[#4ADE80] text-[#22C55E] ${
                            activeStatus === "Served"
                                ? "bg-[#DCFCE7] shadow-sm font-semibold"
                                : "bg-white hover:bg-emerald-50/40"
                        }`}
                    >
                        {t("floorPlan.served", "Served")}
                    </button>

                    <button
                        onClick={() => setActiveStatus("Waiting")}
                        className={`px-6 py-1.5 rounded-md font-medium text-sm transition-all border border-[#DC2626] text-[#DC2626] ${
                            activeStatus === "Waiting"
                                ? "bg-[#FEE2E2] shadow-sm font-semibold"
                                : "bg-white hover:bg-red-50/40"
                        }`}
                    >
                        {t("floorPlan.waiting", "Waiting")}
                    </button>

                    <button
                        onClick={() => navigate("edit")}
                        className="flex items-center gap-2 px-6 py-2 rounded-xl font-medium text-sm bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] text-white hover:opacity-95 transition-opacity shadow-sm whitespace-nowrap ml-2"
                    >
                        <FaEdit className="text-base" />
                        <span>{t("floorPlan.editTables", "Edit Tables")}</span>
                    </button>
                </div>
            </div>

            {/* Floor Plan Table Grid matching Figma */}
            {isFloorsLoading || isMapLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-12 gap-x-8 justify-items-center py-4">
                    {Array.from({ length: 10 }).map((_, index) => (
                        <TableSkeleton key={`skeleton-${index}`} isLarge={index >= 8} />
                    ))}
                </div>
            ) : displayedTables.length === 0 ? (
                <div className="text-center text-gray-500 py-16">
                    <p className="text-base font-medium mb-4">{t("floorPlan.noTables", "No tables found for this filter.")}</p>
                    <button
                        onClick={() => navigate("create", { state: { activeTab: "mapTables" } })}
                        className="px-5 py-2.5 rounded-xl bg-[linear-gradient(90deg,_#5C2D91_0%,_#D32F2F_100%)] text-white text-sm font-semibold shadow-sm"
                    >
                        {t("floorPlan.createFloorPlan", "Create / Map Floor Plan")}
                    </button>
                </div>
            ) : (
                <div className="w-full overflow-x-auto hide-scrollbar scrollbar-hide py-2">
                    <div className="flex flex-wrap items-center justify-start gap-x-10 gap-y-12">
                        {displayedTables.map((table, idx) => (
                            <div key={table._id || table.Table_id || idx} className="flex justify-center shrink-0">
                                <TableGraphic table={table} index={idx} onClick={handleTableClick} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Order Summary & Scalloped Print Bill Modal (Matches Image 2 exactly) */}
            {showModal && activeTable && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 no-print">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-[420px] shadow-2xl relative max-h-[94vh] overflow-y-auto font-['Poppins']">
                        {/* Header matching Image 2: bold title and close button */}
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-[22px] font-bold text-[#111827]">
                                {t("floorPlan.orderSummary", "Order Summary")}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setShowBillCard(false);
                                }}
                                className="text-gray-700 hover:text-black transition-colors p-1 cursor-pointer"
                            >
                                <IoMdClose size={24} />
                            </button>
                        </div>

                        {modalLoading ? (
                            <div className="animate-pulse space-y-4 py-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex justify-between border-b border-gray-100 pb-3">
                                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                                        <div className="h-4 bg-gray-200 rounded w-16" />
                                    </div>
                                ))}
                            </div>
                        ) : showBillCard && paymentReceipt ? (
                            /* Ticket Card inside Order Summary Modal (Matches Image 2 exactly) */
                            <div>
                                {/* White Card with soft border and shadow */}
                                <div className="bg-white rounded-t-3xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/90 pt-6 px-6 pb-6 relative">
                                    {/* Double Circle Green Checkmark Badge matching Image 2 */}
                                    <div className="w-16 h-16 rounded-full bg-[#A7F3D0]/60 flex items-center justify-center mx-auto mb-3">
                                        <div className="w-10 h-10 rounded-full bg-[#22C55E] flex items-center justify-center shadow-sm">
                                            <svg
                                                className="w-5 h-5 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={3}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-[#111827] text-center">
                                        {t("floorPlan.paymentSuccess", "Payment Success!")}
                                    </h3>
                                    <p className="text-xs text-gray-400 text-center mt-1">
                                        {t(
                                            "floorPlan.paymentSuccessDesc",
                                            "Your payment has been successfully done."
                                        )}
                                    </p>

                                    {/* Divider line */}
                                    <div className="border-b border-gray-100 my-4" />

                                    {/* Total Payment */}
                                    <div className="text-center my-2">
                                        <p className="text-[11px] text-gray-400 font-medium">
                                            {t("floorPlan.totalPayment", "Total Payment")}
                                        </p>
                                        <p className="text-2xl md:text-3xl font-extrabold text-[#111827] mt-0.5 tracking-tight">
                                            {formatCurrency(displayTotal, currency)}
                                        </p>
                                    </div>

                                    {/* 2x2 Info Grid matching Image 2 */}
                                    <div className="grid grid-cols-2 gap-2.5 mt-5">
                                        <div className="border border-gray-100 rounded-xl p-3 bg-white">
                                            <p className="text-[10px] text-gray-400 font-medium">
                                                {t("floorPlan.orderNumber", "Order Number")}
                                            </p>
                                            <p className="text-xs font-bold text-[#111827] truncate mt-0.5">
                                                {displayOrderNumber}
                                            </p>
                                        </div>
                                        <div className="border border-gray-100 rounded-xl p-3 bg-white">
                                            <p className="text-[10px] text-gray-400 font-medium">
                                                {t("floorPlan.dateTime", "Date & Time")}
                                            </p>
                                            <p className="text-xs font-bold text-[#111827] truncate mt-0.5">
                                                {displayDateTime}
                                            </p>
                                        </div>
                                        <div className="border border-gray-100 rounded-xl p-3 bg-white">
                                            <p className="text-[10px] text-gray-400 font-medium">
                                                {t("floorPlan.paymentType", "Payment Type")}
                                            </p>
                                            <p className="text-xs font-bold text-[#111827] truncate mt-0.5">
                                                {displayPaymentType}
                                            </p>
                                        </div>
                                        <div className="border border-gray-100 rounded-xl p-3 bg-white">
                                            <p className="text-[10px] text-gray-400 font-medium">
                                                {t("floorPlan.customerName", "Customer Name")}
                                            </p>
                                            <p className="text-xs font-bold text-[#111827] truncate mt-0.5">
                                                {displayCustomerName}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Scalloped Bottom Edge of the ticket */}
                                <div className="flex justify-between items-center px-1 overflow-hidden h-3 -mt-1.5 relative z-10">
                                    {Array.from({ length: 18 }).map((_, idx) => (
                                        <div
                                            key={idx}
                                            className="w-3.5 h-3.5 rounded-full bg-white border-b border-r border-gray-100 shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                                        />
                                    ))}
                                </div>

                                {/* Print Receipt Action with Tray Download Icon matching Image 2 */}
                                <div className="mt-5 mb-5 text-center">
                                    <button
                                        type="button"
                                        onClick={handleDownloadOrPrintReceipt}
                                        className="inline-flex items-center justify-center gap-2 text-xs font-bold text-[#111827] hover:text-black py-1.5 px-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <svg
                                            className="w-4 h-4 text-[#111827]"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        <span>{t("floorPlan.printReceipt", "Print Receipt")}</span>
                                    </button>
                                </div>

                                {/* Close after reviewing a verified receipt */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setShowBillCard(false);
                                    }}
                                    className="w-full py-3.5 rounded-2xl bg-[linear-gradient(90deg,_#6A1B9A_0%,_#D32F2F_100%)] text-white font-semibold text-sm md:text-base hover:opacity-95 transition-opacity shadow-md cursor-pointer"
                                >
                                    {t("floorPlan.close", "Close")}
                                </button>
                            </div>
                        ) : tableOrderError ? (
                            <div className="text-center text-gray-600 py-6">
                                <p className="text-sm">{t("floorPlan.tableOrderLoadError", "Could not load this table's order.")}</p>
                                <button
                                    onClick={() => handleTableClick(activeTable)}
                                    className="mt-3 text-xs font-semibold text-[#C2185B] underline"
                                >
                                    {t("floorPlan.retry", "Try again")}
                                </button>
                            </div>
                        ) : !getOrderId(currentOrder) || items.length === 0 ? (
                            <div className="text-center text-gray-500 py-6">
                                <p className="text-sm">{t("floorPlan.noActiveOrders", "No active items on this table.")}</p>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        navigate("/dashboard/pos");
                                    }}
                                    className="mt-2 text-xs font-semibold text-[#C2185B] underline"
                                >
                                    {t("floorPlan.createNewOrderInPos", "Open POS to create an order")}
                                </button>
                            </div>
                        ) : (
                            /* Standard Order Summary Items List (Matches /tmp/fp_table_t01.png) */
                            <>
                                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                                    {items.length > 0 ? (
                                        items.map((item, index) => (
                                            <div
                                                key={`${item.id}-${index}`}
                                                className="flex items-center justify-between border-b border-[#F48FB1] pb-3"
                                            >
                                                <p className="text-sm font-semibold text-[#1E1E1E] w-[42%] truncate">
                                                    {item.name}
                                                </p>

                                                <div className="flex items-center gap-2.5">
                                                    <button
                                                        onClick={() => updateQty(index, -1)}
                                                        className="w-6 h-6 rounded bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] text-white flex items-center justify-center shadow-sm hover:opacity-90"
                                                    >
                                                        <FaMinus className="text-[10px]" />
                                                    </button>
                                                    <span className="text-sm font-bold text-[#1E1E1E] min-w-[16px] text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQty(index, 1)}
                                                        className="w-6 h-6 rounded bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] text-white flex items-center justify-center shadow-sm hover:opacity-90"
                                                    >
                                                        <FaPlus className="text-[10px]" />
                                                    </button>
                                                </div>

                                                <p className="text-sm font-semibold text-[#1E1E1E] text-right w-[26%]">
                                                    {formatCurrency(item.price * item.quantity, currency)}
                                                </p>
                                            </div>
                                        ))
                                    ) : null}
                                </div>

                                {/* Totals Section */}
                                <div className="text-xs font-medium space-y-2 border-t border-[#F48FB1] pt-3">
                                    <div className="flex justify-between text-gray-700">
                                        <span>{t("floorPlan.itemsNetTotal", "Items Net Total")}</span>
                                        <span className="font-semibold text-[#1E1E1E]">
                                            {formatCurrency(itemsTotal, currency)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-700 pb-2 border-b border-[#F48FB1]">
                                        <span>{t("floorPlan.taxes", "Taxes")}</span>
                                        <span className="font-semibold text-[#1E1E1E]">
                                            {formatCurrency(tax, currency)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-bold text-[#1E1E1E] text-sm pt-1 pb-2 border-b border-[#F48FB1]">
                                        <span>{t("floorPlan.total", "Total")}</span>
                                        <span>{formatCurrency(total, currency)}</span>
                                    </div>
                                </div>

                                {/* Action Buttons matching Figma */}
                                <div className="mt-5 space-y-3">
                                    <button
                                        onClick={handleDownloadOrderBill}
                                        disabled={isDownloadingBill}
                                        className="w-full py-3 rounded-xl bg-[linear-gradient(90deg,_#5C2D91_0%,_#D32F2F_100%)] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-md"
                                    >
                                        <FaReceipt className="text-sm" />
                                        <span>{isDownloadingBill
                                            ? t("floorPlan.generatingPdf", "Generating PDF...")
                                            : t("floorPlan.printBill", "Print Bill")}</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            setShowPaymentModal(true);
                                        }}
                                        className="w-full py-3 rounded-xl bg-[linear-gradient(90deg,_#5C2D91_0%,_#D32F2F_100%)] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-md"
                                    >
                                        <span>{t("floorPlan.choosePaymentOption", "Choose Payment Option")}</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Categorized Payment Options Modal (Matches Figma screenshots media_1792072189465_6e2b747f.png & media_1792072198390_79185166.png) */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[420px] p-6 relative max-h-[92vh] overflow-y-auto font-poppins">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-[22px] font-bold text-[#1E1E1E]">
                                {t("floorPlan.paymentOptions", "Payment Options")}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false);
                                }}
                                className="text-gray-800 hover:text-black transition-colors"
                            >
                                <IoMdClose size={24} />
                            </button>
                        </div>

                        {/* Top Ungrouped Options (Pay with Cash, Gift Cards) */}
                        <div className="space-y-2.5">
                            {categorizedPayments.top.map((item) => {
                                const isSelected = selectedPaymentKey === item.key;
                                return (
                                    <div
                                        key={item.key}
                                        onClick={() => setSelectedPaymentKey(item.key)}
                                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                                            isSelected
                                                ? "border-gray-900 bg-gray-50/50 shadow-xs"
                                                : "border-gray-400/80 bg-white hover:border-gray-600"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-[#1E1E1E]">
                                                {item.label}
                                            </span>
                                            {item.icon}
                                        </div>
                                        <div
                                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                isSelected ? "border-gray-900" : "border-gray-500"
                                            }`}
                                        >
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-gray-900" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Online Payments */}
                        <h3 className="text-xs font-semibold text-gray-600 mt-5 mb-2.5">
                            {t("floorPlan.onlinePayments", "Online Payments")}
                        </h3>
                        <div className="space-y-2.5">
                            {categorizedPayments.online.map((item) => {
                                const isSelected = selectedPaymentKey === item.key;
                                return (
                                    <div
                                        key={item.key}
                                        onClick={() => setSelectedPaymentKey(item.key)}
                                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                                            isSelected
                                                ? "border-gray-900 bg-gray-50/50 shadow-xs"
                                                : "border-gray-400/80 bg-white hover:border-gray-600"
                                        }`}
                                    >
                                        <div>
                                            {item.customContent || (
                                                <span className="text-sm font-medium text-[#1E1E1E]">
                                                    {item.label}
                                                </span>
                                            )}
                                        </div>
                                        <div
                                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                isSelected ? "border-gray-900" : "border-gray-500"
                                            }`}
                                        >
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-gray-900" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Card Payments */}
                        <h3 className="text-xs font-semibold text-gray-600 mt-5 mb-2.5">
                            {t("floorPlan.cardPayments", "Card Payments")}
                        </h3>
                        <div className="space-y-2.5">
                            {categorizedPayments.card.map((item) => {
                                const isSelected = selectedPaymentKey === item.key;
                                return (
                                    <div
                                        key={item.key}
                                        onClick={() => setSelectedPaymentKey(item.key)}
                                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                                            isSelected
                                                ? "border-gray-900 bg-gray-50/50 shadow-xs"
                                                : "border-gray-400/80 bg-white hover:border-gray-600"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-[#1E1E1E]">
                                                {item.label}
                                            </span>
                                            {item.icon}
                                        </div>
                                        <div
                                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                isSelected ? "border-gray-900" : "border-gray-500"
                                            }`}
                                        >
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-gray-900" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Split Payments */}
                        <h3 className="text-xs font-semibold text-gray-600 mt-5 mb-2.5">
                            {t("floorPlan.splitPayments", "Split Payments")}
                        </h3>
                        <div className="space-y-2.5">
                            {categorizedPayments.split.map((item) => {
                                const isSelected = selectedPaymentKey === item.key;
                                return (
                                    <div
                                        key={item.key}
                                        onClick={() => setSelectedPaymentKey(item.key)}
                                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                                            isSelected
                                                ? "border-gray-900 bg-gray-50/50 shadow-xs"
                                                : "border-gray-400/80 bg-white hover:border-gray-600"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-[#1E1E1E]">
                                                {item.label}
                                            </span>
                                            {item.icon}
                                        </div>
                                        <div
                                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                isSelected ? "border-gray-900" : "border-gray-500"
                                            }`}
                                        >
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-gray-900" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pay Button matching media_1792072189465_6e2b747f.png */}
                        <button
                            onClick={handleProcessPayment}
                            disabled={isProcessingPayment}
                            className="w-full mt-6 py-3.5 rounded-xl bg-[linear-gradient(90deg,_#5C2D91_0%,_#D32F2F_100%)] text-white font-semibold text-base hover:opacity-95 transition-opacity shadow-md disabled:opacity-50 cursor-pointer"
                        >
                            {isProcessingPayment
                                ? t("floorPlan.processing", "Processing...")
                                : `${t("floorPlan.pay", "Pay")} ${formatCurrency(total, currency)}`}
                        </button>

                    </div>
                </div>
            )}

            {/* Dedicated Hidden Printable Bill / Receipt Container for thermal / browser printing */}
            {paymentReceipt && (
                <div id="printable-floorplan-receipt" className="hidden font-mono text-black bg-white p-4">
                <div className="text-center pb-2 border-b border-dashed border-gray-400">
                    <h2 className="text-lg font-bold uppercase tracking-wider">{restaurantName}</h2>
                    {restaurantAddress && <p className="text-xs text-gray-700">{restaurantAddress}</p>}
                    {restaurantPhone && <p className="text-xs text-gray-700">Tel: {restaurantPhone}</p>}
                    <div className="mt-1.5 pt-1.5 border-t border-dotted border-gray-300">
                        <span className="text-sm font-extrabold uppercase tracking-widest">
                            {t("floorPlan.receiptTitle", "ORDER RECEIPT")}
                        </span>
                    </div>
                </div>

                <div className="py-2 border-b border-dashed border-gray-400 text-xs space-y-1">
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t("floorPlan.orderNumber", "Order #")}:</span>
                        <span className="font-bold">#{displayOrderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t("floorPlan.dateTime", "Date & Time")}:</span>
                        <span>{displayDateTime}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t("floorPlan.typeTable", "Table")}:</span>
                        <span className="font-semibold">
                            {activeTable ? formatShortTableCode(activeTable).toUpperCase() : ""}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t("floorPlan.customerName", "Customer")}:</span>
                        <span className="font-medium">{displayCustomerName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t("floorPlan.paymentType", "Payment Method")}:</span>
                        <span>{displayPaymentType}</span>
                    </div>
                </div>

                <div className="py-2 border-b border-dashed border-gray-400">
                    <div className="grid grid-cols-12 text-[11px] font-bold text-gray-700 pb-1 border-b border-dotted border-gray-300 uppercase">
                        <span className="col-span-6">{t("floorPlan.item", "Item")}</span>
                        <span className="col-span-2 text-center">{t("floorPlan.qty", "Qty")}</span>
                        <span className="col-span-4 text-right">{t("common.amount", "Amount")}</span>
                    </div>

                    <div className="divide-y divide-dotted divide-gray-200">
                        {items.map((item, idx) => (
                            <div key={idx} className="py-1 text-xs">
                                <div className="grid grid-cols-12">
                                    <span className="col-span-6 font-semibold break-words pr-1">{item.name}</span>
                                    <span className="col-span-2 text-center">{item.quantity}</span>
                                    <span className="col-span-4 text-right font-semibold">
                                        {formatCurrency(Number(item.price || 0) * Number(item.quantity || 1), currency)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="py-2 border-b border-dashed border-gray-400 text-xs space-y-1">
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t("common.subtotal", "Subtotal")}:</span>
                        <span>{formatCurrency(displaySubtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t("common.tax", "Tax")}:</span>
                        <span>{formatCurrency(displayTax, currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold pt-1 border-t border-dotted border-gray-300">
                        <span>{t("common.total", "TOTAL")}:</span>
                        <span>{formatCurrency(displayTotal, currency)}</span>
                    </div>
                </div>

                <div className="text-center pt-2 text-xs space-y-1">
                    <div className="font-bold tracking-wider">
                        STATUS: PAID ({displayPaymentType})
                    </div>
                    <p className="text-[11px] text-gray-600">{t("floorPlan.thankYouVisit", "Thank you for your visit!")}</p>
                    <p className="text-[11px] text-gray-500">{t("floorPlan.pleaseComeAgain", "Please come again")}</p>
                </div>
                </div>
            )}

            {/* Dedicated Print Media Stylesheet */}
            <style>{`
                @media print {
                    /* Hide everything on the page */
                    body * {
                        visibility: hidden !important;
                    }
                    
                    /* Show ONLY the printable receipt container */
                    #printable-floorplan-receipt, #printable-floorplan-receipt * {
                        visibility: visible !important;
                    }

                    #printable-floorplan-receipt {
                        display: block !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 80mm !important;
                        margin: 0 auto !important;
                        padding: 6mm 4mm !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }

                    /* Ensure modals, overlays, buttons, inputs are completely hidden */
                    .fixed, .no-print, button, input, textarea, select {
                        display: none !important;
                        visibility: hidden !important;
                    }

                    @page {
                        margin: 4mm;
                        size: auto;
                    }
                }
            `}</style>
        </div>
    );
}