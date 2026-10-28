import React from 'react';
import { useTranslation } from 'react-i18next';
import FeedbackSummary from './FeedbackSummary';
import FeedbackTable from './FeedbackTable';

const FeedbackDashboard = () => {
    const { t } = useTranslation('common');
    return (
        <div className="p-8 font-poppins min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-[32px] md:text-[40px] font-extrabold text-black">{t('feedback.title')}</h1>
            </div>
            
            {/* Summary Cards */}
            <FeedbackSummary />

            {/* Table Section */}
            <FeedbackTable />
        </div>
    );
};

export default FeedbackDashboard;
