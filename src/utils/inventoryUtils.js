import { formatCurrency } from './currencyUtils';

/**
 * Calculates stock status based on current stock, min/max thresholds, and expiry date
 */
export const calculateStockStatus = (currentStock, minStock, maxStock, expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    // Check expiry first
    if (expiryDate && !isNaN(expiry.getTime())) {
        const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) return 'Expired';
        if (daysLeft <= 7) return 'Expiring Soon'; // Arbitrary 7-day threshold for 'Soon'
    }

    const current = parseFloat(currentStock) || 0;
    const min = parseFloat(minStock) || 0;
    const max = parseFloat(maxStock) || 0;

    if (current <= min) return 'Critical';
    if (current > min && current <= min * 1.5) return 'Low Stock';
    if (current >= max && max > 0) return 'Overstocked';
    
    return 'OK';
};

/**
 * Calculates total value of the inventory item
 */
export const calculateTotalValue = (quantity, costPerUnit) => {
    const qty = parseFloat(quantity) || 0;
    const cost = parseFloat(costPerUnit) || 0;
    return qty * cost;
};

/**
 * Calculates days to expiry
 */
export const calculateDaysToExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) return null;
    
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

/**
 * Computes aggregate statistics from a list of inventory items.
 * Use this when the backend does not provide a dedicated statistics endpoint.
 */
export const computeInventoryStatistics = (items = []) => {
    let okCount = 0;
    let lowStockCount = 0;
    let criticalCount = 0;
    let expiringCount = 0;
    let overstockedCount = 0;
    let totalValue = 0;

    items.forEach(item => {
        // Standardize keys (backend might use on_hand vs stock vs quantity)
        const current = item.on_hand || item.quantity || item.stock || 0;
        const min = item.min_stock || item.min || 0;
        const max = item.max_stock || item.max || 0;
        const cost = item.cost_per_unit || item.costPerUnit || 0;
        const expiry = item.expiry_date || item.expiryDate || null;

        const status = calculateStockStatus(current, min, max, expiry);
        
        if (status === 'OK') okCount++;
        if (status === 'Low Stock') lowStockCount++;
        if (status === 'Critical') criticalCount++;
        if (status === 'Expiring Soon' || status === 'Expired') expiringCount++;
        if (status === 'Overstocked') overstockedCount++;

        totalValue += calculateTotalValue(current, cost);
    });

    return {
        total_items: items.length,
        ok_count: okCount,
        low_stock_count: lowStockCount,
        critical_count: criticalCount,
        expiring_count: expiringCount,
        overstocked_count: overstockedCount,
        total_value: totalValue
    };
};

export { formatCurrency };
