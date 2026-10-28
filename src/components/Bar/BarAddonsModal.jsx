import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Check } from 'lucide-react';

const BarAddonsModal = ({
    isOpen = false,
    onClose,
    item,
    tableId = '04',
    onSave,
    currency = 'XOF'
}) => {
    const { t } = useTranslation('common');

    // Default sizes / quantity options - not prechecked by default
    const defaultSizes = ['Mug', 'Jar', 'Pitcher', 'Bottel'];
    const [selectedSize, setSelectedSize] = useState('');

    // Temperature / prep options - not prechecked by default
    const [temperature, setTemperature] = useState('');

    // Additional add-ons
    const [addons, setAddons] = useState({
        iceOnTheRock: false,
        extraLime: false
    });

    // Notes
    const [notes, setNotes] = useState('');

    // Reset all selections to unchecked whenever modal opens or item changes
    useEffect(() => {
        if (isOpen) {
            setSelectedSize('');
            setTemperature('');
            setAddons({
                iceOnTheRock: false,
                extraLime: false
            });
            setNotes('');
        }
    }, [isOpen, item]);

    if (!isOpen || !item) return null;

    const formattedTable = String(tableId).padStart(2, '0');
    const categoryTitle = item.Category?.Name || item.category || 'Draft';
    const itemTitle = item.Title || item['item-name'] || item.name || 'Drink';

    const handleToggleSize = (size) => {
        setSelectedSize(prev => prev === size ? '' : size);
    };

    const handleToggleTemp = (temp) => {
        setTemperature(prev => prev === temp ? '' : temp);
    };

    const handleSave = () => {
        const selectedAddonNames = [];
        let addonPrice = 0;

        if (addons.extraLime) {
            selectedAddonNames.push('Add extra Lime (+50)');
            addonPrice += 50;
        }
        if (addons.iceOnTheRock) {
            selectedAddonNames.push('Ice on the rock');
        }

        const customizedItem = {
            item,
            title: itemTitle,
            category: item.Category?.Name || 'Cocktails',
            size: selectedSize || 'Regular',
            temperature: temperature || '',
            addons: selectedAddonNames,
            addonsText: selectedAddonNames.length > 0 ? selectedAddonNames.join(', ') : '',
            notes,
            price: Number(item.Price || item['item-price'] || item.Net_Price || 399) + addonPrice,
            basePrice: Number(item.Price || item['item-price'] || item.Net_Price || 399)
        };

        onSave?.(customizedItem);
        onClose?.();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div 
                className="bg-white rounded-3xl shadow-2xl w-full max-w-[460px] overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header Banner */}
                <div 
                    className="px-6 py-4 flex items-center justify-between relative"
                    style={{
                        background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.45) 0%, rgba(244, 114, 182, 0.45) 100%)'
                    }}
                >
                    <div>
                        <h2 className="text-[24px] font-bold font-manrope text-gray-900 leading-tight">
                            {t('bar.addons.title', 'Addons')}
                        </h2>
                        <p className="text-[13px] font-medium text-gray-700 mt-0.5">
                            {categoryTitle}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-[13px] font-semibold text-gray-800 font-manrope">
                            {t('bar.table', 'Table')} -{formattedTable}
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-7 h-7 rounded-full bg-white/60 hover:bg-white text-gray-700 flex items-center justify-center transition-all"
                        >
                            <X className="w-4 h-4 stroke-[2.5]" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 font-manrope">
                    {/* 1. Quantity / Serving Size */}
                    <div>
                        <h3 className="text-[16px] font-bold text-gray-900 mb-3">
                            {t('bar.addons.quantity', 'Quantity')}
                        </h3>
                        <div className="flex flex-wrap gap-4 sm:gap-6 items-center">
                            {defaultSizes.map((size) => {
                                const isChecked = selectedSize === size;
                                return (
                                    <label
                                        key={size}
                                        onClick={() => handleToggleSize(size)}
                                        className="flex items-center gap-2 cursor-pointer select-none text-[15px] font-medium text-gray-900 hover:text-black"
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                            isChecked 
                                                ? 'border-gray-900 bg-gray-900 text-white' 
                                                : 'border-gray-400 bg-white'
                                        }`}>
                                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                        <span>{size}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. Temperature / Prep Options */}
                    <div>
                        <h3 className="text-[16px] font-bold text-gray-900 mb-3">
                            {t('bar.addons.additional', 'Additional')}
                        </h3>
                        <div className="flex flex-wrap gap-6 items-center">
                            {['Full Chilled', 'Warm'].map((temp) => {
                                const isChecked = temperature === temp;
                                return (
                                    <label
                                        key={temp}
                                        onClick={() => handleToggleTemp(temp)}
                                        className="flex items-center gap-2 cursor-pointer select-none text-[15px] font-medium text-gray-900 hover:text-black"
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                            isChecked 
                                                ? 'border-gray-900 bg-gray-900 text-white' 
                                                : 'border-gray-400 bg-white'
                                        }`}>
                                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                        <span>{temp}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Addons with pricing */}
                    <div>
                        <h3 className="text-[16px] font-bold text-gray-900 mb-3">
                            {t('bar.addons.additional', 'Additional')}
                        </h3>
                        <div className="flex flex-wrap gap-5 items-center">
                            <label
                                onClick={() => setAddons(prev => ({ ...prev, iceOnTheRock: !prev.iceOnTheRock }))}
                                className="flex items-center gap-2 cursor-pointer select-none text-[15px] font-medium text-gray-900 hover:text-black"
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                    addons.iceOnTheRock 
                                        ? 'border-gray-900 bg-gray-900 text-white' 
                                        : 'border-gray-400 bg-white'
                                }`}>
                                    {addons.iceOnTheRock && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span>{t('bar.addons.iceOnTheRock', 'Ice on the rock')}</span>
                            </label>

                            <label
                                onClick={() => setAddons(prev => ({ ...prev, extraLime: !prev.extraLime }))}
                                className="flex items-center gap-2 cursor-pointer select-none text-[15px] font-medium text-gray-900 hover:text-black"
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                    addons.extraLime 
                                        ? 'border-gray-900 bg-gray-900 text-white' 
                                        : 'border-gray-400 bg-white'
                                }`}>
                                    {addons.extraLime && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span>{t('bar.addons.extraLime', 'Extra lime (+50rs Extra)')}</span>
                            </label>
                        </div>
                    </div>

                    {/* 4. Notes Section */}
                    <div>
                        <h3 className="text-[16px] font-bold text-gray-900 mb-2">
                            {t('bar.addons.note', 'Note')}
                        </h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder={t('bar.addons.notesPlaceholder', 'Enter Notes here.....')}
                            className="w-full bg-[#f8eff5] rounded-xl p-3.5 border border-pink-100 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none font-manrope"
                        />
                    </div>
                </div>

                {/* Modal Footer / Save Action */}
                <div className="p-6 pt-2">
                    <button
                        type="button"
                        onClick={handleSave}
                        className="w-full py-3.5 rounded-xl font-bold text-white text-[16px] shadow-md bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] hover:opacity-95 active:scale-[0.99] transition-all font-manrope"
                    >
                        {t('bar.addons.save', 'Save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BarAddonsModal;
