import React, { useState } from 'react';
import { Language, Pin, RegionalClaim, CropDamage, WeatherAlert } from '../types';
import { useLocalization } from '../constants';
import { PinIcon, ChartBarIcon } from './Icons';

// Mock data to simulate backend data
const mockPins: Pin[] = [
  { id: 1, farmerId: 'FARMER001', location: { lat: 28.6139, lng: 77.2090 }, status: 'damage', analysis: { damageType: 'Pest Infestation', details: 'Severe aphid attack detected.' }, imageUrl: 'https://placehold.co/400x300/ff0000/ffffff?text=Damaged+Crop' },
  { id: 2, farmerId: 'FARMER002', location: { lat: 28.62, lng: 77.22 }, status: 'stress', analysis: { damageType: 'Nutrient Deficiency', details: 'Nitrogen deficiency observed.' }, imageUrl: 'https://placehold.co/400x300/ffff00/000000?text=Stressed+Crop' },
  { id: 3, farmerId: 'FARMER003', location: { lat: 28.60, lng: 77.21 }, status: 'healthy', analysis: { damageType: 'N/A', details: 'Crop is healthy.' }, imageUrl: 'https://placehold.co/400x300/00ff00/ffffff?text=Healthy+Crop' },
  { id: 4, farmerId: 'FARMER004', location: { lat: 28.615, lng: 77.19 }, status: 'damage', analysis: { damageType: 'Fungal Infection', details: 'Powdery mildew detected.' }, imageUrl: 'https://placehold.co/400x300/ff0000/ffffff?text=Damaged+Crop' },
];

const mockRegionalClaims: RegionalClaim[] = [
  { region: 'North', settled: 1200, pending: 350 },
  { region: 'South', settled: 950, pending: 200 },
  { region: 'East', settled: 1500, pending: 500 },
  { region: 'West', settled: 1100, pending: 250 },
];

const mockCropDamage: CropDamage[] = [
  { crop: 'Wheat', incidents: 450, primaryCause: 'Drought' },
  { crop: 'Rice', incidents: 320, primaryCause: 'Flooding' },
  { crop: 'Cotton', incidents: 280, primaryCause: 'Bollworm' },
  { crop: 'Sugarcane', incidents: 150, primaryCause: 'Red Rot' },
];

const mockWeatherAlerts: WeatherAlert[] = [
  { region: 'Punjab', condition: 'Heatwave', temperature: 45, humidity: 20 },
  { region: 'Kerala', condition: 'Flood Warning', temperature: 28, humidity: 90 },
  { region: 'West Bengal', condition: 'Severe Thunderstorm', temperature: 32, humidity: 85 },
];

