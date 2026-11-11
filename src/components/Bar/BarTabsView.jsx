import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SegmentedTab from '../common/SegmentedTab';
import { useBarTabs } from '../../hooks/queries/useBarTabs';
import { useRestaurant } from '../../hooks/queries/usePos';
import { resolveCurrencySymbol } from '../../utils/currencyUtils';
import BarTabCard from './BarTabCard';
import AddNewItemModal from './AddNewItemModal';
import AddNewTabModal from './AddNewTabModal';
import CloseTabConfirmModal from './CloseTabConfirmModal';
import BarTabPaymentModal from './modals/BarTabPaymentModal';

const BarTabsView = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('common');
    const [happyHourActive, setHappyHourActive] = useState(true);
    const [selectedTabId, setSelectedTabId] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCreateTabModalOpen, setIsCreateTabModalOpen] = useState(false);
    const [activeModifiers, setActiveModifiers] = useState(['On the rocks', 'Extra lime', 'No ice']);

    // Close Tab Modals State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [tabToClose, setTabToClose] = useState(null);

    // Dynamic Currency from Store Profile
    const { data: restaurantData } = useRestaurant();
    const currency = resolveCurrencySymbol(restaurantData?.currency || restaurantData?.Currency);

    // API Hooks
    const { getBarTabs, addItemToTab, closeTab, createBarTab } = useBarTabs();
    const { data, isLoading } = getBarTabs;
    const openTabs = Array.isArray(data) ? data : (data?.data || data?.barTabs || []);

    const handleOpenAddModal = (tabId) => {
        setSelectedTabId(tabId);
        setIsAddModalOpen(true);
    };

    const handleAddItem = (tabId, itemsData) => {
        // itemsData is an array of payloads from the modal
        if (Array.isArray(itemsData)) {
            itemsData.forEach(data => {
                addItemToTab.mutate({ id: tabId, data });
            });
        } else {
            addItemToTab.mutate({ id: tabId, data: itemsData });
        }
    };

    const handleCloseTabRequest = (tab) => {
        setTabToClose(tab);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmClose = () => {
        setIsConfirmModalOpen(false);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = async (paymentMethod) => {
        if (!tabToClose) return;

        try {
            await closeTab.mutateAsync({
                id: tabToClose.Bar_Tab_id || tabToClose.id,
                data: { payment_method: paymentMethod }
            });
            setIsPaymentModalOpen(false);
            setTabToClose(null);
        } catch (error) {
            console.error('Failed to close bar tab after payment:', error);
        }
    };

    const handleCreateTabSubmit = (tabPayload) => {
        createBarTab.mutate(tabPayload, {
            onSuccess: () => {
                setIsCreateTabModalOpen(false);
            }
        });
    };

    return (
        <div className="font-poppins h-full flex flex-col p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
                {/* Title Breadcrumb */}
                <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/bar')}
                        className="text-2xl sm:text-3xl font-extrabold font-manrope text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                    >
                        {t('bar.bar', 'Bar')}
                    </button>
                    <span className="text-2xl sm:text-3xl font-extrabold font-manrope text-black">
                        &gt;
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold font-manrope text-black">
                        {t('bar.barTab', 'Bar tab')}
                    </span>
                </div>

                {/* Action Controls Toolbar */}
                <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto max-w-full pb-1 sm:pb-0 shrink-0">
                    {/* Happy Hour Toggle */}
                    <div
                        onClick={() => setHappyHourActive(!happyHourActive)}
                        className={`h-[42px] flex items-center text-white px-4 rounded-xl font-medium text-sm shadow-sm transition-all cursor-pointer select-none shrink-0 ${happyHourActive ? 'bg-[#00C853]' : 'bg-[#FF4D4F]'
                            }`}
                    >
                        <div className="w-9 h-5 bg-white rounded-full p-[2px] mr-2.5 flex items-center transition-all">
                            <div
                                className={`w-4 h-4 rounded-full shadow-xs transform transition-transform duration-200 bg-gradient-to-br from-[#6A1B9A] to-[#D32F2F] ${happyHourActive ? 'translate-x-4' : 'translate-x-0'
                                    }`}
                            />
                        </div>
                        <span className="whitespace-nowrap font-poppins text-xs sm:text-sm">
                            {t('bar.happyHour', 'Happy Hour')} {happyHourActive ? t('bar.active', 'Active') : t('bar.inactive', 'Inactive')}
                        </span>
                    </div>

                    {/* + Open New Tab Button */}
                    <button
                        type="button"
                        onClick={() => setIsCreateTabModalOpen(true)}
                        className="h-[42px] bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white px-5 sm:px-6 rounded-xl font-medium text-xs sm:text-sm font-poppins shadow-sm hover:opacity-95 active:scale-98 transition-all shrink-0 whitespace-nowrap flex items-center justify-center"
                    >
                        {t('bar.openNewTab', '+ Open New Tab')}
                    </button>

                    {/* Food / Bar Switcher */}
                    <SegmentedTab
                        className="shrink-0"
                        tabs={[
                            { id: 'Food', label: t('bar.food', 'Food') },
                            { id: 'Bar', label: t('bar.bar', 'Bar') }
                        ]}
                        activeTab="Bar"
                        onTabChange={(tab) => {
                            if (tab === 'Food') navigate('/dashboard/pos');
                        }}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="text-center p-10 text-gray-500 font-medium">
                        {t('bar.loadingTabs', 'Loading tabs...')}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
                        {/* Render Tab Cards Here */}
                        {openTabs.length === 0 ? (
                            <div className="col-span-full text-center p-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                                {t('bar.noOpenTabs', 'No open bar tabs. Click "+ Open New Tab" to start one!')}
                            </div>
                        ) : (
                            openTabs.map((tab, index) => (
                                <BarTabCard
                                    key={tab.Bar_Tab_id || index}
                                    tab={tab}
                                    currency={currency}
                                    onAddItem={handleOpenAddModal}
                                    onCloseTab={() => handleCloseTabRequest(tab)}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Drinks Modifiers Quick Entry Footer */}
            <div className="mt-auto pt-6">
                <h3 className="text-gray-500 uppercase font-semibold text-sm mb-3">
                    {t('bar.drinksModifiers', 'Drinks Modifiers')} - Quick Entry
                </h3>
                <div className="p-[1.5px] rounded-2xl bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] shadow-sm">
                    <div className="bg-white rounded-[14.5px] p-5 h-full">
                        <div className="flex flex-wrap gap-3 mb-2">
                            {['On the rocks', 'Extra lime', 'No ice', 'Double shot', 'Neat', 'Extra mint', 'Salt rim', 'Virgin'].map((mod) => {
                                const isActive = activeModifiers.includes(mod);
                                return (
                                    <button
                                        key={mod}
                                        type="button"
                                        onClick={() => {
                                            setActiveModifiers(prev =>
                                                prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
                                            );
                                        }}
                                        className={`px-5 py-2 rounded-full font-medium text-sm transition-all select-none ${isActive
                                                ? 'bg-[#F3E5F5] text-[#D32F2F] font-bold shadow-xs'
                                                : 'border border-gray-300 text-gray-500 hover:border-gray-400'
                                            }`}
                                    >
                                        {mod}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-gray-400 text-[13px] mt-3">
                            {happyHourActive
                                ? t('bar.happyHourDiscountNote', 'Active modifiers highlighted in dark color - Happy hour 15% discount auto-applied to drinks until 8:00 PM')
                                : t('bar.happyHourInactiveNote', 'Active modifiers highlighted in dark color - Happy hour inactive. Standard beverage pricing applies.')
                            }
                        </p>
                    </div>
                </div>
            </div>

            {isAddModalOpen && (
                <AddNewItemModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={handleAddItem}
                    tabId={selectedTabId}
                />
            )}

            {isConfirmModalOpen && (
                <CloseTabConfirmModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={handleConfirmClose}
                    tab={tabToClose}
                    currency={currency}
                />
            )}

            {isPaymentModalOpen && (
                <BarTabPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onConfirm={handlePaymentSuccess}
                    tab={tabToClose}
                    currency={currency}
                    isProcessing={closeTab.isPending}
                />
            )}

            {isCreateTabModalOpen && (
                <AddNewTabModal
                    isOpen={isCreateTabModalOpen}
                    onClose={() => setIsCreateTabModalOpen(false)}
                    onSubmit={handleCreateTabSubmit}
                    isLoading={createBarTab.isPending}
                />
            )}
        </div>
    );
};

export default BarTabsView;
