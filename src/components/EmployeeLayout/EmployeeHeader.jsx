import React from 'react';
import { Search, Bell, Menu, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/authStore';
import LanguageSelector from '../LanguageSelector/LanguageSelector';

const EmployeeHeader = ({ toggleSidebar }) => {
    const { t } = useTranslation('common');
    const { user } = useAuthStore();

    return (
        <div className="h-[80px] w-full flex items-center justify-between px-8 bg-white font-sans">
            {/* Left side: Search & Menu */}
            <div className="flex-1 max-w-[400px]">
                <div className="flex items-center w-full bg-[#FAEFF5] rounded-full px-4 py-2 border-2 border-pink-300 transition-shadow focus-within:ring-2 focus-within:ring-pink-400">
                    <button 
                        onClick={toggleSidebar}
                        className="text-gray-700 hover:text-pink-600 focus:outline-none mr-3"
                    >
                        <Menu className="w-[18px] h-[18px]" />
                    </button>
                    <input 
                        type="text" 
                        placeholder={t('header.search')} 
                        className="search-input"
                    />
                    <Search className="text-gray-700 w-[18px] h-[18px] ml-3" />
                </div>
            </div>

            {/* Right side: Tools */}
            <div className="flex items-center space-x-6">
                {/* Language Selector */}
                <div className="flex items-center bg-[#FAEFF5] rounded-full px-2 py-1 shadow-sm transition-colors hover:bg-[#F2E7EF]">
                    <LanguageSelector variant="header" />
                </div>

                {/* Notifications */}
                <div className="relative cursor-pointer">
                    <Bell className="w-6 h-6 text-gray-900" />
                    <span className="absolute -top-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#d32f2f] text-[10px] font-bold text-white border-2 border-white shadow-sm">
                        3
                    </span>
                </div>

                {/* Profile */}
                <div className="flex items-center cursor-pointer bg-[#FAEFF5] rounded-full pr-4 p-1.5 shadow-sm transition-colors hover:bg-[#F2E7EF]">
                    <div className="w-8 h-8 rounded-full bg-black overflow-hidden flex-shrink-0 flex items-center justify-center text-white">
                        {user?.avatar ? (
                            <img 
                                src={user.avatar} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        )}
                    </div>
                    <span className="ml-3 text-[14px] font-semibold text-gray-900">
                        {user?.name || 'Jack'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-700 ml-3" strokeWidth={3} />
                </div>
            </div>
        </div>
    );
};

export default EmployeeHeader;
