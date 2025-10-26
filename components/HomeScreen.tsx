import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { useLocalization } from '../constants';

interface HomeScreenProps {
  language: Language;
}

const CountUp: React.FC<{ end: number }> = ({ end }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = duration / frameDuration;
    const increment = end / totalFrames;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, frameDuration);

    return () => clearInterval(timer);
  }, [end]);

  return <>{count.toLocaleString('en-IN')}</>;
};


const StepCard: React.FC<{ icon: string, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </div>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ language }) => {
  const t = useLocalization(language);

  return (
    <div className="text-center py-8 px-4 space-y-20">
      <section>
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 dark:text-blue-300 animate-fade-in-down">{t('appName')}</h1>
        <p className="mt-4 text-lg md:text-xl text-gray-700 dark:text-gray-300 animate-fade-in-up">{t('appTagline')}</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto animate-fade-in">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 border-t-4 border-green-500">
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-3">{t('pmfbyDetails')}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-left">{t('aboutText')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 border-t-4 border-blue-500">
          <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-3">{t('impactMetrics')}</h2>
          <p className="text-6xl font-bold text-blue-900 dark:text-blue-200">
            ₹<CountUp end={95000} /> Crore
          </p>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">{t('claimsPaid')}</p>
        </div>
      </section>
      
      <section className="max-w-5xl mx-auto animate-fade-in-up">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">{t('howItWorks')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard icon="📸" title={t('step1Title')} description={t('step1Desc')} />
          <StepCard icon="🤖" title={t('step2Title')} description={t('step2Desc')} />
          <StepCard icon="📊" title={t('step3Title')} description={t('step3Desc')} />
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;
