import { Pause, Play, Volume2, VolumeX, Subtitles } from 'lucide-react';

interface Props {
  currentIndex: number;
  total: number;
  isPlaying: boolean;
  voiceEnabled: boolean;
  showCaptions: boolean;
  onSeek: (index: number) => void;
  onTogglePlay: () => void;
  onToggleVoice: () => void;
  onToggleCaptions: () => void;
}

export default function PlayerControls({ currentIndex, total, isPlaying, voiceEnabled, showCaptions, onSeek, onTogglePlay, onToggleVoice, onToggleCaptions }: Props) {
  return (
    <div className="relative z-30 flex-none flex flex-col sm:flex-row items-center justify-between gap-4 px-10 sm:px-12 md:px-14 py-2 shrink-0 max-w-[900px] mx-auto w-full">
      <div className="flex-1 w-full flex items-center gap-3">
        <span className="text-[11px] font-['IBM_Plex_Mono',monospace] text-white/40 w-8 text-right">{currentIndex + 1}</span>
        <div className="relative flex-1 h-[1px] bg-white/10">
          <div className="absolute top-0 left-0 h-full bg-white/50 transition-all duration-300" style={{ width: `${((currentIndex) / Math.max(total - 1, 1)) * 100}%` }} />
          <input type="range" min="0" max={total - 1} value={currentIndex} onChange={(e) => onSeek(parseInt(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer" />
        </div>
        <span className="text-[11px] font-['IBM_Plex_Mono',monospace] text-white/40 w-8">{total}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onTogglePlay} className={`w-8 h-8 flex items-center justify-center border transition-all cursor-pointer bg-transparent ${isPlaying ? 'border-white/30 text-white' : 'border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'}`} aria-label="Toggle Playback">
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button onClick={onToggleVoice} className={`w-8 h-8 flex items-center justify-center border transition-all cursor-pointer bg-transparent ${voiceEnabled ? 'border-white/30 text-white' : 'border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'}`} aria-label="Toggle Voice">
          {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
        <button onClick={onToggleCaptions} className={`w-8 h-8 flex items-center justify-center border transition-all cursor-pointer bg-transparent ${showCaptions ? 'border-white/30 text-white' : 'border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'}`} aria-label="Toggle Captions">
          <Subtitles className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
