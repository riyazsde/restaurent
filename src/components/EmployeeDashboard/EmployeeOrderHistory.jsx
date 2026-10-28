import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Utensils, ShoppingBag, Truck } from 'lucide-react';
import posService from '../../services/posService';

const OrderCard = ({ order }) => {
    // Determine status colors and formatting
    const getStatusStyles = (status) => {
        switch (status.type) {
            case 'Preparing':
                return { bg: 'bg-[#ffedd5]', text: 'text-[#f97316]', label: 'Preparing', showTime: true };
            case 'Served':
                return { bg: 'bg-[#dcfce7]', text: 'text-[#22c55e]', label: 'Served', showTime: false, icon: '✓' };
            case 'Cancelled':
                return { bg: 'bg-[#fee2e2]', text: 'text-[#ef4444]', label: 'Cancelled', showTime: true };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-600', label: status.type, showTime: false };
        }
    };

    // Determine order type icon and style
    const getOrderTypeUI = (type) => {
        switch (type) {
            case 'Dine-in':
                return <div className="bg-[#f3f4f6] text-[#4b5563] text-[11px] font-bold px-3 py-1 rounded-md flex items-center"><Utensils className="w-3 h-3 mr-1.5" /> Dine-in</div>;
            case 'Takeaway':
                return <div className="bg-[#f3f4f6] text-[#4b5563] text-[11px] font-bold px-3 py-1 rounded-md flex items-center"><ShoppingBag className="w-3 h-3 mr-1.5" /> Takeaway</div>;
            case 'Delivery':
                return <div className="bg-[#f3f4f6] text-[#4b5563] text-[11px] font-bold px-3 py-1 rounded-md flex items-center"><Truck className="w-3 h-3 mr-1.5 text-orange-500" /> Delivery</div>;
            default:
                return null;
        }
    };

    const s = getStatusStyles(order.status);

    return (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-5 flex flex-col h-full font-sans transition-shadow hover:shadow-md">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-2">
                    <div className="text-blue-500 mt-1">
                        <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight"># {order.id}</h3>
                        <p className="text-[13px] font-bold text-gray-800 mt-1">Table - {order.table}</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">{order.items.length} items</p>
                    </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                    <div className={`flex flex-col items-center px-3 py-1 rounded-lg ${s.bg}`}>
                        <span className={`text-[12px] font-bold ${s.text} flex items-center`}>
                            {s.label}
                            {s.icon && <span className="ml-1.5 w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">{s.icon}</span>}
                        </span>
                        {s.showTime && order.status.time && (
                            <span className={`text-[9px] font-bold ${s.text} mt-0.5`}>Started {order.status.time}</span>
                        )}
                    </div>
                    {getOrderTypeUI(order.type)}
                </div>
            </div>

            {/* Items List */}
            <div className="flex-1 space-y-2.5 mb-6 mt-2">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                        <div className="flex text-[13px] text-gray-700">
                            <span className="w-6 text-gray-500">{item.qty} x</span>
                            <span>{item.name}</span>
                        </div>
                        <span className="text-[13px] font-medium text-gray-900">{item.price} XOF</span>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-gray-200 mb-4"></div>

            {/* Financials */}
            <div className="space-y-1 mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-[12px] text-gray-500">Tax 6%</span>
                    <span className="text-[12px] font-medium text-gray-900">{order.tax} XOF</span>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-[15px] font-bold text-gray-900">Subtotal</div>
                        <div className="text-[10px] text-gray-400 leading-tight">Incl. tax</div>
                    </div>
                    <span className="text-[15px] font-bold text-gray-900">{order.subtotal} XOF</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-auto">
                <button className="bg-[#dcfce7] text-[#16a34a] hover:bg-[#bbf7d0] py-2 rounded-lg text-[13px] font-bold transition-colors">
                    View
                </button>
                <button className="bg-[#dbeafe] text-[#2563eb] hover:bg-[#bfdbfe] py-2 rounded-lg text-[13px] font-bold transition-colors">
                    Reopen
                </button>
                <button className="bg-[#fce7f3] text-[#db2777] hover:bg-[#fbcfe8] py-2 rounded-lg text-[13px] font-bold transition-colors">
                    Print
                </button>
            </div>
        </div>
    );
};

