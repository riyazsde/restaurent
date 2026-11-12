import React, { useState, useEffect } from "react";
import bgImage from "../assets/Gradient.svg";
import logo from "../assets/LOGOPlande.svg";
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useVerifyOtpAndResetPassword, useResendForgotPasswordOtp } from '../../hooks/queries/useAuth';
import useTranslatedToast from '../../hooks/useTranslatedToast';
import LanguageSelector from '../LanguageSelector/LanguageSelector';

const VerifyOtp = () => {
    const { t } = useTranslation('auth');
    const toast = useTranslatedToast();
    const verifyOtpMutation = useVerifyOtpAndResetPassword();
    const resendOtpMutation = useResendForgotPasswordOtp();
    const [formData, setFormData] = useState({
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const isLoading = verifyOtpMutation.isPending;
    const isResending = resendOtpMutation.isPending;

    useEffect(() => {
        // Redirect if no email in state
        if (!email) {
            toast.error('Please start from forgot password page');
            navigate('/forget');
        }

        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [email, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.otp || !formData.newPassword || !formData.confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (formData.otp.length !== 8) {
            toast.error('OTP must be 8 digits');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            const response = await verifyOtpMutation.mutateAsync({
                email: email,
                otp: formData.otp,
                newPassword: formData.newPassword
            });

            if (response.success) {
                toast.success(response.message || 'Password reset successful!');
                navigate('/signin');
            } else {
                toast.error(response.message || t('verifyOtp.error'));
            }
        } catch (error) {
            const errorMessage = error.message || t('verifyOtp.error');
            toast.error(errorMessage);
        }
    };

    const handleResendOTP = async () => {
        if (!email) return;
        try {
            const response = await resendOtpMutation.mutateAsync(email);
            toast.success(response?.message || 'Verification OTP resent successfully!');
        } catch (error) {
            toast.error(error?.message || 'Failed to resend OTP. Please try again.');
        }
    };

    return (
        <div className="flex h-screen overflow-hidden font-sans">
            {/* Background image for mobile */}
            <div
                className="absolute inset-0 bg-cover bg-center md:hidden"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white px-4 text-center">
                    <div>
                        <h1 className="text-xl font-bold text-[#002B6B] leading-[1.2] mb-2 font-[Poppins]">
                            {t('hero.title')}
                        </h1>
                        <p className="text-xs text-[#414D60] font-[Poppins]">
                            {t('hero.subtitle')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Left Side (Desktop only) */}
            <div
                className="w-1/2 bg-cover bg-center relative hidden md:block"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="absolute inset-0 bg-black/20 flex flex-col justify-center text-white px-10 text-start">
                    <h1 className="text-3xl md:text-[35px] font-bold text-[#002B6B] leading-[1.2] mb-4 font-[Poppins]">
                        {t('hero.title')}
                    </h1>
                    <p style={{ fontFamily: 'Poppins' }} className="text-sm text-[#414D60] md:text-[18px]">
                        {t('hero.subtitle')}
                    </p>
                    <div style={{ fontFamily: 'Poppins' }} className="absolute bottom-24 rounded-lg left-10">
                        <LanguageSelector variant="auth" />
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div style={{ fontFamily: 'Poppins' }} className="w-full md:w-1/2 overflow-y-auto flex items-center justify-center relative z-10">
                <div className="max-w-md w-full p-4 md:p-8 bg-white mx-4 rounded-xl space-y-4 md:space-y-6 mt-8">
                    <div className="flex justify-between items-center mb-4 md:mb-6">
                        <h3 className="text-[20px] md:text-[24px] font-semibold">Reset Password</h3>
                        <div className="flex items-center space-x-2">
                            <img src={logo} alt="Triaxx Logo" className="block h-auto w-40 max-w-[75%] object-contain md:w-44" />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-4 md:mt-8">
                        <h2 className="text-[24px] md:text-[32px] font-bold text-center mb-1">{t('verifyOtp.title')}</h2>
                        <p className="text-[14px] md:text-[16px] text-[#000000] text-center mb-2 md:mb-4">
                            {t('verifyOtp.subtitle')} <span className="font-semibold">{email}</span> {t('verifyOtp.subtitleAnd')}
                        </p>

                        {/* Enter OTP */}
                        <div className="mb-2 md:mb-4 text-start">
                            <label className="block text-[16px] md:text-[18px] font-semibold mb-1">{t('verifyOtp.otp')}</label>
                            <input
                                type="text"
                                name="otp"
                                value={formData.otp}
                                onChange={handleInputChange}
                                placeholder={`${t('verifyOtp.otp')}...`}
                                maxLength="8"
                                className="w-full px-3 py-2 md:px-4 md:py-3 rounded-md border-none text-sm placeholder-gray-500"
                                style={{
                                    background: 'linear-gradient(180deg, rgba(234, 221, 255, 0.4), rgba(255, 234, 241, 0.4))',
                                }}
                                disabled={isLoading}
                            />
                        </div>

                        {/* New Password */}
                        <div className="mb-2 md:mb-4 text-start relative">
                            <label className="block text-[16px] md:text-[18px] font-semibold mb-1">{t('verifyOtp.newPassword')}</label>
                            <div className="flex items-center relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    placeholder={`${t('verifyOtp.newPassword')}...`}
                                    className="w-full px-3 py-2 md:px-4 md:py-3 pr-10 rounded-md border-none text-sm placeholder-gray-500"
                                    style={{
                                        background: 'linear-gradient(180deg, rgba(234, 221, 255, 0.4), rgba(255, 234, 241, 0.4))',
                                    }}
                                    disabled={isLoading}
                                />
                                <span
                                    className="absolute right-2 md:right-3 cursor-pointer text-gray-500"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={isMobile ? 16 : 18} /> : <Eye size={isMobile ? 16 : 18} />}
                                </span>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-2 md:mb-4 text-start relative">
                            <label className="block text-[16px] md:text-[18px] font-semibold mb-1">{t('verifyOtp.confirmPassword')}</label>
                            <div className="flex items-center relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder={`${t('verifyOtp.confirmPassword')}...`}
                                    className="w-full px-3 py-2 md:px-4 md:py-3 pr-10 rounded-md border-none text-sm placeholder-gray-500"
                                    style={{
                                        background: 'linear-gradient(180deg, rgba(234, 221, 255, 0.4), rgba(255, 234, 241, 0.4))',
                                    }}
                                    disabled={isLoading}
                                />
                                <span
                                    className="absolute right-2 md:right-3 cursor-pointer text-gray-500"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={isMobile ? 16 : 18} /> : <Eye size={isMobile ? 16 : 18} />}
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{ background: "linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)" }}
                            className="w-full text-white text-[16px] md:text-[18px] p-2 md:p-3 rounded-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('verifyOtp.verifyButton')}...
                                </>
                            ) : (
                                t('verifyOtp.verifyButton')
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <button
                            type="button"
                            disabled={isLoading || isResending}
                            onClick={handleResendOTP}
                            className="text-sm text-[#515DEF] font-medium hover:underline disabled:opacity-50 cursor-pointer"
                        >
                            {isResending ? "Resending OTP..." : "Didn't receive code? Resend OTP"}
                        </button>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        type="button"
                        disabled={isLoading}
                        className="w-full text-[16px] md:text-[18px] p-[2px] md:p-[2px] rounded-xl disabled:opacity-50"
                        style={{ background: "linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)" }}
                    >
                        <div
                            className="w-full h-full text-black p-3 rounded-xl text-center"
                            style={{ backgroundColor: "#fff" }}
                        >
                            Back
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;
