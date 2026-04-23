'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import type { Slide } from '../../types/slide';

export default function HtmlScene({ slide }: { slide: Slide }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.timeline()
        .from('.hs-title', { y: -20, opacity: 0, duration: 0.5 }, 0.1)
        .from('.hs-frame', { opacity: 0, scale: 0.95, duration: 0.7 }, 0.2);
    }, containerRef);
    return () => ctx.revert();
  }, [slide.title]);

  useEffect(() => {
    if (!iframeRef.current || !slide.htmlScene) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    // Wrap in a full HTML document with dark background
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: transparent; color: #fff; font-family: Inter, sans-serif; overflow: hidden; width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center; }
</style></head><body>${slide.htmlScene}</body></html>`;

    doc.open();
    doc.write(html);
    doc.close();
  }, [slide.htmlScene]);

  return (
    <div ref={containerRef} className="flex flex-col w-full h-full items-center justify-center p-4 sm:p-8">
      {slide.title && (
        <h2 className={`hs-title text-[24px] sm:text-[32px] md:text-[40px] font-bold mb-4 sm:mb-6 font-${slide.theme?.font || 'inter'} opacity-0`}>
          {slide.title}
        </h2>
      )}
      <div className="hs-frame relative w-full max-w-[700px] aspect-video bg-black/30 rounded-2xl border border-white/10 overflow-hidden opacity-0">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          sandbox="allow-scripts"
          title="Interactive Scene"
        />
      </div>
      {slide.subtitle && (
        <p className="mt-4 text-[14px] sm:text-[16px] font-playfair italic opacity-70" style={{ color: slide.theme?.accent || '#FF4E00' }}>
          {slide.subtitle}
        </p>
      )}
    </div>
  );
}
