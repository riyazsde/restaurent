
import React, { useState, useRef, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaSearch, FaBars, FaBell, FaChevronDown, FaUser, FaDesktop, FaLanguage, FaUserPlus, FaQuestionCircle, FaSignOutAlt } from "react-icons/fa";
import { Search, Menu, CircleUser, MonitorSmartphone, Languages, UserPlus, LifeBuoy, LogOut } from "lucide-react";
// import { FiHome, FiShoppingCart, FiUsers, FiSettings, FiClipboard, FiBox, FiGrid, FiStar, FiBriefcase, FiBarChart2, FiMessageSquare } from "react-icons/fi";
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/authStore';
import { useLogout } from '../../hooks/queries/useAuth';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import useSearchStore from '../../store/searchStore';
import logo from "../assets/LOGOPlande.svg";
import vector from "../assets/vector.svg";
import home1 from "../assets/home-2.svg";
import home from "../assets/Vector (89).svg";
import fork from "../assets/fork.svg";
import chef from "../assets/chef.svg";
import chair from "../assets/chair.svg";
import round from "../assets/round.svg";
import book from "../assets/book.svg";
import recipeIcon from "../assets/recipe.svg";
import inventoryIcon from "../assets/inventory.svg";
import bx from "../assets/bx.svg";
import three from "../assets/three.svg";
import threes from "../assets/threes.svg";
import graph from "../assets/graph.svg";
import icon from "../assets/icon (16).svg";
import promotionsBadge from "../assets/promotions-badge.svg";
import loyaltyTag from "../assets/loyalty-tag.svg";
import { useNotifications } from "../../hooks/queries/useNotifications";

