import { motion } from 'motion/react';
import { Slide } from '../../types/slide';

export default function SvgDiagram({ slide }: { slide: Slide }) {
  return (
    <div className="flex flex-col md:flex-row w-full h-full max-w-[1000px] gap-6 sm:gap-8 items-center justify-center p-4 sm:p-8 z-20">
      <div className="flex-1 flex flex-col items-center md:items-start justify-center text-center md:text-left">
        <motion.h2 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={`text-[28px] sm:text-[32px] md:text-[40px] font-bold mb-2 sm:mb-4 leading-tight font-${slide.theme?.font || 'inter'}`}>
          {slide.title}
        </motion.h2>
        {slide.subtitle && (
          <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-[14px] sm:text-[16px] md:text-[18px] mb-4 sm:mb-6 font-playfair italic" style={{ color: slide.theme?.accent || '#FF4E00' }}>
            {slide.subtitle}
          </motion.p>
        )}
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
        className="w-full sm:w-auto md:flex-1 max-w-[300px] md:max-w-[400px] aspect-square flex items-center justify-center bg-white/5 rounded-[24px] sm:rounded-3xl p-4 sm:p-6 border border-white/10 shrink-0"
        style={{ color: slide.theme?.accent || '#ffffff' }}
        dangerouslySetInnerHTML={{ __html: slide.svgCode || '' }}
      />
    </div>
  );
}
