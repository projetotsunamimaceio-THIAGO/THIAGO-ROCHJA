import React, { useRef, useState, useEffect } from 'react';
import { GeneratedAudioItem } from '../types/tts';
import { exportAndDownloadAudio } from '../utils/audioEncoder';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  FileAudio,
  Sparkles,
  Music,
  Share2,
  Check,
  Loader2,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AudioPlayerProps {
  audioItem: GeneratedAudioItem;
  currentSpeed: number;
  applySpeedToDownload: boolean;
  onSpeedChange: (speed: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioItem,
  currentSpeed,
  applySpeedToDownload,
  onSpeedChange,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(audioItem.duration || 0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadFormat, setDownloadFormat] = useState<'mp3' | 'wav'>('mp3');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Audio source data URL
  const audioSrc = `data:${audioItem.mimeType};base64,${audioItem.audioBase64}`;

  // Synchronize playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = currentSpeed;
    }
  }, [currentSpeed]);

  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || audioItem.duration || 1);
      audioRef.current.playbackRate = currentSpeed;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  // Dynamic visualizer animation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const barCount = 48;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const progress = currentTime / (duration || 1);
        const isPast = i / barCount <= progress;

        let barHeight = 4;
        if (isPlaying) {
          // Dynamic wave formula when audio is playing
          const sinVal = Math.sin(phase + i * 0.3) * Math.cos(phase * 0.5 + i * 0.1);
          barHeight = 6 + Math.abs(sinVal) * (height * 0.75);
        } else {
          // Static calm waveform shape
          const staticVal = Math.sin(i * 0.25) * 0.5 + 0.5;
          barHeight = 5 + staticVal * (height * 0.4);
        }

        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        if (isPast) {
          ctx.fillStyle = '#f59e0b'; // Amber 500
        } else {
          ctx.fillStyle = '#334155'; // Slate 700
        }

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.15;
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, duration]);

  // Download handler
  const handleDownload = async (format: 'mp3' | 'wav') => {
    try {
      setIsDownloading(true);
      setDownloadSuccess(null);

      const result = await exportAndDownloadAudio(audioItem.audioBase64, {
        format,
        speed: currentSpeed,
        voiceName: audioItem.voice.name,
        applySpeedToExport: applySpeedToDownload,
        bitrateKbps: 192,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });

      setDownloadSuccess(`Áudio exportado em ${format.toUpperCase()} (${(result.sizeBytes / 1024).toFixed(0)} KB)`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err: any) {
      console.error('Erro ao baixar áudio:', err);
      alert('Não foi possível converter o áudio para download. Tente novamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec)) return '0:00';
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-amber-500/5 relative overflow-hidden ring-1 ring-amber-500/20">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Track Info Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${audioItem.voice.accentColor} flex items-center justify-center text-xl shadow-lg ring-1 ring-white/10 shrink-0`}
          >
            {audioItem.voice.avatarEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Voz: {audioItem.voice.name}
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                {audioItem.mode === 'narracao' ? '📖 Narração' : '🎙️ Locução'}
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-1 max-w-md mt-0.5">
              "{audioItem.text}"
            </p>
          </div>
        </div>

        {/* Speed & Format badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
            {currentSpeed}x
          </span>
          <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-1 rounded-lg">
            24 kHz Studio Master
          </span>
        </div>
      </div>

      {/* Waveform Canvas */}
      <div
        className="w-full h-16 bg-slate-950/90 rounded-xl p-2 border border-slate-800/80 mb-3 cursor-pointer relative flex items-center"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = clickX / rect.width;
          if (audioRef.current && duration > 0) {
            audioRef.current.currentTime = ratio * duration;
          }
        }}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={60}
          className="w-full h-full block"
        />
      </div>

      {/* Progress scrubber bar */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={duration || 1}
          step="0.05"
          value={currentTime}
          onChange={handleSeek}
          className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
          <span>{formatSeconds(currentTime)}</span>
          <span className="text-slate-500">
            {formatSeconds(duration / (currentSpeed || 1))} (em {currentSpeed}x)
          </span>
          <span>{formatSeconds(duration)} (1.0x)</span>
        </div>
      </div>

      {/* Audio Controls & Download Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
        {/* Playback Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
          <button
            type="button"
            onClick={handleRestart}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
            title="Reiniciar do começo"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="w-12 h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
            title={isPlaying ? 'Pausar áudio' : 'Reproduzir áudio'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          {/* Volume control */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <button
              type="button"
              onClick={toggleMute}
              className="text-slate-400 hover:text-slate-200 p-1"
              title={isMuted ? 'Desmutar' : 'Mutar'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 accent-amber-500 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Download Buttons Section */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Main MP3 Download Button */}
          <button
            type="button"
            disabled={isDownloading}
            onClick={() => handleDownload('mp3')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
            title={`Baixar arquivo .mp3 ${applySpeedToDownload ? `na velocidade ${currentSpeed}x` : 'na velocidade original'}`}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Processando MP3...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Baixar em MP3</span>
                {applySpeedToDownload && currentSpeed !== 1.0 && (
                  <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded font-mono">
                    {currentSpeed}x
                  </span>
                )}
              </>
            )}
          </button>

          {/* WAV Master Download Button */}
          <button
            type="button"
            disabled={isDownloading}
            onClick={() => handleDownload('wav')}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50"
            title="Baixar arquivo .wav master original sem compressão"
          >
            <FileAudio className="w-4 h-4 text-amber-400" />
            <span>WAV</span>
          </button>
        </div>
      </div>

      {/* Success Notification feedback */}
      {downloadSuccess && (
        <div className="mt-3 py-1.5 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            {downloadSuccess}
          </span>
          <span className="text-[11px] text-emerald-400/80">Salvo em Downloads</span>
        </div>
      )}
    </div>
  );
};
