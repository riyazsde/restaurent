import { create } from 'zustand';
import i18n from '../i18n/config';
import languageService from '../services/languageService';

// SINGLE source of truth
const LANGUAGE_STORAGE_KEY = 'app_language';
const SUPPORTED_LANGUAGES = ['fr', 'en'];
const DEFAULT_LANGUAGE = 'fr';

const LANG_ID_MAP = { fr: 1, en: 2 };
const ID_LANG_MAP = { 1: 'fr', 2: 'en' };

const getSavedLanguage = () => {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(saved) ? saved : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

const persistLanguage = (code) => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    // Optional: Clean up the old key if it exists to prevent future confusion
    localStorage.removeItem('user_selected_language'); 
  } catch (e) {
    console.warn('Failed to persist language:', e);
  }
};

const useLanguageStore = create((set) => {
  const initialCode = getSavedLanguage();

  return {
    currentLanguage: initialCode,
    currentLanguageId: LANG_ID_MAP[initialCode],
    isChanging: false,
    error: null,
    availableLanguages: [],

    initLanguage: async () => {
      const code = getSavedLanguage();
      set({ currentLanguage: code, currentLanguageId: LANG_ID_MAP[code] });
      persistLanguage(code);
      await i18n.changeLanguage(code);
    },

    changeLanguage: async (languageId, languageCode) => {
      // Resolve the code (accept either code or id)
      const code =
        SUPPORTED_LANGUAGES.includes(languageCode)
          ? languageCode
          : ID_LANG_MAP[languageId] || DEFAULT_LANGUAGE;

      const resolvedId = LANG_ID_MAP[code];

      // 1. Persist to localStorage immediately
      persistLanguage(code);

      set({ isChanging: true, error: null });

      try {
        set({
          currentLanguage: code,
          currentLanguageId: resolvedId,
          isChanging: false,
        });
        await i18n.changeLanguage(code);
        return { success: true };
      } catch (error) {
        set({
          error: error.message || 'Failed to change language',
          isChanging: false,
        });
        return { success: false, error: error.message };
      }
    },

    setLanguageFromLogin: async () => {
      const code = getSavedLanguage();
      set({ currentLanguage: code, currentLanguageId: LANG_ID_MAP[code] });
      persistLanguage(code);
      await i18n.changeLanguage(code);
    },

    setLanguageForAuth: async (languageCode) => {
      const code = SUPPORTED_LANGUAGES.includes(languageCode)
        ? languageCode
        : DEFAULT_LANGUAGE;
      persistLanguage(code);
      set({ currentLanguage: code, currentLanguageId: LANG_ID_MAP[code] });
      await i18n.changeLanguage(code);
    },

    fetchAvailableLanguages: async () => {
      try {
        const response = await languageService.getAllLanguages();
        if (response.success) {
          set({ availableLanguages: response.data });
        }
      } catch (error) {
        console.error('Error fetching languages:', error);
      }
    },

    clearError: () => set({ error: null }),
  };
});

export default useLanguageStore;