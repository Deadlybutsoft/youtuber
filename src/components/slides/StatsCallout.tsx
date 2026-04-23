'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Slide } from '../../types/slide';

export default function StatsCallout({ slide }: { slide: Slide }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.sc-title', { y: -20, opacity: 0, duration: 0.6 }, 0.1);

      // Stagger stat blocks
      tl.from('.sc-stat', {
        scale: 0.8, opacity: 0,
        stagger: 0.2, duration: 0.6, ease: 'back.out(1.4)',
      }, 0.3);

      // Animate numbers that are purely numeric
      const numEls = containerRef.current!.querySelectorAll('.sc-value');
      numEls.forEach((el, i) => {
        const text = el.textContent || '';
        const num = parseFloat(text.replace(/[^0-9.]/g, ''));
        if (!isNaN(num) && num > 0) {
          const suffix = text.replace(/[0-9.,]/g, '');
          const proxy = { val: 0 };
          tl.to(proxy, {
            val: num,
            duration: 1.5,
            ease: 'power1.in',
            onUpdate: () => {
              el.textContent = (num >= 100 ? Math.round(proxy.val) : proxy.val.toFixed(1)) + suffix;
            },
          }, 0.4 + i * 0.15);
        }
      });

      // Labels fade in
      tl.from('.sc-label', { opacity: 0, y: 10, stagger: 0.15, duration: 0.4 }, 0.8);
    }, containerRef);
    return () => ctx.revert();
  }, [slide.title]);

  return (
    <div ref={containerRef} className="flex flex-col w-full max-w-[900px] h-full justify-center text-center px-4 py-8">
      <h2 className={`sc-title text-[28px] sm:text-[40px] font-bold mb-10 sm:mb-16 font-${slide.theme?.font || 'inter'} opacity-0`}>
        {slide.title}
      </h2>
      <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
        {slide.stats?.map((stat, i) => (
          <div key={i} className="sc-stat flex flex-col items-center opacity-0">
            <span className="sc-value text-[48px] sm:text-[60px] md:text-[80px] font-black leading-none mb-2 tracking-tighter" style={{ color: slide.theme?.accent || '#FF4E00' }}>
              {stat.value}
            </span>
            <span className="sc-label text-[14px] sm:text-[16px] md:text-[20px] uppercase tracking-widest opacity-60 font-bold opacity-0">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
