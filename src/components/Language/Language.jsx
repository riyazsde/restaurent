import React, { useState, useEffect } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { useLanguages } from '../../hooks/queries/useLanguage';
import useAuthStore from '../../store/authStore';
import useLanguageStore from '../../store/languageStore';
import useTranslatedToast from '../../hooks/useTranslatedToast';
import Loader from '../common/Loader';

// Determine language code from name
const getLanguageCode = (languageName) => {
  if (!languageName) return 'fr';
  const name = languageName.toLowerCase().trim();
  if (name.includes('french') || name.includes('français') || name === 'fr') {
    return 'fr';
  }
  if (name.includes('english') || name.includes('anglais') || name === 'en') {
    return 'en';
  }
  return 'fr'; // Default to French
};

const Language = () => {
  const { t } = useTranslation('common');
  const toast = useTranslatedToast();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useAuthStore();
  const { changeLanguage, isChanging, currentLanguageId, currentLanguage } = useLanguageStore();

  const { data: languages = [], isLoading } = useLanguages();

  useEffect(() => {
    if (languages.length > 0) {
      if (user && user.Language_id) {
        const userLangId = typeof user.Language_id === 'object' ? user.Language_id.Language_id : user.Language_id;
        const userLanguage = languages.find(lang => lang.Language_id === userLangId);
        if (userLanguage) {
          setSelectedLanguage(userLanguage);
          return;
        }
      }
      const activeLanguage = languages.find(lang => 
        (currentLanguageId && lang.Language_id === currentLanguageId) ||
        getLanguageCode(lang.Language_name) === currentLanguage
      );
      if (activeLanguage) {
        setSelectedLanguage(activeLanguage);
      } else if (languages.length > 0) {
        setSelectedLanguage(languages[0]);
      }
    }
  }, [currentLanguageId, currentLanguage, languages, user]);

  const handleLanguageSelect = async (language) => {
    setSelectedLanguage(language);
    setIsDropdownOpen(false);

    // Don't change if already selected
    if (language.Language_id === currentLanguageId && getLanguageCode(language.Language_name) === currentLanguage) {
      return;
    }

    const languageCode = language.Language_code || getLanguageCode(language.Language_name);

    const result = await changeLanguage(language.Language_id, languageCode);

    if (result.success) {
      toast.success('toast.languageUpdateSuccess');
    } else {
      toast.error('toast.languageUpdateError');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6 sm:p-8" style={{ fontFamily: 'Poppins' }}>
        <h1 className="text-2xl sm:text-[32px] font-bold text-black mb-8">
          {t('labels.language', 'Language')}
        </h1>
        <Loader text={t('messages.loading')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 sm:p-8" style={{ fontFamily: 'Poppins' }}>
      {/* Page Title */}
      <h1 className="text-2xl sm:text-[32px] font-bold text-black mb-10">
        {t('labels.language', 'Language')}
      </h1>

      {/* Content Container */}
      <div className="flex justify-center pt-4">
        <div className="w-full max-w-[440px]">
          {/* Change Language Card */}
          <div className="bg-white border border-gray-300 rounded-[24px] p-8 shadow-xs text-left">
            <h2 className="text-[18px] font-bold text-black mb-6">
              {t('common.changeLanguage', 'change Language')}
            </h2>

            {/* Language Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={isChanging}
                className="w-full px-6 py-2.5 bg-white border border-[#CE93D8] hover:border-[#8E24AA] rounded-full flex items-center justify-between text-left transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
              >
                <span className="text-sm font-medium text-gray-800">
                  {isChanging ? t('messages.loading') : (selectedLanguage?.Language_name || t('common.selectLanguage'))}
                </span>
                <MdKeyboardArrowDown className={`text-xl text-[#8E24AA] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && !isChanging && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden py-1">
                  {languages.map((language) => (
                    <div
                      key={language.Language_id}
                      onClick={() => handleLanguageSelect(language)}
                      className="language-option px-5 py-3 cursor-pointer transition-all duration-200 text-sm font-medium text-gray-800 hover:bg-gradient-to-r hover:from-[#6A1B9A] hover:to-[#D32F2F] hover:text-white"
                    >
                      {language.Language_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for gradient hover effect */}
      <style>{`
        .language-option {
          position: relative;
          color: #000;
          background: white;
        }

        .language-option:hover {
          background: linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%);
          color: white;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default Language;
