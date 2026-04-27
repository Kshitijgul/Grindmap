import { useState, useEffect } from 'react';

const DEFAULT_ROUTINE = [
  { id: 1, time: '06:00', label: 'Wake Up', emoji: '⏰', category: 'life' },
  { id: 2, time: '06:15', label: 'Morning Walk / Exercise', emoji: '🏃', category: 'health' },
  { id: 3, time: '07:00', label: 'Fresh Up & Breakfast', emoji: '🍳', category: 'life' },
  { id: 4, time: '08:00', label: 'Deep Study Block 1', emoji: '📚', category: 'study' },
  { id: 5, time: '10:00', label: 'Short Break', emoji: '☕', category: 'break' },
  { id: 6, time: '10:15', label: 'Deep Study Block 2', emoji: '🧠', category: 'study' },
  { id: 7, time: '12:30', label: 'Lunch Break', emoji: '🍱', category: 'life' },
  { id: 8, time: '13:30', label: 'Revision / Practice Problems', emoji: '✏️', category: 'study' },
  { id: 9, time: '15:30', label: 'Power Nap (20 min)', emoji: '😴', category: 'health' },
  { id: 10, time: '16:00', label: 'Deep Study Block 3', emoji: '💻', category: 'study' },
  { id: 11, time: '18:00', label: 'Evening Walk / Relax', emoji: '🌅', category: 'health' },
  { id: 12, time: '19:00', label: 'Dinner', emoji: '🍽️', category: 'life' },
  { id: 13, time: '19:45', label: 'Light Review / Notes', emoji: '📝', category: 'study' },
  { id: 14, time: '21:00', label: 'Wind Down — No Screens', emoji: '🌙', category: 'break' },
  { id: 15, time: '22:00', label: 'Sleep', emoji: '🛏️', category: 'life' },
];

const CATEGORY_COLORS = {
  study: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', dot: 'bg-indigo-400' },
  health: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', dot: 'bg-green-400' },
  life: { bg: 'bg-gray-500/10', border: 'border-gray-600/30', text: 'text-gray-400', dot: 'bg-gray-500' },
  break: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-400' },
};

const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const getCurrentTimeMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const formatTime12 = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
};

