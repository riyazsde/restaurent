import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useTranslatedToast from '../../hooks/useTranslatedToast';
import CategoriesView from './CategoriesView';
import { MenuItemCard, AddVariantModal, AddAddonModal, StatusToggleModal, MenuItemForm } from './MenuItems';
import MenuItemSkeleton from './MenuItems/MenuItemSkeleton';
import ConfirmDialog from '../common/ConfirmDialog';
import { useMenuItems, useGenerateMenuQrMutation } from '../../hooks/queries/useMenuItems';
import { useCategories } from '../../hooks/queries/useCategories';
import { useVariants } from '../../hooks/queries/useVariants';
import { useAddons } from '../../hooks/queries/useAddons';
import { useTaxSetup } from '../../hooks/queries/useTaxSetup';
import MenuQRModal from './MenuItems/MenuQRModal';
import GradientOutlineButton from '../common/GradientOutlineButton';
import useSearchStore from '../../store/searchStore';

const MenuItemsTab = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('settings');
    const toast = useTranslatedToast();
    const { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } = useMenuItems();
    const { getCategories } = useCategories();
    const { getVariants, createVariant, deleteVariant, mapVariantToItem, getMappedVariantsMutation } = useVariants();
    const { getAddons, createAddon, deleteAddon, mapAddonToItem, getMappedAddonsMutation } = useAddons();
    const generateMenuQrMutation = useGenerateMenuQrMutation();
    const isGeneratingQR = generateMenuQrMutation.isPending;
    const { data: taxData = [] } = useTaxSetup();

    const { data: menuItems = [], isLoading: isItemsLoading } = getMenuItems;
    const { searchQuery, setSearchPlaceholder } = useSearchStore();

    useEffect(() => {
        setSearchPlaceholder(t('search.menuItems', 'Search menu items...'));
        return () => setSearchPlaceholder('');
    }, [setSearchPlaceholder, t]);

    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'hidden'
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

    const displayedMenuItems = React.useMemo(() => {
        if (!Array.isArray(menuItems)) return [];
        let items = menuItems;

        if (statusFilter === 'active') {
            items = items.filter(item => item.Status !== false);
        } else if (statusFilter === 'hidden') {
            items = items.filter(item => item.Status === false);
        }

        if (selectedCategoryFilter !== 'all') {
            items = items.filter(item => {
                const itemCatId = typeof item.Items_types_id === 'object' && item.Items_types_id !== null
                    ? (item.Items_types_id.Items_types_id || item.Items_types_id.id)
                    : item.Items_types_id;
                return String(itemCatId) === String(selectedCategoryFilter);
            });
        }

        if (!searchQuery || !searchQuery.trim()) return items;
        const q = searchQuery.toLowerCase().trim();
        return items.filter(item => {
            const name = (item.item_name || item['item-name'] || item.Title || item.name || '').toLowerCase();
            const code = (item.item_code || item['item-code'] || '').toLowerCase();
            const desc = (item.details || item.Details || item.description || item.Item_description || '').toLowerCase();
            return name.includes(q) || code.includes(q) || desc.includes(q);
        });
    }, [menuItems, statusFilter, selectedCategoryFilter, searchQuery]);

    const { data: availableCategories = [] } = getCategories;
    const { data: availableVariants = [] } = getVariants;
    const { data: availableAddons = [] } = getAddons;
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    const [showVariants, setShowVariants] = useState(false);
    const [showAddons, setShowAddons] = useState(false);
    const [selectedVariants, setSelectedVariants] = useState([]);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [isSavingItem, setIsSavingItem] = useState(false);
    const [isCreatingVariant, setIsCreatingVariant] = useState(false);
    const [isCreatingAddon, setIsCreatingAddon] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [menuQrUrl, setMenuQrUrl] = useState(`${window.location.origin}/menu`);

    const handleGenerateQR = async () => {
        if (generateMenuQrMutation.isPending) return;
        try {
            const res = await generateMenuQrMutation.mutateAsync();
            const qrUrl = res?.data?.qr_code || res?.data?.qr || res?.data?.url || (typeof res?.data === 'string' ? res.data : `${window.location.origin}/menu`);
            setMenuQrUrl(qrUrl);
            setShowQRModal(true);
        } catch (err) {
            console.warn('Error generating QR via API:', err);
            setMenuQrUrl(`${window.location.origin}/menu`);
            setShowQRModal(true);
        }
    };
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showStatusToggle, setShowStatusToggle] = useState(false);
    const [itemToToggle, setItemToToggle] = useState(null);
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [showAddonModal, setShowAddonModal] = useState(false);
    const [newVariant, setNewVariant] = useState({ name: '', price: '' });
    const [newAddon, setNewAddon] = useState({ name: '', price: '' });
    const [isLoadingMappedItems, setIsLoadingMappedItems] = useState(false);
    const [originallyMappedVariants, setOriginallyMappedVariants] = useState([]);
    const [originallyMappedAddons, setOriginallyMappedAddons] = useState([]);

    const [formData, setFormData] = useState({
        itemName: '',
        itemCode: '',
        itemSize: 'Medium',
        itemPrice: '',
        price: '',
        isPriceCustom: false,
        itemQuantity: 1,
        itemStockQuantity: '',
        currentStock: '',
        lowStockAlert: '',
        details: '',
        itemsTypesId: '',
        taxId: 'none',
        emozi: '🍕',
        image: '',
        allergens: [],
        dietaryTags: [],
        status: true,
        Status: true,
        trackStock: true
    });

    // No useEffect needed anymore since React Query handles fetching


    const handleToggleVariant = (variantId) => {
        setSelectedVariants(prev =>
            prev.includes(variantId)
                ? prev.filter(id => id !== variantId)
                : [...prev, variantId]
        );
    };

    const handleToggleAddon = (addonId) => {
        setSelectedAddons(prev =>
            prev.includes(addonId)
                ? prev.filter(id => id !== addonId)
                : [...prev, addonId]
        );
    };

    const handleCreateVariant = () => {
        if (!newVariant.name || !newVariant.price) {
            toast.error(t('menuItems.messages.fillVariantFields'));
            return;
        }

        setIsCreatingVariant(true);
        createVariant.mutate({
            Variants: newVariant.name,
            prices: parseFloat(newVariant.price),
            Status: true
        }, {
            onSuccess: (data) => {
                setNewVariant({ name: '', price: '' });
                setShowVariantModal(false);
                if (data?.item_Variants_id) {
                    setSelectedVariants(prev => [...prev, data.item_Variants_id]);
                }
            },
            onSettled: () => setIsCreatingVariant(false)
        });
    };

    const handleCreateAddon = () => {
        if (!newAddon.name || !newAddon.price) {
            toast.error(t('menuItems.messages.fillAddonFields'));
            return;
        }

        setIsCreatingAddon(true);
        createAddon.mutate({
            Addons: newAddon.name,
            prices: parseFloat(newAddon.price),
            Status: true
        }, {
            onSuccess: (data) => {
                setNewAddon({ name: '', price: '' });
                setShowAddonModal(false);
                if (data?.item_Addons_id) {
                    setSelectedAddons(prev => [...prev, data.item_Addons_id]);
                }
            },
            onSettled: () => setIsCreatingAddon(false)
        });
    };

    const handleDeleteVariant = (variantId) => {
        deleteVariant.mutate(variantId, {
            onSuccess: () => {
                setSelectedVariants(prev => prev.filter(id => id !== variantId));
            }
        });
    };

    const handleDeleteAddon = (addonId) => {
        deleteAddon.mutate(addonId, {
            onSuccess: () => {
                setSelectedAddons(prev => prev.filter(id => id !== addonId));
            }
        });
    };

    const resetForm = () => {
        setFormData({
            itemName: '',
            itemCode: '',
            itemSize: 'Medium',
            itemPrice: '',
            price: '',
            isPriceCustom: false,
            itemQuantity: 1,
            itemStockQuantity: '',
            currentStock: '',
            lowStockAlert: '',
            details: '',
            itemsTypesId: '',
            taxId: 'none',
            emozi: '🍕',
            image: '',
            allergens: [],
            dietaryTags: [],
            status: true,
            Status: true,
            trackStock: true
        });
        setSelectedVariants([]);
        setSelectedAddons([]);
        setOriginallyMappedVariants([]);
        setOriginallyMappedAddons([]);
        setEditingItem(null);
        setIsSavingItem(false);
    };

    const handleEdit = (item) => {
        // Set form data and open form immediately
        setEditingItem(item);
        const rawCatId = item.Items_types_id?.Items_types_id || item.Items_types_id || item.Category?.Items_types_id || '';
        const matchingCat = availableCategories.find(c => Number(c.Items_types_id || c.id) === Number(rawCatId));
        const defaultCat = availableCategories.find(c => c.Status !== false) || availableCategories[0];
        const validCatId = matchingCat ? String(matchingCat.Items_types_id || matchingCat.id) : (defaultCat ? String(defaultCat.Items_types_id || defaultCat.id) : '');

        const itemP = (item['item-price'] ?? item.Price ?? '').toString();
        const finalP = (item.Price ?? item['item-price'] ?? '').toString();
        const stock = (item.currentStock ?? item['item-stock-quantity'] ?? 0).toString();

        setFormData({
            itemName: item['item-name'] || item.Title || '',
            itemCode: item['item-code'] || '',
            itemSize: item['item-size'] || 'Medium',
            itemPrice: itemP,
            price: finalP,
            isPriceCustom: Boolean(finalP && finalP !== itemP),
            itemQuantity: (item['item-quantity'] ?? 1).toString(),
            itemStockQuantity: stock,
            currentStock: stock,
            lowStockAlert: (item.lowStockAlert ?? 0).toString(),
            trackStock: item.trackStock !== false,
            details: item.Details || item.Description || item.Item_description || '',
            itemsTypesId: validCatId,
            taxId: (() => {
                const rawTax = item.Tax_id || item.tax_id || item.Tax_setup_id || item.Tax?.Tax_setup_id || item.Tax?.id;
                if (typeof rawTax === 'object' && rawTax !== null) {
                    return String(rawTax.Tax_setup_id || rawTax.Tax_id || rawTax.id || 'none');
                }
                return rawTax ? String(rawTax) : 'none';
            })(),
            emozi: item.Emozi || '🍕',
            image: item.image || '',
            allergens: Array.isArray(item.Allergens) ? item.Allergens : [],
            dietaryTags: Array.isArray(item.DietaryTags) ? item.DietaryTags : [],
            status: item.Status !== false,
            Status: item.Status !== false
        });
        
        // Reset selections and show form immediately
        setSelectedVariants([]);
        setSelectedAddons([]);
        setShowCreateForm(true);
        
        // Fetch mapped variants and addons in background
        fetchMappedItems(item.Items_id || item.id);
    };

    const fetchMappedItems = async (itemId) => {
        setIsLoadingMappedItems(true);
        
        try {
            // Fetch both in parallel but handle each independently
            const [variantsRes, addonsRes] = await Promise.allSettled([
                getMappedVariantsMutation.mutateAsync(itemId),
                getMappedAddonsMutation.mutateAsync(itemId)
            ]);
            
            // Handle variants response
            if (variantsRes.status === 'fulfilled' && variantsRes.value?.success && variantsRes.value?.data) {
                const mappedVariantIds = variantsRes.value.data
                    .map(v => v.item_Variants_id?.item_Variants_id)
                    .filter(id => id !== undefined && id !== null);
                
                console.log('Originally mapped variant IDs:', mappedVariantIds);
                setSelectedVariants(mappedVariantIds);
                setOriginallyMappedVariants(mappedVariantIds); // Store original state
            } else {
                console.log('No variants mapped or error fetching variants');
                setSelectedVariants([]);
                setOriginallyMappedVariants([]);
            }
            
            // Handle addons response
            if (addonsRes.status === 'fulfilled' && addonsRes.value?.success && addonsRes.value?.data) {
                const mappedAddonIds = addonsRes.value.data
                    .map(a => a.item_Addons_id?.item_Addons_id)
                    .filter(id => id !== undefined && id !== null);
                
                console.log('Originally mapped addon IDs:', mappedAddonIds);
                setSelectedAddons(mappedAddonIds);
                setOriginallyMappedAddons(mappedAddonIds); // Store original state
            } else {
                console.log('No addons mapped or error fetching addons');
                setSelectedAddons([]);
                setOriginallyMappedAddons([]);
            }
        } catch (error) {
            console.error('Unexpected error fetching mapped items:', error);
            setSelectedVariants([]);
            setSelectedAddons([]);
            setOriginallyMappedVariants([]);
            setOriginallyMappedAddons([]);
        } finally {
            setIsLoadingMappedItems(false);
        }
    };

    const handleToggleStatus = (item) => {
        setItemToToggle(item);
        setShowStatusToggle(true);
    };

    const confirmToggleStatus = async () => {
        if (!itemToToggle) return;

        setIsTogglingStatus(true);
        try {
            const itemId = itemToToggle.Items_id || itemToToggle.id || itemToToggle._id;
            const newStatus = !itemToToggle.Status;

            // Only send id and toggled Status per backend API contract (avoids invalid category 400 on orphaned items)
            const updateData = {
                id: itemId,
                Status: newStatus
            };

            updateMenuItem.mutate(updateData, {
                onSuccess: () => {
                    toast.success(t(`menuItems.messages.item${newStatus ? 'Activated' : 'Deactivated'}`));
                    setShowStatusToggle(false);
                    setItemToToggle(null);
                },
                onError: (error) => {
                    toast.error(error.message || t('menuItems.messages.statusUpdateError'));
                },
                onSettled: () => {
                    setIsTogglingStatus(false);
                }
            });
        } catch (error) {
            toast.error(t('menuItems.messages.statusUpdateError'));
            setIsTogglingStatus(false);
        }
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;

        const itemId = itemToDelete.Items_id || itemToDelete.id;
        deleteMenuItem.mutate(itemId, {
            onSuccess: () => {
                setShowDeleteConfirm(false);
                setItemToDelete(null);
            },
            onError: () => {
                setShowDeleteConfirm(false);
                setItemToDelete(null);
            }
        });
    };

    const handleSave = async () => {
        if (!formData.itemName || !formData.itemPrice) {
            toast.error(t('menuItems.messages.fillRequiredFields', 'Please fill all required fields'));
            return;
        }

        setIsSavingItem(true);
        try {
            let catId = parseInt(formData.itemsTypesId, 10);
            let matchedCat = availableCategories.find(c => Number(c.Items_types_id || c.id) === catId);
            if (!matchedCat && availableCategories.length > 0) {
                matchedCat = availableCategories.find(c => c.Status !== false) || availableCategories[0];
                catId = Number(matchedCat.Items_types_id || matchedCat.id);
            }
            if (!catId && availableCategories.length > 0) {
                catId = Number(availableCategories[0]?.Items_types_id || availableCategories[0]?.id);
            }

            const finalPrice = parseFloat(formData.price || formData.itemPrice) || 0;
            const netPrice = parseFloat(formData.itemPrice || formData.price) || 0;
            const stockQty = parseInt(formData.currentStock || formData.itemStockQuantity, 10) || 0;

            const itemData = {
                Items_types_id: catId,
                Emozi: formData.emozi || '🍕',
                image: formData.image || 'https://example.com/default.jpg',
                Title: formData.itemName,
                Name: formData.itemName,
                'item-name': formData.itemName,
                'item-code': formData.itemCode || `ITEM-${Date.now().toString().slice(-6)}`,
                'item-size': formData.itemSize || 'Medium',
                Price: finalPrice,
                Net_Price: netPrice,
                'item-price': finalPrice,
                'item-quantity': parseInt(formData.itemQuantity, 10) || 1,
                'item-stock-quantity': stockQty,
                currentStock: stockQty,
                lowStockAlert: parseInt(formData.lowStockAlert, 10) || 0,
                trackStock: Boolean(formData.trackStock),
                Item_description: formData.details || '',
                Description: formData.details || '',
                Details: formData.details || '',
                Allergens: Array.isArray(formData.allergens) ? formData.allergens : [],
                DietaryTags: Array.isArray(formData.dietaryTags) ? formData.dietaryTags : [],
                Variants: selectedVariants,
                Addons: selectedAddons,
                Status: formData.status !== false && formData.Status !== false
            };

            let resolvedTaxId = null;
            const taxIdVal = formData.taxId;
            if (taxIdVal && taxIdVal !== 'none') {
                if (typeof taxIdVal === 'number' && taxIdVal > 0) {
                    resolvedTaxId = taxIdVal;
                } else if (typeof taxIdVal === 'string') {
                    const trimmed = taxIdVal.trim();
                    if (/^\d+$/.test(trimmed)) {
                        resolvedTaxId = parseInt(trimmed, 10);
                    } else if (Array.isArray(taxData) && taxData.length > 0) {
                        const matched = taxData.find(t => {
                            const id = t.Tax_setup_id ?? t.Tax_id ?? t.tax_id ?? t.id;
                            const name = t.title || t.Tax_name || t.tax_name || t.name || 'Tax';
                            const rate = t.rate ?? t.Rate ?? t.percentage ?? 0;
                            return String(id) === trimmed || name.toLowerCase() === trimmed.toLowerCase() || `${name} (${rate}%)`.toLowerCase() === trimmed.toLowerCase();
                        });
                        if (matched) {
                            const matchId = matched.Tax_setup_id ?? matched.Tax_id ?? matched.tax_id ?? matched.id;
                            if (matchId && /^\d+$/.test(String(matchId))) {
                                resolvedTaxId = parseInt(matchId, 10);
                            }
                        }
                    }
                }
            }

            if (resolvedTaxId !== null) {
                itemData.Tax_id = resolvedTaxId;
            }

            let itemId = editingItem?.Items_id || editingItem?.id;

            if (editingItem) {
                await updateMenuItem.mutateAsync({ id: itemId, Items_id: itemId, ...itemData });
            } else {
                const res = await createMenuItem.mutateAsync(itemData);
                itemId = res?.Items_id || res?.id || res?.data?.Items_id || res?.data?.id;
            }

            // Map variants and addons if needed concurrently
            if (itemId) {
                try {
                    const newlySelectedVariants = editingItem 
                        ? selectedVariants.filter(id => !originallyMappedVariants.includes(id))
                        : selectedVariants;
                    const newlySelectedAddons = editingItem 
                        ? selectedAddons.filter(id => !originallyMappedAddons.includes(id))
                        : selectedAddons;

                    const mappingPromises = [];
                    for (const variantId of newlySelectedVariants) {
                        mappingPromises.push(
                            mapVariantToItem.mutateAsync({ item_Variants_id: variantId, item_id: itemId, Status: true })
                                .catch(err => console.error('Error mapping variant:', err))
                        );
                    }
                    for (const addonId of newlySelectedAddons) {
                        mappingPromises.push(
                            mapAddonToItem.mutateAsync({ item_Addons_id: addonId, item_id: itemId, Status: true })
                                .catch(err => console.error('Error mapping addon:', err))
                        );
                    }

                    if (mappingPromises.length > 0) {
                        await Promise.allSettled(mappingPromises);
                    }
                } catch (mappingErr) {
                    console.error('Error mapping variants/addons:', mappingErr);
                }
            }

            setShowCreateForm(false);
            resetForm();
        } catch (error) {
            console.error('Error saving menu item:', error);
            toast.error(error?.message || t(`menuItems.messages.item${editingItem ? 'Update' : 'Create'}Error`, 'Failed to save menu item'));
        } finally {
            setIsSavingItem(false);
        }
    };

    if (showCategories) {
        return <CategoriesView onBack={() => setShowCategories(false)} />;
    }

    if (showCreateForm) {
        return (
            <>
                <MenuItemForm
                    formData={formData}
                    setFormData={setFormData}
                    editingItem={editingItem}
                    isLoading={isSavingItem}
                    isLoadingMappedItems={isLoadingMappedItems}
                    showVariants={showVariants}
                    setShowVariants={setShowVariants}
                    showAddons={showAddons}
                    setShowAddons={setShowAddons}
                    availableVariants={availableVariants}
                    availableAddons={availableAddons}
                    availableCategories={availableCategories}
                    selectedVariants={selectedVariants}
                    selectedAddons={selectedAddons}
                    handleToggleVariant={handleToggleVariant}
                    handleToggleAddon={handleToggleAddon}
                    handleDeleteVariant={handleDeleteVariant}
                    handleDeleteAddon={handleDeleteAddon}
                    setShowVariantModal={setShowVariantModal}
                    setShowAddonModal={setShowAddonModal}
                    handleSave={handleSave}
                    onBack={() => {
                        setShowCreateForm(false);
                        resetForm();
                    }}
                />

                <AddVariantModal
                    isOpen={showVariantModal}
                    onClose={() => {
                        setShowVariantModal(false);
                        setNewVariant({ name: '', price: '' });
                    }}
                    newVariant={newVariant}
                    setNewVariant={setNewVariant}
                    onSave={handleCreateVariant}
                    isLoading={isCreatingVariant}
                />

                <AddAddonModal
                    isOpen={showAddonModal}
                    onClose={() => {
                        setShowAddonModal(false);
                        setNewAddon({ name: '', price: '' });
                    }}
                    newAddon={newAddon}
                    setNewAddon={setNewAddon}
                    onSave={handleCreateAddon}
                    isLoading={isCreatingAddon}
                />
            </>
        );
    }

    return (
        <div className="mx-auto p-6 md:p-8 font-poppins w-full">
            <svg className="w-0 h-0 absolute" aria-hidden="true">
                <defs>
                    <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6A1B9A" />
                        <stop offset="100%" stopColor="#D32F2F" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 w-full">
                {/* Left: Title + New + Categories */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-black leading-none m-0 tracking-tight">
                        {t('menuItems.title', 'Menu')}
                    </h2>
                    <GradientOutlineButton 
                        onClick={() => navigate('/dashboard/menuitems/create', { state: { from: '/dashboard/menuitems' } })}
                        className="px-5 py-2 rounded-[12px] font-medium text-sm md:text-base cursor-pointer"
                    >
                        + {t('menuItems.new', 'New')}
                    </GradientOutlineButton>
                    <GradientOutlineButton 
                        onClick={() => setShowCategories(true)}
                        className="px-5 py-2 rounded-[12px] font-medium text-sm md:text-base cursor-pointer"
                    >
                        {t('menuItems.categories', 'Categories')}
                    </GradientOutlineButton>
                </div>

                {/* Right: Status Filter + Category Filter + Generate QR Button */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full lg:w-auto">
                    {/* Status filter (Sliders) */}
                    <div className="relative">
                        <button 
                            type="button"
                            onClick={() => {
                                setShowSettingsDropdown(!showSettingsDropdown);
                                setShowFilterDropdown(false);
                            }}
                            title={t('menuItems.status', 'Status')}
                            className={`relative p-[1.5px] rounded-[12px] overflow-hidden group w-[44px] h-[44px] cursor-pointer transition-shadow ${
                                statusFilter !== 'all' ? 'ring-2 ring-[#6A1B9A]/50 shadow-sm' : ''
                            }`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] opacity-70 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-white rounded-[10.5px] h-full w-full flex items-center justify-center">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="url(#icon-gradient)">
                                    <path d="M3 6a1 1 0 011-1h10.1a2.5 2.5 0 014.8 0H20a1 1 0 110 2h-1.1a2.5 2.5 0 01-4.8 0H4a1 1 0 01-1-1z" />
                                    <path d="M3 12a1 1 0 011-1h1.1a2.5 2.5 0 014.8 0H20a1 1 0 110 2H8.9a2.5 2.5 0 01-4.8 0H4a1 1 0 01-1-1z" />
                                    <path d="M3 18a1 1 0 011-1h5.1a2.5 2.5 0 014.8 0H20a1 1 0 110 2h-6.1a2.5 2.5 0 01-4.8 0H4a1 1 0 01-1-1z" />
                                </svg>
                            </div>
                        </button>

                        {showSettingsDropdown && (
                            <>
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setShowSettingsDropdown(false)}
                                ></div>
                                <div className="absolute right-0 top-[calc(100%+8px)] w-[180px] bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 flex flex-col text-sm">
                                    <button 
                                        className={`text-left px-4 py-2 hover:bg-gray-50 font-medium transition-colors ${statusFilter === 'all' ? 'text-[#6A1B9A] font-semibold bg-purple-50/50' : 'text-gray-700'}`} 
                                        onClick={() => { setStatusFilter('all'); setShowSettingsDropdown(false); }}
                                    >
                                        {t('menuItems.all', 'All')}
                                    </button>
                                    <button 
                                        className={`text-left px-4 py-2 hover:bg-gray-50 font-medium transition-colors ${statusFilter === 'active' ? 'text-[#6A1B9A] font-semibold bg-purple-50/50' : 'text-gray-700'}`} 
                                        onClick={() => { setStatusFilter('active'); setShowSettingsDropdown(false); }}
                                    >
                                        {t('menuItems.active', 'Active')}
                                    </button>
                                    <button 
                                        className={`text-left px-4 py-2 hover:bg-gray-50 font-medium transition-colors ${statusFilter === 'hidden' ? 'text-[#6A1B9A] font-semibold bg-purple-50/50' : 'text-gray-700'}`} 
                                        onClick={() => { setStatusFilter('hidden'); setShowSettingsDropdown(false); }}
                                    >
                                        {t('menuItems.hidden', 'Hidden')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Category filter (Funnel) */}
                    <div className="relative">
                        <button 
                            type="button"
                            onClick={() => {
                                setShowFilterDropdown(!showFilterDropdown);
                                setShowSettingsDropdown(false);
                            }}
                            title={t('menuItems.category', 'Category')}
                            className={`relative p-[1.5px] rounded-[12px] overflow-hidden group w-[44px] h-[44px] cursor-pointer transition-shadow ${
                                selectedCategoryFilter !== 'all' ? 'ring-2 ring-[#6A1B9A]/50 shadow-sm' : ''
                            }`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] opacity-70 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-white rounded-[10.5px] h-full w-full flex items-center justify-center">
                                <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="url(#icon-gradient)">
                                    <path d="M2.5 4.5A1.5 1.5 0 014 3h16a1.5 1.5 0 011.5 1.5v.76c0 .4-.16.78-.44 1.06l-6.56 6.56v5.87c0 .5-.4 1.1-1.04 1.25l-2.5.63a1 1 0 01-1.22-.97v-6.78L3.44 6.32A1.5 1.5 0 013 5.26V4.5z" />
                                    <rect x="15" y="14" width="7" height="2" rx="1" />
                                    <rect x="17" y="18" width="5" height="2" rx="1" />
                                </svg>
                            </div>
                        </button>

                        {showFilterDropdown && (
                            <>
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setShowFilterDropdown(false)}
                                ></div>
                                <div className="absolute right-0 top-[calc(100%+8px)] w-[220px] max-h-64 overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 flex flex-col text-sm">
                                    <button 
                                        className={`text-left px-4 py-2 hover:bg-gray-50 font-medium transition-colors ${selectedCategoryFilter === 'all' ? 'text-[#6A1B9A] font-semibold bg-purple-50/50' : 'text-gray-700'}`} 
                                        onClick={() => { setSelectedCategoryFilter('all'); setShowFilterDropdown(false); }}
                                    >
                                        {t('menuItems.allCategories', 'All Categories')}
                                    </button>
                                    {availableCategories.map((cat) => {
                                        const catId = cat.Items_types_id || cat.id;
                                        const catName = cat['item-type-name'] || cat.title || cat.Name || cat.name || `Category ${catId}`;
                                        const isSelected = String(selectedCategoryFilter) === String(catId);
                                        return (
                                            <button 
                                                key={catId}
                                                className={`text-left px-4 py-2 hover:bg-gray-50 font-medium truncate transition-colors ${isSelected ? 'text-[#6A1B9A] font-semibold bg-purple-50/50' : 'text-gray-700'}`} 
                                                onClick={() => { setSelectedCategoryFilter(catId); setShowFilterDropdown(false); }}
                                            >
                                                {catName}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                    
                    {/* Generate QR Button */}
                    <button 
                        type="button"
                        onClick={handleGenerateQR}
                        disabled={isGeneratingQR}
                        className="flex items-center justify-center px-5 py-2.5 rounded-[12px] bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white font-medium hover:opacity-90 transition-opacity text-sm md:text-base disabled:opacity-70 w-full sm:w-auto shadow-sm cursor-pointer"
                    >
                        {isGeneratingQR ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('menuItems.generating', 'Generating...')}
                            </>
                        ) : (
                            t('menuItems.generateQr', 'Generate a QR Code to Access the Menu')
                        )}
                    </button>
                </div>
            </div>

            {isItemsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                    <MenuItemSkeleton />
                    <MenuItemSkeleton />
                    <MenuItemSkeleton />
                    <MenuItemSkeleton />
                    <MenuItemSkeleton />
                    <MenuItemSkeleton />
                </div>
            ) : displayedMenuItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                    {displayedMenuItems.map((item) => (
                        <MenuItemCard
                            key={item.Items_id || item.id}
                            item={item}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggleStatus={handleToggleStatus}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    {searchQuery ? t('common.noResults', 'No menu items found') : t('menuItems.noItems')}
                </div>
            )}

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setItemToDelete(null);
                }}
                onConfirm={confirmDelete}
            />

            <StatusToggleModal
                isOpen={showStatusToggle}
                onClose={() => {
                    setShowStatusToggle(false);
                    setItemToToggle(null);
                }}
                onConfirm={confirmToggleStatus}
                itemName={itemToToggle?.['item-name']}
                currentStatus={itemToToggle?.Status}
                isLoading={isTogglingStatus}
            />

            <MenuQRModal 
                isOpen={showQRModal} 
                onClose={() => setShowQRModal(false)}
                menuUrl={menuQrUrl}
            />
        </div>
    );
};

export default MenuItemsTab;
