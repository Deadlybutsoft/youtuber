import { motion } from 'motion/react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Slide } from '../../types/slide';

const tooltipStyle = { backgroundColor: '#111', borderColor: '#333', color: '#fff' };

export default function Chart({ slide }: { slide: Slide }) {
  const accent = slide.theme?.accent || '#FF4E00';
  return (
    <div className="flex flex-col w-full h-full max-w-[900px] justify-center items-center text-center px-4 sm:px-8 z-20 py-8">
      <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`text-[24px] sm:text-[32px] md:text-[40px] font-bold mb-2 sm:mb-4 font-${slide.theme?.font || 'inter'}`}>
        {slide.title}
      </motion.h2>
      {slide.subtitle && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-[14px] sm:text-[16px] font-playfair italic mb-4 sm:mb-6" style={{ color: accent }}>
          {slide.subtitle}
        </motion.p>
      )}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="w-full h-[250px] sm:h-[300px] md:h-[400px] bg-black/20 p-2 sm:p-4 rounded-xl border border-white/10 mt-2 backdrop-blur-md">
        {slide.chartData && (
          <ResponsiveContainer width="100%" height="100%">
            {slide.chartType === 'pie' ? (
              <PieChart>
                <Pie data={slide.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {slide.chartData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? accent : '#ffffff'} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#fff' }} />
              </PieChart>
            ) : slide.chartType === 'line' ? (
              <LineChart data={slide.chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888' }} />
                <YAxis stroke="#888" tick={{ fill: '#888' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="value" stroke={accent} strokeWidth={3} dot={{ fill: accent, r: 6 }} />
              </LineChart>
            ) : (
              <BarChart data={slide.chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888' }} />
                <YAxis stroke="#888" tick={{ fill: '#888' }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#222' }} />
                <Bar dataKey="value" fill={accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
}
