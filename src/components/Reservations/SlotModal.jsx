import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IoClose } from 'react-icons/io5';
import { FiChevronDown } from 'react-icons/fi';

const SlotModal = ({
    isOpen,
    onClose,
    onSave,
    slot = null,
    initialCategory = '',
    isSubmitting = false
}) => {
    const { t } = useTranslation('reservation');

    const [selectedSlotCategory, setSelectedSlotCategory] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [timeError, setTimeError] = useState('');

    useEffect(() => {
        if (slot) {
            // Edit mode
            setSelectedSlotCategory(slot.slots || slot.category || 'Morning');
            setTime(slot.from || slot.label || slot.slots_time?.split('-')[0]?.trim() || '');
            setNotes(slot.notes || slot.Notes || '');
        } else {
            // Add mode
            setSelectedSlotCategory(initialCategory || '');
            setTime('');
            setNotes('');
        }
        setTimeError('');
    }, [slot, initialCategory, isOpen]);

    if (!isOpen) return null;

    const isEditMode = Boolean(slot);

    // Format standard 24-hr time input "HH:mm" to "hh:mm AM/PM" if needed
    const handleTimeChange = (e) => {
        const val = e.target.value;
        setTime(val);
        if (timeError) setTimeError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedSlotCategory) {
            setTimeError(t('slots.selectCategoryError', 'Please select a slot category'));
            return;
        }

        if (!time || !time.trim()) {
            setTimeError(t('slots.timeRequired', 'Time is required'));
            return;
        }

        // Standardize time display to 12-hour format "hh:mm AM/PM"
        let formattedTime = time.trim();
        // If time is from <input type="time"> like "14:30"
        if (/^\d{1,2}:\d{2}$/.test(formattedTime)) {
            const [h, m] = formattedTime.split(':');
            const hourNum = parseInt(h, 10);
            const ampm = hourNum >= 12 ? 'PM' : 'AM';
            const h12 = hourNum % 12 || 12;
            formattedTime = `${String(h12).padStart(2, '0')}:${m} ${ampm}`;
        }

        onSave({
            slot_id: slot?.slot_id,
            slots: selectedSlotCategory,
            from: formattedTime,
            label: formattedTime,
            notes: notes.trim(),
            isEdit: isEditMode
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            {/* Modal Card matching Figma 196-57529 */}
            <div className="bg-white rounded-[28px] w-full max-w-[460px] p-7 sm:p-8 shadow-2xl relative border border-gray-100 font-[Poppins]">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="absolute top-6 right-6 text-gray-500 hover:text-gray-800 p-1 rounded-full transition-colors cursor-pointer"
                    title={t('form.cancel', 'Close')}
                >
                    <IoClose className="w-6 h-6" />
                </button>

                {/* Modal Title */}
                <h3 className="text-2xl font-bold text-[#1E1E1E] mb-6">
                    {isEditMode ? t('slots.editModalTitle', 'Edit Slot') : t('slots.addModalTitle', 'Add A New Slot')}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Field 1: Select A Slot */}
                    <div>
                        <label className="block text-sm font-semibold text-[#1E1E1E] mb-1.5">
                            {t('slots.selectSlot', 'Select A Slot')}
                        </label>
                        <div className="relative">
                            <select
                                value={selectedSlotCategory}
                                onChange={(e) => {
                                    setSelectedSlotCategory(e.target.value);
                                    if (timeError) setTimeError('');
                                }}
                                className="w-full appearance-none border border-[#D8B4D4] rounded-xl px-4 py-3 text-sm text-[#1E1E1E] outline-none bg-white focus:border-[#701A75] focus:ring-1 focus:ring-[#701A75] transition-all cursor-pointer"
                            >
                                <option value="">{t('slots.selectPlaceholder', 'Select.......')}</option>
                                <option value="Morning">{t('slots.morning', 'Morning Slots')}</option>
                                <option value="Lunch">{t('slots.lunch', 'Lunch Slots')}</option>
                                <option value="Dinner">{t('slots.dinner', 'Dinner Slots')}</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500">
                                <FiChevronDown className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Field 2: Time* */}
                    <div>
                        <label className="block text-sm font-semibold text-[#1E1E1E] mb-1.5">
                            {t('slots.time', 'Time*')}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={time}
                                onChange={handleTimeChange}
                                placeholder="-- : -- AM"
                                className={`w-full border ${
                                    timeError ? 'border-red-400' : 'border-[#D8B4D4]'
                                } rounded-xl px-4 py-3 text-sm text-[#1E1E1E] outline-none bg-gradient-to-r from-[#F5EBFF]/40 to-[#FDF3F3]/40 focus:border-[#701A75] focus:ring-1 focus:ring-[#701A75] transition-all`}
                            />
                            {/* Optional quick picker icon or helper */}
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-semibold text-gray-400 uppercase pointer-events-none">
                                {time.toLowerCase().includes('pm') ? 'PM' : 'AM'}
                            </span>
                        </div>
                        {timeError && (
                            <p className="text-xs text-red-500 mt-1 font-medium">{timeError}</p>
                        )}
                        <p className="text-[11px] text-gray-400 mt-1">
                            {t('slots.timeHint', 'e.g. 07:00 am, 10:00 am, 07:30 pm')}
                        </p>
                    </div>

                    {/* Field 3: Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-[#1E1E1E] mb-1.5">
                            {t('slots.notes', 'Notes')}
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t('slots.enterNotes', 'Enter Notes Here.......')}
                            rows={4}
                            className="w-full border border-[#D8B4D4] rounded-xl p-4 text-sm text-[#1E1E1E] outline-none focus:border-[#701A75] focus:ring-1 focus:ring-[#701A75] transition-all placeholder-gray-400 resize-none"
                        />
                    </div>

                    {/* Submit Button matching Figma */}
                    <div className="pt-2 flex justify-center">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-48 py-2.5 rounded-xl font-semibold text-white bg-[linear-gradient(180deg,_#6A1B9A_0%,_#D32F2F_100%)] hover:opacity-90 active:scale-98 transition-all shadow-md cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting
                                ? t('slots.saving', 'Saving...')
                                : isEditMode
                                ? t('slots.updateBtn', 'Update')
                                : t('slots.addBtn', 'Add')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SlotModal;
