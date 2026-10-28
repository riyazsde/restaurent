import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiX, FiBox, FiChevronDown } from 'react-icons/fi';

const ManualStockAdjustmentModal = ({ isOpen, onClose, item, onApply, isLoading }) => {
    const { t } = useTranslation('settings');
    const [adjustmentQty, setAdjustmentQty] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAdjustmentQty('');
            setReason('');
        }
    }, [isOpen]);

    if (!isOpen || !item) return null;

    const currentStock = parseFloat(
        item.on_hand_quantity !== undefined 
            ? item.on_hand_quantity 
            : (item.on_hand !== undefined ? item.on_hand : item.stock)
    ) || 0;

    const unit = item.unit || 'g';
    const delta = parseFloat(adjustmentQty);
    const isValidQuantity = !isNaN(delta) && delta !== 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isValidQuantity) return;
        const newQty = Math.max(0, currentStock + delta);
        onApply({
            id: item.id || item._id,
            item,
            delta,
            newQty,
            reason: reason || 'Inventory Correction'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 font-poppins">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                    <FiX className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="mb-5">
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                        {t('inventory.manualStockAdjustment', 'Manual Stock Adjustment')}
                    </h2>
                    <p className="text-gray-400 text-sm font-normal mt-0.5">
                        {item.ingredient_name || item.name}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Current Stock Banner */}
                    <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 flex justify-between items-center">
                        <div>
                            <span className="text-xs text-[#2563EB] font-medium block">
                                {t('inventory.currentStock', 'Current Stock')}
                            </span>
                            <span className="text-2xl font-bold text-[#1D4ED8] mt-0.5 block">
                                {currentStock.toLocaleString()} {unit}
                            </span>
                        </div>
                        <div className="text-[#2563EB]">
                            <FiBox className="w-8 h-8" />
                        </div>
                    </div>

                    {/* Adjustment Quantity Input */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                            {t('inventory.adjustmentQuantity', 'Adjustment Quantity ({{unit}})', { unit })}
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={adjustmentQty}
                            onChange={(e) => setAdjustmentQty(e.target.value)}
                            placeholder={t('inventory.adjustmentQuantityPlaceholder', 'Enter positive number to add, negative to subtract')}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] placeholder:text-gray-400"
                            autoFocus
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            {t('inventory.adjustmentQuantityHelper', 'Use negative numbers to decrease stock (e.g., -500)')}
                        </p>
                    </div>

                    {/* Reason Select */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                            {t('inventory.reason', 'Reason')}
                        </label>
                        <div className="relative">
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8200DB]/20 focus:border-[#8200DB] bg-white appearance-none text-gray-700 pr-10 cursor-pointer"
                            >
                                <option value="">{t('inventory.selectReason', 'Select a reason')}</option>
                                <option value="Inventory Restock">{t('inventory.reasonRestock', 'Inventory Restock')}</option>
                                <option value="Waste/Spoilage">{t('inventory.reasonWaste', 'Waste/Spoilage')}</option>
                                <option value="Inventory Correction">{t('inventory.reasonCorrection', 'Inventory Correction')}</option>
                                <option value="Transfer to New Location">{t('inventory.reasonTransfer', 'Transfer to New Location')}</option>
                                <option value="Damaged Goods">{t('inventory.reasonDamaged', 'Damaged Goods')}</option>
                                <option value="Other">{t('inventory.reasonOther', 'Other')}</option>
                            </select>
                            <FiChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors text-sm text-center"
                        >
                            {t('inventory.cancel', 'Cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={!isValidQuantity || isLoading}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-colors text-center ${
                                isValidQuantity && !isLoading
                                    ? 'bg-[#8200DB] hover:bg-[#7200c4] text-white shadow-xs'
                                    : 'bg-[#D1D5DB] text-white cursor-not-allowed'
                            }`}
                        >
                            {isLoading ? t('inventory.applying', 'Applying...') : t('inventory.applyAdjustment', 'Apply Adjustment')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManualStockAdjustmentModal;
