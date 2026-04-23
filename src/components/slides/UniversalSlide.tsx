'use client';
import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Slide } from '../../types/slide';
import WikiImage from '../WikiImage';

// ── Random style per slide ──
const BG = ['#050510','#0a0a1a','#0d0d0d','#111','#1a0a00','#150505','#050a14','#0a0510','#0a1a0a','#050f1a','#18181a','#140510','#0f1218','#081018'];
const ACCENT = ['#FF4E00','#00D4FF','#7B61FF','#FFD700','#FF006E','#00FF88','#3A86FF','#F72585','#06D6A0','#FFBE0B','#4CC9F0','#FF6B6B','#9B5DE5','#00F5D4','#2563EB'];
const FONT = ['inter','playfair','space','jetbrains','outfit'] as const;

function sr(seed: number) { let s = seed + 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function pk<T>(a: readonly T[], r: () => number): T { return a[Math.floor(r() * a.length)]; }

export interface SlideVisual { bg: string; accent: string; font: string; }
export function randomVisual(i: number): SlideVisual {
  const r = sr(i * 7919);
  return { bg: pk(BG, r), accent: pk(ACCENT, r), font: pk(FONT, r) };
}

const PIE_COLORS = ['#FF4E00','#00D4FF','#7B61FF','#FFD700','#FF006E','#00FF88','#3A86FF','#F72585'];

// ── Shared animation helpers ──
const fadeUp = (delay = 0) => ({ initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay, duration: 0.5 } });
const fadeIn = (delay = 0) => ({ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay, duration: 0.5 } });

