
export type Language = 'en' | 'hi';
export type UserType = 'farmer' | 'authority' | 'guest';
export type Theme = 'light' | 'dark';
export type View = 'home' | 'farmerLogin' | 'authorityLogin' | 'farmerDashboard' | 'authorityDashboard';


export interface CropAnalysis {
  healthScore: number;
  damageType: string;
  recommendation: string;
  image: string;
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  isFinal: boolean;
  grounding?: GroundingChunk[];
}

export interface GroundingChunk {
  web?: {
    // FIX: Made uri and title optional to match @google/genai's GroundingChunk type.
    uri?: string;
    title?: string;
  };
  maps?: {
    // FIX: Made uri and title optional to match @google/genai's GroundingChunk type.
    uri?: string;
    title?: string;
  };
}

export interface Pin {
  id: number;
  farmerId: string;
  location: { lat: number, lng: number };
  status: 'healthy' | 'stress' | 'damage';
  analysis: {
    damageType: string;
    details: string;
  };
  imageUrl: string;
}

export interface RegionalClaim {
  region: string;
  settled: number;
  pending: number;
}

export interface CropDamage {
  crop: string;
  incidents: number;
  primaryCause: string;
}

export interface WeatherAlert {
  region: string;
  condition: 'Severe Thunderstorm' | 'Heatwave' | 'Flood Warning';
  temperature: number;
  humidity: number;
}