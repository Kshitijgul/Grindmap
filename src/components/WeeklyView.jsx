// import React from 'react';
// import { motion } from 'framer-motion';

// export default function WeeklyView({ weekDates, selectedDate, setSelectedDate, getDayTasks, getDayStats, subjects }) {
//   if (!weekDates?.length) return null;

//   const getSubjectColor = (name) => {
//     return subjects.find(s => s.name === name)?.color || '#6366f1';
//   };

//   // --- Data Calculation Logic ---
//   const today = new Date();
//   const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

//   let weekTotal = 0;
//   let weekCompleted = 0;
//   weekDates.forEach(d => {
//     const s = getDayStats(d);
//     weekTotal += s.total;
//     weekCompleted += s.completed;
//   });
//   const weekPct = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

//   const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

//   // --- Animation Variants ---
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { staggerChildren: 0.05, delayChildren: 0.1 },
//     },
//   };

//   const cardVariants = {
//     hidden: { opacity: 0, scale: 0.9 },
//     visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
//   };

//   // Format Date Range
//   const startDate = new Date(weekDates[0]);
//   const endDate = new Date(weekDates[6]);
//   const monthName = startDate.toLocaleDateString('en-US', { month: 'short' });
//   const startDay = startDate.getDate();
//   const endDay = endDate.getDate();

//   return (
//     <motion.div 
//       initial={{ y: 20, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden w-full max-w-6xl mx-auto"
//     >
//       {/* HEADER SECTION */}
//       <div className="px-6 py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
//         <div>
//           <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
//             <span className="text-indigo-500 text-lg">📅</span> Weekly Overview
//           </h3>
//           <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
//             {monthName} {startDay} — {endDay}, {startDate.getFullYear()}
//           </p>
//         </div>

//         {/* Compact Stats Pill */}
//         <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-2xl">
//           <div>
//             <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">Completion</div>
//             <div className={`text-2xl font-extrabold ${weekPct === 100 ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
//               {weekPct}%
//             </div>
//           </div>
//           <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
//           <div>
//             <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">Progress</div>
//             <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
//               {weekCompleted}/{weekTotal} Tasks
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* GRID CAROUSEL SECTION */}
//       <div className="relative pl-6 pr-2">
//         {/* Horizontal Scroll Container - Optimized for Touch */}
//         <motion.div 
//           variants={containerVariants}
//           initial="hidden"
//           animate="visible"
//           className="flex overflow-x-auto pb-6 pt-2 gap-3 scrollbar-hide snap-x snap-mandatory no-scrollbar"
//           style={{ scrollPaddingLeft: '24px' }}
//         >
//           {weekDates.map((dateStr, i) => {
//             const d = new Date(dateStr + 'T00:00:00');
//             const dayNum = d.getDate();
//             const tasks = getDayTasks(dateStr);
//             const stats = getDayStats(dateStr);
//             const isSelected = dateStr === selectedDate;
//             const isToday = dateStr === todayStr;
//             const isPast = dateStr < todayStr;
//             const dayName = dayNames[d.getDay()];

//             return (
//               <motion.button
//                 key={dateStr}
//                 variants={cardVariants}
//                 whileHover={{ y: -2 }}
//                 onClick={() => setSelectedDate(dateStr)}
//                 className={`
//                   group relative flex-shrink-0 w-[160px] md:w-[180px] h-auto rounded-2xl p-4 text-left transition-all duration-200 snap-start
//                   ${isSelected 
//                     ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-900' 
//                     : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-md'
//                   }
//                 `}
//               >
//                 {/* Top Row: Day Name & Date */}
//                 <div className="flex justify-between items-start mb-4">
//                   <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-indigo-200' : 'text-gray-400'}`}>
//                     {dayName}
//                   </span>
//                   <span className={`
//                     w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors
//                     ${isToday 
//                       ? (isSelected ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white') 
//                       : (isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-200')
//                     }
//                   `}>
//                     {dayNum}
//                   </span>
//                 </div>

