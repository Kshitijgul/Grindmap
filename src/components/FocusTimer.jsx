import React, { useState, useEffect, useCallback } from 'react';

function FocusTimer({ task, date, updateTaskFocusSession, incrementTaskFocusSession, logFocusSession, onClose }) {
  const [mode, setMode] = useState('focus'); // 'focus' or 'break'
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(task.sessionsCompleted || 0);
  
  // Store times in MINUTES for user input, convert to SECONDS for timer
  const [focusTimeMin, setFocusTimeMin] = useState(task.focusTime || 25);
  const [breakTimeMin, setBreakTimeMin] = useState(task.breakTime || 5);
  const [sessionsNeeded, setSessionsNeeded] = useState(task.sessionsNeeded || 1);
  const [showSettings, setShowSettings] = useState(false);
  
  // Fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Internal timer state - always in SECONDS
  const [timeLeft, setTimeLeft] = useState((task.focusTime || 25) * 60);
  
  // Track session start time for logging
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Handle fullscreen mode
  useEffect(() => {
    if (isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      }
    }
    
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen]);

  // Timer logic - runs every second
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer completed
      const sessionEndTime = new Date().toISOString();
      
      if (mode === 'focus') {
        // Focus session done - log it
        if (sessionStartTime && currentSessionId) {
          logFocusSession(
            currentSessionId,
            task.topic,
            task.subject,
            sessionStartTime,
            sessionEndTime,
            focusTimeMin
          );
        }
        
        incrementTaskFocusSession(date, task.id);
        setSessionsCompleted((prev) => prev + 1);
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Focus Session Complete!', { body: 'Time for a break!' });
        }
        setMode('break');
        setTimeLeft(breakTimeMin * 60);
        setSessionStartTime(null);
        setCurrentSessionId(null);
      } else {
        // Break done
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Break Over!', { body: 'Ready for next focus session?' });
        }
        setMode('focus');
        setTimeLeft(focusTimeMin * 60);
      }
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, focusTimeMin, breakTimeMin, date, task.id, incrementTaskFocusSession, logFocusSession, sessionStartTime, currentSessionId, task.topic, task.subject]);

  const handleStart = () => {
    if (mode === 'focus' && !sessionStartTime) {
      setSessionStartTime(new Date().toISOString());
      setCurrentSessionId(Date.now().toString());
    }
    setIsRunning(true);
  };
  
  const handlePause = () => setIsRunning(false);
  
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? focusTimeMin * 60 : breakTimeMin * 60);
    setSessionStartTime(null);
    setCurrentSessionId(null);
  };

  const handleSaveSettings = () => {
    updateTaskFocusSession(date, task.id, focusTimeMin, breakTimeMin, sessionsNeeded);
    setTimeLeft(mode === 'focus' ? focusTimeMin * 60 : breakTimeMin * 60);
    setShowSettings(false);
  };

  // Format seconds to MM:SS
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const totalTimeForMode = mode === 'focus' ? focusTimeMin * 60 : breakTimeMin * 60;
  const progress = ((totalTimeForMode - timeLeft) / totalTimeForMode) * 100;

  // Digital clock style formatter for fullscreen
  const formatDigitalTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Fullscreen mode render
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-6 right-6 text-white/50 hover:text-white text-3xl"
        >
          
        </button>
        
        <div className="text-center">
          <div className="mb-8">
            <span className={`text-lg font-medium ${mode === 'focus' ? 'text-indigo-400' : 'text-green-400'}`}>
              {mode === 'focus' ? ' FOCUS MODE' : '☕ BREAK TIME'}
            </span>
          </div>
          
          {/* Digital clock display */}
          <div className="font-mono text-[180px] leading-none text-white font-bold tracking-wider">
            {formatDigitalTime(timeLeft)}
          </div>
          
          <div className="mt-8 text-white/60 text-xl">
            {task.topic}
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-white/40 text-lg">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: task.subjectColor || '#6366f1' }} />
            <span>{task.subject}</span>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-4">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="px-8 py-3 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                ▶ Start
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="px-8 py-3 bg-orange-500 text-white rounded-xl font-semibold text-lg hover:bg-orange-600 transition-colors"
              >
                ⏸ Pause
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-white/10 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors"
            >
              ↻ Reset
            </button>
          </div>
          
          <div className="mt-8 text-white/40 text-sm">
            Press ESC or click ✕ to exit fullscreen
          </div>
        </div>
      </div>
    );
  }

  // Normal modal mode render
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">🎯 Focus Session</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Task Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: task.subjectColor || '#6366f1' }}
            />
            <span className="text-xs font-medium text-gray-600">{task.subject}</span>
          </div>
          <p className="text-gray-800 font-medium text-sm">{task.topic}</p>
        </div>

        {/* Timer Display */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              onClick={() => {
                setMode('focus');
                setTimeLeft(focusTimeMin * 60);
                setIsRunning(false);
                setSessionStartTime(null);
                setCurrentSessionId(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mode === 'focus'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🎯 Focus
            </button>
            <button
              onClick={() => {
                setMode('break');
                setTimeLeft(breakTimeMin * 60);
                setIsRunning(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mode === 'break'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ☕ Break
            </button>
          </div>

          {/* Timer Circle */}
          <div className="relative w-40 h-40 mx-auto mb-3">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="72"
                stroke="#e5e7eb"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="72"
                stroke={mode === 'focus' ? '#6366f1' : '#22c55e'}
                strokeWidth="10"
                fill="none"
                strokeDasharray={2 * Math.PI * 72}
                strokeDashoffset={2 * Math.PI * 72 * (1 - progress / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-800 font-mono">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs text-gray-500 mt-0.5">
                {mode === 'focus' ? 'Focus Time' : 'Break Time'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm"
              >
                ▶ Start
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors text-sm"
              >
                ⏸ Pause
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
            >
               Reset
            </button>
            <button
              onClick={() => setIsFullscreen(true)}
              className="px-4 py-2.5 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition-colors text-sm"
              title="Fullscreen Focus Mode"
            >
              ⛶ Fullscreen
            </button>
          </div>
        </div>

        {/* Session Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
            <span>Sessions Completed</span>
            <span className="font-medium">{sessionsCompleted} / {sessionsNeeded}</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((sessionsCompleted / sessionsNeeded) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
        >
          ⚙️ {showSettings ? 'Hide' : 'Configure'} Session Settings
        </button>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Focus Time (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={focusTimeMin}
                  onChange={(e) => setFocusTimeMin(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Break Time (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={breakTimeMin}
                  onChange={(e) => setBreakTimeMin(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Sessions Needed
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={sessionsNeeded}
                onChange={(e) => setSessionsNeeded(Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <button
              onClick={handleSaveSettings}
              className="w-full py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
            >
              Save Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FocusTimer;
