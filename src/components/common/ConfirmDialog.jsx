import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';

const ConfirmDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    subtitle,
    cancelText,
    confirmText,
    isLoading = false
}) => {
    const { t } = useTranslation('common');
    const displayTitle = title || t('common.areYouSure', 'Are you sure?');
    const displaySubtitle = subtitle || t('common.irreversible', 'This Process is irreversible');
    const displayCancel = cancelText || t('common.cancel', 'Cancel');
    const displayConfirm = confirmText || t('common.ok', 'Okay');

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="w-full max-w-[550px]">
            <div className="flex flex-col items-center justify-center text-center py-4">
                <h2 className="text-[28px] font-bold text-black mb-2">{displayTitle}</h2>
                <p className="text-[20px] font-semibold text-black mb-10">{displaySubtitle}</p>
                
                <div className="flex items-center gap-4 w-full">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-3 px-6 rounded-lg border-2 border-[#D32F2F] text-black font-semibold text-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                        {displayCancel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 py-3 px-6 rounded-lg bg-[#CC1919] text-white font-semibold text-lg hover:bg-[#a81414] transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('common.saving', 'Processing...')}
                            </>
                        ) : displayConfirm}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
