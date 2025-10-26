
import React, { useState, useCallback } from 'react';
import { Language, CropAnalysis } from '../types';
import { useLocalization } from '../constants';
import { textToSpeech, analyzeImage } from '../services/geminiService';
import { SpeakerIcon } from './Icons';

interface CropStatusProps {
  language: Language;
  onBack: () => void;
}

const CropStatus: React.FC<CropStatusProps> = ({ language, onBack }) => {
  const t = useLocalization(language);
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<CropAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        handleImageAnalysis(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageAnalysis = useCallback(async (file: File) => {
    setIsLoading(true);
    setAnalysis(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = (reader.result as string).split(',')[1];
      const prompt = `Analyze this crop image for health issues. Provide a health score (0-100), identify any damage type (or 'Healthy' if none), and give a concise recommendation for the farmer. Format the output as a JSON object with keys: "healthScore", "damageType", "recommendation".`;
      try {
        const resultText = await analyzeImage(base64Image, file.type, prompt);
        const cleanedText = resultText.replace(/```json|```/g, '').trim();
        const resultJson: Omit<CropAnalysis, 'image'> = JSON.parse(cleanedText);
        setAnalysis({ ...resultJson, image: image! });
      } catch (error) {
        console.error("Failed to parse analysis JSON:", error);
        setAnalysis({ healthScore: 0, damageType: 'Analysis Error', recommendation: 'Could not analyze the image. Please try a clearer picture.', image: image! });
      } finally {
        setIsLoading(false);
      }
    };
  }, [image]);

  const handleSpeak = async () => {
    if (!analysis || isSpeaking) return;
    setIsSpeaking(true);
    const textToRead = `
      ${t('healthScore')}: ${analysis.healthScore} out of 100.
      ${t('damageType')}: ${analysis.damageType}.
      ${t('recommendation')}: ${analysis.recommendation}.
    `;
    const audioBuffer = await textToSpeech(textToRead);
    if (audioBuffer) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => setIsSpeaking(false);
      source.start(0);
    } else {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg animate-fade-in-up">
      <button onClick={onBack} className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">&larr; Back</button>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('newImageUpload')}</h2>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            {image ? (
              <img src={image} alt="Crop" className="max-h-64 mx-auto rounded-lg" />
            ) : (
              <p className="text-gray-600 dark:text-gray-400">{t('uploadImagePrompt')}</p>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
            <label htmlFor="image-upload" className="mt-4 inline-block cursor-pointer px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
              {t('selectImage')}
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('imageUploadGuide')}</p>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('myCropStatus')}</h2>
          {isLoading && (
            <div className="flex justify-center items-center h-full text-gray-600 dark:text-gray-300">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
              <p className="ml-4">{t('analyzing')}</p>
            </div>
          )}
          {analysis && !isLoading && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-600 dark:text-gray-300">{t('healthScore')}</h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{analysis.healthScore} / 100</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600 dark:text-gray-300">{t('damageType')}</h3>
                <p className="text-lg text-gray-800 dark:text-gray-100">{analysis.damageType}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600 dark:text-gray-300">{t('recommendation')}</h3>
                <p className="text-lg text-gray-800 dark:text-gray-100">{analysis.recommendation}</p>
              </div>
              <button
                onClick={handleSpeak}
                disabled={isSpeaking}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 dark:disabled:bg-indigo-800"
              >
                <SpeakerIcon className="w-6 h-6" />
                {isSpeaking ? t('listening') : t('listenToAnalysis')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropStatus;
