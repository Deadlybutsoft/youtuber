'use client';
import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { applyPreset } from '../utils/animationPresets';
import type { Slide } from '../types/slide';

gsap.registerPlugin(SplitText);

/**
 * Builds and manages a GSAP master timeline for a single slide.
 * Returns a ref to attach to the slide container, plus play/pause/seek controls.
 */
export function useSlideTimeline(slide: Slide | null, isPlaying: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const splitRefs = useRef<SplitText[]>([]);

  // Build timeline when slide changes
  useEffect(() => {
    if (!slide || !containerRef.current) return;

    // Kill previous timeline
    tlRef.current?.kill();
    splitRefs.current.forEach(s => { try { s.revert(); } catch {} });
    splitRefs.current = [];

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out' },
      });

      // If slide has explicit animations array, use those
      if (slide.animations?.length) {
        for (const anim of slide.animations) {
          const split = applyPreset(tl, anim.target, anim.preset, anim.at, {
            duration: anim.duration,
            ...(anim.params as Record<string, unknown>),
          });
          if (split) splitRefs.current.push(split);
        }
      }

      tlRef.current = tl;
      if (isPlaying) tl.play();
    }, containerRef);

    return () => {
      ctx.revert();
      splitRefs.current.forEach(s => { try { s.revert(); } catch {} });
      splitRefs.current = [];
      tlRef.current = null;
    };
  }, [slide]);

  // Sync play/pause
  useEffect(() => {
    if (!tlRef.current) return;
    if (isPlaying) tlRef.current.play();
    else tlRef.current.pause();
  }, [isPlaying]);

  const seek = useCallback((time: number) => {
    tlRef.current?.seek(time);
  }, []);

  const getTimeline = useCallback(() => tlRef.current, []);

  return { containerRef, seek, getTimeline, tlRef };
}
