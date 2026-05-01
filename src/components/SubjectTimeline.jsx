import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function SubjectTimeline({ subjects, getSubjectTimelineStats, selectedDate, setSelectedDate, updateSubjectGoal }) {
  const [hoveredSubject, setHoveredSubject] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const subjectsWithGoals = subjects.filter(s => s.startDate && s.endDate);

  if (subjectsWithGoals.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg shadow-gray-200/50 dark:shadow-none">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">📚 Subject Timeline</h3>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[10px] px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            {collapsed ? '▼ Show' : '▲ Hide'}
          </button>
        </div>
        {!collapsed && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">No goals set yet.</p>
            <p className="text-gray-400 dark:text-gray-600 text-xs text-center mt-1">
              Click the 🎯 icon next to a subject in the sidebar to set a goal.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-lg shadow-gray-200/50 dark:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">📚 Subject Timeline</h3>
          {collapsed && (
            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">
              {subjectsWithGoals.length} goals
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!collapsed && (
            <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 uppercase tracking-wider">
              Goal Tracker
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[10px] px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600 transition font-medium"
          >
            {collapsed ? '▼ Show' : '▲ Hide'}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 overflow-hidden"
          >
            {subjectsWithGoals.map((subject, index) => {
              const stats = getSubjectTimelineStats(subject.id, subject.startDate, subject.endDate);
              const startDate = new Date(subject.startDate);
              const endDate = new Date(subject.endDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isExpired = today > endDate;
              const isCompleted = stats.percentage >= 100;

              return (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-800/70 transition-all"
                  onMouseEnter={() => setHoveredSubject(subject.id)}
                  onMouseLeave={() => setHoveredSubject(null)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color }} />
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">{subject.name}</span>
                      {isCompleted && (
                        <span className="text-[10px] bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-400/20 font-bold">
                          ✓ Done
                        </span>
                      )}
                      {isExpired && !isCompleted && (
                        <span className="text-[10px] bg-red-100 dark:bg-red-400/10 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-400/20 font-bold">
                          ⚠ Overdue
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowEditModal(subject)}
                      className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-lime-600 dark:hover:text-lime-400 transition px-2 py-1 rounded-lg hover:bg-lime-100 dark:hover:bg-lime-400/5"
                    >
                      Edit Goal
                    </button>
                  </div>

                  {subject.goal && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 ml-5">{subject.goal}</p>
                  )}

                  <div className="ml-5 mb-2">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1.5">
                      <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span className={`font-bold ${isCompleted ? 'text-green-600 dark:text-green-400' : isExpired ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        {stats.percentage}% Complete
                      </span>
                      <span>{endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(stats.percentage, 100)}%`,
                          backgroundColor: isCompleted ? '#4ade80' : isExpired ? '#f87171' : '#6366f1'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(stats.percentage, 100)}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>

                  {/* Hover Details */}
                  <AnimatePresence>
                    {hoveredSubject === subject.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-5 mt-3 p-3 bg-gray-100 dark:bg-gray-900/80 rounded-xl border border-gray-200 dark:border-gray-700/50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs overflow-hidden"
                      >
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block text-[10px] uppercase tracking-wider mb-0.5">Total</span>
                          <span className="font-bold text-gray-900 dark:text-white">{stats.total}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block text-[10px] uppercase tracking-wider mb-0.5">Done</span>
                          <span className="font-bold text-green-600 dark:text-green-400">{stats.completed}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block text-[10px] uppercase tracking-wider mb-0.5">Days</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{stats.daysCompleted}/{stats.daysPassed}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block text-[10px] uppercase tracking-wider mb-0.5">Left</span>
                          <span className={`font-bold ${stats.daysRemaining === 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {stats.daysRemaining}d
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {stats.total > 0 && (
                    <div className="ml-5 mt-2 text-[10px] text-gray-500 dark:text-gray-400">
                      📅 {new Date(subject.startDate).toLocaleDateString()} → {new Date(subject.endDate).toLocaleDateString()}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Summary */}
      {collapsed && (
        <div className="flex flex-wrap gap-2">
          {subjectsWithGoals.map(subject => {
            const stats = getSubjectTimelineStats(subject.id, subject.startDate, subject.endDate);
            const isCompleted = stats.percentage >= 100;
            const isExpired = new Date() > new Date(subject.endDate);
            return (
              <div key={subject.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 rounded-xl">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{subject.name}</span>
                <span className={`text-[10px] font-bold ${isCompleted ? 'text-green-600 dark:text-green-400' : isExpired ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                  {stats.percentage}%
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditGoalModal
            subject={showEditModal}
            onClose={() => setShowEditModal(null)}
            updateSubjectGoal={updateSubjectGoal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Edit Goal Modal
function EditGoalModal({ subject, onClose, updateSubjectGoal }) {
  const [goal, setGoal] = useState(subject.goal || '');
  const [startDate, setStartDate] = useState(subject.startDate || '');
  const [endDate, setEndDate] = useState(subject.endDate || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSubjectGoal(subject.id, goal, startDate || null, endDate || null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Edit Goal — {subject.name}</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Goal Description</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-lime-500 dark:focus:border-lime-400/60 focus:outline-none transition"
              placeholder="e.g., Complete all chapters"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:border-lime-500 dark:focus:border-lime-400/60 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:border-lime-500 dark:focus:border-lime-400/60 focus:outline-none transition"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2.5 text-sm bg-lime-400 hover:bg-lime-500 text-gray-950 font-bold rounded-xl transition shadow-md shadow-lime-400/20">
              Save Goal
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default SubjectTimeline;