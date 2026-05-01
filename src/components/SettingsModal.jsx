import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BUILT_IN_ALARMS = [
  { id: 'bell', name: 'Bell', url: '/alarms/bell.mp3', emoji: '🔔' },
  { id: 'digital', name: 'Digital', url: '/alarms/digital.mp3', emoji: '📱' },
  { id: 'chime', name: 'Chime', url: '/alarms/chime.mp3', emoji: '🎵' },
  { id: 'beep', name: 'Beep', url: '/alarms/beep.mp3', emoji: '📢' },
  { id: 'zen', name: 'Zen', url: '/alarms/zen.mp3', emoji: '🧘' },
  { id: 'none', name: 'No Alarm', url: null, emoji: '🔕' },
];

const SETTINGS_KEY = 'grindmapSettings';

export const getGlobalSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    alarmId: 'bell',
    alarmUrl: '/alarms/bell.mp3',
    alarmVolume: 80,
  };
};

export const saveGlobalSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
};

export default function SettingsModal({ onClose }) {
  const [settings, setSettings] = useState(getGlobalSettings);
  const [testingId, setTestingId] = useState(null);
  const audioRef = useRef(null);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const stopTest = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setTestingId(null);
  };

  const testAlarm = (alarm) => {
    stopTest();
    if (!alarm.url) return;

    const audio = new Audio(alarm.url);
    audio.volume = settings.alarmVolume / 100;
    audio.play().catch(() => {});
    audioRef.current = audio;
    setTestingId(alarm.id);

    setTimeout(() => {
      stopTest();
    }, 3000);
  };

  const selectAlarm = (alarm) => {
    stopTest();
    const updated = {
      ...settings,
      alarmId: alarm.id,
      alarmUrl: alarm.url,
    };
    setSettings(updated);
    saveGlobalSettings(updated);
  };

  const handleVolumeChange = (e) => {
    const updated = { ...settings, alarmVolume: Number(e.target.value) };
    setSettings(updated);
    saveGlobalSettings(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <span className="text-sm">⚙️</span>
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition text-xs"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* Alarm Tone Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">🔔 Focus Alarm Tone</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Plays when your focus session completes
                </p>
              </div>
              <AnimatePresence>
                {testingId && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={stopTest}
                    className="text-[10px] px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 rounded-lg"
                  >
                    ■ Stop
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {BUILT_IN_ALARMS.map((alarm) => {
                const isSelected = settings.alarmId === alarm.id;
                const isTesting = testingId === alarm.id;

                return (
                  <motion.div
                    key={alarm.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectAlarm(alarm)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-lime-50 dark:bg-lime-400/10 border-lime-400/30'
                        : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{alarm.emoji}</span>
                    <span className={`text-xs font-medium flex-1 ${
                      isSelected ? 'text-lime-600 dark:text-lime-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {alarm.name}
                    </span>

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-lime-400 flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] text-gray-950 font-black">✓</span>
                      </div>
                    )}

                    {/* Test button */}
                    {alarm.url && (
                      <button
                        onClick={(e) => { e.stopPropagation(); isTesting ? stopTest() : testAlarm(alarm); }}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] transition flex-shrink-0 ${
                          isTesting
                            ? 'bg-orange-500 text-white animate-pulse'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        title="Test tone"
                      >
                        {isTesting ? '■' : '▶'}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Volume */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-900 dark:text-white">🔊 Alarm Volume</p>
              <span className="text-xs font-bold text-lime-600 dark:text-lime-400">{settings.alarmVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.alarmVolume}
              onChange={handleVolumeChange}
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-lime-400"
            />
            <div className="flex justify-between text-[9px] text-gray-500 dark:text-gray-400 mt-1">
              <span>Silent</span>
              <span>Full Volume</span>
            </div>
          </div>

          {/* Current Selection Summary */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 font-bold">Current Alarm</p>
            <div className="flex items-center gap-2">
              <span className="text-base">
                {BUILT_IN_ALARMS.find(a => a.id === settings.alarmId)?.emoji || '🔔'}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {BUILT_IN_ALARMS.find(a => a.id === settings.alarmId)?.name || 'Bell'}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-auto">
                Volume: {settings.alarmVolume}%
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-2.5 bg-lime-400 hover:bg-lime-500 text-gray-950 font-bold text-sm rounded-xl transition shadow-md shadow-lime-400/20"
          >
            Done
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}