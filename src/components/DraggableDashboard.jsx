import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

const COMPONENTS_ORDER_KEY = 'dashboardComponentsOrder';

const DEFAULT_ORDER = [
  'subjectTimeline',
  'weeklyView',
  'weeklyProgressChart',
  'daySchedule',
  'monthlyProgressChart',
  'monthlyBarChart',
  'focusSessionReport',
];

const COMPONENT_LABELS = {
  subjectTimeline: { label: 'Subject Timeline', emoji: '📚' },
  weeklyView: { label: 'Weekly Overview', emoji: '📅' },
  weeklyProgressChart: { label: 'Weekly Progress Chart', emoji: '📈' },
  daySchedule: { label: 'Day Schedule', emoji: '🗓️' },
  monthlyProgressChart: { label: 'Monthly Progress Chart', emoji: '📊' },
  monthlyBarChart: { label: 'Monthly Bar Chart', emoji: '📉' },
  focusSessionReport: { label: 'Focus Session Report', emoji: '⚡' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function DraggableDashboard({ components }) {
  const [order, setOrder] = useState(() => {
    try {
      const saved = localStorage.getItem(COMPONENTS_ORDER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const newComponents = DEFAULT_ORDER.filter(k => !parsed.includes(k));
        return [...parsed.filter(k => DEFAULT_ORDER.includes(k)), ...newComponents];
      }
    } catch {}
    return DEFAULT_ORDER;
  });

  const [showReorder, setShowReorder] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(COMPONENTS_ORDER_KEY, JSON.stringify(order));
    } catch {}
  }, [order]);

  const moveUp = (key) => {
    setOrder(prev => {
      const idx = prev.indexOf(key);
      if (idx === 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveDown = (key) => {
    setOrder(prev => {
      const idx = prev.indexOf(key);
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return next;
    });
  };

  const resetOrder = () => {
    setOrder(DEFAULT_ORDER);
    localStorage.removeItem(COMPONENTS_ORDER_KEY);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Reorder Toggle Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-1"
      >
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowReorder(!showReorder)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
            showReorder
              ? 'bg-lime-400/10 border-lime-400/30 text-lime-600 dark:text-lime-400 shadow-lg shadow-lime-400/10'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700'
          }`}
        >
          <span className="text-sm">{showReorder ? '✓' : '⠿'}</span>
          {showReorder ? 'Done Reordering' : 'Reorder Dashboard'}
        </motion.button>

        <AnimatePresence>
          {showReorder && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetOrder}
              className="text-[10px] text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 border border-gray-200 dark:border-gray-800 px-3 py-2 rounded-lg transition"
            >
              ↺ Reset Order
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Reorder Panel */}
      <AnimatePresence>
        {showReorder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-lg shadow-gray-200/50 dark:shadow-none overflow-hidden"
          >
            <p className="text-[10px] text-gray-500 dark:text-gray-500 uppercase tracking-widest font-bold mb-3">
              {isMobile ? 'Tap arrows to reorder' : 'Drag to reorder — or use arrows'}
            </p>
            
            <Reorder.Group axis="y" values={order} onReorder={setOrder} className="space-y-2">
              {order.map((key, index) => {
                const meta = COMPONENT_LABELS[key];
                return (
                  <Reorder.Item
                    key={key}
                    value={key}
                    whileDrag={{ scale: 1.05, zIndex: 10 }}
                    className="touch-none"
                  >
                    <motion.div
                      layout
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all bg-gray-50 dark:bg-gray-800/40 ${
                        'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {/* Drag handle - hidden on mobile */}
                      {!isMobile && (
                        <div className="flex flex-col gap-0.5 flex-shrink-0 opacity-50">
                          {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex gap-0.5">
                              <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500" />
                              <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Index */}
                      <span className="text-[10px] font-mono text-gray-400 dark:text-gray-600 w-4">{index + 1}</span>

                      {/* Label */}
                      <span className="text-base flex-shrink-0">{meta.emoji}</span>
                      <span className="flex-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium truncate">{meta.label}</span>

                      {/* Arrow controls - always visible on mobile when reordering */}
                      <div className="flex gap-1 flex-shrink-0">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => moveUp(key)}
                          disabled={index === 0}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs transition shadow-sm"
                        >
                          ↑
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => moveDown(key)}
                          disabled={index === order.length - 1}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs transition shadow-sm"
                        >
                          ↓
                        </motion.button>
                      </div>
                    </motion.div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rendered Components in Order */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {order.map((key, index) => {
          const component = components[key];
          if (!component) return null;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              layout
              className="w-full"
            >
              {component}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}