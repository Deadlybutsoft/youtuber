import { motion } from 'motion/react';

export default function CaptionOverlay({ caption, visible }: { caption: string; visible: boolean }) {
  if (!visible || !caption) return null;
  return (
    <div className="absolute bottom-10 md:bottom-16 left-1/2 -translate-x-1/2 z-50 text-center w-[95%] max-w-[800px] pointer-events-none">
      <p className="text-white text-[20px] sm:text-[26px] md:text-[32px] font-['Poppins',sans-serif] font-bold leading-snug tracking-wide" style={{ textShadow: '0px 2px 10px rgba(0,0,0,0.8), 0px 4px 20px rgba(0,0,0,0.6)' }}>
        <motion.span key={caption} initial="hidden" animate="visible" variants={{ hidden: { opacity: 1 }, visible: { opacity: 1, transition: { staggerChildren: 0.02 } } }}>
          {caption.split("").map((char, i) => (
            <motion.span key={i} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>{char}</motion.span>
          ))}
        </motion.span>
      </p>
    </div>
  );
}
