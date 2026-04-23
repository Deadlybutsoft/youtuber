'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Slide } from '../../types/slide';
import WikiImage from '../WikiImage';

export default function ImageCollage({ slide }: { slide: Slide }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.ic-title', { y: -20, opacity: 0, duration: 0.6 }, 0.1)
        .from('.ic-card', {
          scale: 0.85, opacity: 0, filter: 'blur(4px)',
          stagger: { each: 0.15, from: 'random' },
          duration: 0.6,
        }, 0.3)
        .from('.ic-label', { y: 10, opacity: 0, stagger: 0.1, duration: 0.4 }, 0.7);
    }, containerRef);
    return () => ctx.revert();
  }, [slide.title]);

  return (
    <div ref={containerRef} className="flex flex-col w-full h-full justify-center items-center p-4 z-20 max-w-[1000px]">
      <h2 className={`ic-title text-[28px] sm:text-[32px] md:text-[40px] font-bold mb-6 md:mb-8 text-center font-${slide.theme?.font || 'inter'} opacity-0`}>
        {slide.title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full auto-rows-[200px] sm:auto-rows-[250px]">
        {slide.imageKeywords?.map((kw, i) => (
          <div key={i} className="ic-card relative w-full h-full rounded-2xl overflow-hidden shadow-lg border border-white/10 bg-[#1a1a1a] opacity-0">
            <WikiImage keyword={kw} className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4 text-left">
              <p className="ic-label text-sm font-bold text-white uppercase tracking-wider opacity-0 truncate">{kw}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
