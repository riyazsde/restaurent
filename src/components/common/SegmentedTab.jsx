import React from 'react';

const SegmentedTab = ({ tabs, activeTab, onTabChange, className = "", variant = "subtle" }) => {
    const isSubtle = variant === "subtle" || variant === "pill";

    return (
        <div 
            className={`h-[44px] sm:h-[46px] inline-flex items-center select-none ${
                isSubtle 
                    ? 'rounded-[20px] border border-[#E2E8F0] bg-white p-1 shadow-[0_1px_3px_rgba(0,0,0,0.03)]' 
                    : 'p-[1.5px] rounded-2xl bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F]'
            } ${className}`}
        >
            <div className={`flex items-center h-full ${
                isSubtle 
                    ? 'gap-1' 
                    : 'bg-white rounded-[14px] p-1 gap-1'
            }`}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            type="button"
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`px-5 sm:px-7 h-full rounded-[14px] transition-all duration-200 font-semibold font-poppins text-sm md:text-[15px] flex items-center justify-center cursor-pointer ${
                                isActive 
                                    ? 'text-white shadow-xs' 
                                    : 'bg-transparent text-[#1E293B] hover:text-black'
                            }`}
                            style={
                                isActive 
                                    ? { background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)' } 
                                    : {}
                            }
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SegmentedTab;
