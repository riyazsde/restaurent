import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/currencyUtils';

const BarTabCard = ({ tab, onAddItem, onCloseTab, currency = 'XOF' }) => {
    const { t } = useTranslation('common');

    // tab data mapping
    const clientName = tab.client_name || "Guest";
    const tableNo = tab.table_no || "#0";
    const items = tab.items || [];
    const runningTotal = tab.total || "0.00";
    const openTime = tab.created_at ? new Date(tab.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '19:14';
    
    return (
        <div className="bg-white rounded-[20px] p-5 shadow-sm border border-purple-100/80 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-1">
                <h3 className="text-[20px] font-bold text-gray-900 font-poppins">
                    {clientName} - {t('bar.tab', 'Tab')} {tableNo}
                </h3>
                <span className="bg-[#f0d9e8] text-[#D32F2F] text-[13px] font-bold px-4 py-1 rounded-full">
                    {t('bar.open', 'Open')}
                </span>
            </div>
            <p className="text-gray-400 text-[13px] mb-4">
                {t('bar.opened', 'Opened')} {openTime} - {t('bar.seat', 'Seat')} 4
            </p>

            <div className="space-y-1 mb-6 min-h-[80px]">
                {items.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">{t('bar.noItemsYet', 'No items yet')}</p>
                ) : (
                    items.map((item, idx) => (
                        <p key={idx} className="text-gray-600 text-[14px]">
                            {item.quantity}x {item.drink_name || `Drink #${item.drink_item_id}`} {item.modifiers?.length > 0 && `- ${item.modifiers.join(', ')}`}
                        </p>
                    ))
                )}
            </div>

            <div className="flex justify-between items-end mb-4">
                <span className="text-gray-400 font-medium">{t('bar.runningTotal', 'Running total')}</span>
                <span className="text-[#A62673] font-bold text-xl font-poppins">
                    {formatCurrency(runningTotal, currency)}
                </span>
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => onAddItem(tab.Bar_Tab_id || tab.id)}
                    className="flex-1 bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white py-2.5 rounded-[12px] font-medium text-[15px] hover:opacity-90 active:scale-98 transition-all"
                >
                    {t('bar.addItem', '+ Add item')}
                </button>
                <button
                    type="button"
                    onClick={() => onCloseTab(tab.Bar_Tab_id || tab.id)}
                    className="flex-1 bg-white border border-[#A62673] text-[#A62673] py-2.5 rounded-[12px] font-medium text-[15px] hover:bg-[#fff5f8] active:scale-98 transition-all"
                >
                    {t('bar.closeTab', 'Close tab')}
                </button>
            </div>
        </div>
    );
};

export default BarTabCard;
