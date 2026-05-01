import React from 'react';
import { motion } from 'framer-motion';

export default function WeeklyProgressLineChart({ weekDates, getDayStats, selectedDate, setSelectedDate }) {
  const chartWidth = 760;
  const chartHeight = 220;
  const padding = { top: 24, right: 20, bottom: 34, left: 34 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;

  const points = weekDates.map((dateStr, i) => {
    const stats = getDayStats(dateStr);
    const x = padding.left + (i * innerW) / (weekDates.length - 1 || 1);
    const y = padding.top + ((100 - stats.percentage) / 100) * innerH;
    return { x, y, date: dateStr, ...stats };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaPath = `${linePath} L ${padding.left + innerW} ${padding.top + innerH} L ${padding.left} ${padding.top + innerH} Z`;

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-lg shadow-gray-200/50 dark:shadow-none">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Weekly Progress Trend</h3>
        <span className="text-[11px] text-gray-500 dark:text-gray-400">Completion % by day</span>
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full min-w-[620px]" 
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
            fill="#6366f1" 
            fillOpacity="0.1" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Main Line */}
          <motion.path 
            d={linePath} 
            fill="none" 
            stroke="#818cf8" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />

          {/* Data Points */}
          {points.map((point, i) => {
            const isSelected = point.date === selectedDate;
            const dayName = dayNames[new Date(point.date + 'T00:00:00').getDay()];

            return (
              <g 
                key={point.date} 
                className="cursor-pointer" 
                onClick={() => setSelectedDate(point.date)}
              >
                {/* Circle */}
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r={isSelected ? 5.5 : 4.5}
                  fill={point.percentage === 100 ? '#10b981' : '#818cf8'}
                  stroke={isSelected ? '#ffffff' : '#111827'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="dark:stroke-gray-900"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: i * 0.06, 
                    duration: 0.3,
                    type: "spring",
                    stiffness: 300
                  }}
                  whileHover={{ scale: isSelected ? 1.2 : 1.3 }}
                />

                {/* Day Label */}
                <text
                  x={point.x}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isSelected ? '#6366f1' : '#6b7280'}
                  className="dark:fill-gray-400"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {dayName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}