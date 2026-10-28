import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import useLanguageStore from '../../store/languageStore';
import { useLanguages } from '../../hooks/queries/useLanguage';
import useTranslatedToast from '../../hooks/useTranslatedToast';

const LanguageSelector = ({ variant = 'header', className = '' }) => {
  const { t } = useTranslation('common');
  const toast = useTranslatedToast();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { 
    currentLanguage, 
    currentLanguageId,
    isChanging, 
    changeLanguage 
  } = useLanguageStore();

  const { data: languages = [] } = useLanguages();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to get language code from name
  const getLanguageCodeFromName = (languageName) => {
    if (!languageName) return 'fr';
    const name = languageName.toLowerCase().trim();
    if (name.includes('french') || name.includes('français') || name === 'fr') {
      return 'fr';
    }
    if (name.includes('english') || name.includes('anglais') || name === 'en') {
      return 'en';
    }
    return 'fr';
  };

  const getLanguageDisplayName = (language) => {
    const code = typeof language === 'string'
      ? language
      : (language.Language_code || getLanguageCodeFromName(language.Language_name));
    if (code === 'fr') return 'Français';
    if (code === 'en') return 'English';
    return language.Language_name || code;
  };

  const handleLanguageSelect = async (language) => {
    setIsOpen(false);
    
    const languageCode = language.Language_code || getLanguageCodeFromName(language.Language_name);
    
    // Don't change if already selected
    if (languageCode === currentLanguage && language.Language_id === currentLanguageId) {
      return;
    }

    const result = await changeLanguage(language.Language_id, languageCode);
    
    if (result.success) {
      toast.success('toast.languageUpdateSuccess');
    } else {
      toast.error('toast.languageUpdateError');
    }
  };

  // Get current language display name
  const getCurrentLanguageName = () => {
    if (currentLanguage === 'fr') return 'Français';
    if (currentLanguage === 'en') return 'English';
    const currentLang = languages.find(lang => lang.Language_id === currentLanguageId);
    return currentLang ? getLanguageDisplayName(currentLang) : 'Français';
  };

  // Get flag for language
  const getLanguageFlag = (languageCode) => {
    const flags = {
      'en': 'https://flagcdn.com/gb.svg',
      'fr': 'https://flagcdn.com/fr.svg'
    };
    return flags[languageCode] || flags['fr'];
  };

  const defaultLanguages = [
    { Language_id: 1, Language_name: 'French', Language_code: 'fr' },
    { Language_id: 2, Language_name: 'English', Language_code: 'en' }
  ];
  const activeLanguages = languages.length > 0 ? languages : defaultLanguages;
  const sortedLanguages = [...activeLanguages].sort((a, b) => {
    const codeA = a.Language_code || getLanguageCodeFromName(a.Language_name);
    const codeB = b.Language_code || getLanguageCodeFromName(b.Language_name);
    if (codeA === 'fr') return -1;
    if (codeB === 'fr') return 1;
    return 0;
  });

  // Header variant styling
  if (variant === 'header') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isChanging}
          className="flex items-center px-4 py-1 rounded-full space-x-2 text-sm cursor-pointer transition-colors disabled:opacity-50"
          style={{
            background: "linear-gradient(180deg, #F3EBFC 0%, #FCE7E9 100%)",
            fontFamily: 'Manrope'
          }}
        >
          <span className="font-medium">
            {isChanging ? t('messages.loading') : getCurrentLanguageName()}
          </span>
          <img 
            src={getLanguageFlag(currentLanguage)} 
            alt={currentLanguage} 
            className="w-5 h-3" 
          />
          <FaChevronDown className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && !isChanging && (
          <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50 py-2 border border-gray-200">
            {sortedLanguages.map((language) => {
              const languageCode = language.Language_code || getLanguageCodeFromName(language.Language_name);
              const isSelected = languageCode === currentLanguage;
              
              return (
                <div
                  key={language.Language_id}
                  onClick={() => handleLanguageSelect(language)}
                  className={`flex items-center justify-between px-4 py-2 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white' 
                      : 'hover:bg-gray-100'
                  }`}
                  style={{ fontFamily: 'Manrope' }}
                >
                  <span className="font-medium">{getLanguageDisplayName(language)}</span>
                  <img 
                    src={getLanguageFlag(languageCode)} 
                    alt={language.Language_name} 
                    className="w-5 h-3" 
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Auth variant styling (simpler, for login/register pages)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className="flex  text-black items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors disabled:opacity-50"
        style={{ fontFamily: 'Manrope' }}
      >
        <img 
          src={getLanguageFlag(currentLanguage)} 
          alt={currentLanguage} 
          className="w-5 h-3" 
        />
        <span className="text-sm font-medium">
          {isChanging ? t('messages.loading') : getCurrentLanguageName()}
        </span>
        <FaChevronDown className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !isChanging && (
        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg z-50 py-1 border border-gray-200">
          {sortedLanguages.map((language) => {
            const languageCode = language.Language_code || getLanguageCodeFromName(language.Language_name);
            const isSelected = languageCode === currentLanguage;
            
            return (
              <div
                key={language.Language_id}
                onClick={() => handleLanguageSelect(language)}
                className={`flex items-center text-black justify-between px-3 py-2 cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-purple-100 ' 
                    : 'hover:bg-gray-50 '
                }`}
                style={{ fontFamily: 'Manrope' }}
              >
                <span className="text-sm">{getLanguageDisplayName(language)}</span>
                <img 
                  src={getLanguageFlag(languageCode)} 
                  alt={language.Language_name} 
                  className="w-4 h-3" 
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
