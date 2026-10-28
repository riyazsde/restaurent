import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Edit3, Plus, ArrowLeft, Clock } from 'lucide-react';
import tableService from '../../services/tableService';

// Skeleton Loader component for table cards matching reference UI
const TableSkeleton = ({ sizeType = 'small' }) => {
    const isWide = sizeType === 'wide';
    const isMedium = sizeType === 'medium';
    const isSmall = sizeType === 'small';

    return (
        <div className="flex flex-col items-center animate-pulse">
            {/* Top Chairs Skeleton */}
            <div className={`flex justify-center mb-[-5px] z-0 ${
                isWide ? 'gap-3' : isMedium ? 'gap-4' : ''
            }`}>
                {isWide && [0, 1, 2, 3].map(i => (
                    <div key={`top-${i}`} className="w-9 h-4 rounded-t-xl bg-[#E2D2ED]/60" />
                ))}
                {isMedium && [0, 1].map(i => (
                    <div key={`top-${i}`} className="w-9 h-4 rounded-t-xl bg-[#E2D2ED]/60" />
                ))}
                {isSmall && (
                    <div className="w-9 h-4 rounded-t-xl bg-[#E2D2ED]/60" />
                )}
            </div>

            {/* Table Surface Skeleton */}
            <div className="w-full h-[96px] rounded-2xl bg-gradient-to-b from-[#EDE4F4]/70 via-[#F6EDF5]/70 to-[#FCF0F5]/70 border border-[#EADDF0]/40 shadow-xs flex flex-col items-center justify-center p-2 z-10 relative">
                <div className="w-9 h-9 rounded-full bg-purple-200/70 mb-1.5" />
                <div className="w-14 h-3.5 rounded-full bg-purple-200/50" />
            </div>

            {/* Bottom Chairs Skeleton */}
            <div className={`flex justify-center mt-[-5px] z-0 ${
                isWide ? 'gap-3' : isMedium ? 'gap-4' : ''
            }`}>
                {isWide && [0, 1, 2, 3].map(i => (
                    <div key={`bot-${i}`} className="w-9 h-4 rounded-b-xl bg-[#E2D2ED]/60" />
                ))}
                {isMedium && [0, 1].map(i => (
                    <div key={`bot-${i}`} className="w-9 h-4 rounded-b-xl bg-[#E2D2ED]/60" />
                ))}
                {isSmall && (
                    <div className="w-9 h-4 rounded-b-xl bg-[#E2D2ED]/60" />
                )}
            </div>
        </div>
    );
};

