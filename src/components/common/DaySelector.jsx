import React from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DaySelector = ({ selectedDays = [], onChange }) => {
    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            onChange(selectedDays.filter(d => d !== day));
        } else {
            onChange([...selectedDays, day]);
        }
    };

    return (
        <div className="flex flex-wrap gap-3">
            {DAYS.map(day => {
                const isSelected = selectedDays.includes(day);
                return (
                    <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-5 py-1.5 rounded-[6px] text-sm font-semibold transition-colors border ${
                            isSelected 
                                ? 'bg-[#F6EDFF] border-[#D1A3FF] text-[#A64CFF]' 
                                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                    >
                        {day}
                    </button>
                );
            })}
        </div>
    );
};

export default DaySelector;
