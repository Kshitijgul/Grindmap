import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_ROUTINE = [
  { id: 1, time: "06:00", label: "Wake Up", emoji: "⏰", category: "life" },
  { id: 2, time: "06:15", label: "Morning Walk / Exercise", emoji: "🏃", category: "health" },
  { id: 3, time: "07:00", label: "Fresh Up & Breakfast", emoji: "🍳", category: "life" },
  { id: 4, time: "08:00", label: "Deep Study Block 1", emoji: "📚", category: "study" },
];

const CATEGORY_COLORS = {
  study: {
    bg: "bg-indigo-100 dark:bg-indigo-500/10",
    border: "border-indigo-200 dark:border-indigo-500/30",
    text: "text-indigo-600 dark:text-indigo-400",
    dot: "bg-indigo-500 dark:bg-indigo-400",
  },
  health: {
    bg: "bg-green-100 dark:bg-green-500/10",
    border: "border-green-200 dark:border-green-500/30",
    text: "text-green-600 dark:text-green-400",
    dot: "bg-green-500 dark:bg-green-400",
  },
  life: {
    bg: "bg-gray-100 dark:bg-gray-500/10",
    border: "border-gray-200 dark:border-gray-600/30",
    text: "text-gray-600 dark:text-gray-400",
    dot: "bg-gray-500",
  },
  break: {
    bg: "bg-amber-100 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
};

const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

const getCurrentTimeMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const formatTime12 = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
};

