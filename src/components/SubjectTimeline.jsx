import React, { useState } from 'react';

function SubjectTimeline({ subjects, getSubjectTimelineStats, selectedDate, setSelectedDate, updateSubjectGoal }) {
  const [hoveredSubject, setHoveredSubject] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);

  // Filter subjects that have goals set
  const subjectsWithGoals = subjects.filter(s => s.startDate && s.endDate);

  if (subjectsWithGoals.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📚 Subject Timeline</h3>
        <p className="text-gray-500 text-sm">
          Set goals for your subjects to see progress tracking here. Click on a subject in the sidebar to add a goal with start and end dates.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">📚 Subject Timeline</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Track progress towards your goals
        </span>
      </div>

      <div className="space-y-4">
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
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              onMouseEnter={() => setHoveredSubject(subject.id)}
              onMouseLeave={() => setHoveredSubject(null)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="font-medium text-gray-800">{subject.name}</span>
                  {isCompleted && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      ✓ Completed
                    </span>
                  )}
                  {isExpired && !isCompleted && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      ⚠ Overdue
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowEditModal(subject)}
                  className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
                >
                  Edit Goal
                </button>
              </div>

              {/* Goal Description */}
              {subject.goal && (
                <p className="text-sm text-gray-600 mb-3 ml-6">{subject.goal}</p>
              )}

              {/* Progress Bar */}
              <div className="ml-6 mb-2">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span className="font-medium text-gray-700">{stats.percentage}% Complete</span>
                  <span>{endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-green-500' : isExpired ? 'bg-red-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(stats.percentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats on Hover */}
              {hoveredSubject === subject.id && (
                <div className="ml-6 mt-3 p-3 bg-gray-50 rounded-lg grid grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 block">Total Tasks</span>
                    <span className="font-semibold text-gray-800">{stats.total}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Completed</span>
                    <span className="font-semibold text-green-600">{stats.completed}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Days Done</span>
                    <span className="font-semibold text-blue-600">{stats.daysCompleted}/{stats.daysPassed}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Days Remaining</span>
                    <span className={`font-semibold ${stats.daysRemaining === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                      {stats.daysRemaining}
                    </span>
                  </div>
                </div>
              )}

              {/* Session Progress (if tasks have focus sessions) */}
              {stats.total > 0 && (
                <div className="ml-6 mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span>📅 {new Date(subject.startDate).toLocaleDateString()} → {new Date(subject.endDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Goal Modal */}
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Edit Goal: {subject.name}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Description</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Complete all chapters"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
