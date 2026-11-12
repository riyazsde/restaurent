import React, { useState, useEffect, useRef } from 'react';
import { FiDownload, FiExternalLink, FiCamera } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { 
    useStoreDetails, 
    useUpdateStoreDetails, 
    useUploadStoreImage,
    useRestaurantSubscription,
    useRenewSubscription 
} from '../../hooks/queries/useStore';
import { SettingsFormSkeleton } from './SettingsSkeletons';
import { IMAGE_BASE_URL } from '../../services/fileUploadService';
import store from '../assets/store.png';
import MenuQRModal from './MenuItems/MenuQRModal';

const DetailsTab = () => {
    const { t } = useTranslation('settings');
    const { data: storeDetails, isLoading: isStoreLoading } = useStoreDetails();
    const { data: subscriptionData, isLoading: isSubLoading } = useRestaurantSubscription();
    const updateStoreMutation = useUpdateStoreDetails();
    const uploadImageMutation = useUploadStoreImage();
    const renewSubscriptionMutation = useRenewSubscription();

    const isSaving = updateStoreMutation.isPending;
    const isUploading = uploadImageMutation.isPending;
    const isRenewing = renewSubscriptionMutation.isPending;

    const [qrMenu, setQrMenu] = useState(false);
    const [orderViaQR, setOrderViaQR] = useState(false);
    const [collectFeedback, setCollectFeedback] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const fileInputRef = useRef(null);
    
    const [storeData, setStoreData] = useState({
        id: null,
        Store_img: '',
        storeName: '',
        address: '',
        email: '',
        phone: '',
        currency: 'ZAR',
        Status: true
    });

    // Sync storeData when remote store details are fetched or updated
    useEffect(() => {
        if (storeDetails) {
            setStoreData({
                id: storeDetails.Store_id || storeDetails.id || null,
                Store_img: storeDetails.Store_img || '',
                storeName: storeDetails.store_name || storeDetails.storeName || '',
                address: storeDetails.address || '',
                email: storeDetails.email || '',
                phone: storeDetails.phone || '',
                currency: storeDetails.currency || 'ZAR',
                Status: storeDetails.Status !== undefined ? storeDetails.Status : true
            });
            if (storeDetails.QR_status !== undefined) {
                setQrMenu(Boolean(storeDetails.QR_status));
            }
            if (storeDetails.order_via_QR_status !== undefined) {
                setOrderViaQR(Boolean(storeDetails.order_via_QR_status));
            }
            if (storeDetails.feedback_collecting_status !== undefined) {
                setCollectFeedback(Boolean(storeDetails.feedback_collecting_status));
            }
        }
    }, [storeDetails]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setStoreData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error(t('store.imageTypeError'));
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error(t('store.imageSizeError'));
            return;
        }

        try {
            const response = await uploadImageMutation.mutateAsync(file);
            if (response && response.success && response.data) {
                setStoreData(prev => ({
                    ...prev,
                    Store_img: response.data.serverfile
                }));
                toast.success(t('store.imageUploadSuccess'));
            } else {
                toast.error(t('store.imageUploadError'));
            }
        } catch (error) {
            toast.error(error.message || t('store.imageUploadError'));
            console.error('Upload error:', error);
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const getImageUrl = (imageTail) => {
        if (!imageTail) return store;
        if (imageTail.startsWith('http')) return imageTail;
        return `${IMAGE_BASE_URL}${imageTail}`;
    };

    const handleRenewSubscription = async () => {
        try {
            const res = await renewSubscriptionMutation.mutateAsync({});
            if (res && res.success !== false) {
                toast.success(t('store.renewSuccess'));
            } else {
                toast.error(res?.message || t('store.renewError'));
            }
        } catch (error) {
            toast.error(error.message || t('store.renewError'));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Validation
        if (!storeData.email || !storeData.phone || !storeData.address) {
            toast.error(t('store.validationError'));
            return;
        }

        try {
            const updateData = {
                id: storeData.id,
                Store_id: storeData.id,
                Store_img: storeData.Store_img,
                store_name: storeData.storeName,
                address: storeData.address,
                email: storeData.email,
                phone: storeData.phone,
                currency: storeData.currency,
                QR_status: qrMenu,
                order_via_QR_status: orderViaQR,
                feedback_collecting_status: collectFeedback,
                Status: storeData.Status
            };

            const response = await updateStoreMutation.mutateAsync(updateData);
            
            if (response && response.success !== false) {
                toast.success(t('store.updateSuccess'));
            } else {
                toast.error(response?.message || t('store.updateError'));
            }
        } catch (error) {
            toast.error(error.message || t('store.updateError'));
            console.error('Update store error:', error);
        }
    };

    const handleViewDigitalMenu = () => {
        const digitalUrl = `${window.location.origin}/menu/${storeData.id || 1}`;
        window.open(digitalUrl, '_blank');
    };

    if (isStoreLoading || isSubLoading) {
        return <SettingsFormSkeleton />;
    }

    // Format Plan Name
    const planName = subscriptionData?.CurrentPlan?.PlanName 
        ? `${subscriptionData.CurrentPlan.PlanName.toUpperCase()} BUNDLE`
        : 'PRO BUNDLE';

    // Format Status
    const statusText = subscriptionData ? t('store.active') : t('store.inactive');

    // Format Renewal Date (e.g. 18-01-2025)
    let formattedRenewalDate = '18-01-2025';
    if (subscriptionData?.RenewalDate) {
        const d = new Date(subscriptionData.RenewalDate);
        if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            formattedRenewalDate = `${day}-${month}-${year}`;
        }
    }

    const digitalMenuUrl = `${window.location.origin}/menu/${storeData.id || 1}`;

    return (
        <div className="w-full max-w-4xl font-poppins">
            {/* Top Page Heading */}
            <h1 className="text-2xl md:text-[32px] font-bold text-black mb-6">
                {t('store.title')}
            </h1>

            {/* Store Image Section */}
            <div className="mb-8">
                <label className="font-bold text-base text-black block mb-3">
                    {t('store.storeImage')}
                </label>
                
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading || isSaving}
                />
                
                <div 
                    onClick={() => !isUploading && !isSaving && fileInputRef.current?.click()}
                    className="relative w-24 h-24 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center p-2 cursor-pointer group hover:border-purple-400 transition"
                    title={t('store.clickToChangeImage')}
                >
                    <img
                        src={getImageUrl(storeData.Store_img)}
                        alt={t('store.storeImage')}
                        className="w-full h-full object-contain rounded-xl"
                        onError={(e) => {
                            e.target.src = store;
                        }}
                    />
                    
                    {/* Hover camera badge */}
                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                        <FiCamera size={20} />
                        <span className="text-[10px] mt-1 font-medium">{t('store.uploadImage')}</span>
                    </div>

                    {isUploading && (
                        <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                            <svg className="animate-spin h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            {/* Subscription Details Section */}
            <div className="mb-8">
                <h2 className="text-xl md:text-[22px] font-bold text-black mb-4">
                    {t('store.subscriptionDetails')}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-black mb-1.5">
                            {t('store.subscription')}
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={planName}
                            className="w-full px-4 py-3 rounded-lg border border-[#A855F7] bg-white text-gray-800 font-medium text-sm focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-black mb-1.5">
                            {t('store.status')}
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={statusText}
                            className="w-full px-4 py-3 rounded-lg border border-[#A855F7] bg-white text-gray-800 font-medium text-sm focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-black mb-1.5">
                            {t('store.renewalDate')}
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={formattedRenewalDate}
                            className="w-full px-4 py-3 rounded-lg border border-[#A855F7] bg-white text-gray-800 font-medium text-sm focus:outline-none"
                        />
                    </div>

                    <div className="flex justify-center pt-2">
                        <button
                            type="button"
                            onClick={handleRenewSubscription}
                            disabled={isRenewing}
                            style={{
                                background: 'linear-gradient(90deg, #6A1B9A 0%, #D32F2F 100%)'
                            }}
                            className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm shadow hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                        >
                            {isRenewing ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('store.renewing')}
                                </>
                            ) : (
                                t('store.renewSubscription')
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Store Details Form */}
            <form onSubmit={handleSave} className="space-y-6">
                <div>
                    <h2 className="text-xl md:text-[22px] font-bold text-black mb-4">
                        {t('store.storeDetails')}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-black mb-1.5">
                                {t('store.storeName')}
                            </label>
                            <input
                                type="text"
                                name="storeName"
                                value={storeData.storeName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 text-sm rounded-lg border border-[#A855F7] focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white text-gray-800"
                                disabled={isSaving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-black mb-1.5">
                                {t('store.storeAddress')}*
                            </label>
                            <textarea
                                name="address"
                                value={storeData.address}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-[#A855F7] focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none bg-white text-gray-800 text-sm"
                                disabled={isSaving}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-black mb-1.5">
                                {t('store.storeEmail')}*
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={storeData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 text-sm rounded-lg border border-[#A855F7] focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white text-gray-800"
                                disabled={isSaving}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-black mb-1.5">
                                {t('store.storePhone')}*
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={storeData.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 text-sm rounded-lg border border-[#A855F7] focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white text-gray-800"
                                disabled={isSaving}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-black mb-1.5">
                                {t('store.currency')}
                            </label>
                            <input
                                type="text"
                                name="currency"
                                value={storeData.currency}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 text-sm rounded-lg border border-[#A855F7] focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white text-gray-800"
                                disabled={isSaving}
                            />
                        </div>

                        {/* Enable QR Menu */}
                        <div className="flex items-center justify-between py-2">
                            <label className="font-semibold text-sm text-black flex gap-1.5 items-center">
                                {t('store.enableQrMenu')} <span className="text-gray-400 text-xs">ⓘ</span>
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={qrMenu}
                                    onChange={() => setQrMenu(!qrMenu)}
                                    disabled={isSaving}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-[#6A1B9A] peer-checked:to-[#D32F2F] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                                <span className="ml-2.5 text-gray-600 text-sm font-medium">
                                    {qrMenu ? t('common.on') : t('common.off')}
                                </span>
                            </label>
                        </div>

                        {/* Action buttons for QR */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-1 pb-2">
                            <button 
                                type="button"
                                onClick={() => setShowQrModal(true)}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-purple-200 bg-white text-black font-semibold text-sm hover:bg-purple-50 transition shadow-sm"
                                disabled={isSaving}
                            >
                                <FiDownload size={16} /> {t('store.downloadQrCode')}
                            </button>
                            <button 
                                type="button"
                                onClick={handleViewDigitalMenu}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-purple-200 bg-white text-black font-semibold text-sm hover:bg-purple-50 transition shadow-sm"
                                disabled={isSaving}
                            >
                                <FiExternalLink size={16} /> {t('store.viewDigitalMenu')}
                            </button>
                        </div>

                        {/* Enable Order via QR */}
                        <div className="flex items-center justify-between py-2">
                            <label className="font-semibold text-sm text-black flex gap-1.5 items-center">
                                {t('store.enableOrderViaQr')} <span className="text-gray-400 text-xs">ⓘ</span>
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={orderViaQR}
                                    onChange={() => setOrderViaQR(!orderViaQR)}
                                    disabled={isSaving}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-[#6A1B9A] peer-checked:to-[#D32F2F] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                                <span className="ml-2.5 text-gray-600 text-sm font-medium">
                                    {orderViaQR ? t('common.on') : t('common.off')}
                                </span>
                            </label>
                        </div>

                        {/* Enable Collecting Feedback */}
                        <div className="flex items-center justify-between py-2">
                            <label className="font-semibold text-sm text-black flex gap-1.5 items-center">
                                {t('store.enableFeedback')} <span className="text-gray-400 text-xs">ⓘ</span>
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={collectFeedback}
                                    onChange={() => setCollectFeedback(!collectFeedback)}
                                    disabled={isSaving}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-[#6A1B9A] peer-checked:to-[#D32F2F] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                                <span className="ml-2.5 text-gray-600 text-sm font-medium">
                                    {collectFeedback ? t('common.on') : t('common.off')}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 pb-12">
                    <button 
                        type="submit"
                        disabled={isSaving}
                        style={{
                            background: 'linear-gradient(90deg, #6A1B9A 0%, #D32F2F 100%)'
                        }} 
                        className="w-full py-3.5 rounded-lg text-white font-semibold text-base shadow hover:opacity-95 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('common.saving')}
                            </>
                        ) : (
                            t('common.save')
                        )}
                    </button>
                </div>
            </form>

            {/* QR Modal for downloading/viewing */}
            <MenuQRModal
                isOpen={showQrModal}
                onClose={() => setShowQrModal(false)}
                menuUrl={digitalMenuUrl}
            />
        </div>
    );
};

export default DetailsTab;
