import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ChevronDown, ChevronUp, Trash2, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import itemsService from '../../services/itemsService';

const MODIFIER_OPTIONS = [
    'On the rocks',
    'Extra lime',
    'No ice',
    'Double shot',
    'Neat',
    'Extra mint',
    'Salt rim',
    'Virgin',
    'Light ice',
    'Full Chilled',
    'Warm',
    'Splash of soda'
];

const AddNewTabModal = ({
    isOpen = false,
    onClose,
    onSubmit,
    isLoading = false
}) => {
    const { t } = useTranslation('common');

    const [clientName, setClientName] = useState('');
    const [tableNo, setTableNo] = useState('');
    const [selectedDrinkName, setSelectedDrinkName] = useState('');
    const [selectedDrinkId, setSelectedDrinkId] = useState('');
    const [selectedModifiers, setSelectedModifiers] = useState([]);
    const [isModifierDropdownOpen, setIsModifierDropdownOpen] = useState(false);
    const modifierRef = useRef(null);
    const [queuedItems, setQueuedItems] = useState([]);
    const [error, setError] = useState('');

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modifierRef.current && !modifierRef.current.contains(e.target)) {
                setIsModifierDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch drinks list to auto-complete or select drink items
    const { data: drinksResponse } = useQuery({
        queryKey: ['barDrinkItemsList'],
        queryFn: () => itemsService.getItemsList({ type: 'Drink' }),
        enabled: isOpen,
        staleTime: 5 * 60 * 1000
    });

    const drinkOptions = drinksResponse?.data || [];

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setClientName('');
            setTableNo('');
            setSelectedDrinkName('');
            setSelectedDrinkId('');
            setSelectedModifiers([]);
            setIsModifierDropdownOpen(false);
            setQueuedItems([]);
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleDrinkInputChange = (value) => {
        setSelectedDrinkName(value);
        setError('');
        const match = drinkOptions.find(d => 
            (d.Title || d['item-name'] || '').toLowerCase() === value.toLowerCase()
        );
        if (match) {
            setSelectedDrinkId(match.Items_id || match._id || match.id);
        } else {
            setSelectedDrinkId('');
        }
    };

    const handleToggleModifier = (mod) => {
        setSelectedModifiers(prev => 
            prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
        );
    };

    const handleAddDrinkItem = () => {
        if (!selectedDrinkName.trim()) {
            return;
        }

        const match = drinkOptions.find(d => 
            (d.Title || d['item-name'] || '').toLowerCase() === selectedDrinkName.trim().toLowerCase()
        );
        const resolvedId = match ? (match.Items_id || match._id || match.id) : selectedDrinkId;
        const resolvedTitle = match ? (match.Title || match['item-name']) : selectedDrinkName.trim();

        setQueuedItems(prev => [
            ...prev,
            {
                id: Date.now(),
                drink_item_id: resolvedId,
                drink_name: resolvedTitle,
                title: resolvedTitle,
                quantity: 1,
                modifiers: [...selectedModifiers]
            }
        ]);

        setSelectedDrinkName('');
        setSelectedDrinkId('');
        setSelectedModifiers([]);
        setIsModifierDropdownOpen(false);
    };

    const handleRemoveItem = (id) => {
        setQueuedItems(prev => prev.filter(item => item.id !== id));
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (!clientName.trim()) {
            setError(t('bar.addNewTab.errors.clientName', 'Client name is required'));
            return;
        }
        if (!tableNo.trim()) {
            setError(t('bar.addNewTab.errors.tableNo', 'Table number is required'));
            return;
        }

        // Include any partially filled drink that wasn't explicitly added via "+ Add item"
        let itemsToSend = [...queuedItems];
        if (selectedDrinkName.trim()) {
            const match = drinkOptions.find(d => 
                (d.Title || d['item-name'] || '').toLowerCase() === selectedDrinkName.trim().toLowerCase()
            );
            const resolvedId = match ? (match.Items_id || match._id || match.id) : selectedDrinkId;
            const resolvedTitle = match ? (match.Title || match['item-name']) : selectedDrinkName.trim();

            itemsToSend.push({
                drink_item_id: resolvedId,
                drink_name: resolvedTitle,
                title: resolvedTitle,
                quantity: 1,
                modifiers: [...selectedModifiers]
            });
        }

        const firstItem = itemsToSend[0] || {};
        const rootDrinkName = firstItem.drink_name || firstItem.title || (selectedDrinkName.trim() || undefined);
        const rootDrinkItemId = firstItem.drink_item_id || selectedDrinkId || undefined;

        const payload = {
            client_name: clientName.trim(),
            table_no: tableNo.startsWith('#') ? tableNo.trim() : `#${tableNo.trim()}`,
            ...(rootDrinkName ? { drink_name: rootDrinkName } : {}),
            ...(rootDrinkItemId ? { drink_item_id: rootDrinkItemId } : {}),
            quantity: firstItem.quantity || 1,
            modifiers: firstItem.modifiers || selectedModifiers,
            items: itemsToSend.map(item => ({
                drink_item_id: item.drink_item_id,
                drink_name: item.drink_name || item.title,
                quantity: item.quantity || 1,
                modifiers: item.modifiers || []
            }))
        };

        onSubmit?.(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
            <div 
                className="bg-white rounded-[24px] shadow-2xl w-full max-w-[620px] overflow-hidden flex flex-col font-manrope"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with rich berry-to-crimson gradient */}
                <div className="bg-gradient-to-r from-[#6A1657] via-[#85164B] to-[#AE1838] px-8 py-6 text-white relative shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-6 right-6 text-white/80 hover:text-white transition-opacity"
                    >
                        <X className="w-5 h-5 stroke-[2.5]" />
                    </button>
                    <h2 className="text-[26px] font-bold tracking-tight mb-1">
                        {t('bar.addNewTab.title', 'Add New Tab')}
                    </h2>
                    <p className="text-white/80 text-[13px]">
                        {t('bar.addNewTab.subtitle', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.')}
                    </p>
                </div>

                {/* Form Content */}
                <div className="p-8 space-y-5 overflow-y-auto max-h-[75vh]">
                    <h3 className="text-[17px] font-bold text-gray-900">
                        {t('bar.addNewTab.basicInfo', 'Basic Information')}
                    </h3>

                    {error && (
                        <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                            {error}
                        </div>
                    )}

                    {/* Row 1: Client Name & Table No */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                                {t('bar.addNewTab.clientName', 'Client Name')} *
                            </label>
                            <input
                                type="text"
                                value={clientName}
                                onChange={(e) => {
                                    setClientName(e.target.value);
                                    setError('');
                                }}
                                placeholder="e.g., Ahmad Aminoff"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                                {t('bar.addNewTab.tableNo', 'Table No')} *
                            </label>
                            <input
                                type="text"
                                value={tableNo}
                                onChange={(e) => {
                                    setTableNo(e.target.value);
                                    setError('');
                                }}
                                placeholder="e.g., #7"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all bg-white"
                            />
                        </div>
                    </div>

                    {/* Row 2: Drink's Name & Drinks Modifiers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                                {t('bar.addNewTab.drinkName', "Drink's Name")} *
                            </label>
                            <div>
                                <input
                                    list="drink-suggestions"
                                    type="text"
                                    value={selectedDrinkName}
                                    onChange={(e) => handleDrinkInputChange(e.target.value)}
                                    placeholder="e.g., Corona"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all bg-white"
                                />
                                <datalist id="drink-suggestions">
                                    {drinkOptions.map(d => (
                                        <option 
                                            key={d._id || d.Items_id || d.id} 
                                            value={d.Title || d['item-name']} 
                                        />
                                    ))}
                                </datalist>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                                {t('bar.addNewTab.drinksModifiers', 'Drinks Modifiers')}
                            </label>
                            <div className="relative" ref={modifierRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsModifierDropdownOpen(prev => !prev)}
                                    className={`w-full px-4 py-3 bg-white border border-gray-200 text-sm flex items-center justify-between cursor-pointer transition-all text-left focus:outline-none focus:ring-2 focus:ring-purple-300 ${
                                        isModifierDropdownOpen 
                                            ? 'rounded-t-xl border-b-gray-100 ring-2 ring-purple-200' 
                                            : 'rounded-xl hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex-1 truncate mr-2">
                                        {selectedModifiers.length === 0 ? (
                                            <span className="text-gray-400 font-normal">
                                                {t('bar.addNewTab.selectModifiers', 'Select modifiers')}
                                            </span>
                                        ) : (
                                            <span className="text-gray-800 font-medium">
                                                {selectedModifiers.join(', ')}
                                            </span>
                                        )}
                                    </div>
                                    {isModifierDropdownOpen ? (
                                        <ChevronUp className="w-4 h-4 text-gray-700 shrink-0 stroke-[2.5]" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0 stroke-[2.5]" />
                                    )}
                                </button>

                                {isModifierDropdownOpen && (
                                    <div className="absolute left-0 right-0 top-full -mt-px z-50 bg-white border border-gray-200 border-t-0 rounded-b-xl shadow-lg max-h-56 overflow-y-auto custom-scrollbar">
                                        {MODIFIER_OPTIONS.map((mod) => {
                                            const isSelected = selectedModifiers.includes(mod);
                                            return (
                                                <div
                                                    key={mod}
                                                    onClick={() => handleToggleModifier(mod)}
                                                    className="px-4 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-colors hover:bg-purple-50/50 group select-none"
                                                >
                                                    <span className={`text-[13.5px] ${isSelected ? 'font-semibold text-purple-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                                                        {mod}
                                                    </span>
                                                    <div className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition-all ${
                                                        isSelected 
                                                            ? 'bg-purple-700 border-purple-700 text-white' 
                                                            : 'border-gray-300 group-hover:border-purple-300 bg-white'
                                                    }`}>
                                                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Centered '+ Add item' Button */}
                    <div className="flex justify-center pt-1">
                        <button
                            type="button"
                            onClick={handleAddDrinkItem}
                            className="px-6 py-2 rounded-xl text-white font-bold text-sm shadow-sm bg-gradient-to-r from-[#6A1657] via-[#85164B] to-[#AE1838] hover:opacity-95 active:scale-95 transition-all"
                        >
                            + {t('bar.addNewTab.addItem', 'Add item')}
                        </button>
                    </div>

                    {/* Queued Items List */}
                    {queuedItems.length > 0 && (
                        <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
                            <span className="text-xs font-bold text-purple-900 block">
                                {t('bar.addNewTab.itemsToOrder', 'Items to Order')}:
                            </span>
                            <div className="space-y-1.5">
                                {queuedItems.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className="flex items-center justify-between text-xs bg-white px-3 py-1.5 rounded-lg border border-purple-100 shadow-xs"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">{item.title}</span>
                                            {item.modifiers.length > 0 && (
                                                <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-semibold">
                                                    {item.modifiers.join(', ')}
                                                </span>
                                            )}
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons: Cancel & Add */}
                    <div className="flex items-center justify-between gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-6 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 active:scale-98 transition-all"
                        >
                            {t('common.cancel', 'Cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex-1 py-3 px-6 rounded-xl bg-[#8512EA] hover:bg-[#720cd0] active:scale-98 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
                        >
                            {isLoading ? t('common.saving', 'Adding...') : t('common.add', 'Add')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewTabModal;
