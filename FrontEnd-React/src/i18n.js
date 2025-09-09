// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importiere die Übersetzungen direkt
import enTranslations from './translations/en.json';
import deTranslations from './translations/de.json';

i18n
  .use(initReactI18next)
  .init({
    // Statische Ressourcen statt HTTP-Backend
    resources: {
      en: {
        translation: enTranslations
      },
      de: {
        translation: deTranslations
      }
    },
    lng: 'de', // Standard-Sprache
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false,
    },
    
    // Optional: Debug für Entwicklung
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n;