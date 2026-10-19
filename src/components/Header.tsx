import React from 'react';
import { Volume2, Sparkles, Globe, History, Radio } from 'lucide-react';
import { SupportedLanguage } from '../types/tts';

interface HeaderProps {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  historyCount: number;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  historyCount,
  onOpenHistory,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/30">
            <Radio className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-['Plus_Jakarta_Sans']">
                Voz<span className="text-amber-400">Craft</span> Studio
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini 3.8 Flash TTS
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Gerador de Áudio & Voz IA Profissional
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <Globe className="w-4 h-4 text-slate-400 ml-1.5 mr-1 hidden sm:block" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
              className="bg-transparent text-xs sm:text-sm font-medium text-slate-200 outline-none cursor-pointer pr-1 py-1"
            >
              <option value="pt-BR" className="bg-slate-900 text-slate-200">
                🇧🇷 Português (Brasil)
              </option>
              <option value="pt-PT" className="bg-slate-900 text-slate-200">
                🇵🇹 Português (Portugal)
              </option>
              <option value="en-US" className="bg-slate-900 text-slate-200">
                🇺🇸 English (US)
              </option>
              <option value="es-ES" className="bg-slate-900 text-slate-200">
                🇪🇸 Español
              </option>
            </select>
          </div>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors relative"
            title="Histórico de áudios gerados"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Histórico</span>
            {historyCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950 ml-0.5">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
