import React, { useState, useRef, useEffect } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';

const Dropdown = ({
    options = [],
    value = null,
    onChange,
    onOpenChange,
    placeholder = 'Select...',
    displayKey = 'label',
    ariaLabel = 'Dropdown',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef(null);

    const handleOpenChange = (open) => {
        setIsOpen(open);
        if (onOpenChange) {
            onOpenChange(open);
        }
    };

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                handleOpenChange(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Reset highlighted index when opened
    useEffect(() => {
        if (isOpen) {
            const currentIndex = options.indexOf(value);
            setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
        }
    }, [isOpen, value, options]);

    // Helper to get display text
    const getDisplayText = (opt) => {
        if (!opt) return placeholder;
        if (typeof displayKey === 'function') {
            try {
                return displayKey(opt) || placeholder;
            } catch (err) {
                console.warn('Dropdown displayKey error:', err);
                return opt?.name || opt?.table_name || opt?.['Table-code'] || opt?.['Table-name'] || placeholder;
            }
        }
        return opt[displayKey] || String(opt);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!isOpen) {
                handleOpenChange(true);
            } else {
                setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (isOpen) {
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (isOpen && highlightedIndex >= 0 && highlightedIndex < options.length) {
                onChange(options[highlightedIndex]);
                handleOpenChange(false);
            } else if (!isOpen) {
                handleOpenChange(true);
            }
        } else if (e.key === 'Escape') {
            handleOpenChange(false);
            // Optionally return focus to the trigger
            if (dropdownRef.current) {
                dropdownRef.current.querySelector('[role="combobox"]').focus();
            }
        } else if (e.key === 'Tab' && isOpen) {
            handleOpenChange(false);
        }
    };

    const selectedOptionText = value ? getDisplayText(value) : placeholder;

    return (
        <div 
            className={`relative w-full ${className}`} 
            ref={dropdownRef}
        >
            <div
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label={ariaLabel}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onClick={() => handleOpenChange(!isOpen)}
                className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[#6A1B9A1A] to-[#D32F2F1A] rounded-lg cursor-pointer text-sm font-manrope font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
                <span className="truncate">{selectedOptionText}</span>
                <MdKeyboardArrowDown 
                    size={20} 
                    className={`transition-transform duration-200 text-gray-700 ${isOpen ? 'rotate-180' : ''}`} 
                />
            </div>

            {isOpen && (
                <ul
                    role="listbox"
                    className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
                >
                    {options.length > 0 ? (
                        options.map((option, index) => {
                            const isSelected = value === option;
                            const isHighlighted = highlightedIndex === index;
                            
                            return (
                                <li
                                    key={index}
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => {
                                        onChange(option);
                                        handleOpenChange(false);
                                    }}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    className={`px-4 py-2 cursor-pointer text-sm font-manrope transition-colors ${
                                        isSelected ? 'bg-purple-50 text-[#A62673] font-medium' : 
                                        isHighlighted ? 'bg-gray-100 text-gray-900' : 
                                        'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {getDisplayText(option)}
                                </li>
                            );
                        })
                    ) : (
                        <li className="px-4 py-3 text-sm text-gray-500 font-manrope">
                            No options available
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default Dropdown;
