import React from 'react';
import { FiClock } from 'react-icons/fi';

const TimeRangePicker = ({ startTime, endTime, onStartTimeChange, onEndTimeChange }) => {
    return (
        <div className="flex items-center gap-4">
            <div className="relative">
                <input
                    type="time"
                    value={startTime}
                    onChange={(e) => onStartTimeChange(e.target.value)}
                    className="appearance-none border border-gray-300 rounded-[8px] pl-4 pr-10 py-2 text-sm font-medium text-gray-800 outline-none focus:border-purple-500 w-[130px] bg-white shadow-sm"
                />
                <FiClock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={16} />
            </div>
            
            <span className="text-gray-500 text-sm font-medium">to</span>
            
            <div className="relative">
                <input
                    type="time"
                    value={endTime}
                    onChange={(e) => onEndTimeChange(e.target.value)}
                    className="appearance-none border border-gray-300 rounded-[8px] pl-4 pr-10 py-2 text-sm font-medium text-gray-800 outline-none focus:border-purple-500 w-[130px] bg-white shadow-sm"
                />
                <FiClock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={16} />
            </div>
            
            {/* Custom styles to hide native time picker icon in webkit */}
            <style>{`
                input[type="time"]::-webkit-calendar-picker-indicator {
                    opacity: 0;
                    position: absolute;
                    right: 0;
                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default TimeRangePicker;
