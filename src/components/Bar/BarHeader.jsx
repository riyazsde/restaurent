import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SegmentedTab from '../common/SegmentedTab';

const BarHeader = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('common');

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-8 py-6 gap-4">
            <h1 className="text-3xl font-extrabold font-manrope text-black">
                {t('bar.title', 'Bar Management')}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <button 
                    onClick={() => navigate('/dashboard/bar-tabs')}
                    className="bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white px-7 py-[9px] rounded-lg font-medium font-poppins shadow-sm hover:opacity-90 transition-opacity text-sm sm:text-base"
                >
                    {t('bar.openBarTab', '+ Open Bar Tab')}
                </button>
                
                <SegmentedTab 
                    tabs={[
                        { id: 'Food', label: t('bar.food', 'Food') },
                        { id: 'Bar', label: t('bar.bar', 'Bar') }
                    ]}
                    activeTab="Bar"
                    onTabChange={(tab) => {
                        if (tab === 'Food') navigate('/dashboard/pos');
                    }}
                />
            </div>
        </div>
    );
};

export default BarHeader;
