/* eslint-disable no-unused-vars */
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
    LineChart, Line, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { FaUserFriends, FaChair, FaWineGlassAlt } from 'react-icons/fa';
import vector from '../assets/globe.svg'
import money from '../assets/money.svg'
import { useNavigate } from "react-router-dom";

import { GiChickenOven } from 'react-icons/gi';
import line from '../assets/line.svg'
import { FaRegClock } from "react-icons/fa";
import { FaWineBottle } from "react-icons/fa";
import { IoFastFoodSharp } from "react-icons/io5";
import { BsBox } from "react-icons/bs";
import { MdOutlineArrowOutward } from "react-icons/md";
import dashboardService from '../../services/dashboardService';
import reservationService from '../../services/reservationService';
import ordersService from '../../services/ordersService';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils/currencyUtils';
import { useRestaurant } from '../../hooks/queries/usePos';

const Shimmer = ({ className = "h-4 w-full rounded" }) => (
    <div className={`shimmer-loader ${className}`} />
);

const DataState = ({ isLoading, data, loadingFallback, children }) => {
    const { t } = useTranslation('dashboard');
    if (isLoading) {
        return loadingFallback || (
            <div className="space-y-4 py-2 w-full">
                {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                            <Shimmer className="w-10 h-10 rounded-full shrink-0" />
                            <div className="space-y-1.5">
                                <Shimmer className="h-4 w-28 rounded" />
                                <Shimmer className="h-3 w-16 rounded" />
                            </div>
                        </div>
                        <Shimmer className="h-4 w-12 rounded" />
                    </div>
                ))}
            </div>
        );
    }
    const hasData = Array.isArray(data) ? data.length > 0 : !!data;
    if (!hasData) {
        return (
            <div className="flex h-full items-center justify-center py-6">
                <p className="text-gray-400 font-medium text-sm">{t('messages.noDataFound')}</p>
            </div>
        );
    }
    return typeof children === 'function' ? children(data) : children;
};

const useDragScroll = (scrollRef) => {
    useEffect(() => {
        const slider = scrollRef.current;
        if (!slider) return;

        let isDown = false;
        let startY;
        let scrollTop;

        const handleMouseDown = (e) => {
            isDown = true;
            startY = e.pageY - slider.offsetTop;
            scrollTop = slider.scrollTop;
        };

        const handleMouseLeave = () => (isDown = false);
        const handleMouseUp = () => (isDown = false);

        const handleMouseMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const y = e.pageY - slider.offsetTop;
            const walk = (y - startY) * 1;
            slider.scrollTop = scrollTop - walk;
        };

        const handleTouchStart = (e) => {
            isDown = true;
            startY = e.touches[0].pageY - slider.offsetTop;
            scrollTop = slider.scrollTop;
        };

        const handleTouchMove = (e) => {
            if (!isDown) return;
            const y = e.touches[0].pageY - slider.offsetTop;
            const walk = (y - startY) * 1;
            slider.scrollTop = scrollTop - walk;
        };

        const handleTouchEnd = () => (isDown = false);

        slider.addEventListener('mousedown', handleMouseDown);
        slider.addEventListener('mouseleave', handleMouseLeave);
        slider.addEventListener('mouseup', handleMouseUp);
        slider.addEventListener('mousemove', handleMouseMove);
        slider.addEventListener('touchstart', handleTouchStart);
        slider.addEventListener('touchmove', handleTouchMove);
        slider.addEventListener('touchend', handleTouchEnd);

        return () => {
            slider.removeEventListener('mousedown', handleMouseDown);
            slider.removeEventListener('mouseleave', handleMouseLeave);
            slider.removeEventListener('mouseup', handleMouseUp);
            slider.removeEventListener('mousemove', handleMouseMove);
            slider.removeEventListener('touchstart', handleTouchStart);
            slider.removeEventListener('touchmove', handleTouchMove);
            slider.removeEventListener('touchend', handleTouchEnd);
        };
    }, [scrollRef]);
};

