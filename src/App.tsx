import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { Slide } from './types/slide';
import { streamSlides, RateLimitError } from './services/ai';
import { useProgress } from './hooks/useProgress';
import { useSlidePlayback } from './hooks/useSlidePlayback';
import SlideRenderer from './components/SlideRenderer';
import CaptionOverlay from './components/CaptionOverlay';
import PlayerControls from './components/PlayerControls';
import type { CaptionSize } from './components/PlayerControls';
import InputBar from './components/InputBar';
import Avatar from './components/Avatar';

const REAL_VOICE_IDS = [
  'TX3LPaxmHKxFdv7VOQHJ', 'Xb7hH8MSUJpSbSDYk0k2', 'JBFqnCBsd6RMkjVDRZzb',
  'IKne3meq5aSn9XLyUdCD', 'EXAVITQu4vr4xnSDxMaL',
];
const pickRandomVoice = () => REAL_VOICE_IDS[Math.floor(Math.random() * REAL_VOICE_IDS.length)];

const GRADIENT_COMBOS = [
  ['#FF4E00', '#7B2FFF', '#00D4FF'],
  ['#FF006E', '#FB5607', '#FFBE0B'],
  ['#3A86FF', '#8338EC', '#FF006E'],
  ['#06D6A0', '#118AB2', '#FFD166'],
  ['#F72585', '#7209B7', '#4CC9F0'],
  ['#FF9F1C', '#E71D36', '#2EC4B6'],
  ['#00F5D4', '#9B5DE5', '#F15BB5'],
];
const pickGradient = () => GRADIENT_COMBOS[Math.floor(Math.random() * GRADIENT_COMBOS.length)];

const LOADING_VERBS = [
  "Crafting your visual story",
  "Generating scenes",
  "Building slides",
  "Composing frames",
  "Designing visuals",
  "Creating your video",
  "Assembling content",
  "Rendering slides",
  "Preparing your answer",
  "Synthesizing visuals",
];