//                 {/* Middle Section: Task Preview (Clamped) */}
//                 <div className={`space-y-2 mb-4 min-h-[60px] ${isSelected ? 'text-indigo-50' : 'text-gray-600 dark:text-gray-300'}`}>
//                   {tasks.length > 0 ? (
//                     <>
//                       {tasks.slice(0, 3).map(task => (
//                         <div key={task.id} className="flex items-start gap-2 text-xs leading-tight">
//                           <div 
//                             className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${task.done ? 'bg-green-400' : (isSelected ? 'bg-indigo-300' : 'bg-indigo-400')}`}
//                           />
//                           <span className={`${task.done ? 'opacity-60 line-through' : ''} truncate w-24 block`}>
//                             {task.topic}
//                           </span>
//                         </div>
//                       ))}
//                       {tasks.length > 3 && (
//                         <div className={`text-[10px] font-medium italic ${isSelected ? 'text-indigo-200' : 'text-gray-400'}`}>
//                           +{tasks.length - 3} more
//                         </div>
//                       )}
//                     </>
//                   ) : (
//                     <div className={`text-xs italic ${isSelected ? 'text-indigo-200' : 'text-gray-400'}`}>No tasks planned</div>
//                   )}
//                 </div>

//                 {/* Bottom Section: Mini Progress Bar */}
//                 {tasks.length > 0 && (
//                   <div className={`pt-3 border-t ${isSelected ? 'border-indigo-500/30' : 'border-gray-100 dark:border-gray-700'}`}>
//                     <div className="flex items-end justify-between mb-1">
//                       <span className={`text-[10px] font-bold ${isSelected ? 'text-indigo-100' : 'text-gray-500'}`}>
//                         {stats.completed}/{stats.total} Done
//                       </span>
//                       <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
//                         {stats.percentage}%
//                       </span>
//                     </div>
                    
//                     {/* Bar Background */}
//                     <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-indigo-800/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
//                       <motion.div
//                         className="h-full rounded-full"
//                         style={{
//                           backgroundColor: stats.percentage === 100 ? '#4ade80' : (isSelected ? '#fff' : '#6366f1'),
//                         }}
//                         initial={{ width: 0 }}
//                         animate={{ width: `${stats.percentage}%` }}
//                         transition={{ duration: 0.8, delay: 0.2 }}
//                       />
//                     </div>
//                   </div>
//                 )}
//               </motion.button>
//             );
//           })}
          
//           {/* Spacer for right scroll padding */}
//           <div className="w-6 flex-shrink-0"></div>
//         </motion.div>
        
