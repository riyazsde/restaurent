import { IMAGE_BASE_URL } from '../../../services/fileUploadService';
export { formatCurrency } from '../../../utils/currencyUtils';

const roundCurrencyAmount = (amount) => Math.round((Number(amount) + Number.EPSILON) * 100) / 100;

/**
 * Resolves full image URL with backend fallback
 */
export const getImageUrl = (imageTail) => {
    if (!imageTail) return '';
    if (imageTail.startsWith('http')) return imageTail;
    return `${IMAGE_BASE_URL}${imageTail}`;
};

/**
 * Formats receipt date and time
 */
export const formatReceiptDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

/**
 * Standardized phone validation (10 to 15 characters, matching backend validation)
 */
export const validatePhoneNumber = (phone) => {
    const cleanedPhone = phone ? String(phone).trim().replace(/[\s\-()]/g, '') : '';
    const phoneRegex = /^\+?[0-9]+$/;
    
    if (!cleanedPhone) {
        return { 
            isValid: false, 
            errorKey: 'errors.phoneRequired', 
            defaultMsg: 'Phone number is required' 
        };
    }
    
    if (!phoneRegex.test(cleanedPhone) || cleanedPhone.length < 10 || cleanedPhone.length > 15) {
        return { 
            isValid: false, 
            errorKey: 'errors.phoneInvalid', 
            defaultMsg: 'Phone must be between 10 and 15 characters (e.g. +2250102030405 or 0987654321)' 
        };
    }
    
    return { isValid: true, cleanedPhone };
};

/**
 * Calculates item pricing details including base price, variants, addons, and total
 */
export const calculateItemPrices = (item) => {
    if (!item) {
        return { basePrice: 0, variantPrice: 0, addonPrice: 0, singleItemPrice: 0, totalPrice: 0, quantity: 1 };
    }

    const basePrice = Number(
        item.itemDetails?.Price ??
        item.itemDetails?.['item-price'] ??
        item.itemDetails?.price ??
        item.itemDetails?.prices ??
        item.itemDetails?.Net_Price ??
        item.Price ??
        item['item-price'] ??
        item.price ??
        item.prices ??
        item.Net_Price ??
        0
    );

    let variantPrice = 0;
    if (Array.isArray(item.selectedVariants) && item.selectedVariants.length > 0) {
        variantPrice = item.selectedVariants.reduce((sum, v) => sum + Number(v.Item_prices || v.price || v.prices || 0), 0);
    } else if (item.variantDetails) {
        const vd = item.variantDetails;
        variantPrice = Number(vd.Item_prices ?? vd.price ?? vd.prices ?? vd.item_Variants_id?.prices ?? 0);
    }

    let addonPrice = 0;
    if (Array.isArray(item.selectedAddons) && item.selectedAddons.length > 0) {
        addonPrice = item.selectedAddons.reduce((sum, a) => sum + Number(a.Item_prices || a.price || a.prices || 0), 0);
    } else if (item.addonDetails) {
        const ad = item.addonDetails;
        addonPrice = Number(ad.Item_prices ?? ad.price ?? ad.prices ?? ad.item_Addons_id?.prices ?? 0);
    }

    const singleItemPrice = basePrice + variantPrice + addonPrice;
    const quantity = Number(item.item_Quentry || item.quantity || 1);
    const totalPrice = singleItemPrice * quantity;

    return {
        basePrice,
        variantPrice,
        addonPrice,
        singleItemPrice,
        totalPrice,
        quantity
    };
};

/**
 * Computes subtotal, tax, and grand total for cart
 */
export const calculateCartTotals = (cartItems = [], taxRate = 0) => {
    const rawSubTotal = cartItems.reduce((acc, item) => {
        const { totalPrice } = calculateItemPrices(item);
        return acc + totalPrice;
    }, 0);

    const rate = Number(taxRate || 0);
    const subTotal = roundCurrencyAmount(rawSubTotal);
    const taxAmount = roundCurrencyAmount(subTotal * (rate / 100));
    const total = roundCurrencyAmount(subTotal + taxAmount);

    return {
        subTotal,
        taxRate: rate,
        taxAmount,
        total
    };
};

/**
 * Validates prerequisites before sending order to kitchen or generating bill
 */
export const validateOrderPrerequisites = ({ cartItems, customer, dining, table, toast }) => {
    if (!cartItems || cartItems.length === 0) {
        if (toast) toast.info('Please add items to cart first');
        return false;
    }
    if (!customer) {
        if (toast) toast.warn('Please select a customer first');
        return false;
    }
    if (!dining) {
        if (toast) toast.warn('Please select a dining option');
        return false;
    }
    if (dining === 'Dine in' && !table) {
        if (toast) toast.warn('Please select a table for Dine in');
        return false;
    }
    return true;
};

/**
 * Builds standard POS order payload
 */
export const buildPosOrderPayload = ({
    cartItems = [],
    selectedCustomer,
    diningOption,
    selectedTable,
    restaurantId,
    kitchenId,
    taxAmount = 0,
    posType = 'Food',
    slot
}) => {
    const customerId = selectedCustomer?.Customer_id || selectedCustomer?.id;
    const tableId = selectedTable?.table_id?.Table_id || selectedTable?.Table_id || selectedTable?.id;

    const items = cartItems.map(item => {
        const { basePrice, variantPrice, addonPrice } = calculateItemPrices(item);
        const quantity = Number(item.item_Quentry) || 1;
        const unitPrice = roundCurrencyAmount(basePrice + variantPrice + addonPrice);
        return {
            item_id: item.item_id,
            item_Quentry: quantity,
            item_Addons_id: item.item_Addons_id || undefined,
            item_Variants_id: item.item_Variants_id || undefined,
            item_status: item.item_status || 'Preparing',
            item_size: item.item_size || item.itemDetails?.['item-size'] || 'Regular',
            item_price: Number(basePrice) || 0,
            variant_price: Number(variantPrice) || 0,
            addon_price: Number(addonPrice) || 0,
            unit_price: unitPrice,
            line_total: roundCurrencyAmount(unitPrice * quantity),
            notes: item.notes || ''
        };
    });

    const { subTotal } = calculateCartTotals(cartItems, 0);
    const finalTax = roundCurrencyAmount(Number(taxAmount) || 0);
    const finalTotal = roundCurrencyAmount(subTotal + finalTax);
    const payload = {
        items,
        SubTotal: subTotal,
        Tax: finalTax,
        Total: finalTotal,
        Grand_Total: finalTotal,
        total_amount: finalTotal,
        Customer_id: customerId,
        Dining_Option: diningOption,
        Order_Type: posType,
        Restaurant_id: restaurantId,
        Kitchen_id: kitchenId,
        Status: true
    };

    if (diningOption === 'Dine in' && tableId) {
        payload.Table_id = tableId;
    }

    if (slot) {
        payload.Restaurant_slot_id = slot._id;
        payload.Slot_Type = slot.slot_type;
        payload.Slot_Time = slot.time;
    }

    return payload;
};
