import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './translations/en.json';
import pt from './translations/pt.json';

const resources = {
  en: {
    translation: en
  },
  pt: {
    translation: pt
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language, will be updated by SettingsContext
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
