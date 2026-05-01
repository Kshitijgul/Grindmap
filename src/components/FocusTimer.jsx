import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getGlobalSettings } from './SettingsModal';

const ACTIVE_SESSION_KEY = 'activeGrindSession';
const PENDING_SESSIONS_KEY = 'pendingSessions';

const getSavedSettings = () => {
  try {
    const saved = localStorage.getItem('focusTimerSettings');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { focusTimeMin: 25, breakTimeMin: 5, sessionsNeeded: 1 };
};

const saveSettings = (focusTimeMin, breakTimeMin, sessionsNeeded) => {
  try {
    localStorage.setItem('focusTimerSettings', JSON.stringify({ focusTimeMin, breakTimeMin, sessionsNeeded }));
  } catch {}
};

const saveActiveSession = (state) => {
  try { localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(state)); } catch {}
};

const clearActiveSession = () => {
  try { localStorage.removeItem(ACTIVE_SESSION_KEY); } catch {}
};

const savePendingSession = (sessionData) => {
  try {
    const existing = JSON.parse(localStorage.getItem(PENDING_SESSIONS_KEY) || '[]');
    existing.push(sessionData);
    localStorage.setItem(PENDING_SESSIONS_KEY, JSON.stringify(existing));
  } catch {}
};

const getPendingSessions = () => {
  try {
    return JSON.parse(localStorage.getItem(PENDING_SESSIONS_KEY) || '[]');
  } catch { return []; }
};

const clearPendingSessions = () => {
  try { localStorage.removeItem(PENDING_SESSIONS_KEY); } catch {}
};

