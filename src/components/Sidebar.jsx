import { useState } from 'react';
import { MONTH_NAMES } from '../utils/calender';

export default function Sidebar({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  selectedDate,
  onSelectDate,
  subjectGoals,
  onSetGoal,
  isOpen,
  onClose,
}) {
  const [newSubject, setNewSubject] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [goalModalSubject, setGoalModalSubject] = useState(null);
  const [goalForm, setGoalForm] = useState({ goal: '', startDate: '', endDate: '' });

  const selected = new Date(selectedDate);
  const currentMonth = selected.getMonth();
  const currentYear = selected.getFullYear();

  const handleAdd = () => {
    if (newSubject.trim()) {
      const colors = ['#8B5CF6', '#22D3EE', '#F472B6', '#34D399', '#FBBF24', '#F87171', '#60A5FA', '#A78BFA'];
      const color = colors[subjects.length % colors.length];
      onAddSubject(newSubject.trim(), color);
      setNewSubject('');
    }
  };

  const startEdit = (s) => { setEditingId(s.id); setEditName(s.name); };
  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onUpdateSubject(editingId, { name: editName.trim() });
      setEditingId(null);
    }
  };

  const openGoalModal = (subject) => {
    const existing = subjectGoals[subject.id];
    setGoalModalSubject(subject);
    setGoalForm({
      goal: existing?.goal || '',
      startDate: existing?.start_date || '',
      endDate: existing?.end_date || '',
    });
  };

  const saveGoal = () => {
    if (goalModalSubject && goalForm.goal && goalForm.startDate && goalForm.endDate) {
      onSetGoal(goalModalSubject.id, goalForm.goal, goalForm.startDate, goalForm.endDate);
      setGoalModalSubject(null);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDow = new Date(currentYear, currentMonth, 1).getDay();
  const calDays = [];
  for (let i = 0; i < firstDow; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const goToMonth = (month, year) => onSelectDate(`${year}-${String(month + 1).padStart(2, '0')}-01`);
  const goToDay = (day) => onSelectDate(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-72
          flex flex-col
          bg-white dark:bg-gray-950
          border-r border-gray-200 dark:border-gray-800/80
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
        `}
        style={{ boxShadow: isOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none' }}
      >
        {/* ── Logo strip ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800/80 bg-white dark:bg-gray-950 transition-colors duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-lime-400 flex items-center justify-center shadow-lg shadow-lime-400/30">
              <span className="text-gray-950 font-black text-xs">G</span>
            </div>
            <span className="font-black tracking-tight text-gray-900 dark:text-white text-base">
              GRIND<span className="text-lime-400">MAP</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="xl:hidden w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600 flex items-center justify-center transition text-xs"
          >
            ✕
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">

          {/* Calendar section */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800/60 transition-colors duration-200">

            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => goToMonth(
                  currentMonth === 0 ? 11 : currentMonth - 1,
                  currentMonth === 0 ? currentYear - 1 : currentYear
                )}
                className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition text-xs"
              >
                ◀
              </button>
              <span className="text-gray-900 dark:text-white font-bold text-sm tracking-wide">
                {MONTH_NAMES[currentMonth]}{' '}
                <span className="text-gray-400 dark:text-gray-500 font-normal">{currentYear}</span>
              </span>
              <button
                onClick={() => goToMonth(
                  currentMonth === 11 ? 0 : currentMonth + 1,
                  currentMonth === 11 ? currentYear + 1 : currentYear
                )}
                className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition text-xs"
              >
                ▶
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {calDays.map((day, i) => {
                const dateStr = day
                  ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  : '';
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === todayStr;
                return (
                  <button
                    key={i}
                    disabled={!day}
                    onClick={() => goToDay(day)}
                    className={`
                      relative mx-auto w-8 h-8 rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-center
                      ${!day ? 'invisible' : ''}
                      ${isSelected
                        ? 'bg-lime-400 text-gray-950 font-bold shadow-md shadow-lime-400/30 scale-105'
                        : isToday
                        ? 'bg-lime-400/10 text-lime-500 dark:text-lime-400 ring-1 ring-lime-400/50'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Go to today */}
            <button
              onClick={() => onSelectDate(todayStr)}
              className="mt-3 w-full py-1.5 text-xs font-semibold text-lime-600 dark:text-lime-400 hover:text-lime-700 dark:hover:text-lime-300 hover:bg-lime-50 dark:hover:bg-lime-400/5 rounded-lg transition tracking-wide"
            >
              ↩ Go to Today
            </button>
          </div>

          {/* Subjects section */}
          <div className="px-4 pt-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                My Subjects
              </h3>
              <span className="text-[10px] text-gray-500 dark:text-gray-600 bg-gray-100 dark:bg-gray-800/60 px-2 py-0.5 rounded-full">
                {subjects.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {subjects.map((s) => {
                const hasGoal = !!subjectGoals[s.id];
                return (
                  <div
                    key={s.id}
                    className="group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/60 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-all duration-150"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: s.color }}
                    />

                    {editingId === s.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs px-2 py-0.5 rounded-lg outline-none border border-lime-400/50"
                        autoFocus
                      />
                    ) : (
                      <span className="flex-1 text-gray-700 dark:text-gray-200 text-sm truncate leading-tight">
                        {s.name}
                      </span>
                    )}

                    {hasGoal && (
                      <span className="text-[8px] bg-lime-400/10 text-lime-600 dark:text-lime-400 px-1.5 py-0.5 rounded-full font-bold tracking-wide border border-lime-400/20 flex-shrink-0">
                        GOAL
                      </span>
                    )}

                    <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => openGoalModal(s)}
                        className="w-6 h-6 rounded-lg hover:bg-lime-100 dark:hover:bg-lime-400/10 text-gray-400 hover:text-lime-600 dark:hover:text-lime-400 flex items-center justify-center transition text-xs"
                        title="Set goal"
                      >
                        🎯
                      </button>
                      <button
                        onClick={() => startEdit(s)}
                        className="w-6 h-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-white flex items-center justify-center transition text-xs"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDeleteSubject(s.id)}
                        className="w-6 h-6 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center transition text-xs"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}

              {subjects.length === 0 && (
                <div className="text-center py-6 text-gray-400 dark:text-gray-600 text-xs">
                  No subjects yet. Add one below ↓
                </div>
              )}
            </div>

            {/* Add subject input */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Add subject..."
                className="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700/80 focus:border-lime-400/60 focus:outline-none placeholder-gray-400 dark:placeholder-gray-600 transition"
              />
              <button
                onClick={handleAdd}
                disabled={!newSubject.trim()}
                className="w-9 h-9 rounded-xl bg-lime-400 hover:bg-lime-300 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 text-gray-950 font-black text-lg flex items-center justify-center transition shadow-md shadow-lime-400/20"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom branding strip ── */}
        <div className="flex-shrink-0 px-5 py-3 border-t border-gray-200 dark:border-gray-800/60 bg-white dark:bg-gray-950 transition-colors duration-200">
          <p className="text-[10px] text-gray-400 dark:text-gray-700 text-center tracking-widest uppercase font-medium">
            Stay consistent. Stay ahead.
          </p>
        </div>
      </aside>

      {/* Goal Modal */}
      {goalModalSubject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: goalModalSubject.color }} />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Set Goal — {goalModalSubject.name}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                  Goal
                </label>
                <input
                  type="text"
                  value={goalForm.goal}
                  onChange={(e) => setGoalForm({ ...goalForm, goal: e.target.value })}
                  placeholder="e.g., Complete all chapters"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-lime-400/60 focus:outline-none transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={goalForm.startDate}
                    onChange={(e) => setGoalForm({ ...goalForm, startDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:border-lime-400/60 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={goalForm.endDate}
                    onChange={(e) => setGoalForm({ ...goalForm, endDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:border-lime-400/60 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setGoalModalSubject(null)}
                className="flex-1 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={saveGoal}
                disabled={!goalForm.goal || !goalForm.startDate || !goalForm.endDate}
                className="flex-1 py-2.5 text-sm bg-lime-400 hover:bg-lime-300 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 text-gray-950 font-bold rounded-xl transition shadow-md shadow-lime-400/20"
              >
                Save Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}