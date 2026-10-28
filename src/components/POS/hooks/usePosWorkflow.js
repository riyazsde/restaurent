import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

// TanStack Query Hooks
import {
    useRestaurant,
    useTaxSetup,
    useMappedTables,
    usePosItems,
    useCreatePosOrder
} from '../../../hooks/queries/usePos';
import { useKitchenStations } from '../../../hooks/queries/useKitchen';
import { useCategories } from '../../../hooks/queries/useCategories';
import { useFloors } from '../../../hooks/queries/useFloorPlan';
import { useCustomers, useCreateCustomer, useUpdateCustomer } from '../../../hooks/queries/useCustomers';
import { useGetItemOptionsMutation } from '../../../hooks/queries/useMenuItems';
import { resolveCurrencySymbol } from '../../../utils/currencyUtils';

// Helpers
import {
    calculateCartTotals,
    buildPosOrderPayload,
    validateOrderPrerequisites,
    formatCurrency
} from '../utils/posHelpers';

/**
 * Main workflow hook encapsulating state, data queries, and actions for POS
 */
export const usePosWorkflow = () => {
    const { i18n } = useTranslation();

    // UI Mode & Segmented Tab
    const [selectedTab, setSelectedTab] = useState('All');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [posType, setPosType] = useState('Food'); // 'Food' | 'Bar'
    const [showBoxes, setShowBoxes] = useState(false);
    const [showBoxes3, setShowBoxes3] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedDining, setSelectedDining] = useState(null);

    // Modals
    const [isQrMenuOrdersOpen, setIsQrMenuOrdersOpen] = useState(false);
    const [isNotesListOpen, setIsNotesListOpen] = useState(false);

    // Category & Search Filtering
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [itemSearchTerm, setItemSearchTerm] = useState('');

    // TanStack React Query Hooks
    const { data: restaurantData, isLoading: isRestaurantLoading } = useRestaurant();
    const { data: kitchenStations = [], isLoading: isKitchenLoading } = useKitchenStations();
    const { data: taxSetupData = [], isLoading: isTaxLoading } = useTaxSetup();
    const { data: rawCategories = [], isLoading: isCategoriesLoading } = useCategories();
    const { data: rawItems = [], isLoading: isItemsLoading, refetch: refetchPosItems } = usePosItems();

    // Instant fresh fetch whenever POS loads
    useEffect(() => {
        refetchPosItems();
    }, [refetchPosItems]);

    const { data: rawFloors = [], isLoading: isFloorsLoading } = useFloors();
    const { data: rawTables = [], isLoading: isTablesLoading } = useMappedTables();
    const { data: customers = [], isLoading: isCustomersLoading } = useCustomers();
    const createPosOrderMutation = useCreatePosOrder();
    const createCustomerMutation = useCreateCustomer();
    const updateCustomerMutation = useUpdateCustomer();
    const getItemOptionsMutation = useGetItemOptionsMutation();

    // Derived Context IDs & Configurations
    const restaurantObj = useMemo(() => {
        if (!restaurantData) return null;
        if (Array.isArray(restaurantData)) return restaurantData[0] || null;
        if (restaurantData?.data) {
            return Array.isArray(restaurantData.data) ? restaurantData.data[0] : restaurantData.data;
        }
        return restaurantData;
    }, [restaurantData]);

    const restaurantId = restaurantObj?.Store_id || restaurantObj?.store_id || restaurantObj?.id || undefined;

    const kitchenStationsList = useMemo(() => {
        if (Array.isArray(kitchenStations)) return kitchenStations;
        if (Array.isArray(kitchenStations?.data)) return kitchenStations.data;
        return [];
    }, [kitchenStations]);

    const kitchenId = kitchenStationsList[0]?.Kitchen_id || kitchenStationsList[0]?.id || 1;
    const taxRate = Array.isArray(taxSetupData) && taxSetupData.length > 0 ? (taxSetupData[0].rate ?? 0) : 0;
    const floors = Array.isArray(rawFloors) ? rawFloors : [];

    // Dynamic restaurant currency code (resolves ZAR -> $ when language is English)
    const currency = useMemo(() => {
        const raw = restaurantObj?.currency || restaurantData?.currency;
        return resolveCurrencySymbol(raw);
    }, [restaurantObj, restaurantData?.currency, i18n.language]);

    // Filtered available tables (Non-occupied)
    const tables = useMemo(() => {
        if (!Array.isArray(rawTables)) return [];
        return rawTables.filter(item =>
            item.table_id && item.table_id.table_status !== 'Occupied'
        );
    }, [rawTables]);

    // Formatted categories list (derived from both category API and active menu items)
    // Formatted categories list (derived from both category API and active menu items)
    const categories = useMemo(() => {
        const categoryMap = new Map();

        // 1. Categories from item types API
        const rawList = Array.isArray(rawCategories?.data)
            ? rawCategories.data
            : Array.isArray(rawCategories)
            ? rawCategories
            : [];
        
        rawList.forEach(type => {
            if (type && type.Status !== false) {
                const id = type.Items_types_id || type._id || type.id;
                const rawName = type.Name || type.name;
                const name = typeof rawName === 'string' ? rawName.trim() : (rawName ? String(rawName).trim() : '');
                if (name) {
                    categoryMap.set(name.toLowerCase(), {
                        id,
                        name,
                        emozi: type.emozi || ''
                    });
                }
            }
        });

        // 2. Categories extracted directly from menu items
        const itemsList = Array.isArray(rawItems?.data)
            ? rawItems.data
            : Array.isArray(rawItems)
            ? rawItems
            : [];

        itemsList.forEach(item => {
            if (item && item.Items_types_id) {
                const cat = item.Items_types_id;
                let id = null;
                let name = '';
                let emozi = '';

                if (typeof cat === 'object' && cat !== null) {
                    id = cat.Items_types_id || cat._id || cat.id;
                    const rawName = cat.Name || cat.name;
                    name = typeof rawName === 'string' ? rawName.trim() : (rawName ? String(rawName).trim() : '');
                    emozi = cat.emozi || '';
                } else {
                    // cat is an ID (number or string)
                    id = cat;
                    const foundCat = rawList.find(c => 
                        (c.Items_types_id || c._id || c.id)?.toString() === String(cat)
                    );
                    if (foundCat) {
                        const rawName = foundCat.Name || foundCat.name;
                        name = typeof rawName === 'string' ? rawName.trim() : (rawName ? String(rawName).trim() : '');
                        emozi = foundCat.emozi || '';
                    }
                }

                if (name && typeof name === 'string' && name.trim()) {
                    const key = name.trim().toLowerCase();
                    if (!categoryMap.has(key)) {
                        categoryMap.set(key, {
                            id,
                            name: name.trim(),
                            emozi
                        });
                    }
                }
            }
        });

        return [{ name: 'All', id: null, emozi: '' }, ...Array.from(categoryMap.values())];
    }, [rawCategories, rawItems]);

    // Filtered menu items by selected category and search query
    const filteredItems = useMemo(() => {
        const itemsList = Array.isArray(rawItems?.data)
            ? rawItems.data
            : Array.isArray(rawItems)
            ? rawItems
            : [];

        let result = itemsList;

        // Filter by category
        if (selectedCategory && selectedCategory !== 'All') {
            const selectedCatLower = String(selectedCategory).trim().toLowerCase();
            const rawList = Array.isArray(rawCategories?.data)
                ? rawCategories.data
                : Array.isArray(rawCategories)
                ? rawCategories
                : [];

            result = result.filter(item => {
                const cat = item?.Items_types_id;
                if (!cat) return false;

                const catId = typeof cat === 'object' && cat !== null 
                    ? (cat.Items_types_id || cat._id || cat.id) 
                    : cat;

                if (selectedCategoryId && String(catId) === String(selectedCategoryId)) {
                    return true;
                }

                let catName = '';
                if (typeof cat === 'object' && cat !== null) {
                    const rawName = cat.Name || cat.name;
                    catName = typeof rawName === 'string' ? rawName.trim() : (rawName ? String(rawName).trim() : '');
                } else {
                    const foundCat = rawList.find(c => 
                        (c.Items_types_id || c._id || c.id)?.toString() === String(cat)
                    );
                    if (foundCat) {
                        const rawName = foundCat.Name || foundCat.name;
                        catName = typeof rawName === 'string' ? rawName.trim() : (rawName ? String(rawName).trim() : '');
                    }
                }

                return catName && catName.toLowerCase() === selectedCatLower;
            });
        }

        // Filter by search query across title, description, code, id, and category
        if (itemSearchTerm && typeof itemSearchTerm === 'string' && itemSearchTerm.trim()) {
            const term = itemSearchTerm.trim().toLowerCase();
            result = result.filter(item => {
                const name = String(item['item-name'] || item.name || item.Title || '');
                const id = String(item.Items_id || item.item_id || '');
                const desc = String(item.details || item.Details || item.description || item.Item_description || '');
                const code = String(item['item-code'] || item.item_code || '');
                const catName = typeof item.Category === 'object' && item.Category !== null
                    ? String(item.Category.Name || item.Category.name || '')
                    : '';
                return (
                    name.toLowerCase().includes(term) ||
                    id.includes(term) ||
                    desc.toLowerCase().includes(term) ||
                    code.toLowerCase().includes(term) ||
                    catName.toLowerCase().includes(term)
                );
            });
        }

        return result;
    }, [rawItems, rawCategories, selectedCategory, selectedCategoryId, itemSearchTerm]);

    // Customer Selection State
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

    // Dining & Table Selection
    const [diningOption, setDiningOption] = useState(null);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);
    const [showTableSelection, setShowTableSelection] = useState(false);

    // Cart Items State
    const [cartItems, setCartItems] = useState([]);

    // Variant / Addon Selection Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [availableVariants, setAvailableVariants] = useState([]);
    const [availableAddons, setAvailableAddons] = useState([]);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedAddon, setSelectedAddon] = useState(null);
    const [isLoadingItemDetails, setIsLoadingItemDetails] = useState(false);

    // Submission Status
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Customer Dropdown Outside Click Ref
    const customerDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
                setShowCustomerDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Tab Reset Effect
    useEffect(() => {
        setSelectedDining(null);
        setShowBoxes(false);
        setShowBoxes3(false);
        setDropdownOpen(false);
    }, [selectedTab]);

    // Dynamic Reactive Totals
    const { subTotal, taxAmount, total } = useMemo(() => {
        return calculateCartTotals(cartItems, taxRate);
    }, [cartItems, taxRate]);

    // Category Select Handler
    const handleCategorySelect = (category) => {
        setSelectedCategory(category.name);
        setSelectedCategoryId(category.id);
        setItemSearchTerm('');
    };

    // Search Handler
    const handleItemSearch = (searchTerm) => {
        setItemSearchTerm(searchTerm);
    };

    // Item Selection for Addons/Variants Modal
    const handleItemClick = async (item) => {
        try {
            setSelectedItem(item);
            setIsModalOpen(true);
            setIsLoadingItemDetails(true);
            setSelectedVariant(null);
            setSelectedAddon(null);

            const itemId = item.Items_id || item.id;
            if (itemId) {
                const options = await getItemOptionsMutation.mutateAsync(itemId);
                setAvailableVariants(options?.variants || []);
                setAvailableAddons(options?.addons || []);
            }
        } catch (error) {
            console.error('Error loading item details:', error);
            toast.error('Failed to load item details');
        } finally {
            setIsLoadingItemDetails(false);
        }
    };

    // Cart Handlers
    const handleAddToCart = () => {
        if (!selectedItem) return;

        const variantDetails = availableVariants.find(v =>
            v.item_Variants_id?.item_Variants_id === selectedVariant
        );

        const addonDetails = availableAddons.find(a =>
            a.item_Addons_id?.item_Addons_id === selectedAddon
        );

        const itemName = selectedItem.Title || selectedItem['item-name'] || selectedItem.Name || selectedItem.name || 'Dish';
        const itemPrice = Number(selectedItem.Price ?? selectedItem['item-price'] ?? selectedItem.price ?? selectedItem.Net_Price ?? 0);

        const cartItem = {
            item_id: selectedItem.Items_id || selectedItem.id,
            item_Quentry: 1,
            item_size: selectedItem['item-size'] || selectedItem.Size || 'Regular',
            item_status: "Preparing",
            item_Variants_id: selectedVariant,
            item_Addons_id: selectedAddon,
            itemDetails: {
                ...selectedItem,
                'item-name': itemName,
                'item-price': itemPrice,
                Price: itemPrice,
                Title: itemName
            },
            variantDetails: variantDetails,
            addonDetails: addonDetails,
            cartId: Date.now()
        };

        setCartItems(prev => [...prev, cartItem]);
        setIsModalOpen(false);
        setSelectedItem(null);
        setShowBoxes(true);
        setShowBoxes3(true);
        toast.success('Item added to cart');
    };

    const updateCartItemQuantity = (cartIdOrIndex, newQuantity) => {
        if (newQuantity < 1) return;

        setCartItems(prev =>
            prev.map((item, idx) =>
                (item.cartId === cartIdOrIndex || idx === cartIdOrIndex || item.item_id === cartIdOrIndex)
                    ? { ...item, item_Quentry: newQuantity }
                    : item
            )
        );
    };

    const removeFromCart = (cartIdOrIndex) => {
        setCartItems(prev =>
            prev.filter((item, idx) =>
                item.cartId !== cartIdOrIndex && idx !== cartIdOrIndex
            )
        );
        toast.info('Item removed from cart');
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const handleDiningOptionSelect = (option) => {
        setDiningOption(option);
        setShowTableSelection(option === "Dine in");

        if (option !== "Dine in") {
            setSelectedTable(null);
            setSelectedFloor(null);
        }
    };

    const handleTableSelect = (table) => {
        setSelectedTable(table);
        setShowTableSelection(false);

        // Sync customer table update in API if customer is selected
        if (selectedCustomer && (selectedCustomer.Customer_id || selectedCustomer.id)) {
            const targetTableId = table?.table_id?.Table_id || table?.Table_id || table?.id;
            if (targetTableId) {
                updateCustomerMutation.mutateAsync({
                    id: selectedCustomer.Customer_id || selectedCustomer.id,
                    Customer_id: selectedCustomer.Customer_id || selectedCustomer.id,
                    phone: selectedCustomer.phone,
                    Name: selectedCustomer.Name,
                    DOB: selectedCustomer.DOB ? selectedCustomer.DOB.split('T')[0] : undefined,
                    Table_id: parseInt(targetTableId, 10),
                    Notes: selectedCustomer.Notes || '',
                    Customer_type_id: selectedCustomer.Customer_type_id || 1,
                    Status: selectedCustomer.Status !== undefined ? selectedCustomer.Status : true
                }).catch(err => console.warn('Could not sync customer table in API:', err));
            }
        }
    };

    const handleCreateCustomer = async (customerData) => {
        try {
            return await createCustomerMutation.mutateAsync(customerData);
        } catch (error) {
            console.error('Error creating customer in POS:', error);
            throw error;
        }
    };

    const handleUpdateCustomer = async (customerData) => {
        try {
            return await updateCustomerMutation.mutateAsync(customerData);
        } catch (error) {
            console.error('Error updating customer in POS:', error);
            throw error;
        }
    };

    const handleSendToKitchen = async () => {
        const isValid = validateOrderPrerequisites({
            cartItems,
            customer: selectedCustomer,
            dining: diningOption,
            table: selectedTable,
            toast
        });
        if (!isValid) return;

        const resolvedKitchenId = kitchenId || 1;
        const resolvedRestaurantId = restaurantId || undefined;

        const orderPayload = buildPosOrderPayload({
            cartItems,
            selectedCustomer,
            diningOption,
            selectedTable,
            restaurantId: resolvedRestaurantId,
            kitchenId: resolvedKitchenId,
            taxAmount,
            posType
        });

        try {
            setIsSubmitting(true);
            const response = await createPosOrderMutation.mutateAsync(orderPayload);

            if (response && response.success !== false) {
                const orderId = response?.data?.POS_Order_id || response?.data?.Order_id || 'New';
                const totalVal = response?.data?.Total ?? total;
                toast.success(`Order #${orderId} created successfully!`);
                toast.info(`Total: ${formatCurrency(totalVal, currency)}`);
                resetPOS();
            } else {
                toast.error(response?.message || 'Failed to create order');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error(error.message || 'Failed to create order');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetPOS = () => {
        setCartItems([]);
        setSelectedCustomer(null);
        setDiningOption(null);
        setSelectedTable(null);
        setSelectedFloor(null);
        setSelectedCategory('All');
        setSelectedCategoryId(null);
        setItemSearchTerm('');
        setShowTableSelection(false);
    };

    const handleDropdownToggle = (isOpen) => {
        setDropdownOpen(isOpen);
        if (isOpen) setSelectedDining(null);
    };

    const filteredCustomers = useMemo(() => {
        const rawList = Array.isArray(customers?.data)
            ? customers.data
            : Array.isArray(customers)
            ? customers
            : [];
        const term = String(customerSearchTerm || '').trim().toLowerCase();
        if (!term) return rawList;
        return rawList.filter(customer =>
            String(customer?.Name || '').toLowerCase().includes(term) ||
            String(customer?.phone || '').includes(term)
        );
    }, [customers, customerSearchTerm]);

    // Initial Loading Skeleton Status
    const isInitialLoading = isRestaurantLoading || isKitchenLoading || isTaxLoading || isCategoriesLoading || isItemsLoading;

    return {
        // Tab & Mode
        selectedTab,
        setSelectedTab,
        viewMode,
        setViewMode,
        posType,
        setPosType,
        showBoxes,
        setShowBoxes,
        showBoxes3,
        setShowBoxes3,
        dropdownOpen,
        selectedDining,
        setSelectedDining,
        handleDropdownToggle,

        // Modals
        isQrMenuOrdersOpen,
        setIsQrMenuOrdersOpen,
        isNotesListOpen,
        setIsNotesListOpen,

        // Data & Filters
        categories,
        selectedCategory,
        selectedCategoryId,
        itemSearchTerm,
        handleCategorySelect,
        handleItemSearch,
        filteredItems,
        filteredCustomers,
        tables,
        floors,
        restaurantData,
        currency,
        isInitialLoading,

        // Customer
        selectedCustomer,
        setSelectedCustomer,
        customerSearchTerm,
        setCustomerSearchTerm,
        showCustomerDropdown,
        setShowCustomerDropdown,
        customerDropdownRef,
        handleCreateCustomer,
        handleUpdateCustomer,

        // Dining & Table
        diningOption,
        setDiningOption,
        selectedFloor,
        setSelectedFloor,
        selectedTable,
        setSelectedTable,
        showTableSelection,
        setShowTableSelection,
        handleDiningOptionSelect,
        handleTableSelect,

        // Cart & Calculation
        cartItems,
        setCartItems,
        subTotal,
        taxAmount,
        taxRate,
        total,
        handleAddToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,

        // Item Detail Modal
        isModalOpen,
        setIsModalOpen,
        selectedItem,
        setSelectedItem,
        availableVariants,
        availableAddons,
        selectedVariant,
        setSelectedVariant,
        selectedAddon,
        setSelectedAddon,
        isLoadingItemDetails,
        handleItemClick,

        // Order Submission
        isSubmitting,
        handleSendToKitchen,
        resetPOS,
        kitchenStationsList,
        kitchenId,
        restaurantId
    };
};

export default usePosWorkflow;
