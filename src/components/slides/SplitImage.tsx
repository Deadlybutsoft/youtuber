import { motion } from 'motion/react';
import { Slide } from '../../types/slide';
import WikiImage from '../WikiImage';

export default function SplitImage({ slide }: { slide: Slide }) {
  return (
    <div className={`flex flex-col md:flex-row w-full h-full md:gap-8 lg:gap-12 items-center text-${slide.theme?.align || 'left'} max-w-[1200px]`}>
      <div className="flex-1 flex flex-col justify-center w-full px-4 sm:px-8 py-8 md:py-0 md:px-0 md:pl-12 lg:pl-16 z-20">
        <motion.h2 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={`text-[24px] sm:text-[32px] md:text-[40px] font-bold mb-4 leading-[1.1] font-${slide.theme?.font || 'inter'}`}>
          {slide.title}
        </motion.h2>
        {slide.subtitle && (
          <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-[12px] sm:text-[14px] md:text-[16px] mb-4 sm:mb-6 font-bold uppercase tracking-widest" style={{ color: slide.theme?.accent || '#FF4E00' }}>
            {slide.subtitle}
          </motion.p>
        )}
        {slide.content && (
          <div className={`flex flex-col gap-3 sm:gap-4 text-[14px] sm:text-[16px] xl:text-[18px] opacity-80 leading-relaxed font-${slide.theme?.font === 'jetbrains' ? 'jetbrains' : 'playfair'} italic`}>
            {slide.content.map((p, i) => (
              <motion.p key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.1 }}>{p}</motion.p>
            ))}
          </div>
        )}
      </div>
      {slide.imageKeyword && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="w-full h-[200px] sm:h-[250px] md:flex-1 md:h-full relative overflow-hidden shrink-0">
          <WikiImage keyword={slide.imageKeyword} className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-700" />
        </motion.div>
      )}
    </div>
  );
}
