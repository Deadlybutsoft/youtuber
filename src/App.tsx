import { useState } from 'react';
import { motion } from 'motion/react';
import { Slide } from './types/slide';
import { streamSlides } from './services/ai';
import { useProgress } from './hooks/useProgress';
import { useSlidePlayback } from './hooks/useSlidePlayback';
import SlideRenderer from './components/SlideRenderer';
import CaptionOverlay from './components/CaptionOverlay';
import PlayerControls from './components/PlayerControls';
import InputBar from './components/InputBar';

export default function App() {
  const [showHome, setShowHome] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showCaptions, setShowCaptions] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const progress = useProgress(isStreaming);
  const visibleCaption = useSlidePlayback(slides, currentSlideIndex, setCurrentSlideIndex, isStreaming, isPlaying, voiceEnabled);

  const handleSubmit = async (query: string, lengthOption: string) => {
    setIsLoading(true);
    setIsStreaming(true);
    setIsPlaying(true);

    const existingSlides = [...slides];
    const startIndex = existingSlides.length;
    setCurrentSlideIndex(startIndex > 0 ? startIndex : 0);

    try {
      const finalSlides = await streamSlides(query, lengthOption, existingSlides, (partial) => {
        setSlides([...existingSlides, ...partial]);
        setIsLoading(false);
      });
      if (finalSlides.length > 0) {
        setSlides([...existingSlides, ...finalSlides]);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate slides. Please check console for details.");
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
            Ask anything.
            <br />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="text-white"
            >
              <span className="italic">Watch</span> the answer.
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-8 text-[20px] sm:text-[22px] text-white/35 max-w-[700px] text-center leading-[1.6] font-['IBM_Plex_Mono',monospace]"
          >
            Ask any question. Instead of a text answer, Youtuber generates a video with slides and AI voiceover, just like a YouTuber explaining it to you.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
            onClick={() => setShowHome(false)}
            whileHover={{ backgroundColor: 'rgba(255,255,255,1)', color: 'rgba(0,0,0,1)' }}
            whileTap={{ scale: 0.98 }}
            className="mt-10 h-14 px-14 rounded-full bg-white/90 text-black text-[18px] font-['Space_Grotesk',sans-serif] font-bold transition-all duration-200 cursor-pointer flex items-center gap-3"
          >
            Get Started <span className="text-[20px]">→</span>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative flex flex-col h-[100dvh] bg-[#050505] text-white overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #111 0%, #050505 70%)' }}
    >
      {/* Ambient glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-[100px] pointer-events-none" />

      {/* Border frame with cross corners */}
      <div className="absolute inset-6 sm:inset-8 md:inset-10 pointer-events-none z-20">
        <div className="absolute inset-0 border border-white/15" />
        {[['top-0 left-0', '-translate-x-1/2 -translate-y-1/2'], ['top-0 right-0', 'translate-x-1/2 -translate-y-1/2'], ['bottom-0 left-0', '-translate-x-1/2 translate-y-1/2'], ['bottom-0 right-0', 'translate-x-1/2 translate-y-1/2']].map(([pos, translate], i) => (
          <div key={i} className={`absolute ${pos} ${translate}`}>
            <div className="w-[1px] h-5 bg-white/40 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
            <div className="w-5 h-[1px] bg-white/40 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-30 flex items-center justify-between px-10 sm:px-12 md:px-14 pt-8 sm:pt-10 md:pt-12">
        <button onClick={() => setShowHome(true)} className="text-[20px] sm:text-[22px] font-['Space_Grotesk',sans-serif] font-semibold tracking-[-0.02em] text-white/90 hover:text-white transition-colors cursor-pointer bg-transparent border-none">
          AI Youtuber
        </button>
        <div className="flex items-center gap-4">
          {isStreaming && (
            <span className="text-[11px] font-mono text-[#FF4E00] uppercase tracking-widest bg-[#FF4E00]/10 px-3 py-1 border border-[#FF4E00]/20">
              {progress}%
            </span>
          )}
          <span className="text-[11px] font-mono text-white/50 uppercase tracking-widest hidden sm:inline">
            {slides.length > 0 ? `${currentSlideIndex + 1} / ${slides.length}` : 'Ready'}
          </span>
        </div>
      </div>

      {/* Slide Viewport */}
      <div className="relative z-10 flex-1 flex items-center justify-center mx-6 sm:mx-8 md:mx-10 min-h-0 overflow-hidden">
        {/* Nav Dots */}
        {slides.length > 0 && (
          <div className="absolute bottom-4 md:bottom-6 w-full flex justify-center gap-3 z-50 pointer-events-none">
            {slides.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentSlideIndex ? 'bg-white scale-125' : 'bg-white/20'}`} />
            ))}
          </div>
        )}

        <div className="w-full text-center h-full">
          {!isLoading && slides.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-col items-center justify-center px-6 h-full"
            >
              <h1 className="text-[40px] sm:text-[56px] md:text-[80px] font-normal tracking-[-0.03em] leading-[1.05] text-center font-['Instrument_Serif',serif]">
                What do you want
                <br />
                <span className="italic text-white/70">to learn today?</span>
              </h1>
              <p className="mt-6 text-[16px] sm:text-[18px] text-white/30 max-w-[500px] text-center leading-[1.6] font-['IBM_Plex_Mono',monospace]">
                Type a question below and watch the answer unfold.
              </p>
            </motion.div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[64px] sm:text-[96px] md:text-[120px] font-['Space_Grotesk',sans-serif] font-bold tracking-tighter text-white/90 leading-none mb-4"
              >
                {progress}<span className="text-white/30">%</span>
              </motion.div>
              <p className="text-[12px] uppercase tracking-[0.4em] font-['IBM_Plex_Mono',monospace] text-white/30">
                Synthesizing...
              </p>
            </div>
          )}

          {!isLoading && currentSlide && (
            <>
              <SlideRenderer slide={currentSlide} slideIndex={currentSlideIndex} />
              <CaptionOverlay caption={visibleCaption} visible={showCaptions} />
            </>
          )}
        </div>
      </div>

      {/* Player Controls */}
      {slides.length > 0 && (
        <PlayerControls
          currentIndex={currentSlideIndex}
          total={slides.length}
          isPlaying={isPlaying}
          voiceEnabled={voiceEnabled}
          showCaptions={showCaptions}
          onSeek={setCurrentSlideIndex}
          onTogglePlay={() => setIsPlaying(p => !p)}
          onToggleVoice={() => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); setVoiceEnabled(v => !v); }}
          onToggleCaptions={() => setShowCaptions(c => !c)}
        />
      )}

      {/* Input */}
      <InputBar isLoading={isLoading} onSubmit={handleSubmit} />
    </motion.div>
  );
}
