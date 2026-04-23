'use client';
import { useRef, useEffect, useState, type ComponentType } from 'react';
import gsap from 'gsap';
import dynamic from 'next/dynamic';
import type { Slide } from '../types/slide';
import TitleOverlay from './slides/TitleOverlay';
import SplitImage from './slides/SplitImage';
import IconGrid from './slides/IconGrid';
import StatsCallout from './slides/StatsCallout';
import Quote from './slides/Quote';
import Chart from './slides/Chart';
import SvgDiagram from './slides/SvgDiagram';
import ImageCollage from './slides/ImageCollage';
import Whiteboard from './slides/Whiteboard';
import HtmlScene from './slides/HtmlScene';
import CanvasFree from './slides/CanvasFree';
import KineticText from './slides/KineticText';
import CodeWalkthrough from './slides/CodeWalkthrough';
import Comparison from './slides/Comparison';
import TimelineFlow from './slides/TimelineFlow';
import SlideErrorBoundary from './SlideErrorBoundary';
const DynParticles = dynamic(() => import('./ParticleOverlay'), { ssr: false });

const layoutMap: Record<string, ComponentType<{ slide: Slide }>> = {
  'title-overlay': TitleOverlay,
  'split-image': SplitImage,
  'icon-grid': IconGrid,
  'stats-callout': StatsCallout,
  'chart': Chart,
  'svg-diagram': SvgDiagram,
  'image-collage': ImageCollage,
  'whiteboard': Whiteboard,
  'html-scene': HtmlScene,
  'canvas-free': CanvasFree,
  'kinetic-text': KineticText,
  'code-walkthrough': CodeWalkthrough,
  'comparison': Comparison,
  'timeline-flow': TimelineFlow,
};

export default function SlideRenderer({ slide, slideIndex }: { slide: Slide; slideIndex: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState<{ slide: Slide; index: number }>({ slide, index: slideIndex });

  const prevIndexRef = useRef(slideIndex);

  useEffect(() => {
    const isFirst = prevIndexRef.current === slideIndex && !innerRef.current?.style.opacity;
    prevIndexRef.current = slideIndex;

    if (!innerRef.current) {
      setActiveSlide({ slide, index: slideIndex });
      return;
    }

    const el = innerRef.current;

    // First render — just enter, no exit
    if (isFirst || el.style.opacity === '0' || !el.style.opacity) {
      setActiveSlide({ slide, index: slideIndex });
      gsap.fromTo(el,
        { opacity: 0, y: 25, filter: 'blur(6px)', scale: 0.99 },
        { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 0.55, ease: 'power3.out' },
      );
      return;
    }

    // Subsequent slides — exit then enter
    gsap.to(el, {
      opacity: 0, y: -25, filter: 'blur(6px)', scale: 1.01,
      duration: 0.35, ease: 'power2.in',
      onComplete: () => {
        setActiveSlide({ slide, index: slideIndex });
        gsap.fromTo(el,
          { opacity: 0, y: 25, filter: 'blur(6px)', scale: 0.99 },
          { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 0.55, ease: 'power3.out' },
        );
      },
    });
  }, [slideIndex]);

  const Layout = layoutMap[activeSlide.slide.layout] || Quote;

  return (
    <div ref={containerRef} className="relative flex justify-center w-full h-full min-h-0 overflow-y-auto sm:overflow-hidden">
      <div
        ref={innerRef}
        className={`w-full min-h-full absolute inset-0 flex items-center justify-center p-4 md:p-8 overflow-y-auto sm:overflow-hidden rounded-[24px] sm:rounded-3xl text-${activeSlide.slide.theme?.align || 'center'}`}
        style={{
          backgroundColor: activeSlide.slide.theme?.bg || 'transparent',
          color: activeSlide.slide.theme?.text || '#ffffff',
        }}
      >
        <SlideErrorBoundary fallbackTitle={activeSlide.slide.title}>
          <Layout slide={activeSlide.slide} />
        </SlideErrorBoundary>
        {activeSlide.slide.particleEffect && (
          <DynParticles effect={activeSlide.slide.particleEffect} />
        )}
      </div>
    </div>
  );
}
