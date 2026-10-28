import React from 'react';

const EmployeeSalesPerformance = () => {
    return (
        <div className="h-full flex flex-col font-sans px-8 py-6 max-h-screen overflow-hidden">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <h1 className="text-3xl font-bold text-gray-900">Sales Performance</h1>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 pr-4 flex flex-col gap-8">
                
                {/* Hero Card */}
                <div className="rounded-[24px] p-8 shadow-sm border border-pink-50 relative overflow-hidden bg-gradient-to-r from-[#fdf0f4] to-[#f3e8ff]">
                    {/* Top Right Dropdown */}
                    <div className="absolute top-6 right-6">
                        <select className="appearance-none bg-white border border-gray-200 text-gray-700 py-1.5 pl-4 pr-10 rounded-full text-[13px] font-bold shadow-sm outline-none focus:border-gray-300">
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
                    
                    {/* Main Metrics */}
                    <div className="mb-8">
                        <h1 className="text-[42px] font-black text-[#6A1B9A] leading-none tracking-tight mb-2">23,300.00 XOF</h1>
                        <p className="text-[18px] font-bold text-gray-800">Today</p>
                    </div>

                    {/* Footer Row */}
                    <div className="flex items-center space-x-12">
                        <div className="flex items-center text-[14px] font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] mr-2"></div>
                            <span className="text-[#16a34a] mr-1">Upsell Revenue:</span>
                            <span className="text-gray-800">₹ 23,300.00</span>
                        </div>
                        <div className="flex items-center text-[14px] font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></div>
                            <span className="text-gray-500 mr-1">Tips:</span>
                            <span className="text-gray-800">₹ 2,300.00</span>
                        </div>
                        <div className="flex items-center text-[14px] font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></div>
                            <span className="text-gray-500 mr-1">Customer Satisfaction:</span>
                            <span className="text-gray-800">⭐ 4.5</span>
                        </div>
                    </div>
                </div>

                {/* Productivity & Customer Reviews */}
                <div className="flex flex-col xl:flex-row gap-6">
                    {/* Productivity */}
                    <div className="flex-[2.2]">
                        <h3 className="text-[16px] font-bold text-gray-900 mb-4">Productivity</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {/* Card 1 */}
                            <div className="bg-white rounded-[20px] shadow-sm border border-pink-100 p-6">
                                <h4 className="text-[13px] font-bold text-gray-900 mb-4">Orders Taken</h4>
                                <div className="text-[32px] font-black text-gray-900 leading-none mb-2">46<span className="text-[16px] text-gray-400 font-bold">/60</span></div>
                                <p className="text-[11px] font-bold text-[#16a34a]">Order Completed</p>
                            </div>
                            {/* Card 2 */}
                            <div className="bg-white rounded-[20px] shadow-sm border border-pink-100 p-6">
                                <h4 className="text-[13px] font-bold text-gray-900 mb-4">Items sold</h4>
                                <div className="text-[32px] font-black text-gray-900 leading-none mb-2">46</div>
                                <p className="text-[11px] font-bold text-[#f97316]">Dish Sold</p>
                            </div>
                            {/* Card 3 */}
                            <div className="bg-white rounded-[20px] shadow-sm border border-pink-100 p-6">
                                <h4 className="text-[13px] font-bold text-gray-900 mb-4">Average Order Value</h4>
                                <div className="text-[28px] font-black text-gray-900 leading-none mb-2">2,300 XOF</div>
                                <p className="text-[11px] font-bold text-[#3b82f6]">Avg Check Amounts</p>
                            </div>
                        </div>
                    </div>

                    {/* Customer Reviews */}
                    <div className="flex-[1]">
                        <h3 className="text-[16px] font-bold text-gray-900 mb-4">Customer Reviews</h3>
                        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6">
                            <div className="space-y-3">
                                {[
                                    { star: 5, width: '80%', count: 200, color: 'bg-[#d32f2f]' },
                                    { star: 4, width: '35%', count: 120, color: 'bg-[#d32f2f]' },
                                    { star: 3, width: '5%', count: 5, color: 'bg-[#d32f2f]' },
                                    { star: 2, width: '0%', count: 0, color: 'bg-[#d32f2f]' },
                                    { star: 1, width: '0%', count: 0, color: 'bg-[#d32f2f]' },
                                ].map(row => (
                                    <div key={row.star} className="flex items-center text-[12px] font-bold text-gray-500">
                                        <div className="w-6 flex items-center space-x-1">
                                            <span>{row.star}</span><span>★</span>
                                        </div>
                                        <div className="flex-1 mx-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`${row.color} h-full rounded-full`} style={{ width: row.width }}></div>
                                        </div>
                                        <div className="w-8 text-right">{row.count}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Second Row Metrics */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white rounded-[20px] shadow-sm border border-pink-100 p-6">
                        <h4 className="text-[13px] font-bold text-gray-900 mb-4">Total Sales</h4>
                        <div className="text-[28px] font-black text-gray-900 leading-none mb-2">1,142 XOF</div>
                        <p className="text-[11px] font-bold text-[#f97316]">+18% vs yesterday</p>
                    </div>
                    <div className="bg-white rounded-[20px] shadow-sm border border-pink-100 p-6">
                        <h4 className="text-[13px] font-bold text-gray-900 mb-4">Tips Earned</h4>
                        <div className="text-[28px] font-black text-gray-900 leading-none mb-2">87.50 XOF</div>
                        <p className="text-[11px] font-bold text-[#3b82f6]">Avg 7.7%</p>
                    </div>
                    <div className="bg-white rounded-[20px] shadow-sm border border-pink-100 p-6">
                        <h4 className="text-[13px] font-bold text-gray-900 mb-4">Upsells</h4>
                        <div className="text-[28px] font-black text-gray-900 leading-none mb-2">9</div>
                        <p className="text-[11px] font-bold text-[#3b82f6]">$142 extra revenue</p>
                    </div>
                </div>

                {/* Bottom Bordered Lists */}
                <div className="flex flex-col xl:flex-row gap-6 mt-2">
                    
                    {/* Top Items Sold */}
                    <div className="flex-[1.5]">
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Top Items Sold Today</h3>
                        <div className="p-[2px] rounded-[24px] bg-gradient-to-r from-[#8e24aa] to-[#d32f2f]">
                            <div className="bg-white rounded-[22px] px-6 py-2">
                                {[
                                    { name: 'Wagyu Burger', badge: 'x8 - $144' },
                                    { name: 'Truffle Fries', badge: 'x12 - $114' },
                                    { name: 'Grilled Salmon', badge: 'x5 - $110' },
                                    { name: 'Mango Lemonade', badge: 'x14 - $70' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0">
                                        <span className="text-[14px] font-bold text-gray-900">{item.name}</span>
                                        <span className="bg-[#ffe4e6] text-[#e11d48] text-[10px] font-bold px-3 py-1 rounded-full">{item.badge}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Loyalty Enrollments */}
                    <div className="flex-[1]">
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Loyalty Enrollments</h3>
                        <div className="p-[2px] rounded-[24px] bg-gradient-to-r from-[#8e24aa] to-[#d32f2f]">
                            <div className="bg-white rounded-[22px] px-6 py-2">
                                <div className="flex justify-between items-center py-5 border-b border-gray-100">
                                    <span className="text-[14px] font-bold text-gray-900">New Customers Signed Up</span>
                                    <span className="bg-[#dcfce7] text-[#16a34a] text-[10px] font-bold px-3 py-1 rounded-full">3 today</span>
                                </div>
                                <div className="flex justify-between items-center py-5">
                                    <span className="text-[14px] font-bold text-gray-900">Avg Feedback Rating</span>
                                    <span className="bg-[#ffe4e6] text-[#e11d48] text-[10px] font-bold px-3 py-1 rounded-full flex items-center">
                                        4.8 /5 <span className="ml-1 text-[10px]">★</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EmployeeSalesPerformance;