function FocusTimer({
  task, date, updateTaskFocusSession,
  incrementTaskFocusSession, logFocusSession, onClose,
}) {
  const savedSettings = getSavedSettings();

  const [mode, setMode] = useState("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [alarmPlaying, setAlarmPlaying] = useState(false);
  const [offlinePending, setOfflinePending] = useState(() => getPendingSessions().length > 0);
  const [sessionWasRestored, setSessionWasRestored] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(task.sessionsCompleted || 0);
  const [focusTimeMin, setFocusTimeMin] = useState(task.focusTime || savedSettings.focusTimeMin);
  const [breakTimeMin, setBreakTimeMin] = useState(task.breakTime || savedSettings.breakTimeMin);
  const [sessionsNeeded, setSessionsNeeded] = useState(task.sessionsNeeded || savedSettings.sessionsNeeded);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState((task.focusTime || savedSettings.focusTimeMin) * 60);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const intervalRef = useRef(null);
  const timeLeftRef = useRef((task.focusTime || savedSettings.focusTimeMin) * 60);
  const modeRef = useRef("focus");
  const isRunningRef = useRef(false);
  const focusTimeMinRef = useRef(task.focusTime || savedSettings.focusTimeMin);
  const breakTimeMinRef = useRef(task.breakTime || savedSettings.breakTimeMin);
  const sessionStartTimeRef = useRef(null);
  const currentSessionIdRef = useRef(null);
  const wallClockStartRef = useRef(null);
  const totalSecondsRef = useRef((task.focusTime || savedSettings.focusTimeMin) * 60);
  const audioRef = useRef(null);
  const alarmTimeoutRef = useRef(null);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { focusTimeMinRef.current = focusTimeMin; }, [focusTimeMin]);
  useEffect(() => { breakTimeMinRef.current = breakTimeMin; }, [breakTimeMin]);
  useEffect(() => { sessionStartTimeRef.current = sessionStartTime; }, [sessionStartTime]);
  useEffect(() => { currentSessionIdRef.current = currentSessionId; }, [currentSessionId]);

  // Check for interrupted session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.taskId === task.id && state.date === date) {
          const elapsed = Math.floor((Date.now() - state.wallClockStart) / 1000);
          const remaining = Math.max(state.totalSeconds - elapsed, 0);
          if (remaining > 0) {
            sessionStartTimeRef.current = state.sessionStartTime;
            currentSessionIdRef.current = Date.now().toString();
            wallClockStartRef.current = state.wallClockStart;
            totalSecondsRef.current = state.totalSeconds;
            focusTimeMinRef.current = state.focusTimeMin;
            timeLeftRef.current = remaining;
            setTimeLeft(remaining);
            setSessionStartTime(state.sessionStartTime);
            setSessionWasRestored(true);
          } else {
            clearActiveSession();
            const endTime = new Date(state.wallClockStart + state.totalSeconds * 1000).toISOString();
            safeLogFocusSession({
              date: state.date, taskId: state.taskId, subjectId: state.subjectId,
              durationMinutes: state.focusTimeMin, startTime: state.sessionStartTime, endTime,
            });
          }
        } else {
          clearActiveSession();
        }
      }
    } catch {}
  }, []);

  // Retry pending sessions when internet returns
  useEffect(() => {
    const handleOnline = () => retryPendingSessions();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // Notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      if (document.fullscreenElement) document.exitFullscreen?.();
    }
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isFullscreen]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      stopAlarm();
    };
  }, []);

  // ── Alarm ──
  const playAlarm = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const globalSettings = getGlobalSettings();
    const alarmUrl = globalSettings.alarmUrl;
    const volume = (globalSettings.alarmVolume || 80) / 100;

    if (alarmUrl) {
      const audio = new Audio(alarmUrl);
      audio.loop = true;
      audio.volume = volume;
      audio.play().catch(() => {});
      audioRef.current = audio;
      setAlarmPlaying(true);
      alarmTimeoutRef.current = setTimeout(() => stopAlarm(), 10000);
    } else {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        let beepCount = 0;
        const beep = () => {
          if (beepCount >= 5) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          osc.type = 'sine';
          gain.gain.setValueAtTime(volume, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.4);
          beepCount++;
          setTimeout(beep, 600);
        };
        beep();
        setAlarmPlaying(true);
        alarmTimeoutRef.current = setTimeout(() => setAlarmPlaying(false), 10000);
      } catch {}
    }
  };

  const stopAlarm = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (alarmTimeoutRef.current) { clearTimeout(alarmTimeoutRef.current); alarmTimeoutRef.current = null; }
    setAlarmPlaying(false);
  };

  // ── Safe logger ──
  const safeLogFocusSession = async (sessionData) => {
    try {
      await logFocusSession(
        sessionData.date, sessionData.taskId, sessionData.subjectId,
        sessionData.durationMinutes, sessionData.startTime, sessionData.endTime,
      );
      retryPendingSessions();
    } catch (err) {
      console.warn('Session save failed (offline?), queuing:', err);
      savePendingSession(sessionData);
      setOfflinePending(true);
    }
  };

  const retryPendingSessions = async () => {
    const pending = getPendingSessions();
    if (pending.length === 0) return;
    let allSucceeded = true;
    for (const session of pending) {
      try {
        await logFocusSession(
          session.date, session.taskId, session.subjectId,
          session.durationMinutes, session.startTime, session.endTime,
        );
      } catch { allSucceeded = false; break; }
    }
    if (allSucceeded) { clearPendingSessions(); setOfflinePending(false); }
  };

  // ── Complete session manually ──
  const handleCompleteSession = () => {
    stopInterval();
    setIsRunning(false);
    clearActiveSession();
    const sessionEndTime = new Date().toISOString();
    if (modeRef.current === "focus" && sessionStartTimeRef.current) {
      const elapsed = wallClockStartRef.current
        ? Math.floor((Date.now() - wallClockStartRef.current) / 1000)
        : focusTimeMinRef.current * 60;
      const actualMinutes = Math.max(1, Math.round(elapsed / 60));
      safeLogFocusSession({
        date, taskId: task.id, subjectId: task.subject_id,
        durationMinutes: actualMinutes,
        startTime: sessionStartTimeRef.current,
        endTime: sessionEndTime,
      });
      incrementTaskFocusSession(date, task.id);
      setSessionsCompleted(prev => prev + 1);
    }
    playAlarm();
    modeRef.current = "break";
    setMode("break");
    const breakSecs = breakTimeMinRef.current * 60;
    totalSecondsRef.current = breakSecs;
    timeLeftRef.current = breakSecs;
    setTimeLeft(breakSecs);
    wallClockStartRef.current = null;
    sessionStartTimeRef.current = null;
    currentSessionIdRef.current = null;
    setSessionStartTime(null);
    setCurrentSessionId(null);
  };

  // ── Skip break ──
  const handleSkipBreak = () => {
    stopInterval();
    setIsRunning(false);
    modeRef.current = "focus";
    setMode("focus");
    const focusSecs = focusTimeMinRef.current * 60;
    totalSecondsRef.current = focusSecs;
    timeLeftRef.current = focusSecs;
    setTimeLeft(focusSecs);
    wallClockStartRef.current = null;
    setSessionStartTime(null);
    setCurrentSessionId(null);
    sessionStartTimeRef.current = null;
    currentSessionIdRef.current = null;
  };

  // ── Tick ──
  const tickFn = () => {
    if (!isRunningRef.current || !wallClockStartRef.current) return;
    const elapsed = Math.floor((Date.now() - wallClockStartRef.current) / 1000);
    const newTime = Math.max(totalSecondsRef.current - elapsed, 0);
    timeLeftRef.current = newTime;
    setTimeLeft(newTime);

    if (elapsed % 5 === 0 && modeRef.current === 'focus' && sessionStartTimeRef.current) {
      saveActiveSession({
        taskId: task.id, subjectId: task.subject_id, date,
        sessionStartTime: sessionStartTimeRef.current,
        wallClockStart: wallClockStartRef.current,
        totalSeconds: totalSecondsRef.current,
        focusTimeMin: focusTimeMinRef.current,
        mode: modeRef.current,
      });
    }

    if (newTime <= 0) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      isRunningRef.current = false;
      setIsRunning(false);
      clearActiveSession();

      const sessionEndTime = new Date(
        wallClockStartRef.current + totalSecondsRef.current * 1000
      ).toISOString();

      playAlarm();

      if (modeRef.current === "focus") {
        if (sessionStartTimeRef.current && currentSessionIdRef.current) {
          safeLogFocusSession({
            date, taskId: task.id, subjectId: task.subject_id,
            durationMinutes: focusTimeMinRef.current,
            startTime: sessionStartTimeRef.current, endTime: sessionEndTime,
          });
        }
        incrementTaskFocusSession(date, task.id);
        setSessionsCompleted(prev => prev + 1);
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Focus Session Complete!", { body: "Time for a break!" });
        }
        modeRef.current = "break";
        setMode("break");
        const breakSecs = breakTimeMinRef.current * 60;
        totalSecondsRef.current = breakSecs;
        timeLeftRef.current = breakSecs;
        setTimeLeft(breakSecs);
        wallClockStartRef.current = null;
        sessionStartTimeRef.current = null;
        currentSessionIdRef.current = null;
        setSessionStartTime(null);
        setCurrentSessionId(null);
      } else {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Break Over!", { body: "Ready for next focus session?" });
        }
        modeRef.current = "focus";
        setMode("focus");
        const focusSecs = focusTimeMinRef.current * 60;
        totalSecondsRef.current = focusSecs;
        timeLeftRef.current = focusSecs;
        setTimeLeft(focusSecs);
        wallClockStartRef.current = null;
      }
    }
  };

  const tick = useRef(tickFn);
  tick.current = tickFn;

  const startInterval = () => {
    if (intervalRef.current) return;
    isRunningRef.current = true;
    const alreadyElapsed = totalSecondsRef.current - timeLeftRef.current;
    wallClockStartRef.current = Date.now() - alreadyElapsed * 1000;
    intervalRef.current = setInterval(() => tick.current(), 500);
  };

  const stopInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    isRunningRef.current = false;
  };

  const handleStart = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    if (mode === "focus" && !sessionStartTimeRef.current) {
      const startTime = new Date().toISOString();
      const sessionId = Date.now().toString();
      sessionStartTimeRef.current = startTime;
      currentSessionIdRef.current = sessionId;
      setSessionStartTime(startTime);
      setCurrentSessionId(sessionId);
    }
    setIsRunning(true);
    startInterval();
  };

  const handlePause = () => {
    setIsRunning(false);
    stopInterval();
    timeLeftRef.current = timeLeft;
    wallClockStartRef.current = null;
  };

  const handleReset = () => {
    stopInterval();
    setIsRunning(false);
    clearActiveSession();
    wallClockStartRef.current = null;
    const resetTime = mode === "focus" ? focusTimeMin * 60 : breakTimeMin * 60;
    totalSecondsRef.current = resetTime;
    timeLeftRef.current = resetTime;
    setTimeLeft(resetTime);
    setSessionStartTime(null);
    setCurrentSessionId(null);
    sessionStartTimeRef.current = null;
    currentSessionIdRef.current = null;
  };

  const handleSaveSettings = () => {
    saveSettings(focusTimeMin, breakTimeMin, sessionsNeeded);
    updateTaskFocusSession(date, task.id, focusTimeMin, breakTimeMin, sessionsNeeded);
    const resetTime = mode === "focus" ? focusTimeMin * 60 : breakTimeMin * 60;
    totalSecondsRef.current = resetTime;
    timeLeftRef.current = resetTime;
    setTimeLeft(resetTime);
    focusTimeMinRef.current = focusTimeMin;
    breakTimeMinRef.current = breakTimeMin;
    wallClockStartRef.current = null;
    setShowSettings(false);
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const totalTimeForMode = mode === "focus" ? focusTimeMin * 60 : breakTimeMin * 60;
  const progress = ((totalTimeForMode - timeLeft) / totalTimeForMode) * 100;

  // ── Minimized pill ──
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl ${
          mode === "focus"
            ? "bg-gray-900 dark:bg-gray-900 border-indigo-500/50"
            : "bg-gray-900 dark:bg-gray-900 border-green-500/50"
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${mode === "focus" ? "bg-indigo-400" : "bg-green-400"}`} />
          <span className={`font-mono font-black text-xl ${mode === "focus" ? "text-white" : "text-green-400"}`}>
            {formatTime(timeLeft)}
          </span>
          <span className="text-gray-500 text-xs">{mode === "focus" ? "Focus" : "Break"}</span>
          {!navigator.onLine && (
            <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-400/20">offline</span>
          )}
          <div className="flex gap-1.5 ml-1">
            {!isRunning ? (
              <button onClick={handleStart} className="w-8 h-8 rounded-lg bg-lime-400 hover:bg-lime-300 text-gray-950 flex items-center justify-center text-xs font-bold transition">▶</button>
            ) : (
              <button onClick={handlePause} className="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-400 text-white flex items-center justify-center text-xs transition">⏸</button>
            )}
            <button onClick={() => setIsMinimized(false)} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white flex items-center justify-center text-xs transition">⬆</button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-red-500/20 border border-gray-700 hover:border-red-500/50 text-gray-500 hover:text-red-400 flex items-center justify-center text-xs transition">✕</button>
          </div>
          {alarmPlaying && (
            <button onClick={stopAlarm} className="w-8 h-8 rounded-lg bg-red-500 animate-pulse text-white flex items-center justify-center text-xs">🔔</button>
          )}
        </div>
      </motion.div>
    );
  }

  // ── Fullscreen Mode ──
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center z-50 p-4">
        <button onClick={() => setIsFullscreen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center transition text-sm">✕</button>
        
        <div className="text-center w-full max-w-lg">
          <div className="mb-6">
            <span className={`text-sm font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border ${
              mode === "focus" ? "text-indigo-400 bg-indigo-400/10 border-indigo-400/20" : "text-green-400 bg-green-400/10 border-green-400/20"
            }`}>
              {mode === "focus" ? "🎯 Focus Mode" : "☕ Break Time"}
            </span>
          </div>
          <div className={`font-mono text-[80px] sm:text-[120px] md:text-[160px] leading-none font-black tracking-wider ${mode === "focus" ? "text-white" : "text-green-400"}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="mt-6 text-gray-400 text-lg">{task.topic}</div>
          <div className="mt-3 flex items-center justify-center gap-2 text-gray-600">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: task.subjectColor || "#6366f1" }} />
            <span>{task.subject}</span>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {!isRunning ? (
              <button onClick={handleStart} className="px-8 py-3 bg-lime-400 hover:bg-lime-300 text-gray-950 rounded-xl font-bold text-base transition">▶ Start</button>
            ) : (
              <button onClick={handlePause} className="px-8 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-bold text-base transition">⏸ Pause</button>
            )}
            <button onClick={handleReset} className="px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl font-bold text-base transition">↻ Reset</button>
            {mode === "focus" && (
              <button onClick={handleCompleteSession} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-base transition">✓ Complete</button>
            )}
            {mode === "break" && (
              <button onClick={handleSkipBreak} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-base transition">⏭ Skip Break</button>
            )}
          </div>
          {alarmPlaying && (
            <button onClick={stopAlarm} className="mt-6 px-6 py-3 bg-red-500 animate-pulse text-white rounded-xl font-bold transition">🔔 Stop Alarm</button>
          )}
        </div>
      </div>
    );
  }

  // ── Normal Modal ──
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">🎯 Focus Session</h3>
          <div className="flex gap-2">
            <button onClick={() => setIsMinimized(true)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition text-xs">─</button>
            <button onClick={() => setIsFullscreen(true)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition text-xs">⛶</button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-500 flex items-center justify-center transition text-sm">✕</button>
          </div>
        </div>

        {/* Banners */}
        <AnimatePresence>
          {sessionWasRestored && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 px-3 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-xl flex items-center justify-between"
            >
              <div>
                <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">⚡ Session Restored</span>
                <p className="text-gray-500 dark:text-gray-400 text-[10px] mt-0.5">Your session was recovered after interruption</p>
              </div>
              <button onClick={() => { handleStart(); setSessionWasRestored(false); }}
                className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs rounded-lg font-bold transition">
                Resume
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task Info */}
        <div className="mb-5 p-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: task.subjectColor || "#6366f1" }} />
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{task.subject}</span>
          </div>
          <p className="text-gray-900 dark:text-white font-medium text-sm ml-4">{task.topic}</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 mb-5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => { stopInterval(); setMode("focus"); const t = focusTimeMin * 60; totalSecondsRef.current = t; timeLeftRef.current = t; setTimeLeft(t); wallClockStartRef.current = null; setIsRunning(false); setSessionStartTime(null); setCurrentSessionId(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === "focus" ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"}`}
          >
            🎯 Focus
          </button>
          <button
            onClick={() => { stopInterval(); setMode("break"); const t = breakTimeMin * 60; totalSecondsRef.current = t; timeLeftRef.current = t; setTimeLeft(t); wallClockStartRef.current = null; setIsRunning(false); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === "break" ? "bg-green-600 text-white shadow-md" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"}`}
          >
            ☕ Break
          </button>
        </div>

        {/* Timer Circle - Responsive */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="72" stroke="#e5e7eb" className="dark:stroke-gray-700" strokeWidth="10" fill="none" />
            <circle cx="80" cy="80" r="72"
              stroke={mode === "focus" ? "#6366f1" : "#22c55e"}
              strokeWidth="10" fill="none"
              strokeDasharray={2 * Math.PI * 72}
              strokeDashoffset={2 * Math.PI * 72 * (1 - progress / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl sm:text-5xl font-black font-mono ${mode === "focus" ? "text-gray-900 dark:text-white" : "text-green-600 dark:text-green-400"}`}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">
              {mode === "focus" ? "Focus Time" : "Break Time"}
            </span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {!isRunning ? (
            <button onClick={handleStart} className="px-6 py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-950 rounded-xl font-bold transition text-sm shadow-md shadow-lime-400/20">▶ Start</button>
          ) : (
            <button onClick={handlePause} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-bold transition text-sm">⏸ Pause</button>
          )}
          <button onClick={handleReset} className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl font-medium transition text-sm">↻ Reset</button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {mode === "focus" && (
            <button onClick={handleCompleteSession} className="flex-1 py-2 bg-green-100 dark:bg-green-600/20 hover:bg-green-200 dark:hover:bg-green-600/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-600/30 hover:border-green-400 rounded-xl font-bold text-xs transition">
              ✓ Complete Session
            </button>
          )}
          {mode === "break" && (
            <button onClick={handleSkipBreak} className="flex-1 py-2 bg-indigo-100 dark:bg-indigo-600/20 hover:bg-indigo-200 dark:hover:bg-indigo-600/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-600/30 hover:border-indigo-400 rounded-xl font-bold text-xs transition">
              ⏭ Skip Break
            </button>
          )}
        </div>

        {/* Sessions Progress */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-500 dark:text-gray-400">Sessions Completed</span>
            <span className="font-bold text-gray-900 dark:text-white">{sessionsCompleted} / {sessionsNeeded}</span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${Math.min((sessionsCompleted / sessionsNeeded) * 100, 100)}%` }} />
          </div>
        </div>

        {/* Timer Settings Toggle */}
        <button onClick={() => setShowSettings(!showSettings)}
          className="w-full py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white flex items-center justify-center gap-1.5 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition">
          ⚙️ {showSettings ? "Hide" : "Configure"} Timer Settings
        </button>

        {/* Timer Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-4 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 rounded-xl space-y-3 overflow-hidden"
            >
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Timer Settings</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Focus (min)</label>
                  <input type="number" min="1" max="120" value={focusTimeMin}
                    onChange={(e) => setFocusTimeMin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Break (min)</label>
                  <input type="number" min="1" max="60" value={breakTimeMin}
                    onChange={(e) => setBreakTimeMin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:border-green-500 outline-none" />
                </div>
              </div>
              <button onClick={handleSaveSettings}
                className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-950 rounded-xl text-xs font-bold transition">
                Save & Apply
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default FocusTimer;