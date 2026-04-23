'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Slide } from '../../types/slide';
import WikiImage from '../WikiImage';

export default function SplitImage({ slide }: { slide: Slide }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.si-title', { x: -30, opacity: 0, duration: 0.7 }, 0.1)
        .from('.si-subtitle', { x: -30, opacity: 0, duration: 0.5 }, 0.25)
        .from('.si-bullet', { x: -20, opacity: 0, stagger: 0.1, duration: 0.5 }, 0.35)
        .from('.si-image', { opacity: 0, scale: 0.95, duration: 0.8, ease: 'power2.out' }, 0.2);
    }, containerRef);
    return () => ctx.revert();
  }, [slide.title]);

  return (
    <div ref={containerRef} className={`flex flex-col md:flex-row w-full h-full md:gap-8 lg:gap-12 items-center text-${slide.theme?.align || 'left'} max-w-[1200px]`}>
      <div className="flex-1 flex flex-col justify-center w-full px-4 sm:px-8 py-8 md:py-0 md:px-0 md:pl-12 lg:pl-16 z-20">
        <h2 className={`si-title text-[24px] sm:text-[32px] md:text-[40px] font-bold mb-4 leading-[1.1] font-${slide.theme?.font || 'inter'} opacity-0`}>
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="si-subtitle text-[12px] sm:text-[14px] md:text-[16px] mb-4 sm:mb-6 font-bold uppercase tracking-widest opacity-0" style={{ color: slide.theme?.accent || '#FF4E00' }}>
            {slide.subtitle}
          </p>
        )}
        {slide.content && (
          <div className={`flex flex-col gap-3 sm:gap-4 text-[14px] sm:text-[16px] xl:text-[18px] opacity-80 leading-relaxed font-${slide.theme?.font === 'jetbrains' ? 'jetbrains' : 'playfair'} italic`}>
            {slide.content.map((p, i) => (
              <p key={i} className="si-bullet opacity-0">{p}</p>
            ))}
          </div>
        )}
      </div>
      {slide.imageKeyword && (
        <div className="si-image w-full h-[200px] sm:h-[250px] md:flex-1 md:h-full relative overflow-hidden shrink-0 opacity-0">
          <WikiImage keyword={slide.imageKeyword} className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
        </div>
      )}
    </div>
  );
}
