import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiX, FiTrash2, FiPlus } from 'react-icons/fi';
import { useRestaurant } from '../../../hooks/queries/usePos';
import { resolveCurrencySymbol } from '../../../utils/currencyUtils';
import { 
    calculateTotalRecipeCost, 
    calculateGrossMargin, 
    calculateGrossProfit,
    formatCurrency, 
    formatPercentage 
} from '../../../utils/recipeUtils';

const defaultIngredient = {
    name: '',
    quantity: '',
    unit: '',
    cost_per_unit: '',
    stock: ''
};

const defaultRecipe = {
    recipe_name: '',
    category: '',
    menu_price: '',
    prep_time: '',
    cook_time: '',
    ingredients: [ { ...defaultIngredient } ],
    status: true
};

const RecipeModal = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
    const { t } = useTranslation('settings');
    const { data: restaurantData } = useRestaurant();
    const currency = resolveCurrencySymbol(restaurantData?.currency);
    const [formData, setFormData] = useState(defaultRecipe);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Ensure cost_per_unit vs costPerUnit is normalized
                const normalizedIngredients = (initialData.ingredients || []).map(ing => ({
                    ...ing,
                    cost_per_unit: ing.cost_per_unit !== undefined ? ing.cost_per_unit : (ing.costPerUnit !== undefined ? ing.costPerUnit : '')
                }));
                setFormData({
                    ...initialData,
                    ingredients: normalizedIngredients.length > 0 ? normalizedIngredients : [{ ...defaultIngredient }]
                });
            } else {
                setFormData(defaultRecipe);
            }
        }
    }, [isOpen, initialData]);

    // Live preview metrics
    const liveMetrics = useMemo(() => {
        const menuPrice = parseFloat(formData.menu_price) || 0;
        const totalCost = calculateTotalRecipeCost(formData.ingredients || []);
        const grossMargin = calculateGrossMargin(menuPrice, totalCost);
        const grossProfit = calculateGrossProfit(menuPrice, totalCost);
        return { menuPrice, totalCost, grossMargin, grossProfit };
    }, [formData.menu_price, formData.ingredients]);

    if (!isOpen) return null;

    const isEditMode = !!initialData;

    const handleBasicChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    };

    const addIngredient = () => {
        setFormData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, { ...defaultIngredient }]
        }));
    };

    const removeIngredient = (index) => {
        const newIngredients = formData.ingredients.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const rawId = formData.id ?? formData.recipe_id ?? formData.Recipe_id ?? formData._id ?? initialData?.id ?? initialData?.recipe_id ?? initialData?.Recipe_id ?? initialData?._id;
        const numericId = !isNaN(Number(rawId)) && rawId !== null && rawId !== '' ? Number(rawId) : rawId;

        // Parse numbers safely before submission
        const payload = {
            ...formData,
            ...(numericId ? { id: numericId, recipe_id: numericId } : {}),
            menu_price: parseFloat(formData.menu_price) || 0,
            ingredients: formData.ingredients.map(ing => ({
                ...ing,
                quantity: parseFloat(ing.quantity) || 0,
                cost_per_unit: parseFloat(ing.cost_per_unit) || 0,
                stock: parseFloat(ing.stock) || 0
            }))
        };

        onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 font-poppins">
            <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                
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
                        {isEditMode ? t('recipe.editRecipe', 'Edit Recipe') : t('recipe.addNewRecipe', 'Add New Recipe')}
                    </h2>
                    <p className="text-white/80 text-sm">
                        {isEditMode 
                            ? t('recipe.editSubtitle', 'Update recipe details, ingredients, and cost calculation') 
                            : t('recipe.createSubtitle', 'Create a new recipe with ingredients and cost calculation')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-base font-bold text-gray-900 mb-4">{t('recipe.basicInformation', 'Basic Information')}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">{t('recipe.recipeName', 'Recipe Name')} *</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.recipe_name}
                                    onChange={(e) => handleBasicChange('recipe_name', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm"
                                    placeholder={t('recipe.recipeNamePlaceholder', 'e.g., Grilled Salmon')}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">{t('recipe.category', 'Category')} *</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.category}
                                    onChange={(e) => handleBasicChange('category', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm"
                                    placeholder={t('recipe.categoryPlaceholder', 'Main Course')}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">{t('recipe.menuPrice', 'Menu Price')} ({currency}) *</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    required
                                    value={formData.menu_price}
                                    onChange={(e) => handleBasicChange('menu_price', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm"
                                    placeholder="24.00"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-700">{t('recipe.prepTime', 'Prep Time')} *</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.prep_time}
                                        onChange={(e) => handleBasicChange('prep_time', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm"
                                        placeholder={t('recipe.prepTimePlaceholder', '15 min')}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-700">{t('recipe.cookTime', 'Cook Time')} *</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.cook_time}
                                        onChange={(e) => handleBasicChange('cook_time', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm"
                                        placeholder={t('recipe.cookTimePlaceholder', '20 min')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ingredients Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-bold text-gray-900">{t('recipe.ingredients', 'Ingredients')}</h3>
                            <button 
                                type="button"
                                onClick={addIngredient}
                                className="px-3.5 py-1.5 bg-[#F5EEFB] text-[#8200DB] hover:bg-[#EBDCF8] font-medium rounded-xl text-xs transition-colors flex items-center gap-1.5"
                            >
                                <FiPlus className="w-3.5 h-3.5" />
                                <span>{t('recipe.addIngredient', 'Add Ingredient')}</span>
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {formData.ingredients.map((ing, idx) => (
                                <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 flex-1">
                                        <div className="space-y-1 sm:col-span-2">
                                            <label className="text-xs font-semibold text-gray-600">{t('recipe.ingredientName', 'Name')} *</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={ing.name}
                                                onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm bg-white"
                                                placeholder={t('recipe.ingredientNamePlaceholder', 'Ingredient name')}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-600">{t('recipe.quantity', 'Quantity')} *</label>
                                            <input 
                                                type="number" 
                                                step="any"
                                                required
                                                value={ing.quantity}
                                                onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm bg-white"
                                                placeholder="200"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-600">{t('recipe.unit', 'Unit')} *</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={ing.unit}
                                                onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm bg-white"
                                                placeholder={t('recipe.unitPlaceholder', 'g, ml, pc')}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-600">{t('recipe.costPerUnit', 'Cost/Unit')} ({currency}) *</label>
                                            <input 
                                                type="number" 
                                                step="any"
                                                required
                                                value={ing.cost_per_unit}
                                                onChange={(e) => handleIngredientChange(idx, 'cost_per_unit', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm bg-white"
                                                placeholder="0.03"
                                            />
                                        </div>
                                        <div className="space-y-1 sm:col-span-2">
                                            <label className="text-xs font-semibold text-gray-600">{t('recipe.stock', 'Stock')}</label>
                                            <input 
                                                type="number"
                                                step="any" 
                                                value={ing.stock}
                                                onChange={(e) => handleIngredientChange(idx, 'stock', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] text-sm bg-white"
                                                placeholder="3000"
                                            />
                                        </div>
                                    </div>
                                    
                                    {formData.ingredients.length > 1 && (
                                        <button 
                                            type="button"
                                            onClick={() => removeIngredient(idx)}
                                            className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live Financial Summary */}
                    <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                        <div>
                            <span className="text-gray-500">{t('recipe.recipeCost', 'Recipe Cost')}: </span>
                            <span className="font-bold text-gray-900">{formatCurrency(liveMetrics.totalCost, currency)}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">{t('recipe.grossProfit', 'Gross Profit')}: </span>
                            <span className="font-bold text-green-600">{formatCurrency(liveMetrics.grossProfit, currency)}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">{t('recipe.grossMargin', 'Gross Margin')}: </span>
                            <span className="font-bold text-green-600">{formatPercentage(liveMetrics.grossMargin)}</span>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 bg-white border-t border-gray-100 flex gap-4">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        {t('recipe.cancel', 'Cancel')}
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
                            isEditMode ? t('recipe.update', 'Update Recipe') : t('recipe.save', 'Save Recipe')
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecipeModal;
