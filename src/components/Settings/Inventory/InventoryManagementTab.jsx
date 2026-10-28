import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { 
    FiSearch, 
    FiEdit, 
    FiEye, 
    FiPackage, 
    FiCheckCircle, 
    FiTrendingDown, 
    FiAlertTriangle, 
    FiCalendar, 
    FiTrendingUp, 
    FiBarChart2,
    FiBox
} from 'react-icons/fi';
import inventoryService from '../../../services/inventoryService';
import inventoryCategoryService from '../../../services/inventoryCategoryService';
import { 
    calculateStockStatus, 
    calculateDaysToExpiry, 
    computeInventoryStatistics 
} from '../../../utils/inventoryUtils';
import { formatCurrency, resolveCurrencySymbol } from '../../../utils/currencyUtils';
import { useRestaurant } from '../../../hooks/queries/usePos';
import ConfirmDialog from '../../common/ConfirmDialog';
import GradientOutlineButton from '../../common/GradientOutlineButton';
import SegmentedTab from '../../common/SegmentedTab';
import InventoryModal from './InventoryModal';
import InventoryDetailsModal from './InventoryDetailsModal';
import ManualStockAdjustmentModal from './ManualStockAdjustmentModal';
import useSearchStore from '../../../store/searchStore';

const StatisticsSkeleton = () => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            {[...Array(7)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between animate-pulse">
                    <div className="flex justify-between items-center mb-3">
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                        <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                    </div>
                    <div className="h-7 w-12 bg-gray-300 rounded"></div>
                </div>
            ))}
        </div>
    );
};

const TableSkeleton = () => {
    return (
        <>
            {[...Array(6)].map((_, i) => (
                <tr key={i} className="border-b border-gray-50 animate-pulse">
                    <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gray-200 shrink-0"></div>
                            <div className="space-y-1.5">
                                <div className="h-3.5 w-28 bg-gray-300 rounded"></div>
                                <div className="h-2.5 w-16 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </td>
                    <td className="py-4 px-6">
                        <div className="h-3 w-20 bg-gray-200 rounded"></div>
                    </td>
                    <td className="py-4 px-6">
                        <div className="space-y-1.5">
                            <div className="h-3.5 w-16 bg-gray-300 rounded"></div>
                            <div className="w-20 h-1 bg-gray-200 rounded-full"></div>
                        </div>
                    </td>
                    <td className="py-4 px-6">
                        <div className="h-3 w-24 bg-gray-200 rounded"></div>
                    </td>
                    <td className="py-4 px-6">
                        <div className="space-y-1.5">
                            <div className="h-3 w-20 bg-gray-300 rounded"></div>
                            <div className="h-2.5 w-14 bg-gray-200 rounded"></div>
                        </div>
                    </td>
                    <td className="py-4 px-6">
                        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                    </td>
                    <td className="py-4 px-6">
                        <div className="space-y-1.5">
                            <div className="h-3.5 w-14 bg-gray-300 rounded"></div>
                            <div className="h-2.5 w-10 bg-gray-200 rounded"></div>
                        </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-6 h-6 bg-gray-200 rounded"></div>
                            <div className="w-6 h-6 bg-gray-200 rounded"></div>
                        </div>
                    </td>
                </tr>
            ))}
        </>
    );
};

