import React from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ 
    value, 
    onChange, 
    onSearch, 
    placeholder = 'Search...', 
    showButton = false, 
    buttonText = 'Search', 
    className = '' 
}) => {
    return (
        <div className={`flex items-center gap-3 w-full lg:w-auto h-9 ${className}`}>
            <div className="bg-gradient-light flex items-center rounded-lg px-3 h-full min-w-[200px] flex-1 lg:flex-none">
                <input 
                    type="text" 
                    placeholder={placeholder} 
                    value={value} 
                    onChange={onChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && onSearch) {
                            onSearch();
                        }
                    }}
                    className="text-sm w-full outline-none bg-transparent text-gray-700 h-full" 
                />
                <FiSearch className="text-gray-600 shrink-0 text-lg ml-2" />
            </div>
            {showButton && (
                <button 
                    onClick={onSearch}
                    className="bg-gradient-primary px-5 h-full flex items-center justify-center text-sm font-medium text-white rounded-lg whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity">
                    {buttonText}
                </button>
            )}
        </div>
    );
};

export default SearchBar;
