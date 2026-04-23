'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Icon } from '@iconify/react';
import { Slide } from '../../types/slide';

export default function IconGrid({ slide }: { slide: Slide }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.ig-title', { y: -20, opacity: 0, duration: 0.6 }, 0.1)
        .from('.ig-subtitle', { opacity: 0, filter: 'blur(6px)', duration: 0.5 }, 0.3)
        .from('.ig-card', {
          y: 30, opacity: 0, scale: 0.95,
          stagger: { each: 0.12, from: 'start' },
          duration: 0.5,
        }, 0.35)
        .from('.ig-icon', {
          scale: 0, rotation: -20,
          stagger: 0.12, duration: 0.4, ease: 'back.out(2)',
        }, 0.5);
    }, containerRef);
    return () => ctx.revert();
  }, [slide.title]);

  return (
    <div ref={containerRef} className="flex flex-col w-full max-w-[900px] h-full justify-center px-4 md:px-0 py-8 md:py-0">
      <div className="text-center mb-6 sm:mb-10">
        <h2 className={`ig-title text-[28px] sm:text-[36px] md:text-[48px] font-bold mb-2 sm:mb-4 tracking-tight font-${slide.theme?.font || 'inter'} opacity-0`}>
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="ig-subtitle text-[14px] sm:text-[16px] md:text-[18px] font-playfair italic opacity-0" style={{ color: slide.theme?.accent || '#FF4E00' }}>
            {slide.subtitle}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
        {slide.content?.map((text, i) => (
          <div key={i} className="ig-card flex gap-3 sm:gap-4 items-start bg-black/20 p-4 sm:p-5 rounded-xl border border-white/10 backdrop-blur-md opacity-0">
            <div className="ig-icon p-2 sm:p-3 bg-white/10 rounded-lg shrink-0 flex items-center justify-center" style={{ color: slide.theme?.accent || '#FF4E00' }}>
              <Icon icon={slide.iconifyNames?.[i] || 'mdi:star'} className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <p className="text-[14px] sm:text-[16px] leading-relaxed opacity-90 pt-1 font-inter text-left">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
