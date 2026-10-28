import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { FiUpload, FiX } from 'react-icons/fi';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { toast } from 'react-toastify';
import { IMAGE_BASE_URL } from '../../../services/fileUploadService';
import { useUploadStoreImage } from '../../../hooks/queries/useStore';
import { useRestaurant } from '../../../hooks/queries/usePos';
import { useTaxSetup } from '../../../hooks/queries/useTaxSetup';
import { resolveCurrencySymbol } from '../../../utils/currencyUtils';

const MenuItemForm = ({
    formData,
    setFormData,
    editingItem,
    isLoading,
    isLoadingMappedItems,
    showVariants,
    setShowVariants,
    showAddons,
    setShowAddons,
    availableVariants,
    availableAddons,
    availableCategories = [],
    selectedVariants,
    selectedAddons,
    handleToggleVariant,
    handleToggleAddon,
    handleDeleteVariant,
    handleDeleteAddon,
    setShowVariantModal,
    setShowAddonModal,
    handleSave,
    onBack
}) => {
    const { t } = useTranslation('settings');
    const { data: restaurantData } = useRestaurant();
    const { data: taxData = [] } = useTaxSetup();
    const currencySymbol = resolveCurrencySymbol(restaurantData?.currency);
    const fileInputRef = useRef(null);
    const uploadImageMutation = useUploadStoreImage();
    const isUploading = uploadImageMutation.isPending;

    useEffect(() => {
        if (Array.isArray(availableCategories) && availableCategories.length > 0) {
            const hasValidSelection = availableCategories.some(c => String(c.Items_types_id || c.id) === String(formData.itemsTypesId));
            if (!hasValidSelection) {
                const defaultCat = availableCategories.find(c => c.Status !== false) || availableCategories[0];
                if (defaultCat) {
                    setFormData(prev => ({
                        ...prev,
                        itemsTypesId: String(defaultCat.Items_types_id || defaultCat.id)
                    }));
                }
            }
        }
    }, [availableCategories, formData.itemsTypesId, setFormData]);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        try {
            const response = await uploadImageMutation.mutateAsync(file);
            if (response && (response.success || response.data)) {
                const imgData = response.data || response;
                // Store only the tail part (serverfile) using functional update to preserve current form state
                setFormData(prev => ({
                    ...prev,
                    image: imgData.serverfile || imgData.filename || imgData
                }));
                toast.success('Image uploaded successfully');
            } else {
                toast.error('Failed to upload image');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to upload image');
            console.error('Upload error:', error);
        } finally {
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const getImageUrl = (imageTail) => {
        if (!imageTail) return '';
        if (imageTail.startsWith('http')) return imageTail;
        return `${IMAGE_BASE_URL}${imageTail}`;
    };

    return (
        <div className="max-w-4xl mx-auto font-poppins w-full pt-2 pb-12">
            {onBack && (
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onBack}
                            className="text-2xl md:text-[32px] font-bold text-black hover:opacity-80 transition-opacity cursor-pointer"
                        >
                            {t('menuItems.title', 'Menu')}
                        </button>
                        <span className="text-2xl font-semibold text-black">›</span>
                        <h2 className="text-2xl md:text-[32px] font-bold text-black">
                            {editingItem ? t('menuItems.editItem', 'Edit Dishes') : t('menuItems.createItem', 'Create Dishes')}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onBack}
                        className="p-2.5 rounded-full bg-gray-50 hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer shadow-xs"
                        title={t('common.close', 'Close')}
                    >
                        <FiX size={20} />
                    </button>
                </div>
            )}
            <div className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                    <label className="text-gray-500 font-medium text-lg">Title</label>
                    <div className="relative p-[1.5px] rounded-xl overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] opacity-70 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative bg-gradient-to-br from-[#fcf6fc] to-[#fdf2f2] rounded-[10.5px] px-5 py-3">
                            <input
                                type="text"
                                value={formData.itemName}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData(prev => ({ ...prev, itemName: val }));
                                }}
                                className="w-full bg-transparent text-black font-medium focus:outline-none"
                                placeholder="BBQ Chicken"
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-gray-500 font-medium text-lg">Description (Max Characters)</label>
                    <div className="relative p-[1.5px] rounded-xl overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] opacity-70 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative bg-gradient-to-br from-[#fcf6fc] to-[#fdf2f2] rounded-[10.5px] px-5 py-3">
                            <textarea
                                value={formData.details || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData(prev => ({ ...prev, details: val }));
                                }}
                                rows={4}
                                className="w-full bg-transparent text-black font-medium focus:outline-none resize-none leading-relaxed"
                                placeholder="A crispy, thin-crust pizza topped with homemade basil pesto..."
                            />
                        </div>
                    </div>
                </div>

                {/* Allergen & Dietary Information */}
                <div className="space-y-2">
                    <label className="text-gray-500 font-medium text-lg">Allergen & Dietary Information</label>
                    <div className="relative p-[1.5px] rounded-xl overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] opacity-70 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative bg-gradient-to-br from-[#fcf6fc] to-[#fdf2f2] rounded-[10.5px] px-5 py-4 space-y-4">
                            
                            <div className="flex items-center gap-4 flex-wrap">
                                <span className="text-black font-semibold min-w-[120px]">Allergens</span>
                                {['Milk', 'Nuts', 'Soya', 'Gluten', 'Egg'].map(allergen => (
                                    <button 
                                        key={allergen}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setFormData(prev => {
                                                const current = prev.allergens || [];
                                                const updated = current.includes(allergen) ? current.filter(a => a !== allergen) : [...current, allergen];
                                                return { ...prev, allergens: updated };
                                            });
                                        }}
                                        className={`px-4 py-1.5 rounded-md border text-sm font-medium transition-colors ${
                                            (formData.allergens || []).includes(allergen)
                                                ? 'bg-[#E1BEE7] border-[#AB47BC] text-[#4A148C]'
                                                : 'bg-transparent border-[#E1BEE7] text-[#8E24AA] hover:bg-[#F3E5F5]'
                                        }`}
                                    >
                                        {allergen}
                                    </button>
                                ))}
                                <button className="px-4 py-1.5 bg-white rounded-md text-gray-600 text-sm font-medium shadow-sm border border-gray-100 hover:bg-gray-50">+ Add</button>
                            </div>

                            <div className="flex items-center gap-4 flex-wrap">
                                <span className="text-black font-semibold min-w-[120px]">Dietary Tags</span>
                                {[
                                    { name: 'Non-Vegetarian', color: 'text-green-700 bg-green-100 border-green-300' },
                                    { name: 'High Protein', color: 'text-green-700 bg-green-100 border-green-300' },
                                    { name: 'Gluten Free', color: 'text-green-700 bg-green-100 border-green-300' },
                                    { name: 'Jain Friendly', color: 'text-green-700 bg-green-100 border-green-300' }
                                ].map(tag => (
                                    <button 
                                        key={tag.name}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setFormData(prev => {
                                                const current = prev.dietaryTags || [];
                                                const updated = current.includes(tag.name) ? current.filter(t => t !== tag.name) : [...current, tag.name];
                                                return { ...prev, dietaryTags: updated };
                                            });
                                        }}
                                        className={`px-4 py-1.5 rounded-md border text-sm font-medium transition-colors ${
                                            (formData.dietaryTags || []).includes(tag.name)
                                                ? tag.color
                                                : 'bg-transparent border-green-200 text-green-600 hover:bg-green-50'
                                        }`}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                                <button className="px-4 py-1.5 bg-white rounded-md text-gray-600 text-sm font-medium shadow-sm border border-gray-100 hover:bg-gray-50">+ Add</button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Availability & Stock */}
                <div className="space-y-2">
                    <label className="text-gray-500 font-medium text-lg">Availability & Stock</label>
                    <div className="relative p-[1.5px] rounded-xl overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] opacity-70 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative bg-gradient-to-br from-[#fcf6fc] to-[#fdf2f2] rounded-[10.5px] px-5 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
                                
                                <div className="space-y-2">
                                    <span className="text-black font-semibold block text-sm">Availability</span>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setFormData(prev => ({ ...prev, Status: !prev.Status }));
                                            }}
                                            className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.Status !== false ? 'bg-green-500' : 'bg-gray-300'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.Status !== false ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </button>
                                        <span className="text-sm text-gray-500">Available</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-black font-semibold block text-sm">Track Stock</span>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setFormData(prev => ({ ...prev, trackStock: !prev.trackStock }));
                                            }}
                                            className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.trackStock ? 'bg-green-500' : 'bg-gray-300'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.trackStock ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </button>
                                        <span className="text-sm text-gray-500">Yes</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-black font-semibold block text-sm">Current Stock</span>
                                    <input 
                                        type="number"
                                        value={formData.currentStock || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData(prev => ({ ...prev, currentStock: val }));
                                        }}
                                        className="w-full bg-white rounded-md px-3 py-1.5 text-sm border-none shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-200"
                                        placeholder="48"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <span className="text-black font-semibold block text-sm">Low Stock Alert</span>
                                    <input 
                                        type="number"
                                        value={formData.lowStockAlert || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData(prev => ({ ...prev, lowStockAlert: val }));
                                        }}
                                        className="w-full bg-white rounded-md px-3 py-1.5 text-sm border-none shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-200"
                                        placeholder="10"
                                    />
                                </div>

                            </div>
                        </div>
                    </div>
                </div>


                {/* Upload Image */}
                <div className="space-y-2">
                    <label className="text-gray-500 font-medium text-lg">Upload Image (Max 10MB)</label>
                    <div className="relative p-[1.5px] rounded-xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] opacity-70"></div>
                        <div className="relative bg-gradient-to-br from-[#fcf6fc] to-[#fdf2f2] rounded-[10.5px] py-8 flex flex-col sm:flex-row items-center justify-center gap-6">
                            
                            {formData.image ? (
                                <img
                                    src={getImageUrl(formData.image)}
                                    alt="Menu item"
                                    className="w-[88px] h-[88px] rounded-lg object-cover bg-[#E5E7EB] shadow-sm"
                                    onError={(e) => {
                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="88" height="88"%3E%3Crect width="88" height="88" fill="%23E2E6EC"/%3E%3C/svg%3E';
                                    }}
                                />
                            ) : (
                                <div className="w-[88px] h-[88px] bg-[#E5E7EB] rounded-lg flex items-center justify-center shadow-sm">
                                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    disabled={isUploading || isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading || isLoading}
                                    className="px-6 py-2.5 rounded-lg bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {isUploading ? 'Uploading...' : 'Choose File'}
                                </button>
                                <button
                                    type="button"
                                    className="px-6 py-2.5 rounded-lg bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white font-medium hover:opacity-90 transition-opacity"
                                >
                                    Take Photo
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Net Price & Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-gray-500 font-medium text-lg">Net Price</label>
                        <div className="relative p-[1.5px] rounded-xl overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] opacity-70 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-gradient-to-br from-[#fcf6fc] to-[#fdf2f2] rounded-[10.5px] px-5 py-3">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.itemPrice ?? ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            itemPrice: val,
                                            price: prev.isPriceCustom ? prev.price : val
                                        }));
                                    }}
                                    className="w-full bg-transparent text-black font-medium focus:outline-none"
                                    placeholder={`1000 ${currencySymbol}`}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-gray-500 font-medium text-lg">Price</label>
                        <div className="relative p-[1.5px] rounded-xl overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] opacity-70 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-gradient-to-br from-[#fcf6fc] to-[#fdf2f2] rounded-[10.5px] px-5 py-3">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price ?? ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            price: val,
                                            isPriceCustom: true
                                        }));
                                    }}
                                    className="w-full bg-transparent text-black font-medium focus:outline-none"
                                    placeholder={`800 ${currencySymbol}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category & Tax */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-gray-500 font-medium text-lg">Category</label>
                        <div className="relative p-[1.5px] rounded-xl overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] opacity-70 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-gradient-to-br from-[#fcf6fc] to-[#fdf2f2] rounded-[10.5px] px-5 py-3 pr-10">
                                <select
                                    value={formData.itemsTypesId}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData(prev => ({ ...prev, itemsTypesId: val }));
                                    }}
                                    className="w-full bg-transparent text-black font-medium focus:outline-none appearance-none"
                                >
                                    <option value="">Select Category</option>
                                    {availableCategories.filter(cat => cat.Status).map((category) => (
                                        <option key={category.Items_types_id} value={category.Items_types_id}>
                                            {category.Name}
                                        </option>
                                    ))}
                                </select>
                                <MdKeyboardArrowDown className="absolute right-4 top-1/2 -translate-y-1/2 text-black text-2xl pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-gray-500 font-medium text-lg">Tax</label>
                        <div className="relative p-[1.5px] rounded-xl overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] opacity-70 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-gradient-to-br from-[#fcf6fc] to-[#fdf2f2] rounded-[10.5px] px-5 py-3 pr-10">
                                <select
                                    value={formData.taxId !== undefined && formData.taxId !== null ? String(formData.taxId) : 'none'}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData(prev => ({ ...prev, taxId: val }));
                                    }}
                                    className="w-full bg-transparent text-black font-medium focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value="none">none</option>
                                    {Array.isArray(taxData) && taxData.map((tax) => {
                                        const rawId = tax.Tax_setup_id ?? tax.Tax_id ?? tax.tax_id ?? tax.id;
                                        if (rawId === undefined || rawId === null || tax.isSample) return null;
                                        const taxId = String(rawId);
                                        const taxName = tax.title || tax.Tax_name || tax.tax_name || tax.name || 'Tax';
                                        const taxRate = tax.rate ?? tax.Rate ?? tax.percentage ?? 0;
                                        return (
                                            <option key={taxId} value={taxId}>
                                                {taxName} ({taxRate}%)
                                            </option>
                                        );
                                    })}
                                </select>
                                <MdKeyboardArrowDown className="absolute right-4 top-1/2 -translate-y-1/2 text-black text-2xl pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Show Variants */}
                <div className="space-y-2 mt-4">
                    <div className="relative p-[1.5px] rounded-xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] opacity-70"></div>
                        <button
                            onClick={() => setShowVariants(!showVariants)}
                            className="relative w-full bg-gradient-to-br from-[#fcf6fc] to-[#fdf2f2] rounded-[10.5px] px-5 py-4 flex items-center justify-between transition-colors"
                        >
                            <span className="text-black font-medium">Show Variants</span>
                            {showVariants ? (
                                <MdKeyboardArrowUp className="text-black text-2xl" />
                            ) : (
                                <MdKeyboardArrowDown className="text-black text-2xl" />
                            )}
                        </button>
                    </div>

                    {showVariants && (
                        <div className="relative p-[1.5px] rounded-xl overflow-hidden mt-2">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] opacity-30"></div>
                            <div className="relative bg-[#fcf6fc]/50 rounded-[10.5px] p-5 space-y-3">
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {availableVariants.map((variant) => (
                                        <label key={variant.item_Variants_id} className="flex items-center gap-3 bg-white p-3 rounded-lg cursor-pointer hover:bg-gray-50 shadow-sm border border-gray-100">
                                            <input
                                                type="checkbox"
                                                checked={selectedVariants.includes(variant.item_Variants_id)}
                                                onChange={() => handleToggleVariant(variant.item_Variants_id)}
                                                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-black">{variant.Variants}</p>
                                                <p className="text-sm text-gray-500">{variant.prices} {currencySymbol}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowVariantModal(true)}
                                    className="w-full py-3 rounded-lg bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"
                                >
                                    + Add Variant
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Show Addons */}
                <div className="space-y-2 mt-4">
                    <div className="relative p-[1.5px] rounded-xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] opacity-70"></div>
                        <button
                            onClick={() => setShowAddons(!showAddons)}
                            className="relative w-full bg-gradient-to-br from-[#fcf6fc] to-[#fdf2f2] rounded-[10.5px] px-5 py-4 flex items-center justify-between transition-colors cursor-pointer"
                        >
                            <span className="text-black font-medium">Show Addons</span>
                            {showAddons ? (
                                <MdKeyboardArrowUp className="text-black text-2xl" />
                            ) : (
                                <MdKeyboardArrowDown className="text-black text-2xl" />
                            )}
                        </button>
                    </div>

                    {showAddons && (
                        <div className="relative p-[1.5px] rounded-xl overflow-hidden mt-2">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] opacity-30"></div>
                            <div className="relative bg-[#fcf6fc]/50 rounded-[10.5px] p-5 space-y-3">
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {availableAddons.map((addon) => (
                                        <label key={addon.item_Addons_id} className="flex items-center gap-3 bg-white p-3 rounded-lg cursor-pointer hover:bg-gray-50 shadow-sm border border-gray-100">
                                            <input
                                                type="checkbox"
                                                checked={selectedAddons.includes(addon.item_Addons_id)}
                                                onChange={() => handleToggleAddon(addon.item_Addons_id)}
                                                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-black">{addon.Addons}</p>
                                                <p className="text-sm text-gray-500">{addon.prices} {currencySymbol}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAddonModal(true)}
                                    className="w-full py-3 rounded-lg bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"
                                >
                                    + Add Addon
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <div className="pt-6">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white text-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                        {isLoading && (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        <span>{isLoading ? t('menuItems.saving', 'Saving...') : t('menuItems.save', 'Save')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuItemForm;
