import React from 'react';
import { motion } from 'framer-motion';

export default function GrindMapLogo({ size = 'default' }) {
  // Size presets
  const sizes = {
    small: { height: 32, iconScale: 0.75, fontSize: 18, gap: 6 },
    default: { height: 40, iconScale: 0.95, fontSize: 22, gap: 8 },
    large: { height: 56, iconScale: 1.2, fontSize: 30, gap: 10 },
  };

  const s = sizes[size] || sizes.default;

  return (
    <div className="flex items-center select-none" style={{ gap: s.gap }}>
      {/* ============ ICON ============ */}
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width={s.height}
        height={s.height}
        initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
      >
        <defs>
          <linearGradient id="logoBarPurple" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#6D28D9" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="logoBarGreen" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
          <linearGradient id="logoBarCoral" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>
        </defs>

        {/* Base Ring */}
        <motion.circle
          cx="16"
          cy="16"
          r="12"
          fill="none"
          className="stroke-indigo-400/40 dark:stroke-indigo-500/30"
          strokeWidth="3.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeInOut', delay: 0.2 }}
        />

        {/* Gold Progress Arc */}
        <motion.path
          d="M4 16 A12 12 0 0 1 28 16"
          fill="none"
          stroke="#FFB900"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
        />

        {/* Upward Arrow Line */}
        <motion.path
          d="M28 16 L28 5"
          className="stroke-indigo-500 dark:stroke-indigo-400"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.9 }}
        />

        {/* Arrow Head */}
        <motion.polygon
          points="28,2 25,6 31,6"
          className="fill-indigo-500 dark:fill-indigo-400"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.1 }}
        />

        {/* Growth Bars - Animated up from bottom */}
        <motion.rect
          x="7" y="19" width="5" height="7" rx="2"
          fill="url(#logoBarPurple)"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{ transformOrigin: '9.5px 26px' }}
        />
        <motion.rect
          x="13" y="14" width="5" height="12" rx="2"
          fill="url(#logoBarCoral)"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          style={{ transformOrigin: '15.5px 26px' }}
        />
        <motion.rect
          x="19" y="9" width="5" height="17" rx="2"
          fill="url(#logoBarGreen)"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          style={{ transformOrigin: '21.5px 26px' }}
        />
      </motion.svg>

      {/* ============ TEXT ============ */}
      <div className="flex flex-col">
        <motion.div
          className="flex items-baseline"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <span
            className="font-black tracking-tight text-gray-900 dark:text-white"
            style={{ fontSize: s.fontSize, lineHeight: 1.1 }}
          >
            GRIND
          </span>
          <span
            className="font-black tracking-tight text-gray-500 dark:text-gray-400"
            style={{ fontSize: s.fontSize, lineHeight: 1.1 }}
          >
            MAP
          </span>
        </motion.div>

        {/* Animated Underline Segments */}
        <div className="flex items-center gap-[3px] mt-[3px]">
          <motion.div
            className="h-[3px] rounded-full bg-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: s.fontSize * 1.1 }}
            transition={{ duration: 0.4, delay: 0.6, ease: 'easeOut' }}
          />
          <motion.div
            className="h-[3px] rounded-full bg-purple-500"
            initial={{ width: 0 }}
            animate={{ width: s.fontSize * 0.9 }}
            transition={{ duration: 0.35, delay: 0.8, ease: 'easeOut' }}
          />
          <motion.div
            className="h-[3px] rounded-full bg-pink-500"
            initial={{ width: 0 }}
            animate={{ width: s.fontSize * 0.7 }}
            transition={{ duration: 0.3, delay: 1.0, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}