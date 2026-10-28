import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCreditCard, FaThumbsUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useChangePassword } from '../../hooks/queries/useAuth';
import { useActiveSubscription, useToggleAutoRenew } from '../../hooks/queries/usePlan';
import useAuthStore from '../../store/authStore';

const MyProfile = () => {
  const { t } = useTranslation('profile');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const changePasswordMutation = useChangePassword();
  const toggleAutoRenewMutation = useToggleAutoRenew();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch real subscription data from backend via TanStack Query hook
  const { data: subData } = useActiveSubscription();

  const handleToggleAutoRenew = async () => {
    try {
      await toggleAutoRenewMutation.mutateAsync();
      toast.success('Auto-renew setting updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update auto-renew setting');
    }
  };

  // Profile data from auth store
  const profileData = {
    businessName: user?.Name || 'User',
    email: user?.email || '',
    password: '••••••••',
    profileImage: user?.user_image || 'https://randomuser.me/api/portraits/women/44.jpg',
    subscription: {
      planName: subData?.plan_name || subData?.plan?.name || subData?.plan || 'Standard POS Plan',
      status: subData?.status || subData?.subscription_status || 'Active',
      renewsAt: subData?.end_date || subData?.expires_at || subData?.renews_at || '2025-04-23',
      autoRenew: subData?.auto_renew ?? true
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleRenewSubscription = () => {
    setShowCancelModal(false);
    setShowSuccessModal(true);
  };

  const handleSubmitPasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error(t('messages.fillAllFields'));
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('messages.passwordMismatch'));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(t('messages.passwordLength'));
      return;
    }

    try {
      const response = await changePasswordMutation.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.success) {
        toast.success(t('messages.passwordChanged'));
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowResetPassword(false);
      } else {
        toast.error(response.message || t('messages.failedToChange'));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.message || t('messages.failedToChange'));
    }
  };

  const isLoading = changePasswordMutation.isPending;
  const isUpdatingSub = toggleAutoRenewMutation.isPending;

  return (
    <div className="min-h-screen bg-white p-6 sm:p-8" style={{ fontFamily: 'Poppins' }}>
      {/* Header */}
      <h1 className="text-2xl sm:text-[32px] font-bold text-black mb-8">
        {showResetPassword ? (
          <span className="flex items-center gap-2">
            <span 
              onClick={() => setShowResetPassword(false)} 
              className="text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              {t('title')}
            </span>
            <span className="text-gray-400">&gt;</span>
            <span>{t('resetPassword')}</span>
          </span>
        ) : (
          t('title')
        )}
      </h1>

      {/* Content Container */}
      <div className="flex justify-center">
        <div className="w-full max-w-[440px]">
          {!showResetPassword ? (
            <div className="flex flex-col gap-8 mx-auto">
              {/* Profile Card */}
              <div className="bg-white border border-gray-300 rounded-[24px] overflow-hidden shadow-xs">
                {/* Header with Gradient */}
                <div
                  className="h-[100px] relative w-full"
                  style={{
                    background: 'linear-gradient(90deg, #6A1B9A 0%, #D32F2F 100%)',
                  }}
                />

                {/* Overlapping Avatar */}
                <div className="relative -mt-10 mx-auto w-20 h-20 rounded-full border-4 border-white shadow-md bg-[#DA291C] overflow-hidden flex items-center justify-center z-10">
                  {profileData.profileImage && !profileData.profileImage.includes('randomuser.me') ? (
                    <img
                      src={profileData.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#DA291C] flex items-center justify-center font-bold text-4xl text-[#FFC72C] select-none" style={{ fontFamily: 'sans-serif' }}>
                      M
                    </div>
                  )}
                </div>

                {/* Profile Details */}
                <div className="pt-4 px-6 pb-6 space-y-4 text-left">
                  {/* Business Name */}
                  <div>
                    <p className="text-sm font-normal text-gray-700 mb-1">
                      {t('businessName')}
                    </p>
                    <p className="text-[17px] font-bold text-black">
                      {profileData.businessName}
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <p className="text-sm font-normal text-gray-700 mb-1">
                      {t('email')}
                    </p>
                    <p className="text-[17px] font-bold text-black break-all">
                      {profileData.email}
                    </p>
                  </div>

                  {/* Password */}
                  <div>
                    <p className="text-sm font-normal text-gray-700 mb-1">
                      {t('password')}
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[17px] font-bold text-black tracking-wider">
                        1234567654
                      </p>
                      <button
                        onClick={() => setShowResetPassword(true)}
                        className="px-4 py-2 bg-[#F8EAEE] hover:bg-[#f0dce2] rounded-xl text-sm font-semibold text-black transition-colors whitespace-nowrap"
                      >
                        {t('resetPassword')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Card */}
              <div className="bg-white border border-gray-300 rounded-[24px] p-6 shadow-xs">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #6A1B9A 0%, #D32F2F 100%)',
                    }}
                  >
                    <FaCreditCard className="text-white text-base" />
                  </div>
                  <h2 className="text-lg font-bold text-black">
                    {t('subscription.title')}
                  </h2>
                </div>

                {/* Status */}
                <div className="mb-2">
                  <p className="text-sm font-normal text-gray-700">
                    {t('subscription.status')} <span className="font-bold text-black ml-1">{profileData.subscription.status}</span>
                  </p>
                </div>

                {/* Renews At */}
                <div className="mb-6">
                  <p className="text-sm font-normal text-gray-700">
                    {t('subscription.renewsAt')} <span className="font-bold text-black ml-1">{profileData.subscription.renewsAt}</span>
                  </p>
                </div>

                {/* Renew Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleRenewSubscription}
                    className="px-8 py-2.5 rounded-full text-white font-semibold text-sm shadow hover:opacity-95 transition-opacity"
                    style={{
                      background: 'linear-gradient(90deg, #6A1B9A 0%, #D32F2F 100%)',
                    }}
                  >
                    {t('subscription.renewButton')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Reset Password Form */
            <div className="bg-gradient-to-b from-[#F3EBFC] to-[#FCE7E9] rounded-2xl p-6 sm:p-8">
              <div className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
                    {t('form.email')}
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md text-gray-500"
                    style={{ fontFamily: 'Poppins' }}
                  />
                </div>

                {/* Current Password */}
                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
                    {t('form.currentPassword')}
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder={t('form.currentPasswordPlaceholder')}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ fontFamily: 'Poppins' }}
                  />
                </div>

                {/* Create and Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[14px] font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
                      {t('form.newPassword')}
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder={t('form.newPasswordPlaceholder')}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ fontFamily: 'Poppins' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
                      {t('form.confirmPassword')}
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder={t('form.confirmPasswordPlaceholder')}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ fontFamily: 'Poppins' }}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowResetPassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="px-12 py-2.5 rounded-md border-2 border-purple-600 text-purple-600 text-[16px] font-medium hover:bg-purple-50 transition-colors"
                    style={{ fontFamily: 'Poppins' }}
                    disabled={isLoading}
                  >
                    {t('form.cancel')}
                  </button>
                  <button
                    onClick={handleSubmitPasswordChange}
                    disabled={isLoading}
                    className="px-16 py-2.5 rounded-md text-white text-[16px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)',
                      fontFamily: 'Poppins',
                    }}
                  >
                    {isLoading ? t('form.submitting') : t('form.submit')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Subscription Confirmation Modal */}
      {showCancelModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-[60]"
            onClick={() => setShowCancelModal(false)}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
              <h2 className="text-[28px] font-bold text-black mb-8" style={{ fontFamily: 'Poppins' }}>
                {t('subscription.cancelModal.title')}
              </h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-12 py-2.5 border-2 rounded-md text-[16px] font-medium hover:bg-gray-50 transition-colors"
                  style={{
                    borderColor: '#6A1B9A',
                    color: '#6A1B9A',
                    fontFamily: 'Poppins',
                  }}
                >
                  {t('subscription.cancelModal.no')}
                </button>
                <button
                  onClick={handleRenewSubscription}
                  className="px-12 py-2.5 rounded-md text-white text-[16px] font-medium hover:opacity-90 transition-opacity"
                  style={{
                    background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)',
                    fontFamily: 'Poppins',
                  }}
                >
                  {t('subscription.cancelModal.delete')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-[60]"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
              <div className="flex justify-center mb-6">
                <FaThumbsUp className="text-[80px] text-yellow-500" />
              </div>
              <h2 
                className="text-[32px] font-bold mb-4"
                style={{
                  background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: 'Poppins',
                }}
              >
                {t('subscription.successModal.title')}
              </h2>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="mt-6 px-12 py-2.5 rounded-md text-white text-[16px] font-medium hover:opacity-90 transition-opacity"
                style={{
                  background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)',
                  fontFamily: 'Poppins',
                }}
              >
                {t('subscription.successModal.ok')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyProfile;
