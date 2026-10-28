import React, { useState, useEffect } from 'react';
import { FiFilter, FiCalendar } from 'react-icons/fi';
import Modal from '../common/Modal';

const FeedbackFilterModal = ({ isOpen, onClose, onApply, initialFilters }) => {
    const [filters, setFilters] = useState({
        sortByDay: 'Today',
        from: '',
        to: ''
    });

    useEffect(() => {
        if (isOpen) {
            setFilters(initialFilters || { sortByDay: 'Today', from: '', to: '' });
        }
    }, [isOpen, initialFilters]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onApply(filters);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[450px]" showCloseButton={true}>
            <div className="font-poppins mt-2 px-2">
                <div className="flex items-center gap-2 mb-8">
                    <FiFilter size={24} className="text-black" />
                    <h2 className="text-2xl font-bold text-black">Filter</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">
                            Sort by day
                        </label>
                        <div className="p-[1.5px] rounded-lg bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F]">
                            <div className="relative">
                                <select
                                    value={filters.sortByDay}
                                    onChange={(e) => setFilters({ ...filters, sortByDay: e.target.value })}
                                    className="w-full bg-white rounded-[7px] px-4 py-3 outline-none font-medium text-gray-500 appearance-none"
                                >
                                    <option value="Today">Today</option>
                                    <option value="Yesterday">Yesterday</option>
                                    <option value="Last 7 Days">Last 7 Days</option>
                                    <option value="This Month">This Month</option>
                                    <option value="Custom">Custom Range</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1L7 7L13 1" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div className="absolute right-12 top-2 bottom-2 w-px bg-gray-200"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-semibold text-gray-900">
                                From
                            </label>
                            <div className="p-[1.5px] rounded-lg bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F]">
                                <div className="relative bg-[#FAF5FF] rounded-[7px] overflow-hidden">
                                    <input
                                        type="date"
                                        value={filters.from}
                                        onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                                        className="w-full bg-transparent px-4 py-3 outline-none font-medium text-gray-500"
                                        style={{ colorScheme: 'light' }}
                                    />
                                    {/* Webkit hide native calendar icon and show custom */}
                                    <style>{`
                                        input[type="date"]::-webkit-calendar-picker-indicator {
                                            opacity: 0;
                                            position: absolute;
                                            right: 0;
                                            width: 100%;
                                            height: 100%;
                                            cursor: pointer;
                                        }
                                    `}</style>
                                    <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-semibold text-gray-900">
                                To
                            </label>
                            <div className="p-[1.5px] rounded-lg bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F]">
                                <div className="relative bg-[#FAF5FF] rounded-[7px] overflow-hidden">
                                    <input
                                        type="date"
                                        value={filters.to}
                                        onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                                        className="w-full bg-transparent px-4 py-3 outline-none font-medium text-gray-500"
                                        style={{ colorScheme: 'light' }}
                                    />
                                    <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 pb-2">
                        <button
                            type="submit"
                            className="w-[200px] mx-auto block bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white font-medium py-3 rounded-xl shadow-md hover:opacity-90 transition-opacity"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default FeedbackFilterModal;
