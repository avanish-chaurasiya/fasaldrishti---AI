import React, { useState, useCallback, useEffect } from 'react';
import { Language, UserType, Theme, View } from './types';
import Navbar from './components/Navbar';
import HomeScreen from './components/HomeScreen';
import LoginScreen from './components/LoginScreen';
import FarmerDashboard from './components/FarmerDashboard';
import AuthorityDashboard from './components/AuthorityDashboard';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [userType, setUserType] = useState<UserType>('guest');
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLogin = useCallback((type: UserType) => {
    setUserType(type);
    setView(type === 'farmer' ? 'farmerDashboard' : 'authorityDashboard');
  }, []);

  const handleLogout = useCallback(() => {
    setUserType('guest');
    setView('home');
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  }, []);
  
  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const renderContent = () => {
    switch (view) {
      case 'home':
        return <HomeScreen language={language} />;
      case 'farmerLogin':
        return <LoginScreen userType="farmer" onLogin={handleLogin} language={language} />;
      case 'authorityLogin':
        return <LoginScreen userType="authority" onLogin={handleLogin} language={language} />;
      case 'farmerDashboard':
        return <FarmerDashboard language={language} />;
      case 'authorityDashboard':
        return <AuthorityDashboard language={language} />;
      default:
        return <HomeScreen language={language} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Navbar
        language={language}
        toggleLanguage={toggleLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
        view={view}
        setView={setView}
        onLogout={handleLogout}
        onChatbotToggle={() => setIsChatbotOpen(p => !p)}
      />
      <main className="p-4 sm:p-6 md:p-8">
        <div key={view} className="animate-fade-in">
          {renderContent()}
        </div>
      </main>
      {isChatbotOpen && <Chatbot language={language} isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />}
    </div>
  );
};

export default App;
