import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    FiX, 
    FiPlus, 
    FiMinus, 
    FiBox, 
    FiAlertTriangle, 
    FiCheckCircle, 
    FiCalendar, 
    FiTrendingDown, 
    FiTrendingUp 
} from 'react-icons/fi';
import { formatCurrency } from '../../../utils/currencyUtils';
import { calculateDaysToExpiry, calculateStockStatus } from '../../../utils/inventoryUtils';

const InventoryDetailsModal = ({ item, currency, onClose, onAdjustStock, isAdjusting, categories = [] }) => {
    const { t } = useTranslation('settings');
    const [isAdjustingOpen, setIsAdjustingOpen] = useState(false);
    const [adjustQty, setAdjustQty] = useState('');
    const [adjustType, setAdjustType] = useState('add'); // 'add' or 'subtract'

    if (!item) return null;

    const current = parseFloat(item.on_hand_quantity !== undefined ? item.on_hand_quantity : (item.on_hand !== undefined ? item.on_hand : item.stock)) || 0;
    const min = parseFloat(item.minimum_stock !== undefined ? item.minimum_stock : item.min_stock) || 0;
    const max = parseFloat(item.maximum_stock !== undefined ? item.maximum_stock : item.max_stock) || 0;
    const cost = parseFloat(item.cost_per_unit !== undefined ? item.cost_per_unit : item.costPerUnit) || 0;
    const expiry = item.expiry_date || item.expiryDate;
    const unit = item.unit || 'g';
    const totalValue = current * cost;
    const daysLeft = calculateDaysToExpiry(expiry);
    const status = calculateStockStatus(current, min, max, expiry);

    const categoryName = (() => {
        if (item.category_name) return item.category_name;
        if (typeof item.category === 'string' && isNaN(Number(item.category))) return item.category;
        const catId = item.category_id || item.category;
        const found = categories.find(c => String(c.id || c._id) === String(catId));
        return found ? (found.category_name || found.name) : (item.category || 'General');
    })();

    const handleAdjustSubmit = (e) => {
        e.preventDefault();
        const delta = parseFloat(adjustQty);
        if (!delta || delta <= 0) return;
        const newQty = adjustType === 'add' ? current + delta : Math.max(0, current - delta);
        if (onAdjustStock) {
            onAdjustStock(item.id || item._id, newQty, delta, adjustType);
        }
        setAdjustQty('');
        setIsAdjustingOpen(false);
    };

    // Helper for Status Badge Pill matching Figma
    const getStatusPill = (st) => {
        switch (st) {
            case 'Critical':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                        <FiAlertTriangle className="w-3.5 h-3.5" />
                        <span>{t('inventory.critical', 'Critical')}</span>
                    </span>
                );
            case 'Low Stock':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                        <FiTrendingDown className="w-3.5 h-3.5" />
                        <span>{t('inventory.lowStock', 'Low Stock')}</span>
                    </span>
                );
            case 'Expiring Soon':
            case 'Expired':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEFCE8] text-[#CA8A04] border border-[#FEF08A]">
                        <FiCalendar className="w-3.5 h-3.5" />
                        <span>{t('inventory.expiringSoon', 'Expiring Soon')}</span>
                    </span>
                );
            case 'Overstocked':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF5FF] text-[#9333EA] border border-[#F3E8FF]">
                        <FiTrendingUp className="w-3.5 h-3.5" />
                        <span>{t('inventory.overstocked', 'Overstocked')}</span>
                    </span>
                );
            case 'OK':
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]">
                        <FiCheckCircle className="w-3.5 h-3.5" />
                        <span>{t('inventory.ok', 'OK')}</span>
                    </span>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 font-poppins">
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-6 sm:p-8 flex flex-col relative max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button 
                    type="button"
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                    <FiX className="w-5 h-5" />
                </button>

                {/* Header: Icon, Name, Category */}
                <div className="flex items-start gap-4 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#F5EEFB] text-[#8200DB] flex items-center justify-center shrink-0">
                        <FiBox className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                            {item.ingredient_name || item.name}
                        </h2>
                        <p className="text-gray-400 text-sm font-normal mt-0.5">
                            {categoryName}
                        </p>
                    </div>
                </div>

                {/* Status Pill */}
                <div className="mb-6">
                    {getStatusPill(status)}
                </div>

                {/* Divider Line */}
                <div className="border-t border-gray-100 mb-6"></div>

                {/* Two-Column Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Column 1: STOCK INFORMATION */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                            {t('inventory.stockInformationTitle', 'STOCK INFORMATION')}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-400 font-normal">
                                    {t('inventory.onHandQuantity', 'On-Hand Quantity')}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mt-0.5">
                                    {current.toLocaleString()} {unit}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-normal">
                                    {t('inventory.minStock', 'Minimum Stock')}
                                </p>
                                <p className="text-base font-bold text-gray-900 mt-0.5">
                                    {min.toLocaleString()} {unit}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-normal">
                                    {t('inventory.maxStock', 'Maximum Stock')}
                                </p>
                                <p className="text-base font-bold text-gray-900 mt-0.5">
                                    {max.toLocaleString()} {unit}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: ADDITIONAL DETAILS */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                            {t('inventory.additionalDetailsTitle', 'ADDITIONAL DETAILS')}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-400 font-normal">
                                    {t('inventory.expiryDate', 'Expiry Date')}
                                </p>
                                <p className="text-base font-bold text-gray-900 mt-0.5">
                                    {expiry ? String(expiry).split('T')[0] : 'N/A'}
                                </p>
                                {daysLeft !== null && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {daysLeft < 0 
                                            ? t('inventory.expired', 'Expired') 
                                            : t('inventory.daysRemaining', '{{days}} days remaining', { days: daysLeft })}
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-normal">
                                    {t('inventory.costPerUnit', 'Cost Per Unit')}
                                </p>
                                <p className="text-base font-bold text-gray-900 mt-0.5">
                                    {formatCurrency(cost, currency)}/{unit}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-normal">
                                    {t('inventory.totalValue', 'Total Value')}
                                </p>
                                <p className="text-base font-bold text-gray-900 mt-0.5">
                                    {formatCurrency(totalValue, currency)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: SUPPLIER INFORMATION */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                            {t('inventory.supplierInformationTitle', 'SUPPLIER INFORMATION')}
                        </h3>
                        <div>
                            <p className="text-sm text-gray-400 font-normal">
                                {t('inventory.supplier', 'Supplier')}
                            </p>
                            <p className="text-base font-bold text-gray-900 mt-0.5">
                                {item.supplier || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Row 2: LAST RESTOCKED */}
                    <div className="sm:pt-7">
                        <div>
                            <p className="text-sm text-gray-400 font-normal">
                                {t('inventory.lastRestocked', 'Last Restocked')}
                            </p>
                            <p className="text-base font-bold text-gray-900 mt-0.5">
                                {item.last_restocked 
                                    ? String(item.last_restocked).split('T')[0] 
                                    : (item.updated_at ? String(item.updated_at).split('T')[0] : (item.created_at ? String(item.created_at).split('T')[0] : '2026-04-20'))}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Stock Adjustment (inline when opened) */}
                {isAdjustingOpen && (
                    <div className="mt-6 pt-5 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                {t('inventory.quickStockAdjustment', 'Quick Stock Adjustment')}
                            </span>
                            <button 
                                type="button" 
                                onClick={() => setIsAdjustingOpen(false)}
                                className="text-xs text-gray-400 hover:text-gray-600"
                            >
                                {t('inventory.cancel', 'Cancel')}
                            </button>
                        </div>
                        <form onSubmit={handleAdjustSubmit} className="flex flex-wrap items-center gap-2">
                            <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-semibold">
                                <button 
                                    type="button"
                                    onClick={() => setAdjustType('add')}
                                    className={`px-3.5 py-2.5 flex items-center gap-1.5 transition-colors ${
                                        adjustType === 'add' ? 'bg-[#8200DB] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <FiPlus className="w-3.5 h-3.5" />
                                    <span>{t('inventory.addStock', 'Add Stock')}</span>
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setAdjustType('subtract')}
                                    className={`px-3.5 py-2.5 flex items-center gap-1.5 border-l border-gray-200 transition-colors ${
                                        adjustType === 'subtract' ? 'bg-[#8200DB] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <FiMinus className="w-3.5 h-3.5" />
                                    <span>{t('inventory.reduceStock', 'Reduce Stock')}</span>
                                </button>
                            </div>
                            <input 
                                type="number"
                                step="any"
                                min="0.01"
                                required
                                placeholder={`${t('inventory.amount', 'Amount')} (${unit})`}
                                value={adjustQty}
                                onChange={(e) => setAdjustQty(e.target.value)}
                                className="flex-1 min-w-[120px] px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB]"
                                autoFocus
                            />
                            <button 
                                type="submit"
                                disabled={isAdjusting || !adjustQty}
                                className="px-5 py-2.5 bg-[#8200DB] hover:bg-[#7200c4] text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                            >
                                {isAdjusting ? t('inventory.applying', 'Applying...') : t('inventory.apply', 'Apply')}
                            </button>
                        </form>
                    </div>
                )}

                {/* Footer Buttons matching Image 1 */}
                <div className="border-t border-gray-100 pt-5 mt-6 flex gap-4">
                    <button 
                        type="button"
                        onClick={() => setIsAdjustingOpen(prev => !prev)}
                        className="flex-1 py-3 px-4 bg-[#8200DB] hover:bg-[#7200c4] text-white font-medium rounded-xl transition-colors shadow-xs text-center text-sm"
                    >
                        {t('inventory.adjustStock', 'Adjust Stock')}
                    </button>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 px-4 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors text-center text-sm"
                    >
                        {t('inventory.close', 'Close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InventoryDetailsModal;
