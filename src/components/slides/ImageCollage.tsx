import { motion } from 'motion/react';
import { Slide } from '../../types/slide';
import WikiImage from '../WikiImage';

export default function ImageCollage({ slide }: { slide: Slide }) {
  return (
    <div className="flex flex-col w-full h-full justify-center items-center p-4 z-20 max-w-[1000px]">
      <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`text-[28px] sm:text-[32px] md:text-[40px] font-bold mb-6 md:mb-8 text-center font-${slide.theme?.font || 'inter'}`}>
        {slide.title}
      </motion.h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full auto-rows-[200px] sm:auto-rows-[250px]">
        {slide.imageKeywords?.map((kw, i) => (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.15 }} key={i} className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border border-white/10 bg-[#1a1a1a]">
            <WikiImage keyword={kw} className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-700" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4 text-left">
              <p className="text-sm font-bold text-white uppercase tracking-wider opacity-90 truncate">{kw}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
