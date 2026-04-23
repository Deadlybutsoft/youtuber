import { motion } from 'motion/react';
import { Icon } from '@iconify/react';
import { Slide } from '../../types/slide';

export default function IconGrid({ slide }: { slide: Slide }) {
  return (
    <div className="flex flex-col w-full max-w-[900px] h-full justify-center px-4 md:px-0 py-8 md:py-0">
      <div className="text-center mb-6 sm:mb-10">
        <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`text-[28px] sm:text-[36px] md:text-[48px] font-bold mb-2 sm:mb-4 tracking-tight font-${slide.theme?.font || 'inter'}`}>
          {slide.title}
        </motion.h2>
        {slide.subtitle && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-[14px] sm:text-[16px] md:text-[18px] font-playfair italic" style={{ color: slide.theme?.accent || '#FF4E00' }}>
            {slide.subtitle}
          </motion.p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
        {slide.content?.map((text, i) => (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.15 }} key={i} className="flex gap-3 sm:gap-4 items-start bg-black/20 p-4 sm:p-5 rounded-xl border border-white/10 backdrop-blur-md">
            <div className="p-2 sm:p-3 bg-white/10 rounded-lg shrink-0 flex items-center justify-center" style={{ color: slide.theme?.accent || '#FF4E00' }}>
              <Icon icon={slide.iconifyNames?.[i] || 'mdi:star'} className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <p className="text-[14px] sm:text-[16px] leading-relaxed opacity-90 pt-1 font-inter text-left">{text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
