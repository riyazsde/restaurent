import React, { useState, useEffect } from "react";
import bgImage from "./assets/Gradient.svg";
import logo from "./assets/logo.svg";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import LanguageSelector from './LanguageSelector/LanguageSelector';
import { useCountries, useRegisterRestaurant, useSocialLogin } from '../hooks/queries/useAuth';

const RegisterPage = () => {
    const { t } = useTranslation('auth');
    const navigate = useNavigate();
    const [businessName, setBusinessName] = useState("");
    const [businessType, setBusinessType] = useState("Restaurant");
    const [countryId, setCountryId] = useState("1");
    
    // TanStack Query for countries
    const { data: rawCountries = [] } = useCountries();
    const defaultCountries = [
        { id: 1, name: "France" },
        { id: 2, name: "Côte d'Ivoire" },
        { id: 3, name: "Senegal" },
        { id: 4, name: "United States" },
        { id: 5, name: "Canada" },
        { id: 6, name: "United Kingdom" },
        { id: 7, name: "Ghana" },
        { id: 8, name: "Nigeria" }
    ];
    const countries = Array.isArray(rawCountries) && rawCountries.length > 0
        ? rawCountries.map(c => ({ id: c.id, name: c.Country_name || c.name || `Country #${c.id}` }))
        : defaultCountries;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword1, setShowPassword1] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // TanStack Mutations
    const registerMutation = useRegisterRestaurant();
    const socialLoginMutation = useSocialLogin();
    const loading = registerMutation.isPending || socialLoginMutation.isPending;

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!businessName.trim()) {
            toast.error(t('register.nameRequired', 'Please enter your business name.'));
            return;
        }

        if (!email.trim()) {
            toast.error(t('register.emailRequired', 'Please enter your email.'));
            return;
        }

        if (!password) {
            toast.error(t('register.passwordRequired', 'Please enter a password.'));
            return;
        }

        if (password !== confirmPassword) {
            toast.error(t('register.passwordMismatch', 'Passwords do not match.'));
            return;
        }

        try {
            const payload = {
                name: businessName.trim(),
                businessName: businessName.trim(),
                businessType,
                Country_id: Number(countryId) || 1,
                email: email.trim(),
                password,
                confirmPassword,
                rememberMe
            };
            const response = await registerMutation.mutateAsync(payload);
            toast.success(response?.message || t('register.success', 'Registration successful! Please sign in.'));
            navigate('/signin');
        } catch (error) {
            toast.error(error?.message || t('register.error', 'Registration failed. Please try again.'));
        }
    };

    const handleSocialLogin = async (provider) => {
        try {
            const response = await socialLoginMutation.mutateAsync({ provider, socialData: {} });
            toast.success(response?.message || `Signed in with ${provider}`);
            navigate('/dashboard');
        } catch (error) {
            toast.info(`Connecting to ${provider}... Please continue via provider popup.`);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden font-sans">
            {/* Mobile Header with LanguageSelector */}
            <div className="md:hidden absolute top-4 right-4 z-20">
                <LanguageSelector variant="auth" />
            </div>

            {/* Background image for mobile */}
            <div
                className="absolute inset-0 bg-cover bg-center md:hidden"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white px-4 text-center">
                    <div>
                        <h1 className="text-xl font-bold text-[#002B6B] leading-[1.2] mb-2 font-[Poppins]">
                            {t('hero.title', 'POS that works as hard as you, and faster than you.')}
                        </h1>
                        <p className="text-xs text-[#414D60] font-[Poppins]">
                            {t('hero.subtitle', 'Grow without limit with Triaxx and make timely and accurate decisions.')}
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
                        {t('hero.title', 'POS that works as hard as you, and faster than you.')}
                    </h1>
                    <p className="text-sm text-[#414D60] md:text-[18px] font-[Poppins]">
                        {t('hero.subtitle', 'Grow without limit with Triaxx and make timely and accurate decisions.')}
                    </p>
                    <div style={{ fontFamily: 'Poppins' }} className="absolute bottom-24 rounded-lg left-10">
                        <LanguageSelector variant="auth" />
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div style={{ fontFamily: 'Poppins' }} className="w-full md:w-1/2 overflow-y-auto flex items-center justify-center relative z-10 py-8">
                <div className="max-w-md bg-white rounded-xl mx-4 w-full p-4 md:p-8 mt-4 md:mt-20 space-y-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4 md:mb-8">
                        <h3 className="text-[20px] md:text-[24px] font-semibold text-[#1F2937]">
                            {t('register.title', 'Register')}
                        </h3>
                        <div className="flex items-center space-x-2">
                            <img src={logo} alt="Triaxx Logo" className="h-8" />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                        <div>
                            <label className="block text-[14px] md:text-[16px] font-medium text-gray-700 mb-1">
                                {t('register.businessName', 'Business Name')}
                            </label>
                            <input
                                type="text"
                                required
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder={t('register.businessNamePlaceholder', 'Enter your Business Name here……')}
                                className="w-full p-2.5 md:p-3 rounded-md bg-gradient-to-b from-[#fbefff] to-[#fdf4f4] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-400 text-sm md:text-base"
                            />
                        </div>

                        {/* Business Type and Country Dropdowns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[14px] md:text-[16px] font-medium text-gray-700 mb-1">
                                    {t('register.businessType', 'Business Type')}
                                </label>
                                <select
                                    value={businessType}
                                    onChange={(e) => setBusinessType(e.target.value)}
                                    className="w-full p-2.5 md:p-3 rounded-md bg-gradient-to-b from-[#fbefff] to-[#fdf4f4] text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400 text-sm md:text-base cursor-pointer"
                                >
                                    <option value="Restaurant">{t('register.businessTypes.restaurant', 'Restaurant')}</option>
                                    <option value="Bar & Lounge">{t('register.businessTypes.barLounge', 'Bar & Lounge')}</option>
                                    <option value="Café">{t('register.businessTypes.cafe', 'Café')}</option>
                                    <option value="Fast Food">{t('register.businessTypes.fastFood', 'Fast Food')}</option>
                                    <option value="Bakery">{t('register.businessTypes.bakery', 'Bakery')}</option>
                                    <option value="Food Truck">{t('register.businessTypes.foodTruck', 'Food Truck')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[14px] md:text-[16px] font-medium text-gray-700 mb-1">
                                    {t('register.country', 'Country')}
                                </label>
                                <select
                                    value={countryId}
                                    onChange={(e) => setCountryId(e.target.value)}
                                    className="w-full p-2.5 md:p-3 rounded-md bg-gradient-to-b from-[#fbefff] to-[#fdf4f4] text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400 text-sm md:text-base cursor-pointer"
                                >
                                    {countries.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[14px] md:text-[16px] font-medium text-gray-700 mb-1">
                                {t('register.email', 'Email')}
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('register.emailPlaceholder', 'Enter your Email here……')}
                                className="w-full p-2.5 md:p-3 rounded-md bg-gradient-to-b from-[#fbefff] to-[#fdf4f4] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-400 text-sm md:text-base"
                            />
                        </div>

                        <div>
                            <label className="block text-[14px] md:text-[16px] font-medium text-gray-700 mb-1">
                                {t('register.createPassword', 'Create Password')}
                            </label>
                            <div className="flex items-center relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t('register.createPasswordPlaceholder', 'Create Password')}
                                    className="w-full p-2.5 md:p-3 rounded-md bg-gradient-to-b from-[#fbefff] to-[#fdf4f4] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-400 text-sm md:text-base"
                                />
                                <span
                                    className="absolute right-3 cursor-pointer text-gray-500"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={isMobile ? 16 : 18} /> : <Eye size={isMobile ? 16 : 18} />}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[14px] md:text-[16px] font-medium text-gray-700 mb-1">
                                {t('register.confirmPassword', 'Confirm Password')}
                            </label>
                            <div className="flex items-center relative">
                                <input
                                    type={showPassword1 ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={t('register.confirmPasswordPlaceholder', 'Re-type and Confirm Password')}
                                    className="w-full p-2.5 md:p-3 rounded-md bg-gradient-to-b from-[#fbefff] to-[#fdf4f4] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-400 text-sm md:text-base"
                                />
                                <span
                                    className="absolute right-3 cursor-pointer text-gray-500"
                                    onClick={() => setShowPassword1(!showPassword1)}
                                >
                                    {showPassword1 ? <EyeOff size={isMobile ? 16 : 18} /> : <Eye size={isMobile ? 16 : 18} />}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="cursor-pointer"
                            />
                            <label htmlFor="remember" className="text-[13px] md:text-[15px] cursor-pointer text-gray-700">
                                {t('register.rememberMe', 'Remember me')}
                            </label>
                        </div>

                        <button
                            disabled={loading}
                            style={{ background: "linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)" }}
                            type="submit"
                            className="w-full text-white text-[15px] md:text-[17px] font-medium p-2.5 md:p-3 rounded-xl flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 transition-opacity"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin w-5 h-5 mr-2" />
                                    <span>{t('register.registering', 'Registering...')}</span>
                                </>
                            ) : (
                                <span>{t('register.submit', 'Submit')}</span>
                            )}
                        </button>
                    </form>

                    <p className="text-[12px] md:text-[14px] text-[#313131] font-normal text-center">
                        {t('register.haveAccount', 'Already have an account?')}{" "}
                        <span
                            onClick={() => navigate('/signin')}
                            className="text-[#FF8682] font-semibold cursor-pointer hover:underline"
                        >
                            {t('register.signIn', 'Sign In')}
                        </span>
                    </p>

                    <div className="hidden md:flex items-center my-3 md:my-4">
                        <div className="flex-grow h-px bg-gray-200"></div>
                        <span className="px-2 md:px-4 text-gray-500 text-[12px] md:text-[13px]">
                            {t('register.orLoginWith', 'Or login with')}
                        </span>
                        <div className="flex-grow h-px bg-gray-200"></div>
                    </div>

                    <div className="hidden md:flex justify-center space-x-2 md:space-x-4">
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('facebook')}
                            className="border border-[#515DEF] p-1 md:p-2 rounded-md w-[80px] md:w-[125px] h-8 md:h-12 flex items-center justify-center hover:bg-gray-50"
                        >
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/124/124010.png"
                                alt="Facebook"
                                className="w-4 h-4 md:w-5 md:h-5"
                            />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            className="border border-[#515DEF] p-1 md:p-2 rounded-md w-[80px] md:w-[125px] h-8 md:h-12 flex items-center justify-center hover:bg-gray-50"
                        >
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/300/300221.png"
                                alt="Google"
                                className="w-4 h-4 md:w-5 md:h-5"
                            />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('apple')}
                            className="border border-[#515DEF] p-1 md:p-2 rounded-md w-[80px] md:w-[125px] h-8 md:h-12 flex items-center justify-center hover:bg-gray-50"
                        >
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/0/747.png"
                                alt="Apple"
                                className="w-4 h-4 md:w-5 md:h-5"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;