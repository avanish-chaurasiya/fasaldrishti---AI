
import React from 'react';
import { Language, UserType } from '../types';
import { useLocalization } from '../constants';

interface LoginScreenProps {
  onLogin: (type: UserType) => void;
  language: Language;
  userType: 'farmer' | 'authority';
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, language, userType }) => {
  const t = useLocalization(language);
  
  const isFarmerLogin = userType === 'farmer';
  const title = isFarmerLogin ? t('farmerLogin') : t('authorityLogin');
  const buttonText = isFarmerLogin ? t('loginAsFarmer') : t('loginAsAuthority');
  const buttonColorClasses = isFarmerLogin 
    ? "bg-green-600 hover:bg-green-700 focus:ring-green-300 dark:focus:ring-green-800"
    : "bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:focus:ring-blue-800";


  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border-t-4 dark:border-gray-700 border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">{title}</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="mb-6">
          <label htmlFor="id" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t('mobileAadhaar')}</label>
          <input type="text" id="id" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder=" " disabled />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t('otpPassword')}</label>
          <input type="password" id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" disabled />
        </div>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => onLogin(userType)}
            className={`w-full text-white ${buttonColorClasses} focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-3 text-center transition-transform transform hover:scale-105`}
          >
            {buttonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginScreen;
