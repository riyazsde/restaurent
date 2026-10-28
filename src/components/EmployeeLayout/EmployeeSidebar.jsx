import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    Utensils, 
    Grid, 
    ClipboardList, 
    Calendar,
    GraduationCap,
    MessageSquare,
    CheckSquare,
    TrendingUp,
    Clock,
    Settings,
    LogOut
} from 'lucide-react';
import logo from '../assets/logo.svg';
import useAuthStore from '../../store/authStore';

const EmployeeSidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const { t } = useTranslation('common');
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    const navItems = [
        { path: '/employee/quick-order', label: t('employeeSidebar.quickOrder'), icon: Utensils, isPrimary: true },
        { path: '/employee/table', label: t('navigation.tables'), icon: Grid, isPrimary: true },
        { path: '/employee/order-history', label: t('navigation.orders'), icon: ClipboardList, isPrimary: true },
        { path: '/employee/reservations', label: t('navigation.reservations'), icon: Calendar, isPrimary: true },
    ];

    const trainingItems = [
        { path: '/employee/training', label: t('employeeSidebar.training'), icon: GraduationCap },
        { path: '/employee/team-chats', label: t('employeeSidebar.teamChats'), icon: MessageSquare },
        { path: '/employee/attendance', label: t('employeeSidebar.attendance'), icon: CheckSquare },
        { path: '/employee/sales-performance', label: t('employeeSidebar.salesPerformance'), icon: TrendingUp },
        { path: '/employee/work-shifts', label: t('employeeSidebar.workShifts'), icon: Clock },
    ];

    const NavItem = ({ item }) => (
        <NavLink
            to={item.path}
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) => `
                flex items-center px-4 py-3 mb-2 rounded-full transition-all duration-300
                ${isActive 
                    ? 'text-white bg-gradient-to-r from-[#8e24aa] to-[#d32f2f] font-semibold shadow-md' 
                    : 'text-gray-800 hover:bg-pink-50 hover:text-[#8e24aa] font-semibold'
                }
            `}
        >
            <item.icon className={`w-5 h-5 mr-4 ${item.label === 'Quick order' && !window.location.pathname.includes('/quick-order') ? 'text-gray-800' : ''}`} />
            <span className="text-[15px]">{item.label}</span>
        </NavLink>
    );

    return (
        <div className={`${isSidebarOpen ? 'translate-x-0 w-[280px] opacity-100' : '-translate-x-full w-0 opacity-0 overflow-hidden'} fixed md:static inset-y-0 left-0 z-50 h-full flex flex-col bg-gradient-to-b from-[#faf5fa] to-[#fff5f7] border-r border-pink-50 font-sans shadow-sm transition-all duration-300 ease-in-out`}>
            {/* Logo */}
            <div className="p-8 pb-4 flex items-center">
                <img src={logo} alt="Triaxx Logo" className="h-8" />
            </div>

            {/* User Profile Snippet */}
            <div className="px-6 mb-8 mt-2">
                <div className="bg-[#f2e7ef] rounded-full p-2 pr-4 flex items-center shadow-sm w-max">
                    <div className="w-10 h-10 rounded-full bg-black overflow-hidden flex-shrink-0 flex items-center justify-center text-white">
                        {user?.avatar ? (
                            <img 
                                src={user.avatar} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        )}
                    </div>
                    <div className="ml-3 overflow-hidden pr-2">
                        <h4 className="text-[15px] font-semibold text-gray-900 leading-tight">
                            {user?.name || 'Jackline'}
                        </h4>
                        <p className="text-[12px] text-gray-500 font-medium">Staff</p>
                    </div>
                </div>
            </div>

            {/* Navigation Scroll Area */}
            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                {/* Primary Nav */}
                <div className="mb-6">
                    {navItems.map((item, idx) => (
                        <NavItem key={idx} item={item} />
                    ))}
                </div>

                {/* Training Section */}
                <div className="mb-6">
                    <h5 className="text-[12px] text-gray-400 font-semibold mb-3 px-4 uppercase tracking-wider">
                        {t('employeeSidebar.training')}
                    </h5>
                    {trainingItems.map((item, idx) => (
                        <NavItem key={idx} item={item} />
                    ))}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 mt-auto border-t border-pink-100">
                <NavLink
                    to="/employee/settings"
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) => `
                        flex items-center px-4 py-3 mb-2 rounded-full transition-all duration-300
                        ${isActive 
                            ? 'text-[#6A1B9A] bg-pink-50 font-semibold' 
                            : 'text-[#414D60] hover:bg-pink-50 hover:text-[#6A1B9A] font-medium'
                        }
                    `}
                >
                    <Settings className="w-5 h-5 mr-3" />
                    <span className="text-[15px]">{t('navigation.settings')}</span>
                </NavLink>

                <button
                    onClick={() => {
                        setIsSidebarOpen(false);
                        handleLogout();
                    }}
                    className="w-full flex items-center px-4 py-3 rounded-full text-[#414D60] hover:bg-pink-50 hover:text-[#D32F2F] transition-all duration-300 font-medium"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="text-[15px]">{t('header.logout')}</span>
                </button>
            </div>
        </div>
    );
};

export default EmployeeSidebar;