export default function DailyRoutine() {
  const [routine, setRoutine] = useState(() => {
    try {
      const saved = localStorage.getItem("dailyRoutine");
      return saved ? JSON.parse(saved) : DEFAULT_ROUTINE;
    } catch {
      return DEFAULT_ROUTINE;
    }
  });

  const [currentTime, setCurrentTime] = useState(getCurrentTimeMinutes());
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ time: "", label: "", emoji: "📌", category: "study" });
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(getCurrentTimeMinutes()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("dailyRoutine", JSON.stringify(routine));
    } catch {}
  }, [routine]);

  const sortedRoutine = [...routine].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  const getCurrentSlotIndex = () => {
    for (let i = sortedRoutine.length - 1; i >= 0; i--) {
      if (timeToMinutes(sortedRoutine[i].time) <= currentTime) return i;
    }
    return -1;
  };

  const currentSlotIndex = getCurrentSlotIndex();
  const currentSlot = sortedRoutine[currentSlotIndex];
  const nextSlot = sortedRoutine[currentSlotIndex + 1];

  const getTimeUntilNext = () => {
    if (!nextSlot) return null;
    const diff = timeToMinutes(nextSlot.time) - currentTime;
    if (diff <= 0) return null;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const handleDelete = (id) => setRoutine((prev) => prev.filter((r) => r.id !== id));

  const handleEdit = (item) => {
    setEditingId(item.id);
    setNewItem({ time: item.time, label: item.label, emoji: item.emoji, category: item.category });
    setShowAddForm(true);
  };

  const handleSaveEdit = () => {
    if (!newItem.time || !newItem.label.trim()) return;
    if (editingId) {
      setRoutine((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...newItem } : r)));
      setEditingId(null);
    } else {
      setRoutine((prev) => [...prev, { id: Date.now(), ...newItem, label: newItem.label.trim() }]);
    }
    setNewItem({ time: "", label: "", emoji: "📌", category: "study" });
    setShowAddForm(false);
  };

  const handleReset = () => {
    if (confirm("Reset to default routine?")) setRoutine(DEFAULT_ROUTINE);
  };

  const timeUntilNext = getTimeUntilNext();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm transition-colors duration-200">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 sm:px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2">
          <span className="text-sm">🗓️</span>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">Daily Routine</h3>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString("en-US", { weekday: "long" })}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition font-medium ${
              isEditing
                ? "bg-lime-100 dark:bg-lime-400/10 border-lime-300 dark:border-lime-400/30 text-lime-700 dark:text-lime-400"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-sm"
            }`}
          >
            {isEditing ? "Done" : "✏️"}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition shadow-sm"
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>▲</motion.div>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Current Activity Banner */}
            {currentSlot && (
              <motion.div
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-3 mt-3 p-3 bg-lime-50 dark:bg-lime-400/5 border border-lime-200 dark:border-lime-400/20 rounded-xl shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-lime-500 dark:bg-lime-400 animate-pulse" />
                    <span className="text-[10px] text-lime-700 dark:text-lime-400 font-bold uppercase tracking-wider">
                      Now
                    </span>
                  </div>
                  {timeUntilNext && (
                    <span className="text-[10px] text-gray-600 dark:text-gray-400">
                      Next in <span className="text-amber-500 dark:text-amber-400 font-bold">{timeUntilNext}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-base">{currentSlot.emoji}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {currentSlot.label}
                  </span>
                </div>
                {nextSlot && (
                  <div className="flex items-center gap-1.5 mt-1.5 ml-0.5">
                    <span className="text-[10px] text-gray-500 dark:text-gray-500">Up next:</span>
                    <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                      {nextSlot.emoji} {nextSlot.label}
                    </span>
                    <span className="text-[10px] text-gray-500">at {formatTime12(nextSlot.time)}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Routine List */}
            <div className="px-3 py-3 space-y-1 max-h-[420px] overflow-y-auto overflow-x-hidden scrollbar-thin">
              <AnimatePresence>
                {sortedRoutine.map((item, index) => {
                  const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.life;
                  const itemMinutes = timeToMinutes(item.time);
                  const isPast = itemMinutes < currentTime;
                  const isCurrent = index === currentSlotIndex;
                  const isNext = index === currentSlotIndex + 1;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.id}
                      className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all border ${
                        isCurrent
                          ? "bg-lime-50 dark:bg-lime-400/5 border-lime-200 dark:border-lime-400/20 shadow-sm"
                          : isNext
                            ? "bg-indigo-50 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/15"
                            : isPast
                              ? "border-transparent opacity-50 dark:opacity-40"
                              : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/40"
                      }`}
                    >
                      {/* Time */}
                      <div className="w-12 sm:w-14 flex-shrink-0 text-center">
                        <span className={`text-[10px] font-bold font-mono ${
                            isCurrent ? "text-lime-600 dark:text-lime-400" : isNext ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-500"
                          }`}
                        >
                          {formatTime12(item.time).replace(" ", "\n")}
                        </span>
                      </div>

                      {/* Dot */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${
                            isCurrent ? "bg-lime-500 dark:bg-lime-400 shadow-sm shadow-lime-400/50" : isNext ? "bg-indigo-500 dark:bg-indigo-400" : isPast ? "bg-gray-300 dark:bg-gray-700" : colors.dot
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="text-sm flex-shrink-0">{item.emoji}</span>
                        <span className={`text-xs truncate ${
                            isCurrent ? "text-gray-900 dark:text-white font-bold" : isNext ? "text-gray-800 dark:text-gray-200 font-medium" : isPast ? "text-gray-500 line-through" : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>

                      {/* Badges / Edit Controls */}
                      {!isPast && !isEditing && (
                        <span className={`hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded-full border flex-shrink-0 font-medium ${colors.bg} ${colors.border} ${colors.text}`}>
                          {item.category}
                        </span>
                      )}

                      {isEditing && (
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(item)}
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center text-xs transition-colors shadow-sm"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-500/20 text-gray-500 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center text-xs transition-colors shadow-sm"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Add/Edit Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mx-3 mb-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 rounded-xl space-y-3 shadow-sm"
                >
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {editingId ? "Edit Slot" : "Add Slot"}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-600 dark:text-gray-400 block mb-1 font-medium">Time</label>
                      <input
                        type="time"
                        value={newItem.time}
                        onChange={(e) => setNewItem((p) => ({ ...p, time: e.target.value }))}
                        className="w-full px-2.5 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-xs focus:border-lime-500 dark:focus:border-lime-400/60 outline-none transition-colors shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-600 dark:text-gray-400 block mb-1 font-medium">Emoji</label>
                      <input
                        type="text"
                        value={newItem.emoji}
                        onChange={(e) => setNewItem((p) => ({ ...p, emoji: e.target.value }))}
                        className="w-full px-2.5 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-xs focus:border-lime-500 dark:focus:border-lime-400/60 outline-none transition-colors shadow-sm"
                        maxLength={2}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600 dark:text-gray-400 block mb-1 font-medium">Label</label>
                    <input
                      type="text"
                      value={newItem.label}
                      onChange={(e) => setNewItem((p) => ({ ...p, label: e.target.value }))}
                      placeholder="e.g. Morning Walk"
                      className="w-full px-2.5 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-xs focus:border-lime-500 dark:focus:border-lime-400/60 outline-none placeholder-gray-400 dark:placeholder-gray-600 transition-colors shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600 dark:text-gray-400 block mb-1 font-medium">Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {Object.keys(CATEGORY_COLORS).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setNewItem((p) => ({ ...p, category: cat }))}
                          className={`py-1.5 rounded-lg text-[10px] font-bold border transition-colors capitalize shadow-sm ${
                            newItem.category === cat
                              ? `${CATEGORY_COLORS[cat].bg} ${CATEGORY_COLORS[cat].border} ${CATEGORY_COLORS[cat].text}`
                              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingId(null);
                        setNewItem({ time: "", label: "", emoji: "📌", category: "study" });
                      }}
                      className="flex-1 py-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg hover:text-gray-900 dark:hover:text-white transition-colors font-medium shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={!newItem.time || !newItem.label.trim()}
                      className="flex-1 py-2 text-[10px] sm:text-xs font-bold bg-lime-400 hover:bg-lime-500 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 text-gray-950 rounded-lg transition-colors shadow-sm"
                    >
                      {editingId ? "Save Changes" : "Add Slot"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer actions */}
            <div className="px-3 pb-3 flex gap-2">
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setEditingId(null);
                  setNewItem({ time: "", label: "", emoji: "📌", category: "study" });
                }}
                className="flex-1 py-2 sm:py-2.5 text-xs font-bold text-lime-700 dark:text-lime-400 bg-lime-50 dark:bg-lime-400/5 hover:bg-lime-100 dark:hover:bg-lime-400/10 border border-lime-200 dark:border-lime-400/20 rounded-xl transition-colors shadow-sm"
              >
                + Add Slot
              </button>
              <button
                onClick={handleReset}
                className="py-2 sm:py-2.5 px-3 sm:px-4 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-transparent hover:text-gray-900 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors shadow-sm"
                title="Reset to default"
              >
                ↺ Reset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}