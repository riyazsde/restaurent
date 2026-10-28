import React, { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-[500px]', showCloseButton = true }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
            
            if (modalRef.current) {
                modalRef.current.focus();
            }
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
        >
            <div 
                ref={modalRef}
                tabIndex="-1"
                className={`bg-white rounded-3xl p-6 sm:p-8 w-[95%] ${maxWidth} relative shadow-xl max-h-[90vh] overflow-y-auto outline-none font-poppins`}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex justify-between items-center mb-6">
                        {title && (
                            <h2 id="modal-title" className="text-[28px] font-bold text-black font-poppins leading-tight">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="text-gray-900 hover:text-gray-600 transition-colors ml-auto p-1"
                                aria-label="Close modal"
                            >
                                <FaTimes className="w-6 h-6 font-light" />
                            </button>
                        )}
                    </div>
                )}
                
                {/* Content */}
                <div className="mt-2">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
