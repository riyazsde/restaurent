import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import itemsService from '../../services/itemsService';
import itemTypesService from '../../services/itemTypesService';
import { IMAGE_BASE_URL } from '../../services/fileUploadService';
import SegmentedTab from '../common/SegmentedTab';
import { formatCurrency } from '../../utils/currencyUtils';

const EmployeeQuickOrder = () => {
    const [orderType, setOrderType] = useState('Food');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch Categories
    const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
        queryKey: ['itemTypes', orderType],
        queryFn: () => itemTypesService.getAllItemTypes(orderType)
    });

    // Fetch Items
    const { data: itemsData, isLoading: itemsLoading } = useQuery({
        queryKey: ['itemsList', orderType, selectedCategory, searchQuery],
        queryFn: () => itemsService.getItemsList({ 
            type: orderType, 
            category_id: selectedCategory, 
            search: searchQuery 
        })
    });

    const categories = categoriesData?.data || [];
    const items = itemsData?.data || [];

    return (
        <div className="h-full flex flex-col font-sans">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    {orderType === 'Food' ? 'Quick Orders' : 'Bar Management'}
                </h1>
                
                {/* Right Header Actions */}
                <div className="flex items-center space-x-4">
                    {orderType === 'Bar' && (
                        <button 
                            onClick={() => window.location.href = '/dashboard/bar-tabs'} 
                            className="px-6 py-[9px] text-sm font-medium text-white rounded-lg shadow-sm transition-all" 
                            style={{ background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)' }}
                        >
                            + Open Bar Tab
                        </button>
                    )}
                    {/* Toggle Food / Bar */}
                    <SegmentedTab 
                        tabs={[
                            { id: 'Food', label: 'Food' },
                            { id: 'Bar', label: 'Bar' }
                        ]}
                        activeTab={orderType}
                        onTabChange={setOrderType}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex gap-6 min-h-0">
                
                {/* Left Side: Categories and Menu Grid */}
                <div className="flex-[2.5] flex flex-col bg-[#fdfafb] rounded-2xl p-6 shadow-sm min-h-0 border border-gray-100">
                    
                    {/* Category Filter */}
                    <div className="flex items-center space-x-3 mb-8 overflow-x-auto pb-2 custom-scrollbar">
                        <button 
                            onClick={() => setSelectedCategory('all')}
                            className={`flex-shrink-0 px-6 py-2 rounded-full shadow-sm text-[15px] font-semibold whitespace-nowrap border transition-colors ${
                                selectedCategory === 'all' 
                                    ? 'bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white border-transparent' 
                                    : 'bg-white text-gray-800 border-gray-100 hover:border-pink-200'
                            }`}
                        >
                            All Items
                        </button>
                        
                        {categoriesLoading ? (
                            <div className="text-sm text-gray-500 py-2">Loading categories...</div>
                        ) : (
                            categories.map((category, index) => {
                                const catId = category.id || category.Item_type_id || category.category_id || category.Id || index;
                                return (
                                    <button 
                                        key={catId}
                                        onClick={() => setSelectedCategory(catId)}
                                        className={`flex-shrink-0 flex items-center px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                                            selectedCategory === catId
                                                ? 'bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white'
                                                : 'bg-transparent hover:bg-white text-gray-600'
                                        }`}
                                    >
                                        <span className="text-[15px] font-medium">
                                            {category.emozi && <span className="mr-2">{category.emozi}</span>}
                                            {category.Name}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Menu Grid */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                        {itemsLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-gray-500 font-medium">Loading items...</p>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-gray-500 font-medium">No items found in this category.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {items.map((item) => (
                                    <div key={item._id || item.Items_id} className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow">
                                        <div className="w-[100px] h-[100px] mb-4 flex items-center justify-center">
                                            {item.image ? (
                                                <img 
                                                    src={item.image.startsWith('http') ? item.image : `${IMAGE_BASE_URL}${item.image}`} 
                                                    alt={item['item-name']} 
                                                    className="w-[80px] h-[80px] object-cover rounded-full" 
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/80';
                                                    }}
                                                />
                                            ) : orderType === 'Food' ? (
                                                <div className="w-[80px] h-[80px] bg-[#fff5f7] rounded-full flex items-center justify-center text-4xl">
                                                    🍔
                                                </div>
                                            ) : (
                                                <div className="w-[60px] h-[80px] bg-transparent flex items-center justify-center text-[60px]">
                                                    🍺
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-[14px] font-bold text-gray-900 text-center mb-1 leading-tight line-clamp-2 min-h-[40px] flex items-center justify-center">
                                            {item['item-name']}
                                        </h3>
                                        <p className="text-[12px] font-bold text-gray-900 uppercase tracking-wide">
                                            {formatCurrency(item['item-price'])}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Order Sidebar */}
                <div className="flex-[1] bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col items-center justify-center min-w-[320px] p-6">
                    <div className="text-center text-gray-500 font-semibold space-y-2">
                        <h2 className="text-[22px]">Tap to Select Table</h2>
                        <h2 className="text-[22px]">&</h2>
                        <h2 className="text-[22px]">Start Order</h2>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EmployeeQuickOrder;
