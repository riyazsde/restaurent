import React, { useState } from 'react';
import { FiX, FiPlus, FiChevronDown, FiTrash2 } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import itemsService from '../../services/itemsService';

const AddNewItemModal = ({ isOpen, onClose, onAdd, tabId }) => {
    const { t } = useTranslation('common');
    const { data: drinksResponse } = useQuery({
        queryKey: ['barDrinkItemsList'],
        queryFn: () => itemsService.getItemsList({ type: 'Drink', status: 'active' }),
        enabled: isOpen,
        staleTime: 5 * 60 * 1000
    });

    const itemList = Array.isArray(drinksResponse?.data)
        ? drinksResponse.data
        : Array.isArray(drinksResponse?.data?.items)
        ? drinksResponse.data.items
        : Array.isArray(drinksResponse?.items)
        ? drinksResponse.items
        : Array.isArray(drinksResponse)
        ? drinksResponse
        : [];
    const activeItems = itemList.filter((item) => {
        const status = item?.Status ?? item?.status;
        return ![false, 0, 'false', 'inactive', 'hidden'].includes(
            typeof status === 'string' ? status.toLowerCase() : status
        );
    });
    const getItemId = (item) => item?.Items_id ?? item?._id ?? item?.id;
    const getItemName = (item) =>
        item?.Title || item?.['item-name'] || item?.item_name || item?.Item_Name || item?.name || item?.Name;

    const [items, setItems] = useState([{ id: 1, drink_item_id: '', modifier: '' }]);

    if (!isOpen) return null;

    const handleAddRow = () => {
        setItems([...items, { id: Date.now(), drink_item_id: '', modifier: '' }]);
    };

    const handleRemoveRow = (idToRemove) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== idToRemove));
        }
    };

    const handleUpdateItem = (id, field, value) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleSubmit = () => {
        // Filter out items that haven't selected a drink yet
        const validItems = items.filter(item => item.drink_item_id !== '');
        
        // Pass array of valid items back to parent
        onAdd(tabId, validItems.map(item => ({
            drink_item_id: /^\d+$/.test(item.drink_item_id)
                ? parseInt(item.drink_item_id, 10)
                : item.drink_item_id,
            quantity: 1,
            modifiers: item.modifier ? [item.modifier] : []
        })));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 font-poppins">
            <div className="bg-white rounded-[24px] w-full max-w-[600px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Gradient Header */}
                <div className="bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] p-8 text-white relative shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-white hover:text-gray-200 transition-colors"
                    >
                        <FiX size={24} />
                    </button>
                    <h2 className="text-2xl font-bold mb-2">
                        Add New Item
                    </h2>
                    <p className="text-white/80 text-[14px]">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                    </p>
                </div>

                {/* Form Content */}
                <div className="p-8 pb-4 overflow-y-auto">
                    <h3 className="text-[18px] font-bold text-gray-900 mb-6">Basic Information</h3>
                    
                    {items.map((item, index) => (
                        <div key={item.id} className="flex flex-col md:flex-row gap-4 mb-6 relative group">
                            {/* Drink's Name / Select */}
                            <div className="flex-1">
                                <label className="block text-[14px] text-gray-700 font-medium mb-2">
                                    Select Drink *
                                </label>
                                <div className="relative">
                                    <select
                                        value={item.drink_item_id}
                                        onChange={(e) => handleUpdateItem(item.id, 'drink_item_id', e.target.value)}
                                        className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-lg text-[15px] text-gray-900 focus:outline-none focus:border-pink-500 appearance-none bg-white"
                                    >
                                        <option value="" disabled className="text-gray-500 bg-white">
                                            {activeItems.length
                                                ? t('bar.addNewItem.chooseItem', '-- Choose an item --')
                                                : t('bar.addNewItem.noItemsAvailable', 'No items available')}
                                        </option>
                                        {activeItems.map((menuItem, index) => {
                                            const itemId = getItemId(menuItem);
                                            const itemName = getItemName(menuItem);
                                            if (itemId == null || !itemName) return null;
                                            return (
                                                <option key={itemId || index} value={itemId} className="text-gray-900 bg-white">
                                                    {itemName}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <FiChevronDown size={20} />
                                    </div>
                                </div>
                            </div>

                            {/* Drinks Modifiers */}
                            <div className="flex-1">
                                <label className="block text-[14px] text-gray-700 font-medium mb-2">
                                    Drinks Modifiers
                                </label>
                                <div className="relative flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <select
                                            value={item.modifier}
                                            onChange={(e) => handleUpdateItem(item.id, 'modifier', e.target.value)}
                                            className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-lg text-[15px] focus:outline-none focus:border-pink-500 appearance-none bg-white text-gray-500"
                                        >
                                            <option value="" disabled>Select modifiers</option>
                                            <option value="On the rocks">On the rocks</option>
                                            <option value="Extra lime">Extra lime</option>
                                            <option value="No ice">No ice</option>
                                            <option value="Salt rim">Salt rim</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                            <FiChevronDown size={20} />
                                        </div>
                                    </div>
                                    {items.length > 1 && (
                                        <button 
                                            onClick={() => handleRemoveRow(item.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 absolute -right-10 top-1/2 -translate-y-1/2"
                                            title="Remove item"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-center mb-4 mt-2">
                        <button 
                            onClick={handleAddRow}
                            className="bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white px-10 py-2.5 rounded-lg font-medium text-[15px] hover:opacity-90 transition-opacity"
                        >
                            + Add item
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 flex gap-4 bg-gray-50 border-t border-gray-100 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 border border-gray-200 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 py-3.5 bg-[#A817FB] rounded-xl font-medium text-white hover:opacity-90 transition-opacity shadow-sm"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddNewItemModal;
