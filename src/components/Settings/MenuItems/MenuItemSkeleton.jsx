import React from 'react';

const MenuItemSkeleton = () => {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white shadow-sm animate-pulse w-full">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0" />
            
            <div className="flex flex-col gap-2 flex-grow">
                <div className="h-5 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4 mt-1" />
                <div className="h-3 bg-gray-200 rounded w-1/5" />
            </div>

            <div className="flex gap-3 ml-4 flex-shrink-0">
                <div className="w-6 h-6 bg-gray-200 rounded-full" />
                <div className="w-6 h-6 bg-gray-200 rounded-full" />
                <div className="w-6 h-6 bg-gray-200 rounded-full" />
            </div>
        </div>
    );
};

export default MenuItemSkeleton;
