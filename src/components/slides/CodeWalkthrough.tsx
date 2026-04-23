'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Slide } from '../../types/slide';

export default function CodeWalkthrough({ slide }: { slide: Slide }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.cw-title', { y: -20, opacity: 0, duration: 0.6 }, 0.1)
        .from('.cw-box', { opacity: 0, scale: 0.95, duration: 0.6 }, 0.2)
        .from('.cw-line', { opacity: 0, x: -20, stagger: 0.08, duration: 0.4 }, 0.4);

      // Pulse highlight lines
      containerRef.current!.querySelectorAll('.cw-highlight').forEach(el => {
        tl.to(el, { borderLeftColor: slide.theme?.accent || '#FF4E00', duration: 0.3 }, 0.6);
        gsap.to(el, { borderLeftColor: 'rgba(255,78,0,0.3)', repeat: -1, yoyo: true, duration: 1, delay: 1.2 });
      });
    }, containerRef);
    return () => ctx.revert();
  }, [slide.title, slide.code]);

  const accent = slide.theme?.accent || '#FF4E00';
  const lines = (slide.code || '').split('\n');
  const highlights = new Set(slide.highlightLines || []);

  return (
    <div ref={containerRef} className="flex flex-col w-full h-full items-center justify-center p-4 sm:p-8 max-w-[900px]">
      {slide.title && (
        <h2 className={`cw-title text-[24px] sm:text-[32px] md:text-[40px] font-bold mb-4 sm:mb-6 font-${slide.theme?.font || 'inter'} opacity-0`}>
          {slide.title}
        </h2>
      )}
      <div className="cw-box w-full bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden opacity-0">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/10 bg-white/5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          {slide.language && <span className="ml-3 text-[11px] text-white/30 font-mono uppercase">{slide.language}</span>}
        </div>
        <div className="p-4 sm:p-6 overflow-x-auto">
          {lines.map((line, i) => (
            <div
              key={i}
              className={`cw-line flex gap-3 font-mono text-[12px] sm:text-[14px] leading-relaxed opacity-0 ${highlights.has(i + 1) ? 'cw-highlight border-l-2 pl-3 bg-white/5 -ml-1' : ''}`}
              style={highlights.has(i + 1) ? { borderLeftColor: 'transparent' } : undefined}
            >
              <span className="text-white/20 select-none w-6 text-right shrink-0">{i + 1}</span>
              <span style={{ color: highlights.has(i + 1) ? accent : 'rgba(255,255,255,0.8)' }}>
                {line || '\u00A0'}
              </span>
            </div>
          ))}
        </div>
      </div>
      {slide.subtitle && (
        <p className="mt-4 text-[14px] sm:text-[16px] italic opacity-70" style={{ color: accent }}>
          {slide.subtitle}
        </p>
      )}
    </div>
  );
}