export default function App() {
  const [showHome, setShowHome] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showCaptions, setShowCaptions] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('auto');
  const [selectedModel, setSelectedModel] = useState('openrouter');
  const [apiKeys, setApiKeys] = useState({ geminiKey: '', elevenLabsKey: '', openRouterKey: '' });
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [captionSize, setCaptionSize] = useState<CaptionSize>('md');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showAvatar, setShowAvatar] = useState(false);
  const canvasGradient = useMemo(() => pickGradient(), []);

  useEffect(() => {
    setApiKeys({
      geminiKey: localStorage.getItem('gemini_api_key') || '',
      elevenLabsKey: localStorage.getItem('elevenlabs_api_key') || '',
      openRouterKey: localStorage.getItem('openrouter_api_key') || '',
    });
  }, []);

  const progress = useProgress(isStreaming);
  // Pick one random voice per session — stable across all slides
  const sessionVoiceRef = useRef(pickRandomVoice());
  const resolvedVoice = selectedVoice === 'auto' ? sessionVoiceRef.current : selectedVoice;
  const { visibleCaption, isSpeaking } = useSlidePlayback(slides, currentSlideIndex, setCurrentSlideIndex, isStreaming, isPlaying, voiceEnabled, resolvedVoice, apiKeys.elevenLabsKey, playbackSpeed);

  const [loadingVerb, setLoadingVerb] = useState(LOADING_VERBS[0]);

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      setLoadingVerb(LOADING_VERBS[Math.floor(Math.random() * LOADING_VERBS.length)]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isStreaming]);

  const handleSubmit = async (query: string, lengthOption: string) => {
    setIsLoading(true);
    setIsStreaming(true);
    setIsPlaying(true);

    const existingSlides = [...slides];
    const startIndex = existingSlides.length;
    setCurrentSlideIndex(startIndex > 0 ? startIndex : 0);

    try {
      await streamSlides(query, lengthOption, selectedModel, existingSlides, apiKeys.geminiKey, (partial) => {
        setSlides([...existingSlides, ...partial]);
        setIsLoading(false);
      }, apiKeys.openRouterKey);
    } catch (err) {
      console.error(err);
      if (err instanceof RateLimitError) {
        setApiKeyError('The API quota is exceeded. Please add your own API key to continue.');
      } else {
        alert("Failed to generate slides. Please check console for details.");
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const currentSlide = slides[currentSlideIndex];

  if (showHome) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="relative flex flex-col h-[100dvh] bg-[#050505] text-white overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #111 0%, #050505 70%)' }}
      >
        {/* Edge border with cross corners */}
        <div className="absolute inset-10 pointer-events-none z-20">
          <div className="absolute inset-0 border border-white/20" />
          {/* Corner crosses */}
          {[['top-0 left-0', '-translate-x-1/2 -translate-y-1/2'], ['top-0 right-0', 'translate-x-1/2 -translate-y-1/2'], ['bottom-0 left-0', '-translate-x-1/2 translate-y-1/2'], ['bottom-0 right-0', 'translate-x-1/2 translate-y-1/2']].map(([pos, translate], i) => (
            <div key={i} className={`absolute ${pos} ${translate}`}>
              <div className="w-[1px] h-5 bg-white/40 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="w-5 h-[1px] bg-white/40 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          ))}
          {/* Header inside box */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4">
            <span className="text-[20px] sm:text-[22px] font-['Space_Grotesk',sans-serif] font-semibold tracking-[-0.02em] text-white/90">AI Youtuber</span>
            <span className="text-[11px] font-mono text-white/80 uppercase tracking-widest">Build with Kiro CLI & ElevenLabs API</span>
          </div>
          {/* Random X marks */}
          {[
            { top: '15%', left: '8%' },
            { top: '72%', right: '12%' },
            { top: '25%', right: '6%' },
            { bottom: '18%', left: '10%' },
            { top: '50%', left: '5%' },
            { bottom: '30%', right: '7%' },
          ].map((style, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, rotate: -20 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.15 }}
              className="absolute text-white/10 text-[14px] font-mono select-none"
              style={style}
            >
              ✕
            </motion.span>
          ))}
        </div>
        {/* Animated glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.03] blur-[120px] pointer-events-none"
        />

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-[48px] sm:text-[68px] md:text-[96px] font-normal tracking-[-0.03em] leading-[1.02] text-center font-['Instrument_Serif',serif]"
          >
            Your question,
            <br />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="text-white"
            >
              as a <span className="italic">video.</span>
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-8 text-[20px] sm:text-[22px] text-white/35 max-w-[600px] text-center leading-[1.6] font-['IBM_Plex_Mono',monospace]"
          >
            Skip the wall of text. Ask anything and get a cinematic video answer — slides, voiceover, visuals — in seconds.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
            onClick={() => setShowHome(false)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-24 h-14 px-14 rounded-full text-white text-[18px] font-['Space_Grotesk',sans-serif] font-bold cursor-pointer flex items-center gap-3 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #FF6520 0%, #FF4E00 50%, #E03A00 100%)', boxShadow: '0 4px 24px rgba(255,78,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)' }}
          >
            Get Started <span className="text-[20px]">→</span>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0A0A0A] text-[#F5F5F5] p-2 sm:p-4 md:p-6 gap-2 sm:gap-4 overflow-hidden">
      {/* Slide Viewport */}
      <div className="flex-1 relative bg-[#121212] border border-[#333] rounded-[24px] sm:rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl min-h-0 group">

        {/* Noisy gradient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 20% 50%, ${canvasGradient[0]}22 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, ${canvasGradient[1]}1a 0%, transparent 55%), radial-gradient(ellipse at 60% 80%, ${canvasGradient[2]}18 0%, transparent 50%)`,
            filter: 'url(#noise)',
          }}
        />
        <svg width="0" height="0" className="absolute">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="overlay" result="blend" />
            <feComposite in="blend" in2="SourceGraphic" operator="in" />
          </filter>
        </svg>

        {/* Content Area */}
        <div className="w-full text-center h-full">
          {!isLoading && slides.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center px-6 h-full">
              <h1 className="text-[36px] sm:text-[48px] md:text-[84px] leading-[0.9] font-light tracking-[-2px] mb-[16px] sm:mb-[24px] font-['Georgia',serif]">AI Youtuber</h1>
              <p className="text-[16px] sm:text-[18px] italic opacity-70 max-w-[500px] mx-auto font-['Georgia',serif]">Ask me a question and I'll break it down shot-by-shot like a YouTube essayist.</p>
            </motion.div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center flex-1 justify-center h-full">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-[64px] sm:text-[96px] md:text-[140px] font-black font-mono tracking-tighter text-[#FF4E00] leading-none mb-4" style={{ textShadow: '0px 0px 40px rgba(255, 78, 0, 0.3)' }}>
                {progress}%
              </motion.div>
              <motion.p key={loadingVerb} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 0.5, y: 0 }} className="text-[16px] uppercase tracking-[0.4em] font-bold">
                {loadingVerb}...
              </motion.p>
            </div>
          )}

          {!isLoading && currentSlide && (
            <>
              <SlideRenderer slide={currentSlide} slideIndex={currentSlideIndex} totalSlides={slides.length} />
              <CaptionOverlay caption={visibleCaption} visible={showCaptions} size={captionSize} />
              <Avatar isSpeaking={isSpeaking && isPlaying} isVisible={showAvatar && slides.length > 0 && !isLoading} />
            </>
          )}
        </div>

        {/* Player Controls — hover overlay */}
        {slides.length > 0 && (
          <PlayerControls
            currentIndex={currentSlideIndex}
            total={slides.length}
            isPlaying={isPlaying}
            voiceEnabled={voiceEnabled}
            showCaptions={showCaptions}
            captionSize={captionSize}
            playbackSpeed={playbackSpeed}
            onSeek={setCurrentSlideIndex}
            onTogglePlay={() => setIsPlaying(p => !p)}
            onToggleVoice={() => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); setVoiceEnabled(v => !v); }}
            onToggleCaptions={() => setShowCaptions(c => !c)}
            onCaptionSizeChange={setCaptionSize}
            onSpeedChange={setPlaybackSpeed}
            showAvatar={showAvatar}
            onToggleAvatar={() => setShowAvatar(a => !a)}
          />
        )}
      </div>

      {/* Input */}
      <InputBar isLoading={isLoading} onSubmit={handleSubmit} selectedVoice={selectedVoice} onVoiceChange={setSelectedVoice} selectedModel={selectedModel} onModelChange={setSelectedModel} onApiKeysChange={setApiKeys} apiKeyError={apiKeyError} onClearApiKeyError={() => setApiKeyError(null)} />
    </div>
  );
}
