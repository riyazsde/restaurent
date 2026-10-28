import React from 'react';

const CloseTabConfirmModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 font-poppins">
            <div className="bg-white rounded-[24px] w-full max-w-[500px] shadow-2xl relative overflow-hidden flex flex-col p-8 text-center">
                <h2 className="text-[28px] font-bold text-black mb-8 mt-4">
                    Are you sure?
                </h2>
                
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-3.5 bg-[#8E8E8E] text-white rounded-full font-bold text-[16px] hover:opacity-90 transition-opacity min-w-[160px]"
                    >
                        No, Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-8 py-3.5 bg-[#FF1A1A] text-white rounded-full font-bold text-[16px] hover:opacity-90 transition-opacity min-w-[160px]"
                    >
                        Yes, Close Tab
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CloseTabConfirmModal;
