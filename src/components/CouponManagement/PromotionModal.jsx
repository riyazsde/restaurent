import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import { useRestaurant } from '../../hooks/queries/usePos';
import { resolveCurrencySymbol } from '../../utils/currencyUtils';

const PromotionModal = ({ isOpen, onClose, onSubmit, initialData = null, isSubmitting = false }) => {
    const { t } = useTranslation('common');
    const { data: restaurantData } = useRestaurant();
    const currency = resolveCurrencySymbol(restaurantData?.currency) || '$';

    const [formData, setFormData] = useState({
        coupon_name: '',
        coupon_code: '',
        category: '',
        offer: '',
        Status: true
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                coupon_name: initialData.coupon_name || '',
                coupon_code: initialData.coupon_code || '',
                category: initialData.category || '',
                offer: initialData.offer || '',
                Status: initialData.Status ?? true
            });
        } else {
            setFormData({
                coupon_name: '',
                coupon_code: '',
                category: '',
                offer: '',
                Status: true
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            ...(initialData ? { Promotion_id: initialData.Promotion_id ?? initialData.id ?? initialData._id } : {})
        });
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            maxWidth="max-w-[440px]" 
            showCloseButton={false}
        >
            <div className="font-poppins px-1 py-1">
                <h2 className="text-xl sm:text-[22px] font-bold text-center text-[#982B4E] mb-6">
                    {initialData 
                        ? t('promotions.editPromotion', 'Edit Promotion') 
                        : t('promotions.addNew', 'Add New Promotion')}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                            {t('promotions.couponName', 'COUPON NAME')}
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.coupon_name}
                            onChange={(e) => setFormData({ ...formData, coupon_name: e.target.value })}
                            placeholder={t('promotions.couponNamePlaceholder', 'Enter coupon name')}
                            className="w-full h-11 px-4 rounded-xl border-[1.5px] border-[#E5989B] focus:border-[#982B4E] focus:outline-none text-sm text-gray-900 placeholder-gray-400 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                            {t('promotions.couponCode', 'COUPON CODE')}
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.coupon_code}
                            onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                            placeholder={t('promotions.couponCodePlaceholder', 'Enter coupon code')}
                            className="w-full h-11 px-4 rounded-xl border-[1.5px] border-[#E5989B] focus:border-[#982B4E] focus:outline-none text-sm font-medium text-gray-900 placeholder-gray-400 transition-colors uppercase"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                            {t('promotions.category', 'CATAGORY')}
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            placeholder={t('promotions.categoryPlaceholder', 'e.g. Happy hour discount')}
                            className="w-full h-11 px-4 rounded-xl border-[1.5px] border-[#E5989B] focus:border-[#982B4E] focus:outline-none text-sm text-gray-900 placeholder-gray-400 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                            {t('promotions.offer', 'OFFER')}
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.offer}
                            onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                            placeholder={t('promotions.offerPlaceholder', `50% Off on ${currency} 199`)}
                            className="w-full h-11 px-4 rounded-xl border-[1.5px] border-[#E5989B] focus:border-[#982B4E] focus:outline-none text-sm text-gray-900 placeholder-gray-400 transition-colors"
                        />
                    </div>

                    <div className="pt-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 rounded-full bg-gradient-to-r from-[#982B4E] to-[#E5989B] text-white font-bold text-sm tracking-wider uppercase shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center disabled:opacity-60 cursor-pointer"
                        >
                            {isSubmitting 
                                ? t('promotions.saving', 'SAVING...') 
                                : t('promotions.save', 'SAVE')}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default PromotionModal;
