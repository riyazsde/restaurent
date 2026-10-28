import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiPlus, FiCheckCircle, FiShield, FiSmartphone, FiCreditCard, FiExternalLink, FiKey, FiAlertCircle } from 'react-icons/fi';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useMerchantPaymentConfigs, useSaveMerchantPaymentConfig } from '../../hooks/queries/usePaymentIntegrations';
import { useRestaurant } from '../../hooks/queries/usePos';
import { useDevices } from '../../hooks/queries/useDevices';
import { usePaymentOptionsAuth, useCreatePaymentOption } from '../../hooks/queries/usePaymentTypes';
import GradientOutlineButton from '../common/GradientOutlineButton';

const SUPPORTED_GATEWAYS = [
    {
        key: 'ACQUIRING_BANK',
        name: 'Bank Card Acquiring (Z500C Terminal)',
        category: 'card',
        icon: FiCreditCard,
        description: 'Settlement account for Android Z500C POS terminal Visa & Mastercard payments'
    },
    {
        key: 'MTN_MOMO',
        name: 'MTN Mobile Money',
        category: 'momo',
        icon: FiSmartphone,
        description: 'Accept customer wallet payments directly to your MTN merchant wallet'
    },
    {
        key: 'ORANGE_MONEY',
        name: 'Orange Money',
        category: 'momo',
        icon: FiSmartphone,
        description: 'Accept customer wallet payments directly to your Orange merchant wallet'
    },
    {
        key: 'MOOV_MONEY',
        name: 'Moov Money / Flooz',
        category: 'momo',
        icon: FiSmartphone,
        description: 'Accept customer wallet payments directly to your Moov merchant wallet'
    },
    {
        key: 'WAVE',
        name: 'Wave Mobile Money',
        category: 'momo',
        icon: FiSmartphone,
        description: 'Accept customer Wave QR and mobile money payments'
    }
];

