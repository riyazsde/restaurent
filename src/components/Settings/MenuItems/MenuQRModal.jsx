import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FiX } from 'react-icons/fi';

const MenuQRModal = ({ isOpen, onClose, menuUrl = "https://example.com/menu" }) => {
    const qrRef = useRef();

    if (!isOpen) return null;

    const handleDownload = () => {
        // Find the SVG inside the container
        const svg = qrRef.current.querySelector('svg');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        // Convert SVG to Data URL
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            // Give the canvas some padding
            const padding = 20;
            canvas.width = img.width + padding * 2;
            canvas.height = img.height + padding * 2;
            
            // Draw white background
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw the QR code
            ctx.drawImage(img, padding, padding);
            
            URL.revokeObjectURL(url);

            // Trigger download
            const imgURI = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            const evt = new MouseEvent("click", {
                view: window,
                bubbles: false,
                cancelable: true
            });
            const a = document.createElement("a");
            a.setAttribute("download", "menu_qr_code.png");
            a.setAttribute("href", imgURI);
            a.setAttribute("target", '_blank');
            a.dispatchEvent(evt);
        };

        img.src = url;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                onClick={onClose}
            ></div>
            
            <div className="relative bg-white rounded-[24px] shadow-xl w-full max-w-md p-8 text-center animate-in fade-in zoom-in duration-200">
                <button 
                    onClick={onClose}
                    className="absolute top-5 right-5 text-black hover:opacity-70 transition-opacity"
                >
                    <FiX className="w-6 h-6" />
                </button>

                <h3 className="text-[#22C55E] text-2xl font-semibold mb-3">
                    You Successfully Created The QR
                </h3>
                
                <p className="text-black/70 text-[15px] mb-8 px-4 leading-relaxed">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                </p>
                
                <div className="flex justify-center mb-8" ref={qrRef}>
                    <QRCodeSVG 
                        value={menuUrl} 
                        size={220} 
                        level="H"
                        includeMargin={false}
                    />
                </div>
                
                <button 
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white px-10 py-3 rounded-full text-lg font-medium hover:opacity-90 transition-opacity shadow-md"
                >
                    Download
                </button>
            </div>
        </div>
    );
};

export default MenuQRModal;
