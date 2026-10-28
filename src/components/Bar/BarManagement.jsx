import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import BarHeader from './BarHeader';
import BarLeftPanel from './BarLeftPanel';
import BarRightPanel from './BarRightPanel';
import BarAddonsModal from './BarAddonsModal';
import itemsService from '../../services/itemsService';
import itemTypesService from '../../services/itemTypesService';
import { useRestaurant } from '../../hooks/queries/usePos';
import { resolveCurrencySymbol } from '../../utils/currencyUtils';
import BarOrderPaymentModal from './modals/BarOrderPaymentModal';
import { toast } from 'react-toastify';
import useSearchStore from '../../store/searchStore';

const BarManagement = () => {
    const { t } = useTranslation('common');
    const location = useLocation();
    const { searchQuery, setSearchPlaceholder } = useSearchStore();

    useEffect(() => {
        setSearchPlaceholder(t('search.drinks', 'Search for drinks...'));
        return () => setSearchPlaceholder('');
    }, [setSearchPlaceholder, t]);

    // Workflow state: 'IDLE' | 'FLOOR_MAP' | 'START_ORDER_SUMMARY' | 'ORDER_SUMMARY'
    const [panelMode, setPanelMode] = useState('IDLE');
    const [selectedCategoryId, setSelectedCategoryId] = useState('all');
    const [selectedPersons, setSelectedPersons] = useState(1);
    const [selectedFloor, setSelectedFloor] = useState('F - 01');
    const [selectedTable, setSelectedTable] = useState('04');
    const [selectedItem, setSelectedItem] = useState(null);

    // Cart & Addons Modal state
    const [cartItems, setCartItems] = useState([]);
    const [isAddonsModalOpen, setIsAddonsModalOpen] = useState(false);
    const [selectedDrinkForModal, setSelectedDrinkForModal] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Sync state when returning from Table Floor Plan (/dashboard/table)
    useEffect(() => {
        if (location.state?.fromTableSelect && location.state?.selectedTable) {
            setSelectedTable(location.state.selectedTable);
            if (location.state.floor) setSelectedFloor(location.state.floor);
            if (location.state.persons) setSelectedPersons(location.state.persons);
            setPanelMode('START_ORDER_SUMMARY');
        }
    }, [location.state]);

    // Fetch store profile for dynamic currency derivation
    const { data: restaurantData } = useRestaurant();
    const currency = resolveCurrencySymbol(restaurantData?.currency);

    // 1. Fetch Drink Categories from Item Types API
    const { data: rawItemTypesData } = useQuery({
        queryKey: ['drinkCategories'],
        queryFn: async () => {
            const response = await itemTypesService.getAllItemTypes('Drink');
            return response?.data || response || [];
        }
    });

    // 2. Fetch Drink Items by category using TanStack Query
    const { data: rawItemsData, isLoading: isItemsLoading } = useQuery({
        queryKey: ['barItems', selectedCategoryId],
        queryFn: async () => {
            const params = { type: 'Drink' };
            // If specific category is selected, pass category_id to API
            if (selectedCategoryId && selectedCategoryId !== 'all') {
                params.category_id = selectedCategoryId;
            }
            const response = await itemsService.getItemsList(params);
            return response?.data || [];
        }
    });

    // Combine preset categories and server categories with their emojis
    const categories = useMemo(() => {
        const categoryMap = new Map();

        // Preset categories matching the reference design
        const presets = [
            { id: 'all', name: t('bar.categories.all', 'All Items'), emozi: '' },
            { id: 'cocktails', name: t('bar.categories.cocktails', 'Cocktails'), emozi: '🍸' },
            { id: 'beer', name: t('bar.categories.craftedBeer', 'Crafted Beer'), emozi: '🍺' },
            { id: 'mocktails', name: t('bar.categories.mocktails', 'Mocktails'), emozi: '🍹' }
        ];

        presets.forEach(cat => categoryMap.set(String(cat.id).toLowerCase(), cat));

        // Incorporate categories from Item Types API
        const typesList = Array.isArray(rawItemTypesData) 
            ? rawItemTypesData 
            : (rawItemTypesData?.data || []);

        typesList.forEach(type => {
            if (type && type.Status !== false) {
                const id = type.Items_types_id || type._id || type.id;
                const name = type.Name || type.name;
                if (name) {
                    const key = String(name).trim().toLowerCase();
                    const existing = categoryMap.get(key);
                    categoryMap.set(key, {
                        id: id || existing?.id || key,
                        name: String(name).trim(),
                        emozi: type.emozi || type.emoji || type.Emozi || existing?.emozi || ''
                    });
                }
            }
        });

        // Also incorporate any Category object found directly in items list
        const itemsList = Array.isArray(rawItemsData) ? rawItemsData : [];
        itemsList.forEach(item => {
            if (item?.Category && typeof item.Category === 'object') {
                const cat = item.Category;
                const id = cat.Items_types_id || cat._id || cat.id;
                const name = cat.Name || cat.name;
                if (name) {
                    const key = String(name).trim().toLowerCase();
                    const existing = categoryMap.get(key);
                    categoryMap.set(key, {
                        id: id || existing?.id || key,
                        name: String(name).trim(),
                        // Use emoji from inside category object
                        emozi: cat.emozi || cat.emoji || cat.Emozi || existing?.emozi || ''
                    });
                }
            }
        });

        return Array.from(categoryMap.values());
    }, [rawItemTypesData, rawItemsData, t]);

    // Filter items client-side by category and global search query
    const displayedItems = useMemo(() => {
        let items = Array.isArray(rawItemsData) ? rawItemsData : [];
        if (selectedCategoryId && selectedCategoryId !== 'all') {
            const selectedCatObj = categories.find(c => String(c.id) === String(selectedCategoryId));
            const selectedName = selectedCatObj?.name?.toLowerCase();

            items = items.filter(item => {
                // Direct ID match
                if (String(item.Items_types_id) === String(selectedCategoryId)) return true;
                if (String(item.Category?.Items_types_id) === String(selectedCategoryId)) return true;
                if (String(item.Category?._id) === String(selectedCategoryId)) return true;

                // Name match
                if (selectedName) {
                    const itemCatName = (item.Category?.Name || item.Category?.name || '').toLowerCase();
                    if (itemCatName && itemCatName === selectedName) return true;
                    const itemTitle = (item.Title || item['item-name'] || item.item_name || '').toLowerCase();
                    if (itemTitle.includes(selectedName)) return true;
                }

                return false;
            });
        }

        if (searchQuery && searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            items = items.filter(item => {
                const title = (item.Title || item['item-name'] || item.item_name || '').toLowerCase();
                const desc = (item.description || item.Description || '').toLowerCase();
                const cat = (item.Category?.Name || item.Category?.name || '').toLowerCase();
                return title.includes(q) || desc.includes(q) || cat.includes(q);
            });
        }

        return items;
    }, [rawItemsData, selectedCategoryId, categories, searchQuery]);

    // Item click handler
    const handleSelectItem = (item) => {
        setSelectedItem(item);
        if (panelMode === 'ORDER_SUMMARY') {
            // Active order mode: open Addons modal to customize and add
            setSelectedDrinkForModal(item);
            setIsAddonsModalOpen(true);
        } else if (panelMode === 'IDLE') {
            setPanelMode('FLOOR_MAP');
        }
    };

    // Save customized item to cart
    const handleSaveAddon = (customizedItem) => {
        setCartItems(prev => [
            ...prev,
            {
                ...customizedItem,
                quantity: customizedItem.quantity || 1,
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            }
        ]);
    };

    // Remove item from cart
    const handleRemoveCartItem = (id) => {
        setCartItems(prev => prev.filter(it => it.id !== id));
    };

    // Update quantity of cart item
    const handleUpdateCartItemQuantity = (id, newQty) => {
        if (newQty <= 0) {
            handleRemoveCartItem(id);
            return;
        }
        setCartItems(prev => prev.map(it => it.id === id ? { ...it, quantity: newQty } : it));
    };

    // Start Order transition
    const handleStartOrder = () => {
        setPanelMode('ORDER_SUMMARY');
    };

    // Calculate totals for active order
    const itemsTotal = useMemo(() => cartItems.reduce((acc, it) => acc + (Number(it.price) || 0) * (it.quantity || 1), 0), [cartItems]);
    const taxRate = 0.06;
    const taxAmount = Math.round(itemsTotal * taxRate);
    const serviceCharge = cartItems.length > 0 ? 200 : 0;
    const grandTotal = itemsTotal + taxAmount + serviceCharge;

    const handlePaymentSuccess = () => {
        setCartItems([]);
        setPanelMode('IDLE');
        setIsPaymentModalOpen(false);
    };

    return (
        <div className="bg-[#FAFAFA] min-h-screen flex flex-col font-manrope">
            <BarHeader />
            <div className="flex px-8 pb-8 gap-6 h-[calc(100vh-100px)]">
                <BarLeftPanel 
                    items={displayedItems} 
                    loading={isItemsLoading} 
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onSelectCategory={setSelectedCategoryId}
                    onSelectItem={handleSelectItem}
                    currency={currency}
                />
                <BarRightPanel 
                    mode={panelMode}
                    onOpenFloorMap={() => setPanelMode('FLOOR_MAP')}
                    selectedPersons={selectedPersons}
                    onChangePersons={setSelectedPersons}
                    selectedFloor={selectedFloor}
                    onSelectFloor={setSelectedFloor}
                    selectedTable={selectedTable}
                    onStartOrder={handleStartOrder}
                    cartItems={cartItems}
                    onRemoveCartItem={handleRemoveCartItem}
                    onSelectPaymentOption={() => {
                        setIsPaymentModalOpen(true);
                    }}
                    currency={currency}
                />
            </div>

            {/* Drink Addons Customization Modal */}
            <BarAddonsModal 
                isOpen={isAddonsModalOpen}
                onClose={() => setIsAddonsModalOpen(false)}
                item={selectedDrinkForModal}
                tableId={selectedTable}
                onSave={handleSaveAddon}
                currency={currency}
            />

            {/* Bar Order Summary & Payment Flow Modal (Figma flow) */}
            <BarOrderPaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateCartItemQuantity}
                onRemoveItem={handleRemoveCartItem}
                selectedTable={selectedTable}
                selectedFloor={selectedFloor}
                selectedPersons={selectedPersons}
                currency={currency}
                taxRate={taxRate}
                restaurantId={restaurantData?.Store_id || restaurantData?.id || 18}
                onPaymentSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default BarManagement;


