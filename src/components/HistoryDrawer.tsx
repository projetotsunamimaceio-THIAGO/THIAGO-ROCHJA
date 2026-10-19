import React from 'react';
import { GeneratedAudioItem } from '../types/tts';
import { exportAndDownloadAudio } from '../utils/audioEncoder';
import {
  X,
  History,
  Trash2,
  Download,
  Play,
  RotateCcw,
  Sparkles,
  Calendar,
  Clock,
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedAudioItem[];
  onSelectAudio: (item: GeneratedAudioItem) => void;
  onDeleteAudio: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectAudio,
  onDeleteAudio,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const handleDownload = async (item: GeneratedAudioItem) => {
    try {
      await exportAndDownloadAudio(item.audioBase64, {
        format: 'mp3',
        speed: item.speed || 1.0,
        voiceName: item.voice.name,
        applySpeedToExport: true,
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao exportar MP3.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl p-4 sm:p-6 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Histórico de Áudios Gerados ({history.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <History className="w-10 h-10 mx-auto mb-2 text-slate-700" />
              <p className="text-sm">Nenhum áudio gerado ainda.</p>
              <p className="text-xs text-slate-600 mt-1">
                Gere um áudio acima para vê-lo listado aqui.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-all flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.voice.avatarEmoji}</span>
                    <div>
                      <span className="font-bold text-sm text-slate-100">
                        {item.voice.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>{item.mode === 'narracao' ? 'Narração' : 'Locução'}</span>
                        <span>•</span>
                        <span>{item.speed}x</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors"
                      title="Baixar em MP3"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteAudio(item.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Excluir áudio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                  {item.text}
                </p>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectAudio(item);
                      onClose();
                    }}
                    className="flex items-center gap-1 font-semibold text-amber-400 hover:underline"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Carregar no Player
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
            <button
              onClick={onClearHistory}
              className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpar todo o histórico
            </button>
            <span className="text-xs text-slate-500">
              Salvo no navegador
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
