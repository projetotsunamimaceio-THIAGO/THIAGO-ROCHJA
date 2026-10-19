import React from 'react';
import { AppMode } from '../types/tts';
import { SUB_STYLES } from '../data/voices';
import { BookOpen, Megaphone, Sparkles, Sliders } from 'lucide-react';

interface ModeSelectorProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  selectedSubStyle: string;
  onSubStyleChange: (subStyleId: string) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  onModeChange,
  selectedSubStyle,
  onSubStyleChange,
}) => {
  const currentSubStyles = SUB_STYLES.filter((s) => s.recommendedFor === mode);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          Modo de Voz & Finalidade
        </label>
        <span className="text-[11px] text-slate-500 font-medium">
          Personaliza entonação e dinâmica
        </span>
      </div>

      {/* Main Mode Toggle: Narração vs Locução */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          type="button"
          onClick={() => {
            onModeChange('narracao');
            const defaultSub = SUB_STYLES.find((s) => s.recommendedFor === 'narracao');
            if (defaultSub) onSubStyleChange(defaultSub.id);
          }}
          className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
            mode === 'narracao'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/5'
              : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              mode === 'narracao'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base text-white">
                Narração
              </span>
              {mode === 'narracao' && (
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300">
                  Ativo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-tight">
              Audiobooks, documentários, histórias e meditação.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            onModeChange('locucao');
            const defaultSub = SUB_STYLES.find((s) => s.recommendedFor === 'locucao');
            if (defaultSub) onSubStyleChange(defaultSub.id);
          }}
          className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
            mode === 'locucao'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/5'
              : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              mode === 'locucao'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
            }`}
          >
            <Megaphone className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base text-white">
                Locução
              </span>
              {mode === 'locucao' && (
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300">
                  Ativo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-tight">
              Comercial de TV/Rádio, chamadas, trailers e podcasts.
            </p>
          </div>
        </button>
      </div>

      {/* Sub-Styles Pills */}
      <div>
        <div className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Sub-estilo de {mode === 'narracao' ? 'Narração' : 'Locução'}:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {currentSubStyles.map((style) => {
            const isSelected = selectedSubStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onSubStyleChange(style.id)}
                className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all text-xs ${
                  isSelected
                    ? 'bg-slate-800 border-amber-500/50 text-white ring-1 ring-amber-500/30'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-0.5">
                  <span className="text-sm">{style.icon}</span>
                  <span className="truncate">{style.label}</span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                  {style.promptDescription}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
