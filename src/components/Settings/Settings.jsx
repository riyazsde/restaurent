import React, { useEffect, useState } from "react";
import { useSearchParams } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import fluent from '../assets/fluent.svg';
import print from '../assets/print1.svg';
import chairs from '../assets/chairs.svg';
import book from '../assets/book.svg';
import frame from '../assets/frames.svg';
import card from '../assets/card.svg';
import { useTranslation } from 'react-i18next';

// Import tab components
import DetailsTab from './DetailsTab';
import PrintSettingsTab from './PrintSettingsTab';
import TablesTab from './TablesTab';
import MenuItemsTab from './MenuItemsTab';
import TaxSetupTab from './TaxSetupTab';
import PaymentTypesTab from './PaymentTypesTab';

export default function Settings() {
    // ✅ Add 'settings' namespace here
    const { t } = useTranslation('settings');
    const [searchParams] = useSearchParams();

    const tabs = [
        { label: t('tabs.details'), key: 'details', icon: fluent },
        { label: t('tabs.printSettings'), key: 'printSettings', icon: print },
        { label: t('tabs.taxSetup'), key: 'taxSetup', icon: frame },
        { label: t('tabs.paymentTypes'), key: 'paymentTypes', icon: card },
    ];

    const [activeTab, setActiveTab] = useState("details");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (searchParams.get('tab') === 'paymentTypes') {
            setActiveTab('paymentTypes');
        }
    }, [searchParams]);

    const renderRightContent = () => {
        switch (activeTab) {
            case "details":
                return <DetailsTab />;
            case "printSettings":
                return <PrintSettingsTab />;
            case "taxSetup":
                return <TaxSetupTab />;
            case "paymentTypes":
                return <PaymentTypesTab />;
            default:
                return <div>{t('selectTab')}</div>;
        }
    };

    return (
        <div style={{ fontFamily: 'Poppins' }} className="flex flex-col md:flex-row h-screen overflow-hidden bg-white">
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-lg"
            >
                {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            <div
                className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0 fixed md:relative z-40 w-64 h-full bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out`}
            >
                <div className="p-4 pt-6 md:p-6 md:pt-8">
                    <nav className="space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[30px] text-left transition-colors ${activeTab === tab.key
                                    ? 'text-white font-medium'
                                    : 'text-black font-semibold hover:bg-gray-100'
                                    }`}
                                style={activeTab === tab.key ? {
                                    background: 'linear-gradient(90deg, #6A1B9A 0%, #D32F2F 100%)'
                                } : {}}
                            >
                                <img
                                    src={tab.icon}
                                    alt={tab.label}
                                    className="w-5 h-5"
                                    style={activeTab === tab.key ? {
                                        filter: 'brightness(0) invert(1)'
                                    } : {}}
                                />
                                <span className="text-sm">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {mobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white min-h-full">
                {renderRightContent()}
            </div>
        </div>
    );
}
