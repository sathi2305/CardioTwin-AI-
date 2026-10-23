import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { TRANSLATIONS } from './i18n/translations';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', locale: 'en-US' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', locale: 'ta-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', locale: 'hi-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', locale: 'ml-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', locale: 'te-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', locale: 'kn-IN' },
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['code'];

const savedLanguage = (typeof window !== 'undefined' 
  ? localStorage.getItem('cardiotwin_language_preference') || 'en' 
  : 'en') as SupportedLanguage;

const resources = {
  en: { translation: TRANSLATIONS.en },
  ta: { translation: TRANSLATIONS.ta },
  hi: { translation: TRANSLATIONS.hi },
  ml: { translation: TRANSLATIONS.ml },
  te: { translation: TRANSLATIONS.te },
  kn: { translation: TRANSLATIONS.kn },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already protects against XSS
    },
  });

// Synchronize document attributes on language change
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
    document.documentElement.setAttribute('data-language', lng);
    try {
      localStorage.setItem('cardiotwin_language_preference', lng);
    } catch (_) {}
  }
});

// Initial attribute setup
if (typeof document !== 'undefined') {
  document.documentElement.lang = savedLanguage;
  document.documentElement.setAttribute('data-language', savedLanguage);
}

export default i18n;
