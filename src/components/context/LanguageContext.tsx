'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import kh from '@/locales/kh.json';
import en from '@/locales/en.json';

// Define supported languages
type LanguageCode = 'kh' | 'en';

// Type for your translations
type Translations = typeof kh;

const translations: Record<LanguageCode, Translations> = { kh, en };
console.log(translations);

type LanguageContextType = {
  language: LanguageCode;   
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);


export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>('kh');

  // Load language from localStorage on first render
  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'kh' || savedLang === 'en') {
      setLanguageState(savedLang);
    }
  }, []);

  // Save language to localStorage 
  const setLanguage = (lang: LanguageCode) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};