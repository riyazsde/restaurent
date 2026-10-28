import React from 'react';

const ReservationQueueCard = ({ title, subtitle, status }) => {
    const getStatusStyle = (type) => {
        switch (type) {
            case 'Upcoming':
                return 'bg-[#ffedd5] text-[#f97316]'; // Orange
            case 'Tomorrow':
                return 'bg-[#dbeafe] text-[#3b82f6]'; // Blue
            case 'Confirmed':
                return 'bg-[#dcfce7] text-[#22c55e]'; // Green
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0 relative pl-4">
            <div className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-[#8e24aa] to-[#d32f2f] rounded-full"></div>
            <div>
                <h4 className="text-[15px] font-bold text-gray-900 leading-tight">{title}</h4>
                <p className="text-[11px] text-gray-400 mt-1">{subtitle}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide ${getStatusStyle(status)}`}>
                {status}
            </div>
        </div>
    );
};

const FloorMapTable = ({ id, status, time }) => {
    const getStyles = () => {
        switch (status) {
            case 'Occupied':
                return 'bg-[#f3e8ff] border-[#d8b4fe] text-[#a855f7]'; // Purple
            case 'Free':
                return 'bg-[#dcfce7] border-[#86efac] text-[#22c55e]'; // Green
            case 'Reserved':
                return 'bg-[#dbeafe] border-[#93c5fd] text-[#3b82f6]'; // Blue
            default:
                return 'bg-gray-50 border-gray-200 text-gray-500';
        }
    };

    return (
        <div className={`flex flex-col items-center justify-center rounded-[16px] border ${getStyles()} py-4 transition-transform hover:scale-[1.02] cursor-pointer shadow-sm`}>
            <span className="text-[16px] font-bold mb-0.5">{id}</span>
            <span className="text-[11px] font-semibold">{status}</span>
            {time && <span className="text-[9px] font-semibold mt-0.5">{time}</span>}
        </div>
    );
};

const EmployeeReservations = () => {
    const queue = [
        { title: 'Al-Mansoori - 4 guests', subtitle: 'Today 7:30 PM - Table 3 - Window seat requested', status: 'Upcoming' },
        { title: 'Birthday party - 8 guests', subtitle: 'Today 8:00 PM - Table 7 - Cake & decoration', status: 'Upcoming' },
        { title: 'Johnson Group - 12 guests', subtitle: 'Apr 15, 12:00 PM - Private room', status: 'Tomorrow' },
        { title: 'Johnson Group - 12 guests', subtitle: 'Apr 15, 12:00 PM - Private room', status: 'Confirmed' }
    ];

    const tables = [
        { id: 'T1', status: 'Occupied' },
        { id: 'T2', status: 'Free' },
        { id: 'T3', status: 'Occupied' },
        { id: 'T4', status: 'Reserved', time: '7:30 PM' },
        { id: 'T5', status: 'Occupied' },
        { id: 'T6', status: 'Free' },
        { id: 'T7', status: 'Free' },
        { id: 'T8', status: 'Reserved', time: '8:30 PM' },
        { id: 'T9', status: 'Free' },
        { id: 'T10', status: 'Occupied' },
        { id: 'T11', status: 'Reserved', time: '10:30 PM' },
        { id: 'T12', status: 'Occupied' },
    ];

    return (
        <div className="h-full flex flex-col font-sans px-8 py-6 max-h-screen overflow-hidden">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
                <button className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition-all hover:opacity-90" style={{ background: 'linear-gradient(90deg, #8e24aa 0%, #d32f2f 100%)' }}>
                    +New Reservation
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 pr-2 flex flex-col lg:flex-row gap-8">
                
                {/* Left Column */}
                <div className="flex-[1.2] flex flex-col gap-6">
                    {/* Reservation Queue */}
                    <div>
                        <h3 className="text-[12px] font-bold text-gray-400 tracking-wider mb-3 uppercase">Reservation Queue</h3>
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-5">
                            {queue.map((item, idx) => (
                                <ReservationQueueCard key={idx} {...item} />
                            ))}
                        </div>
                    </div>

                    {/* New Reservation Form */}
                    <div className="flex-1">
                        <h3 className="text-[12px] font-bold text-gray-400 tracking-wider mb-3 uppercase">New Reservation</h3>
                        {/* Gradient Border Wrapper */}
                        <div className="p-[2px] rounded-[24px] bg-gradient-to-r from-[#8e24aa] to-[#d32f2f]">
                            <div className="bg-white rounded-[22px] p-5">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-5">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1 ml-1">Guest Name</label>
                                        <input type="text" defaultValue="Mohammed Al-Farsi" className="w-full border border-pink-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-pink-400 shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1 ml-1">Phone</label>
                                        <input type="text" defaultValue="+974 55-000-1234" className="w-full border border-pink-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-pink-400 shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1 ml-1">Occasion</label>
                                        <input type="text" defaultValue="Birthday Business VIP Anniversary" className="w-full border border-pink-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-pink-400 shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1 ml-1">Estimated Duration</label>
                                        <input type="text" defaultValue="__ hr __ min" className="w-full border border-pink-200 rounded-lg px-3 py-2 text-[13px] text-gray-400 outline-none focus:border-pink-400 shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1 ml-1">Date & Time</label>
                                        <input type="text" defaultValue="04/15/2026 , 07:30 PM" className="w-full border border-pink-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-pink-400 shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1 ml-1">Party Size</label>
                                        <input type="text" defaultValue="4" className="w-full border border-pink-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-pink-400 shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1 ml-1">Assign Table</label>
                                        <select className="w-full border border-pink-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-pink-400 shadow-sm appearance-none bg-white">
                                            <option>Table 2 - Available</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1 ml-1">Notes</label>
                                        <input type="text" defaultValue="Allergies: nuts" className="w-full border border-pink-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-pink-400 shadow-sm" />
                                    </div>
                                </div>
                                <button className="w-full py-2.5 text-sm font-semibold text-white rounded-lg shadow-sm transition-all hover:opacity-90" style={{ background: 'linear-gradient(90deg, #8e24aa 0%, #d32f2f 100%)' }}>
                                    Confirm Reservation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex-[1]">
                    <h3 className="text-[12px] font-bold text-gray-400 tracking-wider mb-3 uppercase">Floor Map - Reservation View</h3>
                    <div className="grid grid-cols-4 gap-4">
                        {tables.map((table, idx) => (
                            <FloorMapTable key={idx} {...table} />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EmployeeReservations;
