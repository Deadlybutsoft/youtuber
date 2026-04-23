import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Slide } from '../types/slide';

const ttsCache = new Map<string, string>();

function fetchTts(text: string, voiceId: string, elevenLabsKey: string): Promise<string | null> {
  const cacheKey = `${voiceId}:${text}`;
  if (ttsCache.has(cacheKey)) return Promise.resolve(ttsCache.get(cacheKey)!);
  return fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice_id: voiceId, ...(elevenLabsKey && { elevenLabsKey }) }),
  })
    .then(res => res.ok ? res.blob() : null)
    .then(blob => {
      if (!blob) return null;
      const url = URL.createObjectURL(blob);
      ttsCache.set(cacheKey, url);
      return url;
    })
    .catch(() => null);
}

export function useSlidePlayback(
  slides: Slide[],
  currentSlideIndex: number,
  setCurrentSlideIndex: Dispatch<SetStateAction<number>>,
  isStreaming: boolean,
  isPlaying: boolean,
  voiceEnabled: boolean,
  voiceId: string,
  elevenLabsKey: string,
  playbackSpeed: number = 1,
) {
  const [visibleCaption, setVisibleCaption] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voiceEnabledRef = useRef(voiceEnabled);
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(playbackSpeed);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAvailableRef = useRef(true);

  useEffect(() => { voiceEnabledRef.current = voiceEnabled; }, [voiceEnabled]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => {
    speedRef.current = playbackSpeed;
    if (audioRef.current) audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    if (slides.length === 0 || !slides[currentSlideIndex]) return;
    if (isStreaming && slides.length === currentSlideIndex + 1) return;

    let canceled = false;
    let timeoutId: NodeJS.Timeout;

    const script = slides[currentSlideIndex].script || "Next slide.";
    const sentences = script.match(/[^.!?]+[.!?]*/g)?.map(s => s.trim()).filter(Boolean) || [script];
    let sentenceIdx = 0;

    // Pre-fetch next slide's first sentence
    const nextSlide = slides[currentSlideIndex + 1];
    if (nextSlide && voiceEnabled && ttsAvailableRef.current) {
      const nextScript = nextSlide.script || "Next slide.";
      const nextFirst = nextScript.match(/[^.!?]+[.!?]*/g)?.[0]?.trim();
      if (nextFirst) fetchTts(nextFirst, voiceId, elevenLabsKey);
    }

    const playNextSentence = async () => {
      if (canceled) return;
      if (sentenceIdx >= sentences.length) {
        setIsSpeaking(false);
        const checkAdvance = setInterval(() => {
          if (canceled) { clearInterval(checkAdvance); return; }
          if (isPlayingRef.current) {
            clearInterval(checkAdvance);
            if (currentSlideIndex < slides.length - 1) setCurrentSlideIndex(c => c + 1);
          }
        }, 100);
        return;
      }

      const currentText = sentences[sentenceIdx];
      setVisibleCaption(currentText);
      setIsSpeaking(true);

      // Pre-fetch next sentence
      const nextText = sentences[sentenceIdx + 1];
      if (nextText && voiceEnabledRef.current && ttsAvailableRef.current) {
        fetchTts(nextText, voiceId, elevenLabsKey);
      }

      const fallbackTimer = () => {
        let elapsed = 0;
        const duration = Math.max(1500, currentText.length * 60) / speedRef.current;
        const tick = () => {
          if (canceled) return;
          if (isPlayingRef.current) elapsed += 100;
          if (elapsed >= duration) { sentenceIdx++; playNextSentence(); }
          else timeoutId = setTimeout(tick, 100);
        };
        tick();
      };

      const waitForPlay = () => {
        if (canceled) return;
        if (!isPlayingRef.current) { setIsSpeaking(false); timeoutId = setTimeout(waitForPlay, 100); return; }

        setIsSpeaking(true);

        if (voiceEnabledRef.current && ttsAvailableRef.current) {
          fetchTts(currentText, voiceId, elevenLabsKey).then(url => {
            if (!url) {
              ttsAvailableRef.current = false;
              if (!canceled) fallbackTimer();
              return;
            }
            if (canceled) return;
            const audio = new Audio(url);
            audio.playbackRate = speedRef.current;
            audioRef.current = audio;
            const checkPause = setInterval(() => {
              if (canceled) { clearInterval(checkPause); return; }
              if (!isPlayingRef.current && !audio.paused) { audio.pause(); setIsSpeaking(false); }
              else if (isPlayingRef.current && audio.paused) { audio.play().catch(() => {}); setIsSpeaking(true); }
              // Sync speed changes
              if (audio.playbackRate !== speedRef.current) audio.playbackRate = speedRef.current;
            }, 100);
            audio.onended = () => { clearInterval(checkPause); setIsSpeaking(false); if (!canceled) { sentenceIdx++; playNextSentence(); } };
            audio.onerror = () => { clearInterval(checkPause); setIsSpeaking(false); if (!canceled) { sentenceIdx++; playNextSentence(); } };
            audio.play().catch(() => {});
          });
        } else {
          fallbackTimer();
        }
      };
      waitForPlay();
    };

    playNextSentence();

    return () => {
      canceled = true;
      setIsSpeaking(false);
      clearTimeout(timeoutId);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentSlideIndex, slides.length, isStreaming]);

  return { visibleCaption, isSpeaking };
}