export default function MerchantGatewaysSection() {
    const { t } = useTranslation('settings');
    const navigate = useNavigate();
    const { data: configs = [], isLoading } = useMerchantPaymentConfigs();
    const { data: restaurantData } = useRestaurant();
    const { data: allDevices = [] } = useDevices();
    const { data: paymentOptionsData = [] } = usePaymentOptionsAuth();
    const saveConfigMutation = useSaveMerchantPaymentConfig();
    const createOptionMutation = useCreatePaymentOption();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [formData, setFormData] = useState({
        provider: 'ACQUIRING_BANK',
        merchant_account_id: '',
        display_name: '',
        currency: restaurantData?.currency || 'XOF',
        webhook_secret: '',
        enabled: true
    });

    const activeCurrency = restaurantData?.currency || 'XOF';

    // Terminals registered in My Devices
    const posTerminals = useMemo(() => {
        return allDevices.filter((d) => 
            d.type === 'POS Terminal' || 
            d.Devices_ModelNo === 'Z500C' || 
            String(d.Serial_Number || '').toUpperCase().startsWith('Z500') ||
            String(d.Name || d.device_name || '').toLowerCase().includes('terminal')
        );
    }, [allDevices]);

    // Check if card payment is registered in POS payment options
    const hasCardOption = useMemo(() => {
        const items = Array.isArray(paymentOptionsData) ? paymentOptionsData : [];
        return items.some((item) => {
            const name = (item.Name || item.option || '').toLowerCase();
            const hasSub = item.PaymentOption?.some((po) =>
                (po.option || '').toLowerCase().includes('card')
            );
            return name.includes('card') || hasSub;
        });
    }, [paymentOptionsData]);

    const activeCardConfig = useMemo(() => {
        return configs.find(
            (c) => (c.provider || c.Provider || '').toUpperCase() === 'ACQUIRING_BANK'
        );
    }, [configs]);

    const generateSecret = () => {
        const chars = '0123456789abcdef';
        let res = 'whsec_';
        for (let i = 0; i < 32; i++) {
            res += chars[Math.floor(Math.random() * chars.length)];
        }
        return res;
    };

    const openConfigModal = (providerKey) => {
        const existing = configs.find(
            (c) => (c.provider || c.Provider || '').toUpperCase() === providerKey.toUpperCase()
        );
        const meta = SUPPORTED_GATEWAYS.find((g) => g.key === providerKey);

        setSelectedProvider(meta || { key: providerKey, name: providerKey });
        setFormData({
            provider: providerKey,
            merchant_account_id: existing?.merchant_account_id || existing?.account_id || '',
            display_name: existing?.display_name || meta?.name || '',
            currency: existing?.currency || activeCurrency,
            webhook_secret: '', // Write-only for security
            enabled: existing?.enabled !== false
        });
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.merchant_account_id.trim()) {
            toast.error(t('gateways.errors.accountIdRequired', 'Merchant Account ID is required'));
            return;
        }

        try {
            const secretToSend = formData.webhook_secret?.trim() || generateSecret();
            const payload = {
                merchant_account_id: formData.merchant_account_id.trim(),
                display_name: formData.display_name.trim(),
                currency: formData.currency || activeCurrency,
                webhook_secret: secretToSend,
                enabled: Boolean(formData.enabled)
            };

            await saveConfigMutation.mutateAsync({
                provider: formData.provider,
                data: payload
            });

            toast.success(t('gateways.saveSuccess', 'Payment gateway configuration saved successfully'));
            setIsModalOpen(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || t('gateways.saveError', 'Failed to save configuration'));
        }
    };

    const handleAddCardOption = async () => {
        try {
            await createOptionMutation.mutateAsync({
                PaymentOption: [
                    {
                        option: 'Credit Card',
                        Details: 'Z500C card terminal'
                    },
                    {
                        option: 'Cash',
                        Details: 'Pay at counter'
                    }
                ],
                Status: true
            });
            toast.success(t('gateways.cardOptionAdded', 'Credit Card added to POS payment options successfully!'));
        } catch (err) {
            toast.error(err?.message || 'Failed to add card option');
        }
    };

    return (
        <div className="space-y-6">
            {/* Setup Flow Guide Banner */}
            <div className="bg-gradient-to-r from-purple-50 via-white to-pink-50 rounded-2xl border border-purple-200/80 p-5 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                        <h4 className="text-base font-bold text-gray-900 font-poppins flex items-center gap-2">
                            <FiCreditCard className="text-purple-700" />
                            <span>{t('gateways.flowTitle', 'Card Payment & Z500C Terminal Setup Guide')}</span>
                        </h4>
                        <p className="text-xs text-gray-600 font-poppins mt-0.5">
                            {t('gateways.flowDesc', 'Follow these steps to configure your restaurant acquiring bank account, pair your physical Z500C card terminal, and enable card checkout.')}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Step 1 */}
                    <div className="bg-white rounded-xl border border-gray-200 p-3.5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Step 1</span>
                                {activeCardConfig?.merchant_account_id ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                                        <FiCheckCircle size={12} /> Configured
                                    </span>
                                ) : (
                                    <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                                        Pending
                                    </span>
                                )}
                            </div>
                            <h5 className="text-xs font-semibold text-gray-900 mb-1">{t('gateways.flowStep1', '1. Merchant Account & Credentials')}</h5>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                {t('gateways.flowStep1Desc', 'Enter your acquiring bank Merchant ID and secure webhook secret below.')}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => openConfigModal('ACQUIRING_BANK')}
                            className="mt-3 text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                            <span>{activeCardConfig?.merchant_account_id ? t('gateways.editConfig', 'Edit Config') : t('gateways.configureNow', 'Configure Now')}</span>
                            <FiEdit2 size={11} />
                        </button>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white rounded-xl border border-gray-200 p-3.5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Step 2</span>
                                {posTerminals.length > 0 ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                                        <FiCheckCircle size={12} /> {posTerminals[0].Serial_Number || 'Paired'}
                                    </span>
                                ) : (
                                    <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                                        Pending
                                    </span>
                                )}
                            </div>
                            <h5 className="text-xs font-semibold text-gray-900 mb-1">{t('gateways.flowStep2', '2. Register & Pair Z500C Terminal')}</h5>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                {t('gateways.flowStep2Desc', 'Add your device serial number in Devices & Hardware and generate a pairing token for the Android bridge.')}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/my-devices')}
                            className="mt-3 text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                            <span>{t('gateways.manageDevices', 'Manage Devices & Tokens')}</span>
                            <FiExternalLink size={11} />
                        </button>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white rounded-xl border border-gray-200 p-3.5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Step 3</span>
                                {hasCardOption ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                                        <FiCheckCircle size={12} /> Active
                                    </span>
                                ) : (
                                    <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                                        Pending
                                    </span>
                                )}
                            </div>
                            <h5 className="text-xs font-semibold text-gray-900 mb-1">{t('gateways.flowStep3', '3. Enable Card in POS Payment Options')}</h5>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                {t('gateways.flowStep3Desc', 'Ensure Cashiers can select Credit Card at counter and table checkout.')}
                            </p>
                        </div>
                        {!hasCardOption ? (
                            <button
                                type="button"
                                onClick={handleAddCardOption}
                                disabled={createOptionMutation.isPending}
                                className="mt-3 text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                                <span>{createOptionMutation.isPending ? 'Adding...' : t('gateways.enableCardOption', 'Add Card Option')}</span>
                                <FiPlus size={11} />
                            </button>
                        ) : (
                            <span className="mt-3 text-xs text-gray-500 font-medium">{t('gateways.cardOptionActive', 'Card option active in POS')}</span>
                        )}
                    </div>

                    {/* Step 4 */}
                    <div className="bg-white rounded-xl border border-gray-200 p-3.5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Step 4</span>
                                <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
                                    POS Ready
                                </span>
                            </div>
                            <h5 className="text-xs font-semibold text-gray-900 mb-1">{t('gateways.flowStep4', '4. Customer Pays at Counter')}</h5>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                {t('gateways.flowStep4Desc', 'Cashier initiates payment, customer taps/inserts card on Z500C, bank adapter confirms settlement.')}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/pos')}
                            className="mt-3 text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                            <span>Open POS Register</span>
                            <FiExternalLink size={11} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-gray-100">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 font-poppins">
                        {t('gateways.title', 'Payment Gateways & Merchant Accounts')}
                    </h3>
                    <p className="text-xs text-gray-500 font-poppins">
                        {t('gateways.subtitle', 'Configure acquiring bank accounts for Z500C card terminals and Mobile Money merchant wallets.')}
                    </p>
                </div>
            </div>

            {/* Gateway Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {SUPPORTED_GATEWAYS.map((gateway) => {
                    const existing = configs.find(
                        (c) => (c.provider || c.Provider || '').toUpperCase() === gateway.key.toUpperCase()
                    );
                    const isConfigured = Boolean(existing && (existing.merchant_account_id || existing.account_id));
                    const isEnabled = existing?.enabled !== false && isConfigured;
                    const Icon = gateway.icon;

                    return (
                        <div
                            key={gateway.key}
                            className={`rounded-2xl border p-5 transition-all bg-white flex flex-col justify-between ${
                                isEnabled
                                    ? 'border-green-200 shadow-xs'
                                    : isConfigured
                                    ? 'border-amber-200'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div>
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            gateway.category === 'card' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            <Icon className="text-xl" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-sm font-poppins">
                                                {gateway.name}
                                            </h4>
                                            <span className="text-[11px] font-mono text-gray-400">
                                                {gateway.key}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium font-poppins ${
                                        isEnabled
                                            ? 'bg-green-100 text-green-700'
                                            : isConfigured
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {isEnabled ? t('common:active', 'Active') : isConfigured ? t('common:disabled', 'Disabled') : t('gateways.notConfigured', 'Not Configured')}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 font-poppins mb-3">
                                    {gateway.description}
                                </p>
                                {isConfigured && (
                                    <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-700 font-poppins space-y-1 mb-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{t('gateways.accountId', 'Merchant Account ID')}:</span>
                                            <span className="font-mono font-medium">{existing.merchant_account_id || existing.account_id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{t('gateways.currency', 'Currency')}:</span>
                                            <span className="font-semibold text-gray-800">{existing.currency || activeCurrency}</span>
                                        </div>
                                    </div>
                                )}

                                {gateway.key === 'ACQUIRING_BANK' && (
                                    <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-2.5 text-xs text-gray-700 font-poppins space-y-2 mb-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 font-medium">Z500C Terminal:</span>
                                            {posTerminals.length > 0 ? (
                                                <span className="font-mono text-[11px] font-semibold text-purple-900 bg-white px-2 py-0.5 rounded border border-purple-200">
                                                    {posTerminals[0].Serial_Number}
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/dashboard/my-devices')}
                                                    className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 cursor-pointer"
                                                >
                                                    <span>Register in Devices</span>
                                                    <FiExternalLink size={10} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 font-medium">POS Card Option:</span>
                                            {hasCardOption ? (
                                                <span className="text-[11px] text-green-700 font-semibold flex items-center gap-1">
                                                    <FiCheckCircle size={12} /> Active in POS
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={handleAddCardOption}
                                                    disabled={createOptionMutation.isPending}
                                                    className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                                >
                                                    <span>{createOptionMutation.isPending ? 'Adding...' : t('gateways.enableCardOption', 'Add Card Option')}</span>
                                                    <FiPlus size={10} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => openConfigModal(gateway.key)}
                                className="w-full mt-2 py-2 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-800 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-poppins"
                            >
                                <FiEdit2 className="text-xs" />
                                <span>{isConfigured ? t('gateways.editConfig', 'Edit Configuration') : t('gateways.configureNow', 'Configure Gateway')}</span>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Modal for Configuring Gateway */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 text-base font-poppins">
                                    {t('gateways.modalTitle', 'Configure {{name}}', { name: selectedProvider?.name })}
                                </h3>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">
                                    {formData.provider}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                            >
                                <FaTimes size={18} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleFormSubmit} className="p-5 space-y-4 font-poppins">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    {t('gateways.merchantAccountId', 'Merchant Account ID / Wallet ID')} *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder={selectedProvider?.category === 'card' ? 'e.g. ACQ-MERCHANT-001' : 'e.g. MTN-WALLET-001'}
                                    value={formData.merchant_account_id}
                                    onChange={(e) => setFormData({ ...formData, merchant_account_id: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    {t('gateways.displayName', 'Display Name')}
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Front Counter Card Account"
                                    value={formData.display_name}
                                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    {t('gateways.currency', 'Settlement Currency')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-semibold text-gray-700">
                                        {t('gateways.webhookSecret', 'Webhook Secret')}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setFormData((prev) => ({ ...prev, webhook_secret: generateSecret() }))}
                                        className="text-[11px] text-purple-700 hover:text-purple-900 font-medium flex items-center gap-1 cursor-pointer"
                                    >
                                        <FiKey size={11} />
                                        <span>{t('gateways.generateSecret', 'Generate Random Secret')}</span>
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. whsec_a1b2c3d4e5f6..."
                                    value={formData.webhook_secret}
                                    onChange={(e) => setFormData({ ...formData, webhook_secret: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                                />
                                <p className="text-[11px] text-gray-500 mt-1 flex items-start gap-1">
                                    <FiShield className="text-purple-600 mt-0.5 flex-shrink-0" />
                                    <span>
                                        {t('gateways.webhookNotice', 'Used by provider adapter for server-to-server confirmation. The backend saves a one-way secure hash and never returns it in plain text.')}
                                    </span>
                                </p>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="enabledToggle"
                                    checked={formData.enabled}
                                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                                />
                                <label htmlFor="enabledToggle" className="text-xs font-medium text-gray-800 cursor-pointer">
                                    {t('gateways.enableForCheckout', 'Enable this provider for cashier checkout')}
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 cursor-pointer"
                                >
                                    {t('common:cancel', 'Cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={saveConfigMutation.isPending}
                                    style={{
                                        background: 'linear-gradient(90deg, #6A1B9A 0%, #D32F2F 100%)'
                                    }}
                                    className="px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-2"
                                >
                                    {saveConfigMutation.isPending && (
                                        <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    )}
                                    <span>{t('common:save', 'Save Configuration')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
