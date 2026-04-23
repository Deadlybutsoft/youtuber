import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Slide } from '../types/slide';

export function useSlidePlayback(
  slides: Slide[],
  currentSlideIndex: number,
  setCurrentSlideIndex: Dispatch<SetStateAction<number>>,
  isStreaming: boolean,
  isPlaying: boolean,
  voiceEnabled: boolean,
) {
  const [visibleCaption, setVisibleCaption] = useState("");
  const voiceEnabledRef = useRef(voiceEnabled);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => { voiceEnabledRef.current = voiceEnabled; }, [voiceEnabled]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  useEffect(() => {
    if (slides.length === 0 || !slides[currentSlideIndex]) return;
    if (isStreaming && slides.length === currentSlideIndex + 1) return;

    let canceled = false;
    let timeoutId: NodeJS.Timeout;

    const script = slides[currentSlideIndex].script || "Next slide.";
    const sentences = script.match(/[^.!?]+[.!?]*/g)?.map(s => s.trim()).filter(Boolean) || [script];
    let sentenceIdx = 0;

    const tickerInterval = setInterval(() => {
      if (canceled) return;
      if (!isPlayingRef.current) {
        if (voiceEnabledRef.current && 'speechSynthesis' in window && !window.speechSynthesis.paused && window.speechSynthesis.speaking) window.speechSynthesis.pause();
      } else {
        if (voiceEnabledRef.current && 'speechSynthesis' in window && window.speechSynthesis.paused) window.speechSynthesis.resume();
      }
    }, 100);

    const playNextSentence = () => {
      if (canceled) return;
      if (sentenceIdx >= sentences.length) {
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

      const startSentenceLogic = () => {
        if (canceled) return;
        if (!isPlayingRef.current) { timeoutId = setTimeout(startSentenceLogic, 100); return; }

        if (voiceEnabledRef.current && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(currentText);
          utterance.rate = 1.05;
          const voices = window.speechSynthesis.getVoices();
          const best = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha")) || voices[0];
          if (best) utterance.voice = best;
          utterance.onend = () => { if (!canceled) { sentenceIdx++; playNextSentence(); } };
          utterance.onerror = () => { if (!canceled) { sentenceIdx++; playNextSentence(); } };
          window.speechSynthesis.speak(utterance);
        } else {
          let elapsed = 0;
          const duration = Math.max(1500, currentText.length * 60);
          const tick = () => {
            if (canceled) return;
            if (isPlayingRef.current) elapsed += 100;
            if (elapsed >= duration) { sentenceIdx++; playNextSentence(); }
            else timeoutId = setTimeout(tick, 100);
          };
          tick();
        }
      };
      startSentenceLogic();
    };

    if (voiceEnabledRef.current && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      timeoutId = setTimeout(playNextSentence, 50);
    } else {
      playNextSentence();
    }

    return () => {
      canceled = true;
      clearInterval(tickerInterval);
      clearTimeout(timeoutId);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [currentSlideIndex, slides.length, isStreaming]);

  return visibleCaption;
}
