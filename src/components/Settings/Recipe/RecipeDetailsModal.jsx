import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiX, FiBarChart2 } from 'react-icons/fi';
import { 
    calculateIngredientCost, 
    calculateMaxServings, 
    calculateTotalRecipeCost, 
    calculateGrossProfit, 
    calculateGrossMargin, 
    calculateRecipeMaxServings, 
    formatCurrency, 
    formatPercentage 
} from '../../../utils/recipeUtils';

const RecipeDetailsModal = ({ recipe, currency, onClose, onEdit }) => {
    const { t } = useTranslation('settings');

    if (!recipe) return null;

    const menuPrice = parseFloat(recipe.menu_price) || 0;
    const ingredients = recipe.ingredients || [];
    
    const totalCost = calculateTotalRecipeCost(ingredients);
    const grossMargin = calculateGrossMargin(menuPrice, totalCost);
    const grossProfit = calculateGrossProfit(menuPrice, totalCost);
    const maxServings = recipe.max_servings !== undefined && recipe.max_servings !== null
        ? Number(recipe.max_servings) 
        : calculateRecipeMaxServings(ingredients);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 font-poppins">
            <div className="bg-[#FAFAFA] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-[#701A75] via-[#8E1C58] to-[#BD1B2F] p-6 text-white relative">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
                    >
                        <FiX className="w-6 h-6" />
                    </button>

                    <h2 className="text-2xl font-bold mb-1 text-white">{recipe.recipe_name}</h2>
                    <p className="text-white/80 mb-6 text-sm">{recipe.category}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                            <p className="text-white/80 mb-1 text-xs">{t('recipe.menuPrice', 'Menu Price')}</p>
                            <p className="text-2xl font-bold text-white">{formatCurrency(menuPrice, currency)}</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                            <p className="text-white/80 mb-1 text-xs">{t('recipe.recipeCost', 'Recipe Cost')}</p>
                            <p className="text-2xl font-bold text-white">{formatCurrency(totalCost, currency)}</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                            <p className="text-white/80 mb-1 text-xs">{t('recipe.grossMargin', 'Gross Margin')}</p>
                            <p className="text-2xl font-bold text-green-300">{formatPercentage(grossMargin)}</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                            <p className="text-white/80 mb-1 text-xs">{t('recipe.maxServings', 'Max Servings')}</p>
                            <p className="text-2xl font-bold text-white">{maxServings}</p>
                        </div>
                    </div>
                </div>

                {/* Body Section */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-lg font-bold text-gray-900">{t('recipe.ingredientsBreakdown', 'Ingredients & Cost Breakdown')}</h3>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                                    <th className="py-3 px-4 font-semibold">{t('recipe.ingredientName', 'Ingredient')}</th>
                                    <th className="py-3 px-4 font-semibold">{t('recipe.quantity', 'Quantity')}</th>
                                    <th className="py-3 px-4 font-semibold">{t('recipe.costPerUnit', 'Cost/Unit')}</th>
                                    <th className="py-3 px-4 font-semibold">{t('recipe.totalCost', 'Total Cost')}</th>
                                    <th className="py-3 px-4 font-semibold">{t('recipe.stock', 'Stock')}</th>
                                    <th className="py-3 px-4 font-semibold">{t('recipe.maxServings', 'Max Servings')}</th>
                                    <th className="py-3 px-4 font-semibold text-center">{t('recipe.history', 'History')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {ingredients.map((ing, idx) => {
                                    const qty = parseFloat(ing.quantity) || 0;
                                    const unit = ing.unit || '';
                                    const cpu = parseFloat(ing.cost_per_unit || ing.costPerUnit) || 0;
                                    const stock = parseFloat(ing.stock) || 0;
                                    
                                    const ingCost = calculateIngredientCost(qty, cpu);
                                    const ingServings = calculateMaxServings(qty, stock);
                                    
                                    const servingColor = ingServings < 10 ? 'text-[#DC2626]' : 'text-[#16A34A]';

                                    return (
                                        <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="py-3.5 px-4 font-semibold text-gray-900">{ing.name}</td>
                                            <td className="py-3.5 px-4 text-gray-600">{qty} {unit}</td>
                                            <td className="py-3.5 px-4 text-gray-600">{formatCurrency(cpu, currency)}/{unit}</td>
                                            <td className="py-3.5 px-4 font-bold text-gray-900">{formatCurrency(ingCost, currency)}</td>
                                            <td className="py-3.5 px-4 text-gray-600">{stock} {unit}</td>
                                            <td className={`py-3.5 px-4 font-bold ${servingColor}`}>{ingServings}</td>
                                            <td className="py-3.5 px-4 text-center">
                                                <button 
                                                    type="button" 
                                                    className="p-1.5 text-[#8200DB] hover:bg-purple-50 rounded-lg transition-colors inline-flex items-center justify-center"
                                                >
                                                    <FiBarChart2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                <tr className="bg-gray-50/80 border-t border-gray-200">
                                    <td colSpan="3" className="py-4 px-4 font-bold text-gray-900 text-right">{t('recipe.totalRecipeCost', 'Total Recipe Cost')}</td>
                                    <td className="py-4 px-4 font-bold text-gray-900">{formatCurrency(totalCost, currency)}</td>
                                    <td colSpan="3"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#F0F7FF] border border-[#BFDBFE] rounded-2xl p-5">
                            <p className="text-xs text-blue-600 font-medium mb-1">{t('recipe.menuPrice', 'Menu Price')}</p>
                            <p className="text-2xl font-bold text-blue-900">{formatCurrency(menuPrice, currency)}</p>
                        </div>
                        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-5">
                            <p className="text-xs text-red-600 font-medium mb-1">{t('recipe.recipeCost', 'Recipe Cost')}</p>
                            <p className="text-2xl font-bold text-red-900">{formatCurrency(totalCost, currency)}</p>
                        </div>
                        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-5">
                            <p className="text-xs text-green-600 font-medium mb-1">{t('recipe.grossProfit', 'Gross Profit')}</p>
                            <p className="text-2xl font-bold text-green-900 mb-1">{formatCurrency(grossProfit, currency)}</p>
                            <p className="text-xs font-semibold text-green-700">{t('recipe.margin', 'Margin')}: {formatPercentage(grossMargin)}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-white border-t border-gray-100 flex gap-4">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        {t('recipe.close', 'Close')}
                    </button>
                    <button 
                        type="button"
                        onClick={() => {
                            if (onClose) onClose();
                            onEdit(recipe);
                        }}
                        className="flex-1 py-3 bg-[#8200DB] hover:bg-[#7200c4] text-white rounded-xl font-medium transition-colors shadow-sm cursor-pointer"
                    >
                        {t('recipe.editRecipe', 'Edit Recipe')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetailsModal;
