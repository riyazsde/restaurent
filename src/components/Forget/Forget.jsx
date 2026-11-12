/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import bgImage from "../assets/Gradient.svg";
import logo from "../assets/LOGOPlande.svg";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useSendOtp } from '../../hooks/queries/useAuth';
import useTranslatedToast from '../../hooks/useTranslatedToast';
import LanguageSelector from '../LanguageSelector/LanguageSelector';

const ForgetPassword = () => {
    const { t } = useTranslation('auth');
    const toast = useTranslatedToast();
    const [email, setEmail] = useState('');
    const sendOtpMutation = useSendOtp();
    const isLoading = sendOtpMutation.isPending;
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('messages.required');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('forgotPassword.invalidEmail');
            return;
        }

        try {
            const response = await sendOtpMutation.mutateAsync(email);

            if (response.success) {
                toast.success(response.message || t('forgotPassword.success'));
                // Navigate to verify OTP page with email
                navigate('/verifyotp', { state: { email, userId: response.data.user_id } });
            } else {
                toast.error(response.message || t('forgotPassword.error'));
            }
        } catch (error) {
            const errorMessage = error.message || t('forgotPassword.error');
            toast.error(errorMessage);
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
                <div className="max-w-md w-full bg-white mx-4 rounded-xl p-4 md:p-8 space-y-4 md:space-y-6 mt-8">
                    <div className="flex justify-between items-center mb-4 md:mb-6">
                        <h3 className="text-[20px] md:text-[24px] font-semibold">Sign in</h3>
                        <div className="flex items-center space-x-2">
                            <img src={logo} alt="Triaxx Logo" className="block h-auto w-40 max-w-[75%] object-contain md:w-44" />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-4 md:mt-8 text-center">
                        <h2 className="text-[24px] md:text-[32px] font-bold mb-1">{t('forgotPassword.title')}</h2>
                        <p className="text-[14px] md:text-[16px] text-[#000000] mb-2 md:mb-4">
                            {t('forgotPassword.subtitle')}
                        </p>

                        {/* Email */}
                        <div className="mb-2 md:mb-4 text-start">
                            <label className="block text-[16px] md:text-[18px] font-semibold mb-1">{t('forgotPassword.email')}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={`${t('forgotPassword.email')}...`}
                                className="w-full px-3 py-2 md:px-4 md:py-3 rounded-md border-none text-sm placeholder-gray-500"
                                style={{
                                    background: 'linear-gradient(180deg, rgba(234, 221, 255, 0.4), rgba(255, 234, 241, 0.4))',
                                }}
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{ background: "linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)" }}
                            className="w-full text-white text-[16px] md:text-[18px] p-2 md:p-3 rounded-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('forgotPassword.sendOtpButton')}...
                                </>
                            ) : (
                                t('forgotPassword.sendOtpButton')
                            )}
                        </button>
                    </form>

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
                            {t('forgotPassword.backButton')}
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgetPassword;
