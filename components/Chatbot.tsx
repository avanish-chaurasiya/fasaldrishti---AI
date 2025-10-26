import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Language, ChatMessage, GroundingChunk } from '../types';
import { useLocalization } from '../constants';
import { startLiveConversation, stopLiveConversation } from '../services/geminiService';
import { decode, decodeAudioData } from '../services/audioUtils';
import { MicIcon } from './Icons';
import { LiveServerMessage } from '@google/genai';

interface ChatbotProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ language, isOpen, onClose }) => {
  const t = useLocalization(language);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // FIX: Explicitly initialize useRef with `undefined` to fix "Expected 1 arguments, but got 0" error.
  const outputAudioContextRef = useRef<AudioContext | undefined>(undefined);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);
  
  // FIX: Replaced the conditional effect with a proper cleanup function.
  // This ensures that the live conversation is stopped and resources are released
  // when the component unmounts (e.g., when the chatbot is closed).
  useEffect(() => {
    return () => {
      // The stopLiveConversation function is idempotent, so it's safe to call
      // even if a conversation was not active.
      stopLiveConversation();
    };
  }, []);


  const handleMessage = useCallback(async (message: LiveServerMessage) => {
    if (message.serverContent?.inputTranscription) {
      const text = message.serverContent.inputTranscription.text;
      // FIX: The `isFinal` property does not exist on the Transcription type. Treat transcriptions as partial until `turnComplete`.
      const isFinal = false;
      currentInputTranscriptionRef.current += text;
      
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.sender === 'user' && !lastMessage.isFinal) {
            const updatedMessage = { ...lastMessage, text: currentInputTranscriptionRef.current, isFinal: isFinal };
            return [...prev.slice(0, -1), updatedMessage];
        }
        return [...prev, { id: Date.now(), text: currentInputTranscriptionRef.current, sender: 'user', isFinal: isFinal }];
      });
    }

    if (message.serverContent?.outputTranscription) {
        const text = message.serverContent.outputTranscription.text;
        // FIX: The `isFinal` property does not exist on the Transcription type. Treat transcriptions as partial until `turnComplete`.
        const isFinal = false;
        currentOutputTranscriptionRef.current += text;

        setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.sender === 'bot' && !lastMessage.isFinal) {
                const updatedMessage = { ...lastMessage, text: currentOutputTranscriptionRef.current, isFinal: isFinal };
                return [...prev.slice(0, -1), updatedMessage];
            }
            return [...prev, { id: Date.now() + 1, text: currentOutputTranscriptionRef.current, sender: 'bot', isFinal: isFinal }];
        });
    }

    if (message.serverContent?.turnComplete) {
        setMessages(prev => prev.map(msg => ({ ...msg, isFinal: true })));
        
        const grounding = message.serverContent?.groundingMetadata?.groundingChunks;
        if (grounding && grounding.length > 0) {
            setMessages(prev => {
                // FIX: Replaced findLastIndex with a for loop for better compatibility.
                let lastBotMsgIndex = -1;
                for (let i = prev.length - 1; i >= 0; i--) {
                  if (prev[i].sender === 'bot') {
                    lastBotMsgIndex = i;
                    break;
                  }
                }

                if (lastBotMsgIndex > -1) {
                    const newMessages = [...prev];
                    newMessages[lastBotMsgIndex] = {
                        ...newMessages[lastBotMsgIndex],
                        // FIX: The type of `grounding` from the SDK is compatible now after changes in `types.ts`.
                        grounding: grounding as GroundingChunk[],
                    };
                    return newMessages;
                }
                return prev;
            });
        }
        
        currentInputTranscriptionRef.current = '';
        currentOutputTranscriptionRef.current = '';
    }

    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    if (base64Audio) {
        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current!, 24000, 1);
        const source = outputAudioContextRef.current!.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputAudioContextRef.current!.destination);
        
        const currentTime = outputAudioContextRef.current!.currentTime;
        const startTime = Math.max(nextStartTimeRef.current, currentTime);
        source.start(startTime);
        nextStartTimeRef.current = startTime + audioBuffer.duration;
        sourcesRef.current.add(source);
        source.onended = () => {
          sourcesRef.current.delete(source);
        };
    }
  }, []);

  const toggleConversation = () => {
    if (isListening) {
      stopLiveConversation();
      setIsListening(false);
      if (outputAudioContextRef.current) {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = undefined;
      }
    } else {
      setMessages([{ id: 0, text: t('chatbotPrompt'), sender: 'bot', isFinal: true }]);
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;
      sourcesRef.current.clear();
      
      startLiveConversation({
        onMessage: handleMessage,
        onError: (e) => {
          console.error("Live session error:", e);
          setIsListening(false);
        },
        onClose: () => {
          console.log("Live session closed.");
          setIsListening(false);
        },
      });
      setIsListening(true);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 animate-fade-in" onClick={onClose}></div>
    <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full h-full md:h-[600px] md:max-h-[80vh] md:w-[400px] bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-in-up">
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('appName')} Chat</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-2xl leading-none">&times;</button>
        </header>
        <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-2xl max-w-xs ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'}`}>
                       <p>{msg.text}</p>
                        {msg.grounding && msg.grounding.length > 0 && (
                            <div className={`mt-2 border-t pt-2 ${msg.sender === 'user' ? 'border-blue-400' : 'border-gray-300 dark:border-gray-600'}`}>
                                <h4 className="font-bold text-xs mb-1">{msg.sender === 'bot' ? 'Sources:' : ''}</h4>
                                {msg.grounding.map((chunk, index) => (
                                    (chunk.web || chunk.maps) && (chunk.web?.uri || chunk.maps?.uri) && (
                                        <a href={chunk.web?.uri || chunk.maps?.uri} target="_blank" rel="noopener noreferrer" key={index} className={`text-xs block truncate ${msg.sender === 'user' ? 'text-blue-100 hover:underline' : 'text-blue-600 dark:text-blue-400 hover:underline'}`}>
                                           {chunk.web?.title || chunk.maps?.title}
                                        </a>
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
                onClick={toggleConversation}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
            >
                <MicIcon className="w-6 h-6"/>
                {isListening ? t('stopConversation') : t('startConversation')}
            </button>
        </footer>
    </div>
    </>
  );
};

export default Chatbot;