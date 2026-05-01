import React from 'react';
import { motion } from 'framer-motion';

export default function NavLogo3({ size = 32 }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className="flex-shrink-0 select-none"
      initial={{ opacity: 0, scale: 0.3, rotate: -60 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.05 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
    >
      <defs>
        <linearGradient id="mob_barPurple" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#6D28D9" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="mob_barGreen" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#22C55E" />
        </linearGradient>
        <linearGradient id="mob_barCoral" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect
        width="32"
        height="32"
        rx="8"
        className="fill-white dark:fill-gray-900 stroke-gray-200 dark:stroke-gray-700"
        strokeWidth="0.6"
      />

      {/* Base Ring */}
      <motion.circle
        cx="16" cy="16" r="12"
        fill="none"
        className="stroke-indigo-500/40 dark:stroke-indigo-400/30"
        strokeWidth="3.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeInOut', delay: 0.15 }}
      />

      {/* Gold Arc */}
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

      {/* Arrow Line */}
      <motion.path
        d="M28 16 L28 5"
        fill="none"
        className="stroke-indigo-500 dark:stroke-indigo-400"
        strokeWidth="3.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.9 }}
      />

      {/* Arrow Head */}
      <motion.polygon
        points="28,2 25,6 31,6"
        className="fill-indigo-500 dark:fill-indigo-400"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 1.1 }}
      />

      {/* Growth Bars */}
      <motion.rect
        x="7" y="19" width="5" height="7" rx="2"
        fill="url(#mob_barPurple)"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        style={{ transformOrigin: '9.5px 26px' }}
        transition={{ type: 'spring', stiffness: 280, damping: 15, delay: 0.25 }}
      />
      <motion.rect
        x="13" y="14" width="5" height="12" rx="2"
        fill="url(#mob_barCoral)"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        style={{ transformOrigin: '15.5px 26px' }}
        transition={{ type: 'spring', stiffness: 280, damping: 15, delay: 0.4 }}
      />
      <motion.rect
        x="19" y="9" width="5" height="17" rx="2"
        fill="url(#mob_barGreen)"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        style={{ transformOrigin: '21.5px 26px' }}
        transition={{ type: 'spring', stiffness: 280, damping: 15, delay: 0.55 }}
      />
    </motion.svg>
  );
}