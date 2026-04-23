'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Slide } from '../../types/slide';

export default function SvgDiagram({ slide }: { slide: Slide }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Title + subtitle
      tl.from('.sd-title', { x: -20, opacity: 0, duration: 0.6 }, 0.1)
        .from('.sd-subtitle', { x: -20, opacity: 0, duration: 0.5 }, 0.25);

      // SVG container scale in
      tl.from('.sd-svg', { opacity: 0, scale: 0.9, duration: 0.6 }, 0.2);

      // Animate all SVG paths with draw-on effect
      if (svgContainerRef.current) {
        const paths = svgContainerRef.current.querySelectorAll('path, line, polyline, polygon, circle, ellipse, rect');
        paths.forEach((path, i) => {
          const el = path as SVGGeometryElement;
          if (typeof el.getTotalLength === 'function') {
            try {
              const len = el.getTotalLength();
              gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
              tl.to(el, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, 0.4 + i * 0.15);
            } catch { /* not a path-like element */ }
          }
          // Fade in fill
          if (el.getAttribute('fill') && el.getAttribute('fill') !== 'none') {
            gsap.set(el, { fillOpacity: 0 });
            tl.to(el, { fillOpacity: 1, duration: 0.5 }, 0.8 + i * 0.1);
          }
        });

        // Animate text elements
        const texts = svgContainerRef.current.querySelectorAll('text');
        if (texts.length) {
          gsap.set(texts, { opacity: 0 });
          tl.to(texts, { opacity: 1, stagger: 0.1, duration: 0.4 }, 1.0);
        }
      }
    }, containerRef);
    return () => ctx.revert();
  }, [slide.title, slide.svgCode]);

  return (
    <div ref={containerRef} className="flex flex-col md:flex-row w-full h-full max-w-[1000px] gap-6 sm:gap-8 items-center justify-center p-4 sm:p-8 z-20">
      <div className="flex-1 flex flex-col items-center md:items-start justify-center text-center md:text-left">
        <h2 className={`sd-title text-[28px] sm:text-[32px] md:text-[40px] font-bold mb-2 sm:mb-4 leading-tight font-${slide.theme?.font || 'inter'} opacity-0`}>
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="sd-subtitle text-[14px] sm:text-[16px] md:text-[18px] mb-4 sm:mb-6 font-playfair italic opacity-0" style={{ color: slide.theme?.accent || '#FF4E00' }}>
            {slide.subtitle}
          </p>
        )}
      </div>
      <div
        ref={svgContainerRef}
        className="sd-svg w-full sm:w-auto md:flex-1 max-w-[300px] md:max-w-[400px] aspect-square flex items-center justify-center bg-white/5 rounded-[24px] sm:rounded-3xl p-4 sm:p-6 border border-white/10 shrink-0 opacity-0"
        style={{ color: slide.theme?.accent || '#ffffff' }}
        dangerouslySetInnerHTML={{ __html: slide.svgCode || '' }}
      />
    </div>
  );
}
