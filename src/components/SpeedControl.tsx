import React from 'react';
import { Gauge, Check, Info } from 'lucide-react';

interface SpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  applySpeedToDownload: boolean;
  onApplySpeedToDownloadChange: (apply: boolean) => void;
}

export const SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export const SpeedControl: React.FC<SpeedControlProps> = ({
  speed,
  onSpeedChange,
  applySpeedToDownload,
  onApplySpeedToDownloadChange,
}) => {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
          Velocidade da Voz & Ritmo de Reprodução
        </label>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 w-fit">
          Ritmo atual: {speed}x {speed === 1.0 ? '(Normal)' : speed > 1.0 ? '(Acelerado)' : '(Desacelerado)'}
        </span>
      </div>

      {/* Preset Chips */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
        {SPEED_PRESETS.map((preset) => {
          const isSelected = speed === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onSpeedChange(preset)}
              className={`py-2 px-1 rounded-xl text-center font-bold text-xs sm:text-sm transition-all border ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-300'
                  : 'bg-slate-950/70 text-slate-400 border-slate-800/80 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {preset}x
            </button>
          );
        })}
      </div>

      {/* Slider */}
      <div className="px-1 mb-3">
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.05"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
          <span>0.5x (Lenta)</span>
          <span>1.0x (Padrão)</span>
          <span>1.5x (Rápida)</span>
          <span>2.0x (Ultra Rápida)</span>
        </div>
      </div>

      {/* Download Speed Option Toggle */}
      <div className="pt-3 border-t border-slate-800/70 flex items-start sm:items-center justify-between gap-3 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
        <div className="flex items-start gap-2.5">
          <input
            type="checkbox"
            id="apply-speed-toggle"
            checked={applySpeedToDownload}
            onChange={(e) => onApplySpeedToDownloadChange(e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-amber-500 rounded cursor-pointer"
          />
          <label htmlFor="apply-speed-toggle" className="text-xs text-slate-300 cursor-pointer leading-tight">
            <strong className="text-white block sm:inline">Exportar download na velocidade escolhida ({speed}x)</strong>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              O arquivo MP3 ou WAV baixado será gerado exatamente com o ritmo de {speed}x.
            </span>
          </label>
        </div>

        <div className="shrink-0 text-right">
          {applySpeedToDownload ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Check className="w-3 h-3" /> {speed}x no MP3
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">
              Original (1.0x)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
