import { motion } from 'motion/react';
import { Slide } from '../../types/slide';

export default function StatsCallout({ slide }: { slide: Slide }) {
  return (
    <div className="flex flex-col w-full max-w-[900px] h-full justify-center text-center px-4 py-8">
      <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`text-[28px] sm:text-[40px] font-bold mb-10 sm:mb-16 font-${slide.theme?.font || 'inter'}`}>
        {slide.title}
      </motion.h2>
      <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
        {slide.stats?.map((stat, i) => (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.2 }} key={i} className="flex flex-col items-center">
            <span className="text-[48px] sm:text-[60px] md:text-[80px] font-black leading-none mb-2 tracking-tighter" style={{ color: slide.theme?.accent || '#FF4E00' }}>
              {stat.value}
            </span>
            <span className="text-[14px] sm:text-[16px] md:text-[20px] uppercase tracking-widest opacity-60 font-bold">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
