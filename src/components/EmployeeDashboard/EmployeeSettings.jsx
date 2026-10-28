import React from 'react';
import { UserCircle2, Bell, Lock, Briefcase, Headphones } from 'lucide-react';

const EmployeeSettings = () => {
    
    return (
        <div className="h-full flex flex-col font-sans px-8 py-6 max-h-screen overflow-hidden">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 pr-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
                    
                    {/* Card 1: Personal info */}
                    <div className="bg-white rounded-[20px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50 p-6 flex flex-col cursor-pointer hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-shadow">
                        <div className="mb-4">
                            <UserCircle2 className="w-6 h-6 text-gray-800" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-[15px] font-bold text-gray-900 mb-2">Personal info</h3>
                        <p className="text-[12px] text-gray-500 leading-relaxed">
                            You can check you all personal information here.
                        </p>
                    </div>

                    {/* Card 2: Notifications */}
                    <div className="bg-white rounded-[20px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50 p-6 flex flex-col cursor-pointer hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-shadow">
                        <div className="mb-4">
                            <Bell className="w-6 h-6 text-gray-800" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-[15px] font-bold text-gray-900 mb-2">Notifications</h3>
                        <p className="text-[12px] text-gray-500 leading-relaxed">
                            Choose the notification preferences accordingly.
                        </p>
                    </div>

                    {/* Card 3: Login & Security */}
                    <div className="bg-white rounded-[20px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50 p-6 flex flex-col cursor-pointer hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-shadow">
                        <div className="mb-4">
                            <Lock className="w-6 h-6 text-gray-800" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-[15px] font-bold text-gray-900 mb-2">Login & Security</h3>
                        <p className="text-[12px] text-gray-500 leading-relaxed">
                            Change the password and email address.
                        </p>
                    </div>

                    {/* Card 4: Work Summary */}
                    <div className="bg-white rounded-[20px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50 p-6 flex flex-col cursor-pointer hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-shadow">
                        <div className="mb-4">
                            <Briefcase className="w-6 h-6 text-gray-800" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-[15px] font-bold text-gray-900 mb-2">Work Summary</h3>
                        <p className="text-[12px] text-gray-500 leading-relaxed">
                            The work done and the money earned can be monitored here.
                        </p>
                    </div>

                    {/* Card 5: Clock in / out */}
                    <div className="bg-white rounded-[20px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50 p-6 flex flex-col cursor-pointer hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-shadow">
                        <div className="mb-4">
                            {/* Toggle Switch styling mimicking the "ON" state */}
                            <div className="w-[42px] h-[22px] bg-gradient-to-r from-[#8e24aa] to-[#d32f2f] rounded-full p-[2px] flex items-center relative">
                                <span className="text-[8px] font-bold text-white ml-1 absolute">ON</span>
                                <div className="w-[18px] h-[18px] bg-white rounded-full shadow-sm ml-auto z-10"></div>
                            </div>
                        </div>
                        <h3 className="text-[15px] font-bold text-gray-900 mb-2">Clock in / out</h3>
                        <p className="text-[12px] text-gray-500 leading-relaxed">
                            Change the password and email address.
                        </p>
                    </div>

                    {/* Card 6: Support Tickets */}
                    <div className="bg-white rounded-[20px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50 p-6 flex flex-col cursor-pointer hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-shadow">
                        <div className="mb-4">
                            <Headphones className="w-6 h-6 text-gray-800" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-[15px] font-bold text-gray-900 mb-2">Support Tickets</h3>
                        <p className="text-[12px] text-gray-500 leading-relaxed">
                            The work done and the money earned can be monitored here.
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default EmployeeSettings;
