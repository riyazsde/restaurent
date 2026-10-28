import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { FaClock } from 'react-icons/fa';

const SLOT_TYPE_LABELS = {
    morning: 'Morning',
    lunch: 'Lunch',
    dinner: 'Dinner',
};

const SlotChip = ({ slot, selected, onSelect, t }) => {
    const isUnavailable = slot.status === 'Unavailable' && !slot.available;
    const isFull = slot.full === true;
    const disabled = isUnavailable || isFull;

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onSelect(slot)}
            title={
                disabled
                    ? t('slotUnavailable', 'Unavailable')
                    : slot.slots_time
            }
            className={[
                'px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all',
                selected
                    ? 'bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white border-transparent shadow-sm'
                    : disabled
                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                    : 'bg-white text-gray-800 border-purple-200 hover:border-purple-500 hover:bg-purple-50',
            ].join(' ')}
        >
            {slot.slots_time || `${slot.from} - ${slot.to}`}
        </button>
    );
};

const SlotPicker = ({
    response,
    loading,
    error,
    tableId,
    selectedSlot,
    onSelectSlot,
}) => {
    const { t } = useTranslation(['pos', 'common']);

    const days = useMemo(() => {
        const raw = response?.data?.generated_slots;
        if (!Array.isArray(raw)) return [];
        return raw.map((d) => ({
            date: d.date,
            day: d.day,
            morning: d.grouped_slots?.morning || [],
            lunch: d.grouped_slots?.lunch || [],
            dinner: d.grouped_slots?.dinner || [],
            total:
                (d.grouped_slots?.morning?.length || 0) +
                (d.grouped_slots?.lunch?.length || 0) +
                (d.grouped_slots?.dinner?.length || 0),
        }));
    }, [response]);

    const [activeDate, setActiveDate] = useState(null);

    // Auto-select first day (and reset when table/slots change)
    useEffect(() => {
        if (days.length === 0) {
            setActiveDate(null);
            return;
        }
        // keep current if still present, else first
        setActiveDate((prev) =>
            prev && days.some((d) => d.date === prev) ? prev : days[0].date
        );
    }, [days]);

    // If selectedSlot points to a different date than the active tab, switch tab
    useEffect(() => {
        if (selectedSlot?.date && selectedSlot.date !== activeDate) {
            setActiveDate(selectedSlot.date);
        }
    }, [selectedSlot?.date]); // eslint-disable-line react-hooks/exhaustive-deps

    const activeDay = days.find((d) => d.date === activeDate) || null;

    const workingHours = response?.data
        ? `${response.data.opening_time} - ${response.data.closing_time}`
        : '';

    // ---- Empty / loading / error states ----
    if (!tableId) {
        return (
            <div className="mb-3 text-[11px] text-gray-500 italic px-2 py-2 bg-gray-50 rounded-lg">
                {t('selectTableFirst', 'Select a table to see available time slots')}
            </div>
        );
    }
    if (loading) {
        return (
            <div className="mb-3 text-[11px] text-gray-500 px-2 py-2 bg-gray-50 rounded-lg animate-pulse">
                {t('loadingSlots', 'Loading slots...')}
            </div>
        );
    }
    if (error) {
        return (
            <div className="mb-3 text-[11px] text-red-600 px-2 py-2 bg-red-50 rounded-lg">
                {t('slotsError', 'Unable to load slots. Please try again.')}
            </div>
        );
    }
    if (days.length === 0) {
        return (
            <div className="mb-3 text-[11px] text-gray-500 px-2 py-2 bg-gray-50 rounded-lg">
                {t('noSlots', 'No slots available for this table')}
            </div>
        );
    }

    return (
        <div className="mb-3 border border-purple-200 rounded-xl bg-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <div className="flex items-center gap-1.5">
                    <FaClock className="text-purple-700 text-xs" />
                    <span className="text-[12px] font-semibold text-gray-800">
                        {t('selectSlot', 'Select Time Slot')}
                    </span>
                </div>
                {workingHours && (
                    <span className="text-[10px] text-gray-500">
                        {workingHours}
                    </span>
                )}
            </div>

            {/* Day tabs */}
            <div className="flex gap-1.5 overflow-x-auto px-2 py-2 border-b border-gray-100 hide-scrollbar">
                {days.map((d) => {
                    const isActive = d.date === activeDate;
                    const dateObj = new Date(d.date);
                    const dateNum = dateObj.getDate();
                    const month = dateObj.toLocaleString('en-US', { month: 'short' });
                    return (
                        <button
                            key={d.date}
                            type="button"
                            onClick={() => setActiveDate(d.date)}
                            className={[
                                'flex flex-col items-center min-w-[46px] px-2 py-1.5 rounded-lg text-[10px] transition-colors',
                                isActive
                                    ? 'bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white shadow-sm'
                                    : 'bg-gray-50 text-gray-600 hover:bg-purple-50',
                            ].join(' ')}
                        >
                            <span className="font-semibold text-[10px] uppercase">
                                {d.day?.slice(0, 3)}
                            </span>
                            <span className="text-[13px] font-bold leading-none mt-0.5">
                                {dateNum}
                            </span>
                            <span className="text-[9px] opacity-80">{month}</span>
                        </button>
                    );
                })}
            </div>

            {/* Slot groups */}
            {activeDay && (
                <div className="px-2 py-2 space-y-2 max-h-[220px] overflow-y-auto hide-scrollbar">
                    {['morning', 'lunch', 'dinner'].map((type) => {
                        const list = activeDay[type];
                        if (!list || list.length === 0) return null;
                        return (
                            <div key={type}>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                                        {SLOT_TYPE_LABELS[type]}
                                    </span>
                                    <span className="text-[9px] text-gray-400">
                                        ({list.length})
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {list.map((slot) => {
                                        const enriched = {
                                            ...slot,
                                            date: activeDay.date,
                                            day: activeDay.day,
                                        };
                                        const isSelected =
                                            selectedSlot?.date === enriched.date &&
                                            selectedSlot?.from === enriched.from &&
                                            selectedSlot?.to === enriched.to;
                                        return (
                                            <SlotChip
                                                key={`${type}_${slot.from}_${slot.to}`}
                                                slot={enriched}
                                                selected={isSelected}
                                                onSelect={onSelectSlot}
                                                t={t}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Selected summary */}
            {selectedSlot && (
                <div className="px-3 py-1.5 bg-purple-50 border-t border-purple-100 flex items-center justify-between">
                    <span className="text-[10px] text-purple-700 font-medium">
                        ✓ {selectedSlot.day}, {selectedSlot.date} · {selectedSlot.slots_time}
                    </span>
                    <button
                        type="button"
                        onClick={() => onSelectSlot(null)}
                        className="text-[10px] text-red-500 hover:underline"
                    >
                        {t('clear', 'Clear')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SlotPicker;