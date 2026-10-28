import { formatCurrency as globalFormatCurrency } from './currencyUtils';

/**
 * Calculates the cost of a single ingredient row based on quantity and cost per unit
 * @param {number|string} quantity - Amount of the ingredient used
 * @param {number|string} costPerUnit - Cost per single unit of the ingredient
 * @returns {number} The calculated total cost for this ingredient
 */
export const calculateIngredientCost = (quantity, costPerUnit) => {
  const qty = parseFloat(quantity) || 0;
  const cost = parseFloat(costPerUnit) || 0;
  return qty * cost;
};

/**
 * Calculates how many servings can be made based on current stock and required quantity
 * @param {number|string} requiredQuantity - Amount of ingredient needed for one recipe serving
 * @param {number|string} currentStock - Total available stock of the ingredient
 * @returns {number} The maximum number of servings that can be made
 */
export const calculateMaxServings = (requiredQuantity, currentStock) => {
  const qty = parseFloat(requiredQuantity) || 0;
  const stock = parseFloat(currentStock) || 0;
  if (qty === 0) return 0;
  return Math.floor(stock / qty);
};

/**
 * Calculates the total cost of the recipe by summing up all ingredient costs
 * @param {Array} ingredients - Array of ingredient objects
 * @returns {number} The total cost of the recipe
 */
export const calculateTotalRecipeCost = (ingredients = []) => {
  if (!Array.isArray(ingredients)) return 0;
  return ingredients.reduce((total, ing) => {
    return total + calculateIngredientCost(ing.quantity, ing.cost_per_unit || ing.costPerUnit);
  }, 0);
};

/**
 * Calculates the overall max servings for the recipe (bottlenecked by the ingredient with lowest max servings)
 * @param {Array} ingredients - Array of ingredient objects
 * @returns {number} The maximum number of recipe servings possible
 */
export const calculateRecipeMaxServings = (ingredients = []) => {
  if (!Array.isArray(ingredients) || ingredients.length === 0) return 0;
  
  let lowestServings = Infinity;
  
  ingredients.forEach(ing => {
    const servings = calculateMaxServings(ing.quantity, ing.stock);
    if (servings < lowestServings) {
      lowestServings = servings;
    }
  });
  
  return lowestServings === Infinity ? 0 : lowestServings;
};

/**
 * Calculates the gross profit (Menu Price - Total Recipe Cost)
 * @param {number|string} menuPrice - The selling price of the menu item
 * @param {number|string} totalRecipeCost - The total cost to make the recipe
 * @returns {number} The gross profit
 */
export const calculateGrossProfit = (menuPrice, totalRecipeCost) => {
  const price = parseFloat(menuPrice) || 0;
  const cost = parseFloat(totalRecipeCost) || 0;
  return price - cost;
};

/**
 * Calculates the gross margin percentage ((Profit / Price) * 100)
 * @param {number|string} menuPrice - The selling price of the menu item
 * @param {number|string} totalRecipeCost - The total cost to make the recipe
 * @returns {number} The gross margin percentage
 */
export const calculateGrossMargin = (menuPrice, totalRecipeCost) => {
  const price = parseFloat(menuPrice) || 0;
  const cost = parseFloat(totalRecipeCost) || 0;
  
  if (price === 0) return 0;
  
  const profit = price - cost;
  return (profit / price) * 100;
};

/**
 * Formats a number to a dynamic currency string
 * @param {number|string} value - The value to format
 * @param {string} currency - The currency symbol or code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency) => {
  return globalFormatCurrency(value, currency);
};

/**
 * Formats a number to a percentage string
 * @param {number|string} value - The value to format
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value) => {
  const num = parseFloat(value) || 0;
  return `${num.toFixed(2)}%`;
};
