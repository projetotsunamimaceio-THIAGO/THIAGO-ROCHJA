import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import { VoiceSelector } from './components/VoiceSelector';
import { TextEditor } from './components/TextEditor';
import { SpeedControl } from './components/SpeedControl';
import { AudioPlayer } from './components/AudioPlayer';
import { HistoryDrawer } from './components/HistoryDrawer';
import { VOICES, SUB_STYLES } from './data/voices';
import {
  VoiceOption,
  AppMode,
  SupportedLanguage,
  GeneratedAudioItem,
} from './types/tts';
import {
  Sparkles,
  Loader2,
  AlertCircle,
  Headphones,
  CheckCircle2,
  Flame,
  Radio,
  FileDown,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'vozcraft_history_v1';

export default function App() {
  const [language, setLanguage] = useState<SupportedLanguage>('pt-BR');
  const [mode, setMode] = useState<AppMode>('narracao');
  const [selectedSubStyle, setSelectedSubStyle] = useState<string>('narracao_doc');
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICES[0]); // Gabriel
  const [text, setText] = useState<string>(
    'Bem-vindo ao VozCraft Studio! Aqui você pode criar áudios ultra-realistas com inteligência artificial, escolher entre vozes masculinas, femininas e lendárias como Morgan Freeman, e baixar tudo diretamente em MP3 na velocidade que desejar.'
  );
  const [speed, setSpeed] = useState<number>(1.0);
  const [applySpeedToDownload, setApplySpeedToDownload] = useState<boolean>(true);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<GeneratedAudioItem | null>(null);
  const [history, setHistory] = useState<GeneratedAudioItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 30));
          if (parsed.length > 0 && !currentAudio) {
            setCurrentAudio(parsed[0]);
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar histórico local:', e);
    }
  }, []);

  // Save history to localStorage
  const saveHistoryItem = (item: GeneratedAudioItem) => {
    const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(0, 30);
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Erro ao salvar histórico:', e);
    }
  };

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Erro ao remover do histórico:', e);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Erro ao limpar histórico:', e);
    }
  };

  // Preview quick sample using Web Speech Synthesis as an instant acoustic aid
  const handlePreviewSample = (samplePhrase: string, voice: VoiceOption) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(samplePhrase);
      utterance.lang = language === 'pt-PT' ? 'pt-PT' : language === 'en-US' ? 'en-US' : 'pt-BR';
      utterance.rate = speed;
      if (voice.gender === 'feminino') {
        utterance.pitch = 1.2;
      } else if (voice.isFamous) {
        utterance.pitch = 0.75;
      } else {
        utterance.pitch = 0.95;
      }
      window.speechSynthesis.speak(utterance);
    } else {
      setText(samplePhrase);
    }
  };

  // Main TTS Generation Request
  const handleGenerate = async () => {
    if (!text.trim()) {
      setErrorMessage('Por favor, digite algum texto para gerar o áudio.');
      return;
    }

    try {
      setIsGenerating(true);
      setErrorMessage(null);

      const subStyleObj = SUB_STYLES.find((s) => s.id === selectedSubStyle);

      const payload = {
        text: text.trim(),
        voiceId: selectedVoice.id,
        voiceName: selectedVoice.baseGeminiVoice,
        speaker: selectedVoice.isFamous ? selectedVoice.name : `${selectedVoice.name} Narrador`,
        stylePrompt: `${selectedVoice.tone}. ${selectedVoice.description}. ${subStyleObj?.promptDescription || ''}`,
        language,
        mode,
        subStyle: subStyleObj?.label || '',
        speed,
      };

      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.audioBase64) {
        throw new Error(data.error || 'Falha ao gerar áudio com o modelo Gemini.');
      }

      // Calculate approximate duration based on word count
      const wordCount = text.trim().split(/\s+/).length;
      const estimatedSecs = Math.max(2, Math.round((wordCount / (130 * speed)) * 60));

      const newAudioItem: GeneratedAudioItem = {
        id: `audio_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        text: text.trim(),
        voice: selectedVoice,
        mode,
        subStyle: subStyleObj?.label || '',
        language,
        speed,
        audioBase64: data.audioBase64,
        duration: estimatedSecs,
        createdAt: Date.now(),
        mimeType: data.mimeType || 'audio/wav',
      };

      setCurrentAudio(newAudioItem);
      saveHistoryItem(newAudioItem);

      // Trigger celebratory confetti
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Smooth scroll down to player
      setTimeout(() => {
        const playerElement = document.getElementById('audio-player-deck');
        if (playerElement) {
          playerElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    } catch (err: any) {
      console.error('Erro na geração:', err);
      setErrorMessage(
        err.message || 'Erro inesperado na geração de áudio. Verifique a conexão e tente novamente.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Hero Studio Banner */}
      <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 border-b border-slate-800/60 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Síntese de Fala Neural de Alta Resolução
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              Estúdio de Áudio & Narração Profissional
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Converta qualquer texto em áudio com vozes expressivas masculinas, femininas e famosas.
              Ajuste o ritmo e baixe em <strong>MP3</strong> ou <strong>WAV</strong> na velocidade que você escolher.
            </p>
          </div>

          {/* Quick Feature Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-300 font-medium">12 Vozes de Estúdio</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300 font-medium">Download em MP3</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-slate-300 font-medium">Narração & Locução</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="text-slate-300 font-medium">Velocidade 0.5x a 2.0x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-sm">Não foi possível gerar o áudio</strong>
                <p className="text-xs text-rose-200 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-400 hover:text-white underline shrink-0"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Studio Workspace Grid */}
        <div className="space-y-6">
          {/* 1. Mode and Finalidade: Narração vs Locução */}
          <ModeSelector
            mode={mode}
            onModeChange={setMode}
            selectedSubStyle={selectedSubStyle}
            onSubStyleChange={setSelectedSubStyle}
          />

          {/* 2. Text Editor Deck */}
          <TextEditor
            text={text}
            onChangeText={setText}
            speed={speed}
          />

          {/* 3. Voice Catalog (5 Male, 4 Female, 3 Famous) */}
          <VoiceSelector
            selectedVoice={selectedVoice}
            onSelectVoice={setSelectedVoice}
            onPreviewSample={handlePreviewSample}
          />

          {/* 4. Speed & Download Configuration */}
          <SpeedControl
            speed={speed}
            onSpeedChange={setSpeed}
            applySpeedToDownload={applySpeedToDownload}
            onApplySpeedToDownloadChange={setApplySpeedToDownload}
          />

          {/* 5. Generation Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${selectedVoice.accentColor} flex items-center justify-center text-xl shadow-md shrink-0`}
              >
                {selectedVoice.avatarEmoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                    Voz Configurada:
                  </span>
                  <span className="text-sm font-bold text-white">
                    {selectedVoice.name}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {mode === 'narracao' ? 'Modo Narração' : 'Modo Locução'} • Velocidade {speed}x • Download em MP3
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isGenerating || text.trim().length === 0}
              onClick={handleGenerate}
              className="w-full sm:w-auto min-w-[240px] flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-amber-500/25 transition-all transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  <span>Sintetizando Voz com IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 fill-slate-950" />
                  <span>Gerar Áudio com Voz IA</span>
                </>
              )}
            </button>
          </div>

          {/* 6. Active Audio Player Deck */}
          <div id="audio-player-deck">
            {currentAudio ? (
              <AudioPlayer
                audioItem={currentAudio}
                currentSpeed={speed}
                applySpeedToDownload={applySpeedToDownload}
                onSpeedChange={setSpeed}
              />
            ) : (
              <div className="border border-dashed border-slate-800 rounded-2xl p-8 sm:p-12 text-center bg-slate-950/40">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
                  <Headphones className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-300">
                  Ouvir e Baixar seu Áudio em MP3
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                  Digite seu texto acima, escolha uma voz (masculina, feminina ou famosa) e clique em "Gerar Áudio com Voz IA". O player e as opções de download aparecerão aqui!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectAudio={setCurrentAudio}
        onDeleteAudio={deleteHistoryItem}
        onClearHistory={clearHistory}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 bg-slate-950">
        <p>
          VozCraft Studio • Síntese de Voz & Locução Profissional com Gemini 3.8 Flash TTS
        </p>
      </footer>
    </div>
  );
}
