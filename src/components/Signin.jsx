import React, { useState, useEffect } from "react";
import { useMutation } from '@tanstack/react-query';
import bgImage from "./assets/Gradient.svg";
import logo from "./assets/logo.svg";
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore';
import authService from '../services/authService';
import useLanguageStore from '../store/languageStore';
import useTranslatedToast from '../hooks/useTranslatedToast';
import LanguageSelector from './LanguageSelector/LanguageSelector';

const Signin = () => {
    const { t } = useTranslation('auth');
    const toast = useTranslatedToast();
    const [selectedTab, setSelectedTab] = useState('Restaurant');
    const [showPassword, setShowPassword] = useState(false);
    const [showOtpScreen, setShowOtpScreen] = useState(false);
    const [otp, setOtp] = useState('');
    const [employeeLoginData, setEmployeeLoginData] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
    const tabs = [
        { key: 'Restaurant', label: t('tabs.restaurant') },
        { key: 'Employee', label: t('tabs.employee') },
        { key: 'Admin', label: t('tabs.admin') }
    ];
    const navigate = useNavigate();
    const { login, setError, clearError } = useAuthStore();
    const { setLanguageFromLogin, initLanguage } = useLanguageStore();

    // Initialize language from local storage on mount
    useEffect(() => {
        initLanguage();
    }, [initLanguage]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        clearError();
    };

    const loginMutation = useMutation({
        mutationFn: (credentials) => authService.login(credentials, credentials.role),
        onSuccess: (response) => {
            if (response.success) {
                if (selectedTab === 'Employee') {
                    setEmployeeLoginData(response.data);
                    toast.success('OTP sent to your registered email');
                    setShowOtpScreen(true);
                    return;
                }

                // Store user data and token
                login(response.data.user, response.data.token, selectedTab);
                
                // Extract and set language from login response
                if (response.data.user && response.data.user.Language_id) {
                    const languageId = typeof response.data.user.Language_id === 'object' 
                        ? response.data.user.Language_id.Language_id 
                        : response.data.user.Language_id;
                    let languageCode = 'fr';
                    if (typeof response.data.user.Language_id === 'object' && response.data.user.Language_id.Language_name) {
                        const name = response.data.user.Language_id.Language_name.toLowerCase();
                        languageCode = (name.includes('english') || name.includes('anglais')) ? 'en' : 'fr';
                    } else {
                        languageCode = languageId === 2 ? 'en' : 'fr';
                    }
                    setLanguageFromLogin(languageId, languageCode);
                }
                
                toast.success(response.message || t('login.success'));
                navigate('/dashboard/home');
            } else {
                toast.error(response.message || t('login.error'));
                setError(response.message);
            }
        },
        onError: (error) => {
            const errorMessage = error.message || t('login.error');
            toast.error(errorMessage);
            setError(errorMessage);
        }
    });

    const isLoading = loginMutation.isPending;

    const verifyOtpMutation = useMutation({
        mutationFn: (data) => authService.verifyEmployeeOTP(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success('OTP Verified Successfully');
                
                // Store user data and token
                login(response.data.user, response.data.token, 'Employee');
                
                // Extract and set language
                if (response.data.user && response.data.user.Language_id) {
                    const languageId = typeof response.data.user.Language_id === 'object' 
                        ? response.data.user.Language_id.Language_id 
                        : response.data.user.Language_id;
                    let languageCode = 'fr';
                    if (typeof response.data.user.Language_id === 'object' && response.data.user.Language_id.Language_name) {
                        const name = response.data.user.Language_id.Language_name.toLowerCase();
                        languageCode = (name.includes('english') || name.includes('anglais')) ? 'en' : 'fr';
                    } else {
                        languageCode = languageId === 2 ? 'en' : 'fr';
                    }
                    setLanguageFromLogin(languageId, languageCode);
                }
                
                // Redirect employees to their dedicated dashboard
                navigate('/employee');
            } else {
                toast.error(response.message || 'OTP verification failed');
            }
        },
        onError: (error) => {
            toast.error(error.message || 'OTP verification failed');
        }
    });

    const isAnyLoading = isLoading || verifyOtpMutation.isPending;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.email || !formData.password) {
            toast.error('messages.required');
            return;
        }

        clearError();
        loginMutation.mutate({
            email: formData.email,
            password: formData.password,
            rememberMe: formData.rememberMe,
            role: selectedTab
        });
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 8) {
            toast.error('OTP must be 8 digits');
            return;
        }
        
        verifyOtpMutation.mutate({
            challenge_id: employeeLoginData?.challenge_id || employeeLoginData?.data?.challenge_id || employeeLoginData?.id,
            otp: otp
        });
    };

    const resendOtpMutation = useMutation({
        mutationFn: (data) => authService.resendEmployeeOTP(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success('OTP Resent Successfully');
                // Update the challenge ID if a new one is returned
                if (response.data && response.data.challenge_id) {
                    setEmployeeLoginData({ ...employeeLoginData, challenge_id: response.data.challenge_id });
                }
            } else {
                toast.error(response.message || 'Failed to resend OTP');
            }
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to resend OTP');
        }
    });

    const handleResendOtp = () => {
        if (!employeeLoginData) return;
        resendOtpMutation.mutate({
            challenge_id: employeeLoginData?.challenge_id || employeeLoginData?.data?.challenge_id || employeeLoginData?.id
        });
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
                    <p className="text-sm text-[#414D60] md:text-[18px] font-[Poppins]">
                        {t('hero.subtitle')}
                    </p>
                    <div style={{ fontFamily: 'Poppins' }} className="absolute bottom-24 rounded-lg left-10">
                        <LanguageSelector variant="auth" />
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div style={{ fontFamily: 'Poppins' }} className="w-full md:w-1/2 overflow-y-auto flex items-center justify-center relative z-10">
                <div className="max-w-md w-full bg-white mx-4 p-4 md:p-8 space-y-4 md:space-y-6 mt-8 md:mt-32">
                    <div className="flex justify-between items-center mb-4 md:mb-6">
                        <h3 className="text-[20px] md:text-[24px] font-semibold">{t('login.title')}</h3>
                        <div className="flex items-center space-x-2">
                            <img src={logo} alt="Triaxx Logo" className="" />
                        </div>
                    </div>

                    {showOtpScreen ? (
                        <form onSubmit={handleOtpSubmit} className="mt-4 md:mt-8 text-center">
                            <h2 className="text-[24px] md:text-[32px] font-bold mb-1">Verify OTP</h2>
                            <p className="text-[14px] md:text-[16px] text-[#000000] mb-4 md:mb-6">
                                {t('login.otpSubtitle', 'Enter the one-time code sent to your email to finish signing in')}
                            </p>

                            {/* OTP */}
                            <div className="mb-4 text-start md:mb-6">
                                <label className="block text-[16px] md:text-[18px] font-semibold mb-2">
                                    One-Time Code
                                </label>
                                <input
                                    type="text"
                                    name="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Enter 8-digit OTP"
                                    maxLength="8"
                                    className="w-full px-3 py-2 md:px-4 md:py-3 rounded-md border-none text-center tracking-[0.5em] text-lg font-bold placeholder-gray-500"
                                    style={{
                                        background: 'linear-gradient(180deg, rgba(234, 221, 255, 0.4), rgba(255, 234, 241, 0.4))',
                                    }}
                                    disabled={isAnyLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isAnyLoading || otp.length !== 8}
                                style={{ background: "linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)" }}
                                className="w-full text-white text-[16px] md:text-[18px] p-2 md:p-3 rounded-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                            >
                                {isAnyLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify & Sign In"
                                )}
                            </button>
                            
                            <div className="mt-4 text-[14px] md:text-[16px]">
                                <span className="text-gray-500">Didn't receive the code? </span>
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={resendOtpMutation.isPending}
                                    className="text-[#D32F2F] font-bold hover:underline disabled:opacity-50"
                                >
                                    {resendOtpMutation.isPending ? 'Resending...' : 'Resend OTP'}
                                </button>
                            </div>

                            <button
                                onClick={() => { setShowOtpScreen(false); setOtp(''); }}
                                type="button"
                                disabled={isAnyLoading}
                                className="w-full text-[16px] md:text-[18px] p-[2px] md:p-[2px] rounded-xl mt-4 disabled:opacity-50"
                                style={{ background: "linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)" }}
                            >
                                <div
                                    className="w-full h-full text-black p-2 md:p-3 rounded-xl text-center font-medium"
                                    style={{ backgroundColor: "#fff" }}
                                >
                                    Back to Login
                                </div>
                            </button>
                        </form>
                    ) : (
                        <>
                            <form onSubmit={handleSubmit} className="mt-4 md:mt-8 text-center">
                        <h2 className="text-[24px] md:text-[32px] font-bold mb-1">{t('login.title')}</h2>
                        <p className="text-[14px] md:text-[16px] text-[#000000] mb-2 md:mb-4">
                            {t('login.subtitle')}
                        </p>

                        {/* Tabs */}
                        <div className="flex justify-center md:justify-start mb-4 md:mb-6">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setSelectedTab(tab.key)}
                                    className={`
                                        pb-1 md:pb-2 px-2 md:px-4 font-bold text-[16px] md:text-[21px]
                                        ${selectedTab === tab.key
                                            ? 'text-transparent bg-clip-text bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] border-b-2 border-[#C71585]'
                                            : 'text-gray-600 border-none'}
                                        ${tab.key === 'Admin' ? 'hidden md:inline-block' : ''}
                                    `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Email/Admin ID */}
                        <div className="mb-2 text-start md:mb-4">
                            <label className="block text-[16px] md:text-[18px] font-semibold mb-1">
                                {selectedTab === 'Admin' ? 'Admin id' : t('login.email')}
                            </label>
                            <input
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder={`${t('login.email')}...`}
                                className="w-full px-3 py-2 md:px-4 md:py-3 rounded-md border-none text-sm placeholder-gray-500"
                                style={{
                                    background: 'linear-gradient(180deg, rgba(234, 221, 255, 0.4), rgba(255, 234, 241, 0.4))',
                                }}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-2 text-start md:mb-2 relative">
                            <label className="block text-[16px] md:text-[18px] font-semibold mb-1">{t('login.password')}</label>
                            <div className="flex items-center relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder={`${t('login.password')}...`}
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
                            <div
                                onClick={() => navigate('/forget')}
                                className="text-right text-[10px] md:text-[12px] mt-1 text-[#00000099] text-gray-600 cursor-pointer"
                            >
                                {t('login.forgotPassword')}
                            </div>
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center mt-2 md:mt-3">
                            <input 
                                type="checkbox" 
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleInputChange}
                                className="mr-2" 
                                disabled={isLoading}
                            />
                            <label className="text-[14px] md:text-[16px]">{t('login.rememberMe')}</label>
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
                                    {t('login.signInButton')}...
                                </>
                            ) : (
                                t('login.signInButton')
                            )}
                        </button>
                    </form>

                    <p className="text-[12px] md:text-[14px] text-[#313131] font-bold text-center">
                        {t('login.noAccount')}{" "}
                        <span
                            onClick={() => navigate('/register')}
                            className="text-[#F84555] font-semibold cursor-pointer"
                        >
                            {t('login.signUp')}
                        </span>
                    </p>

                    {/* Social Login Section - Hidden on mobile */}
                    <div className="hidden md:flex items-center my-4 md:my-6">
                        <div className="flex-grow h-px bg-gray-300"></div>
                        <span className="px-2 md:px-4 text-[#00000099] text-[12px] md:text-[14px]">{t('social.orLoginWith')}</span>
                        <div className="flex-grow h-px bg-gray-300"></div>
                    </div>

                    <div className="hidden md:flex justify-center space-x-2 md:space-x-4">
                        <button type="button" className="border border-[#515DEF] p-1 md:p-2 rounded-md w-[80px] md:w-[125px] h-8 md:h-12 flex items-center justify-center">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/124/124010.png"
                                alt="Facebook"
                                className="w-4 h-4 md:w-5 md:h-5"
                            />
                        </button>
                        <button type="button" className="border border-[#515DEF] p-1 md:p-2 rounded-md w-[80px] md:w-[125px] h-8 md:h-12 flex items-center justify-center">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/300/300221.png"
                                alt="Google"
                                className="w-4 h-4 md:w-5 md:h-5"
                            />
                        </button>
                        <button type="button" className="border border-[#515DEF] p-1 md:p-2 rounded-md w-[80px] md:w-[125px] h-8 md:h-12 flex items-center justify-center">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/0/747.png"
                                alt="Apple"
                                className="w-4 h-4 md:w-5 md:h-5"
                            />
                        </button>
                    </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Signin;
