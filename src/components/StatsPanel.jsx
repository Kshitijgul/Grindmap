import React from 'react';
import { motion } from 'framer-motion';

export default function StatsPanel({
  monthStats,
  weekStats,
  subjectStats,
  subjects,
  streakDays,
}) {
  const getSubjectColor = (name) =>
    subjects.find((s) => s.name === name)?.color || "#6366f1";

  // Donut chart calculations
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (monthStats.percentage / 100) * circumference;

  // Subject breakdown sorted by total
  const subjectEntries = Object.entries(subjectStats).sort(
    (a, b) => b[1].total - a[1].total,
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Stat Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3"
      >
        {/* Month */}
        <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Month</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {monthStats.completed}
            <span className="text-sm text-gray-500 dark:text-gray-400">/{monthStats.total}</span>
          </div>
          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            {monthStats.percentage}% done
          </div>
        </motion.div>

        {/* This Week */}
        <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">This Week</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {weekStats.completed}
            <span className="text-sm text-gray-500 dark:text-gray-400">/{weekStats.total}</span>
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
            {weekStats.percentage}% done
          </div>
        </motion.div>

        {/* Remaining */}
        <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Remaining</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {monthStats.total - monthStats.completed}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">tasks left</div>
        </motion.div>

        {/* Streak */}
        <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Streak</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
            {streakDays} 🔥
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {streakDays === 0 ? "Complete tasks daily to build streak" : "days in a row"}
          </div>
        </motion.div>
      </motion.div>

      {/* Monthly Progress Donut */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Monthly Progress</h3>
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="150" height="150" viewBox="0 0 150 150">
              {/* Background Circle */}
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                className="dark:stroke-gray-800"
                strokeWidth="12"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="75"
                cy="75"
                r={radius}
                fill="none"
                stroke={monthStats.percentage === 100 ? "#10b981" : "#6366f1"}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 75 75)"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-black ${monthStats.percentage === 100 ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
                {monthStats.percentage}%
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Breakdown */}
      {subjectEntries.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Subject Breakdown</h3>
          <div className="space-y-3.5">
            {subjectEntries.map(([name, stats], index) => {
              const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
              return (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getSubjectColor(name) }} />
                      <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{name}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {stats.completed}/{stats.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: getSubjectColor(name) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}