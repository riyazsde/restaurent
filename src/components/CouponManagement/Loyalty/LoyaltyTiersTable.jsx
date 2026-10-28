import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useLoyaltyTiers } from '../../../hooks/queries/useLoyalty';

const LoyaltyTiersTable = ({ onEdit, onDelete }) => {
    const { t } = useTranslation('common');
    const { data: response, isLoading } = useLoyaltyTiers();
    const tiers = response?.data || [];

    if (isLoading) {
        return (
            <div className="bg-white rounded-[14px] border border-gray-100 shadow-sm overflow-hidden p-6 animate-pulse">
                <div className="h-8 bg-gray-100 rounded-md w-full mb-4"></div>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 border-b border-gray-100 flex items-center px-4 gap-6">
                        <div className="h-4 w-28 bg-gray-200 rounded"></div>
                        <div className="h-4 w-36 bg-gray-200 rounded"></div>
                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        <div className="h-4 flex-1 bg-gray-200 rounded"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        <div className="h-8 w-20 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[14px] border border-gray-100 shadow-sm overflow-hidden font-poppins">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[880px]">
                    <thead>
                        <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-4 border-r border-gray-100 whitespace-nowrap">
                                {t('loyalty.tier', 'TIER')}
                            </th>
                            <th className="px-6 py-4 border-r border-gray-100 whitespace-nowrap">
                                {t('loyalty.threshold', 'THRESHOLD (LIFETIME SPEND)')}
                            </th>
                            <th className="px-6 py-4 border-r border-gray-100 whitespace-nowrap">
                                {t('loyalty.pointMultiplier', 'POINT MULTIPLIER')}
                            </th>
                            <th className="px-6 py-4 whitespace-nowrap">
                                {t('loyalty.benefits', 'BENEFITS')}
                            </th>
                            <th className="px-6 py-4 whitespace-nowrap">
                                {t('loyalty.status', 'STATUS')}
                            </th>
                            <th className="px-6 py-4 whitespace-nowrap text-left">
                                {t('loyalty.actions', 'ACTIONS')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tiers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">
                                    {t('loyalty.noTiers', 'No tiers found.')}
                                </td>
                            </tr>
                        ) : (
                            tiers.map((tier) => (
                                <tr key={tier.id} className="hover:bg-gray-50/60 transition-colors">
                                    {/* Tier */}
                                    <td className="px-6 py-5 text-sm font-medium text-gray-800 flex items-center gap-2.5">
                                        <span className="text-xl leading-none">{tier.emoji}</span>
                                        <span className="text-gray-900 font-semibold">{tier.tier}</span>
                                    </td>

                                    {/* Threshold */}
                                    <td className="px-6 py-5 text-sm text-gray-800 font-normal">
                                        {tier.threshold}
                                    </td>

                                    {/* Multiplier */}
                                    <td className="px-6 py-5 text-sm text-gray-800 font-normal">
                                        {tier.multiplier}
                                    </td>

                                    {/* Benefits */}
                                    <td className="px-6 py-5 text-sm text-gray-800 font-normal">
                                        {tier.benefits}
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-5">
                                        <span className={`text-sm font-semibold ${tier.status ? 'text-[#4CAF50]' : 'text-gray-400'}`}>
                                            {tier.status ? t('loyalty.active', 'Active') : t('loyalty.inactive', 'Inactive')}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => onEdit(tier)}
                                                className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-[8px] text-gray-600 hover:text-black hover:border-gray-300 transition-colors"
                                                title={t('loyalty.editTier', 'Edit')}
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => onDelete(tier)}
                                                className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-[8px] text-gray-600 hover:text-red-500 hover:border-red-200 transition-colors"
                                                title={t('loyalty.delete', 'Delete')}
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LoyaltyTiersTable;
