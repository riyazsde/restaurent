import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiX } from 'react-icons/fi';
import { validateLoyaltyTierValues } from '../../../utils/loyaltyTierValidation';
import { useRestaurant } from '../../../hooks/queries/usePos';
import { resolveCurrencySymbol } from '../../../utils/currencyUtils';

const TierModal = ({ isOpen, onClose, onSubmit, initialData = null, isSubmitting = false }) => {
    const { t } = useTranslation('common');
    const { data: restaurantData } = useRestaurant();
    const currency = resolveCurrencySymbol(restaurantData?.currency);
    const [fieldErrors, setFieldErrors] = useState({});
    const [formData, setFormData] = useState({
        tier: '',
        emoji: '',
        threshold: '',
        multiplier: '',
        benefits: '',
        status: true
    });

    useEffect(() => {
        setFieldErrors({});
        if (initialData) {
            setFormData({
                id: initialData.id,
                tier: initialData.tier || '',
                emoji: initialData.emoji || '',
                threshold: initialData.threshold || '',
                multiplier: initialData.multiplier || '',
                benefits: initialData.benefits || '',
                status: initialData.status ?? true
            });
        } else {
            setFormData({
                tier: '',
                emoji: '',
                threshold: '',
                multiplier: '',
                benefits: '',
                status: true
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const valid = validateLoyaltyTierValues(formData);
        const nextErrors = {};
        if (!valid.threshold) {
            nextErrors.threshold = t('loyalty.thresholdInvalid', 'Enter a valid non-negative threshold.');
        }
        if (!valid.multiplier) {
            nextErrors.multiplier = t('loyalty.multiplierInvalid', 'Enter a valid multiplier greater than 0 (e.g., 1.75X).');
        }
        setFieldErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;
        onSubmit(formData);
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setFormData(current => ({ ...current, [name]: value }));
        setFieldErrors(current => ({ ...current, [name]: '' }));
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[620px] overflow-hidden font-poppins">
                {/* Gradient Header matching Figma */}
                <div className="bg-gradient-to-r from-[#6A1B9A] via-[#982B4E] to-[#D32F2F] px-8 py-6 text-white relative">
                    <h2 className="text-xl sm:text-[22px] font-bold text-white tracking-wide">
                        {initialData ? t('loyalty.editTier', 'Edit Loyalty Program') : t('loyalty.addNewTier', 'Add New Loyalty Programs')}
                    </h2>
                    <p className="text-xs sm:text-sm text-white/90 mt-1 font-normal">
                        {t('loyalty.modalSubtitle', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry')}
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-6 right-6 text-white/80 hover:text-white transition-opacity p-1"
                        aria-label="Close"
                    >
                        <FiX size={22} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-8">
                    <h3 className="text-base font-bold text-gray-900 mb-5">
                        {t('loyalty.information', 'Information')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Tier */}
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1.5">
                                {t('loyalty.tierLabel', 'Tier')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="tier"
                                required
                                value={formData.tier}
                                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                                placeholder={t('loyalty.tierPlaceholder', 'e.g., Gold')}
                                className="w-full border border-gray-200 rounded-[10px] px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                            />
                        </div>

                        {/* Threshold */}
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1.5">
                                {t('loyalty.thresholdLabel', 'Threshold')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="threshold"
                                required
                                value={formData.threshold}
                                onChange={handleFieldChange}
                                inputMode="decimal"
                                aria-invalid={Boolean(fieldErrors.threshold)}
                                aria-describedby={fieldErrors.threshold ? 'tier-threshold-error' : undefined}
                                placeholder={t('loyalty.thresholdPlaceholder', {
                                    currency,
                                    defaultValue: currency ? `e.g., ${currency} 500.00+` : 'e.g., 500.00+'
                                })}
                                className="w-full border border-gray-200 rounded-[10px] px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                            />
                            {fieldErrors.threshold && (
                                <p id="tier-threshold-error" role="alert" className="mt-1 text-xs text-red-600">
                                    {fieldErrors.threshold}
                                </p>
                            )}
                        </div>

                        {/* Point Multiplier */}
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1.5">
                                {t('loyalty.multiplierLabel', 'Point Multiplier')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="multiplier"
                                required
                                value={formData.multiplier}
                                onChange={handleFieldChange}
                                inputMode="decimal"
                                aria-invalid={Boolean(fieldErrors.multiplier)}
                                aria-describedby={fieldErrors.multiplier ? 'tier-multiplier-error' : undefined}
                                placeholder={t('loyalty.multiplierPlaceholder', 'e.g., 1.75X')}
                                className="w-full border border-gray-200 rounded-[10px] px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                            />
                            {fieldErrors.multiplier && (
                                <p id="tier-multiplier-error" role="alert" className="mt-1 text-xs text-red-600">
                                    {fieldErrors.multiplier}
                                </p>
                            )}
                        </div>

                        {/* Benefits */}
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1.5">
                                {t('loyalty.benefitsLabel', 'Benefits')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="benefits"
                                required
                                value={formData.benefits}
                                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                                placeholder={t('loyalty.benefitsPlaceholder', 'e.g., Free Birthday Drink')}
                                className="w-full border border-gray-200 rounded-[10px] px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Bottom Buttons */}
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="w-full py-3 px-6 rounded-[12px] border border-gray-300 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                        >
                            {t('loyalty.cancel', 'Cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-6 rounded-[12px] bg-[#8C14FC] hover:bg-[#780de0] text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isSubmitting 
                                ? t('loyalty.saving', 'Saving...') 
                                : initialData 
                                    ? t('loyalty.save', 'Save') 
                                    : t('loyalty.add', 'Add')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TierModal;
