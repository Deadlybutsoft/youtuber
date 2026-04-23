import { motion } from 'motion/react';
import type { CaptionSize } from './PlayerControls';

const sizeClasses: Record<CaptionSize, string> = {
  sm: 'text-[14px] sm:text-[18px] md:text-[22px]',
  md: 'text-[20px] sm:text-[26px] md:text-[32px]',
  lg: 'text-[26px] sm:text-[34px] md:text-[42px]',
};

export default function CaptionOverlay({ caption, visible, size = 'md' }: { caption: string; visible: boolean; size?: CaptionSize }) {
  if (!visible || !caption) return null;
  return (
    <div className="absolute bottom-10 md:bottom-16 left-1/2 -translate-x-1/2 z-50 text-center w-[90%] sm:w-[85%] max-w-[750px] pointer-events-none">
      <p className={`text-white ${sizeClasses[size]} font-['Poppins',sans-serif] font-bold leading-snug tracking-wide`} style={{ textShadow: '0px 2px 10px rgba(0,0,0,0.8), 0px 4px 20px rgba(0,0,0,0.6)' }}>
        <motion.span key={caption} initial="hidden" animate="visible" variants={{ hidden: { opacity: 1 }, visible: { opacity: 1, transition: { staggerChildren: 0.02 } } }}>
          {caption.split("").map((char, i) => (
            <motion.span key={i} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>{char}</motion.span>
          ))}
        </motion.span>
      </p>
    </div>
  );
}
