import React from 'react';
import { Users, ArrowDownUp } from 'lucide-react';

const EmployeeWorkShifts = () => {
    
    const upcomingShifts = [
        { day: 'Wednesday', role: 'Bartender', time: '09:00 am - 6:30 pm' },
        { day: 'Thursday', role: 'Bartender', time: '09:00 am - 6:30 pm' },
        { day: 'Friday', role: 'Bartender', time: '09:00 am - 6:30 pm' }
    ];

    const swapRequests = [
        { name: 'Person 1', role: 'Bartender', time: '09:00 am - 6:30 pm' },
        { name: 'Person 1', role: 'Bartender', time: '09:00 am - 6:30 pm' }
    ];

    const teamScheduled = Array(5).fill({
        name: 'Person 1', role: 'Bartender', time: '09:00 am - 6:30 pm'
    });

    return (
        <div className="h-full flex flex-col font-sans px-8 py-6 max-h-screen overflow-hidden">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <h1 className="text-3xl font-bold text-gray-900">Shift Management</h1>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 pr-4 flex flex-col xl:flex-row gap-8">
                
                {/* Left Column */}
                <div className="flex-[2] flex flex-col gap-8">
                    
                    {/* Today Card */}
                    <div>
                        <h3 className="text-[16px] font-bold text-gray-900 mb-3">Today</h3>
                        <div className="p-[3px] rounded-[24px] bg-gradient-to-r from-[#fdf0f4] to-[#f3e8ff]">
                            <div className="bg-white rounded-[21px] p-6 flex justify-between items-center">
                                <div className="space-y-3">
                                    <div className="bg-[#22c55e] text-white px-4 py-2 rounded-full text-[13px] font-bold inline-flex items-center shadow-sm">
                                        <span className="mr-1.5">✓</span> Shift Active
                                    </div>
                                    <div className="text-[14px] font-medium text-gray-500">
                                        <span className="text-gray-900 font-bold">Started:</span> 09:00 am
                                    </div>
                                    <div className="text-[14px] font-medium text-gray-500">
                                        <span className="text-gray-900 font-bold">Worked:</span> 6hr 20min
                                    </div>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                    <p className="text-[14px] font-bold text-gray-900">Tuesday, Feb 1, 2025</p>
                                    <p className="text-[16px] font-black text-gray-900">09:14 PM</p>
                                    <button className="px-8 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-all hover:opacity-90 mt-2" style={{ background: 'linear-gradient(90deg, #8e24aa 0%, #d32f2f 100%)' }}>
                                        Clock In
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Up Coming Shift */}
                    <div>
                        <h3 className="text-[16px] font-bold text-gray-900 mb-3">Up Coming Shift</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {upcomingShifts.map((shift, idx) => (
                                <div key={idx} className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5 flex flex-col items-start hover:shadow-md transition-shadow">
                                    <h4 className="text-[15px] font-bold text-gray-900 mb-3">{shift.day}</h4>
                                    <span className="bg-[#fce7ec] text-[#d32f2f] text-[11px] font-bold px-4 py-1.5 rounded-full mb-4">
                                        {shift.role}
                                    </span>
                                    <p className="text-[11px] font-bold text-gray-500 mb-5">{shift.time}</p>
                                    <button className="w-full py-2 border border-[#d32f2f] text-[#d32f2f] rounded-full text-[13px] font-bold hover:bg-[#fdf0f4] transition-colors">
                                        Request Swap
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shift Swap Request */}
                    <div>
                        <h3 className="text-[16px] font-bold text-gray-900 mb-3 flex items-center">
                            <ArrowDownUp className="w-5 h-5 mr-2" /> Shift Swap Request
                        </h3>
                        <div className="bg-gray-50 rounded-[24px] p-6 border border-gray-100">
                            <div className="grid grid-cols-2 gap-4">
                                {swapRequests.map((req, idx) => (
                                    <div key={idx} className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <img src={`https://i.pravatar.cc/150?img=${idx + 10}`} alt="Profile" className="w-8 h-8 rounded-full" />
                                            <h4 className="text-[14px] font-bold text-gray-900">{req.name}</h4>
                                        </div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[11px] font-bold text-gray-500 flex items-center">
                                                ⏱ {req.time}
                                            </span>
                                            <span className="bg-[#fce7ec] text-[#d32f2f] text-[10px] font-bold px-3 py-1 rounded-full">
                                                {req.role}
                                            </span>
                                        </div>
                                        <p className="text-[12px] text-gray-500 mb-5 leading-snug">
                                            stands out with potentially significant cost savings and flexibility
                                        </p>
                                        <div className="flex space-x-3">
                                            <button className="flex-1 py-2 border border-[#ef4444] text-[#ef4444] rounded-lg text-[13px] font-bold hover:bg-red-50 transition-colors">
                                                Reject
                                            </button>
                                            <button className="flex-1 py-2 bg-[#22c55e] text-white rounded-lg text-[13px] font-bold hover:bg-[#16a34a] transition-colors">
                                                Accept
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column */}
                <div className="flex-[1] flex flex-col">
                    <h3 className="text-[16px] font-bold text-gray-900 mb-3 flex items-center">
                        <Users className="w-5 h-5 mr-2" /> Team Scheduled
                    </h3>
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 flex-1 overflow-hidden relative">
                        <div className="absolute top-6 bottom-6 right-1 w-1 bg-[#ef4444] rounded-full"></div>
                        <div className="h-full overflow-y-auto custom-scrollbar p-6 space-y-4">
                            {teamScheduled.map((member, idx) => (
                                <div key={idx} className="bg-white rounded-[16px] shadow-sm border border-gray-100 p-4 flex flex-col">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <img src={`https://i.pravatar.cc/150?img=${idx + 20}`} alt="Profile" className="w-8 h-8 rounded-full" />
                                            <h4 className="text-[14px] font-bold text-gray-900">{member.name}</h4>
                                        </div>
                                        <span className="bg-[#fce7ec] text-[#d32f2f] text-[10px] font-bold px-3 py-1 rounded-full">
                                            {member.role}
                                        </span>
                                    </div>
                                    <div className="mt-3 text-[11px] font-bold text-gray-500 flex items-center">
                                        ⏱ {member.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EmployeeWorkShifts;
