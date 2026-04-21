import React from 'react';

function FocusSessionReport({ sessions, totalMinutes }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          📊 Focus Session Report
        </h3>
        <p className="text-gray-500 text-sm text-center py-8">
          No focus sessions completed yet. Start a focus session to see your progress here!
        </p>
      </div>
    );
  }

  // Group sessions by hour for timeline view
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          📊 Focus Session Report
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-600">{totalHours}h</div>
          <div className="text-xs text-gray-500">Total Focus Time</div>
        </div>
      </div>

      {/* Session List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {sessions.map((session, index) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: session.subjectColor || '#6366f1' }}
                  />
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {session.subject}
                  </span>
                </div>
                <div className="text-xs text-gray-500 truncate">{session.taskTopic}</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium text-gray-800">
                {formatTime(session.startTime)} - {formatTime(session.endTime)}
              </div>
              <div className="text-xs text-gray-500">
                {session.durationMinutes} min
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-xl font-bold text-indigo-600">{sessions.length}</div>
          <div className="text-xs text-gray-500">Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-600">{totalMinutes}</div>
          <div className="text-xs text-gray-500">Minutes</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-orange-600">{totalHours}h</div>
          <div className="text-xs text-gray-500">Hours</div>
        </div>
      </div>
    </div>
  );
}

export default FocusSessionReport;
