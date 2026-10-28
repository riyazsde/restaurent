import React, { useState, useEffect } from 'react';
import { SettingsFormSkeleton } from './SettingsSkeletons';
import { Switch } from '@headlessui/react';
import { toast } from 'react-toastify';
import { usePrintSettings, useUpdatePrintSettings } from '../../hooks/queries/usePrintSettings';
import { useTranslation } from 'react-i18next';

const Toggle = ({ enabled, setEnabled, disabled }) => (
    <Switch
        checked={enabled}
        onChange={setEnabled}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{
            background: enabled
                ? 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)'
                : '#D1D5DB',
        }}
    >
        <span
            className={`${enabled ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
        />
    </Switch>
);

const PrintSettingsTab = () => {
    const { t } = useTranslation('settings');
    const { data: printSettingsData = [], isLoading } = usePrintSettings();
    const updatePrintSettingsMutation = useUpdatePrintSettings();

    const isSaving = updatePrintSettingsMutation.isPending;
    
    const [settings, setSettings] = useState({
        id: null,
        enable_print: false,
        show_store_details: false,
        show_customer_details: false,
        store_id: 1,
        customer_id: 0,
        pagesize: '80mm',
        Header: '',
        footer: 'Thank you for dining with us! Follow us on Instagram\nInstagram: @Triaxx',
        show_notes: false,
        printToken: false,
        Status: true
    });

    // Sync settings when data is fetched from React Query
    useEffect(() => {
        if (printSettingsData && printSettingsData.length > 0) {
            const data = printSettingsData[0];
            setSettings({
                id: data.Print_Settings_id,
                enable_print: data.enable_print || false,
                show_store_details: data.show_store_details || false,
                show_customer_details: data.show_customer_details || false,
                store_id: data.store_id || 1,
                customer_id: data.customer_id || 1,
                pagesize: data.pagesize || '80mm',
                Header: data.Header || '*Good Food and Good People around*',
                footer: data.footer || 'Thank you for dining with us!',
                show_notes: data.show_notes || false,
                printToken: data.printToken || false,
                Status: data.Status !== undefined ? data.Status : true
            });
        }
    }, [printSettingsData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleToggle = (field) => {
        setSettings(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        try {
            const updateData = {
                id: settings.id,
                enable_print: settings.enable_print,
                show_store_details: settings.show_store_details,
                show_customer_details: settings.show_customer_details,
                store_id: settings.store_id,
                customer_id: settings.customer_id,
                pagesize: settings.pagesize,
                Header: settings.Header,
                footer: settings.footer,
                show_notes: settings.show_notes,
                printToken: settings.printToken,
                Status: settings.Status
            };

            const response = await updatePrintSettingsMutation.mutateAsync(updateData);
            
            if (response && response.success !== false) {
                toast.success(t('printSettings.updateSuccess'));
            } else {
                toast.error(response?.message || t('printSettings.updateError'));
            }
        } catch (error) {
            toast.error(error.message || t('printSettings.updateError'));
            console.error('Update print settings error:', error);
        }
    };

    if (isLoading) {
        return <SettingsFormSkeleton />;
    }

    return (
        <form onSubmit={handleSave} className="w-full max-w-4xl space-y-6 font-poppins">
            <h1 className="text-2xl md:text-[32px] font-bold text-black mb-6">{t('printSettings.title')}</h1>
            <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                    <label className="text-base font-semibold text-black flex items-center gap-1.5">
                        {t('printSettings.enablePrint')} <span className="text-gray-400 text-xs">ⓘ</span>
                    </label>
                    <Toggle 
                        enabled={settings.enable_print} 
                        setEnabled={() => handleToggle('enable_print')}
                        disabled={isSaving}
                    />
                </div>

                <div className="flex justify-between items-center py-2">
                    <label className="text-base font-semibold text-black flex items-center gap-1.5">
                        {t('printSettings.showStoreDetails')} <span className="text-gray-400 text-xs">ⓘ</span>
                    </label>
                    <Toggle 
                        enabled={settings.show_store_details} 
                        setEnabled={() => handleToggle('show_store_details')}
                        disabled={isSaving}
                    />
                </div>

                <div className="flex justify-between items-center py-2">
                    <label className="text-base font-semibold text-black flex items-center gap-1.5">
                        {t('printSettings.showCustomerDetails')} <span className="text-gray-400 text-xs">ⓘ</span>
                    </label>
                    <Toggle 
                        enabled={settings.show_customer_details} 
                        setEnabled={() => handleToggle('show_customer_details')}
                        disabled={isSaving}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">{t('printSettings.pageSize')}</label>
                    <select
                        name="pagesize"
                        value={settings.pagesize}
                        onChange={handleInputChange}
                        className="w-full border border-[#A855F7] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                        disabled={isSaving}
                    >
                        <option value="80mm">80mm</option>
                        <option value="58mm">58mm</option>
                        <option value="A4">A4</option>
                        <option value="A5">A5</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">{t('printSettings.header')}</label>
                    <textarea
                        name="Header"
                        rows={2}
                        value={settings.Header}
                        onChange={handleInputChange}
                        className="w-full border border-[#A855F7] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white resize-none"
                        disabled={isSaving}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">{t('printSettings.footer')}</label>
                    <textarea
                        name="footer"
                        rows={3}
                        value={settings.footer}
                        onChange={handleInputChange}
                        className="w-full border border-[#A855F7] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white resize-none"
                        disabled={isSaving}
                    />
                </div>

                <div className="flex justify-between items-center py-2">
                    <label className="text-base font-semibold text-black flex items-center gap-1.5">
                        {t('printSettings.showNotes')} <span className="text-gray-400 text-xs">ⓘ</span>
                    </label>
                    <Toggle 
                        enabled={settings.show_notes} 
                        setEnabled={() => handleToggle('show_notes')}
                        disabled={isSaving}
                    />
                </div>

                <div className="flex justify-between items-center py-2">
                    <label className="text-base font-semibold text-black flex items-center gap-1.5">
                        {t('printSettings.printToken')} <span className="text-gray-400 text-xs">ⓘ</span>
                    </label>
                    <Toggle 
                        enabled={settings.printToken} 
                        setEnabled={() => handleToggle('printToken')}
                        disabled={isSaving}
                    />
                </div>

                <div className="pt-4 pb-12">
                    <button 
                        type="submit"
                        disabled={isSaving}
                        style={{
                            background: 'linear-gradient(90deg, #6A1B9A 0%, #D32F2F 100%)'
                        }}
                        className="w-full py-3.5 rounded-lg text-white font-semibold text-base shadow hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                    {isSaving ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg> {t('common.saving')}
                        </>
                    ) : (
                        t('common.save')
                    )}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default PrintSettingsTab;
