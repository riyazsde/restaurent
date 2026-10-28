import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiEdit2, FiTrash2, FiClock, FiAlertTriangle, FiEye } from 'react-icons/fi';
import { 
    calculateRecipeMaxServings, 
    calculateTotalRecipeCost, 
    calculateGrossMargin, 
    formatCurrency, 
    formatPercentage 
} from '../../../utils/recipeUtils';

const RecipeCard = ({ recipe, currency, onViewDetails, onEdit, onDelete }) => {
    const { t } = useTranslation('settings');

    // Parse values safely
    const menuPrice = parseFloat(recipe.menu_price) || 0;
    const ingredients = recipe.ingredients || [];
    
    // Calculate metrics using utils
    const totalCost = calculateTotalRecipeCost(ingredients);
    const grossMargin = calculateGrossMargin(menuPrice, totalCost);
    const maxServings = recipe.max_servings !== undefined && recipe.max_servings !== null
        ? Number(recipe.max_servings) 
        : calculateRecipeMaxServings(ingredients);
    
    const isLowStock = maxServings < 10;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col font-poppins transition-all duration-200 hover:shadow-md">
            {/* Top Section - Gradient Background matching Figma */}
            <div className="bg-gradient-to-r from-[#701A75] via-[#8E1C58] to-[#BD1B2F] p-6 text-white">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-bold truncate pr-2 text-white">{recipe.recipe_name}</h3>
                    <div className="bg-white text-[#701A75] px-3.5 py-1 rounded-full text-sm font-bold shadow-sm whitespace-nowrap">
                        {formatCurrency(menuPrice, currency)}
                    </div>
                </div>
                <p className="text-sm text-white/80 font-normal mb-4">{recipe.category}</p>
                
                <div className="flex items-center gap-4 text-xs text-white/90">
                    <div className="flex items-center gap-1.5">
                        <FiClock className="w-3.5 h-3.5 text-white/80 shrink-0" />
                        <span>{t('recipe.prep', 'Prep')}: {recipe.prep_time || '0 min'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <FiClock className="w-3.5 h-3.5 text-white/80 shrink-0" />
                        <span>{t('recipe.cook', 'Cook')}: {recipe.cook_time || '0 min'}</span>
                    </div>
                </div>
            </div>

            {/* Bottom Section - White Background */}
            <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-5">
                    <div>
                        <p className="text-xs text-gray-400 font-normal mb-1">{t('recipe.recipeCost', 'Recipe Cost')}</p>
                        <p className="text-base font-bold text-gray-900">{formatCurrency(totalCost, currency)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-normal mb-1">{t('recipe.grossMargin', 'Gross Margin')}</p>
                        <p className="text-base font-bold text-[#16A34A]">{formatPercentage(grossMargin)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-normal mb-1">{t('recipe.ingredients', 'Ingredients')}</p>
                        <p className="text-base font-bold text-gray-900">{ingredients.length}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-normal mb-1">{t('recipe.maxServings', 'Max Servings')}</p>
                        <p className={`text-base font-bold ${isLowStock ? 'text-[#DC2626]' : 'text-gray-900'}`}>{maxServings}</p>
                    </div>
                </div>

                {isLowStock && (
                    <div className="bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] px-3.5 py-2.5 rounded-xl text-xs font-medium mb-4 flex items-center gap-2">
                        <FiAlertTriangle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                        <span>{t('recipe.lowStockWarning', 'Low stock! Only {{servings}} servings available', { servings: maxServings })}</span>
                    </div>
                )}

                <div className="mt-auto pt-2 flex items-center gap-2.5">
                    <button 
                        type="button"
                        onClick={() => onViewDetails(recipe)}
                        className="flex-1 bg-[#8200DB] hover:bg-[#7200c4] text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                    >
                        <FiEye className="w-4 h-4 shrink-0" />
                        <span>{t('recipe.viewDetails', 'View Details')}</span>
                    </button>
                    <button 
                        type="button"
                        onClick={() => onEdit(recipe)}
                        title={t('recipe.editRecipe', 'Edit Recipe')}
                        className="p-2.5 border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 rounded-xl transition-colors bg-white shrink-0 flex items-center justify-center"
                    >
                        <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button 
                        type="button"
                        onClick={() => onDelete(recipe.recipe_id ?? recipe.id ?? recipe._id)}
                        title={t('recipe.delete', 'Delete')}
                        className="p-2.5 border border-gray-200 text-[#EF4444] hover:bg-red-50 hover:border-red-200 rounded-xl transition-colors bg-white shrink-0 flex items-center justify-center"
                    >
                        <FiTrash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecipeCard;
