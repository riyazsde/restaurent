import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEmployeeStatistics } from '../../hooks/queries/useEmployee';

// Placeholder avatar images for the cluster
import emp1 from '../assets/emp1.jpg';
import emp2 from '../assets/emp2.jpg';
import emp3 from '../assets/emp3.jpg';

const Employee = () => {
    const { t } = useTranslation('employee');
    const navigate = useNavigate();

    // Fetch employee statistics via TanStack Query hook
    const { data: stats, isLoading } = useEmployeeStatistics();

    const roleCards = useMemo(() => {
        const baseCards = [
            {
                key: 'managers',
                roleName: 'Managers',
                apiRole: 'Manager',
                title: t('roles.managers.title', 'Managers'),
                description: t('roles.managers.description', "Manager's Take care of the Restaurant sales and the customer feedback. By Assisting & Monitoring the peers."),
                metricType: 'text',
                metricText: '4.5/5 Task completion',
                progress: '95%',
                chatCount: 2,
                extraCount: 2,
            },
            {
                key: 'cashiers',
                roleName: 'Cashiers',
                apiRole: 'Cashier',
                title: t('roles.cashiers.title', 'Cashiers'),
                description: t('roles.cashiers.description', "Manager's Take care of the Restaurant sales and the customer feedback. By Assisting & Monitoring the peers."),
                metricType: 'text',
                metricText: '4/5 Billing Accuracy',
                progress: '80%',
                chatCount: 2,
                extraCount: 2,
            },
            {
                key: 'waiter',
                roleName: 'Waiter',
                apiRole: 'Waiter',
                title: t('roles.waiter.title', 'Waiter'),
                description: t('roles.waiter.description', "Manager's Take care of the Restaurant sales and the customer feedback. By Assisting & Monitoring the peers."),
                metricType: 'rating',
                ratingStars: 4,
                metricText: '200+ reviews',
                progress: '65%',
                chatCount: 2,
                extraCount: 2,
            },
            {
                key: 'chefs',
                roleName: "Chef's",
                apiRole: 'Chef',
                title: t('roles.chefs.title', "Chef's"),
                description: t('roles.chefs.description', "Manager's Take care of the Restaurant sales and the customer feedback. By Assisting & Monitoring the peers."),
                metricType: 'rating',
                ratingStars: 5,
                metricText: '200+ reviews',
                progress: '99%',
                chatCount: 2,
                extraCount: 2,
            }
        ];

        // Enrich base cards with live backend stats if available
        const byRole = stats?.by_role || {};
        const cards = baseCards.map(card => {
            const roleStat = byRole[card.apiRole] || byRole[card.roleName];
            if (roleStat) {
                const count = roleStat.count || 0;
                return {
                    ...card,
                    extraCount: count > 3 ? count - 3 : 2,
                    description: roleStat.description || card.description,
                };
            }
            return card;
        });

        // Add any additional roles from backend that aren't in baseCards
        const existingApiRoles = new Set(baseCards.map(c => c.apiRole.toLowerCase()));
        Object.entries(byRole).forEach(([roleKey, roleStat]) => {
            if (!existingApiRoles.has(roleKey.toLowerCase())) {
                cards.push({
                    key: roleKey.toLowerCase(),
                    roleName: roleKey,
                    apiRole: roleKey,
                    title: roleKey,
                    description: roleStat?.description || `Manage operations, permissions, and staff assigned to the ${roleKey} role.`,
                    metricType: 'text',
                    metricText: '4.5/5 Task completion',
                    progress: '90%',
                    chatCount: 2,
                    extraCount: (roleStat?.count || 0) > 3 ? (roleStat.count - 3) : 2
                });
            }
        });

        return cards;
    }, [stats, t]);

    const handleCardClick = (role) => {
        navigate('/dashboard/employee/list', {
            state: {
                roleName: role.roleName,
                apiRole: role.apiRole
            }
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 font-[Poppins]">
            {/* Header: Title and Create Employee Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h2 className="text-2xl sm:text-[32px] font-bold text-black tracking-tight">
                    {t('title', 'Employee Details')}
                </h2>

                <button
                    onClick={() => navigate('/dashboard/employee/create')}
                    style={{ background: 'linear-gradient(90deg, #7B1FA2 0%, #C2185B 100%)' }}
                    className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-95 transition-opacity whitespace-nowrap shadow-sm cursor-pointer self-start sm:self-auto"
                >
                    <span>{t('createEmployee', 'Create Employee')}</span>
                    <Plus size={16} strokeWidth={2.5} />
                </button>
            </div>

            {/* Role Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3, 4].map((item) => (
                        <div key={item} className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6 flex flex-col min-h-[290px] animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
                            <div className="h-3.5 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-3.5 bg-gray-200 rounded w-4/5 mb-8"></div>
                            
                            <div className="flex flex-col gap-3 mb-6">
                                <div className="h-3.5 bg-gray-200 rounded w-1/2 self-center"></div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
                                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                                </div>
                                <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    roleCards.map((role) => (
                        <div
                            key={role.key}
                            onClick={() => handleCardClick(role)}
                            className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md hover:border-purple-200 transition-all cursor-pointer group min-h-[290px]"
                        >
                            <div>
                                <h3 className="text-xl font-bold text-black mb-2">
                                    {role.title}
                                </h3>
                                <p className="text-xs text-gray-600 leading-relaxed mb-6 font-normal">
                                    {role.description}
                                </p>
                            </div>

                            <div>
                                {/* Metric Text / Stars */}
                                <div className="flex items-center justify-center mb-2.5">
                                    {role.metricType === 'rating' ? (
                                        <div className="flex items-center justify-center gap-1.5">
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: role.ratingStars || 4 }).map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        size={15} 
                                                        className="text-[#FBBF24] fill-none stroke-[#FBBF24]" 
                                                        strokeWidth={1.8} 
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs font-bold text-black ml-1">
                                                {role.metricText}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xs font-bold text-black">
                                            {role.metricText}
                                        </span>
                                    )}
                                </div>

                                {/* Gradient Progress Bar */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ 
                                                width: role.progress,
                                                background: 'linear-gradient(90deg, #7B1FA2 0%, #C2185B 100%)'
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                                        {role.progress}
                                    </span>
                                </div>

                                {/* Card Footer: Avatars + Chat Indicator */}
                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center -space-x-2">
                                        <img 
                                            src={emp1} 
                                            alt="emp1" 
                                            className="w-8 h-8 rounded-full border-2 border-white relative z-30 object-cover shadow-xs" 
                                        />
                                        <img 
                                            src={emp2} 
                                            alt="emp2" 
                                            className="w-8 h-8 rounded-full border-2 border-white relative z-20 object-cover shadow-xs" 
                                        />
                                        <img 
                                            src={emp3} 
                                            alt="emp3" 
                                            className="w-8 h-8 rounded-full border-2 border-white relative z-10 object-cover shadow-xs" 
                                        />
                                        <div className="w-8 h-8 rounded-full border border-[#8E24AA] bg-white shadow-xs flex items-center justify-center relative z-0 text-[#8E24AA] font-bold text-xs">
                                            +{role.extraCount}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-medium text-gray-700">
                                            {role.chatCount}
                                        </span>
                                        <svg 
                                            width="17" 
                                            height="17" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="#C2185B" 
                                            strokeWidth="1.8" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Employee;