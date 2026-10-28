import React from 'react';

const StatusToggle = ({ isActive, onChange, disabled = false, activeText = 'Active', inactiveText = 'Inactive' }) => {
    return (
        <button 
            type="button"
            onClick={onChange}
            disabled={disabled}
            className={`relative inline-flex h-[30px] w-[88px] items-center rounded-full transition-colors ${
                isActive ? 'bg-[#4CAF50]' : 'bg-[#9E9E9E]'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <span 
                className={`absolute top-1 bottom-1 w-[22px] bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    isActive ? 'translate-x-1.5' : 'translate-x-[58px]'
                }`} 
            />
            <span className={`w-full text-xs font-semibold text-white select-none ${isActive ? 'pl-8 text-left' : 'pr-7 text-right'}`}>
                {isActive ? activeText : inactiveText}
            </span>
        </button>
    );
};

export default StatusToggle;
