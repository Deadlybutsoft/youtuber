'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Icon } from '@iconify/react';
import { applyPreset } from '../../utils/animationPresets';
import type { Slide, FreeElement } from '../../types/slide';
import WikiImage from '../WikiImage';

export default function CanvasFree({ slide }: { slide: Slide }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !slide.elements?.length) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      slide.elements!.forEach((el, i) => {
        const selector = `.cf-el-${i}`;
        const preset = el.animation || 'fadeUp';
        const at = el.animationAt ?? i * 0.2;
        applyPreset(tl, selector, preset, at);
      });
    }, containerRef);
    return () => ctx.revert();
  }, [slide.elements]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {slide.elements?.map((el: FreeElement, i: number) => {
        const style: React.CSSProperties = {
          position: 'absolute',
          left: `${el.x}%`,
          top: `${el.y}%`,
          transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg)`,
          zIndex: el.zIndex || i,
          width: el.width ? `${el.width}%` : 'auto',
          height: el.height ? `${el.height}%` : 'auto',
          opacity: 0,
          ...el.style,
        };

        if (el.type === 'text') {
          return (
            <div key={i} className={`cf-el-${i}`} style={style}>
              <span className={`text-[16px] sm:text-[24px] md:text-[32px] font-bold font-${slide.theme?.font || 'inter'}`} style={{ color: slide.theme?.text || '#fff' }}>
                {el.content}
              </span>
            </div>
          );
        }

        if (el.type === 'image') {
          return (
            <div key={i} className={`cf-el-${i} overflow-hidden rounded-xl`} style={style}>
              <WikiImage keyword={el.content} className="w-full h-full object-cover" />
            </div>
          );
        }

        if (el.type === 'icon') {
          return (
            <div key={i} className={`cf-el-${i}`} style={style}>
              <Icon icon={el.content} className="w-12 h-12 sm:w-16 sm:h-16" style={{ color: slide.theme?.accent || '#FF4E00' }} />
            </div>
          );
        }

        if (el.type === 'shape') {
          return (
            <div key={i} className={`cf-el-${i} rounded-full`} style={{ ...style, backgroundColor: slide.theme?.accent || '#FF4E00' }} />
          );
        }

        return null;
      })}
    </div>
  );
}