export default function UniversalSlide({ slide, slideIndex }: { slide: Slide; slideIndex: number }) {
  const v = useMemo(() => randomVisual(slideIndex), [slideIndex]);
  const style = slide.style || 'big-statement';

  // ── 1. Hero ──
  if (style === 'hero') return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: v.bg }}>
      {slide.imageKeyword && (<><div className="absolute inset-0 bg-black/60 z-10" /><div className="absolute inset-0 z-0"><WikiImage keyword={slide.imageKeyword} className="w-full h-full object-cover" /></div></>)}
      <div className="relative z-20 max-w-[80%] text-center">
        <motion.h2 {...fadeUp(0.2)} className={`text-[32px] sm:text-[50px] md:text-[72px] font-bold tracking-tight leading-none mb-4 font-${v.font}`}>{slide.title}</motion.h2>
        {slide.subtitle && <motion.p {...fadeUp(0.4)} className="text-[16px] sm:text-[22px] font-medium italic" style={{ color: v.accent }}>{slide.subtitle}</motion.p>}
      </div>
    </div>
  );

  // ── 2. Split ──
  if (style === 'split') return (
    <div className="flex flex-col md:flex-row w-full h-full items-center gap-6 md:gap-10 max-w-[1200px] mx-auto px-6" style={{ backgroundColor: v.bg }}>
      <div className="flex-1 flex flex-col justify-center py-8 md:py-0">
        <motion.h2 {...fadeUp(0.1)} className={`text-[24px] sm:text-[36px] md:text-[44px] font-bold mb-4 leading-tight font-${v.font}`}>{slide.title}</motion.h2>
        {slide.subtitle && <motion.p {...fadeUp(0.2)} className="text-[13px] sm:text-[15px] mb-5 font-bold uppercase tracking-widest" style={{ color: v.accent }}>{slide.subtitle}</motion.p>}
        {slide.content?.map((t, i) => (
          <motion.div key={i} {...fadeUp(0.25 + i * 0.08)} className="flex items-start gap-3 mb-2.5">
            <Icon icon={slide.icons?.[i] || 'mdi:circle-small'} className="w-5 h-5 shrink-0 mt-0.5" style={{ color: v.accent }} />
            <span className="text-[14px] sm:text-[16px] opacity-85 leading-relaxed">{t}</span>
          </motion.div>
        ))}
      </div>
      {slide.imageKeyword && <motion.div {...fadeIn(0.3)} className="w-full h-[200px] md:flex-1 md:h-full relative overflow-hidden rounded-xl shrink-0"><WikiImage keyword={slide.imageKeyword} className="absolute inset-0 w-full h-full object-cover" /></motion.div>}
    </div>
  );

  // ── 3. Icon Grid ──
  if (style === 'icon-grid') return (
    <div className="flex flex-col w-full max-w-[900px] h-full justify-center px-6 mx-auto" style={{ backgroundColor: v.bg }}>
      <motion.h2 {...fadeUp(0.1)} className={`text-[28px] sm:text-[40px] md:text-[48px] font-bold mb-2 text-center font-${v.font}`}>{slide.title}</motion.h2>
      {slide.subtitle && <motion.p {...fadeIn(0.2)} className="text-center text-[15px] italic mb-8" style={{ color: v.accent }}>{slide.subtitle}</motion.p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {slide.content?.map((t, i) => (
          <motion.div key={i} {...fadeUp(0.2 + i * 0.12)} className="flex gap-4 items-start bg-white/5 p-5 rounded-xl border border-white/10">
            <div className="p-2.5 bg-white/10 rounded-lg shrink-0" style={{ color: v.accent }}><Icon icon={slide.icons?.[i] || 'mdi:star'} className="w-7 h-7" /></div>
            <p className="text-[14px] sm:text-[16px] leading-relaxed opacity-90 pt-1">{t}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // ── 4. Stats ──
  if (style === 'stats') return (
    <div className="flex flex-col w-full max-w-[900px] h-full justify-center text-center px-6 mx-auto" style={{ backgroundColor: v.bg }}>
      <motion.h2 {...fadeUp(0.1)} className={`text-[28px] sm:text-[40px] font-bold mb-12 font-${v.font}`}>{slide.title}</motion.h2>
      <div className="flex flex-wrap justify-center gap-10">
        {slide.stats?.map((s, i) => (
          <motion.div key={i} {...fadeUp(0.2 + i * 0.15)} className="flex flex-col items-center">
            <span className="text-[48px] sm:text-[64px] md:text-[80px] font-black leading-none mb-2 tracking-tighter" style={{ color: v.accent }}>{s.value}</span>
            <span className="text-[14px] sm:text-[18px] uppercase tracking-widest opacity-60 font-bold">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // ── 5. Quote ──
  if (style === 'quote') return (
    <div className="flex flex-col w-full max-w-[800px] h-full justify-center text-center items-center px-8 mx-auto" style={{ backgroundColor: v.bg }}>
      <motion.span {...fadeIn(0.1)} className="text-[80px] sm:text-[120px] leading-[0] font-playfair mb-8 w-full text-left opacity-40" style={{ color: v.accent }}>&ldquo;</motion.span>
      <motion.h2 {...fadeUp(0.2)} className={`text-[24px] sm:text-[36px] md:text-[46px] font-medium italic leading-tight mb-10 font-${v.font}`}>{slide.title}</motion.h2>
      {slide.subtitle && <motion.div {...fadeIn(0.5)} className="flex items-center gap-4"><div className="w-10 h-[2px]" style={{ backgroundColor: v.accent }} /><span className="text-[16px] font-bold uppercase tracking-widest opacity-80">{slide.subtitle}</span></motion.div>}
    </div>
  );

  // ── 6/7/8. Charts ──
  if (style === 'chart-bar' || style === 'chart-line' || style === 'chart-pie') return (
    <div className="flex flex-col w-full max-w-[900px] h-full justify-center items-center px-6 mx-auto" style={{ backgroundColor: v.bg }}>
      <motion.h2 {...fadeUp(0.1)} className={`text-[24px] sm:text-[36px] font-bold mb-6 text-center font-${v.font}`}>{slide.title}</motion.h2>
      <motion.div {...fadeIn(0.3)} className="w-full h-[280px] sm:h-[350px] md:h-[400px] bg-white/5 p-4 rounded-xl border border-white/10">
        {slide.chartData && (
          <ResponsiveContainer width="100%" height="100%">
            {style === 'chart-pie' ? (
              <PieChart><Pie data={slide.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" label={{ fill: '#fff', fontSize: 12 }}>{slide.chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} /></PieChart>
            ) : style === 'chart-line' ? (
              <LineChart data={slide.chartData}><CartesianGrid strokeDasharray="3 3" stroke="#333" /><XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 11 }} /><YAxis stroke="#666" tick={{ fill: '#888', fontSize: 11 }} /><Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} /><Line type="monotone" dataKey="value" stroke={v.accent} strokeWidth={3} dot={{ fill: v.accent, r: 5 }} /></LineChart>
            ) : (
              <BarChart data={slide.chartData}><CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} /><XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 11 }} /><YAxis stroke="#666" tick={{ fill: '#888', fontSize: 11 }} /><Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} cursor={{ fill: '#222' }} /><Bar dataKey="value" fill={v.accent} radius={[4, 4, 0, 0]} /></BarChart>
            )}
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );

  // ── 9. Diagram ──
  if (style === 'diagram' && slide.svgCode) return (
    <div className="flex flex-col md:flex-row w-full max-w-[1000px] h-full items-center justify-center gap-8 px-6 mx-auto" style={{ backgroundColor: v.bg }}>
      <div className="flex-1 text-center md:text-left">
        <motion.h2 {...fadeUp(0.1)} className={`text-[28px] sm:text-[36px] font-bold mb-3 font-${v.font}`}>{slide.title}</motion.h2>
        {slide.subtitle && <motion.p {...fadeIn(0.2)} className="text-[15px] italic" style={{ color: v.accent }}>{slide.subtitle}</motion.p>}
      </div>
      <motion.div {...fadeIn(0.3)} className="w-full md:flex-1 max-w-[400px] aspect-[4/3] bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-center" style={{ color: v.accent }} dangerouslySetInnerHTML={{ __html: slide.svgCode }} />
    </div>
  );

  // ── 10. Gallery ──
  if (style === 'gallery') return (
    <div className="flex flex-col w-full max-w-[1000px] h-full justify-center items-center px-6 mx-auto" style={{ backgroundColor: v.bg }}>
      <motion.h2 {...fadeUp(0.1)} className={`text-[28px] sm:text-[36px] font-bold mb-6 text-center font-${v.font}`}>{slide.title}</motion.h2>
      <div className={`grid gap-3 w-full ${(slide.imageKeywords?.length || 0) <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'} auto-rows-[180px] sm:auto-rows-[220px]`}>
        {slide.imageKeywords?.map((kw, i) => (
          <motion.div key={i} {...fadeUp(0.15 + i * 0.1)} className="relative rounded-xl overflow-hidden border border-white/10">
            <WikiImage keyword={kw} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3"><p className="text-[12px] font-bold uppercase tracking-wider opacity-90 truncate">{kw}</p></div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // ── 11. Long Text ──
  if (style === 'long-text') return (
    <div className="flex flex-col w-full max-w-[800px] h-full justify-center px-8 mx-auto overflow-y-auto" style={{ backgroundColor: v.bg }}>
      <motion.h2 {...fadeUp(0.1)} className={`text-[28px] sm:text-[40px] font-bold mb-6 font-${v.font}`}>{slide.title}</motion.h2>
      <motion.div {...fadeIn(0.3)} className={`text-[14px] sm:text-[16px] leading-[1.8] opacity-80 whitespace-pre-line font-${v.font}`}>{slide.longText || slide.content?.join('\n\n')}</motion.div>
    </div>
  );

  // ── 12. Comparison ──
  if (style === 'comparison') return (
    <div className="flex flex-col w-full max-w-[1000px] h-full items-center justify-center px-6 mx-auto" style={{ backgroundColor: v.bg }}>
      <motion.h2 {...fadeUp(0.1)} className={`text-[28px] sm:text-[40px] font-bold mb-8 text-center font-${v.font}`}>{slide.title}</motion.h2>
      <div className="flex flex-col md:flex-row w-full gap-4 md:gap-0 items-stretch">
        <motion.div {...fadeUp(0.2)} className="flex-1 p-5">
          <h3 className="text-[18px] sm:text-[22px] font-bold mb-4 uppercase tracking-wider" style={{ color: v.accent }}>{slide.leftColumn?.title}</h3>
          {slide.leftColumn?.items.map((t, i) => <div key={i} className="flex items-start gap-2 mb-2 text-[14px] sm:text-[16px]"><span style={{ color: v.accent }}>●</span><span className="opacity-80">{t}</span></div>)}
        </motion.div>
        <div className="flex items-center justify-center mx-4"><div className="w-12 h-12 rounded-full flex items-center justify-center text-[13px] font-black" style={{ backgroundColor: v.accent }}>VS</div></div>
        <motion.div {...fadeUp(0.3)} className="flex-1 p-5">
          <h3 className="text-[18px] sm:text-[22px] font-bold mb-4 uppercase tracking-wider" style={{ color: v.accent }}>{slide.rightColumn?.title}</h3>
          {slide.rightColumn?.items.map((t, i) => <div key={i} className="flex items-start gap-2 mb-2 text-[14px] sm:text-[16px]"><span style={{ color: v.accent }}>●</span><span className="opacity-80">{t}</span></div>)}
        </motion.div>
      </div>
    </div>
  );

  // ── 13. Timeline ──
  if (style === 'timeline') return (
    <div className="flex flex-col w-full max-w-[800px] h-full justify-center px-6 mx-auto" style={{ backgroundColor: v.bg }}>
      <motion.h2 {...fadeUp(0.1)} className={`text-[28px] sm:text-[40px] font-bold mb-8 text-center font-${v.font}`}>{slide.title}</motion.h2>
      <div className="relative pl-8">
        <div className="absolute left-3 top-0 bottom-0 w-[2px]" style={{ backgroundColor: v.accent + '40' }} />
        {slide.timelineSteps?.map((s, i) => (
          <motion.div key={i} {...fadeUp(0.2 + i * 0.12)} className="relative mb-6 last:mb-0">
            <div className="absolute -left-5 top-1 w-4 h-4 rounded-full border-2" style={{ borderColor: v.accent, backgroundColor: v.bg }} />
            <div className="text-[12px] font-bold uppercase tracking-widest mb-1" style={{ color: v.accent }}>{s.label}</div>
            <div className="text-[14px] sm:text-[16px] opacity-80 leading-relaxed">{s.text}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // ── 14. Code ──
  if (style === 'code') return (
    <div className="flex flex-col w-full max-w-[900px] h-full justify-center px-6 mx-auto" style={{ backgroundColor: v.bg }}>
      <motion.h2 {...fadeUp(0.1)} className={`text-[24px] sm:text-[32px] font-bold mb-4 font-${v.font}`}>{slide.title}</motion.h2>
      <motion.div {...fadeIn(0.3)} className="bg-black/40 rounded-xl border border-white/10 p-5 overflow-auto max-h-[70%]">
        <div className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-3">{slide.codeLanguage || 'code'}</div>
        <pre className="text-[13px] sm:text-[14px] font-mono leading-relaxed whitespace-pre-wrap opacity-90">{slide.code}</pre>
      </motion.div>
    </div>
  );

  // ── 15. Big Statement (default fallback) ──
  return (
    <div className="flex flex-col w-full max-w-[900px] h-full justify-center text-center items-center px-8 mx-auto" style={{ backgroundColor: v.bg }}>
      <motion.h2 {...fadeUp(0.2)} className={`text-[32px] sm:text-[48px] md:text-[64px] font-bold tracking-tight leading-[1.05] mb-4 font-${v.font}`}>{slide.title}</motion.h2>
      {slide.subtitle && <motion.p {...fadeUp(0.4)} className="text-[16px] sm:text-[22px] font-medium italic" style={{ color: v.accent }}>{slide.subtitle}</motion.p>}
    </div>
  );
}