// Table Card matching Image 1 exactly
const TableCard = ({ table, onSelect, isSelectable = false }) => {
    const sizeType = table.sizeType || (table.size >= 6 ? 'wide' : table.size === 4 ? 'medium' : 'small');
    const isWide = sizeType === 'wide';
    const isMedium = sizeType === 'medium';
    const isSmall = sizeType === 'small';

    // Status UI rendering with exact colors and badges from Image 1
    const getStatusUI = (status) => {
        if (!status) return null;
        const type = String(status.type || '').toLowerCase();
        
        if (type.includes('reserve')) {
            return (
                <div className="bg-[#DDD0F8] text-[#6B21A8] text-[11px] font-bold px-3 py-0.5 rounded-full mt-1.5 shadow-xs select-none tracking-wide">
                    Reserved
                </div>
            );
        }
        if (type.includes('ready')) {
            return (
                <div className="bg-[#FDE7BA] text-[#DD6B20] text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1.5 flex items-center gap-1 shadow-xs select-none">
                    <span className="text-[12px] leading-none">🔔</span>
                    <span>Ready</span>
                </div>
            );
        }
        if (type.includes('serve')) {
            return (
                <div className="bg-[#C6F6D5] text-[#16A34A] text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1.5 flex items-center gap-1 shadow-xs select-none">
                    <span className="w-3.5 h-3.5 rounded-full border border-[#16A34A] flex items-center justify-center text-[9px] font-bold leading-none">✓</span>
                    <span>Served</span>
                </div>
            );
        }
        if (type.includes('wait') || type.includes('time') || status.time) {
            return (
                <div className="bg-[#FCD8D4] text-[#E53E3E] text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1.5 flex items-center gap-1 shadow-xs select-none">
                    <Clock className="w-3 h-3 stroke-[2.5]" />
                    <span>{status.time || '09:23'}</span>
                </div>
            );
        }
        return null;
    };

    const displayId = table.id;

    return (
        <div 
            onClick={() => onSelect?.(table)}
            className={`flex flex-col items-center cursor-pointer group transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] ${
                isSelectable ? 'hover:ring-2 hover:ring-purple-400 rounded-3xl p-1' : ''
            }`}
        >
            {/* Top Chairs */}
            <div className={`flex justify-center mb-[-5px] z-0 ${
                isWide ? 'gap-3' : isMedium ? 'gap-4' : ''
            }`}>
                {isWide && [0, 1, 2, 3].map(i => (
                    <div key={`top-${i}`} className="w-9 h-4 rounded-t-xl bg-gradient-to-b from-[#E2D2ED] to-[#FAF0F5] shadow-xs group-hover:from-purple-300 group-hover:to-pink-200 transition-colors" />
                ))}
                {isMedium && [0, 1].map(i => (
                    <div key={`top-${i}`} className="w-9 h-4 rounded-t-xl bg-gradient-to-b from-[#E2D2ED] to-[#FAF0F5] shadow-xs group-hover:from-purple-300 group-hover:to-pink-200 transition-colors" />
                ))}
                {isSmall && (
                    <div className="w-9 h-4 rounded-t-xl bg-gradient-to-b from-[#E2D2ED] to-[#FAF0F5] shadow-xs group-hover:from-purple-300 group-hover:to-pink-200 transition-colors" />
                )}
            </div>

            {/* Table Surface */}
            <div className="w-full h-[96px] rounded-2xl bg-gradient-to-b from-[#EDE4F4] via-[#F6EDF5] to-[#FCF0F5] border border-[#EADDF0]/60 shadow-[0_2px_10px_rgba(200,180,210,0.12)] flex flex-col items-center justify-center p-2 z-10 relative group-hover:border-purple-300 group-hover:shadow-[0_4px_16px_rgba(180,140,200,0.22)] transition-all">
                {/* ID Circular Badge */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#601542] via-[#7B163D] to-[#991835] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <span className="text-white font-bold text-[12px] tracking-wide leading-none">
                        {displayId}
                    </span>
                </div>
                {/* Status Indicator */}
                {getStatusUI(table.status)}
            </div>

            {/* Bottom Chairs */}
            <div className={`flex justify-center mt-[-5px] z-0 ${
                isWide ? 'gap-3' : isMedium ? 'gap-4' : ''
            }`}>
                {isWide && [0, 1, 2, 3].map(i => (
                    <div key={`bot-${i}`} className="w-9 h-4 rounded-b-xl bg-gradient-to-b from-[#FAF0F5] to-[#E2D2ED] shadow-xs group-hover:from-pink-200 group-hover:to-purple-300 transition-colors" />
                ))}
                {isMedium && [0, 1].map(i => (
                    <div key={`bot-${i}`} className="w-9 h-4 rounded-b-xl bg-gradient-to-b from-[#FAF0F5] to-[#E2D2ED] shadow-xs group-hover:from-pink-200 group-hover:to-purple-300 transition-colors" />
                ))}
                {isSmall && (
                    <div className="w-9 h-4 rounded-b-xl bg-gradient-to-b from-[#FAF0F5] to-[#E2D2ED] shadow-xs group-hover:from-pink-200 group-hover:to-purple-300 transition-colors" />
                )}
            </div>
        </div>
    );
};

// Fallback sample data matching the exact 15 tables in reference UI
const FALLBACK_SAMPLE_TABLES = [
    // Row 1
    { id: 't-01', sizeType: 'wide', size: 8, status: { type: 'Reserved' } },
    { id: 't-02', sizeType: 'small', size: 2, status: { type: 'Ready' } },
    { id: 't-3',  sizeType: 'medium', size: 4, status: null },
    { id: 't-02', sizeType: 'small', size: 2, status: { type: 'Ready' } },
    { id: 't-05', sizeType: 'small', size: 2, status: null },
    // Row 2
    { id: 't-29', sizeType: 'wide', size: 8, status: { type: 'Served' } },
    { id: 't-31', sizeType: 'small', size: 2, status: null },
    { id: 't-30', sizeType: 'medium', size: 4, status: { type: 'Waiting', time: '09:23' } },
    { id: 't-31', sizeType: 'small', size: 2, status: { type: 'Served' } },
    { id: 't-32', sizeType: 'small', size: 2, status: null },
    // Row 3
    { id: 't-20', sizeType: 'wide', size: 8, status: { type: 'Waiting', time: '09:23' } },
    { id: 't-31', sizeType: 'small', size: 2, status: null },
    { id: 't-30', sizeType: 'medium', size: 4, status: { type: 'Reserved' } },
    { id: 't-31', sizeType: 'small', size: 2, status: { type: 'Ready' } },
    { id: 't-33', sizeType: 'small', size: 2, status: null },
];

const EmployeeTable = () => {
    const { t } = useTranslation('common');
    const location = useLocation();
    const navigate = useNavigate();
    const { floor, persons, fromBar } = location.state || {};
    const [filter, setFilter] = useState('All Tables');

    const { data: tablesData, isLoading } = useQuery({
        queryKey: ['employeeTables'],
        queryFn: () => tableService.getTablesByAuth()
    });

    const apiTables = tablesData?.data || [];

    // Map API data or fallback to sample tables matching Image 1
    const allTables = apiTables.length > 0 
        ? apiTables.map((t, idx) => {
            const rawId = t['Table-code'] || t['Table-name'] || t.TableName || t.table_name || t.id || t.Table_id || `t-${idx + 1}`;
            const displayId = String(rawId).startsWith('t-') ? rawId : `t-${rawId}`;
            const colPos = idx % 5;
            const sizeType = colPos === 0 ? 'wide' : colPos === 2 ? 'medium' : 'small';
            const seats = Number(t['Seating-Persons_Count'] || t.Capacity || t.size || (sizeType === 'wide' ? 8 : sizeType === 'medium' ? 4 : 2));
            
            let statusType = null;
            let statusTime = null;
            const bookingStatus = t['Table-Booking-Status_id'];
            if (bookingStatus) {
                if (typeof bookingStatus === 'object') {
                    statusType = bookingStatus.Name || bookingStatus.name || null;
                } else if (typeof bookingStatus === 'number') {
                    const statusMap = { 1: null, 2: 'Reserved', 3: 'Served', 4: 'Waiting', 5: 'Ready' };
                    statusType = statusMap[bookingStatus] || null;
                } else if (typeof bookingStatus === 'string') {
                    statusType = bookingStatus;
                }
            } else if (t.status) {
                if (typeof t.status === 'object') {
                    statusType = t.status.type || t.status.name || null;
                    statusTime = t.status.time || null;
                } else if (typeof t.status === 'string') {
                    statusType = t.status;
                }
            }

            // If status is 'Empty', treat as null
            if (String(statusType || '').toLowerCase() === 'empty') {
                statusType = null;
            }

            return {
                id: displayId,
                rawId,
                size: seats,
                sizeType,
                status: statusType ? { type: String(statusType), time: statusTime } : null,
                original: t
            };
        })
        : FALLBACK_SAMPLE_TABLES;

    const filterOptions = ['All Tables', 'Served', 'waiting', 'Reserved'];

    const handleTableSelect = (table) => {
        if (fromBar) {
            const rawId = table.rawId || table.id || '04';
            const cleanTableId = String(rawId).replace(/[^0-9]/g, '') || rawId;
            navigate('/dashboard/bar', {
                state: {
                    fromTableSelect: true,
                    selectedTable: cleanTableId,
                    floor: floor || 'F - 01',
                    persons: persons || 1
                }
            });
        }
    };

    // Filter logic with safe string conversion
    const displayTables = allTables.map(table => {
        if (filter === 'All Tables') return table;
        
        const tableStatusType = String(table.status?.type || '').toLowerCase();
        const activeFilter = String(filter || '').toLowerCase();

        if (tableStatusType && (tableStatusType === activeFilter || tableStatusType.includes(activeFilter))) {
            return table;
        }
        
        return { ...table, status: null };
    });

    return (
        <div className="h-full flex flex-col font-manrope px-8 py-6 max-h-screen overflow-hidden bg-white">
            {/* Header Area matching Image 1 */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 flex-shrink-0">
                {/* Title (Guaranteed single line, bold Table, muted Floor Plan) */}
                <div className="flex items-center gap-3 shrink-0">
                    {fromBar && (
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/bar')}
                            className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-50 shadow-xs transition-all mr-1"
                            title={t('common.back', 'Back to Bar')}
                        >
                            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                        </button>
                    )}
                    <h1 className="text-3xl font-black text-black whitespace-nowrap tracking-tight">
                        Table <span className="font-semibold text-gray-500">(Floor Plan)</span>
                    </h1>
                </div>
                
                {/* Center Toggle Pills */}
                <div className="flex bg-[#ECEEF0] rounded-full p-1 shadow-inner items-center space-x-1 shrink-0">
                    {filterOptions.map(opt => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => setFilter(opt)}
                            className={`px-5 py-2 text-[13px] font-bold rounded-full transition-all whitespace-nowrap ${
                                filter === opt
                                    ? 'bg-white text-black shadow-xs'
                                    : 'text-gray-500 hover:text-black'
                            }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {/* Right Header Actions matching Image 1: Edit Tables + Add Waitlist */}
                <div className="flex items-center space-x-2 shrink-0">
                    {/* Edit Tables Button */}
                    <button 
                        type="button"
                        onClick={() => navigate('/floorplan/edit')}
                        className="px-4 py-2.5 rounded-xl font-bold text-white text-sm shadow-sm bg-gradient-to-r from-[#6A1657] via-[#85164B] to-[#991B38] hover:opacity-95 active:scale-95 flex items-center gap-2 transition-all"
                    >
                        <Edit3 className="w-4 h-4 stroke-[2.5]" />
                        <span>{t('floorPlan.editTables', 'Edit Tables')}</span>
                    </button>

                    {/* Add Waitlist Button */}
                    <button 
                        type="button"
                        className="px-4 py-2.5 rounded-xl font-bold text-white text-sm shadow-sm bg-gradient-to-r from-[#85164B] to-[#991B38] hover:opacity-95 active:scale-95 flex items-center gap-1.5 transition-all"
                    >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>{t('floorPlan.addWaitlist', 'Add Waitlist')}</span>
                    </button>
                </div>
            </div>

            {/* Dedicated Bar Order Session Banner when navigating from Bar */}
            {fromBar && (
                <div className="mb-6 px-5 py-3 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border border-purple-200/80 rounded-2xl flex items-center justify-between shadow-xs animate-fadeIn shrink-0">
                    <div className="flex items-center gap-3 text-sm font-semibold text-purple-900">
                        <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-base">🍸</span>
                        <span>{t('bar.barOrderSession', 'Bar Order Session')}</span>
                        <span className="text-purple-300">•</span>
                        <span>{t('bar.floorLabel', 'Floor:')} <strong className="text-purple-950 font-bold">{floor || 'Floor 1'}</strong></span>
                        <span className="text-purple-300">•</span>
                        <span>{t('bar.personsLabel', 'Persons:')} <strong className="text-purple-950 font-bold">{persons || 1}</strong></span>
                    </div>
                    <span className="text-xs font-bold text-purple-700 bg-white/90 px-3.5 py-1.5 rounded-full shadow-xs border border-purple-200 animate-pulse">
                        👉 {t('bar.clickTableToAssign', 'Click any table below to select')}
                    </span>
                </div>
            )}

            {/* Main Content Area - Floor Plan 5-Column Grid with Skeletons */}
            <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar pb-8 pr-2">
                <div className="grid grid-cols-[1.8fr_1fr_1.3fr_1fr_1fr] gap-x-7 gap-y-11 min-w-[850px] max-w-[1240px]">
                    {isLoading ? (
                        /* SKELETON LOADER GRID: 3 rows of 5 tables matching the exact proportions */
                        Array.from({ length: 15 }).map((_, idx) => {
                            const colPos = idx % 5;
                            const sizeType = colPos === 0 ? 'wide' : colPos === 2 ? 'medium' : 'small';
                            return <TableSkeleton key={idx} sizeType={sizeType} />;
                        })
                    ) : (
                        /* REAL TABLES GRID */
                        displayTables.map((table, idx) => (
                            <TableCard 
                                key={table.id || idx} 
                                table={table} 
                                onSelect={handleTableSelect}
                                isSelectable={Boolean(fromBar)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
export default EmployeeTable;