export default function DailyRoutine() {
  const [routine, setRoutine] = useState(() => {
    try {
      const saved = localStorage.getItem('dailyRoutine');
      return saved ? JSON.parse(saved) : DEFAULT_ROUTINE;
    } catch { return DEFAULT_ROUTINE; }
  });

  const [currentTime, setCurrentTime] = useState(getCurrentTimeMinutes());
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ time: '', label: '', emoji: '📌', category: 'study' });
  const [collapsed, setCollapsed] = useState(false);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTimeMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dailyRoutine', JSON.stringify(routine));
    } catch {}
  }, [routine]);

  const sortedRoutine = [...routine].sort((a, b) =>
    timeToMinutes(a.time) - timeToMinutes(b.time)
  );

  // Find current and next slot
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

  const handleDelete = (id) => {
    setRoutine(prev => prev.filter(r => r.id !== id));
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setNewItem({ time: item.time, label: item.label, emoji: item.emoji, category: item.category });
    setShowAddForm(true);
  };

  const handleSaveEdit = () => {
    if (!newItem.time || !newItem.label.trim()) return;
    if (editingId) {
      setRoutine(prev => prev.map(r =>
        r.id === editingId ? { ...r, ...newItem } : r
      ));
      setEditingId(null);
    } else {
      setRoutine(prev => [...prev, {
        id: Date.now(),
        ...newItem,
        label: newItem.label.trim()
      }]);
    }
    setNewItem({ time: '', label: '', emoji: '📌', category: 'study' });
    setShowAddForm(false);
  };

  const handleReset = () => {
    if (confirm('Reset to default routine?')) {
      setRoutine(DEFAULT_ROUTINE);
    }
  };

  const timeUntilNext = getTimeUntilNext();

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-lime-400/10 border border-lime-400/20 flex items-center justify-center">
            <span className="text-xs">🗓️</span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Daily Routine</h3>
            <p className="text-[10px] text-gray-600">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`text-[10px] px-2 py-1 rounded-lg border transition font-medium ${
              isEditing
                ? 'bg-lime-400/10 border-lime-400/30 text-lime-400'
                : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-white'
            }`}
          >
            {isEditing ? '✓ Done' : '✏️ Edit'}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[10px] px-2 py-1 rounded-lg bg-gray-800 border border-gray-700 text-gray-500 hover:text-white transition"
          >
            {collapsed ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {/* Current Activity Banner */}
      {currentSlot && !collapsed && (
        <div className="mx-3 mt-3 p-3 bg-lime-400/5 border border-lime-400/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              <span className="text-[10px] text-lime-400 font-bold uppercase tracking-wider">Now</span>
            </div>
            {timeUntilNext && (
              <span className="text-[10px] text-gray-500">
                Next in <span className="text-amber-400 font-bold">{timeUntilNext}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-base">{currentSlot.emoji}</span>
            <span className="text-sm font-bold text-white">{currentSlot.label}</span>
          </div>
          {nextSlot && (
            <div className="flex items-center gap-1.5 mt-1.5 ml-0.5">
              <span className="text-[10px] text-gray-600">Up next:</span>
              <span className="text-[10px] text-gray-400">{nextSlot.emoji} {nextSlot.label}</span>
              <span className="text-[10px] text-gray-600">at {formatTime12(nextSlot.time)}</span>
            </div>
          )}
        </div>
      )}

      {/* Routine List */}
      {!collapsed && (
        <div className="px-3 py-3 space-y-1 max-h-[420px] overflow-y-auto">
          {sortedRoutine.map((item, index) => {
            const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.life;
            const itemMinutes = timeToMinutes(item.time);
            const isPast = itemMinutes < currentTime;
            const isCurrent = index === currentSlotIndex;
            const isNext = index === currentSlotIndex + 1;

            return (
              <div
                key={item.id}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all border ${
                  isCurrent
                    ? 'bg-lime-400/5 border-lime-400/20'
                    : isNext
                    ? 'bg-indigo-500/5 border-indigo-500/15'
                    : isPast
                    ? 'border-transparent opacity-40'
                    : 'border-transparent hover:bg-gray-800/40'
                }`}
              >
                {/* Time */}
                <div className="w-14 flex-shrink-0">
                  <span className={`text-[10px] font-bold font-mono ${
                    isCurrent ? 'text-lime-400' : isNext ? 'text-indigo-400' : 'text-gray-600'
                  }`}>
                    {formatTime12(item.time).replace(' ', '\n')}
                  </span>
                </div>

                {/* Dot + line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    isCurrent ? 'bg-lime-400 shadow-sm shadow-lime-400/50' :
                    isNext ? 'bg-indigo-400' :
                    isPast ? 'bg-gray-700' : colors.dot
                  }`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-sm flex-shrink-0">{item.emoji}</span>
                  <span className={`text-xs truncate ${
                    isCurrent ? 'text-white font-bold' :
                    isNext ? 'text-gray-300 font-medium' :
                    isPast ? 'text-gray-500 line-through' : 'text-gray-400'
                  }`}>
                    {item.label}
                  </span>
                </div>

                {/* Category badge */}
                {!isPast && !isEditing && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border flex-shrink-0 font-medium ${colors.bg} ${colors.border} ${colors.text}`}>
                    {item.category}
                  </span>
                )}

                {/* Edit/Delete buttons */}
                {isEditing && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(item)}
                      className="w-5 h-5 rounded bg-gray-800 hover:bg-indigo-500/20 text-gray-500 hover:text-indigo-400 flex items-center justify-center text-[10px] transition"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-5 h-5 rounded bg-gray-800 hover:bg-red-500/20 text-gray-500 hover:text-red-400 flex items-center justify-center text-[10px] transition"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Form */}
      {!collapsed && showAddForm && (
        <div className="mx-3 mb-3 p-3 bg-gray-800/60 border border-gray-700/50 rounded-xl space-y-2">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            {editingId ? 'Edit Slot' : 'Add Slot'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-600 block mb-1">Time</label>
              <input
                type="time"
                value={newItem.time}
                onChange={e => setNewItem(p => ({ ...p, time: e.target.value }))}
                className="w-full px-2 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-xs focus:border-lime-400/60 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-600 block mb-1">Emoji</label>
              <input
                type="text"
                value={newItem.emoji}
                onChange={e => setNewItem(p => ({ ...p, emoji: e.target.value }))}
                className="w-full px-2 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-xs focus:border-lime-400/60 outline-none"
                maxLength={2}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-600 block mb-1">Label</label>
            <input
              type="text"
              value={newItem.label}
              onChange={e => setNewItem(p => ({ ...p, label: e.target.value }))}
              placeholder="e.g. Morning Walk"
              className="w-full px-2 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-xs focus:border-lime-400/60 outline-none placeholder-gray-600"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-600 block mb-1">Category</label>
            <div className="grid grid-cols-4 gap-1">
              {Object.keys(CATEGORY_COLORS).map(cat => (
                <button
                  key={cat}
                  onClick={() => setNewItem(p => ({ ...p, category: cat }))}
                  className={`py-1 rounded-lg text-[10px] font-bold border transition capitalize ${
                    newItem.category === cat
                      ? `${CATEGORY_COLORS[cat].bg} ${CATEGORY_COLORS[cat].border} ${CATEGORY_COLORS[cat].text}`
                      : 'bg-gray-900 border-gray-700 text-gray-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { setShowAddForm(false); setEditingId(null); setNewItem({ time: '', label: '', emoji: '📌', category: 'study' }); }}
              className="flex-1 py-1.5 text-[10px] text-gray-500 border border-gray-700 rounded-lg hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={!newItem.time || !newItem.label.trim()}
              className="flex-1 py-1.5 text-[10px] font-bold bg-lime-400 hover:bg-lime-300 disabled:bg-gray-700 disabled:text-gray-500 text-gray-950 rounded-lg transition"
            >
              {editingId ? 'Save Changes' : 'Add Slot'}
            </button>
          </div>
        </div>
      )}

      {/* Footer actions */}
      {!collapsed && (
        <div className="px-3 pb-3 flex gap-2">
          <button
            onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); setNewItem({ time: '', label: '', emoji: '📌', category: 'study' }); }}
            className="flex-1 py-2 text-[10px] font-bold text-lime-400 bg-lime-400/5 hover:bg-lime-400/10 border border-lime-400/20 rounded-xl transition"
          >
            + Add Slot
          </button>
          <button
            onClick={handleReset}
            className="py-2 px-3 text-[10px] text-gray-600 hover:text-gray-400 border border-gray-800 rounded-xl transition"
            title="Reset to default"
          >
            ↺ Reset
          </button>
        </div>
      )}
    </div>
  );
}