import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MenuItemForm from '../Settings/MenuItems/MenuItemForm';
import AddVariantModal from '../Settings/MenuItems/AddVariantModal';
import AddAddonModal from '../Settings/MenuItems/AddAddonModal';
import { useMenuItems } from '../../hooks/queries/useMenuItems';
import { useVariants } from '../../hooks/queries/useVariants';
import { useAddons } from '../../hooks/queries/useAddons';
import { useCategories } from '../../hooks/queries/useCategories';
import { useTaxSetup } from '../../hooks/queries/useTaxSetup';
import { POS_KEYS } from '../../utils/queryKeys';

const CreateMenuItem = () => {
    const { t } = useTranslation('settings');
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine return destination (e.g. /dashboard/pos or /dashboard/menuitems)
    const returnUrl = location.state?.from || '/dashboard/menuitems';

    // Form States
    const [formData, setFormData] = useState({
        itemName: '',
        itemCode: '',
        itemSize: 'Medium',
        itemPrice: '',
        price: '',
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
        Status: true,
        trackStock: true
    });

    const [selectedVariants, setSelectedVariants] = useState([]);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [showVariants, setShowVariants] = useState(false);
    const [showAddons, setShowAddons] = useState(false);
    const [isSavingItem, setIsSavingItem] = useState(false);

    // Modal States
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [showAddonModal, setShowAddonModal] = useState(false);
    const [newVariant, setNewVariant] = useState({ name: '', price: '' });
    const [newAddon, setNewAddon] = useState({ name: '', price: '' });
    const [isCreatingVariant, setIsCreatingVariant] = useState(false);
    const [isCreatingAddon, setIsCreatingAddon] = useState(false);

    // Hooks
    const { createMenuItem } = useMenuItems();
    const { getVariants, createVariant, mapVariantToItem } = useVariants();
    const { getAddons, createAddon, mapAddonToItem } = useAddons();
    const { getCategories } = useCategories();
    const { data: taxData = [] } = useTaxSetup();

    const availableVariants = getVariants.data || [];
    const availableAddons = getAddons.data || [];
    const availableCategories = getCategories.data || [];

    const handleSave = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!formData.itemName || !formData.itemName.trim()) {
            return toast.error(t('menuItems.messages.titleRequired', 'Title is required'));
        }
        if (!formData.itemPrice && !formData.price) {
            return toast.error(t('menuItems.messages.priceRequired', 'Price is required'));
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

            const payload = {
                Items_types_id: catId,
                Emozi: formData.emozi || '🍕',
                image: formData.image || 'https://example.com/default.jpg',
                Title: formData.itemName.trim(),
                Name: formData.itemName.trim(),
                'item-name': formData.itemName.trim(),
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
                Status: formData.Status !== false
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
                payload.Tax_id = resolvedTaxId;
            }

            const res = await createMenuItem.mutateAsync(payload);
            const createdItemId = res?.Items_id || res?.id || res?.data?.Items_id || res?.data?.id;

            // Map selected variants and addons to the newly created dish
            if (createdItemId) {
                try {
                    const mappingPromises = [];
                    for (const variantId of selectedVariants) {
                        mappingPromises.push(
                            mapVariantToItem.mutateAsync({ item_Variants_id: variantId, item_id: createdItemId, Status: true })
                                .catch(err => console.error('Error mapping variant:', err))
                        );
                    }
                    for (const addonId of selectedAddons) {
                        mappingPromises.push(
                            mapAddonToItem.mutateAsync({ item_Addons_id: addonId, item_id: createdItemId, Status: true })
                                .catch(err => console.error('Error mapping addon:', err))
                        );
                    }
                    if (mappingPromises.length > 0) {
                        await Promise.allSettled(mappingPromises);
                    }
                } catch (mappingErr) {
                    console.error('Error mapping variants/addons to new item:', mappingErr);
                }
            }

            // Invalidate caches across the dashboard so POS and Menu update instantly
            await Promise.allSettled([
                queryClient.invalidateQueries({ queryKey: [POS_KEYS.POS_ITEMS] }),
                queryClient.invalidateQueries({ queryKey: ['pos-items'] }),
                queryClient.invalidateQueries({ queryKey: ['MENU_ITEMS'] }),
                queryClient.invalidateQueries({ queryKey: ['CATEGORIES'] }),
                queryClient.invalidateQueries({ queryKey: ['categories'] }),
                queryClient.refetchQueries({ queryKey: [POS_KEYS.POS_ITEMS] })
            ]);

            toast.success(t('menuItems.messages.dishCreatedSuccess', 'Dish created successfully!'));
            navigate(returnUrl);
        } catch (error) {
            console.error('Failed to create item:', error);
            toast.error(error.message || t('menuItems.messages.dishCreatedError', 'Failed to create dish'));
        } finally {
            setIsSavingItem(false);
        }
    };

    const handleCreateVariant = () => {
        if (!newVariant.name || !newVariant.price) {
            toast.error(t('menuItems.messages.fillVariantFields', 'Please fill all variant fields'));
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
                const varId = data?.item_Variants_id || data?.id;
                if (varId) {
                    setSelectedVariants(prev => [...prev, varId]);
                }
            },
            onSettled: () => setIsCreatingVariant(false)
        });
    };

    const handleCreateAddon = () => {
        if (!newAddon.name || !newAddon.price) {
            toast.error(t('menuItems.messages.fillAddonFields', 'Please fill all addon fields'));
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
                const addId = data?.item_Addons_id || data?.id;
                if (addId) {
                    setSelectedAddons(prev => [...prev, addId]);
                }
            },
            onSettled: () => setIsCreatingAddon(false)
        });
    };

    const handleClose = () => {
        navigate(returnUrl);
    };

    return (
        <div className="bg-transparent min-h-screen pb-20 font-poppins px-4 sm:px-6">
            <MenuItemForm 
                formData={formData}
                setFormData={setFormData}
                isLoading={isSavingItem}
                availableCategories={availableCategories}
                availableVariants={availableVariants}
                availableAddons={availableAddons}
                selectedVariants={selectedVariants}
                selectedAddons={selectedAddons}
                showVariants={showVariants}
                setShowVariants={setShowVariants}
                showAddons={showAddons}
                setShowAddons={setShowAddons}
                setShowVariantModal={setShowVariantModal}
                setShowAddonModal={setShowAddonModal}
                handleToggleVariant={(id) => setSelectedVariants(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id])}
                handleToggleAddon={(id) => setSelectedAddons(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id])}
                handleSave={handleSave}
                onBack={handleClose}
            />

            <AddVariantModal 
                isOpen={showVariantModal}
                onClose={() => setShowVariantModal(false)}
                newVariant={newVariant}
                setNewVariant={setNewVariant}
                onSave={handleCreateVariant}
                isLoading={isCreatingVariant}
            />

            <AddAddonModal 
                isOpen={showAddonModal}
                onClose={() => setShowAddonModal(false)}
                newAddon={newAddon}
                setNewAddon={setNewAddon}
                onSave={handleCreateAddon}
                isLoading={isCreatingAddon}
            />
        </div>
    );
};

export default CreateMenuItem;
