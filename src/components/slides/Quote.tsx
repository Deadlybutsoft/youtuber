import { motion } from 'motion/react';
import { Slide } from '../../types/slide';

export default function Quote({ slide }: { slide: Slide }) {
  return (
    <div className="flex flex-col w-full max-w-[800px] h-full justify-center text-center items-center px-6">
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} className="text-[80px] sm:text-[120px] leading-[0] font-playfair mb-6 sm:mb-8 w-full text-left" style={{ color: slide.theme?.accent || '#FF4E00' }}>
        &ldquo;
      </motion.span>
      <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className={`text-[24px] sm:text-[32px] md:text-[46px] font-medium italic mb-8 sm:mb-12 leading-tight font-${slide.theme?.font || 'playfair'}`}>
        {slide.title}
      </motion.h2>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-8 sm:w-12 h-[2px]" style={{ backgroundColor: slide.theme?.accent || '#FF4E00' }} />
        <span className="text-[14px] sm:text-[16px] md:text-[20px] font-bold uppercase tracking-widest opacity-80">
          {slide.subtitle || slide.content?.[0]}
        </span>
      </motion.div>
    </div>
  );
}
