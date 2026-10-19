import React, { useState } from 'react';
import { VoiceOption, VoiceGender } from '../types/tts';
import { VOICES } from '../data/voices';
import { Check, Star, User, Sparkles, Volume2, Mic } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice: VoiceOption;
  onSelectVoice: (voice: VoiceOption) => void;
  onPreviewSample?: (sampleText: string, voice: VoiceOption) => void;
  isPlayingPreview?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  onPreviewSample,
  isPlayingPreview,
}) => {
  const [activeTab, setActiveTab] = useState<'todas' | 'famosa' | 'masculino' | 'feminino'>('todas');

  const filteredVoices = VOICES.filter((voice) => {
    if (activeTab === 'todas') return true;
    if (activeTab === 'famosa') return voice.isFamous;
    return voice.gender === activeTab;
  });

  const famousCount = VOICES.filter((v) => v.isFamous).length; // 3
  const maleCount = VOICES.filter((v) => v.gender === 'masculino').length; // 5
  const femaleCount = VOICES.filter((v) => v.gender === 'feminino').length; // 4

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-amber-400" />
            Catálogo de Vozes com Inteligência Artificial
          </label>
          <p className="text-xs text-slate-400 mt-0.5">
            Selecione uma entre as 12 vozes calibradas para fala realista
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('todas')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              activeTab === 'todas'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas ({VOICES.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('famosa')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 shrink-0 ${
              activeTab === 'famosa'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-amber-400/90 hover:text-amber-300'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            Famosas ({famousCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('masculino')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              activeTab === 'masculino'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            👨 Masculinas ({maleCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('feminino')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              activeTab === 'feminino'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            👩 Femininas ({femaleCount})
          </button>
        </div>
      </div>

      {/* Voice Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredVoices.map((voice) => {
          const isSelected = selectedVoice.id === voice.id;

          return (
            <div
              key={voice.id}
              onClick={() => onSelectVoice(voice)}
              className={`relative group rounded-xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-slate-900 to-slate-850 border-amber-500/60 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700/90 hover:bg-slate-900/40'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${voice.accentColor} flex items-center justify-center text-lg shadow-inner ring-1 ring-white/10 shrink-0`}
                    >
                      {voice.avatarEmoji}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-white group-hover:text-amber-200 transition-colors">
                          {voice.name}
                        </span>
                        {voice.isFamous && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />
                            Famoso
                          </span>
                        )}
                        {!voice.isFamous && voice.gender === 'masculino' && (
                          <span className="text-[10px] text-blue-400/80 bg-blue-500/10 px-1.5 py-0.2 rounded">
                            Masculino
                          </span>
                        )}
                        {!voice.isFamous && voice.gender === 'feminino' && (
                          <span className="text-[10px] text-rose-400/80 bg-rose-500/10 px-1.5 py-0.2 rounded">
                            Feminino
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-medium text-amber-400/90">
                        {voice.tone}
                      </div>
                    </div>
                  </div>

                  {/* Radio / Check badge */}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                      isSelected
                        ? 'bg-amber-500 border-amber-400 text-slate-950'
                        : 'border-slate-700 bg-slate-900 group-hover:border-slate-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mt-1 mb-2.5">
                  {voice.description}
                </p>
              </div>

              {/* Tags and Sample button */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-1 text-[11px]">
                <div className="flex items-center gap-1 overflow-hidden">
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] truncate">
                    {voice.suggestedStyles[0]}
                  </span>
                  {voice.suggestedStyles[1] && (
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] truncate">
                      {voice.suggestedStyles[1]}
                    </span>
                  )}
                </div>

                {onPreviewSample && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewSample(voice.samplePhrase, voice);
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 hover:underline shrink-0 px-1.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                    title={`Ouvir demonstração rápida de ${voice.name}`}
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Exemplo</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
