import React from 'react';

function FocusSessionReport({ sessions, totalMinutes }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-sm font-bold text-white mb-3">⚡ Focus Session Report</h3>
        <div className="flex flex-col items-center justify-center py-10">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-gray-500 text-sm text-center">No focus sessions yet.</p>
          <p className="text-gray-600 text-xs text-center mt-1">Start a Pomodoro session to track your focus time.</p>
        </div>
      </div>
    );
  }

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-white">⚡ Focus Session Report</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">{sessions.length} session{sessions.length !== 1 ? 's' : ''} today</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-lime-400">{totalHours}h</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total Focus</div>
        </div>
      </div>

      {/* Session List */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {sessions.map((session, index) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-3 bg-gray-800/60 border border-gray-700/50 rounded-xl hover:bg-gray-800 hover:border-gray-700 transition-all"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Session number */}
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs flex-shrink-0">
                {index + 1}
              </div>

              {/* Subject + topic */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: session.subjectColor || '#6366f1' }}
                  />
                  <span className="text-sm font-semibold text-white truncate">
                    {session.subject}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 truncate ml-4">
                  {session.taskTopic || '—'}
                </div>
              </div>
            </div>

            {/* Time + duration */}
            <div className="text-right flex-shrink-0 ml-3">
              <div className="text-xs font-medium text-gray-300">
                {formatTime(session.startTime)} — {formatTime(session.endTime)}
              </div>
              <div className="text-[10px] text-lime-400 font-bold mt-0.5">
                {session.durationMinutes} min
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-3">
        <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/50">
          <div className="text-xl font-black text-indigo-400">{sessions.length}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Sessions</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/50">
          <div className="text-xl font-black text-lime-400">{totalMinutes}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Minutes</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/50">
          <div className="text-xl font-black text-purple-400">{totalHours}h</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Hours</div>
        </div>
      </div>
    </div>
  );
}

export default FocusSessionReport;