const AuthorityDashboard: React.FC<{ language: Language }> = ({ language }) => {
  const t = useLocalization(language);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(mockPins[0]);

  const totalRedAlerts = mockPins.filter(p => p.status === 'damage').length;
  const pendingVerifications = mockRegionalClaims.reduce((sum, claim) => sum + claim.pending, 0);

  const getWeatherConditionKey = (condition: WeatherAlert['condition']) => {
    switch (condition) {
      case 'Severe Thunderstorm': return 'severeThunderstorm';
      case 'Heatwave': return 'heatwave';
      case 'Flood Warning': return 'floodWarning';
    }
  };

  const SummaryCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center gap-4">
      <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
        {icon}
      </div>
      <div>
        <h3 className="text-gray-500 dark:text-gray-400 font-semibold">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('authorityDashboard')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SummaryCard title={t('totalRedAlerts')} value={totalRedAlerts} icon={<PinIcon status="damage" className="w-8 h-8" />} />
        <SummaryCard title={t('pendingVerifications')} value={pendingVerifications.toLocaleString('en-IN')} icon={<ChartBarIcon className="w-8 h-8 text-yellow-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Live Damage Map</h2>
          <div className="relative bg-gray-200 dark:bg-gray-700 h-96 rounded-lg overflow-hidden">
            {/* A simplified map representation */}
            <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{backgroundImage: "url('https://www.researchgate.net/profile/Hayder-Dib-Kadhem/publication/342129338/figure/fig1/AS:902319985229825@1592131924619/A-satellite-image-of-the-study-area.png')"}}></div>
            {mockPins.map((pin, i) => (
              <button 
                key={pin.id} 
                onClick={() => setSelectedPin(pin)}
                className="absolute transform -translate-x-1/2 -translate-y-full focus:outline-none"
                style={{ left: `${20 + i*20}%`, top: `${30 + (i%2)*40}%` }}
                aria-label={`Pin ${pin.id}`}
              >
                <PinIcon status={pin.status} className={`w-10 h-10 drop-shadow-lg transition-transform hover:scale-125 ${selectedPin?.id === pin.id ? 'scale-125' : ''}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t('pinDetails')}</h2>
          {selectedPin ? (
            <div className="space-y-3 text-sm">
                <img src={selectedPin.imageUrl} alt="Crop" className="w-full h-40 object-cover rounded-lg mb-3" />
                <p><span className="font-semibold">{t('farmerID')}:</span> {selectedPin.farmerId}</p>
                <p><span className="font-semibold">{t('location')}:</span> {selectedPin.location.lat.toFixed(4)}, {selectedPin.location.lng.toFixed(4)}</p>
                <p><span className="font-semibold">{t('aiAnalysisReport')}:</span></p>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <p><span className="font-semibold">{t('damageType')}:</span> <span className={`${selectedPin.status === 'damage' ? 'text-red-500' : selectedPin.status === 'stress' ? 'text-yellow-500' : 'text-green-500'}`}>{selectedPin.analysis.damageType}</span></p>
                    <p>{selectedPin.analysis.details}</p>
                </div>
                <a href={selectedPin.imageUrl} target="_blank" rel="noopener noreferrer" className="block text-center w-full mt-3 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-xs">{t('viewRawImage')}</a>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Select a pin on the map to see details.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t('regionalClaims')}</h2>
          <div className="space-y-4">
            {mockRegionalClaims.map(claim => (
              <div key={claim.region}>
                <h3 className="font-semibold">{claim.region}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 flex overflow-hidden">
                    <div className="bg-green-500 h-6" style={{ width: `${(claim.settled / (claim.settled + claim.pending)) * 100}%` }} title={`${t('settled')}: ${claim.settled}`}></div>
                     <div className="bg-yellow-500 h-6" style={{ width: `${(claim.pending / (claim.settled + claim.pending)) * 100}%` }} title={`${t('pending')}: ${claim.pending}`}></div>
                  </div>
                </div>
                 <div className="flex justify-between text-xs mt-1 text-gray-600 dark:text-gray-300">
                    <span>{t('settled')}: {claim.settled.toLocaleString('en-IN')}</span>
                    <span>{t('pending')}: {claim.pending.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t('cropDamageInsights')}</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="py-2">{t('crop')}</th>
                <th className="py-2 text-center">{t('incidents')}</th>
                <th className="py-2">{t('primaryCause')}</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {mockCropDamage.map(damage => (
                <tr key={damage.crop}>
                  <td className="py-2 font-medium">{damage.crop}</td>
                  <td className="py-2 text-center">{damage.incidents}</td>
                  <td className="py-2">{damage.primaryCause}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t('weatherAlerts')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockWeatherAlerts.map(alert => (
            <div key={alert.region} className={`p-4 rounded-lg border-l-4 ${
              alert.condition === 'Heatwave' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 
              alert.condition === 'Flood Warning' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 
              'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
            }`}>
              <h3 className="font-bold">{alert.region}</h3>
              <p className="font-semibold">{t(getWeatherConditionKey(alert.condition))}</p>
              <div className="text-sm mt-2 flex justify-between">
                <span>🌡️ {alert.temperature}°C</span>
                <span>💧 {alert.humidity}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
