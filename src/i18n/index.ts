import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Vietnamese translations (Default)
import viCommon from '../locales/vi/common.json';
import viSidebar from '../locales/vi/sidebar.json';
import viHeader from '../locales/vi/header.json';
import viTable from '../locales/vi/table.json';
import viAdmin from '../locales/vi/admin.json';

// English translations
import enCommon from '../locales/en/common.json';
import enSidebar from '../locales/en/sidebar.json';
import enHeader from '../locales/en/header.json';
import enTable from '../locales/en/table.json';
import enAdmin from '../locales/en/admin.json';

export const defaultNS = 'common';

export const resources = {
  vi: {
    common: viCommon,
    sidebar: viSidebar,
    header: viHeader,
    table: viTable,
    admin: viAdmin,
  },
  en: {
    common: enCommon,
    sidebar: enSidebar,
    header: enHeader,
    table: enTable,
    admin: enAdmin,
  },
} as const;

// Get initial language from localStorage or fallback to 'vi'
const getSavedLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('nexora_language');
    if (saved && (saved === 'en' || saved === 'vi')) {
      return saved;
    }
  }
  return 'vi'; // Vietnamese as default
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getSavedLanguage(),
    fallbackLng: 'vi',
    defaultNS,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
