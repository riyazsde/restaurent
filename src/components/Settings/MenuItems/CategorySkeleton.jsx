import React from 'react';

const CategorySkeleton = () => {
    return (
        <tr className="border-t border-gray-200 animate-pulse">
            <td className="px-6 py-4 w-16">
                <div className="w-6 h-6 bg-gray-200 rounded-md" />
            </td>
            <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
            </td>
            <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-3">
                    <div className="w-5 h-5 bg-gray-200 rounded-full" />
                    <div className="w-5 h-5 bg-gray-200 rounded-full" />
                    <div className="w-5 h-5 bg-gray-200 rounded-full" />
                </div>
            </td>
        </tr>
    );
};

export default CategorySkeleton;
