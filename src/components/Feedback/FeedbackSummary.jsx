import React from 'react';
import { useFeedbackSummary } from '../../hooks/queries/useFeedback';

const FeedbackSummary = () => {
    const { data: response, isLoading } = useFeedbackSummary();

    // Fallback to prevent crashes if data is missing
    const data = response || { overallCounts: [], metrics: [] };

    if (isLoading) {
        return (
            <div className="flex flex-col lg:flex-row gap-4 animate-pulse">
                <div className="w-full lg:w-[320px] h-[320px] bg-[#FDF4F9] rounded-[20px]"></div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-[#FDF4F9] h-[148px] rounded-[20px]"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-4 font-sans">
            {/* Left Tall Card - Overall Feedback Counts */}
            <div className="w-full lg:w-[320px] bg-gradient-to-b from-[#F8EEF4] to-[#FAF0F6] rounded-[20px] p-5 shadow-sm">
                <div className="flex justify-between items-center mb-5 px-1">
                    <h3 className="text-[14px] font-bold text-[#1A1A1A]">Overall Feedback</h3>
                    <span className="text-[14px] font-bold text-[#1A1A1A]">Peoples</span>
                </div>
                
                <div className="space-y-3.5">
                    {data.overallCounts.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2.5">
                                <span className="text-[18px]">{item.emoji}</span>
                                <span className="text-[13px] font-medium text-[#333]">{item.label}</span>
                            </div>
                            <span className="text-[13px] font-semibold text-[#333]">{item.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Grid - Individual Metrics */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {data.metrics.map((metric, idx) => (
                    <div 
                        key={idx} 
                        className="bg-gradient-to-b from-[#F8EEF4] to-[#FAF0F6] rounded-[20px] p-5 shadow-sm flex flex-col justify-between min-h-[148px]"
                    >
                        <h3 className="text-[14px] font-bold text-[#1A1A1A] mb-4">{metric.title}</h3>
                        
                        <div className="flex items-center justify-center gap-2 mt-auto pb-2">
                            <span className="text-[20px]">{metric.emoji}</span>
                            <span className="text-[16px] font-semibold text-[#333]">{metric.label}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeedbackSummary;