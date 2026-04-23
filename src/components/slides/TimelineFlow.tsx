'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Slide } from '../../types/slide';

export default function TimelineFlow({ slide }: { slide: Slide }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.tf-title', { y: -20, opacity: 0, duration: 0.6 }, 0.1);

      // Draw the vertical line
      if (lineRef.current) {
        const len = lineRef.current.getTotalLength();
        gsap.set(lineRef.current, { strokeDasharray: len, strokeDashoffset: len });
        tl.to(lineRef.current, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut' }, 0.3);
      }

      // Stagger cards and badges
      const steps = slide.timelineSteps?.length || 0;
      for (let i = 0; i < steps; i++) {
        const delay = 0.4 + i * (2 / Math.max(steps, 1));
        tl.from(`.tf-badge-${i}`, { scale: 0, opacity: 0, duration: 0.4, ease: 'back.out(2)' }, delay);
        tl.from(`.tf-card-${i}`, { opacity: 0, y: 20, duration: 0.5 }, delay + 0.1);
      }
    }, containerRef);
    return () => ctx.revert();
  }, [slide.title, slide.timelineSteps]);

  const accent = slide.theme?.accent || '#FF4E00';
  const steps = slide.timelineSteps || [];

  return (
    <div ref={containerRef} className="flex flex-col w-full h-full items-center justify-center p-4 sm:p-8 max-w-[900px]">
      {slide.title && (
        <h2 className={`tf-title text-[24px] sm:text-[32px] md:text-[40px] font-bold mb-6 sm:mb-10 font-${slide.theme?.font || 'inter'} opacity-0`}>
          {slide.title}
        </h2>
      )}
      <div className="relative w-full">
        {/* Vertical line */}
        <svg className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-1 overflow-visible hidden md:block">
          <line ref={lineRef} x1="2" y1="0" x2="2" y2="100%" stroke={accent + '60'} strokeWidth="2" />
        </svg>

        <div className="flex flex-col gap-8 sm:gap-12">
          {steps.map((step, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div key={i} className="relative flex flex-col md:flex-row items-center">
                {/* Left content */}
                <div className={`flex-1 ${isLeft ? 'md:pr-12 md:text-right' : 'md:order-3 md:pl-12 md:text-left'}`}>
                  {(isLeft || typeof window !== 'undefined' && window.innerWidth < 768) && (
                    <div className={`tf-card-${i} bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 opacity-0`}>
                      <h4 className="text-[16px] sm:text-[18px] font-bold mb-1">{step.title}</h4>
                      <p className="text-[13px] sm:text-[14px] opacity-60 leading-relaxed">{step.description}</p>
                    </div>
                  )}
                </div>

                {/* Center badge */}
                <div className={`tf-badge-${i} w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-[11px] sm:text-[12px] font-black z-10 shrink-0 opacity-0 border-2 md:order-2`} style={{ backgroundColor: accent, borderColor: accent }}>
                  {step.year}
                </div>

                {/* Right content */}
                <div className={`flex-1 ${isLeft ? 'md:order-3 md:pl-12' : 'md:pr-12 md:text-right'}`}>
                  {!isLeft && (
                    <div className={`tf-card-${i} bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 opacity-0`}>
                      <h4 className="text-[16px] sm:text-[18px] font-bold mb-1">{step.title}</h4>
                      <p className="text-[13px] sm:text-[14px] opacity-60 leading-relaxed">{step.description}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
