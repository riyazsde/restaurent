import React from 'react';

const StoreTableSkeleton = () => {
    return (
        <div className="bg-white border-2 border-pink-200/50 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 animate-pulse">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                    {/* Icon Circle */}
                    <div className="w-10 h-10 shrink-0 bg-pink-100/50 rounded-full"></div>
                    
                    {/* Text block */}
                    <div className="flex flex-col gap-1.5">
                        <div className="h-5 w-32 bg-gray-200 rounded"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                </div>
                
                {/* Action Icons */}
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-200 rounded-sm"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded-sm"></div>
                </div>
            </div>
            
            {/* Button */}
            <div className="h-9 w-full bg-pink-100/50 rounded-lg mt-2"></div>
        </div>
    );
};

export default StoreTableSkeleton;
