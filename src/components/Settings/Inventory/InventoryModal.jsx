import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiX } from 'react-icons/fi';
import { useRestaurant } from '../../../hooks/queries/usePos';
import { resolveCurrencySymbol } from '../../../utils/currencyUtils';

const defaultForm = {
    ingredient_name: '',
    ingredient_code: '',
    category: '',
    category_id: '',
    supplier: '',
    expiry_date: '',
    on_hand_quantity: '',
    unit: 'g',
    minimum_stock: '',
    maximum_stock: '',
    cost_per_unit: '',
    status: true
};

const InventoryModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialData, 
    isLoading, 
    activeTab = 'Restaurant',
    categories = [],
    nextItemCode = 'ING-001'
}) => {
    const { t } = useTranslation('settings');
    const { data: restaurantData } = useRestaurant();
    const currency = resolveCurrencySymbol(restaurantData?.currency);
    const [formData, setFormData] = useState(defaultForm);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const code = initialData.ingredient_code || initialData.code || initialData.ingredient_id || (initialData.id ? `ING-00${initialData.id}` : 'ING-001');
                setFormData({
                    id: initialData.id || initialData._id,
                    ingredient_name: initialData.ingredient_name || initialData.name || '',
                    ingredient_code: code,
                    category: initialData.category_name || (typeof initialData.category === 'string' ? initialData.category : '') || '',
                    category_id: initialData.category_id || (Number.isInteger(Number(initialData.category)) ? Number(initialData.category) : ''),
                    supplier: initialData.supplier || '',
                    expiry_date: initialData.expiry_date ? String(initialData.expiry_date).split('T')[0] : '',
                    on_hand_quantity: initialData.on_hand_quantity !== undefined ? initialData.on_hand_quantity : (initialData.on_hand !== undefined ? initialData.on_hand : (initialData.stock || '')),
                    unit: initialData.unit || (activeTab === 'Restaurant' ? 'g' : 'bottle'),
                    minimum_stock: initialData.minimum_stock !== undefined ? initialData.minimum_stock : (initialData.min_stock || ''),
                    maximum_stock: initialData.maximum_stock !== undefined ? initialData.maximum_stock : (initialData.max_stock || ''),
                    cost_per_unit: initialData.cost_per_unit !== undefined ? initialData.cost_per_unit : (initialData.costPerUnit || ''),
                    status: initialData.status !== undefined ? initialData.status : true
                });
            } else {
                setFormData({
                    ...defaultForm,
                    ingredient_code: nextItemCode || `ING-${Math.floor(100 + Math.random() * 900)}`,
                    unit: activeTab === 'Restaurant' ? 'g' : 'bottle'
                });
            }
        }
    }, [isOpen, initialData, activeTab, nextItemCode]);

    if (!isOpen) return null;

    const isEditMode = !!initialData;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let resolvedCategoryId = formData.category_id;
        const categoryText = (formData.category || '').trim();

        // Match category from categories list or detect numeric ID
        if (categoryText) {
            const matched = categories.find(c => 
                (c.category_name && c.category_name.toLowerCase() === categoryText.toLowerCase()) ||
                (c.name && c.name.toLowerCase() === categoryText.toLowerCase()) ||
                String(c.id || c._id) === categoryText
            );
            if (matched) {
                resolvedCategoryId = matched.id || matched._id;
            } else if (Number.isInteger(Number(categoryText))) {
                resolvedCategoryId = Number(categoryText);
            }
        }

        // Fallback to first available category id or 1
        if (!resolvedCategoryId) {
            if (categories.length > 0 && (categories[0].id || categories[0]._id)) {
                resolvedCategoryId = categories[0].id || categories[0]._id;
            } else {
                resolvedCategoryId = 1;
            }
        }

        const finalCode = formData.ingredient_code?.trim() || nextItemCode || `ING-${Math.floor(100 + Math.random() * 900)}`;

        const payload = {
            ...formData,
            ingredient_name: formData.ingredient_name.trim(),
            ingredient_code: finalCode,
            category: resolvedCategoryId,
            category_id: resolvedCategoryId,
            category_name: categoryText || 'General',
            unit: (formData.unit || (activeTab === 'Restaurant' ? 'g' : 'bottle')).trim(),
            on_hand_quantity: parseFloat(formData.on_hand_quantity) || 0,
            minimum_stock: parseFloat(formData.minimum_stock) || 0,
            maximum_stock: parseFloat(formData.maximum_stock) || 0,
            cost_per_unit: parseFloat(formData.cost_per_unit) || 0,
            // Also normalize properties for API compatibility
            on_hand: parseFloat(formData.on_hand_quantity) || 0,
            min_stock: parseFloat(formData.minimum_stock) || 0,
            max_stock: parseFloat(formData.maximum_stock) || 0,
            supplier: formData.supplier?.trim() || '',
            expiry_date: formData.expiry_date || '',
            status: Boolean(formData.status),
            Status: Boolean(formData.status)
        };
        onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 font-poppins">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header Section matching Figma */}
                <div className="bg-gradient-to-r from-[#701A75] via-[#8E1C58] to-[#BD1B2F] p-6 text-white relative">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold mb-1 text-white">
                        {isEditMode ? t('inventory.editIngredient', 'Edit Ingredient') : t('inventory.addIngredient', 'Add New Ingredient')}
                    </h2>
                    <p className="text-white/80 text-sm">
                        {isEditMode 
                            ? t('inventory.editIngredientSubtitle', 'Update ingredient details and stock information') 
                            : t('inventory.addIngredientSubtitle', 'Add a new ingredient to your inventory')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-base font-bold text-gray-900 mb-4">
                            {t('inventory.basicInformation', 'Basic Information')}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">
                                    {t('inventory.ingredientName', 'Ingredient Name')} *
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.ingredient_name}
                                    onChange={(e) => handleChange('ingredient_name', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm"
                                    placeholder={t('inventory.ingredientNamePlaceholder', 'e.g., Fresh Basil')}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">
                                    {t('inventory.ingredientCode', 'Ingredient Code')} *
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.ingredient_code}
                                    onChange={(e) => handleChange('ingredient_code', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm font-mono"
                                    placeholder={t('inventory.ingredientCodePlaceholder', 'e.g., ING-001')}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">
                                    {t('inventory.category', 'Category')} *
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    list="inventory-categories-datalist"
                                    value={formData.category}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        handleChange('category', val);
                                        const matched = categories.find(c => 
                                            (c.category_name && c.category_name.toLowerCase() === val.toLowerCase()) ||
                                            (c.name && c.name.toLowerCase() === val.toLowerCase())
                                        );
                                        if (matched) {
                                            handleChange('category_id', matched.id || matched._id);
                                        }
                                    }}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm"
                                    placeholder={t('inventory.categoryPlaceholder', 'e.g., pizza')}
                                />
                                <datalist id="inventory-categories-datalist">
                                    {categories.map((cat) => (
                                        <option key={cat.id || cat._id} value={cat.category_name || cat.name}>
                                            {cat.category_name || cat.name}
                                        </option>
                                    ))}
                                </datalist>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">
                                    {t('inventory.supplier', 'Supplier')} *
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.supplier}
                                    onChange={(e) => handleChange('supplier', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm"
                                    placeholder={t('inventory.supplierPlaceholder', 'e.g., Fresh Farms Co.')}
                                />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-xs font-semibold text-gray-700">
                                    {t('inventory.expiryDate', 'Expiry Date')} *
                                </label>
                                <input 
                                    type="date" 
                                    required
                                    value={formData.expiry_date}
                                    onChange={(e) => handleChange('expiry_date', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stock Information */}
                    <div>
                        <h3 className="text-base font-bold text-gray-900 mb-4">
                            {t('inventory.stockInformation', 'Stock Information')}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">
                                    {t('inventory.onHandQuantity', 'On-Hand Quantity')} *
                                </label>
                                <input 
                                    type="number" 
                                    step="any"
                                    required
                                    value={formData.on_hand_quantity}
                                    onChange={(e) => handleChange('on_hand_quantity', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm"
                                    placeholder="1000"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">
                                    {t('inventory.unit', 'Unit')} *
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.unit}
                                    onChange={(e) => handleChange('unit', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm"
                                    placeholder={t('inventory.unitPlaceholder', 'e.g., g,pc,ml')}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">
                                    {t('inventory.minStock', 'Minimum Stock')} *
                                </label>
                                <input 
                                    type="number" 
                                    step="any"
                                    required
                                    value={formData.minimum_stock}
                                    onChange={(e) => handleChange('minimum_stock', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm"
                                    placeholder="500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">
                                    {t('inventory.maxStock', 'Maximum Stock')} *
                                </label>
                                <input 
                                    type="number" 
                                    step="any"
                                    required
                                    value={formData.maximum_stock}
                                    onChange={(e) => handleChange('maximum_stock', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm"
                                    placeholder="3000"
                                />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-xs font-semibold text-gray-700">
                                    {t('inventory.costPerUnit', 'Cost Per Unit')} ({currency}) *
                                </label>
                                <input 
                                    type="number" 
                                    step="any"
                                    required
                                    value={formData.cost_per_unit}
                                    onChange={(e) => handleChange('cost_per_unit', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm"
                                    placeholder="0.015"
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer matching Figma */}
                <div className="p-6 bg-white border-t border-gray-100 flex gap-4">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        {t('inventory.cancel', 'Cancel')}
                    </button>
                    <button 
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 py-3 bg-[#8200DB] hover:bg-[#7200c4] text-white rounded-xl font-medium transition-colors disabled:opacity-70 flex justify-center items-center shadow-sm"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            isEditMode ? t('inventory.update', 'Save Changes') : t('inventory.save', 'Add Ingredient')
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InventoryModal;