//         {/* Scroll Indicator Hint (Subtle) */}
//         <div className="absolute top-1/2 -right-2 -translate-y-1/2 hidden lg:block pointer-events-none">
//            <div className="w-2 h-24 bg-gradient-to-l from-gray-100 dark:from-gray-900 to-transparent opacity-50"></div>
//         </div>
//       </div>
//     </motion.div>
//   );
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function WeeklyView({
  weekDates,
  selectedDate,
  setSelectedDate,
  getDayTasks,
  getDayStats,
  subjects,
}) {
  if (!weekDates?.length) return null;

  const scrollRef = useRef(null);

  // Swipe state
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const getSubjectColor = (name) => {
    return subjects.find((s) => s.name === name)?.color || '#6366f1';
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Week stats
  let weekTotal = 0;
  let weekCompleted = 0;
  weekDates.forEach((d) => {
    const s = getDayStats(d);
    weekTotal += s.total;
    weekCompleted += s.completed;
  });
  const weekPct = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Scroll to today on mount
  React.useEffect(() => {
    if (scrollRef.current) {
      const todayIndex = weekDates.indexOf(todayStr);
      if (todayIndex >= 0) {
        const card = scrollRef.current.children[todayIndex + 1]; // +1 for left padding
        if (card) {
          setTimeout(() => {
            card.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'center',
            });
          }, 300);
        }
      }
    }
  }, [weekDates]);

  // ==================== TOUCH SWIPE HANDLER ====================
  const minSwipeDistance = 60;

  const handleSwipe = (direction) => {
    const currentIndex = weekDates.indexOf(selectedDate);
    let newIndex = currentIndex;

    if (direction === 'left' && currentIndex < weekDates.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'right' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }

    if (newIndex !== currentIndex) {
      const newDate = weekDates[newIndex];
      setSelectedDate(newDate);

      // Scroll to the new card
      if (scrollRef.current) {
        const card = scrollRef.current.children[newIndex + 1]; // +1 for padding
        if (card) {
          setTimeout(() => {
            card.scrollIntoView({
              behavior: 'smooth',
              inline: 'center',
              block: 'nearest',
            });
          }, 50);
        }
      }
    }
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleSwipe('left'); // swipe left = next day
    } else if (isRightSwipe) {
      handleSwipe('right'); // swipe right = previous day
    }

    // Reset
    setTouchStart(null);
    setTouchEnd(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const dayVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg shadow-gray-200/50 dark:shadow-none">
      {/* ============ HEADER ============ */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              📅 Weekly Overview
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {new Date(weekDates[0] + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
              {' — '}
              {new Date(weekDates[6] + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Week Progress
              </div>
              <div
                className={`text-lg sm:text-xl font-bold ${
                  weekPct === 100
                    ? 'text-green-600 dark:text-green-400'
                    : weekPct >= 50
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {weekPct}%
              </div>
            </div>
            <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
              {weekCompleted}/{weekTotal}
            </div>
          </div>
        </div>

        {/* Week Progress Bar */}
        <div className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor:
                weekPct === 100
                  ? '#10b981'
                  : weekPct >= 50
                  ? '#6366f1'
                  : '#a5b4fc',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${weekPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* ============ MOBILE: Scrollable Cards with Swipe ============ */}
      <div className="md:hidden">
        <motion.div
          ref={scrollRef}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Left padding */}
          <div className="flex-shrink-0 w-3" />

          {weekDates.map((dateStr) => {
            const d = new Date(dateStr + 'T00:00:00');
            const dayNum = d.getDate();
            const tasks = getDayTasks(dateStr);
            const stats = getDayStats(dateStr);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;
            const isPast = dateStr < todayStr && !isToday;
            const dayName = dayNamesShort[d.getDay()];
            const monthShort = d.toLocaleDateString('en-US', { month: 'short' });

            const completedTasks = tasks.filter((t) => t.done);
            const pendingTasks = tasks.filter((t) => !t.done);

            return (
              <motion.button
                key={dateStr}
                variants={dayVariants}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedDate(dateStr)}
                className={`
                  snap-center
                  flex-shrink-0
                  w-[78vw] max-w-[300px]
                  mx-1.5
                  p-4
                  rounded-2xl
                  text-left
                  transition-all duration-200
                  flex flex-col
                  min-h-[220px]
                  border-2
                  ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-500 shadow-md shadow-indigo-200/50 dark:shadow-indigo-900/30'
                      : isToday
                      ? 'bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-gray-900 border-indigo-200 dark:border-indigo-800/50'
                      : 'bg-gray-50/50 dark:bg-gray-800/30 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800/60'
                  }
                `}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        isToday
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {dayName}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-xl font-bold ${
                          isToday
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : isSelected
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {dayNum}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {monthShort}
                      </span>
                    </div>
                  </div>

                  {isToday && (
                    <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-indigo-600 text-white uppercase tracking-wide">
                      Today
                    </span>
                  )}

                  {!isToday && isSelected && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  )}
                </div>

                {/* Task List */}
                <div className="flex-1 space-y-1.5">
                  {tasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="text-2xl mb-1 opacity-30">📋</div>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 italic">
                        No tasks
                      </span>
                    </div>
                  )}

                  {pendingTasks.slice(0, 2).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/60 rounded-lg px-2.5 py-1.5"
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getSubjectColor(task.subject) }}
                      />
                      <span className="text-[11px] text-gray-700 dark:text-gray-300 truncate">
                        {task.topic}
                      </span>
                    </div>
                  ))}

                  {completedTasks.slice(0, 1).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
                    >
                      <div className="w-2 h-2 rounded-full flex-shrink-0 bg-green-500" />
                      <span className="text-[11px] text-gray-400 dark:text-gray-600 line-through truncate">
                        {task.topic}
                      </span>
                    </div>
                  ))}

                  {tasks.length > 3 && (
                    <div className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium pl-7">
                      +{tasks.length - 3} more tasks
                    </div>
                  )}
                </div>

                {/* Progress Footer */}
                {tasks.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-gray-200/60 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            stats.percentage === 100
                              ? 'bg-green-500'
                              : 'bg-indigo-500'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-medium ${
                            stats.percentage === 100
                              ? 'text-green-600 dark:text-green-400'
                              : isPast && stats.percentage < 100
                              ? 'text-red-500 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {stats.completed}/{stats.total} tasks
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-bold ${
                          stats.percentage === 100
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {stats.percentage}%
                      </span>
                    </div>

                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          width: `${stats.percentage}%`,
                          backgroundColor:
                            stats.percentage === 100 ? '#10b981' : '#6366f1',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.percentage}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}

          {/* Right padding */}
          <div className="flex-shrink-0 w-3" />
        </motion.div>

        {/* Scroll indicator dots */}
        <div className="flex justify-center gap-1.5 py-3">
          {weekDates.map((dateStr, i) => {
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            return (
              <button
                key={dateStr}
                onClick={() => {
                  setSelectedDate(dateStr);
                  if (scrollRef.current?.children[i + 1]) {
                    scrollRef.current.children[i + 1].scrollIntoView({
                      behavior: 'smooth',
                      inline: 'center',
                    });
                  }
                }}
                className={`transition-all duration-200 rounded-full ${
                  isSelected
                    ? 'w-5 h-2 bg-indigo-500'
                    : isToday
                    ? 'w-2 h-2 bg-indigo-300 dark:bg-indigo-600'
                    : 'w-2 h-2 bg-gray-300 dark:bg-gray-600'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* ============ DESKTOP: 7-Column Grid ============ */}
      <div className="hidden md:block">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-7 divide-x divide-gray-200 dark:divide-gray-800"
        >
          {weekDates.map((dateStr) => {
            const d = new Date(dateStr + 'T00:00:00');
            const dayNum = d.getDate();
            const tasks = getDayTasks(dateStr);
            const stats = getDayStats(dateStr);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;
            const isPast = dateStr < todayStr && !isToday;
            const dayName = dayNames[d.getDay()];

            return (
              <motion.button
                key={dateStr}
                variants={dayVariants}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDate(dateStr)}
                className={`p-3 text-left transition-all min-h-[140px] flex flex-col w-full ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500 ring-inset'
                    : isToday
                    ? 'bg-indigo-50/50 dark:bg-indigo-900/10'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                {/* Day header */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      isToday
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {dayName}
                  </span>
                  <span
                    className={`text-sm font-bold flex items-center justify-center ${
                      isToday
                        ? 'bg-indigo-600 text-white w-6 h-6 rounded-full text-xs'
                        : isSelected
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {dayNum}
                  </span>
                </div>

                {/* Tasks mini list */}
                <div className="flex-1 space-y-1">
                  {tasks.slice(0, 4).map((task) => (
                    <div key={task.id} className="flex items-center gap-1.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          task.done ? 'bg-green-500' : ''
                        }`}
                        style={{
                          backgroundColor: task.done
                            ? undefined
                            : getSubjectColor(task.subject),
                        }}
                      />
                      <span
                        className={`text-[10px] truncate ${
                          task.done
                            ? 'text-gray-400 dark:text-gray-600 line-through'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {task.topic}
                      </span>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <span className="text-[10px] text-gray-300 dark:text-gray-600 italic">
                      No tasks
                    </span>
                  )}
                  {tasks.length > 4 && (
                    <span className="text-[9px] text-gray-400 dark:text-gray-600">
                      +{tasks.length - 4} more
                    </span>
                  )}
                </div>

                {/* Day stats */}
                {tasks.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800/50">
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${stats.percentage}%`,
                          backgroundColor:
                            stats.percentage === 100 ? '#10b981' : '#6366f1',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.percentage}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span
                        className={`text-[9px] font-medium ${
                          stats.percentage === 100
                            ? 'text-green-600 dark:text-green-400'
                            : isPast && stats.percentage < 100
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {stats.completed}/{stats.total}
                      </span>
                      <span
                        className={`text-[9px] font-bold ${
                          stats.percentage === 100
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {stats.percentage}%
                      </span>
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* ============ HIDE SCROLLBAR STYLE ============ */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}