const DashboardSection = () => {
    const { t } = useTranslation('dashboard');
    const scrollRef = useRef(null);
    const scrollRef2 = useRef(null);
    const scrollRef3 = useRef(null);

    useDragScroll(scrollRef);
    useDragScroll(scrollRef2);
    useDragScroll(scrollRef3);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef();
    const navigate = useNavigate();
    const { data: restaurantData } = useRestaurant();
    const currency = restaurantData?.currency;

    const filterOptions = [
        { key: 'this_week', apiValue: 'this_week', labelKey: 'filters.thisWeek' },
        { key: 'this_month', apiValue: 'this_month', labelKey: 'filters.thisMonth' },
        { key: '6_month', apiValue: '6_month', labelKey: 'filters.sixMonth' },
        { key: 'one_year', apiValue: 'one_year', labelKey: 'filters.oneYear' }
    ];
    const [selectedFilterKey, setSelectedFilterKey] = useState('this_week');

    const activeFilterOption = filterOptions.find(o => o.key === selectedFilterKey);
    const filterApiValue = activeFilterOption?.apiValue || 'this_week';

    // TanStack React Query for Dashboard Data, Reservations, and Orders
    const { data: dashboardPayload, isLoading } = useQuery({
        queryKey: ['dashboard', filterApiValue],
        queryFn: async () => {
            const [dashboardRes, reservationRes, ordersRes] = await Promise.all([
                dashboardService.getRestaurantDashboard(filterApiValue),
                reservationService.getReservationsByAuth(),
                ordersService.getMyOrders()
            ]);
            return {
                dashboardData: dashboardRes?.success ? dashboardRes.data : null,
                reservations: reservationRes?.success ? (reservationRes.data || []) : [],
                orders: ordersRes?.success ? (ordersRes.data || []) : []
            };
        },
        staleTime: 60 * 1000
    });

    const dashboardData = dashboardPayload?.dashboardData || null;
    const reservations = dashboardPayload?.reservations || [];
    const orders = dashboardPayload?.orders || [];

    const barData = useMemo(() => {
        if (!dashboardData?.RepeatCustomersChart?.Days) return [];
        return dashboardData.RepeatCustomersChart.Days.map((day, index) => ({
            day,
            value: dashboardData.RepeatCustomersChart.percentage[index] || 0
        }));
    }, [dashboardData]);

    const lineData = useMemo(() => {
        if (!dashboardData?.NewCustomersChart?.Days) return [];
        return dashboardData.NewCustomersChart.Days.map((day, index) => ({
            day,
            value: dashboardData.NewCustomersChart.percentage[index] || 0
        }));
    }, [dashboardData]);

    const translateDay = (day) => {
        if (!day) return '';
        const dayMap = {
            'Mon': t('days.mon'),
            'Tue': t('days.tue'),
            'Wed': t('days.wed'),
            'Thu': t('days.thu'),
            'Fri': t('days.fri'),
            'Sat': t('days.sat'),
            'Sun': t('days.sun'),
            'Monday': t('days.mon'),
            'Tuesday': t('days.tue'),
            'Wednesday': t('days.wed'),
            'Thursday': t('days.thu'),
            'Friday': t('days.fri'),
            'Saturday': t('days.sat'),
            'Sunday': t('days.sun'),
        };
        return dayMap[day] || day;
    };

    const getOrderStatusConfig = (status) => {
        if (status === 'Served' || status === 'Completed') {
            return { label: t('status.served'), bg: "bg-[#34C7594D]", text: "text-green-700", icon: "✔️" };
        } else if (status === 'Preparing' || status === 'Cooking') {
            return { label: t('status.preparing'), bg: "bg-[#FFE3BC]", text: "text-yellow-700", icon: "⏳" };
        } else if (status === 'Cancelled') {
            return { label: t('status.cancelled'), bg: "bg-[#FF3B304D]", text: "text-red-700", icon: "❌" };
        }
        return { label: t('status.pending'), bg: "bg-gray-100", text: "text-gray-700", icon: "" };
    };

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (

        <>
            <div className='hidden lg:block'>
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center font-poppins">
                        <h2 className="text-[32px] font-bold font-poppins">{t('title')}</h2>
                        {/* <div style={{ fontFamily: 'Manrope' }} className="bg-gradient-to-b from-[#F3EBFC] to-[#FCE7E9] px-3 py-1 text-black rounded-md text-[16px] font-medium">
                        This Week ▼
                    </div> */}
                        <div className="relative inline-block text-left" ref={dropdownRef}>
                            <button
                                onClick={() => setOpen(!open)}
                                className="gradient-dropdown whitespace-nowrap"
                            >
                                <span className="whitespace-nowrap">{t(filterOptions.find(o => o.key === selectedFilterKey)?.labelKey || 'filters.thisWeek')}</span>
                                <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 ml-1">
                                    <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            {open && (
                                <div className="absolute right-0  z-10 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 text-sm text-black">
                                    {filterOptions.map((option) => (
                                        <div
                                            key={option.key}
                                            onClick={() => {
                                                setSelectedFilterKey(option.key);
                                                setOpen(false);
                                            }}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            {t(option.labelKey)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MAIN DASHBOARD GRID */}
                    <div className="flex flex-col gap-6 w-full">

                        {/* ROW 1: Total Order, Repeat Customers, New Customers */}
                        <div className="flex gap-6 w-full h-[280px]">
                            {/* Col 1: Total Order & Total Sale */}
                            <div className="w-1/4  flex flex-col gap-6">
                                <div className="p-[1.05px] bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] rounded-xl flex-1 flex">
                                    <div className="dashboard-card w-full flex flex-col justify-center bg-white rounded-[calc(0.75rem-1.05px)] p-4">
                                        <p className="font-bold text-gray-900 text-lg mb-2">{t('statistics.totalOrder')}</p>
                                        {isLoading ? (
                                            <Shimmer className="h-9 w-24 rounded-lg" />
                                        ) : (
                                            <p className="text-3xl font-bold text-gray-900">
                                                {dashboardData?.TotalOrder || 0}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 p-[1.05px] bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] rounded-xl flex">
                                    <div className="dashboard-card w-full flex flex-col justify-center bg-white rounded-[calc(0.75rem-1.05px)] p-4">
                                        <p className="font-bold text-gray-900 text-lg mb-2">{t('statistics.totalSale')}</p>
                                        {isLoading ? (
                                            <Shimmer className="h-9 w-40 rounded-lg" />
                                        ) : (
                                            <p className="text-3xl font-bold text-gray-900">
                                                {formatCurrency(dashboardData?.TotalSale, currency)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Col 2: Repeat Customers Chart */}
                            <div className="w-[37.5%] p-[1.05px] bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] rounded-xl flex">
                                <div className="dashboard-card w-full flex flex-col bg-white rounded-[calc(0.75rem-1.05px)] p-4">
                                    <p className="font-bold text-gray-900 text-lg mb-4">{t('charts.repeatCustomers')}</p>
                                    <div className="flex-1 w-full">
                                        {isLoading ? (
                                            <div className="h-full w-full shimmer-loader rounded-xl"></div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={barData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                    <XAxis dataKey="day" tickFormatter={translateDay} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(tick) => `${tick}%`} />
                                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                        {barData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill="url(#repeatCustomerGradient)" />
                                                        ))}
                                                    </Bar>
                                                    <defs>
                                                        <linearGradient id="repeatCustomerGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#6A1B9A" />
                                                            <stop offset="100%" stopColor="#D32F2F" />
                                                        </linearGradient>
                                                    </defs>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Col 3: New Customers Chart */}
                            <div className="w-[37.5%] p-[1.05px] bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] rounded-xl flex">
                                <div className="dashboard-card w-full flex flex-col bg-white rounded-[calc(0.75rem-1.05px)] p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="font-bold text-gray-900 text-lg">{t('charts.newCustomers')}</p>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            {t(filterOptions.find(o => o.key === selectedFilterKey)?.labelKey || 'filters.thisWeek')}
                                        </span>
                                    </div>
                                    <div className="flex-1 w-full">
                                        {isLoading ? (
                                            <div className="h-full w-full shimmer-loader rounded-xl"></div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={lineData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                                    <defs>
                                                        <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#d32f2f" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#d32f2f" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                    <XAxis dataKey="day" tickFormatter={translateDay} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                                    <Tooltip />
                                                    <Area type="monotone" dataKey="value" stroke="#d32f2f" strokeWidth={2} fillOpacity={1} fill="url(#colorNew)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ROW 2: Quick Stats */}
                        <div className="grid grid-cols-4 gap-6">
    <div className="p-[1.05px] bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] rounded-xl flex">
        <div className="dashboard-card w-full flex flex-col justify-center bg-white rounded-[calc(0.75rem-1.05px)] p-4">
            <p className="font-semibold text-gray-600 text-sm mb-2">{t('statistics.activeOrders')}</p>
            {isLoading ? (
                <Shimmer className="h-8 w-20 rounded-md" />
            ) : (
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.ActiveOrders || 99}</p>
            )}
        </div>
    </div>

    <div className="p-[1.05px] bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] rounded-xl flex">
        <div className="dashboard-card w-full flex flex-col justify-center bg-white rounded-[calc(0.75rem-1.05px)] p-4">
            <p className="font-semibold text-gray-600 text-sm mb-2">{t('statistics.openTables')}</p>
            {isLoading ? (
                <Shimmer className="h-8 w-20 rounded-md" />
            ) : (
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.OpenTables || 12}</p>
            )}
        </div>
    </div>

    <div className="p-[1.05px] bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] rounded-xl flex">
        <div className="dashboard-card w-full flex flex-col justify-center bg-white rounded-[calc(0.75rem-1.05px)] p-4">
            <p className="font-semibold text-gray-600 text-sm mb-2">{t('statistics.staffClockedIn')}</p>
            {isLoading ? (
                <Shimmer className="h-8 w-20 rounded-md" />
            ) : (
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.StaffClockedIn || 8}</p>
            )}
        </div>
    </div>

    <div className="p-[1.05px] bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] rounded-xl flex">
        <div className="dashboard-card w-full flex flex-col justify-center bg-white rounded-[calc(0.75rem-1.05px)] p-4">
            <p className="font-semibold text-gray-600 text-sm mb-2">{t('statistics.pendingReservations')}</p>
            {isLoading ? (
                <Shimmer className="h-8 w-20 rounded-md" />
            ) : (
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.PendingReservations || 5}</p>
            )}
        </div>
    </div>
</div>

                        {/* ROW 3: Lists */}
                      <div className="grid grid-cols-3 gap-6">
    {/* Reservations */}
    <div className="p-[1.05px] bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] rounded-xl flex">
        <div className="dashboard-card w-full h-[400px] flex flex-col bg-white rounded-[calc(0.75rem-1.05px)] p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg text-gray-900">{t('sections.reservations')}</h2>
                <button onClick={() => navigate('/dashboard/reservations')} className="text-sm text-brand-secondary font-medium hover:underline">{t('actions.seeAll')} ▾</button>
            </div>
            <div className="overflow-y-auto custom-scroll flex-1 pr-2">
                {isLoading ? (
                    <div className="space-y-4 py-2">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="flex flex-col gap-2 pb-3 border-b border-gray-100 last:border-0">
                                <Shimmer className="h-3 w-28 rounded" />
                                <Shimmer className="h-4 w-44 rounded" />
                                <div className="flex gap-4">
                                    <Shimmer className="h-3 w-16 rounded" />
                                    <Shimmer className="h-3 w-16 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (dashboardData?.ReservationsOrderList?.length > 0 || reservations?.length > 0) ? (
                    (dashboardData?.ReservationsOrderList || reservations).map((res, i) => (
                        <div key={i} className="mb-4 border-b border-gray-100 pb-4 last:border-0">
                            <p className="text-xs text-gray-500 mb-1">{new Date(res.Date_time || Date.now()).toLocaleString()}</p>
                            <p className="font-bold text-gray-900 text-sm mb-1">
                                {res.CreateBy?.Name || t('labels.unknown')}
                                <span className="font-normal text-gray-400 ml-2">ID: {res.Reservations_id || res._id?.slice(-6)}</span>
                            </p>
                            <div className="flex items-center text-xs text-gray-600 gap-4">
                                <span className="flex items-center gap-1"><FaUserFriends /> {res.people_count || 2} {t('labels.people')}</span>
                                <span className="flex items-center gap-1"><FaChair /> {res.Table_id ? `${t('labels.table')} ${res.Table_id}` : `2 ${t('labels.tables')}`}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-gray-400 font-medium text-sm">{t('messages.noDataFound')}</p>
                    </div>
                )}
            </div>
        </div>
    </div>

    {/* Top Sellers */}
    <div className="p-[1.05px] bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] rounded-xl flex">
        <div className="dashboard-card w-full h-[400px] flex flex-col bg-white rounded-[calc(0.75rem-1.05px)] p-4">
            <h2 className="font-bold text-lg text-gray-900 mb-4">{t('sections.topSellers')}</h2>
            <div className="overflow-y-auto custom-scroll flex-1 pr-2">
                <DataState isLoading={isLoading} data={dashboardData?.TopSellersItemList}>
                    {(data) => data.map((item, i) => (
                        <div key={i} className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                                    <IoFastFoodSharp className="text-xl" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{item.item_name}</p>
                                    <p className="text-xs text-gray-500">{formatCurrency(item.item_price, currency)}</p>
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{item.total_quantity_sold} {t('labels.qty')}</span>
                        </div>
                    ))
                    }
                </DataState>
            </div>
        </div>
    </div>

    {/* Stock Alert & Button */}
    <div className="flex flex-col gap-5 h-[400px]">
        <div className="p-[1.05px] bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] rounded-xl flex flex-1 min-h-0">
            <div className="dashboard-card w-full flex flex-col bg-white rounded-[calc(0.75rem-1.05px)] p-4">
                <h2 className="font-bold text-lg text-gray-900 mb-4">{t('sections.stockAlert')}</h2>
                <div className="overflow-y-auto custom-scroll flex-1 pr-2">
                    <DataState
                        isLoading={isLoading}
                        data={dashboardData?.StockAlertList}
                        loadingFallback={
                            <div className="space-y-4 py-2">
                                {[1, 2, 3, 4].map((n) => (
                                    <div key={n} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                        <Shimmer className="h-4 w-32 rounded" />
                                        <Shimmer className="h-4 w-16 rounded" />
                                    </div>
                                ))}
                            </div>
                        }
                    >
                        {(data) => data.map((item, i) => (
                            <div key={i} className="flex justify-between items-center border-b border-gray-100 py-3 last:border-0">
                                <p className="font-bold text-gray-900 text-sm">{item.item_name || item.name}</p>
                                <p className="text-brand-secondary text-xs font-semibold">{item.alert_level === 'Critical' ? t('labels.critical') : (item.alert_level || t('labels.quantityLow'))}</p>
                            </div>
                        ))
                        }
                    </DataState>
                </div>
            </div>
        </div>
        <button
            onClick={() => navigate('/dashboard/reports')}
            className="w-full bg-gradient-to-b from-brand-primary to-brand-secondary text-white font-medium text-[16px] rounded-2xl py-[16px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shrink-0 shadow-sm"

        >
            {t('actions.viewDetailedReport')}
            <span className="text-lg leading-none font-bold mt-[1px]">&gt;</span>
        </button>
    </div>
</div>
                    </div>
                </div>
            </div>
            <div className="block lg:hidden p-4 font-[Poppins]">
                {/* Header Cards */}
                {/* <div className="flex justify-between gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow p-4 w-1/2 text-center">
                        <p className="text-sm text-gray-500">Total Orders</p>
                        <p className="text-lg font-semibold">2 093 XOF</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 w-1/2 text-center">
                        <p className="text-sm text-gray-500">Total Sales</p>
                        <p className="text-lg font-semibold">2 093 XOF</p>
                    </div>
                </div> */}
                <div className="flex justify-between space-x-4 mb-4">
                    <div className="flex-1 bg-white shadow rounded-lg p-4 flex items-center">
                        <div className="bg-[#34C7594D] text-green-600 rounded-full p-2 mr-3">
                            <img src={vector} alt='vendot' />
                        </div>
                        <div className='whitespace-nowrap'>
                            <p className="text-xs text-gray-500">{t('statistics.totalOrders')}</p>
                            {isLoading ? (
                                <Shimmer className="h-5 w-16 rounded mt-1" />
                            ) : (
                                <p className="font-bold text-lg">{dashboardData?.TotalOrder || 0}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 bg-white shadow rounded-lg p-4 flex items-center">
                        <div className="bg-[#FFBB3866] text-yellow-600 rounded-full p-2 mr-3">
                            <img src={money} alt='money' />
                        </div>
                        <div className='whitespace-nowrap'>
                            <p className="text-xs text-gray-500">{t('statistics.totalSales')}</p>
                            {isLoading ? (
                                <Shimmer className="h-5 w-24 rounded mt-1" />
                            ) : (
                                <p className="font-bold text-lg">{formatCurrency(dashboardData?.TotalSale, currency)}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filter + Order History Title */}
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg">{t('sections.orderHistory')}</h2>
                    <div className="flex items-center gap-2">

                        <span className="text-sm text-[#8A1538]">{t('actions.viewAll')} {'>'}</span>
                    </div>
                </div>

                {[
                    // { status: "Served", color: "green", bg: "bg-[#34C7594D]", text: "text-green-700", icon: "✔️" },
                    // { status: "Preparing", color: "yellow", bg: "bg-[#FFE3BC]", text: "text-yellow-700", icon: "⏳" },
                    // { status: "Served", color: "green", bg: "bg-green-100", text: "text-green-700", icon: "✔️" },
                    // { status: "Cancelled", color: "red", bg: "bg-[#FF3B304D]", text: "text-red-700", icon: "❌" },
                ]}
                <DataState
                    isLoading={isLoading}
                    data={orders?.slice(0, 5)}
                    loadingFallback={
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl shadow p-4 mb-3 flex justify-between items-center">
                                    <div className="space-y-2">
                                        <Shimmer className="h-4 w-24 rounded" />
                                        <Shimmer className="h-3 w-16 rounded" />
                                    </div>
                                    <Shimmer className="h-8 w-24 rounded" />
                                </div>
                            ))}
                        </div>
                    }
                >
                    {(data) => data.map((order, index) => { // Show updated 5 recents
                        const statusConfig = getOrderStatusConfig(order.Order_Status);

                        return (
                            <div key={index} className="bg-white rounded-xl  shadow p-4 mb-3 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-sm">#{order.POS_Order_id || order._id?.slice(-6)}</p>
                                    <p className="text-xs text-gray-500">• {t('labels.table')} - {order.Table_id || 'N/A'}</p>
                                </div>
                                <div
                                    className={`text-xs px-4 py-2 rounded-md font-medium w-auto min-w-[104px] ${statusConfig.bg} ${statusConfig.text} flex items-center justify-center gap-1`}

                                >
                                    {statusConfig.label}
                                    {statusConfig.icon && <span>{statusConfig.icon}</span>}
                                </div>
                            </div>
                        );
                    })}
                </DataState>
            </div>
            <div className="block lg:hidden p-4 font-[Poppins]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">{t('sections.reservations')}</h2>
                    <span onClick={() => navigate('/dashboard/reservations')} className="text-sm text-[#8A1538] cursor-pointer">{t('actions.viewAll')} {'>'}</span>
                </div>

                <DataState
                    isLoading={isLoading}
                    data={reservations}
                    loadingFallback={
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg shadow px-4 py-3 mb-3 flex justify-between items-center">
                                    <div className="space-y-2">
                                        <Shimmer className="h-4 w-28 rounded" />
                                        <Shimmer className="h-3 w-20 rounded" />
                                    </div>
                                    <Shimmer className="h-6 w-16 rounded" />
                                </div>
                            ))}
                        </div>
                    }
                >
                    {(data) => data.map((res, idx) => {
                        const dateObj = new Date(res.Date_time);
                        const dateStr = dateObj.toLocaleDateString('en-GB');
                        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                        return (
                            <div key={idx} className="bg-white rounded-lg shadow px-4 py-3 mb-3 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-semibold">{res.CreateBy?.Name || t('labels.unknown')} <span className="text-xs font-normal text-gray-500">#{res.Reservations_id}</span></p>
                                    <div className="flex items-center text-xs text-gray-500 mt-1 gap-2">
                                        <span className={`text-${res.Status ? 'green' : 'orange'}-500`}>●</span>
                                        <span>{dateStr}</span>
                                        <span>{timeStr}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 text-sm text-gray-700">
                                    <div className="flex items-center gap-1">
                                        <FaRegClock className="text-lg" />
                                        {/* Use Floor or Table info */}
                                        {res.Table_id ? `${t('labels.table')} ${res.Table_id}` : t('labels.noTable')}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FaUserFriends className="text-lg" />
                                        {res.people_count}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </DataState>
            </div>
            <div className="lg:hidden p-4 space-y-6 font-poppins">

                {/* Top Sellers Section */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-bold text-lg">{t('sections.topSellers')}</h2>
                        {/* <span className="text-xs text-gray-500">View all</span> */}
                        <span className="text-sm text-[#8A1538]">{t('actions.viewAll')} {'>'}</span>

                    </div>

                    <div className="space-y-3">
                        <DataState
                            isLoading={isLoading}
                            data={dashboardData?.TopSellersItemList}
                            loadingFallback={
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-xl shadow p-3 space-y-2">
                                            <div className="flex justify-between">
                                                <Shimmer className="h-4 w-28 rounded" />
                                                <Shimmer className="h-4 w-12 rounded" />
                                            </div>
                                            <Shimmer className="h-2 w-full rounded-full" />
                                        </div>
                                    ))}
                                </div>
                            }
                        >
                            {(data) => data.map((item, index) => {
                                const colors = [
                                    { color: "bg-[#002495]", textColor: "text-[#002495]", width: "90%" },
                                    { color: "bg-[#EB8F00]", textColor: "text-[#EB8F00]", width: "66%" },
                                    { color: "bg-[#34C759]", textColor: "text-[#34C759]", width: "40%" },
                                    { color: "bg-[#7C1E88]", textColor: "text-[#7C1E88]", width: "25%" },
                                ];
                                const colorScheme = colors[index % colors.length];
                                return (
                                    <div key={index} className="bg-white rounded-xl shadow p-3">
                                        <div className="flex justify-between text-sm font-medium mb-2">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <IoFastFoodSharp className="text-lg" />
                                                {item.item_name}
                                            </div>
                                            <span className={colorScheme.textColor}>{item.total_quantity_sold} Qty</span>
                                        </div>
                                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                            <div className={`${colorScheme.color} h-full rounded-full`} style={{ width: colorScheme.width }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </DataState>
                    </div>
                </div>

                {/* Stock Alerts Section */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-bold text-lg">{t('sections.stockAlert')}</h2>
                        {/* <span className="text-xs text-gray-500">View all</span> */}
                        <span className="text-sm text-[#8A1538]">{t('actions.viewAll')} {'>'}</span>

                    </div>

                    <div className="space-y-3">
                        <DataState
                            isLoading={isLoading}
                            data={dashboardData?.StockAlertList}
                            loadingFallback={
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-xl shadow p-3 space-y-2">
                                            <div className="flex justify-between">
                                                <Shimmer className="h-4 w-28 rounded" />
                                                <Shimmer className="h-4 w-16 rounded" />
                                            </div>
                                            <Shimmer className="h-2 w-full rounded-full" />
                                        </div>
                                    ))}
                                </div>
                            }
                        >
                            {(data) => data.map((item, i) => (
                                <div key={i} className="bg-white rounded-xl shadow p-3">
                                    <div className="flex justify-between text-sm font-medium mb-2 text-gray-700">
                                        <span>{item.name}</span>
                                        <span className="text-[#C51800]">{item.quantity} {t('labels.qtyLeft')}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                        <div className="bg-[#C51800] h-full rounded-full" style={{ width: `${item.percentage || 20}%` }}></div>
                                    </div>
                                </div>
                            ))
                            }
                        </DataState>
                    </div>
                </div>

                {/* Button */}
                <div className="pt-2">
                    <button onClick={() => navigate('/dashboard/reports')} className="w-full py-3 rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2 bg-gradient-to-b from-brand-primary to-brand-secondary">
                        {t('actions.viewDetailedReport')} <MdOutlineArrowOutward className="text-lg" />
                    </button>
                </div>
            </div>

        </>

    );
};


export default DashboardSection;
