import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';
import { Loader2, ArrowUp, Subtitles, Volume2, VolumeX, Play, Pause, ListFilter } from 'lucide-react';
import { Icon } from '@iconify/react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const WikiImage = ({ keyword, className }: { keyword: string, className?: string }) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!keyword) return;
    let isMounted = true;
    const fetchImage = async () => {
      try {
        const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(keyword)}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&origin=*`;
        const res = await fetch(url);
        const data = await res.json();
        const pages = data.query?.pages;
        if (pages) {
          const firstPage = Object.values(pages)[0] as any;
          if (isMounted && firstPage?.imageinfo?.[0]) {
            const info = firstPage.imageinfo[0];
            setImgUrl(info.thumburl || info.url);
          }
        }
      } catch (e) {
        console.error("Wiki fetch error", e);
      }
    };
    fetchImage();
    return () => { isMounted = false; };
  }, [keyword]);

  if (!imgUrl) return <div className={`bg-[#222] animate-pulse ${className}`} />;
  return <img src={imgUrl} className={className} alt={keyword} />;
};

// Helper to safely extract completed slide objects from a streaming incomplete JSON chunk
function parsePartialJsonArray(jsonString: string): any[] {
  const results = [];
  let bracketCount = 0;
  let objectStart = -1;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (char === '\\') { escapeNext = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    if (!inString) {
      if (char === '{') {
        if (bracketCount === 0) objectStart = i;
        bracketCount++;
      } else if (char === '}') {
        bracketCount--;
        if (bracketCount === 0 && objectStart !== -1) {
          try {
            const parsed = JSON.parse(jsonString.substring(objectStart, i + 1));
            results.push(parsed);
          } catch (e) {
            // Ignore partial/invalid json object segments
          }
        }
      }
    }
  }
  return results;
}

interface Slide {
  layout: 'title-overlay' | 'split-image' | 'icon-grid' | 'stats-callout' | 'quote' | 'chart' | 'svg-diagram' | 'image-collage';
  theme?: {
    bg: string;
    text: string;
    accent: string;
    font: 'inter' | 'playfair' | 'space' | 'jetbrains' | 'outfit';
    align: 'left' | 'center' | 'right';
  };
  title: string;
  subtitle?: string;
  content?: string[];
  imageKeyword?: string;
  imageKeywords?: string[]; 
  iconifyNames?: string[]; 
  stats?: { value: string; label: string }[];
  script?: string;
  chartData?: { name: string; value: number }[];
  chartType?: 'bar' | 'line' | 'pie';
  svgCode?: string; 
}

export default function App() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showCaptions, setShowCaptions] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [lengthOption, setLengthOption] = useState<"Short" | "Long" | "Explained">("Short");
  const [showLengthMenu, setShowLengthMenu] = useState(false);
  const [visibleCaption, setVisibleCaption] = useState("");
  const [progress, setProgress] = useState(0);

  const voiceEnabledRef = useRef(voiceEnabled);
  const isPlayingRef = useRef(isPlaying);
  
  useEffect(() => { voiceEnabledRef.current = voiceEnabled; }, [voiceEnabled]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  useEffect(() => {
    if (isStreaming) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 99) return 99;
          const next = p + Math.max(1, Math.floor((99 - p) * 0.08));
          return Math.min(99, next);
        });
      }, 250);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
      const t = setTimeout(() => setProgress(0), 1000);
      return () => clearTimeout(t);
    }
  }, [isStreaming]);

  const generateSlides = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setIsStreaming(true);
    setIsPlaying(true);
    
    const existingSlides = [...slides];
    const startIndex = existingSlides.length;
    
    if (startIndex > 0) {
      setCurrentSlideIndex(startIndex); // Jump to the new slide immediately when it starts
    } else {
      setCurrentSlideIndex(0);
    }
    // We intentionally DO NOT clear setSlides([]) here so we append to History!

    const lengthInstruction = lengthOption === "Short" 
      ? "CRITICAL LENGTH CONSTRAINT: Generate a quick, concise summary. Create EXACTLY 1 to 3 slides MAX."
      : lengthOption === "Long"
      ? "CRITICAL LENGTH CONSTRAINT: Generate a detailed multi-frame storyboard. Create exactly 3 to 10 slides MAX."
      : "CRITICAL LENGTH CONSTRAINT: Generate a deeply comprehensive, highly detailed storyboard. Create 10+ slides explaining every nuance step-by-step.";

    const contextInstruction = startIndex > 0
      ? `You are continuing an ongoing presentation. Previous topics covered: "${existingSlides.slice(-3).map(s => s.title).join(", ")}". \n\nNow, seamlessly continue the presentation by addressing this new input: "${query}"`
      : `You are a charismatic visual storyteller and educator. Your goal is to answer the user's question: "${query}" using a cinematic visual presentation.`;

    try {
      const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: `${contextInstruction}

Each slide is a scene. Speak directly to the viewer in a conversational, enthusiastic tone!

${lengthInstruction}

Structure the flow (if multi-frame):
- Frame 1: The Hook / Intro
- Middle Frames: The Core Explanation
- Final Frame: A powerful concluding thought. (CRITICAL: DO NOT use YouTube tropes like asking the user to "subscribe", "like", or "comment" under any circumstances. Keep it strictly educational and impactful.)

CRITICAL REQUIREMENT: For EVERY single frame, you MUST write a 'script'. This is the exact, verbatim transcript of what you (the charismatic guy/teacher) are saying out loud while this specific slide is on the screen. Make the script energetic, natural, and educational.
EXTREMELY IMPORTANT SYNCHRONIZATION: The speaker MUST explicitly acknowledge and refer to the visual elements on the screen! You are presenting a visual deck, not just talking in a void.
- If you use a 'chart', say "Take a look at this chart here, you can see..."
- If you use a 'stats-callout', say "Notice this massive number on the screen..."
- If you use 'split-image' or 'image-collage', say "Look at this image..."
- If you use 'icon-grid' or 'svg-diagram', say "Let's break down this diagram on screen..."
The voice and the visual layout MUST feel perfectly synchronized and context-aware.

CRITICAL REQUIREMENT: For EVERY single frame, you MUST include a 'theme' object specifying the design system. Match the mood of the slide!
- bg: Background color hex code (Must be dark and moody like "#080808", "#120822", "#0a1f10").
- text: Main text color hex code (Must be ultra-bright for contrast like "#ffffff", "#f0f0f0").
- accent: Punchy accent color hex code for highlights/subtitles (e.g., "#FF4E00", "#00FFCC", "#FF00FF", "#EAB308").
- font: Choose from ['inter', 'playfair', 'space', 'jetbrains', 'outfit']. Mix it up (e.g. use 'playfair' for history, 'jetbrains' for code).
- align: Choose text alignment from ['left', 'center', 'right'].

Available strict layout scenes:
1. "title-overlay": Dramatic full-screen title. Provide 'imageKeyword' (1-3 words) for a Wikipedia image search background.
2. "split-image": Conversational text paired with B-roll. Provide 'imageKeyword' (1-3 words) and 'content' bullets.
3. "icon-grid": Explaining concepts using specific icons. Provide 2-4 'content' strings and matching 'iconifyNames' (e.g. 'mdi:brain', 'logos:react', 'twemoji:fire').
4. "stats-callout": Highlighting massive numbers or facts. Provide 1-3 'stats' (value and label).
5. "quote": A powerful statement. Provide 'title' (the quote) and 'subtitle' (the speaker/context).
6. "chart": Display a chart showing data trends. Provide 'chartType' ('bar', 'line', 'pie') and 'chartData' (array of {name, value}).
7. "svg-diagram": Create any geometry, shape, diagram, or flowchart. Provide raw valid SVG string in 'svgCode'. Use viewBox="0 0 400 400".
8. "image-collage": Display multiple images. Provide an array of 2 to 4 'imageKeywords' for Wikipedia image search.

Return a JSON array of these frames.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                theme: {
                  type: Type.OBJECT,
                  properties: {
                    bg: { type: Type.STRING },
                    text: { type: Type.STRING },
                    accent: { type: Type.STRING },
                    font: { type: Type.STRING },
                    align: { type: Type.STRING },
                  }
                },
                layout: { type: Type.STRING },
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                content: { type: Type.ARRAY, items: { type: Type.STRING } },
                imageKeyword: { type: Type.STRING },
                imageKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                script: { type: Type.STRING },
                iconifyNames: { type: Type.ARRAY, items: { type: Type.STRING } },
                chartType: { type: Type.STRING },
                svgCode: { type: Type.STRING },
                chartData: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: { 
                      name: { type: Type.STRING }, 
                      value: { type: Type.NUMBER } 
                    } 
                  } 
                },
                stats: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: { 
                      value: { type: Type.STRING }, 
                      label: { type: Type.STRING } 
                    } 
                  } 
                }
              },
              required: ["layout", "title"]
            }
          }
        }
      });
      
      let accumulatedText = "";
      let lastUpdateTime = 0;
      
      for await (const chunk of responseStream) {
        accumulatedText += chunk.text;
        
        const now = Date.now();
        if (now - lastUpdateTime > 200) {
          const parsedSlides = parsePartialJsonArray(accumulatedText) as Slide[];
          if (parsedSlides.length > 0) {
            setSlides([...existingSlides, ...parsedSlides]);
            setIsLoading(false);
          }
          lastUpdateTime = now;
        }
      }
      
      // Final parse guarantee
      const finalParsedSlides = parsePartialJsonArray(accumulatedText) as Slide[];
      if (finalParsedSlides.length > 0) {
        setSlides([...existingSlides, ...finalParsedSlides]);
        setIsLoading(false);
      }
      
    } catch (err) {
      console.error(err);
      alert("Failed to generate slides. Please check console for details.");
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setQuery("");
    }
  };

  // Voice and Automatic Synchronization functionality (Sentence by Sentence)
  useEffect(() => {
    if (slides.length === 0 || !slides[currentSlideIndex]) return;

    // Do not trigger immediately if the current slide is still streaming its text
    const isCurrentSlideStillTyping = isStreaming && slides.length === currentSlideIndex + 1;
    if (isCurrentSlideStillTyping) return;

    let timeoutId: NodeJS.Timeout;
    let fallbackElapsed = 0;
    let canceled = false;
    
    // Split script into sentences
    const script = slides[currentSlideIndex].script || "Next slide.";
    const sentences = script.match(/[^.!?]+[.!?]*/g)?.map(s => s.trim()).filter(Boolean) || [script];
    let sentenceIdx = 0;
    
    // Manage pause/resume state directly inside the effect
    const tickerInterval = setInterval(() => {
      if (canceled) return;
      if (!isPlayingRef.current) {
        if (voiceEnabledRef.current && 'speechSynthesis' in window && !window.speechSynthesis.paused && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
        }
      } else {
        if (voiceEnabledRef.current && 'speechSynthesis' in window && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    }, 100);

    const playNextSentence = () => {
      if (canceled) return;
      
      if (sentenceIdx >= sentences.length) {
        // Slide finished - wait for isPlaying before advancing
        const checkAdvance = setInterval(() => {
          if (canceled) { clearInterval(checkAdvance); return; }
          if (isPlayingRef.current) {
            clearInterval(checkAdvance);
            if (currentSlideIndex < slides.length - 1) {
              setCurrentSlideIndex(c => c + 1);
            }
          }
        }, 100);
        return;
      }

      const currentText = sentences[sentenceIdx];
      setVisibleCaption(currentText);

      // We wait for it to be playing before starting a *new* utterance or fallback timer block
      const startSentenceLogic = () => {
        if (canceled) return;
        if (!isPlayingRef.current) {
          timeoutId = setTimeout(startSentenceLogic, 100);
          return;
        }

        if (voiceEnabledRef.current && 'speechSynthesis' in window) {
           const utterance = new SpeechSynthesisUtterance(currentText);
           utterance.rate = 1.05; // Slightly enthusiastic pace
           
           const setVoice = () => {
              const voices = window.speechSynthesis.getVoices();
              const bestVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha")) || voices[0];
              if (bestVoice) utterance.voice = bestVoice;
           };
           setVoice();
           if (window.speechSynthesis.onvoiceschanged !== undefined) {
              window.speechSynthesis.onvoiceschanged = setVoice;
           }

           utterance.onend = () => {
             if (canceled) return;
             sentenceIdx++;
             playNextSentence();
           };
           utterance.onerror = () => {
             if (canceled) return;
             sentenceIdx++;
             playNextSentence();
           };

           window.speechSynthesis.speak(utterance);
        } else {
           // Fallback logic manually respects pause via the elapsed tracker
           fallbackElapsed = 0;
           const duration = Math.max(1500, currentText.length * 60);

           const tick = () => {
             if (canceled) return;
             if (isPlayingRef.current) {
               fallbackElapsed += 100;
             }
             if (fallbackElapsed >= duration) {
               sentenceIdx++;
               playNextSentence();
             } else {
               timeoutId = setTimeout(tick, 100);
             }
           };
           tick();
        }
      };

      startSentenceLogic();
    };

    if (voiceEnabledRef.current && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Firefox fix: slight delay before speaking immediately after cancel
      timeoutId = setTimeout(() => {
        playNextSentence();
      }, 50);
    } else {
      playNextSentence();
    }

    return () => {
      canceled = true;
      clearInterval(tickerInterval);
      clearTimeout(timeoutId);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentSlideIndex, slides.length, isStreaming]); // Refs are used for autoplay and voice to prevent constant sentence restarts

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0A0A0A] text-[#F5F5F5] p-2 sm:p-4 md:p-6 gap-2 sm:gap-4 overflow-hidden">
      
      {/* Slide Viewport - Fills max space */}
      <div className="flex-1 relative bg-[#121212] border border-[#333] rounded-[24px] sm:rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl min-h-0">
        
        {/* Status */}
        <div className="absolute top-[20px] md:top-[40px] left-[20px] md:left-[40px] text-[11px] tracking-[0.3em] font-bold uppercase transition-opacity flex items-center gap-3 z-50">
          {isStreaming && (
            <span className="text-[#FF4E00] flex items-center gap-2 opacity-80 bg-[#FF4E00]/10 px-2.5 py-1 rounded-[2px] border border-[#FF4E00]/20 font-mono">
              {progress}%
            </span>
          )}
        </div>

        {/* Nav Dots */}
        {slides.length > 0 && (
          <div className="absolute bottom-[30px] md:bottom-[40px] w-full flex justify-center gap-[12px] z-50 pointer-events-none">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`w-[6px] h-[6px] rounded-full transition-colors duration-300 ${i === currentSlideIndex ? 'bg-[#FF4E00]' : 'bg-white/20'}`}
              />
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="w-full text-center h-full">
          {/* Empty State */}
          {!isLoading && slides.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center px-6"
            >
              <h1 className="text-[36px] sm:text-[48px] md:text-[84px] leading-[0.9] font-light tracking-[-2px] mb-[16px] sm:mb-[24px] font-['Georgia',serif]">
                Video Studio
              </h1>
              <p className="text-[16px] sm:text-[18px] italic opacity-70 max-w-[500px] mx-auto font-['Georgia',serif]">
                Ask me a question and I'll break it down shot-by-shot like a YouTube essayist.
              </p>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center flex-1 justify-center h-full">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[64px] sm:text-[96px] md:text-[140px] font-black font-mono tracking-tighter text-[#FF4E00] leading-none mb-4"
                style={{ textShadow: '0px 0px 40px rgba(255, 78, 0, 0.3)' }}
              >
                {progress}%
              </motion.div>
              <p className="text-[16px] uppercase tracking-[0.4em] font-bold opacity-50">Synthesizing...</p>
            </div>
          )}

          {/* Slides */}
          {!isLoading && slides.length > 0 && slides[currentSlideIndex] && (
            <div className="relative flex justify-center w-full h-full min-h-0 overflow-y-auto sm:overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlideIndex}
                  initial={{ opacity: 0, y: 30, filter: "blur(8px)", scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1, backgroundColor: slides[currentSlideIndex]?.theme?.bg || 'transparent' }}
                  exit={{ opacity: 0, y: -30, filter: "blur(8px)", scale: 1.02 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className={`w-full min-h-full absolute inset-0 flex items-center justify-center p-4 md:p-8 overflow-y-auto sm:overflow-hidden rounded-[24px] sm:rounded-3xl text-${slides[currentSlideIndex]?.theme?.align || 'center'}`}
                  style={{ color: slides[currentSlideIndex]?.theme?.text || '#ffffff' }}
                >
                  
                  {/* Layout: TITLE OVERLAY */}
                  {slides[currentSlideIndex]?.layout === 'title-overlay' && (
                    <div className={`relative w-full h-full flex flex-col items-${slides[currentSlideIndex]?.theme?.align === 'left' ? 'start' : slides[currentSlideIndex]?.theme?.align === 'right' ? 'end' : 'center'} justify-center overflow-hidden`}>
                      {slides[currentSlideIndex].imageKeyword && (
                        <>
                          <div className="absolute inset-0 bg-black/70 z-10" />
                          <WikiImage 
                            keyword={slides[currentSlideIndex].imageKeyword!} 
                            className="absolute inset-0 w-full h-full object-cover z-0" 
                          />
                        </>
                      )}
                      <div className="relative z-20 max-w-[80%]">
                        <motion.h2 initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.2}} className={`text-[32px] sm:text-[50px] md:text-[72px] font-bold tracking-tight mb-4 leading-none font-${slides[currentSlideIndex]?.theme?.font || 'inter'}`}>
                          {slides[currentSlideIndex].title}
                        </motion.h2>
                        {slides[currentSlideIndex].subtitle && (
                          <motion.p initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.4}} className={`text-[16px] sm:text-[20px] md:text-[24px] font-medium italic font-${slides[currentSlideIndex]?.theme?.font || 'inter'}`} style={{ color: slides[currentSlideIndex]?.theme?.accent || '#FF4E00' }}>
                            {slides[currentSlideIndex].subtitle}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Layout: SPLIT IMAGE */}
                  {slides[currentSlideIndex]?.layout === 'split-image' && (
                    <div className={`flex flex-col md:flex-row w-full h-full md:gap-8 lg:gap-12 items-center text-${slides[currentSlideIndex]?.theme?.align || 'left'} max-w-[1200px]`}>
                      <div className="flex-1 flex flex-col justify-center w-full px-4 sm:px-8 py-8 md:py-0 md:px-0 md:pl-12 lg:pl-16 z-20">
                        <motion.h2 initial={{x:-20, opacity:0}} animate={{x:0, opacity:1}} className={`text-[24px] sm:text-[32px] md:text-[40px] font-bold mb-4 leading-[1.1] font-${slides[currentSlideIndex]?.theme?.font || 'inter'}`}>
                          {slides[currentSlideIndex].title}
                        </motion.h2>
                        {slides[currentSlideIndex].subtitle && (
                          <motion.p initial={{x:-20, opacity:0}} animate={{x:0, opacity:1}} transition={{delay:0.1}} className={`text-[12px] sm:text-[14px] md:text-[16px] mb-4 sm:mb-6 font-bold uppercase tracking-widest`} style={{ color: slides[currentSlideIndex]?.theme?.accent || '#FF4E00' }}>
                            {slides[currentSlideIndex].subtitle}
                          </motion.p>
                        )}
                        {slides[currentSlideIndex].content && (
                          <div className={`flex flex-col gap-3 sm:gap-4 text-[14px] sm:text-[16px] xl:text-[18px] opacity-80 leading-relaxed font-${slides[currentSlideIndex]?.theme?.font==='jetbrains' ? 'jetbrains' : 'playfair'} italic`}>
                            {slides[currentSlideIndex].content.map((p, i) => (
                               <motion.p key={i} initial={{x:-20, opacity:0}} animate={{x:0, opacity:1}} transition={{delay:0.2 + (i*0.1)}}>{p}</motion.p>
                            ))}
                          </div>
                        )}
                      </div>
                      {slides[currentSlideIndex].imageKeyword && (
                        <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{delay:0.3}} className="w-full h-[200px] sm:h-[250px] md:flex-1 md:h-full relative overflow-hidden shrink-0">
                           <WikiImage keyword={slides[currentSlideIndex].imageKeyword!} className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-700" />
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Layout: ICON GRID */}
                  {slides[currentSlideIndex]?.layout === 'icon-grid' && (
                    <div className="flex flex-col w-full max-w-[900px] h-full justify-center px-4 md:px-0 py-8 md:py-0">
                      <div className="text-center mb-6 sm:mb-10">
                        <motion.h2 initial={{y:-20, opacity:0}} animate={{y:0, opacity:1}} className={`text-[28px] sm:text-[36px] md:text-[48px] font-bold mb-2 sm:mb-4 tracking-tight font-${slides[currentSlideIndex]?.theme?.font || 'inter'}`}>
                          {slides[currentSlideIndex].title}
                        </motion.h2>
                        {slides[currentSlideIndex].subtitle && (
                          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}} className={`text-[14px] sm:text-[16px] md:text-[18px] font-playfair italic`} style={{ color: slides[currentSlideIndex]?.theme?.accent || '#FF4E00' }}>
                            {slides[currentSlideIndex].subtitle}
                          </motion.p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
                        {slides[currentSlideIndex].content?.map((text, i) => {
                           const iconName = slides[currentSlideIndex].iconifyNames?.[i] || 'mdi:star';
                           return (
                             <motion.div initial={{y: 20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay: i * 0.15}} key={i} className="flex gap-3 sm:gap-4 items-start bg-black/20 p-4 sm:p-5 rounded-xl border border-white/10 backdrop-blur-md">
                               <div className="p-2 sm:p-3 bg-white/10 rounded-lg shrink-0 flex items-center justify-center" style={{ color: slides[currentSlideIndex]?.theme?.accent || '#FF4E00' }}>
                                 <Icon icon={iconName} className="w-6 h-6 sm:w-8 sm:h-8" />
                               </div>
                               <p className="text-[14px] sm:text-[16px] leading-relaxed opacity-90 pt-1 font-inter text-left">{text}</p>
                             </motion.div>
                           );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Layout: STATS CALLOUT */}
                  {slides[currentSlideIndex]?.layout === 'stats-callout' && (
                    <div className="flex flex-col w-full max-w-[900px] h-full justify-center text-center px-4 py-8">
                      <motion.h2 initial={{y:-20, opacity:0}} animate={{y:0, opacity:1}} className={`text-[28px] sm:text-[40px] font-bold mb-10 sm:mb-16 font-${slides[currentSlideIndex]?.theme?.font || 'inter'}`}>
                        {slides[currentSlideIndex].title}
                      </motion.h2>
                      <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
                        {slides[currentSlideIndex].stats?.map((stat, i) => (
                          <motion.div initial={{scale: 0.8, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay: i * 0.2}} key={i} className="flex flex-col items-center">
                            <span className="text-[48px] sm:text-[60px] md:text-[80px] font-black leading-none mb-2 tracking-tighter" style={{ color: slides[currentSlideIndex]?.theme?.accent || '#FF4E00' }}>
                              {stat.value}
                            </span>
                            <span className="text-[14px] sm:text-[16px] md:text-[20px] uppercase tracking-widest opacity-60 font-bold">
                              {stat.label}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Layout: QUOTE */}
                  {(slides[currentSlideIndex]?.layout === 'quote' || !slides[currentSlideIndex]?.layout) && (
                    <div className="flex flex-col w-full max-w-[800px] h-full justify-center text-center items-center px-6">
                      <motion.span initial={{opacity:0}} animate={{opacity:0.4}} className="text-[80px] sm:text-[120px] leading-[0] font-playfair mb-6 sm:mb-8 w-full text-left" style={{ color: slides[currentSlideIndex]?.theme?.accent || '#FF4E00' }}>
                        "
                      </motion.span>
                      <motion.h2 initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.2}} className={`text-[24px] sm:text-[32px] md:text-[46px] font-medium italic mb-8 sm:mb-12 leading-tight font-${slides[currentSlideIndex]?.theme?.font || 'playfair'}`}>
                        {slides[currentSlideIndex].title}
                      </motion.h2>
                      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}} className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-8 sm:w-12 h-[2px]" style={{ backgroundColor: slides[currentSlideIndex]?.theme?.accent || '#FF4E00' }} />
                        <span className="text-[14px] sm:text-[16px] md:text-[20px] font-bold uppercase tracking-widest opacity-80">
                          {slides[currentSlideIndex].subtitle || slides[currentSlideIndex].content?.[0]}
                        </span>
                      </motion.div>
                    </div>
                  )}

                  {/* Layout: CHART */}
                  {slides[currentSlideIndex]?.layout === 'chart' && (
                    <div className="flex flex-col w-full h-full max-w-[900px] justify-center items-center text-center px-4 sm:px-8 z-20 py-8">
                      <motion.h2 initial={{y:-20, opacity:0}} animate={{y:0, opacity:1}} className={`text-[24px] sm:text-[32px] md:text-[40px] font-bold mb-2 sm:mb-4 font-${slides[currentSlideIndex]?.theme?.font || 'inter'}`}>
                        {slides[currentSlideIndex].title}
                      </motion.h2>
                      {slides[currentSlideIndex].subtitle && (
                          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}} className={`text-[14px] sm:text-[16px] font-playfair italic mb-4 sm:mb-6`} style={{ color: slides[currentSlideIndex]?.theme?.accent || '#FF4E00' }}>
                            {slides[currentSlideIndex].subtitle}
                          </motion.p>
                      )}
                      
                      <motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} transition={{delay: 0.3}} className="w-full h-[250px] sm:h-[300px] md:h-[400px] bg-black/20 p-2 sm:p-4 rounded-xl border border-white/10 mt-2 backdrop-blur-md">
                        {slides[currentSlideIndex].chartData && (
                          <ResponsiveContainer width="100%" height="100%">
                             {slides[currentSlideIndex].chartType === 'pie' ? (
                               <PieChart>
                                 <Pie data={slides[currentSlideIndex].chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                   {slides[currentSlideIndex].chartData?.map((entry, index) => <Cell key={index} fill={index % 2 === 0 ? (slides[currentSlideIndex]?.theme?.accent || '#FF4E00') : '#ffffff'}/>)}
                                 </Pie>
                                 <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', color: '#fff'}} itemStyle={{color: '#fff'}} />
                               </PieChart>
                            ) : slides[currentSlideIndex].chartType === 'line' ? (
                               <LineChart data={slides[currentSlideIndex].chartData} margin={{top: 20, right: 20, bottom: 20, left: 0}}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                 <XAxis dataKey="name" stroke="#888" tick={{fill: '#888'}} />
                                 <YAxis stroke="#888" tick={{fill: '#888'}} />
                                 <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', color: '#fff'}} />
                                 <Line type="monotone" dataKey="value" stroke={slides[currentSlideIndex]?.theme?.accent || '#FF4E00'} strokeWidth={3} dot={{fill: slides[currentSlideIndex]?.theme?.accent || '#FF4E00', r: 6}} />
                               </LineChart>
                            ) : (
                               <BarChart data={slides[currentSlideIndex].chartData} margin={{top: 20, right: 20, bottom: 20, left: 0}}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                                 <XAxis dataKey="name" stroke="#888" tick={{fill: '#888'}} />
                                 <YAxis stroke="#888" tick={{fill: '#888'}} />
                                 <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', color: '#fff'}} cursor={{fill: '#222'}} />
                                 <Bar dataKey="value" fill={slides[currentSlideIndex]?.theme?.accent || '#FF4E00'} radius={[4,4,0,0]} />
                               </BarChart>
                            )}
                          </ResponsiveContainer>
                        )}
                      </motion.div>
                    </div>
                  )}

                  {/* Layout: SVG DIAGRAM */}
                  {slides[currentSlideIndex]?.layout === 'svg-diagram' && slides[currentSlideIndex].svgCode && (
                    <div className="flex flex-col md:flex-row w-full h-full max-w-[1000px] gap-6 sm:gap-8 items-center justify-center p-4 sm:p-8 z-20">
                      <div className="flex-1 flex flex-col items-center md:items-start justify-center text-center md:text-left">
                        <motion.h2 initial={{x:-20, opacity:0}} animate={{x:0, opacity:1}} className={`text-[28px] sm:text-[32px] md:text-[40px] font-bold mb-2 sm:mb-4 leading-tight font-${slides[currentSlideIndex]?.theme?.font || 'inter'}`}>
                          {slides[currentSlideIndex].title}
                        </motion.h2>
                        {slides[currentSlideIndex].subtitle && (
                          <motion.p initial={{x:-20, opacity:0}} animate={{x:0, opacity:1}} transition={{delay:0.1}} className={`text-[14px] sm:text-[16px] md:text-[18px] mb-4 sm:mb-6 font-playfair italic`} style={{ color: slides[currentSlideIndex]?.theme?.accent || '#FF4E00' }}>
                            {slides[currentSlideIndex].subtitle}
                          </motion.p>
                        )}
                      </div>
                      <motion.div
                        initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} transition={{delay: 0.2}}
                        className="w-full sm:w-auto md:flex-1 max-w-[300px] md:max-w-[400px] aspect-square flex items-center justify-center bg-white/5 rounded-[24px] sm:rounded-3xl p-4 sm:p-6 border border-white/10 shrink-0"
                        style={{ color: slides[currentSlideIndex]?.theme?.accent || '#ffffff' }}
                        dangerouslySetInnerHTML={{ __html: slides[currentSlideIndex].svgCode || '' }}
                      />
                    </div>
                  )}

                  {/* Layout: IMAGE COLLAGE */}
                  {slides[currentSlideIndex]?.layout === 'image-collage' && (
                    <div className="flex flex-col w-full h-full justify-center items-center p-4 z-20 max-w-[1000px]">
                      <motion.h2 initial={{y:-20, opacity:0}} animate={{y:0, opacity:1}} className={`text-[28px] sm:text-[32px] md:text-[40px] font-bold mb-6 md:mb-8 text-center font-${slides[currentSlideIndex]?.theme?.font || 'inter'}`}>
                        {slides[currentSlideIndex].title}
                      </motion.h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full auto-rows-[200px] sm:auto-rows-[250px]">
                        {slides[currentSlideIndex].imageKeywords?.map((kw, i) => (
                           <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay: i*0.15}} key={i} className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border border-white/10 bg-[#1a1a1a]">
                             <WikiImage keyword={kw} className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-700" />
                             <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4 text-left">
                               <p className="text-sm font-bold text-white uppercase tracking-wider opacity-90 truncate">{kw}</p>
                             </div>
                           </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Caption Overlay */}
                  {showCaptions && visibleCaption && (
                    <div 
                      className="absolute bottom-10 md:bottom-16 left-1/2 -translate-x-1/2 z-50 text-center w-[95%] max-w-[800px] pointer-events-none"
                    >
                      <p 
                        className="text-white text-[20px] sm:text-[26px] md:text-[32px] font-['Poppins',sans-serif] font-bold leading-snug tracking-wide"
                        style={{ textShadow: '0px 2px 10px rgba(0,0,0,0.8), 0px 4px 20px rgba(0,0,0,0.6)' }}
                      >
                        <motion.span
                          key={visibleCaption}
                          initial="hidden"
                          animate="visible"
                          variants={{
                            hidden: { opacity: 1 },
                            visible: {
                              opacity: 1,
                              transition: { staggerChildren: 0.02 }
                            }
                          }}
                        >
                          {visibleCaption.split("").map((char, index) => (
                            <motion.span
                              key={index}
                              variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1 }
                              }}
                            >
                              {char}
                            </motion.span>
                          ))}
                        </motion.span>
                      </p>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Seekbar and Control Buttons */}
      {slides.length > 0 && (
        <div className="flex-none flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-8 mt-2 mb-2 shrink-0 max-w-[1200px] mx-auto w-full">
          
          {/* YouTube-like Seekbar */}
          <div className="flex-1 w-full flex items-center gap-3">
            <span className="text-xs font-mono opacity-50 w-12 text-right">{currentSlideIndex + 1}</span>
            <input 
              type="range"
              min="0"
              max={slides.length - 1}
              value={currentSlideIndex}
              onChange={(e) => {
                const newIndex = parseInt(e.target.value);
                setCurrentSlideIndex(newIndex);
              }}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer focus:outline-none focus:bg-white/30 accent-[#FF4E00] hover:accent-[#FF8C00] transition-all"
            />
            <span className="text-xs font-mono opacity-50 w-12 text-left">{slides.length}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button 
              onClick={() => setIsPlaying(p => !p)}
              className={`p-2 sm:p-2 ${isPlaying ? 'opacity-100 text-[#FF4E00] bg-[#FF4E00]/10 hover:bg-[#FF4E00]/20' : 'opacity-60 hover:opacity-100 text-white hover:bg-white/10'} rounded-full cursor-pointer transition-all border-none focus:outline-none flex items-center justify-center`}
              aria-label="Toggle Playback"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <button 
              onClick={() => {
                if ('speechSynthesis' in window) {
                  // We cancel the speech immediately and handle restarting automatically via the useEffect triggering on toggle
                  window.speechSynthesis.cancel();
                }
                setVoiceEnabled(v => !v);
              }}
              className={`p-2 sm:p-2 ${voiceEnabled ? 'opacity-100 text-white bg-white/20 hover:bg-white/30' : 'opacity-40 hover:opacity-100 text-white hover:bg-white/10'} rounded-full cursor-pointer transition-all border-none focus:outline-none flex items-center justify-center`}
              aria-label="Toggle Voice"
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button 
              onClick={() => setShowCaptions(c => !c)}
              className={`p-2 sm:p-2 ${showCaptions ? 'opacity-100 text-white bg-white/20 hover:bg-white/30' : 'opacity-40 hover:opacity-100 text-white hover:bg-white/10'} rounded-full cursor-pointer transition-all border-none focus:outline-none flex items-center justify-center`}
              aria-label="Toggle Captions"
            >
              <Subtitles className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="flex-none flex items-center justify-center w-full shrink-0 pb-1 sm:pb-2">
        <form onSubmit={generateSlides} className="w-full max-w-[800px] px-2 sm:px-6">
          <div className="relative flex items-center w-full bg-[#2F2F2F] border border-[#444] rounded-full px-2 py-1 shadow-md focus-within:border-[#666] transition-colors duration-300">
            <div className="relative">
              <button 
                type="button" 
                onClick={() => setShowLengthMenu(!showLengthMenu)}
                className="flex items-center gap-2 pl-3 pr-4 py-2 text-[13px] font-bold text-white/70 hover:text-white transition-colors"
              >
                <ListFilter className="w-4 h-4" />
                <span className="hidden sm:inline">{lengthOption}</span>
              </button>

              {showLengthMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-32 bg-[#1A1A1A] border border-[#333] rounded-xl shadow-2xl overflow-hidden z-50 py-1">
                  {["Short", "Long", "Explained"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setLengthOption(opt as any);
                        setShowLengthMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[13px] font-bold transition-colors ${
                        lengthOption === opt 
                          ? 'bg-[#FF4E00]/20 text-[#FF4E00]' 
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full bg-transparent border-none py-3 pl-2 pr-12 text-[16px] text-white outline-none placeholder:text-[#999] font-sans"
              disabled={isLoading}
              onFocus={() => setShowLengthMenu(false)}
            />
            <button 
              type="submit" 
              disabled={isLoading || !query.trim()}
              className="absolute right-2.5 w-8 h-8 flex items-center justify-center bg-white text-[#0A0A0A] rounded-full opacity-80 hover:opacity-100 disabled:opacity-30 disabled:bg-[#555] disabled:text-[#888] transition-all"
              aria-label="Generate"
            >
               <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

