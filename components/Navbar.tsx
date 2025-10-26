import React, { useState } from 'react';
import { Language, Theme, View } from '../types';
import { useLocalization } from '../constants';
import { AppIcon, GlobeIcon, SunIcon, MoonIcon, MicIcon, HamburgerIcon, CloseIcon } from './Icons';

interface NavbarProps {
  language: Language;
  toggleLanguage: () => void;
  theme: Theme;
  toggleTheme: () => void;
  view: View;
  setView: (view: View) => void;
  onLogout: () => void;
  onChatbotToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ language, toggleLanguage, theme, toggleTheme, view, setView, onLogout, onChatbotToggle }) => {
  const t = useLocalization(language);
  const isLoggedIn = view === 'farmerDashboard' || view === 'authorityDashboard';
  const dashboardTitle = view === 'farmerDashboard' ? t('farmerDashboard') : t('authorityDashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileLinkClick = (targetView: View) => {
    setView(targetView);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-md p-3 sticky top-0 z-50 flex justify-between items-center transition-colors duration-300">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
        <AppIcon className="w-10 h-10" />
        <div>
          <h1 className="text-xl font-bold text-blue-800 dark:text-blue-300">{t('appName')}</h1>
          {isLoggedIn && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{dashboardTitle}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        {!isLoggedIn && (
          <div className="hidden md:flex items-center gap-4">
             <NavLink onClick={() => setView('home')} active={view === 'home'}>{t('home')}</NavLink>
             <NavLink onClick={() => setView('farmerLogin')} active={view === 'farmerLogin'}>{t('farmerLogin')}</NavLink>
             <NavLink onClick={() => setView('authorityLogin')} active={view === 'authorityLogin'}>{t('authorityLogin')}</NavLink>
          </div>
        )}
        
        <IconButton onClick={toggleLanguage} aria-label={t('language')}>
          <GlobeIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </IconButton>

        <IconButton onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <MoonIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" /> : <SunIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />}
        </IconButton>
        
        <button
            onClick={onChatbotToggle}
            className="px-3 py-2 bg-blue-600 text-white font-semibold rounded-full shadow-sm hover:bg-blue-700 transition-all flex items-center gap-2"
        >
            <MicIcon className="w-5 h-5"/>
            <span className="hidden md:inline">{t('aiChatbot')}</span>
        </button>

        {isLoggedIn && (
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-sm hover:bg-red-600 transition-colors"
          >
            {t('logout')}
          </button>
        )}

        {!isLoggedIn && (
           <div className="md:hidden">
              <IconButton onClick={() => setIsMobileMenuOpen(p => !p)} aria-label="Open menu">
                {isMobileMenuOpen 
                    ? <CloseIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" /> 
                    : <HamburgerIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />}
              </IconButton>
           </div>
        )}
      </div>

      {isMobileMenuOpen && !isLoggedIn && (
        <div className="absolute top-full left-0 w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg md:hidden animate-fade-in-down z-40">
          <div className="flex flex-col items-center gap-4 p-4">
             <NavLink onClick={() => handleMobileLinkClick('home')} active={view === 'home'}>{t('home')}</NavLink>
             <NavLink onClick={() => handleMobileLinkClick('farmerLogin')} active={view === 'farmerLogin'}>{t('farmerLogin')}</NavLink>
             <NavLink onClick={() => handleMobileLinkClick('authorityLogin')} active={view === 'authorityLogin'}>{t('authorityLogin')}</NavLink>
          </div>
        </div>
      )}
    </header>
  );
};

const NavLink: React.FC<{onClick: ()=>void, active: boolean, children: React.ReactNode}> = ({onClick, active, children}) => (
    <button
        onClick={onClick}
        className={`font-semibold transition-colors duration-200 px-2 py-1 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
    >
        {children}
    </button>
);

const IconButton: React.FC<{onClick: ()=>void, 'aria-label': string, children: React.ReactNode}> = ({onClick, 'aria-label': ariaLabel, children}) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    >
        {children}
    </button>
)

export default Navbar;