import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, LanguageInfo, TranslationDictionary } from '../i18n/types';
import { TRANSLATIONS } from '../i18n/translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  languages: LanguageInfo[];
  currentLanguageInfo: LanguageInfo;
  t: (key: string, fallback?: string) => string;
  formatNumber: (val: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatPercent: (val: number, decimals?: number) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'cardiotwin_language_preference';

import i18n from '../i18n';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return (i18n.language as SupportedLanguage) || 'en';
  });

  const currentLanguageInfo = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  // Keep state synchronized with i18n instance
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setLanguageState(lng as SupportedLanguage);
      document.documentElement.lang = lng;
      document.documentElement.setAttribute('data-language', lng);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    i18n.changeLanguage(newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch (_) {}
  };

  // Translation lookup with English fallback
  const t = (key: string, fallback?: string): string => {
    const activeDict = TRANSLATIONS[language];
    if (activeDict && (activeDict as any)[key]) {
      return (activeDict as any)[key];
    }
    // Fallback to English
    const enDict = TRANSLATIONS['en'];
    if (enDict && (enDict as any)[key]) {
      return (enDict as any)[key];
    }
    return fallback || key;
  };

  const formatNumber = (val: number, options?: Intl.NumberFormatOptions): string => {
    try {
      return new Intl.NumberFormat(currentLanguageInfo.locale, options).format(val);
    } catch (_) {
      return String(val);
    }
  };

  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      const defaultOptions: Intl.DateTimeFormatOptions = options || {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return new Intl.DateTimeFormat(currentLanguageInfo.locale, defaultOptions).format(d);
    } catch (_) {
      return String(date);
    }
  };

  const formatPercent = (val: number, decimals: number = 1): string => {
    try {
      return `${new Intl.NumberFormat(currentLanguageInfo.locale, {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      }).format(val)}%`;
    } catch (_) {
      return `${val.toFixed(decimals)}%`;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        languages: SUPPORTED_LANGUAGES,
        currentLanguageInfo,
        t,
        formatNumber,
        formatDate,
        formatPercent,
        isRtl: false,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
