import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { FiSearch } from 'react-icons/fi';
import recipeService from '../../../services/recipeService';
import RecipeCard from './RecipeCard';
import RecipeModal from './RecipeModal';
import RecipeDetailsModal from './RecipeDetailsModal';
import ConfirmDialog from '../../common/ConfirmDialog';
import GradientOutlineButton from '../../common/GradientOutlineButton';
import { useRestaurant } from '../../../hooks/queries/usePos';
import { 
    formatCurrency, 
    calculateTotalRecipeCost, 
    calculateGrossMargin, 
    calculateRecipeMaxServings 
} from '../../../utils/recipeUtils';
import { resolveCurrencySymbol } from '../../../utils/currencyUtils';
import useSearchStore from '../../../store/searchStore';

const RecipeStatsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col animate-pulse">
                    <div className="flex justify-between items-center mb-2">
                        <div className="h-3.5 w-24 bg-gray-200 rounded"></div>
                        <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                    </div>
                    <div className="h-9 w-20 bg-gray-300 rounded mt-2"></div>
                </div>
            ))}
        </div>
    );
};

const RecipeCardSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-pulse">
                    {/* Top half (Gradient area) */}
                    <div className="p-6 bg-gray-200">
                        <div className="flex justify-between items-start mb-2">
                            <div className="h-6 w-32 bg-gray-300 rounded"></div>
                            <div className="h-6 w-16 bg-white/50 rounded-full"></div>
                        </div>
                        <div className="h-4 w-24 bg-gray-300 rounded mb-4"></div>
                        <div className="flex gap-4">
                            <div className="h-3 w-20 bg-gray-300 rounded"></div>
                            <div className="h-3 w-24 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                    
                    {/* Bottom half */}
                    <div className="p-6 flex-1">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>
                                <div className="h-5 w-12 bg-gray-300 rounded"></div>
                            </div>
                            <div>
                                <div className="h-3 w-20 bg-gray-200 rounded mb-2"></div>
                                <div className="h-5 w-16 bg-gray-300 rounded"></div>
                            </div>
                            <div>
                                <div className="h-3 w-20 bg-gray-200 rounded mb-2"></div>
                                <div className="h-5 w-8 bg-gray-300 rounded"></div>
                            </div>
                            <div>
                                <div className="h-3 w-24 bg-gray-200 rounded mb-2"></div>
                                <div className="h-5 w-8 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="h-10 w-28 bg-gray-200 rounded-xl"></div>
                        <div className="flex gap-2">
                            <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
                            <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const RecipeManagementTab = () => {
    const { t } = useTranslation('settings');
    const queryClient = useQueryClient();
    const { searchQuery: globalSearch, setSearchPlaceholder } = useSearchStore();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setSearchPlaceholder(t('recipe.searchPlaceholder', 'Search recipes...'));
        return () => setSearchPlaceholder('');
    }, [setSearchPlaceholder, t]);

    useEffect(() => {
        if (globalSearch !== undefined) {
            setSearchQuery(globalSearch);
        }
    }, [globalSearch]);

    const { data: restaurantData } = useRestaurant();
    const currency = resolveCurrencySymbol(restaurantData?.currency);
    
    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // Fetch Recipes
    const { 
        data: recipesResponse, 
        isLoading: isRecipesLoading,
        isError: isRecipesError
    } = useQuery({
        queryKey: ['recipes'],
        queryFn: recipeService.getRecipes
    });

    // Fetch Statistics
    const { 
        data: statsResponse,
        isLoading: isStatsLoading
    } = useQuery({
        queryKey: ['recipeStats'],
        queryFn: recipeService.getStatistics
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: recipeService.createRecipe,
        onSuccess: () => {
            queryClient.invalidateQueries(['recipes']);
            queryClient.invalidateQueries(['recipeStats']);
            toast.success(t('recipe.createSuccess', 'Recipe created successfully'));
            closeForm();
        },
        onError: (error) => {
            toast.error(error.message || t('recipe.createError', 'Failed to create recipe'));
        }
    });

    const updateMutation = useMutation({
        mutationFn: recipeService.updateRecipe,
        onSuccess: () => {
            queryClient.invalidateQueries(['recipes']);
            queryClient.invalidateQueries(['recipeStats']);
            toast.success(t('recipe.updateSuccess', 'Recipe updated successfully'));
            closeForm();
            setIsDetailsOpen(false);
        },
        onError: (error) => {
            toast.error(error.message || t('recipe.updateError', 'Failed to update recipe'));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: recipeService.deleteRecipe,
        onSuccess: () => {
            queryClient.invalidateQueries(['recipes']);
            queryClient.invalidateQueries(['recipeStats']);
            toast.success(t('recipe.deleteSuccess', 'Recipe deleted successfully'));
            setDeleteId(null);
        },
        onError: (error) => {
            toast.error(error.message || t('recipe.deleteError', 'Failed to delete recipe'));
            setDeleteId(null);
        }
    });

    // Handlers
    const openCreateForm = () => {
        setIsDetailsOpen(false);
        setSelectedRecipe(null);
        setIsFormOpen(true);
    };

    const openEditForm = (recipe) => {
        setIsDetailsOpen(false);
        setSelectedRecipe(recipe);
        setIsFormOpen(true);
    };

    const openDetails = (recipe) => {
        setIsFormOpen(false);
        setSelectedRecipe(recipe);
        setIsDetailsOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setSelectedRecipe(null);
    };

    const closeDetails = () => {
        setIsDetailsOpen(false);
        setSelectedRecipe(null);
    };

    const handleFormSubmit = (data) => {
        const rawId = data?.id ?? data?.recipe_id ?? data?.Recipe_id ?? data?._id;
        if (rawId) {
            const numericId = !isNaN(Number(rawId)) && rawId !== null && rawId !== '' ? Number(rawId) : rawId;
            const payload = {
                ...data,
                id: numericId,
                recipe_id: numericId
            };
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (idOrRecipe) => {
        const targetId = typeof idOrRecipe === 'object' && idOrRecipe !== null
            ? (idOrRecipe.recipe_id ?? idOrRecipe.id ?? idOrRecipe._id)
            : idOrRecipe;
        setDeleteId(targetId);
    };

    const confirmDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    // Derived Recipes List
    const rawData = recipesResponse?.data;
    const recipes = useMemo(() => {
        if (Array.isArray(rawData)) return rawData;
        if (Array.isArray(recipesResponse)) return recipesResponse;
        if (Array.isArray(rawData?.recipes)) return rawData.recipes;
        return [];
    }, [rawData, recipesResponse]);

    // Statistics with automatic fallback calculation if backend table is empty
    const stats = useMemo(() => {
        const backendStats = statsResponse?.data || statsResponse;
        if (backendStats && (backendStats.total_recipes > 0 || backendStats.avg_gross_margin > 0)) {
            return {
                total_recipes: backendStats.total_recipes || 0,
                avg_gross_margin: backendStats.avg_gross_margin || 0,
                avg_recipe_cost: backendStats.avg_recipe_cost || 0,
                low_stock_recipes: backendStats.low_stock_recipes || 0
            };
        }
        if (recipes.length === 0) {
            return {
                total_recipes: 0,
                avg_gross_margin: 0,
                avg_recipe_cost: 0,
                low_stock_recipes: 0
            };
        }
        let totalCost = 0;
        let totalMargin = 0;
        let lowStockCount = 0;
        recipes.forEach(r => {
            const cost = calculateTotalRecipeCost(r.ingredients || []);
            const margin = calculateGrossMargin(r.menu_price, cost);
            const servings = r.max_servings !== undefined && r.max_servings !== null 
                ? Number(r.max_servings) 
                : calculateRecipeMaxServings(r.ingredients || []);
            totalCost += cost;
            totalMargin += margin;
            if (servings < 10) lowStockCount++;
        });
        return {
            total_recipes: recipes.length,
            avg_gross_margin: Number((totalMargin / recipes.length).toFixed(2)),
            avg_recipe_cost: Number((totalCost / recipes.length).toFixed(2)),
            low_stock_recipes: lowStockCount
        };
    }, [statsResponse, recipes]);

    // Filter recipes locally based on search
    const filteredRecipes = useMemo(() => {
        if (!searchQuery.trim()) return recipes;
        const q = searchQuery.toLowerCase();
        return recipes.filter(recipe => 
            (recipe.recipe_name && recipe.recipe_name.toLowerCase().includes(q)) ||
            (recipe.category && recipe.category.toLowerCase().includes(q))
        );
    }, [recipes, searchQuery]);

    return (
        <div className="p-6 font-poppins min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-[28px] font-bold text-gray-900">{t('recipe.title', 'Recipe Management')}</h1>
                <GradientOutlineButton onClick={openCreateForm}>
                    {t('recipe.newRecipe', '+ New')}
                </GradientOutlineButton>
            </div>

            {/* Statistics Row matching Figma */}
            {isStatsLoading ? (
                <RecipeStatsSkeleton />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Card 1: Total Recipes */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500 font-medium">{t('recipe.totalRecipes', 'Total Recipes')}</span>
                            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
                                <line x1="6" y1="17" x2="18" y2="17"/>
                            </svg>
                        </div>
                        <span className="text-4xl font-bold text-gray-900 mt-2">{stats.total_recipes}</span>
                    </div>
                    
                    {/* Card 2: Avg Gross Margin */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500 font-medium">{t('recipe.avgGrossMargin', 'Avg Gross Margin')}</span>
                            <svg className="w-5 h-5 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <span className="text-4xl font-bold text-[#16A34A] mt-2">{stats.avg_gross_margin}%</span>
                    </div>

                    {/* Card 3: Avg Recipe Cost */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500 font-medium">{t('recipe.avgRecipeCost', 'Avg Recipe Cost')}</span>
                            <span className="text-[#2563EB] font-bold text-base leading-none">{currency}</span>
                        </div>
                        <span className="text-4xl font-bold text-[#2563EB] mt-2">{formatCurrency(stats.avg_recipe_cost, currency)}</span>
                    </div>

                    {/* Card 4: Low Stock Recipes */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500 font-medium">{t('recipe.lowStockRecipes', 'Low Stock Recipes')}</span>
                            <svg className="w-5 h-5 text-[#F97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <span className="text-4xl font-bold text-[#EA580C] mt-2">{stats.low_stock_recipes}</span>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="mb-8 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('recipe.searchPlaceholder', 'Search recipes...')} 
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] shadow-sm text-sm placeholder:text-gray-400"
                />
            </div>

            {/* Recipe Grid (3 Columns matching Figma) */}
            {isRecipesLoading ? (
                <RecipeCardSkeleton />
            ) : isRecipesError ? (
                <div className="text-center text-red-500 py-10">
                    {t('recipe.loadError', 'Failed to load recipes. Please try again.')}
                </div>
            ) : filteredRecipes.length === 0 ? (
                <div className="text-center text-gray-500 py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
                    {t('recipe.noRecipesFound', "No recipes found. Click '+ New' to create one!")}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {filteredRecipes.map((recipe) => (
                        <RecipeCard 
                            key={recipe.recipe_id || recipe.id || recipe._id}
                            recipe={recipe}
                            currency={currency}
                            onViewDetails={openDetails}
                            onEdit={openEditForm}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            <RecipeModal 
                isOpen={isFormOpen}
                onClose={closeForm}
                onSubmit={handleFormSubmit}
                initialData={selectedRecipe}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            <RecipeDetailsModal 
                recipe={isDetailsOpen ? selectedRecipe : null}
                currency={currency}
                onClose={closeDetails}
                onEdit={openEditForm}
            />

            <ConfirmDialog 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title={t('recipe.deleteTitle', 'Delete Recipe')}
                message={t('recipe.deleteMessage', 'Are you sure you want to delete this recipe? This action cannot be undone.')}
                confirmText={deleteMutation.isPending ? t('recipe.deleting', 'Deleting...') : t('recipe.delete', 'Delete')}
                cancelText={t('recipe.cancel', 'Cancel')}
            />
        </div>
    );
};

export default RecipeManagementTab;