const InventoryManagementTab = () => {
    const { t } = useTranslation('settings');
    const queryClient = useQueryClient();
    const { searchQuery: globalSearch, setSearchPlaceholder } = useSearchStore();
    const [activeTab, setActiveTab] = useState('Restaurant');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All Items');

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const [adjustItem, setAdjustItem] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const { data: restaurantData } = useRestaurant();
    const currency = resolveCurrencySymbol(restaurantData?.currency);

    useEffect(() => {
        setSearchPlaceholder(t('inventory.searchPlaceholder', 'Search ingredients...'));
        return () => setSearchPlaceholder('');
    }, [setSearchPlaceholder, t]);

    useEffect(() => {
        if (globalSearch !== undefined) {
            setSearchQuery(globalSearch);
        }
    }, [globalSearch]);

    // Fetch Inventory Data
    const { 
        data: response, 
        isLoading,
        isError
    } = useQuery({
        queryKey: ['inventory', activeTab],
        queryFn: () => activeTab === 'Restaurant' 
            ? inventoryService.getRestaurantInventory() 
            : inventoryService.getBarInventory()
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data) => activeTab === 'Restaurant'
            ? inventoryService.createRestaurantInventory(data)
            : inventoryService.createBarInventory(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['inventory', activeTab]);
            toast.success(t('inventory.createSuccess', 'Inventory item created successfully'));
            closeForm();
        },
        onError: (error) => {
            toast.error(error.message || t('inventory.createError', 'Failed to create inventory item'));
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data) => activeTab === 'Restaurant'
            ? inventoryService.updateRestaurantInventory(data)
            : inventoryService.updateBarInventory(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['inventory', activeTab]);
            toast.success(t('inventory.updateSuccess', 'Inventory item updated successfully'));
            closeForm();
            setIsDetailsOpen(false);
        },
        onError: (error) => {
            toast.error(error.message || t('inventory.updateError', 'Failed to update inventory item'));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => activeTab === 'Restaurant'
            ? inventoryService.deleteRestaurantInventory(id)
            : inventoryService.deleteBarInventory(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['inventory', activeTab]);
            toast.success(t('inventory.deleteSuccess', 'Inventory item deleted successfully'));
            setDeleteId(null);
        },
        onError: (error) => {
            toast.error(error.message || t('inventory.deleteError', 'Failed to delete inventory item'));
            setDeleteId(null);
        }
    });

    // Fetch Categories
    const { data: categoriesResponse } = useQuery({
        queryKey: ['inventoryCategories', activeTab],
        queryFn: () => activeTab === 'Restaurant'
            ? inventoryCategoryService.getAllRestaurantCategories()
            : inventoryCategoryService.getAllBarCategories(),
        staleTime: 60000
    });

    const categories = useMemo(() => {
        const raw = categoriesResponse?.data || categoriesResponse;
        if (Array.isArray(raw)) return raw;
        if (Array.isArray(raw?.categories)) return raw.categories;
        if (Array.isArray(raw?.data)) return raw.data;
        return [];
    }, [categoriesResponse]);

    const getCategoryName = (item) => {
        if (!item) return 'General';
        if (item.category_name) return item.category_name;
        if (typeof item.category === 'string' && isNaN(Number(item.category))) return item.category;
        const catId = item.category_id || item.category;
        const found = categories.find(c => String(c.id || c._id) === String(catId));
        return found ? (found.category_name || found.name) : (item.category || 'General');
    };

    const adjustStockMutation = useMutation({
        mutationFn: async ({ id, item, delta, newQty, reason }) => {
            const target = item || items.find(it => (it.id || it._id) === id) || selectedItem;
            const current = parseFloat(
                target?.on_hand_quantity !== undefined 
                    ? target?.on_hand_quantity 
                    : (target?.on_hand !== undefined ? target?.on_hand : target?.stock)
            ) || 0;
            const finalQty = newQty !== undefined ? newQty : Math.max(0, current + (delta || 0));

            if (activeTab === 'Restaurant') {
                return inventoryService.updateRestaurantInventory({
                    ...target,
                    id,
                    ingredient_name: target?.ingredient_name || target?.name || 'Item',
                    ingredient_code: target?.ingredient_code || target?.code || `ING-${id}`,
                    on_hand_quantity: finalQty,
                    on_hand: finalQty
                });
            } else {
                return inventoryService.adjustBarStock(id, { 
                    adjustment_quantity: delta,
                    reason: reason || 'Inventory Correction',
                    quantity: finalQty 
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['inventory', activeTab]);
            toast.success(t('inventory.adjustSuccess', 'Stock adjusted successfully'));
            setIsDetailsOpen(false);
            setIsAdjustOpen(false);
            setAdjustItem(null);
        },
        onError: (error) => {
            toast.error(error.message || t('inventory.adjustError', 'Failed to adjust stock'));
        }
    });

    // Extract items safely
    const rawData = response?.data;
    const items = useMemo(() => {
        if (Array.isArray(rawData)) return rawData;
        if (Array.isArray(response)) return response;
        if (Array.isArray(rawData?.inventory)) return rawData.inventory;
        return [];
    }, [rawData, response]);

    const nextItemCode = useMemo(() => {
        const count = items.length + 1;
        return `ING-${String(count).padStart(3, '0')}`;
    }, [items.length]);
    
    // Compute statistics using pure utility functions
    const stats = useMemo(() => {
        return computeInventoryStatistics(items);
    }, [items]);

    // Filter Items
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const name = (item.ingredient_name || item.name || '').toLowerCase();
            const code = (item.ingredient_code || item.ingredient_id || item.code || `ING-${item.id || ''}`).toLowerCase();
            const catName = getCategoryName(item).toLowerCase();
            const q = searchQuery.toLowerCase();
            
            const matchesSearch = !q || name.includes(q) || code.includes(q) || catName.includes(q);
            if (!matchesSearch) return false;

            const current = parseFloat(item.on_hand_quantity !== undefined ? item.on_hand_quantity : (item.on_hand !== undefined ? item.on_hand : item.stock)) || 0;
            const min = parseFloat(item.minimum_stock !== undefined ? item.minimum_stock : item.min_stock) || 0;
            const max = parseFloat(item.maximum_stock !== undefined ? item.maximum_stock : item.max_stock) || 0;
            const expiry = item.expiry_date || item.expiryDate;

            const status = calculateStockStatus(current, min, max, expiry);

            if (activeFilter === 'All Items') return true;
            if (activeFilter === 'Critical') return status === 'Critical';
            if (activeFilter === 'Low Stock') return status === 'Low Stock';
            if (activeFilter === 'Expiring Soon') return status === 'Expiring Soon' || status === 'Expired';
            if (activeFilter === 'Overstocked') return status === 'Overstocked';
            if (activeFilter === 'OK') return status === 'OK';
            
            return true;
        });
    }, [items, searchQuery, activeFilter]);

    // Handlers
    const openCreateForm = () => {
        setSelectedItem(null);
        setIsFormOpen(true);
    };

    const openEditForm = (item) => {
        setSelectedItem(item);
        setIsFormOpen(true);
    };

    const openDetails = (item) => {
        setSelectedItem(item);
        setIsDetailsOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
    };

    const closeDetails = () => {
        setIsDetailsOpen(false);
        setSelectedItem(null);
    };

    const handleFormSubmit = (data) => {
        if (data.id) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const openStockAdjustment = (item) => {
        setAdjustItem(item);
        setIsAdjustOpen(true);
    };

    const closeStockAdjustment = () => {
        setIsAdjustOpen(false);
        setAdjustItem(null);
    };

    const handleApplyStockAdjustment = ({ id, item, delta, newQty, reason }) => {
        adjustStockMutation.mutate({ id, item, delta, newQty, reason });
    };

    const handleAdjustStock = (id, newQty, delta, reason) => {
        adjustStockMutation.mutate({ id, newQty, delta, reason });
    };

    // Helper for Status Badge Pill matching Figma
    const getStatusPill = (status) => {
        switch (status) {
            case 'Critical': 
                return (
                    <span className="bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
                        <FiAlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('inventory.critical', 'Critical')}</span>
                    </span>
                );
            case 'Low Stock': 
                return (
                    <span className="bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
                        <FiTrendingDown className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('inventory.lowStock', 'Low Stock')}</span>
                    </span>
                );
            case 'OK': 
                return (
                    <span className="bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
                        <FiCheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('inventory.ok', 'OK')}</span>
                    </span>
                );
            case 'Expiring Soon': 
                return (
                    <span className="bg-[#FEF9C3] text-[#A16207] border border-[#FEF08A] px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
                        <FiCalendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('inventory.expiringSoon', 'Expiring Soon')}</span>
                    </span>
                );
            case 'Expired': 
                return (
                    <span className="bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
                        <FiAlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('inventory.expired', 'Expired')}</span>
                    </span>
                );
            case 'Overstocked': 
                return (
                    <span className="bg-[#FAF5FF] text-[#7E22CE] border border-[#F3E8FF] px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
                        <FiTrendingUp className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('inventory.overstocked', 'Overstocked')}</span>
                    </span>
                );
            default: 
                return (
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center whitespace-nowrap">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="p-6 font-poppins min-h-screen">
            {/* Header matching Figma */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-[28px] font-bold text-gray-900">
                    {t('inventory.title', 'Inventory Management')}
                </h1>
                
                <div className="flex items-center gap-3">
                    {/* New Button */}
                    <GradientOutlineButton 
                        onClick={openCreateForm}
                        className="!h-[44px] sm:!h-[46px] !rounded-[14px] font-semibold"
                    >
                        {t('inventory.new', '+ New')}
                    </GradientOutlineButton>

                    {/* Segmented Control Capsule */}
                    <SegmentedTab
                        variant="subtle"
                        tabs={[
                            { id: 'Restaurant', label: t('inventory.restaurant', 'Restaurant') },
                            { id: 'Bar', label: t('inventory.bar', 'Bar') }
                        ]}
                        activeTab={activeTab}
                        onTabChange={(tabId) => setActiveTab(tabId)}
                    />
                </div>
            </div>

            {/* 7 Metric Cards Row matching Figma */}
            {isLoading ? (
                <StatisticsSkeleton />
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                    {/* Card 1: Total Items */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500 font-medium">{t('inventory.totalItems', 'Total Items')}</span>
                            <FiPackage className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-3xl font-bold text-gray-900">{stats.total_items}</span>
                    </div>

                    {/* Card 2: OK */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500 font-medium">{t('inventory.ok', 'OK')}</span>
                            <FiCheckCircle className="w-4 h-4 text-[#16A34A]" />
                        </div>
                        <span className="text-3xl font-bold text-[#16A34A]">{stats.ok_count}</span>
                    </div>

                    {/* Card 3: Low Stock */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500 font-medium">{t('inventory.lowStock', 'Low Stock')}</span>
                            <FiTrendingDown className="w-4 h-4 text-[#F97316]" />
                        </div>
                        <span className="text-3xl font-bold text-[#EA580C]">{stats.low_stock_count}</span>
                    </div>

                    {/* Card 4: Critical */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500 font-medium">{t('inventory.critical', 'Critical')}</span>
                            <FiAlertTriangle className="w-4 h-4 text-[#DC2626]" />
                        </div>
                        <span className="text-3xl font-bold text-[#DC2626]">{stats.critical_count}</span>
                    </div>

                    {/* Card 5: Expiring */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500 font-medium">{t('inventory.expiring', 'Expiring')}</span>
                            <FiCalendar className="w-4 h-4 text-[#D97706]" />
                        </div>
                        <span className="text-3xl font-bold text-[#D97706]">{stats.expiring_count}</span>
                    </div>

                    {/* Card 6: Overstocked */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500 font-medium">{t('inventory.overstocked', 'Overstocked')}</span>
                            <FiTrendingUp className="w-4 h-4 text-[#9333EA]" />
                        </div>
                        <span className="text-3xl font-bold text-[#9333EA]">{stats.overstocked_count}</span>
                    </div>

                    {/* Card 7: Total Value */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500 font-medium">{t('inventory.totalValue', 'Total Value')}</span>
                            <FiBarChart2 className="w-4 h-4 text-[#2563EB]" />
                        </div>
                        <span className="text-3xl font-bold text-[#2563EB]">{formatCurrency(stats.total_value, currency)}</span>
                    </div>
                </div>
            )}
            
            {/* Filter Bar & Search matching Figma */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 p-3.5 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center gap-2">
                    {[
                        { id: 'All Items', label: t('inventory.all', 'All Items'), icon: null },
                        { id: 'Critical', label: t('inventory.critical', 'Critical'), icon: <FiAlertTriangle className="w-3.5 h-3.5 text-red-500" /> },
                        { id: 'Low Stock', label: t('inventory.lowStock', 'Low Stock'), icon: <FiTrendingDown className="w-3.5 h-3.5 text-orange-500" /> },
                        { id: 'Expiring Soon', label: t('inventory.expiringSoon', 'Expiring Soon'), icon: <FiCalendar className="w-3.5 h-3.5 text-amber-500" /> },
                        { id: 'Overstocked', label: t('inventory.overstocked', 'Overstocked'), icon: <FiTrendingUp className="w-3.5 h-3.5 text-purple-500" /> },
                        { id: 'OK', label: t('inventory.ok', 'OK'), icon: <FiCheckCircle className="w-3.5 h-3.5 text-green-500" /> }
                    ].map(f => {
                        const isActive = activeFilter === f.id;
                        return (
                            <button
                                key={f.id}
                                type="button"
                                onClick={() => setActiveFilter(f.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                                    isActive 
                                        ? 'bg-gradient-to-r from-[#8E1C58] to-[#BD1B2F] text-white shadow-xs' 
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {!isActive && f.icon}
                                <span>{f.label}</span>
                            </button>
                        );
                    })}
                </div>
                
                <div className="relative w-full md:w-64 shrink-0">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                        type="text"
                        placeholder={t('inventory.searchPlaceholder', 'Search ingredients...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] placeholder:text-gray-400 shadow-2xs"
                    />
                </div>
            </div>

            {/* Inventory Table matching Figma */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                <th className="py-4 px-6">{activeTab === 'Restaurant' ? t('inventory.ingredient', 'Ingredient') : t('inventory.alcohol', 'Alcohol')}</th>
                                <th className="py-4 px-6">{t('inventory.category', 'Category')}</th>
                                <th className="py-4 px-6">{t('inventory.onHand', 'On-Hand')}</th>
                                <th className="py-4 px-6">{t('inventory.minMax', 'Min/Max')}</th>
                                <th className="py-4 px-6">{t('inventory.expiryDate', 'Expiry Date')}</th>
                                <th className="py-4 px-6">{t('inventory.status', 'Status')}</th>
                                <th className="py-4 px-6">{t('inventory.value', 'Value')}</th>
                                <th className="py-4 px-6 text-center">{t('inventory.actions', 'Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {isLoading ? (
                                <TableSkeleton />
                            ) : isError ? (
                                <tr>
                                    <td colSpan="8" className="py-12 text-center text-red-500 font-medium">
                                        {t('inventory.loadError', 'Failed to load inventory. Please try again.')}
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-16 text-center text-gray-500 font-medium">
                                        {t('inventory.noItems', 'No inventory items found.')}
                                    </td>
                                </tr>
                            ) : filteredItems.map((item, idx) => {
                                const current = parseFloat(item.on_hand_quantity !== undefined ? item.on_hand_quantity : (item.on_hand !== undefined ? item.on_hand : item.stock)) || 0;
                                const min = parseFloat(item.minimum_stock !== undefined ? item.minimum_stock : item.min_stock) || 0;
                                const max = parseFloat(item.maximum_stock !== undefined ? item.maximum_stock : item.max_stock) || 0;
                                const expiry = item.expiry_date || item.expiryDate;
                                const unit = item.unit || (activeTab === 'Restaurant' ? 'g' : 'bottle');
                                const cost = parseFloat(item.cost_per_unit !== undefined ? item.cost_per_unit : item.costPerUnit) || 0;
                                
                                const status = calculateStockStatus(current, min, max, expiry);
                                const daysLeft = calculateDaysToExpiry(expiry);
                                const totalValue = current * cost;
                                
                                // Progress bar logic
                                let progressColor = 'bg-[#22C55E]';
                                if (status === 'Critical') progressColor = 'bg-[#EF4444]';
                                else if (status === 'Low Stock') progressColor = 'bg-[#F97316]';
                                else if (status === 'Overstocked') progressColor = 'bg-[#A855F7]';
                                const progressPct = max > 0 ? Math.min((current / max) * 100, 100) : 0;

                                const code = item.ingredient_code || item.ingredient_id || item.code || `ING-00${idx + 1}`;

                                return (
                                    <tr key={item.id || item._id || idx} className="hover:bg-gray-50/60 transition-colors">
                                        {/* Ingredient Name & Code */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-[#F5EEFB] text-[#8200DB] flex items-center justify-center shrink-0">
                                                    <FiBox className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 leading-tight">
                                                        {item.ingredient_name || item.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400 font-mono mt-0.5">{code}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            {getCategoryName(item)}
                                        </td>

                                        {/* On-Hand Quantity with Indicator Bar */}
                                        <td className="py-4 px-6">
                                            <p className="font-bold text-gray-900">
                                                {current.toLocaleString()} {unit}
                                            </p>
                                            <div className="w-20 h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                                                <div className={`h-full ${progressColor}`} style={{ width: `${progressPct}%` }}></div>
                                            </div>
                                        </td>

                                        {/* Min / Max */}
                                        <td className="py-4 px-6 text-xs text-gray-600 font-medium">
                                            {min.toLocaleString()} / {max.toLocaleString()} {unit}
                                        </td>

                                        {/* Expiry Date */}
                                        <td className="py-4 px-6">
                                            <p className="text-xs font-semibold text-gray-900">
                                                {expiry ? String(expiry).split('T')[0] : 'N/A'}
                                            </p>
                                            {daysLeft !== null && (
                                                <p className={`text-xs mt-0.5 font-medium ${
                                                    daysLeft < 0 ? 'text-red-600' : daysLeft <= 7 ? 'text-[#EA580C]' : 'text-gray-400'
                                                }`}>
                                                    {daysLeft < 0 ? t('inventory.expired', 'Expired') : t('inventory.daysLeft', '{{days}} days left', { days: daysLeft })}
                                                </p>
                                            )}
                                        </td>

                                        {/* Status Badge */}
                                        <td className="py-4 px-6">
                                            {getStatusPill(status)}
                                        </td>

                                        {/* Value & Cost Per Unit */}
                                        <td className="py-4 px-6">
                                            <p className="font-bold text-gray-900 text-sm">
                                                {formatCurrency(totalValue, currency)}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {formatCurrency(cost, currency)}/{unit}
                                            </p>
                                        </td>

                                        {/* Action Buttons */}
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => openDetails(item)}
                                                    title={t('inventory.viewDetails', 'View Details')}
                                                    className="p-1.5 text-[#8200DB] hover:text-[#7200c4] hover:bg-purple-50 rounded-lg transition-colors"
                                                >
                                                    <FiEye className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => openStockAdjustment(item)}
                                                    title={t('inventory.manualStockAdjustment', 'Manual Stock Adjustment')}
                                                    className="p-1.5 text-[#2563EB] hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <FiEdit className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit Inventory Modal */}
            <InventoryModal 
                isOpen={isFormOpen}
                onClose={closeForm}
                onSubmit={handleFormSubmit}
                initialData={selectedItem}
                isLoading={createMutation.isPending || updateMutation.isPending}
                activeTab={activeTab}
                categories={categories}
                nextItemCode={nextItemCode}
            />

            {/* Inventory Details Modal */}
            <InventoryDetailsModal 
                item={isDetailsOpen ? selectedItem : null}
                currency={currency}
                onClose={closeDetails}
                onOpenAdjust={(item) => {
                    setIsDetailsOpen(false);
                    openStockAdjustment(item);
                }}
                onAdjustStock={(id, newQty, delta, reason) => {
                    handleApplyStockAdjustment({ id, newQty, delta, reason });
                }}
                isAdjusting={adjustStockMutation.isPending}
                categories={categories}
            />

            {/* Manual Stock Adjustment Modal matching Figma */}
            <ManualStockAdjustmentModal 
                isOpen={isAdjustOpen}
                onClose={closeStockAdjustment}
                item={adjustItem}
                onApply={handleApplyStockAdjustment}
                isLoading={adjustStockMutation.isPending}
            />

            {/* Delete Confirm Dialog */}
            <ConfirmDialog 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => deleteMutation.mutate(deleteId)}
                title={t('inventory.deleteTitle', 'Delete Inventory Item')}
                message={t('inventory.deleteMessage', 'Are you sure you want to delete this inventory item? This action cannot be undone.')}
                confirmText={deleteMutation.isPending ? t('inventory.deleting', 'Deleting...') : t('inventory.delete', 'Delete')}
                cancelText={t('inventory.cancel', 'Cancel')}
            />
        </div>
    );
};

export default InventoryManagementTab;
