'use client';
import { motion, AnimatePresence } from 'motion/react';
import type { Slide } from '../types/slide';
import UniversalSlide from './slides/UniversalSlide';
import SlideErrorBoundary from './SlideErrorBoundary';

interface Props {
  slide: Slide;
  slideIndex: number;
  totalSlides: number;
}

export default function SlideRenderer({ slide, slideIndex, totalSlides }: Props) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Slide with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slideIndex}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full absolute inset-0 rounded-[24px] sm:rounded-3xl overflow-hidden"
        >
          <SlideErrorBoundary fallbackTitle={slide.title}>
            <UniversalSlide slide={slide} slideIndex={slideIndex} />
          </SlideErrorBoundary>
        </motion.div>
      </AnimatePresence>

      {/* Dots — bottom-right */}
      {totalSlides > 1 && (
        <div className="absolute bottom-4 right-4 z-50 flex items-center gap-1.5 pointer-events-none">
          {Array.from({ length: totalSlides }, (_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === slideIndex
                  ? 'w-2.5 h-2.5 bg-white'
                  : 'w-1.5 h-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
