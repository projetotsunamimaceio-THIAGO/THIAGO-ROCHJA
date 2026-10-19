export type VoiceGender = 'masculino' | 'feminino' | 'famosa';

export type AppMode = 'narracao' | 'locucao';

export type SupportedLanguage = 'pt-BR' | 'pt-PT' | 'en-US' | 'es-ES';

export interface VoiceOption {
  id: string;
  name: string;
  gender: VoiceGender;
  isFamous?: boolean;
  famousName?: string;
  description: string;
  tone: string;
  baseGeminiVoice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  avatarEmoji: string;
  accentColor: string;
  suggestedStyles: string[];
  samplePhrase: string;
}

export interface GeneratedAudioItem {
  id: string;
  text: string;
  voice: VoiceOption;
  mode: AppMode;
  subStyle: string;
  language: SupportedLanguage;
  speed: number;
  audioBase64: string; // WAV base64
  duration: number; // in seconds
  createdAt: number;
  mimeType: string;
}

export interface SubStyleOption {
  id: string;
  label: string;
  promptDescription: string;
  icon: string;
  recommendedFor: AppMode;
}
