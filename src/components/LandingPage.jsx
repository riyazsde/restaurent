import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, Users, Play, Check } from 'lucide-react';
import { features } from '../core/data';
import { ModalFactory } from './factories/ModalFactory';
import { useQuery } from '@tanstack/react-query';
import { planApi } from '../api/plan.api';
import { websiteApi } from '../api/website.api';
import logo from './assets/LOGOPlande.svg';
import useAuthStore from '../store/authStore';
import { getCookie } from '../utils/cookies';
import { COOKIE_NAMES } from '../utils/constants';
import LanguageSelector from './LanguageSelector/LanguageSelector';

const LandingPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { isAuthenticated, userRole, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const authToken = getCookie(COOKIE_NAMES.AUTH_TOKEN);
  const isLoggedIn = isAuthenticated || !!authToken;

  const [modalState, setModalState] = useState({ isOpen: false, type: null, payload: {} });
  const [activePlan, setActivePlan] = useState('bundle');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        // The navbar is at top-4 / top-6 (~24px). Transition when hero bottom reaches near the navbar (80px from top)
        setIsPastHero(rect.bottom <= 80);
      } else {
        setIsPastHero(window.scrollY > (window.innerHeight - 100));
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const openModal = (type, payload = {}) => setModalState({ isOpen: true, type, payload });
  const closeModal = () => setModalState({ isOpen: false, type: null, payload: {} });

  const { data: saasData, isLoading: isLoadingSaas } = useQuery({
    queryKey: ['plans', 'saas'],
    queryFn: () => planApi.getPublicPlans('SaaS Only')
  });

  const { data: bundleData, isLoading: isLoadingBundle } = useQuery({
    queryKey: ['plans', 'bundle'],
    queryFn: () => planApi.getPublicPlans('SaaS + Hardware')
  });

  const apiSaasPlans = saasData?.data?.data || [];
  const apiBundlePlans = bundleData?.data?.data || [];
  const isPlansLoading = activePlan === 'bundle' ? isLoadingBundle : isLoadingSaas;
  const currentPlans = activePlan === 'bundle' ? apiBundlePlans : apiSaasPlans;

  // Website Key Features Query
  const { data: featuresData, isLoading: isLoadingFeatures } = useQuery({
    queryKey: ['website', 'key-features', 'public'],
    queryFn: () => websiteApi.getPublicFeatures(),
    staleTime: 5 * 60 * 1000
  });

  // Website Statistics Query
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['website', 'statistics', 'public'],
    queryFn: () => websiteApi.getPublicStatistics(),
    staleTime: 5 * 60 * 1000
  });

  // Normalize Key Features with fallback to local features
  const rawFeatures = featuresData?.data?.data || featuresData?.data?.result || (Array.isArray(featuresData?.data) ? featuresData?.data : []);
  const activeFeatures = (Array.isArray(rawFeatures) ? rawFeatures : [])
    .filter(f => f && f.Status !== false)
    .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));

  const displayFeatures = activeFeatures.length > 0
    ? activeFeatures.map(f => ({
      title: f.heading || f.title || 'Feature',
      description: f.description || '',
      img: f.image || f.img || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80'
    }))
    : features;

  // Normalize Statistics: if activeStats from API are present, render them; otherwise fallback with original API count
  const rawStats = statsData?.data?.data || statsData?.data?.result || (Array.isArray(statsData?.data) ? statsData?.data : []);
  const activeStats = (Array.isArray(rawStats) ? rawStats : [])
    .filter(s => s && s.Status !== false)
    .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));

  const apiCount = statsData?.data?.count !== undefined ? String(statsData.data.count) : '0';

  const statThemes = [
    { iconBg: '#1A2A24', iconColor: 'text-emerald-400', icon: CheckCircle },
    { iconBg: '#2A241A', iconColor: 'text-amber-400', icon: Zap },
    { iconBg: '#1A222A', iconColor: 'text-blue-400', icon: Users },
    { iconBg: '#2A1A24', iconColor: 'text-purple-400', icon: CheckCircle }
  ];

  const defaultStats = [
    {
      value: '99.9%',
      heading: 'Uptime',
      description: 'System Reliability',
      image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M12%2022s8-4%208-10V5l-8-3-8%203v7c0%206%208%2010%208%2010Z%22%2F%3E%3Cpath%20d%3D%22m9%2012%202%202%204-4%22%2F%3E%3C%2Fsvg%3E',
      iconBg: '#1A2A24',
      iconColor: 'text-emerald-400',
      icon: CheckCircle
    },
    {
      value: '30%',
      heading: 'Faster',
      description: 'Order Processing',
      image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M13%202%203%2014h9l-1%208%2010-12h-9l1-8Z%22%2F%3E%3C%2Fsvg%3E',
      iconBg: '#2A241A',
      iconColor: 'text-amber-400',
      icon: Zap
    },
    {
      value: '500+',
      heading: 'Restaurants',
      description: 'Trusted POS',
      image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M16%2021v-2a4%204%200%200%200-4-4H6a4%204%200%200%200-4%204v2%22%2F%3E%3Ccircle%20cx%3D%229%22%20cy%3D%227%22%20r%3D%224%22%2F%3E%3Cpath%20d%3D%22M22%2021v-2a4%204%200%200%200-3-3.87M16%203.13a4%204%200%200%201%200%207.75%22%2F%3E%3C%2Fsvg%3E',
      iconBg: '#1A222A',
      iconColor: 'text-blue-400',
      icon: Users
    }
  ];

  const displayStats = activeStats.length > 0
    ? activeStats.map((s, idx) => {
      const theme = statThemes[idx % statThemes.length];
      return {
        value: s.value || '',
        heading: s.heading || '',
        description: s.description || '',
        image: s.image,
        iconBg: theme.iconBg,
        iconColor: theme.iconColor,
        icon: theme.icon
      };
    })
    : defaultStats;

  return (
    <div className="font-sans text-gray-900 bg-white">
      {/* Navigation */}
      <nav
        className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] max-w-7xl z-50 flex items-center justify-between px-6 md:px-8 py-2.5 md:py-3 text-white rounded-full border transition-all duration-300"
        style={{
          backgroundColor: isPastHero ? 'rgba(11, 13, 20, 0.96)' : 'rgba(255, 255, 255, 0.08)',
          backdropFilter: isPastHero ? 'blur(20px)' : 'blur(12px)',
          WebkitBackdropFilter: isPastHero ? 'blur(20px)' : 'blur(12px)',
          borderColor: isPastHero ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.2)',
          boxShadow: isPastHero ? '0 12px 40px rgba(0, 0, 0, 0.65)' : '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src={logo} alt="Triaxx Logo" className="h-6 md:h-20" />
        </div>
        <div className="hidden md:flex items-center gap-8 text-[14px] font-medium">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-white hover:text-white transition-colors cursor-pointer" style={{ color: '#ffffff' }}>Home</button>
          <button onClick={() => document.getElementById('subscriptions')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-300 hover:text-white transition-colors cursor-pointer" style={{ color: '#d1d5db' }}>Subscriptions</button>
          <button onClick={() => openModal('CONTACT')} className="text-gray-300 hover:text-white transition-colors cursor-pointer" style={{ color: '#d1d5db' }}>Contact Us</button>
          <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-300 hover:text-white transition-colors cursor-pointer" style={{ color: '#d1d5db' }}>About Us</button>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector
            variant="auth"
            className="absolute right-0 top-[calc(100%+0.5rem)] sm:static"
          />
          <button
            onClick={() => {
              if (isLoggedIn) {
                navigate(userRole === 'Employee' ? '/employee/quick-order' : '/dashboard/home');
              } else {
                navigate('/register');
              }
            }}
            className="relative flex items-center gap-3 transition-all pl-5 md:pl-6 pr-1.5 py-1.5 rounded-full text-[14px] md:text-[15px] font-medium text-white hover:bg-white/10 active:scale-[0.98] group"
          >
            {/* Gradient Outline using CSS Mask */}
            <div
              className="absolute inset-0 rounded-full p-[1px] bg-gradient-to-r from-[#6409C0] to-[#F0389B] pointer-events-none"
              style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}
            ></div>

            <span className="relative z-10 font-semibold text-white tracking-wide" style={{ color: '#ffffff' }}>
              {isLoggedIn ? 'Login' : 'Register Now'}
            </span>
            <div className="relative z-10 w-7 h-7 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-[18px] md:h-[18px]">
                <defs>
                  <linearGradient id="purpleRedGradientNav" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6409C0" />
                    <stop offset="100%" stopColor="#F0389B" />
                  </linearGradient>
                </defs>
                <path d="M7 17L17 7M7 7h10v10" stroke="url(#purpleRedGradientNav)" />
              </svg>
            </div>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="/hero-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-white mt-16">
          <div className="max-w-3xl">
            <div className="inline-block bg-black/40 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-[13px] font-medium mb-6">
              <span className="text-[#F0389B]">Your #1</span> <span className="text-white">Platform for Point of Sales</span>
            </div>

            <h1 className="text-5xl md:text-[64px] font-bold leading-tight mb-6 tracking-tight">
              Run Your Restaurant Smarter with an All-in-One POS System.
            </h1>

            <p className="text-lg md:text-[18px] text-gray-200 mb-10 max-w-2xl leading-relaxed">
              Manage orders, inventory, payments, and reports from one powerful platform designed to help restaurants serve faster and grow revenue.
            </p>

            {/* CTA Button */}
            <div className="flex mb-12">
              <button onClick={() => openModal('CONTACT')} className="bg-gradient-to-r from-[#F0389B] to-[#702283] text-white hover:opacity-90 px-8 py-3.5 rounded-xl font-medium transition-opacity text-[16px] shadow-lg">
                Talk to a POS Specialist
              </button>
            </div>

            {/* Divider */}
            <div className="w-full h-[1px] bg-white/10 mb-8 max-w-3xl"></div>

            {/* Stats Blocks */}
            <div className="flex flex-wrap gap-4 mb-10">
              {isLoadingStats ? (
                [1, 2, 3].map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 bg-black/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl min-w-[200px] animate-pulse"
                  >
                    <div className="w-11 h-11 rounded-full bg-white/10 flex-shrink-0"></div>
                    <div className="flex flex-col gap-2">
                      <div className="h-5 w-16 bg-white/20 rounded"></div>
                      <div className="h-3 w-20 bg-white/10 rounded"></div>
                    </div>
                  </div>
                ))
              ) : (
                displayStats.map((stat, idx) => {
                  const IconComponent = stat.icon || CheckCircle;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-4 bg-black/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl min-w-[200px]"
                    >
                      <div
                        className="p-3 rounded-full flex-shrink-0 flex items-center justify-center w-11 h-11"
                        style={{ backgroundColor: stat.iconBg || '#1A2A24' }}
                      >
                        {stat.image ? (
                          <img
                            src={stat.image}
                            alt={stat.heading || 'Stat icon'}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback) fallback.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <span style={{ display: stat.image ? 'none' : 'block' }}>
                          <IconComponent className={`w-5 h-5 ${stat.iconColor || 'text-emerald-400'}`} />
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[20px] font-bold text-white leading-none mb-1">{stat.value}</span>
                        <span className="text-[10px] text-gray-400 leading-tight">
                          {stat.heading}
                          {stat.description && (
                            <>
                              <br />
                              {stat.description}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Soft background blob */}
        <div className="absolute left-[10%] top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">

            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-[42px] font-medium mb-16 text-[#1A1A1A]">How It Works</h2>

              <div className="relative space-y-8 w-full max-w-[480px]">

                {/* Step 1 */}
                <div className="flex items-center">
                  <div className="text-[100px] md:text-[120px] font-light text-[#F0F2F5] leading-none select-none tracking-tighter">01</div>
                  <div className="bg-white p-5 pr-8 rounded-[20px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] flex items-center gap-4 -ml-8 relative z-10 w-full max-w-[340px]">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex-shrink-0 flex items-center justify-center text-blue-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[16px] font-medium text-gray-900">Sign Up and Create Account</h3>
                      <p className="text-[12px] text-gray-500 mt-1">Fill out your details and choose your plan.</p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-center justify-end">
                  <div className="bg-white p-5 pr-8 rounded-[20px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] flex items-center gap-4 -mr-8 relative z-10 w-full max-w-[340px]">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex-shrink-0 flex items-center justify-center text-orange-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[16px] font-medium text-gray-900">Upload Your Items</h3>
                      <p className="text-[12px] text-gray-500 mt-1">Add your Dishes, Beverages and Desserts.</p>
                    </div>
                  </div>
                  <div className="text-[100px] md:text-[120px] font-light text-[#F0F2F5] leading-none select-none tracking-tighter">02</div>
                </div>

                {/* Step 3 */}
                <div className="flex items-center">
                  <div className="text-[100px] md:text-[120px] font-light text-[#F0F2F5] leading-none select-none tracking-tighter">03</div>
                  <div className="bg-white p-5 pr-8 rounded-[20px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] flex items-center gap-4 -ml-8 relative z-10 w-full max-w-[340px]">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex-shrink-0 flex items-center justify-center text-purple-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <polygon points="12 2 2 7 12 12 22 7 12 2" />
                        <polyline points="2 17 12 22 22 17" />
                        <polyline points="2 12 12 17 22 12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[16px] font-medium text-gray-900">Automize the Work</h3>
                      <p className="text-[12px] text-gray-500 mt-1">Let our POS Manage all the Complex Works.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="lg:w-[45%] relative h-[500px] ml-auto mt-12 lg:mt-0">
              {/* Right Image */}
              <img
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=600&q=80"
                alt="Dining"
                className="absolute right-0 top-0 w-[65%] h-[480px] object-cover rounded-[24px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] z-0"
              />

              {/* Left Image */}
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80"
                alt="POS Terminal"
                className="absolute left-0 top-[15%] w-[55%] h-[320px] object-cover rounded-[24px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] z-10"
              />

              {/* Pill - 18+ Languages */}
              <div className="absolute bottom-[20%] left-[10%] bg-white rounded-[24px] px-5 py-3 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] flex items-center gap-4 z-20 border border-white">
                <div className="flex -space-x-3">
                  <img src="https://i.pravatar.cc/100?img=11" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" alt="avatar" />
                  <img src="https://i.pravatar.cc/100?img=5" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" alt="avatar" />
                  <img src="https://i.pravatar.cc/100?img=12" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" alt="avatar" />
                </div>
                <div className="leading-tight pr-2">
                  <div className="text-blue-600 font-bold text-[15px]">18 +</div>
                  <div className="text-[11px] text-gray-500 font-medium">Languages</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-16">Key Features to grow <span className="text-brand-accent">10X</span></h2>
        </div>

        <div className="w-full relative overflow-hidden group">
          {isLoadingFeatures ? (
            <div className="flex gap-8 w-max px-4">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <div
                  key={index}
                  className="min-w-[320px] w-[320px] h-[450px] relative rounded-3xl overflow-hidden bg-gradient-to-b from-gray-100 via-gray-200 to-gray-100 animate-pulse flex-shrink-0 border border-gray-200/80 p-6 flex flex-col justify-between"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-300/80"></div>
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-300 rounded-lg w-2/3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300/60 rounded-md w-full"></div>
                      <div className="h-4 bg-gray-300/60 rounded-md w-4/5"></div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-300 ml-auto mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-8 w-max animate-infinite-scroll group-hover:[animation-play-state:paused] px-4">
              {[...displayFeatures, ...displayFeatures].map((feature, i) => (
                <div key={i} className="min-w-[320px] w-[320px] h-[450px] relative rounded-3xl overflow-hidden group/card flex-shrink-0 shadow-lg">
                  <img
                    src={feature.img}
                    alt={feature.title}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover/card:scale-110 group-hover/card:opacity-0"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-500 group-hover/card:opacity-0"></div>
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white transition-opacity duration-500 group-hover/card:opacity-0">
                    <h3 className="text-xl font-bold w-1/2">{feature.title}</h3>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center transform group-hover/card:scale-110 transition-transform">
                      <img src="/iconoir_arrow-up-right.png" alt="Arrow" className="w-5 h-5 object-contain" />
                    </div>
                  </div>

                  {/* Hover State */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#702283] to-[#E53935] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100 flex flex-col justify-center items-center p-8 text-center text-white">
                    <h3 className="text-xl font-bold mb-8">{feature.title}</h3>
                    <p className="text-[17px] leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Offline Mode Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=800&q=80"
                alt="Barista"
                className="w-full object-cover rounded-none"
              />
            </div>
            <div className="lg:w-1/2 lg:pl-12">
              <div className="text-[#A2386E] font-medium text-[15px] mb-4">Exclusive from Triaxx POS</div>

              <h2 className="text-3xl md:text-[34px] font-bold mb-8 leading-[1.3] text-[#1A1A1A]">
                Offline Mode, So You Can Make Sales Even Without an Internet Connection
              </h2>

              <p className="text-[#4B5563] mb-8 leading-[1.7] text-[16px]">
                Sell at events or in areas with spotty internet and keep making sales, even during an internet outage.
              </p>

              <button
                onClick={() => openModal('CONTACT')}
                className="bg-gradient-to-r from-[#702283] to-[#E53935] text-white hover:opacity-90 px-8 py-4 rounded text-[15px] font-medium transition-opacity mb-8"
              >
                Talk to a POS Specialist
              </button>

              <p className="text-[#4B5563] leading-[1.7] text-[16px]">
                Triaxx POS has a sleek PWA frontend that is fast and resilient, and can even continue working offline if needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Triaxx Section */}
      <section id="about" className="py-24 bg-black text-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 lg:pr-12">
              <h2 className="text-[#A2386E] text-[20px] font-semibold mb-4">Team Triaxx</h2>
              <h3 className="text-3xl md:text-[34px] font-bold mb-8 leading-[1.3]">
                Our Team Made a POS Software with Most Powerful Automization and Customization Features
              </h3>

              <p className="text-gray-400 mb-10 leading-[1.7] text-[16px]">
                Sell at events or in areas with spotty internet and keep making sales, even during an internet outage.
              </p>

              <div className="flex flex-wrap items-center gap-8 mb-10">
                <button onClick={() => openModal('CONTACT')} className="bg-gradient-to-r from-[#702283] to-[#E53935] text-white hover:opacity-90 px-8 py-4 rounded font-medium transition-opacity text-[15px]">
                  Talk to a POS Specialist
                </button>
                <button className="text-white hover:text-gray-300 font-medium flex items-center gap-4 transition-colors">
                  <div className="w-8 h-[1px] bg-white"></div>
                  Start Free Trial
                </button>
              </div>

              <p className="text-gray-400 leading-[1.7] text-[16px]">
                Triaxx has development a Product with Great value to the restaurant's and Bar's. We believe that the customization work and everything you pay for is worth the investment.
              </p>
            </div>
            <div className="lg:w-1/2">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" alt="Team" className="rounded-none shadow-2xl w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Inventory Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            {/* Left Content */}
            <div className="lg:w-[40%]">
              <h2 className="text-3xl md:text-[38px] font-bold mb-6 text-[#1A1A1A] leading-tight">
                Never Run Out of Inventory
              </h2>
              <div className="w-48 h-1 bg-gradient-to-r from-[#702283] to-[#E53935] mb-8"></div>
              <p className="text-gray-500 leading-[1.7] text-[16px]">
                Monitors inventory movement across all sales channels and locations, ensuring stock is where it's needed, when it's needed, at the right cost.
              </p>
            </div>

            {/* Right Content - Grid */}
            <div className="lg:w-[60%] grid grid-cols-1 sm:grid-cols-2 gap-y-12 gap-x-12">
              {/* Feature 1 */}
              <div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#702283] to-[#E53935] p-[2px] mb-6">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="url(#purpleRedGradientInventory)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M14 14l1.5 1.5 2.5-2.5" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-[17px] font-bold text-[#1A1A1A] mb-3">Stock management</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed">
                  Maintain a single dashboard for all sales channels
                </p>
              </div>

              {/* Feature 2 */}
              <div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#702283] to-[#E53935] p-[2px] mb-6">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="url(#purpleRedGradientInventory)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                      <path d="M9 5H21M9 12H21M9 19H21" />
                      <rect x="3" y="3" width="3" height="3" />
                      <rect x="3" y="10" width="3" height="3" />
                      <rect x="3" y="17" width="3" height="3" />
                      <path d="M3.5 4.5l0.5 0.5 1-1" />
                      <path d="M3.5 11.5l0.5 0.5 1-1" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-[17px] font-bold text-[#1A1A1A] mb-3">Stock tracking</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed">
                  Have an eye on the top performing Stocks
                </p>
              </div>

              {/* Feature 3 */}
              <div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#702283] to-[#E53935] p-[2px] mb-6">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="url(#purpleRedGradientInventory)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                      <path d="M8 16l3-3 2 2 3-3" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-[17px] font-bold text-[#1A1A1A] mb-3">Demand forecasting</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed">
                  Decide when and how much to reorder
                </p>
              </div>

              {/* Feature 4 */}
              <div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#702283] to-[#E53935] p-[2px] mb-6">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="url(#purpleRedGradientInventory)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                      <path d="M9 5H21M9 12H21M9 19H21" />
                      <rect x="3" y="3" width="3" height="3" />
                      <rect x="3" y="10" width="3" height="3" />
                      <rect x="3" y="17" width="3" height="3" />
                      <path d="M3.5 4.5l0.5 0.5 1-1" />
                      <path d="M3.5 11.5l0.5 0.5 1-1" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-[17px] font-bold text-[#1A1A1A] mb-3">inventory reports</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed">
                  Keep your stock levels in check and monitor incoming products
                </p>
              </div>
            </div>
          </div>

          {/* Centered Button */}
          <div className="mt-20 flex justify-center">
            <button onClick={() => openModal('CONTACT')} className="bg-gradient-to-r from-[#702283] to-[#E53935] text-white hover:opacity-90 px-10 py-4 rounded font-medium transition-opacity text-[15px]">
              Talk to a POS Specialist
            </button>
          </div>
        </div>

        {/* SVG Definition for Gradient Icons */}
        <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
          <linearGradient id="purpleRedGradientInventory" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#702283" />
            <stop offset="100%" stopColor="#E53935" />
          </linearGradient>
        </svg>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <h2 className="text-3xl md:text-[42px] font-medium text-[#1A1A1A] leading-tight">What our clients say</h2>
            <div className="flex gap-4">
              <button className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#4B5563] hover:bg-gray-200 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="w-12 h-12 rounded-full bg-gradient-to-br from-[#702283] to-[#E53935] flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-lg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Carousel Container */}
          <div className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

            {/* Card 1 */}
            <div className="bg-[#050505] text-white rounded-3xl p-12 md:p-16 min-w-[300px] w-[600px] flex-shrink-0 snap-start flex flex-col items-center justify-center">
              <div className="text-center mb-10 text-[15px]">
                <span className="font-semibold text-gray-100">Manuel Rikob</span>
                <span className="text-[#6B7280] mx-3">•</span>
                <span className="text-[#9CA3AF]">CEO of Intel</span>
              </div>
              <p className="text-[28px] md:text-[34px] font-normal leading-[1.4] text-center max-w-[420px]">
                "Working with Master in me has been an incredibly painless and enjoyable experience."
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#050505] text-white rounded-3xl p-12 md:p-16 min-w-[300px] w-[600px] flex-shrink-0 snap-start flex flex-col items-center justify-center">
              <div className="text-center mb-10 text-[15px]">
                <span className="font-semibold text-gray-100">Manuel Rikob</span>
                <span className="text-[#6B7280] mx-3">•</span>
                <span className="text-[#9CA3AF]">CEO of Intel</span>
              </div>
              <p className="text-[28px] md:text-[34px] font-normal leading-[1.4] text-center max-w-[420px]">
                "Working with Master in me has been an incredibly painless and enjoyable experience."
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#050505] text-white rounded-3xl p-12 md:p-16 min-w-[300px] w-[600px] flex-shrink-0 snap-start flex flex-col items-center justify-center">
              <div className="text-center mb-10 text-[15px]">
                <span className="font-semibold text-gray-100">Manuel Rikob</span>
                <span className="text-[#6B7280] mx-3">•</span>
                <span className="text-[#9CA3AF]">CEO of Intel</span>
              </div>
              <p className="text-[28px] md:text-[34px] font-normal leading-[1.4] text-center max-w-[420px]">
                "Working with Master in me has been an incredibly painless and enjoyable experience."
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="w-full bg-[#FAFAFA]">
        <div className="w-full grid grid-cols-1 md:grid-cols-2">
          {/* Block 1 */}
          <div className="bg-[#050505] text-white p-12 lg:p-20 flex flex-col justify-center items-center text-center min-h-[400px] lg:min-h-[500px]">
            <h2 className="text-[34px] md:text-[44px] font-bold leading-tight tracking-tight">
              The <span className="text-[#A2386E]">Triaxx</span><br />Experience
            </h2>
          </div>

          {/* Block 2 */}
          <div className="bg-white text-[#1A1A1A] p-12 lg:p-20 flex flex-col justify-center items-center text-center min-h-[400px] lg:min-h-[500px]">
            <h3 className="text-[20px] md:text-[26px] font-bold mb-6 leading-tight">
              Access from any part<br />of the globe
            </h3>
            <p className="text-[#4B5563] text-[16px] leading-[1.7] max-w-[400px]">
              Get Trivaxx on mobile and access it from any part of the globe seamlessly. All your data's are stored securely and can be accessed by authorization
            </p>
          </div>

          {/* Block 3 */}
          <div className="bg-white text-[#1A1A1A] p-12 lg:p-20 flex flex-col justify-center items-center text-center min-h-[400px] lg:min-h-[500px]">
            <h3 className="text-[20px] md:text-[26px] font-bold mb-6 leading-tight">
              Table and Floor Management
            </h3>
            <p className="text-[#4B5563] text-[16px] leading-[1.7] max-w-[400px]">
              Employees can see a visual floor plan showing which tables are occupied, reserved, or available and Table Merging/Splitting
            </p>
          </div>

          {/* Block 4 */}
          <div className="bg-[#050505] text-white p-12 lg:p-20 flex flex-col justify-center items-center text-center min-h-[400px] lg:min-h-[500px]">
            <h3 className="text-[20px] md:text-[26px] font-bold mb-6 leading-tight">
              Sales Performance Tracking
            </h3>
            <p className="text-[#9CA3AF] text-[16px] leading-[1.7] max-w-[400px]">
              Employees can view their daily sales totals, rack employee productivity in terms of orders taken. Staff can send messages to other employees
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="subscriptions" className="py-24 bg-[#FAFAFA] text-center border-t border-gray-100">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6">Plans for every Business</h2>

          <div className="flex justify-center mb-12">
            <div className="bg-[#EAE0EB] rounded-[20px] inline-flex overflow-hidden shadow-sm">
              <button
                onClick={() => setActivePlan('saas')}
                className={`px-12 py-4 font-medium text-[16px] transition-all ${activePlan === 'saas' ? 'bg-gradient-to-b from-brand-primary to-brand-secondary text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                SaaS Only - no contract
              </button>
              <button
                onClick={() => setActivePlan('bundle')}
                className={`px-12 py-4 font-medium text-[16px] transition-all ${activePlan === 'bundle' ? 'bg-gradient-to-b from-brand-primary to-brand-secondary text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Bundle - 2-year contract
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
            {isPlansLoading ? (
              [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`bg-white rounded-[24px] p-8 border-2 ${i === 1 ? 'border-brand-accent/40 relative shadow-xl transform scale-105 z-10' : 'border-gray-200'
                    } flex flex-col h-full animate-pulse`}
                >
                  {i === 1 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-primary/60 to-brand-secondary/60 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                      Best value
                    </div>
                  )}

                  {/* Tag skeleton */}
                  <div className="h-3 w-28 bg-gray-200 rounded mb-3"></div>

                  {/* Title skeleton */}
                  <div className="h-7 w-36 bg-gray-200 rounded-md mb-3"></div>

                  {/* Price skeleton */}
                  <div className="flex items-baseline gap-2 mb-6">
                    <div className="h-9 w-24 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 w-10 bg-gray-200 rounded"></div>
                  </div>

                  {/* Bundle Banners skeleton */}
                  {activePlan === 'bundle' && (
                    <div className="space-y-3 mb-6">
                      <div className="h-9 bg-[#FFF8F1] border border-[#FDE68A]/60 rounded-lg w-full flex items-center px-3 gap-2">
                        <div className="w-3.5 h-3.5 rounded bg-[#FDE68A] shrink-0"></div>
                        <div className="h-2.5 bg-[#B45309]/20 rounded w-3/4"></div>
                      </div>
                      <div className="h-9 bg-[#F8F5FF] border border-[#E9D5FF]/60 rounded-lg w-full flex items-center px-3 gap-2">
                        <div className="w-3.5 h-3.5 rounded bg-[#E9D5FF] shrink-0"></div>
                        <div className="h-2.5 bg-[#6B21A8]/20 rounded w-3/4"></div>
                      </div>
                    </div>
                  )}

                  {/* Feature list skeleton */}
                  <div className="space-y-4 mb-10 flex-1">
                    {[1, 2, 3, 4, 5].slice(0, i === 1 ? 4 : i === 2 ? 3 : 5).map((featIdx) => (
                      <div key={featIdx} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-gray-200 shrink-0"></div>
                        <div className={`h-4 bg-gray-200 rounded ${featIdx % 2 === 0 ? 'w-4/5' : 'w-3/5'
                          }`}></div>
                      </div>
                    ))}
                  </div>

                  {/* Action button skeleton */}
                  <div className={`w-full h-12 rounded-xl ${i === 1
                      ? 'bg-gradient-to-r from-brand-primary/40 to-brand-secondary/40 shadow-sm'
                      : 'bg-gray-100 border-2 border-gray-200'
                    }`}></div>
                </div>
              ))
            ) : currentPlans.length > 0 ? (
              currentPlans.map((plan, i) => (
                <div key={i} className={`bg-white rounded-[24px] p-8 border-2 ${i === 1 ? 'border-brand-accent relative shadow-xl transform scale-105 z-10' : 'border-gray-200'} flex flex-col h-full`}>
                  {i === 1 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                      Best value
                    </div>
                  )}

                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{plan?.PlanName?.split('+')[0]?.trim()} BUNDLE</h3>
                  <div className="text-2xl font-bold mb-2">{plan.PlanName}</div>
                  <div className="text-4xl font-bold text-brand-accent mb-6 tracking-tight">${plan.Price} <span className="text-sm text-gray-500 font-normal">/ mo</span></div>

                  {activePlan === 'bundle' && (
                    <div className="space-y-3 mb-6">
                      <div className="bg-[#FFF8F1] border border-[#FDE68A] text-[#B45309] text-[11px] px-3 py-2 rounded-lg flex items-center gap-2 font-medium">
                        <span>🔒</span>
                        $89.99 deposit at signup - Non-refundable on early exit
                      </div>
                      <div className="bg-[#F8F5FF] border border-[#E9D5FF] text-[#6B21A8] text-[11px] px-3 py-2 rounded-lg flex items-center gap-2 font-medium">
                        <span>📝</span>
                        2-year contract - ETF applies on early termination
                      </div>
                    </div>
                  )}

                  <ul className="space-y-4 mb-10 flex-1">
                    {(plan.fesility || []).map((feat, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-gray-800 font-medium">
                        <Check className="w-5 h-5 text-success shrink-0" strokeWidth={3} />
                        {feat.fesilityLine}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => openModal('PAYMENT', { price: plan.Price })}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all ${i === 1 ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md hover:opacity-90' : 'border-2 border-gray-200 hover:border-gray-300 text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary'}`}
                  >
                    Get Started
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-3 py-12 text-center text-gray-400">
                <p className="text-base font-medium">No plans available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-white pt-32">
        <div className="container mx-auto px-6 text-center mb-16">
          <h2 className="text-3xl md:text-[38px] font-bold text-[#1A1A1A] max-w-2xl mx-auto leading-tight">
            see how Triaxx can help you operate<br />more efficiently
          </h2>
        </div>

        <div className="flex flex-col md:flex-row w-full">
          {/* Left Image Block */}
          <div className="w-full md:w-1/2 relative h-[450px] group cursor-pointer overflow-hidden">
            <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80" alt="Consultant" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-white">
              <div className="text-[18px] mb-4 opacity-90 font-medium tracking-wide">Most beneficial</div>
              <h3 className="text-2xl md:text-[30px] font-medium mb-8 max-w-md leading-tight">Talk to our POS consultants and have all of your questions answered.</h3>
              <button onClick={() => openModal('CONTACT')} className="border border-white hover:bg-white hover:text-black transition-colors px-8 py-3 rounded-md text-[15px] font-medium backdrop-blur-sm">Talk to a POS Specialist</button>
            </div>
          </div>

          {/* Right Image Block */}
          <div className="w-full md:w-1/2 relative h-[450px] group cursor-pointer overflow-hidden">
            <img src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1200&q=80" alt="Quick Start" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-white">
              <div className="text-[18px] mb-4 opacity-90 font-medium tracking-wide">Quick Start</div>
              <h3 className="text-2xl md:text-[30px] font-medium mb-8 max-w-md leading-tight">Get started with a free<br />Trial</h3>
              <button className="border border-white hover:bg-white hover:text-black transition-colors px-8 py-3 rounded-md text-[15px] font-medium backdrop-blur-sm">Talk to a POS Specialist</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-16 pb-16">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="border-t border-gray-200 pt-16 flex flex-col lg:flex-row justify-between gap-16 lg:gap-24">
            {/* Left Side */}
            <div className="lg:w-[30%] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-10">
                  <svg viewBox="0 0 40 40" className="w-10 h-10 text-[#A2386E]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 14h20M20 14v12M17 26h6M14 14l-3 3v4h5" />
                  </svg>
                  <span className="text-[32px] font-black tracking-widest text-[#A2386E]">TRIAXX</span>
                </div>

                <h4 className="text-[18px] font-bold text-[#1A1A1A] mb-4">Location</h4>
                <div className="text-[14px] text-[#4B5563] space-y-5">
                  <p className="leading-relaxed">
                    <strong className="text-[#1A1A1A] font-semibold">Corporate Head Office:</strong> 3787 Jerry Dove Drive, Florence,<br />
                    South city, 29501, South Africa
                  </p>
                  <div className="space-y-1">
                    <p><strong className="text-[#1A1A1A] font-semibold">Phone:</strong> 843-496-7759</p>
                    <p><strong className="text-[#1A1A1A] font-semibold">Fax:</strong> 02-222264303</p>
                    <p><strong className="text-[#1A1A1A] font-semibold">Email:</strong> info@mastershub.com</p>
                  </div>
                </div>
              </div>

              <div className="mt-20 text-[13px] text-[#A2386E]">
                ©2025 All rights reserved
              </div>
            </div>

            {/* Right Side */}
            <div className="lg:w-[60%] flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
                <div>
                  <h4 className="text-[18px] font-bold text-[#1A1A1A] mb-6">Quick Links</h4>
                  <ul className="space-y-4 text-[14px] text-[#4B5563]">
                    <li><a href="#" className="hover:text-[#A2386E] transition-colors">Features</a></li>
                    <li><a href="#" className="hover:text-[#A2386E] transition-colors">Subscription</a></li>
                    <li>
                      <button
                        type="button"
                        onClick={() => openModal('CONTACT')}
                        className="hover:text-[#A2386E] transition-colors text-left"
                      >
                        Contact Us
                      </button>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[18px] font-bold text-[#1A1A1A] mb-6">Others</h4>
                  <ul className="space-y-4 text-[14px] text-[#4B5563]">
                    <li><a href="#" className="hover:text-[#A2386E] transition-colors">How it works</a></li>
                    <li><a href="#" className="hover:text-[#A2386E] transition-colors">About Us</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[18px] font-bold text-[#1A1A1A] mb-6">About us</h4>
                  {/* Empty column matching screenshot */}
                </div>
              </div>

              <div className="mt-16 md:mt-24 max-w-xl">
                {isSubscribed ? (
                  <div className="py-4">
                    <h4 className="text-[24px] md:text-[28px] font-bold text-[#1A1A1A] mb-8 tracking-tight">You have Successfully Subscribed</h4>
                    <button onClick={() => openModal('CONTACT')} className="bg-gradient-to-r from-[#702283] to-[#E53935] text-white hover:opacity-90 transition-opacity py-3.5 px-8 rounded-lg text-[16px] font-medium shadow-md">
                      Talk to a POS Expert
                    </button>
                  </div>
                ) : (
                  <>
                    <h4 className="text-[18px] font-bold text-[#1A1A1A] mb-3">Signup Newsletter & Become Member</h4>
                    <p className="text-[14px] text-[#4B5563] mb-8 leading-[1.6]">
                      Sign up for exclusive offers, original stories, Features, events,<br />Early Access and more.
                    </p>
                    <div className="flex flex-col gap-6 w-full md:w-4/5">
                      <input
                        type="email"
                        placeholder="E-mail*"
                        className="w-full bg-transparent border-b-[3px] border-[#1A1A1A] pb-2 text-[15px] text-[#1A1A1A] placeholder-[#1A1A1A] focus:outline-none focus:border-[#A2386E] transition-colors"
                      />
                      <button onClick={() => setIsSubscribed(true)} className="bg-gradient-to-r from-[#702283] to-[#E53935] text-white hover:opacity-90 transition-opacity py-3 px-8 rounded-md text-[15px] font-medium w-fit shadow-md">
                        Sign Me Up
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>

      <ModalFactory
        type={modalState.type}
        isOpen={modalState.isOpen}
        onClose={closeModal}
        payload={modalState.payload}
        openModal={openModal}
        navigate={navigate}
      />
    </div>
  );
};

export default LandingPage;
