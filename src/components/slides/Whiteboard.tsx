'use client';
import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { getStroke } from 'perfect-freehand';
import type { Slide, DrawStep } from '../../types/slide';

function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return '';
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q'],
  );
  d.push('Z');
  return d.join(' ');
}

interface DrawnElement {
  id: string;
  svgContent: string;
  opacity: number;
}

export default function Whiteboard({ slide }: { slide: Slide }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<DrawnElement[]>([]);

  useEffect(() => {
    if (!svgRef.current || !slide.drawSteps?.length) return;

    const svg = svgRef.current;
    let ctx: gsap.Context | undefined;

    import('roughjs').then(({ default: rough }) => {
    const rc = rough.svg(svg);
    const accent = slide.theme?.accent || '#FF4E00';
    const textColor = slide.theme?.text || '#ffffff';
    ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      // Title animation
      tl.from('.wb-title', { y: -20, opacity: 0, duration: 0.5 }, 0);

      slide.drawSteps!.forEach((step: DrawStep) => {
        const p = step.params as Record<string, unknown>;
        const at = step.at;

        if (step.type === 'shape') {
          const shape = p.shape as string;
          const x = (p.x as number) || 0;
          const y = (p.y as number) || 0;
          const stroke = (p.stroke as string) || accent;
          const fill = (p.fill as string) || 'none';
          const opts = { stroke, fill, fillStyle: 'hachure' as const, roughness: 1.2, seed: 42 };

          let node: SVGGElement | null = null;
          if (shape === 'circle') {
            node = rc.circle(x, y, (p.radius as number || 60) * 2, opts);
          } else if (shape === 'rectangle') {
            node = rc.rectangle(x, y, (p.width as number) || 100, (p.height as number) || 60, opts);
          } else if (shape === 'line') {
            node = rc.line(x, y, (p.x2 as number) || x + 100, (p.y2 as number) || y, opts);
          } else if (shape === 'ellipse') {
            node = rc.ellipse(x, y, (p.width as number) || 120, (p.height as number) || 80, opts);
          } else if (shape === 'arrow') {
            const x2 = (p.x2 as number) || x + 100;
            const y2 = (p.y2 as number) || y;
            node = rc.line(x, y, x2, y2, opts);
            // Add arrowhead
            const angle = Math.atan2(y2 - y, x2 - x);
            const headLen = 12;
            const a1x = x2 - headLen * Math.cos(angle - Math.PI / 6);
            const a1y = y2 - headLen * Math.sin(angle - Math.PI / 6);
            const a2x = x2 - headLen * Math.cos(angle + Math.PI / 6);
            const a2y = y2 - headLen * Math.sin(angle + Math.PI / 6);
            const arrowHead = rc.polygon([[x2, y2], [a1x, a1y], [a2x, a2y]], { ...opts, fill: stroke, fillStyle: 'solid' });
            svg.appendChild(arrowHead);
            gsap.set(arrowHead, { opacity: 0 });
            tl.to(arrowHead, { opacity: 1, duration: 0.3 }, at + step.duration * 0.8);
          }

          if (node) {
            svg.appendChild(node);
            // Animate stroke-dashoffset on all paths within the group
            const paths = node.querySelectorAll('path');
            paths.forEach(path => {
              const len = path.getTotalLength?.() || 500;
              gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
              tl.to(path, { strokeDashoffset: 0, duration: step.duration, ease: 'power2.inOut' }, at);
            });
          }
        }

        if (step.type === 'freehand') {
          const points = (p.points as number[][]) || [];
          const color = (p.color as string) || accent;
          const size = (p.size as number) || 4;
          if (points.length > 1) {
            const outlinePoints = getStroke(points, { size, thinning: 0.5, smoothing: 0.5, streamline: 0.5, simulatePressure: true });
            const d = getSvgPathFromStroke(outlinePoints);
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', d);
            path.setAttribute('fill', color);
            path.setAttribute('opacity', '0');
            svg.appendChild(path);
            tl.to(path, { opacity: 1, duration: step.duration * 0.3 }, at);
          }
        }

        if (step.type === 'path') {
          const d = (p.d as string) || '';
          const stroke = (p.stroke as string) || accent;
          const strokeWidth = (p.strokeWidth as number) || 2;
          if (d) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', d);
            path.setAttribute('stroke', stroke);
            path.setAttribute('stroke-width', String(strokeWidth));
            path.setAttribute('fill', 'none');
            svg.appendChild(path);
            const len = path.getTotalLength?.() || 500;
            gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
            tl.to(path, { strokeDashoffset: 0, duration: step.duration, ease: 'power2.inOut' }, at);
          }
        }

        if (step.type === 'text') {
          const content = (p.content as string) || '';
          const x = (p.x as number) || 0;
          const y = (p.y as number) || 0;
          const fontSize = (p.fontSize as number) || 18;
          const color = (p.color as string) || textColor;
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', String(x));
          text.setAttribute('y', String(y));
          text.setAttribute('fill', color);
          text.setAttribute('font-size', String(fontSize));
          text.setAttribute('font-family', 'Inter, sans-serif');
          text.textContent = content;
          svg.appendChild(text);
          gsap.set(text, { opacity: 0 });
          tl.to(text, { opacity: 1, duration: 0.4 }, at);
        }

        // Cursor follows the drawing
        if (step.type !== 'pointer' && cursorRef.current) {
          const cx = (p.x as number) || (p.x2 as number) || 200;
          const cy = (p.y as number) || (p.y2 as number) || 200;
          tl.to(cursorRef.current, {
            left: `${(cx / 400) * 100}%`,
            top: `${(cy / 400) * 100}%`,
            duration: step.duration * 0.5,
            ease: 'power2.inOut',
          }, at);
        }

        if (step.type === 'pointer' && cursorRef.current) {
          const x = (p.x as number) || 200;
          const y = (p.y as number) || 200;
          tl.to(cursorRef.current, {
            left: `${(x / 400) * 100}%`,
            top: `${(y / 400) * 100}%`,
            duration: step.duration,
            ease: 'power2.inOut',
          }, at);
        }
      });
    }, containerRef);
    }); // end dynamic import

    return () => {
      ctx?.revert();
      // Clean up dynamically added SVG elements
      while (svg.children.length > 0) svg.removeChild(svg.children[0]);
    };
  }, [slide.drawSteps, slide.title]);

  return (
    <div ref={containerRef} className="flex flex-col w-full h-full items-center justify-center p-4 sm:p-8">
      {slide.title && (
        <h2 className={`wb-title text-[24px] sm:text-[32px] md:text-[40px] font-bold mb-4 sm:mb-6 font-${slide.theme?.font || 'inter'} opacity-0`}>
          {slide.title}
        </h2>
      )}
      <div className="relative w-full max-w-[600px] aspect-square bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="0 0 400 400"
          className="w-full h-full"
          style={{ overflow: 'visible' }}
        />
        {/* Animated cursor */}
        <div
          ref={cursorRef}
          className="absolute w-5 h-5 pointer-events-none z-50"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-lg">
            <path d="M5 3l14 8-6 2-4 6-4-16z" fill={slide.theme?.accent || '#FF4E00'} stroke="#000" strokeWidth="1" />
          </svg>
        </div>
      </div>
      {slide.subtitle && (
        <p className="mt-4 text-[14px] sm:text-[16px] font-playfair italic opacity-70" style={{ color: slide.theme?.accent || '#FF4E00' }}>
          {slide.subtitle}
        </p>
      )}
    </div>
  );
}
