'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Slide } from '../../types/slide';

export default function Comparison({ slide }: { slide: Slide }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.cmp-title', { y: -20, opacity: 0, duration: 0.6 }, 0.1)
        .from('.cmp-left', { x: -40, opacity: 0, duration: 0.7 }, 0.2)
        .from('.cmp-right', { x: 40, opacity: 0, duration: 0.7 }, 0.2)
        .from('.cmp-vs', { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(2)' }, 0.5)
        .from('.cmp-divider', { scaleY: 0, duration: 0.5 }, 0.3)
        .from('.cmp-item-l', { x: -20, opacity: 0, stagger: 0.1, duration: 0.4 }, 0.6)
        .from('.cmp-item-r', { x: 20, opacity: 0, stagger: 0.1, duration: 0.4 }, 0.6);
    }, containerRef);
    return () => ctx.revert();
  }, [slide.title]);

  const accent = slide.theme?.accent || '#FF4E00';

  return (
    <div ref={containerRef} className="flex flex-col w-full h-full items-center justify-center p-4 sm:p-8 max-w-[1000px]">
      {slide.title && (
        <h2 className={`cmp-title text-[24px] sm:text-[32px] md:text-[40px] font-bold mb-6 sm:mb-10 font-${slide.theme?.font || 'inter'} opacity-0`}>
          {slide.title}
        </h2>
      )}
      <div className="relative flex flex-col md:flex-row w-full gap-4 md:gap-0 items-stretch">
        {/* Left */}
        <div className="cmp-left flex-1 p-4 sm:p-6 opacity-0">
          <h3 className="text-[18px] sm:text-[22px] font-bold mb-4 uppercase tracking-wider" style={{ color: accent }}>
            {slide.leftColumn?.title}
          </h3>
          <div className="flex flex-col gap-3">
            {slide.leftColumn?.items.map((item, i) => (
              <div key={i} className="cmp-item-l flex items-start gap-2 text-[14px] sm:text-[16px] opacity-0">
                <span style={{ color: accent }}>●</span>
                <span className="opacity-80">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider + VS */}
        <div className="relative flex items-center justify-center md:w-px mx-4">
          <div className="cmp-divider hidden md:block absolute inset-y-0 w-px origin-top" style={{ backgroundColor: accent + '40' }} />
          <div className="cmp-vs w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-[12px] sm:text-[14px] font-black z-10 opacity-0 shrink-0" style={{ backgroundColor: accent }}>
            VS
          </div>
        </div>

        {/* Right */}
        <div className="cmp-right flex-1 p-4 sm:p-6 opacity-0">
          <h3 className="text-[18px] sm:text-[22px] font-bold mb-4 uppercase tracking-wider" style={{ color: accent }}>
            {slide.rightColumn?.title}
          </h3>
          <div className="flex flex-col gap-3">
            {slide.rightColumn?.items.map((item, i) => (
              <div key={i} className="cmp-item-r flex items-start gap-2 text-[14px] sm:text-[16px] opacity-0">
                <span style={{ color: accent }}>●</span>
                <span className="opacity-80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
