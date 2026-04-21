import React, { useState } from 'react';

function SubjectTimeline({ subjects, getSubjectTimelineStats, selectedDate, setSelectedDate, updateSubjectGoal }) {
  const [hoveredSubject, setHoveredSubject] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);

  const subjectsWithGoals = subjects.filter(s => s.startDate && s.endDate);

  if (subjectsWithGoals.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-sm font-bold text-white mb-3">📚 Subject Timeline</h3>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-gray-500 text-sm text-center">No goals set yet.</p>
          <p className="text-gray-600 text-xs text-center mt-1">
            Click the 🎯 icon next to a subject in the sidebar to set a goal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">📚 Subject Timeline</h3>
        <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-1 rounded-lg border border-gray-700 uppercase tracking-wider">
          Goal Tracker
        </span>
      </div>

      <div className="space-y-3">
        {subjectsWithGoals.map((subject) => {
          const stats = getSubjectTimelineStats(subject.id, subject.startDate, subject.endDate);
          const startDate = new Date(subject.startDate);
          const endDate = new Date(subject.endDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isExpired = today > endDate;
          const isCompleted = stats.percentage >= 100;

          return (
            <div
              key={subject.id}
              className="border border-gray-700/60 bg-gray-800/40 rounded-xl p-4 hover:border-gray-600 hover:bg-gray-800/70 transition-all"
              onMouseEnter={() => setHoveredSubject(subject.id)}
              onMouseLeave={() => setHoveredSubject(null)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color }} />
                  <span className="font-semibold text-white text-sm">{subject.name}</span>
                  {isCompleted && (
                    <span className="text-[10px] bg-green-400/10 text-green-400 px-2 py-0.5 rounded-full border border-green-400/20 font-bold">
                      ✓ Done
                    </span>
                  )}
                  {isExpired && !isCompleted && (
                    <span className="text-[10px] bg-red-400/10 text-red-400 px-2 py-0.5 rounded-full border border-red-400/20 font-bold">
                      ⚠ Overdue
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowEditModal(subject)}
                  className="text-[11px] text-gray-500 hover:text-lime-400 transition px-2 py-1 rounded-lg hover:bg-lime-400/5"
                >
                  Edit Goal
                </button>
              </div>

              {/* Goal description */}
              {subject.goal && (
                <p className="text-xs text-gray-400 mb-3 ml-5">{subject.goal}</p>
              )}

              {/* Progress bar */}
              <div className="ml-5 mb-2">
                <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1.5">
                  <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span className={`font-bold ${isCompleted ? 'text-green-400' : isExpired ? 'text-red-400' : 'text-indigo-400'}`}>
                    {stats.percentage}% Complete
                  </span>
                  <span>{endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(stats.percentage, 100)}%`,
                      backgroundColor: isCompleted ? '#4ade80' : isExpired ? '#f87171' : '#6366f1'
                    }}
                  />
                </div>
              </div>

              {/* Hover stats */}
              {hoveredSubject === subject.id && (
                <div className="ml-5 mt-3 p-3 bg-gray-900/80 rounded-xl border border-gray-700/50 grid grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase tracking-wider mb-0.5">Total</span>
                    <span className="font-bold text-white">{stats.total}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase tracking-wider mb-0.5">Done</span>
                    <span className="font-bold text-green-400">{stats.completed}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase tracking-wider mb-0.5">Days</span>
                    <span className="font-bold text-indigo-400">{stats.daysCompleted}/{stats.daysPassed}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase tracking-wider mb-0.5">Left</span>
                    <span className={`font-bold ${stats.daysRemaining === 0 ? 'text-green-400' : 'text-amber-400'}`}>
                      {stats.daysRemaining}d
                    </span>
                  </div>
                </div>
              )}

              {stats.total > 0 && (
                <div className="ml-5 mt-2 text-[10px] text-gray-600">
                  📅 {new Date(subject.startDate).toLocaleDateString()} → {new Date(subject.endDate).toLocaleDateString()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showEditModal && (
        <EditGoalModal
          subject={showEditModal}
          onClose={() => setShowEditModal(null)}
          updateSubjectGoal={updateSubjectGoal}
        />
      )}
    </div>
  );
}

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
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
          <h3 className="text-base font-bold text-white">Edit Goal — {subject.name}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Goal Description</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:border-lime-400/60 focus:outline-none transition"
              placeholder="e.g., Complete all chapters"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:border-lime-400/60 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:border-lime-400/60 focus:outline-none transition"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-sm bg-lime-400 hover:bg-lime-300 text-gray-950 font-bold rounded-xl transition"
            >
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubjectTimeline;