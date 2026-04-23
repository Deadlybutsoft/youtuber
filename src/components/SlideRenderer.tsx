import { motion, AnimatePresence } from 'motion/react';
import type { ComponentType } from 'react';
import { Slide } from '../types/slide';
import TitleOverlay from './slides/TitleOverlay';
import SplitImage from './slides/SplitImage';
import IconGrid from './slides/IconGrid';
import StatsCallout from './slides/StatsCallout';
import Quote from './slides/Quote';
import Chart from './slides/Chart';
import SvgDiagram from './slides/SvgDiagram';
import ImageCollage from './slides/ImageCollage';

const layoutMap: Record<string, ComponentType<{ slide: Slide }>> = {
  'title-overlay': TitleOverlay,
  'split-image': SplitImage,
  'icon-grid': IconGrid,
  'stats-callout': StatsCallout,
  'chart': Chart,
  'svg-diagram': SvgDiagram,
  'image-collage': ImageCollage,
};

export default function SlideRenderer({ slide, slideIndex }: { slide: Slide; slideIndex: number }) {
  const Layout = layoutMap[slide.layout] || Quote;
  return (
    <div className="relative flex justify-center w-full h-full min-h-0 overflow-y-auto sm:overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slideIndex}
          initial={{ opacity: 0, y: 30, filter: "blur(8px)", scale: 0.98 }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1, backgroundColor: slide.theme?.bg || 'transparent' }}
          exit={{ opacity: 0, y: -30, filter: "blur(8px)", scale: 1.02 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full min-h-full absolute inset-0 flex items-center justify-center p-4 md:p-8 overflow-y-auto sm:overflow-hidden rounded-[24px] sm:rounded-3xl text-${slide.theme?.align || 'center'}`}
          style={{ color: slide.theme?.text || '#ffffff' }}
        >
          <Layout slide={slide} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
