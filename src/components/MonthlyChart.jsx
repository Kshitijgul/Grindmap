import React from 'react';
import { motion } from 'framer-motion';

export default function MonthlyChart({ dailyData, selectedDate, setSelectedDate }) {
  // 1. Math Setup
  const maxTasks = Math.max(...dailyData.map(d => d.total), 5);
  const chartWidth = 800;
  const chartHeight = 250;
  const padding = { top: 30, right: 20, bottom: 40, left: 40 };
  
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;
  
  // Dynamic bar width logic - sharp rectangles look better slightly wider
  const barWidth = Math.max(Math.min((innerW / dailyData.length) * 0.8, 24), 10);
  const gap = (innerW / dailyData.length);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-xl shadow-gray-200/50 dark:shadow-none">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-lg">📊</span> Daily Task Completion
        </h3>
        {selectedDate && (
          <div className="text-[10px] px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-sm font-bold uppercase tracking-wider">
            Selected: {selectedDate.split('-').slice(2).join('/')}
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto hide-scrollbar">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full min-w-[700px] h-auto" 
        >
          {/* 2. Horizontal Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + innerH * (1 - pct);
            const value = Math.round(pct * maxTasks);
            return (
              <g key={i} className="user-select-none">
                <line 
                  x1={padding.left} 
                  y1={y} 
                  x2={chartWidth - padding.right} 
                  y2={y} 
                  stroke="currentColor"
                  className="text-gray-100 dark:text-gray-800"
                  strokeWidth="1"
                />
                <text 
                  x={padding.left - 12} 
                  y={y + 4} 
                  textAnchor="end" 
                  className="fill-gray-400 dark:fill-gray-600 font-medium"
                  fontSize="10"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* 3. Bars */}
          {dailyData.map((d, i) => {
            const isSelected = d.date === selectedDate;
            const x = padding.left + (i * gap) + (gap - barWidth) / 2;
            
            // Heights
            const totalBarHeight = (d.total / maxTasks) * innerH;
            const completedBarHeight = (d.completed / maxTasks) * innerH;
            
            // Baseline Y coordinate
            const baseY = padding.top + innerH;

            return (
              <g 
                key={d.date} 
                className="cursor-pointer"
                onClick={() => setSelectedDate(d.date)}
              >
                {/* Interaction Box (Wider than bar for easier touch) */}
                <rect
                  x={x - 2}
                  y={padding.top}
                  width={barWidth + 4}
                  height={innerH}
                  fill="transparent"
                />

                {/* Background Bar (Total) - Zero Radius */}
                <rect
                  x={x}
                  y={baseY - totalBarHeight}
                  width={barWidth}
                  height={totalBarHeight}
                  className={`${
                    isSelected 
                      ? 'fill-indigo-100 dark:fill-indigo-900/40' 
                      : 'fill-gray-100 dark:fill-gray-800/40'
                  } transition-colors duration-200`}
                />

                {/* Progress Bar (Completed) - Zero Radius */}
                <motion.rect
                  x={x}
                  width={barWidth}
                  initial={{ height: 0, y: baseY }}
                  animate={{ 
                    height: completedBarHeight, 
                    y: baseY - completedBarHeight,
                    fill: d.percentage === 100 
                      ? '#10b981' 
                      : isSelected ? '#6366f1' : '#a5b4fc' 
                  }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                />

                {/* Selection Highlight (Sharp Box) */}
                {isSelected && (
                  <motion.rect
                    layoutId="activeSelection"
                    x={x - 3}
                    y={baseY - totalBarHeight - 3}
                    width={barWidth + 6}
                    height={totalBarHeight + 6}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}

                {/* Date Label (Sharp styling) */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - 15}
                  textAnchor="middle"
                  fontSize="10"
                  className={`font-bold transition-colors duration-200 ${
                    isSelected ? 'fill-indigo-600 dark:fill-indigo-400' : 'fill-gray-400'
                  }`}
                >
                  {d.day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 4. Sharp Legend Items */}
      <div className="flex items-center justify-center gap-8 mt-6 pt-5 border-t border-gray-50 dark:border-gray-800">
        <LegendItem color="bg-gray-200 dark:bg-gray-700" label="Total" />
        <LegendItem color="bg-indigo-400" label="Completed" />
        <LegendItem color="bg-green-500" label="100% Day" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 ${color}`} /> {/* Square legend icon */}
      <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}