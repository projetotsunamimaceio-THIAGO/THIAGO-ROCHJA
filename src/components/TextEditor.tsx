import React from 'react';
import { SAMPLE_TEXTS } from '../data/voices';
import { FileText, Clipboard, Trash2, Wand2, Sparkles, Clock, Hash } from 'lucide-react';

interface TextEditorProps {
  text: string;
  onChangeText: (text: string) => void;
  speed: number;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  onChangeText,
  speed,
}) => {
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  // Average speaking rate ~ 130 words per minute (at 1x)
  const estimatedSeconds = Math.max(1, Math.round((wordCount / (130 * speed)) * 60));

  const formatEstimatedTime = (totalSec: number) => {
    if (wordCount === 0) return '0s';
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins > 0) return `~${mins}m ${secs}s`;
    return `~${secs}s`;
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onChangeText(clipText);
      }
    } catch {
      // Fallback
    }
  };

  const insertTag = (tag: string) => {
    const newText = text ? `${text} ${tag} ` : `${tag} `;
    onChangeText(newText);
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm flex flex-col justify-between">
      {/* Header of Text Editor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            Texto do Roteiro / Fala
          </label>
          <span className="text-[11px] text-slate-500">
            Digite ou cole o texto que a voz com IA irá narrar
          </span>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <select
            defaultValue=""
            onChange={(e) => {
              const selected = SAMPLE_TEXTS.find((s) => s.title === e.target.value);
              if (selected) onChangeText(selected.text);
              e.target.value = '';
            }}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 outline-none hover:border-slate-700 cursor-pointer font-medium"
          >
            <option value="" disabled>
              ✨ Carregar exemplo pronto...
            </option>
            {SAMPLE_TEXTS.map((sample) => (
              <option key={sample.title} value={sample.title}>
                {sample.title} ({sample.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          rows={6}
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Escreva aqui o seu texto... Exemplo: 'Atenção ouvintes! A partir de hoje, você tem o poder de criar áudios de altíssima fidelidade com apenas alguns cliques. Experimente nossas vozes masculinas, femininas e lendárias!'"
          className="w-full bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 text-sm sm:text-base text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 transition-all resize-y font-sans leading-relaxed min-h-[140px]"
        />
      </div>

      {/* Inserters & Counters Toolbar */}
      <div className="mt-3 pt-3 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2">
        {/* Expressive Tags Inserter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">
            Efeitos vocais:
          </span>
          <button
            type="button"
            onClick={() => insertTag('[pausa de 1s]')}
            className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60 transition-colors"
            title="Adicionar pausa dramática ou de pontuação"
          >
            ⏱️ [pausa]
          </button>
          <button
            type="button"
            onClick={() => insertTag('<breath>')}
            className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60 transition-colors"
            title="Adicionar respiração natural"
          >
            🌬️ &lt;breath&gt;
          </button>
          <button
            type="button"
            onClick={() => insertTag('<laugh>')}
            className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60 transition-colors"
            title="Adicionar riso leve"
          >
            😄 &lt;laugh&gt;
          </button>
          <button
            type="button"
            onClick={() => insertTag('|mhm|')}
            className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60 transition-colors"
            title="Adicionar som de concordância"
          >
            💬 |mhm|
          </button>
        </div>

        {/* Action and stats */}
        <div className="flex items-center gap-3 ml-auto text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3 text-slate-500" />
              <strong className="text-slate-200">{wordCount}</strong> palavras
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              Duração est.: <strong className="text-amber-400">{formatEstimatedTime(estimatedSeconds)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2">
            <button
              type="button"
              onClick={handlePaste}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Colar texto da área de transferência"
            >
              <Clipboard className="w-4 h-4" />
            </button>
            {text.length > 0 && (
              <button
                type="button"
                onClick={() => onChangeText('')}
                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Limpar texto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
