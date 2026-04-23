'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { Slide } from '../../types/slide';

gsap.registerPlugin(SplitText);

export default function Quote({ slide }: { slide: Slide }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Quote mark
      tl.from('.q-mark', { opacity: 0, scale: 0.5, duration: 0.5, ease: 'back.out(2)' }, 0.1);

      // Split quote text into words
      if (quoteRef.current) {
        const split = new SplitText(quoteRef.current, { type: 'words' });
        tl.from(split.words, {
          opacity: 0, y: 20, filter: 'blur(4px)',
          stagger: 0.06, duration: 0.5,
        }, 0.3);
      }

      // Attribution line
      tl.from('.q-line', { scaleX: 0, duration: 0.4 }, 0.8)
        .from('.q-author', { opacity: 0, x: -15, duration: 0.5 }, 0.9);
    }, containerRef);
    return () => ctx.revert();
  }, [slide.title]);

  return (
    <div ref={containerRef} className="flex flex-col w-full max-w-[800px] h-full justify-center text-center items-center px-6">
      <span className="q-mark text-[80px] sm:text-[120px] leading-[0] font-playfair mb-6 sm:mb-8 w-full text-left opacity-0" style={{ color: slide.theme?.accent || '#FF4E00' }}>
        &ldquo;
      </span>
      <h2 ref={quoteRef} className={`text-[24px] sm:text-[32px] md:text-[46px] font-medium italic mb-8 sm:mb-12 leading-tight font-${slide.theme?.font || 'playfair'}`}>
        {slide.title}
      </h2>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="q-line w-8 sm:w-12 h-[2px] origin-left" style={{ backgroundColor: slide.theme?.accent || '#FF4E00', transform: 'scaleX(0)' }} />
        <span className="q-author text-[14px] sm:text-[16px] md:text-[20px] font-bold uppercase tracking-widest opacity-0">
          {slide.subtitle || slide.content?.[0]}
        </span>
      </div>
    </div>
  );
}
