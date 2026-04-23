'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { Slide } from '../../types/slide';

gsap.registerPlugin(SplitText);

export default function KineticText({ slide }: { slide: Slide }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (titleRef.current) {
        const split = new SplitText(titleRef.current, { type: 'chars' });
        tl.from(split.chars, {
          opacity: 0, y: 80, rotateX: -90, filter: 'blur(10px)',
          stagger: 0.03, duration: 0.7, ease: 'back.out(1.7)',
        }, 0.1);
      }

      if (subtitleRef.current) {
        const split = new SplitText(subtitleRef.current, { type: 'words' });
        tl.from(split.words, {
          opacity: 0, y: 30, filter: 'blur(6px)',
          stagger: 0.08, duration: 0.5,
        }, 0.6);
      }

      tl.from('.kt-item', {
        opacity: 0, y: 20, stagger: 0.12, duration: 0.5,
      }, 1.0);
    }, containerRef);
    return () => ctx.revert();
  }, [slide.title]);

  const accent = slide.theme?.accent || '#FF4E00';

  return (
    <div ref={containerRef} className="flex flex-col w-full h-full items-center justify-center px-6 sm:px-12">
      <h2
        ref={titleRef}
        className={`text-[40px] sm:text-[60px] md:text-[72px] lg:text-[96px] font-black tracking-tight leading-none text-center mb-4 sm:mb-6 font-${slide.theme?.font || 'inter'} opacity-0`}
      >
        {slide.title}
      </h2>
      {slide.subtitle && (
        <p
          ref={subtitleRef}
          className={`text-[16px] sm:text-[20px] md:text-[24px] italic text-center mb-6 sm:mb-10 font-${slide.theme?.font || 'playfair'} opacity-0`}
          style={{ color: accent }}
        >
          {slide.subtitle}
        </p>
      )}
      {slide.content && (
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-[800px]">
          {slide.content.map((item, i) => (
            <span key={i} className="kt-item px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[14px] sm:text-[16px] opacity-0">
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
