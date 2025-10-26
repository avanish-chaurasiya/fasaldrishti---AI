import React, { useState } from 'react';
import { Language } from '../types';
import { useLocalization } from '../constants';
import CropStatus from './CropStatus';
import { CropIcon, UploadIcon, HistoryIcon } from './Icons';

type FarmerView = 'main' | 'status' | 'history';

const FarmerDashboard: React.FC<{ language: Language }> = ({ language }) => {
  const t = useLocalization(language);
  const [view, setView] = useState<FarmerView>('main');

  const renderView = () => {
    switch (view) {
      case 'status':
        return <CropStatus language={language} onBack={() => setView('main')} />;
      case 'history':
        return (
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t('claimsHistory')}</h2>
            <p className="text-gray-600 dark:text-gray-300">This feature will show a detailed history of all your past claims and their statuses. Coming soon!</p>
            <button onClick={() => setView('main')} className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">&larr; Back to Dashboard</button>
          </div>
        );
      case 'main':
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <DashboardCard 
              title={t('myCropStatus')} 
              onClick={() => setView('status')} 
              icon={<CropIcon className="w-12 h-12 mx-auto mb-4 text-green-600 dark:text-green-400" />} 
            />
            <DashboardCard 
              title={t('newImageUpload')} 
              onClick={() => setView('status')} 
              icon={<UploadIcon className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />} 
            />
            <DashboardCard 
              title={t('claimsHistory')} 
              onClick={() => setView('history')} 
              icon={<HistoryIcon className="w-12 h-12 mx-auto mb-4 text-indigo-600 dark:text-indigo-400" />} 
            />
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
       {view === 'main' && (
        <div className="mb-8 text-center md:text-left animate-fade-in-down">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('welcomeFarmer')}</h1>
          <p className="text-gray-600 dark:text-gray-300">Here's a quick overview of your crop insurance tools.</p>
        </div>
      )}
      <div key={view} className="animate-fade-in">
        {renderView()}
      </div>
    </div>
  );
};

const DashboardCard: React.FC<{ title: string; onClick: () => void; icon: React.ReactNode; }> = ({ title, onClick, icon }) => (
  <button
    onClick={onClick}
    className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl dark:hover:shadow-blue-500/20 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-center"
  >
    {icon}
    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
  </button>
);

export default FarmerDashboard;
