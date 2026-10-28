import React from 'react';

export const SettingsFormSkeleton = () => (
    <div className="w-full space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex flex-col gap-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-10 bg-gray-100 rounded w-full max-w-2xl border border-gray-200"></div>
                </div>
            ))}
        </div>
        <div className="h-10 bg-gray-200 rounded w-32 mt-6"></div>
    </div>
);

export const SettingsTableSkeleton = () => (
    <div className="w-full bg-white rounded-[10px] shadow-sm overflow-hidden border border-gray-100 animate-pulse mt-4">
        <div className="h-14 bg-gray-50 border-b border-gray-100 flex items-center px-6 gap-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 border-b border-gray-50 flex items-center px-6 gap-4">
                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-16 ml-auto"></div>
            </div>
        ))}
    </div>
);

export const SettingsGridSkeleton = () => (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-pulse mt-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 w-8 bg-gray-100 rounded-full"></div>
                </div>
                <div className="space-y-2 mt-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                </div>
                <div className="mt-4 flex gap-2">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
            </div>
        ))}
    </div>
);
