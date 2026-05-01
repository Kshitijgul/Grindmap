import React from 'react';
import { motion } from 'framer-motion';

export default function MonthlyProgressLineChart({ dailyData, selectedDate, setSelectedDate }) {
  const chartWidth = 980;
  const chartHeight = 260;
  const padding = { top: 24, right: 20, bottom: 36, left: 36 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;

  const points = dailyData.map((d, i) => {
    const x = padding.left + (i * innerW) / (Math.max(dailyData.length - 1, 1));
    const y = padding.top + ((100 - d.percentage) / 100) * innerH;
    return { ...d, x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${padding.left + innerW} ${padding.top + innerH} L ${padding.left} ${padding.top + innerH} Z`;

  const avg = dailyData.length
    ? Math.round(dailyData.reduce((sum, d) => sum + d.percentage, 0) / dailyData.length)
    : 0;

  return (
    <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-lg shadow-gray-200/50 dark:shadow-none">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Monthly Progress Trend</h3>
        <span className="text-[11px] text-gray-500 dark:text-gray-400">Average {avg}%</span>
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full min-w-[780px]" 
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid Lines */}
          {[0, 25, 50, 75, 100].map((pct) => {
            const y = padding.top + ((100 - pct) / 100) * innerH;
            return (
              <g key={pct}>
                <line 
                  x1={padding.left} 
                  y1={y} 
                  x2={padding.left + innerW} 
                  y2={y} 
                  stroke="#e5e7eb" 
                  className="dark:stroke-gray-800" 
                  strokeWidth="0.8" 
                />
                <text 
                  x={padding.left - 8} 
                  y={y + 3} 
                  textAnchor="end" 
                  fontSize="9" 
                  fill="#6b7280" 
                  className="dark:fill-gray-500"
                >
                  {pct}%
                </text>
              </g>
            );
          })}

          {/* Area under the line */}
          <motion.path 
            d={areaPath} 
            fill="#22c55e" 
            fillOpacity="0.08" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Main Line */}
          <motion.path 
            d={linePath} 
            fill="none" 
            stroke="#4ade80" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />

          {/* Data Points */}
          {points.map((point, index) => {
            const isSelected = point.date === selectedDate;
            const showLabel = point.day === 1 || point.day % 5 === 0 || point.day === dailyData.length;

            return (
              <g 
                key={point.date} 
                className="cursor-pointer" 
                onClick={() => setSelectedDate(point.date)}
              >
                {/* Data Point Circle */}
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r={isSelected ? 5 : 3.5}
                  fill={point.percentage === 100 ? '#10b981' : '#4ade80'}
                  stroke={isSelected ? '#ffffff' : '#111827'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="dark:stroke-gray-900"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: index * 0.015, 
                    duration: 0.3,
                    type: "spring",
                    stiffness: 300
                  }}
                  whileHover={{ scale: isSelected ? 1.2 : 1.4 }}
                />

                {/* Day Labels */}
                {showLabel && (
                  <text
                    x={point.x}
                    y={chartHeight - 12}
                    textAnchor="middle"
                    fontSize="9"
                    fill={isSelected ? '#bbf7d0' : '#6b7280'}
                    className="dark:fill-gray-400"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                  >
                    {point.day}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}