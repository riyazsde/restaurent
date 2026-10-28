import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';

const PromotionDeleteModal = ({ isOpen, onClose, onConfirm, isDeleting, title, description }) => {
    const { t } = useTranslation('common');

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[420px]" showCloseButton={false}>
            <div className="p-4 sm:p-6 font-poppins text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {title || t('promotions.deleteConfirmTitle', 'Are you sure?')}
                </h2>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                    {description || t('promotions.deleteConfirmDesc', 'Do you really want to delete this promotion? This action cannot be undone.')}
                </p>
                
                <div className="flex items-center justify-center gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-6 py-2.5 rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm cursor-pointer"
                    >
                        {t('promotions.cancel', 'No, Cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-6 py-2.5 rounded-full bg-[#E53935] hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 text-sm cursor-pointer shadow-sm"
                    >
                        {isDeleting 
                            ? t('promotions.deleting', 'Deleting...') 
                            : t('promotions.delete', 'Yes, Delete')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PromotionDeleteModal;
