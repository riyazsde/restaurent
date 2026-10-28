import React from 'react';
import { useFeedbackSummary } from '../../hooks/queries/useFeedback';

const FeedbackSummary = () => {
    const { data: response, isLoading } = useFeedbackSummary();

    const data = (response && response.overallCounts) ? response : { overallCounts: [], metrics: [] };

    if (isLoading) {
        return (
            <div className="flex flex-col lg:flex-row gap-6 animate-pulse">
                <div className="w-full lg:w-[300px] h-[300px] bg-[#FDF4F9] rounded-2xl"></div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-[#FDF4F9] h-[140px] rounded-2xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 font-poppins">
            {/* Left Tall Card - Overall Feedback Counts */}
            <div className="w-full lg:w-[320px] bg-gradient-to-br from-[#F5E6EF] to-[#FCE7F3] rounded-2xl p-6 shadow-sm border border-pink-50/50">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[15px] font-extrabold text-black">Overall Feedback</h3>
                    <span className="text-[15px] font-extrabold text-black">Peoples</span>
                </div>
                
                <div className="space-y-4">
                    {data.overallCounts.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{item.emoji}</span>
                                <span className="text-sm font-medium text-gray-800">{item.label}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-800">{item.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Grid - Individual Metrics */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.metrics.map((metric, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-[#F5E6EF] to-[#FCE7F3] rounded-2xl p-6 shadow-sm border border-pink-50/50 flex flex-col justify-between">
                        <h3 className="text-[15px] font-extrabold text-black mb-8">{metric.title}</h3>
                        <div className="flex items-center justify-center gap-2 mt-auto">
                            <span className="text-3xl">{metric.emoji}</span>
                            <span className="text-xl font-medium text-gray-800">{metric.label}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeedbackSummary;
