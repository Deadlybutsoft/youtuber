'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { Slide } from '../../types/slide';
import WikiImage from '../WikiImage';

gsap.registerPlugin(SplitText);

export default function TitleOverlay({ slide }: { slide: Slide }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Ken Burns on background image
      if (imgRef.current) {
        tl.fromTo(imgRef.current, { scale: 1.15 }, { scale: 1, duration: 8, ease: 'none' }, 0);
      }

      // SplitText character reveal on title
      if (titleRef.current) {
        const split = new SplitText(titleRef.current, { type: 'chars,words' });
        tl.from(split.chars, {
          opacity: 0, y: 50, rotateX: -40,
          stagger: 0.025, duration: 0.6, ease: 'back.out(1.7)',
        }, 0.2);
      }

      // Subtitle blur reveal
      if (subtitleRef.current) {
        tl.fromTo(subtitleRef.current,
          { opacity: 0, y: 20, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7 },
          0.6,
        );
      }
    }, containerRef);
    return () => ctx.revert();
  }, [slide.title, slide.subtitle]);

  const align = slide.theme?.align === 'left' ? 'start' : slide.theme?.align === 'right' ? 'end' : 'center';

  return (
    <div ref={containerRef} className={`relative w-full h-full flex flex-col items-${align} justify-center overflow-hidden`}>
      {slide.imageKeyword && (
        <>
          <div className="absolute inset-0 bg-black/70 z-10" />
          <div ref={imgRef} className="absolute inset-0 z-0 will-change-transform">
            <WikiImage keyword={slide.imageKeyword} className="w-full h-full object-cover" />
          </div>
        </>
      )}
      <div className="relative z-20 max-w-[80%]">
        <h2 ref={titleRef} className={`text-[32px] sm:text-[50px] md:text-[72px] font-bold tracking-tight mb-4 leading-none font-${slide.theme?.font || 'inter'}`}>
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p ref={subtitleRef} className={`text-[16px] sm:text-[20px] md:text-[24px] font-medium italic font-${slide.theme?.font || 'inter'} opacity-0`} style={{ color: slide.theme?.accent || '#FF4E00' }}>
            {slide.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