const DropdownItem = ({ icon, label, className = "", onClick }) => (
  <div
    onClick={onClick}
    style={{ fontFamily: "Poppins" }}
    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-gray-100 text-gray-800 text-[14px] sm:text-[15px] font-medium cursor-pointer transition-colors ${className}`}
  >
    <span className="text-[18px] flex-shrink-0">{icon}</span>
    <span className="truncate">{label}</span>
  </div>
);

const AdminLayout = () => {
  const { t } = useTranslation('common');
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const notificationRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const { logout,
    user,
    setLoading } = useAuthStore();
  const { searchQuery, setSearchQuery, searchPlaceholder, clearSearch } = useSearchStore();
  const logoutMutation = useLogout();

  // Clear search on route change to keep each page fresh
  useEffect(() => {
    clearSearch();
  }, [location.pathname, clearSearch]);

  // Contextual placeholder based on the active route/tab
  const getContextualPlaceholder = (pathname) => {
    const p = (pathname || '').toLowerCase();
    if (p.includes('/dashboard/orders')) return t('search.orders', 'Search for Orders...');
    if (p.includes('/dashboard/pos')) return t('search.items', 'Search for items...');
    if (p.includes('/dashboard/bar')) return t('search.drinks', 'Search for drinks...');
    if (p.includes('/dashboard/kitchen')) return t('search.kitchen', 'Search kitchen orders...');
    if (p.includes('/dashboard/reservations')) return t('search.reservations', 'Search reservations...');
    if (p.includes('/dashboard/customers')) return t('search.customers', 'Search customers...');
    if (p.includes('/dashboard/floorplan')) return t('search.floorPlan', 'Search tables & floors...');
    if (p.includes('/dashboard/tables') || p.includes('/dashboard/table')) return t('search.tables', 'Search tables...');
    if (p.includes('/dashboard/menuitems') || p.includes('/menu')) return t('search.menuItems', 'Search menu items...');
    if (p.includes('/dashboard/recipe')) return t('search.recipes', 'Search recipes...');
    if (p.includes('/dashboard/inventory')) return t('search.inventory', 'Search inventory...');
    if (p.includes('/dashboard/employee')) return t('search.employees', 'Search employees...');
    if (p.includes('/dashboard/feedback')) return t('search.feedback', 'Search feedback & reviews...');
    if (p.includes('/dashboard/promotions')) return t('search.promotions', 'Search promotions...');
    if (p.includes('/dashboard/loyalty')) return t('search.loyalty', 'Search loyalty programs...');
    if (p.includes('/dashboard/reports')) return t('search.reports', 'Search reports...');
    if (p.includes('/dashboard/invoice')) return t('search.invoices', 'Search invoices...');
    if (p.includes('/dashboard/settings')) return t('search.settings', 'Search settings...');
    if (p.includes('/dashboard/home')) return t('search.dashboard', 'Search dashboard...');

    if (searchPlaceholder && searchPlaceholder !== 'Search...') {
      return searchPlaceholder;
    }
    return t('header.search', 'Search...');
  };

  const contextualPlaceholder = getContextualPlaceholder(location.pathname);

  // Notifications API temporarily disabled as requested
  // useEffect(() => {
  //   fetchNotifications();
  // }, []);

  // Close menu and notification when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close sidebar on route change (only for mobile devices)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Map paths to labels for dynamic topbar
  const getNavTitle = (pathname) => {
    const pathToKey = {
      "/dashboard/home": 'navigation.dashboard',
      "/dashboard/pos": 'navigation.pos',
      "/dashboard/orders": 'navigation.orders',
      "/dashboard/kitchen": 'navigation.kitchen',
      "/dashboard/floorplan": 'navigation.floorPlan',
      "/dashboard/reservations": 'navigation.reservations',
      "/dashboard/customers": 'navigation.customers',
      "/dashboard/invoice": 'navigation.invoices',
      "/dashboard/tables": 'navigation.tables',
      "/dashboard/menuitems": 'navigation.menuItems',
      "/dashboard/menuitems/create": 'navigation.menuItems',
      "/dashboard/recipe": 'navigation.recipe',
      "/dashboard/inventory": 'navigation.inventory',
      "/dashboard/promotions": 'navigation.promotions',
      "/dashboard/loyalty": 'navigation.loyaltyPrograms',
      "/dashboard/feedback": 'navigation.feedback',
      "/dashboard/employee": 'navigation.employee',
      "/dashboard/reports": 'navigation.reports',
      "/dashboard/settings": 'navigation.settings',
    };
    const key = pathToKey[pathname];
    return key ? t(key) : t('navigation.dashboard');
  };

  const currentLabel = getNavTitle(location.pathname);

  const navGroups = [
    {
      heading: "",
      items: [
        { label: t('navigation.dashboard'), path: "/dashboard/home", image: home1 },
        { label: t('navigation.pos'), path: "/dashboard/pos", image: home },
        { label: t('navigation.orders'), path: "/dashboard/orders", image: fork },
        { label: t('navigation.kitchen'), path: "/dashboard/kitchen", image: chef },
        { label: t('navigation.floorPlan'), path: "/dashboard/floorplan", image: chair },
      ],
    },
    {
      heading: t('navigation.headings.offerings'),
      items: [
        { label: t('navigation.reservations'), path: "/dashboard/reservations", image: chair },
        { label: t('navigation.customers'), path: "/dashboard/customers", image: round },
        { label: t('navigation.invoices'), path: "/dashboard/invoice", image: bx },
      ],
    },
    {
      heading: t('navigation.headings.menuManagement'),
      items: [
        { label: t('navigation.tables'), path: "/dashboard/tables", image: chair },
        { label: t('navigation.menuItems'), path: "/dashboard/menuitems", image: book },
        { label: t('navigation.recipe'), path: "/dashboard/recipe", image: recipeIcon },
        { label: t('navigation.inventory'), path: "/dashboard/inventory", image: inventoryIcon },
      ],
    },
    {
      heading: t('navigation.headings.couponManagement'),
      items: [
        { label: t('navigation.promotions'), path: "/dashboard/promotions", image: promotionsBadge },
        { label: t('navigation.loyaltyPrograms'), path: "/dashboard/loyalty", image: loyaltyTag },
      ],
    },
    {
      heading: t('navigation.headings.backOffice'),
      items: [
        { label: t('navigation.feedback'), path: "/dashboard/feedback", image: three },
        { label: t('navigation.employee'), path: "/dashboard/employee", image: threes },
        { label: t('navigation.reports'), path: "/dashboard/reports", image: graph },
        { label: t('navigation.settings'), path: "/dashboard/settings", image: icon },
      ],
    },
  ];

  const handleNavItemClick = () => {
    clearSearch();
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        setSidebarOpen(false);
      }, 50);
    }
  };

  const isFullScreenRoute = [].some(path => location.pathname.startsWith(path));

  if (isFullScreenRoute) {
    return (
      <div className="flex h-screen bg-[#F5F1FA]">
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F1FA]">
      {/* Sidebar */}
      {/* <aside
        className={`w-64 min-h-screen  bg-gradient-to-b from-[#EFEAF9] to-[#FDE8E8] shadow-md flex flex-col transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:w-64 fixed z-20 lg:static`}
      > */}
      <aside
        className={`h-screen overflow-y-auto bg-gradient-to-b from-[#EFEAF9] to-[#FDE8E8] shadow-md flex flex-col shrink-0 transition-all duration-300 fixed z-20 lg:static ${sidebarOpen ? "translate-x-0 w-64 opacity-100" : "-translate-x-full w-0 opacity-0 overflow-hidden"
          }`}
      >

        <div className="p-3">
          <img src={logo} alt="TRIAXX Logo" className="h-20"/>
        </div>

        {/* <div className="px-6 mt-4 mb-6">
          <div className="flex items-center p-2 rounded-full space-x-3 w-full bg-[#E5D7DE] shadow-sm">
            <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-gray-200">
              <img src={vector} className="w-full h-full object-cover rounded-full" alt="" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden flex flex-col justify-center pb-0.5">
              <p className="text-[13px] font-bold text-gray-800 truncate font-poppins leading-tight">
                {user?.Name?.split(' ')[0] || 'Jack'}
              </p>
              <p className="text-[10px] text-gray-500 font-semibold truncate font-poppins leading-tight uppercase">
                {user?.Role ? (user.Role.toLowerCase() === 'admin' ? t('common.admin') : user.Role) : t('common.admin')}
              </p>
            </div>
          </div>
        </div> */}

        <nav
          aria-label={t('navigation.primary', 'Primary navigation')}
          aria-hidden={!sidebarOpen && window.innerWidth < 1024}
          className="flex-1 px-4 overflow-y-auto hide-scrollbar space-y-6 mt-2 font-poppins"
        >
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {group.heading && (
                <p className=" font-Manrope text-[12px] text-gray-500 font-semibold mt-4 px-2">
                  {group.heading}
                </p>
              )}
              {group.items.map((item) => {
                const isActive = ["/dashboard/floorplan", "/dashboard/reservations", "/dashboard/customers", "/dashboard/invoice", "/dashboard/employee", "/dashboard/menuitems"].includes(
                  item.path
                )
                  ? location.pathname.startsWith(item.path)
                  : location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleNavItemClick}
                    aria-current={isActive ? 'page' : undefined}
                    tabIndex={!sidebarOpen && window.innerWidth < 1024 ? -1 : 0}
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6A1B9A] focus-visible:ring-offset-2 ${isActive ? "text-white" : "text-black hover:bg-[#F3EAF9]"
                      }`}
                    style={
                      isActive
                        ? {
                          background: "linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)",
                        }
                        : {}
                    }
                  >
                    <span aria-hidden="true" className="mr-3 text-[18px] shrink-0">
                      <img
                        src={item.image}
                        alt=""
                        className={`w-5 h-5 ${isActive ? "filter invert" : ""}`}
                      />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Topbar */}

        <header className="relative bg-gradient-to-b from-brand-primary to-brand-secondary p-4 pt-10 shadow lg:hidden w-full flex items-center justify-between">
          {/* Menu Icon (Left) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white z-10 p-1"
          >
            <FaBars size={22} />
          </button>

          {/* Center Title */}
          <h2
            className="text-white text-lg font-semibold font-poppins truncate px-2 text-center flex-1"
          >
            {currentLabel}
          </h2>

          {/* Right Tools: Language & Bell */}
          <div className="flex items-center space-x-2 z-10">
            <LanguageSelector variant="header" />
            <div
              className="relative cursor-pointer text-white p-1"
              onClick={() => navigate('/notifications')}
            >
              <FaBell className="text-xl" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-[1px] rounded-full">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Search Input */}
        <div className="lg:hidden px-4 py-2 bg-white border-b border-gray-100 flex items-center shadow-xs">
          <div className="flex items-center w-full bg-[#FAEFF5] rounded-full px-3 py-1.5 border border-pink-200 focus-within:ring-1 focus-within:ring-pink-300">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={contextualPlaceholder}
              className="w-full bg-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 ml-2 font-bold text-xs"
              >
                ×
              </button>
            ) : (
              <Search className="text-gray-500 w-3.5 h-3.5 ml-2 flex-shrink-0" />
            )}
          </div>
        </div>


        {/* Desktop Topbar */}
        <header className="hidden lg:flex h-[80px] w-full items-center justify-between px-8 bg-white shadow-sm z-10 relative">
          {/* Left side: Search & Menu */}
          <div className="flex-1 max-w-[400px]">
            <div className="flex items-center w-full bg-[#FAEFF5] rounded-full px-4 py-2 border-2 border-pink-300 transition-shadow focus-within:ring-2 focus-within:ring-pink-400">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-700 hover:text-pink-600 focus:outline-none mr-3"
              >
                <Menu className="w-[18px] h-[18px]" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={contextualPlaceholder}
                className="search-input"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600 ml-2 font-bold text-base leading-none cursor-pointer"
                >
                  ×
                </button>
              ) : (
                <Search className="text-gray-700 w-[18px] h-[18px] ml-3" />
              )}
            </div>
          </div>

          {/* Right side: Tools */}
          <div className="flex items-center space-x-6">
            {/* Language Selector */}
            <div className="flex items-center bg-[#FAEFF5] rounded-full px-2 py-1 shadow-sm transition-colors hover:bg-[#F2E7EF]">
              <LanguageSelector variant="header" />
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <div
                className="relative cursor-pointer"
                onClick={() => setNotificationOpen(!notificationOpen)}
              >
                <FaBell className="w-6 h-6 text-gray-900" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#d32f2f] text-[10px] font-bold text-white border-2 border-white shadow-sm">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </div>

              {/* Notification Dropdown */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 py-2 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b">
                    <h3 className="font-semibold text-lg">{t('header.notifications')}</h3>
                  </div>
                  <div className="divide-y">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500 text-sm">
                        {t('header.noNotifications')}
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif, index) => {
                        const formatTime = (dateStr) => {
                          const date = new Date(dateStr);
                          const now = new Date();
                          const diffMs = now - date;
                          const diffMins = Math.floor(diffMs / 60000);
                          const diffHours = Math.floor(diffMs / 3600000);
                          const diffDays = Math.floor(diffMs / 86400000);

                          if (diffMins < 1) return 'Just now';
                          if (diffMins < 60) return `${diffMins} min ago`;
                          if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                          if (diffDays === 1) return 'Yesterday';
                          return `${diffDays} days ago`;
                        };

                        return (
                          <div
                            key={notif.Notifications_id}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setNotificationOpen(false);
                              navigate('/notifications');
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                                {notif.Notifications.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm line-clamp-1">{notif.Notifications}</p>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {notif.CreateBy?.Name ? `By ${notif.CreateBy.Name}` : 'System notification'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{formatTime(notif.CreateAt)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t">
                      <button
                        onClick={() => {
                          setNotificationOpen(false);
                          navigate('/notifications');
                        }}
                        className="text-sm text-purple-600 hover:text-purple-800 font-semibold w-full text-center"
                      >
                        {t('header.viewAllNotifications')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={menuRef}>
              <div
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center cursor-pointer bg-[#FAEFF5] rounded-full pr-4 p-1.5 shadow-sm transition-colors hover:bg-[#F2E7EF]"
              >
                <div className="w-8 h-8 rounded-full bg-black overflow-hidden flex-shrink-0 flex items-center justify-center text-white">
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="ml-3 text-[14px] font-semibold text-gray-900">
                  {user?.Name?.split(' ')[0] || 'User'}
                </span>
                <FaChevronDown className="w-3 h-3 text-gray-700 ml-3" />
              </div>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-2xl z-50 p-2 border border-gray-100 transition-all">
                  <DropdownItem
                    icon={<CircleUser className="w-5 h-5 text-gray-700" />}
                    label={t('header.profile')}
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/profile');
                    }}
                  />
                  <DropdownItem
                    icon={<MonitorSmartphone className="w-5 h-5 text-gray-700" />}
                    label={t('header.myDevices')}
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/my-devices');
                    }}
                  />
                  <DropdownItem
                    icon={<Languages className="w-5 h-5 text-gray-700" />}
                    label={t('header.languages')}
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/language');
                    }}
                  />
                  <DropdownItem
                    icon={<UserPlus className="w-5 h-5 text-gray-700" />}
                    label={t('header.createEmployee')}
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/dashboard/employee/create');
                    }}
                  />
                  <DropdownItem
                    icon={<LifeBuoy className="w-5 h-5 text-gray-700" />}
                    label={t('header.support')}
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/support');
                    }}
                  />
                  <DropdownItem
                    icon={<LogOut className="w-5 h-5 text-[#E53935]" />}
                    label={t('header.logout')}
                    className="text-[#E53935] hover:bg-red-50 hover:text-[#D32F2F]"
                    onClick={async () => {
                      setProfileOpen(false);
                      try {
                        setLoading(true);
                        await logoutMutation.mutateAsync();
                        logout();
                        toast.success(t('toast.saveSuccess'));
                        navigate('/signin');
                      } catch (error) {
                        console.error('Logout error:', error);
                        logout();
                        navigate('/signin');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Routed Content */}
        <main className="flex-1 overflow-y-auto hide-scrollbar scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;