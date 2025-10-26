
import { GoogleGenAI, GenerateContentResponse, Modality, Blob, LiveSession, LiveServerMessage } from "@google/genai";
import { GroundingChunk } from '../types';
import { encode, decode, decodeAudioData } from './audioUtils';

let ai: GoogleGenAI;

const getAi = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

// Text-to-Speech
export const textToSpeech = async (text: string): Promise<AudioBuffer | null> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A suitable voice
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const audioBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(audioBytes, outputAudioContext, 24000, 1);
            return audioBuffer;
        }
        return null;
    } catch (error) {
        console.error("Error in text-to-speech:", error);
        return null;
    }
};

// Image Analysis
export const analyzeImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const ai = getAi();
        const imagePart = {
            inlineData: {
                mimeType,
                data: base64Image,
            },
        };
        const textPart = { text: prompt };
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error analyzing image:", error);
        return "Error analyzing image. Please try again.";
    }
};


// Live Conversation
let liveSessionPromise: Promise<LiveSession> | null = null;
let scriptProcessor: ScriptProcessorNode | null = null;
let audioSource: MediaStreamAudioSourceNode | null = null;
let inputAudioContext: AudioContext | null = null;

export const startLiveConversation = (callbacks: {
    onMessage: (message: LiveServerMessage) => void;
    onError: (error: ErrorEvent) => void;
    onClose: (event: CloseEvent) => void;
}) => {
    const ai = getAi();
    liveSessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: async () => {
                console.log('Live session opened.');
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                    audioSource = inputAudioContext.createMediaStreamSource(stream);
                    scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob: Blob = {
                            data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };
                        liveSessionPromise?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };

                    audioSource.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);
                } catch (err) {
                    console.error("Error accessing microphone:", err);
                    callbacks.onError(new ErrorEvent('microphone-error', { error: err as Error }));
                }
            },
            onmessage: callbacks.onMessage,
            onerror: callbacks.onError,
            onclose: callbacks.onClose,
        },
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: 'You are a helpful assistant for Indian farmers using the FasalDrishti app. Answer questions about crop health, insurance claims, and PMFBY. Keep answers concise and clear. You can use Google Search and Maps to provide accurate, up-to-date information.',
            tools: [{ googleSearch: {} }, { googleMaps: {} }],
        },
    });
    return liveSessionPromise;
};

export const stopLiveConversation = () => {
    liveSessionPromise?.then(session => session.close());
    liveSessionPromise = null;

    if (scriptProcessor) {
        scriptProcessor.disconnect();
        scriptProcessor = null;
    }
    if (audioSource) {
        audioSource.disconnect();
        audioSource.mediaStream.getTracks().forEach(track => track.stop());
        audioSource = null;
    }
    if (inputAudioContext && inputAudioContext.state !== 'closed') {
        inputAudioContext.close();
        inputAudioContext = null;
    }
    console.log('Live session resources cleaned up.');
};
