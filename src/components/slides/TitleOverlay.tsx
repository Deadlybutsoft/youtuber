import { motion } from 'motion/react';
import { Slide } from '../../types/slide';
import WikiImage from '../WikiImage';

export default function TitleOverlay({ slide }: { slide: Slide }) {
  const align = slide.theme?.align === 'left' ? 'start' : slide.theme?.align === 'right' ? 'end' : 'center';
  return (
    <div className={`relative w-full h-full flex flex-col items-${align} justify-center overflow-hidden`}>
      {slide.imageKeyword && (
        <>
          <div className="absolute inset-0 bg-black/70 z-10" />
          <WikiImage keyword={slide.imageKeyword} className="absolute inset-0 w-full h-full object-cover z-0" />
        </>
      )}
      <div className="relative z-20 max-w-[80%]">
        <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className={`text-[32px] sm:text-[50px] md:text-[72px] font-bold tracking-tight mb-4 leading-none font-${slide.theme?.font || 'inter'}`}>
          {slide.title}
        </motion.h2>
        {slide.subtitle && (
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className={`text-[16px] sm:text-[20px] md:text-[24px] font-medium italic font-${slide.theme?.font || 'inter'}`} style={{ color: slide.theme?.accent || '#FF4E00' }}>
            {slide.subtitle}
          </motion.p>
        )}
      </div>
    </div>
  );
}
