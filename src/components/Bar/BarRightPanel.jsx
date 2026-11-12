import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Trash2, User, Layers, Armchair } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyUtils';
import { calculateBarOrderTotals } from './barOrderTotals';

const BarRightPanel = ({
    mode = 'IDLE', // 'IDLE' | 'FLOOR_MAP' | 'START_ORDER_SUMMARY' | 'ORDER_SUMMARY'
    onOpenFloorMap,
    selectedPersons = 1,
    onChangePersons,
    selectedFloor = 'F - 01',
    onSelectFloor,
    selectedTable = '04',
    floors = ['F - 01', 'F - 02', 'F - 03', 'F - 04', 'F - 05', 'F - 06'],
    onStartOrder,
    cartItems = [],
    onRemoveCartItem,
    onSelectPaymentOption,
    currency = 'XOF'
}) => {
    const navigate = useNavigate();
    const { t } = useTranslation('common');

    const formattedPersons = String(selectedPersons).padStart(2, '0');
    const floorDigits = String(selectedFloor).replace(/[^0-9]/g, '') || '01';
    const formattedFloor = floorDigits.padStart(2, '0');
    const formattedTable = String(selectedTable).replace(/[^0-9]/g, '') || String(selectedTable);

    // Navigate to Table Selection view
    const handleSelectTable = () => {
        navigate('/dashboard/table', {
            state: {
                floor: selectedFloor,
                persons: selectedPersons,
                fromBar: true
            }
        });
    };

    // Calculate totals for active order
    const { taxAmount, serviceCharge, grandTotal } = calculateBarOrderTotals(
        cartItems,
        0.06,
        currency
    );

    // Group cart items by category
    const groupedItems = cartItems.reduce((acc, it) => {
        const cat = it.category || 'Cocktails';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(it);
        return acc;
    }, {});

    // Helper for category badge color & letter
    const getCategoryMeta = (catName) => {
        const lower = String(catName).toLowerCase();
        if (lower.includes('mocktail')) {
            return { letter: 'M', color: '#0284C7', bg: '#0284C7', text: '#0284C7' };
        }
        if (lower.includes('beer')) {
            return { letter: 'B', color: '#D97706', bg: '#F59E0B', text: '#D97706' };
        }
        if (lower.includes('wine')) {
            return { letter: 'W', color: '#9333EA', bg: '#A855F7', text: '#9333EA' };
        }
        return { letter: 'C', color: '#D97706', bg: '#F59E0B', text: '#D97706' };
    };

    // ========================================================
    // STATE 1: IDLE ("Tap to Select Table & Start Order")
    // ========================================================
    if (mode === 'IDLE') {
        return (
            <div 
                onClick={onOpenFloorMap}
                className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center h-full w-[360px] cursor-pointer group p-6 select-none border border-gray-100"
            >
                <h2 className="text-2xl font-extrabold text-gray-500 font-manrope text-center leading-relaxed group-hover:text-gray-700 transition-colors">
                    {t('bar.tapToSelectTable', 'Tap to Select Table')}<br/>
                    {t('bar.and', '&')}<br/>
                    {t('bar.startOrder', 'Start Order')}
                </h2>
            </div>
        );
    }

    // ========================================================
    // STATE 2: FLOOR MAP CONFIGURATION (Image 2 & 3)
    // ========================================================
    if (mode === 'FLOOR_MAP') {
        return (
            <div className="bg-white rounded-3xl shadow-md flex flex-col h-full w-[360px] overflow-hidden border border-gray-100 font-manrope">
                {/* Header Banner */}
                <div 
                    className="px-6 py-5 shrink-0"
                    style={{
                        background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.45) 0%, rgba(244, 114, 182, 0.45) 100%)'
                    }}
                >
                    <h2 className="text-[24px] font-bold text-gray-900 leading-tight">
                        {t('bar.floorMap', 'Floor Map')}
                    </h2>
                    <p className="text-[13px] font-medium text-gray-700 mt-0.5">
                        {t('bar.selectFloorAndPersons', 'Select Floor and Persons')}
                    </p>
                </div>

                {/* Body Controls */}
                <div className="p-6 flex flex-col justify-between flex-1">
                    <div className="space-y-6">
                        {/* Select Persons */}
                        <div>
                            <h3 className="text-[15px] font-bold text-gray-900 mb-3">
                                {t('bar.selectPersons', 'Select Persons:')}
                            </h3>
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => onChangePersons?.(Math.max(1, selectedPersons - 1))}
                                    disabled={selectedPersons <= 1}
                                    className="w-12 h-11 rounded-[10px] bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white flex items-center justify-center hover:opacity-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <Minus className="w-5 h-5 stroke-[2.5]" />
                                </button>
                                <div className="w-16 h-11 flex items-center justify-center font-bold text-[18px] text-gray-900 border-y border-gray-100 bg-white select-none">
                                    {selectedPersons}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onChangePersons?.(selectedPersons + 1)}
                                    className="w-12 h-11 rounded-[10px] bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white flex items-center justify-center hover:opacity-95 active:scale-95 transition-all shadow-sm"
                                >
                                    <Plus className="w-5 h-5 stroke-[2.5]" />
                                </button>
                            </div>
                        </div>

                        {/* Select Floor */}
                        <div>
                            <h3 className="text-[15px] font-bold text-gray-900 mb-3">
                                {t('bar.selectFloor', 'Select Floor:')}
                            </h3>
                            <div className="grid grid-cols-3 gap-2.5">
                                {floors.map((floor) => {
                                    const isSelected = selectedFloor === floor;
                                    return (
                                        <button
                                            key={floor}
                                            type="button"
                                            onClick={() => onSelectFloor?.(floor)}
                                            className={`h-11 rounded-xl text-[13px] font-bold transition-all shadow-sm flex items-center justify-center ${
                                                isSelected
                                                    ? 'bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white'
                                                    : 'bg-[#F9EFF3] text-gray-900 hover:bg-[#F3E2EA]'
                                            }`}
                                        >
                                            {floor}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Select Table Button */}
                    <button
                        type="button"
                        onClick={handleSelectTable}
                        className="w-full mt-6 py-3.5 rounded-xl font-bold text-white text-[15px] shadow-md bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] hover:opacity-95 active:scale-[0.99] transition-all"
                    >
                        {t('bar.selectTable', 'Select Table')}
                    </button>
                </div>
            </div>
        );
    }

    // ========================================================
    // STATE 3: START ORDER SUMMARY (Image 5 of previous request)
    // ========================================================
    if (mode === 'START_ORDER_SUMMARY') {
        return (
            <div className="bg-white rounded-3xl shadow-md flex flex-col h-full w-[360px] overflow-hidden border border-gray-100 font-manrope">
                {/* Header Banner */}
                <div 
                    className="px-6 py-5 shrink-0"
                    style={{
                        background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.45) 0%, rgba(244, 114, 182, 0.45) 100%)'
                    }}
                >
                    <h2 className="text-[24px] font-bold text-gray-900 leading-tight">
                        {t('bar.startOrderTitle', 'Start Order')}
                    </h2>
                    <p className="text-[13px] font-medium text-gray-700 mt-0.5">
                        {t('bar.floorTablePersonDisplay', 'Floor, Table, Person Display')}
                    </p>
                </div>

                {/* Details Section */}
                <div className="p-8 flex flex-col justify-between flex-1">
                    <div className="space-y-7 pt-4">
                        {/* Persons Row */}
                        <div className="flex items-center gap-4 text-gray-900">
                            <User className="w-6 h-6 stroke-[2.2] text-gray-900" />
                            <span className="text-[17px] font-semibold text-gray-900 w-24">
                                {t('bar.personsLabel', 'Persons:')}
                            </span>
                            <span className="text-[18px] font-bold text-gray-900">
                                {formattedPersons}
                            </span>
                        </div>

                        {/* Floor Row */}
                        <div className="flex items-center gap-4 text-gray-900">
                            <Layers className="w-6 h-6 stroke-[2.2] text-gray-900" />
                            <span className="text-[17px] font-semibold text-gray-900 w-24">
                                {t('bar.floorLabel', 'Floor:')}
                            </span>
                            <span className="text-[18px] font-bold text-gray-900">
                                {formattedFloor}
                            </span>
                        </div>

                        {/* Table Row */}
                        <div className="flex items-center gap-4 text-gray-900">
                            <Armchair className="w-6 h-6 stroke-[2.2] text-gray-900" />
                            <span className="text-[17px] font-semibold text-gray-900 w-24">
                                {t('bar.tableLabel', 'Table:')}
                            </span>
                            <span className="text-[18px] font-bold text-gray-900">
                                {formattedTable}
                            </span>
                        </div>
                    </div>

                    {/* Start Order Button */}
                    <button
                        type="button"
                        onClick={onStartOrder}
                        className="w-full mt-6 py-3.5 rounded-2xl font-bold text-white text-[16px] shadow-md bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] hover:opacity-95 active:scale-[0.99] transition-all"
                    >
                        {t('bar.startOrderAction', 'Start Order')}
                    </button>
                </div>
            </div>
        );
    }

    // ========================================================
    // STATE 4: ORDER SUMMARY (Empty or Populated - Image 1 & 3)
    // ========================================================
    return (
        <div className="bg-white rounded-3xl shadow-md flex flex-col h-full w-[360px] overflow-hidden border border-gray-100 font-manrope">
            {/* Header Banner */}
            <div 
                className="px-6 py-5 shrink-0"
                style={{
                    background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.45) 0%, rgba(244, 114, 182, 0.45) 100%)'
                }}
            >
                <h2 className="text-[24px] font-bold text-gray-900 leading-tight">
                    {t('bar.orderSummaryTitle', 'Order Summary')}
                </h2>
                <p className="text-[13px] font-medium text-gray-800 mt-0.5">
                    {t('bar.table', 'Table')} -{formattedTable}
                </p>
            </div>

            {/* Table Header Columns Bar */}
            <div className="px-5 pt-3 pb-2 text-[13px] font-bold text-gray-900 border-b border-gray-900 grid grid-cols-12 shrink-0">
                <span className="col-span-2">{t('bar.qty', 'Qty')}</span>
                <span className="col-span-5">{t('bar.item', 'Item')}</span>
                <span className="col-span-2 text-center">{t('bar.size', 'Size')}</span>
                <span className="col-span-3 text-right">{t('bar.total', 'Total')}</span>
            </div>

            {/* Body: Items or Empty Canvas */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
                {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                        <span className="text-3xl mb-2">🍹</span>
                        <p className="text-xs font-medium">
                            {t('bar.clickDrinksToAddToOrder', 'Click any drink item on the left to add to this order.')}
                        </p>
                    </div>
                ) : (
                    Object.entries(groupedItems).map(([categoryName, items]) => {
                        const meta = getCategoryMeta(categoryName);
                        return (
                            <div key={categoryName} className="space-y-3">
                                {/* Group Category Header */}
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="w-5 h-5 rounded-full text-white font-bold text-[11px] flex items-center justify-center shadow-sm"
                                        style={{ backgroundColor: meta.bg }}
                                    >
                                        {meta.letter}
                                    </div>
                                    <h4 
                                        className="text-[14px] font-extrabold font-manrope"
                                        style={{ color: meta.text }}
                                    >
                                        {categoryName}
                                    </h4>
                                </div>

                                {/* Items in this category */}
                                <div className="space-y-2.5 pl-1">
                                    {items.map((it, idx) => {
                                        const qty = it.quantity || 1;
                                        return (
                                            <div key={it.id || idx} className="grid grid-cols-12 items-center text-xs">
                                                <div className="col-span-2 font-bold text-gray-900">
                                                    {qty}
                                                </div>
                                                <div className="col-span-5 pr-1">
                                                    <h5 className="font-bold text-gray-900 text-[13px] leading-tight truncate">
                                                        {it.title}
                                                    </h5>
                                                    {it.addonsText && (
                                                        <p className="text-[10px] text-gray-500 truncate mt-0.5">
                                                            {it.addonsText}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="col-span-2 text-center">
                                                    <span className="bg-[#fbf4f7] px-2 py-0.5 rounded text-[11px] font-semibold text-gray-800">
                                                        {it.size || 'Mug'}
                                                    </span>
                                                </div>
                                                <div className="col-span-3 flex flex-col items-end justify-center">
                                                    <span className="font-bold text-gray-900 text-[12px]">
                                                        {formatCurrency((Number(it.price) || 0) * qty, currency)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => onRemoveCartItem?.(it.id || idx)}
                                                        className="mt-1 text-gray-400 hover:text-red-500 transition-colors"
                                                        title={t('common.remove', 'Remove')}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Calculations & Payment Option Footer */}
            {cartItems.length > 0 && (
                <div className="p-4 pt-3 border-t-2 border-dashed border-gray-300 bg-white shrink-0">
                    <div className="space-y-1.5 text-xs text-gray-600 mb-4 font-manrope">
                        <div className="flex justify-between items-center">
                            <span>{t('bar.taxRate', 'Tax 6%')}</span>
                            <span>{formatCurrency(taxAmount, currency)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>{t('bar.serviceCharge', 'Service Charge')}</span>
                            <span>{formatCurrency(serviceCharge, currency)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 font-bold text-gray-900 text-[14px]">
                            <span>{t('bar.subtotalInclTax', 'Subtotal (Incl. tax)')}</span>
                            <span>{formatCurrency(grandTotal, currency)}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onSelectPaymentOption}
                        className="w-full py-3.5 rounded-2xl font-bold text-white text-[15px] shadow-md bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] hover:opacity-95 active:scale-[0.99] transition-all font-manrope"
                    >
                        {t('bar.selectPaymentOption', 'Select Payment Option')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default BarRightPanel;

