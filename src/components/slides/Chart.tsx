'use client';
import { useRef, useEffect, useMemo, useState } from 'react';
import gsap from 'gsap';
import dynamic from 'next/dynamic';
import { Slide } from '../../types/slide';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

/** Convert legacy chartData/chartType to an ECharts option */
function legacyToEchartsOption(slide: Slide): Record<string, unknown> {
  const accent = slide.theme?.accent || '#FF4E00';
  const data = slide.chartData || [];

  const baseOption = {
    backgroundColor: 'transparent',
    textStyle: { color: '#ccc', fontFamily: 'Inter, sans-serif' },
    tooltip: { trigger: 'axis' as const, backgroundColor: '#111', borderColor: '#333', textStyle: { color: '#fff' } },
    grid: { left: '8%', right: '8%', bottom: '12%', top: '12%', containLabel: true },
  };

  if (slide.chartType === 'pie') {
    return {
      ...baseOption,
      tooltip: { trigger: 'item', backgroundColor: '#111', borderColor: '#333', textStyle: { color: '#fff' } },
      series: [{
        type: 'pie', radius: ['35%', '65%'], center: ['50%', '50%'],
        data: data.map((d, i) => ({ value: d.value, name: d.name, itemStyle: { color: i % 2 === 0 ? accent : '#ffffff' } })),
        label: { color: '#ccc' },
        animationType: 'scale', animationEasing: 'elasticOut',
      }],
    };
  }

  if (slide.chartType === 'line') {
    return {
      ...baseOption,
      xAxis: { type: 'category', data: data.map(d => d.name), axisLine: { lineStyle: { color: '#444' } }, axisLabel: { color: '#888' } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#222' } }, axisLabel: { color: '#888' } },
      series: [{ type: 'line', data: data.map(d => d.value), smooth: true, lineStyle: { color: accent, width: 3 }, itemStyle: { color: accent }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: accent + '40' }, { offset: 1, color: 'transparent' }] } } }],
    };
  }

  // Default: bar
  return {
    ...baseOption,
    xAxis: { type: 'category', data: data.map(d => d.name), axisLine: { lineStyle: { color: '#444' } }, axisLabel: { color: '#888' } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#222' } }, axisLabel: { color: '#888' } },
    series: [{ type: 'bar', data: data.map(d => d.value), itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] } }],
  };
}

/** Apply dark theme defaults to any ECharts option */
function applyDarkDefaults(option: Record<string, unknown>, accent: string): Record<string, unknown> {
  return {
    backgroundColor: 'transparent',
    textStyle: { color: '#ccc', fontFamily: 'Inter, sans-serif' },
    ...option,
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    color: (option.color as string[]) || [accent, '#ffffff', '#00FFCC', '#EAB308', '#FF00FF', '#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EC4899'],
  };
}

export default function Chart({ slide }: { slide: Slide }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.ch-title', { y: -20, opacity: 0, duration: 0.6 }, 0.1)
        .from('.ch-subtitle', { opacity: 0, duration: 0.5 }, 0.3)
        .from('.ch-chart', { opacity: 0, scale: 0.95, duration: 0.7 }, 0.2);
    }, containerRef);
    return () => ctx.revert();
  }, [slide.title]);

  const accent = slide.theme?.accent || '#FF4E00';

  const option = useMemo(() => {
    if (slide.echartsOption) {
      return applyDarkDefaults(slide.echartsOption as Record<string, unknown>, accent);
    }
    if (slide.chartData) {
      return legacyToEchartsOption(slide);
    }
    return { backgroundColor: 'transparent' };
  }, [slide.echartsOption, slide.chartData, slide.chartType, accent]);

  return (
    <div ref={containerRef} className="flex flex-col w-full h-full max-w-[900px] justify-center items-center text-center px-4 sm:px-8 z-20 py-8">
      <h2 className={`ch-title text-[24px] sm:text-[32px] md:text-[40px] font-bold mb-2 sm:mb-4 font-${slide.theme?.font || 'inter'} opacity-0`}>
        {slide.title}
      </h2>
      {slide.subtitle && (
        <p className="ch-subtitle text-[14px] sm:text-[16px] font-playfair italic mb-4 sm:mb-6 opacity-0" style={{ color: accent }}>
          {slide.subtitle}
        </p>
      )}
      <div className="ch-chart w-full h-[250px] sm:h-[300px] md:h-[400px] bg-black/20 p-2 sm:p-4 rounded-xl border border-white/10 backdrop-blur-md opacity-0">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge
        />
      </div>
    </div>
  );
}
