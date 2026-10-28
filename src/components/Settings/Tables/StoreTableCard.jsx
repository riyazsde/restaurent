import React from 'react';
import { useTranslation } from 'react-i18next';
import { BsQrCode } from 'react-icons/bs';
import { PiArmchair } from 'react-icons/pi'; // Using PiArmchair for sofa icon
import { MdOutlineEdit } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';

const StoreTableCard = ({ table, onEdit, onDelete, onDownloadQR }) => {
    const { t } = useTranslation('settings');
    return (
        <div className="bg-white border-[1px] border-[#a068b8] rounded-xl p-4 sm:p-5 flex flex-col gap-4 font-poppins">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                    {/* Icon Circle */}
                    <div className="w-10 h-10 shrink-0 bg-[#F5EAF4] rounded-full flex items-center justify-center">
                        <PiArmchair className="w-5 h-5 text-gray-800" />
                    </div>
                    
                    {/* Text block */}
                    <div className="flex flex-col">
                        <p className="text-[14px] font-bold text-black">{table['Table-name'] || table.Title}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[12px] font-semibold text-gray-500">
                                {t('tables.seatingCapacity', 'Seating Capacity')}: {table['Seating-Persons_Count'] ?? table.Capacity ?? 0}
                            </p>
                            {(table.Floor?.Floor_Name || table.Floor_Name || (typeof table.Floor === 'string' && table.Floor)) && (
                                <span className="text-[11px] font-medium text-purple-700 bg-[#F5EAF4] px-2 py-0.5 rounded-md">
                                    {table.Floor?.Floor_Name || table.Floor_Name || table.Floor}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Action Icons */}
                <div className="flex items-center gap-3">
                    <button onClick={() => onEdit(table)} className="hover:opacity-70 transition-opacity">
                        <MdOutlineEdit className="w-5 h-5 text-gray-700" />
                    </button>
                    <button onClick={() => onDelete(table)} className="hover:opacity-70 transition-opacity">
                        <RiDeleteBin6Line className="w-5 h-5 text-[#CC1919]" />
                    </button>
                </div>
            </div>
            
            {/* Button */}
            <div className="w-full mt-2">
                <button 
                    onClick={() => onDownloadQR(table)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-[6px] rounded-lg text-[13px] font-bold text-black bg-[#F5EAF4] hover:bg-[#ebdcf0] transition-colors"
                >
                    <BsQrCode className="text-[15px]" />
                    {t('tables.downloadQR', 'Download Table QR')}
                </button>
            </div>
        </div>
    );
};

export default StoreTableCard;