const EmployeeOrderHistory = () => {
    const [filter, setFilter] = useState('All Orders');
    const [ordersToggle, setOrdersToggle] = useState(true);
    const [barToggle, setBarToggle] = useState(true);

    const dummyItems = [
        { qty: 1, name: 'Big Burger', price: '299' },
        { qty: 1, name: 'French Fries', price: '299' },
        { qty: 1, name: 'coco cola', price: '299' },
        { qty: 1, name: 'Pepsi', price: '299' }
    ];

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ['employeeOrders'],
        queryFn: () => posService.getMyOrders()
    });

    const apiOrders = ordersData?.data || [];

    const orders = apiOrders.map(o => ({
        id: o.id || o.Order_id || o.id,
        table: o.Table_id || o.table_no || 'N/A',
        status: { type: o.Order_Status || o.status || 'Pending', time: o.time || '' },
        type: o.Dining_Option || o.type || 'Dine-in',
        items: o.items || o.order_items || [],
        tax: o.Tax || o.tax || '0.00',
        subtotal: o.Total_Amount || o.subtotal || '0.00'
    }));

    const filterOptions = ['All Orders', 'Preparing', 'Served', 'waiting'];

    return (
        <div className="h-full flex flex-col font-sans px-8 py-6 max-h-screen overflow-hidden">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <div className="flex items-center space-x-6">
                    <h1 className="text-3xl font-bold text-gray-900">Order History</h1>

                    {/* Date Dropdown */}
                    <div className="relative">
                        <select className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-full font-medium shadow-sm outline-none focus:border-gray-300">
                            <option>Today</option>
                            <option>Yesterday</option>
                            <option>This Week</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Center Toggle Pills */}
                <div className="flex bg-[#f6f6f6] rounded-full p-1 shadow-inner items-center space-x-1">
                    {filterOptions.map(opt => (
                        <button
                            key={opt}
                            onClick={() => setFilter(opt)}
                            className={`px-6 py-2 text-[14px] font-semibold rounded-full transition-all ${filter === opt
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {/* Right Toggles */}
                <div className="flex items-center space-x-4">
                    {/* Orders Toggle */}
                    <div className="flex items-center bg-[#f3e8ff] rounded-full p-1 shadow-inner cursor-pointer" onClick={() => setOrdersToggle(!ordersToggle)}>
                        <div className="px-4 text-[12px] font-bold text-[#6b21a8] mr-2">ORDERS</div>
                        <div className={`w-8 h-5 rounded-full relative transition-colors ${ordersToggle ? 'bg-[#7e22ce]' : 'bg-gray-300'}`}>
                            <div className={`absolute top-0.5 bottom-0.5 w-4 h-4 bg-white rounded-full transition-transform ${ordersToggle ? 'translate-x-3.5' : 'translate-x-0.5'}`}></div>
                        </div>
                    </div>
                    {/* Bar Toggle */}
                    <div className="flex items-center bg-[#dcfce7] rounded-full p-1 shadow-inner cursor-pointer" onClick={() => setBarToggle(!barToggle)}>
                        <div className="px-4 text-[12px] font-bold text-[#16a34a] mr-2">BAR</div>
                        <div className={`w-8 h-5 rounded-full relative transition-colors ${barToggle ? 'bg-[#15803d]' : 'bg-gray-300'}`}>
                            <div className={`absolute top-0.5 bottom-0.5 w-4 h-4 bg-white rounded-full transition-transform ${barToggle ? 'translate-x-3.5' : 'translate-x-0.5'}`}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Order Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 pr-4">
                <div className="grid grid-cols-fluid gap-6">
                    {orders.map((order, idx) => (
                        <OrderCard key={idx} order={order} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmployeeOrderHistory;
