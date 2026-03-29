import React from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = ['en', 'ar', 'fr'];

const LanguageSwitcher = ({ className = '' }) => {
  const { i18n } = useTranslation();

  return (
    <div className={`bg-pepe-black/10 p-1 rounded-xl border-2 border-pepe-black/20 ${className}`}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          onClick={() => i18n.changeLanguage(lang)}
          className={`px-2 md:px-3 py-1 rounded-lg text-[10px] md:text-xs font-black uppercase transition-all ${i18n.language === lang ? 'bg-pepe-pink text-white shadow-md' : 'text-pepe-black/60 hover:text-pepe-black'}`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
