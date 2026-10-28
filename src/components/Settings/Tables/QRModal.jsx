import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IoMdClose } from 'react-icons/io';

const QRModal = ({ isOpen, onClose, table }) => {
    const { t } = useTranslation('settings');
    const modalRef = useRef(null);
    const qrRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
            if (modalRef.current) modalRef.current.focus();
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

    const downloadQR = () => {
        if (!qrRef.current) return;
        const svg = qrRef.current.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = 600;
            canvas.height = 600;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 40, 40, 520, 520);

            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `table-${table?.['Table-code'] || table?.Table_code || 'qr'}.png`;
            downloadLink.href = `${pngFile}`;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
        >
            <div
                ref={modalRef}
                tabIndex="-1"
                className="bg-white rounded-[28px] sm:rounded-3xl p-8 sm:p-12 w-full max-w-[560px] relative shadow-2xl outline-none font-['Poppins'] flex flex-col items-center justify-center"
            >
                {/* Close Button matching screenshot */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 sm:top-7 sm:right-7 text-gray-800 hover:text-black transition-colors p-1 cursor-pointer"
                    aria-label="Close"
                >
                    <IoMdClose size={28} />
                </button>

                {/* Stylized QR Code Graphic matching Figma & screenshot */}
                <div 
                    ref={qrRef}
                    onClick={downloadQR}
                    className="flex items-center justify-center mt-3 sm:mt-4 cursor-pointer"
                    title="Click to download QR code"
                >
                    <svg
                        viewBox="0 0 9 9"
                        className="w-56 h-56 sm:w-64 sm:h-64 text-black select-none"
                        fill="currentColor"
                    >
                        {/* Top-Left Corner Box */}
                        <path fillRule="evenodd" d="M0 0h4v4H0V0zm1 1h2v2H1V1z" />
                        {/* Top-Right Corner Box */}
                        <path fillRule="evenodd" d="M5 0h4v4H5V0zm1 1h2v2H6V1z" />
                        {/* Bottom-Left Corner Box */}
                        <path fillRule="evenodd" d="M0 5h4v4H0V5zm1 1h2v2H1V6z" />
                        {/* Bottom-Right Checkerboard Modules */}
                        <rect x="5" y="5" width="1" height="1" />
                        <rect x="7" y="5" width="1" height="1" />
                        <rect x="6" y="6" width="1" height="1" />
                        <rect x="8" y="6" width="1" height="1" />
                        <rect x="5" y="7" width="1" height="1" />
                        <rect x="7" y="7" width="1" height="1" />
                        <rect x="6" y="8" width="1" height="1" />
                        <rect x="8" y="8" width="1" height="1" />
                    </svg>
                </div>

                {/* Centered Title */}
                <h3 className="text-2xl sm:text-[26px] font-bold text-black mt-8 mb-2 tracking-normal font-['Poppins']">
                    {t('tables.scanMe', 'Scan me !')}
                </h3>
            </div>
        </div>
    );
};

export default QRModal;
