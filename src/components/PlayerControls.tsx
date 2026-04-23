import { Pause, Play, Volume2, VolumeX, Subtitles, Type, User } from 'lucide-react';

export type CaptionSize = 'sm' | 'md' | 'lg';

interface Props {
  currentIndex: number;
  total: number;
  isPlaying: boolean;
  voiceEnabled: boolean;
  showCaptions: boolean;
  captionSize: CaptionSize;
  playbackSpeed: number;
  showAvatar: boolean;
  onSeek: (index: number) => void;
  onTogglePlay: () => void;
  onToggleVoice: () => void;
  onToggleCaptions: () => void;
  onCaptionSizeChange: (size: CaptionSize) => void;
  onSpeedChange: (speed: number) => void;
  onToggleAvatar: () => void;
}

const SPEEDS = [0.5, 1, 1.5, 2];

export default function PlayerControls({
  currentIndex, total, isPlaying, voiceEnabled, showCaptions,
  captionSize, playbackSpeed, showAvatar,
  onSeek, onTogglePlay, onToggleVoice, onToggleCaptions,
  onCaptionSizeChange, onSpeedChange, onToggleAvatar,
}: Props) {
  const nextSize = (): CaptionSize => captionSize === 'sm' ? 'md' : captionSize === 'md' ? 'lg' : 'sm';
  const nextSpeed = () => {
    const idx = SPEEDS.indexOf(playbackSpeed);
    return SPEEDS[(idx + 1) % SPEEDS.length];
  };

  return (
    <div className="absolute inset-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
      {/* Top-left: Play/Pause */}
      <div className="absolute top-3 left-3 flex items-center gap-1">
        <button onClick={onTogglePlay} className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:text-[#FF4E00] hover:bg-black/60 transition-colors" aria-label="Toggle Playback">
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
      </div>

      {/* Top-right: Voice, Captions, Caption Size, Avatar, Speed */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <button
          onClick={() => onSpeedChange(nextSpeed())}
          className="px-2 py-1 text-[11px] font-mono font-bold text-white/70 hover:text-white bg-black/40 backdrop-blur-sm hover:bg-black/60 rounded-full transition-colors"
          aria-label="Playback Speed"
        >
          {playbackSpeed}x
        </button>
        <button onClick={onToggleCaptions} className={`p-2 rounded-full bg-black/40 backdrop-blur-sm transition-colors ${showCaptions ? 'text-white' : 'text-white/40'} hover:text-white hover:bg-black/60`} aria-label="Toggle Captions">
          <Subtitles className="w-5 h-5" />
        </button>
        <button
          onClick={() => onCaptionSizeChange(nextSize())}
          className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white/60 hover:text-white hover:bg-black/60 transition-colors flex items-center gap-1"
          aria-label="Caption Size"
          title={`Caption: ${captionSize.toUpperCase()}`}
        >
          <Type className="w-4 h-4" />
          <span className="text-[10px] font-mono uppercase">{captionSize}</span>
        </button>
        <button onClick={onToggleVoice} className={`p-2 rounded-full bg-black/40 backdrop-blur-sm transition-colors ${voiceEnabled ? 'text-white' : 'text-white/40'} hover:text-white hover:bg-black/60`} aria-label="Toggle Voice">
          {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
        <button
          onClick={onToggleAvatar}
          className={`p-2 rounded-full bg-black/40 backdrop-blur-sm transition-colors ${showAvatar ? 'text-white' : 'text-white/40'} hover:text-white hover:bg-black/60`}
          aria-label="Toggle Avatar"
        >
          <User className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom: Seekbar only */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        <div className="relative flex items-center gap-2 px-4 pb-3 pt-6">
          <span className="text-[11px] font-mono text-white/60 w-6 text-right shrink-0">{currentIndex + 1}</span>
          <input
            type="range" min="0" max={total - 1} value={currentIndex}
            onChange={(e) => onSeek(parseInt(e.target.value))}
            className="w-full h-1 rounded-full appearance-none cursor-pointer accent-[#FF4E00] bg-white/20"
          />
          <span className="text-[11px] font-mono text-white/60 w-6 shrink-0">{total}</span>
        </div>
      </div>
    </div>
  );
}
