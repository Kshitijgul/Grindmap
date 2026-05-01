import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MONTH_NAMES } from "../utils/calender";
import { Link } from "react-router-dom";
import NavLogo3 from "../components/NavLogo3";
import GrindMapLogo from "../components/GrindMapLogo";

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
  const [newSubject, setNewSubject] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [goalModalSubject, setGoalModalSubject] = useState(null);
  const [goalForm, setGoalForm] = useState({
    goal: "",
    startDate: "",
    endDate: "",
  });

  const selected = new Date(selectedDate);
  const currentMonth = selected.getMonth();
  const currentYear = selected.getFullYear();

  const handleAdd = () => {
    if (newSubject.trim()) {
      const colors = [
        "#8B5CF6",
        "#22D3EE",
        "#F472B6",
        "#34D399",
        "#FBBF24",
        "#F87171",
        "#60A5FA",
        "#A78BFA",
      ];
      const color = colors[subjects.length % colors.length];
      onAddSubject(newSubject.trim(), color);
      setNewSubject("");
    }
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditName(s.name);
  };
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
      goal: existing?.goal || "",
      startDate: existing?.start_date || "",
      endDate: existing?.end_date || "",
    });
  };

  const saveGoal = () => {
    if (
      goalModalSubject &&
      goalForm.goal &&
      goalForm.startDate &&
      goalForm.endDate
    ) {
      onSetGoal(
        goalModalSubject.id,
        goalForm.goal,
        goalForm.startDate,
        goalForm.endDate,
      );
      setGoalModalSubject(null);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDow = new Date(currentYear, currentMonth, 1).getDay();
  const calDays = [];
  for (let i = 0; i < firstDow; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const goToMonth = (month, year) =>
    onSelectDate(`${year}-${String(month + 1).padStart(2, "0")}-01`);
  const goToDay = (day) =>
    onSelectDate(
      `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-50 dark:bg-gray-950  backdrop-blur-sm z-40 xl:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-72
          flex flex-col
         bg-gray-50 dark:bg-gray-950
          border-r border-gray-200 dark:border-gray-800/80
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"}
        `}
        style={{ boxShadow: isOpen ? "10px 0 30px rgba(0,0,0,0.2)" : "none" }}
      >
        {/* ── Logo strip ── */}
        {/* ── Logo strip ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800/80 transition-colors duration-200">
          <div className="flex items-center">
            <Link to="/" className="flex items-center no-underline">
              {/* Mobile: Icon Only (NavLogo3) - Shows on screens < 640px */}
              <div className="block sm:hidden">
                <NavLogo3 size={32} />
              </div>

              {/* Desktop: Icon + Text (GrindMapLogo) - Shows on screens >= 640px */}
              <div className="hidden sm:block">
                <GrindMapLogo size="default" />
              </div>
            </Link>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="xl:hidden w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition"
          >
            ✕
          </motion.button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
          {/* Calendar section */}
          <div className="px-4 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800/60">
            <div className="flex items-center justify-between mb-4">
              <motion.button
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.8 }}
                onClick={() =>
                  goToMonth(
                    currentMonth === 0 ? 11 : currentMonth - 1,
                    currentMonth === 0 ? currentYear - 1 : currentYear,
                  )
                }
                className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition"
              >
                ◀
              </motion.button>
              <span className="text-gray-900 dark:text-white font-bold text-sm tracking-tight">
                {MONTH_NAMES[currentMonth]}{" "}
                <span className="opacity-40 font-medium">{currentYear}</span>
              </span>
              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.8 }}
                onClick={() =>
                  goToMonth(
                    currentMonth === 11 ? 0 : currentMonth + 1,
                    currentMonth === 11 ? currentYear + 1 : currentYear,
                  )
                }
                className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition"
              >
                ▶
              </motion.button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div
                  key={i}
                  className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calDays.map((day, i) => {
                const dateStr = day
                  ? `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  : "";
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === todayStr;
                return (
                  <motion.button
                    key={i}
                    whileHover={day ? { scale: 1.1 } : {}}
                    whileTap={day ? { scale: 0.9 } : {}}
                    disabled={!day}
                    onClick={() => goToDay(day)}
                    className={`
                      relative w-8 h-8 rounded-lg text-xs font-semibold transition-all
                      ${!day ? "invisible" : ""}
                      ${
                        isSelected
                          ? "bg-lime-400 text-gray-950 shadow-lg shadow-lime-400/20"
                          : isToday
                            ? "bg-lime-400/10 text-lime-500 ring-1 ring-lime-400/30"
                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                      }
                    `}
                  >
                    {day}
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              whileHover={{ y: -1 }}
              onClick={() => onSelectDate(todayStr)}
              className="mt-4 w-full py-2 text-[11px] font-bold text-lime-600 dark:text-lime-400 hover:bg-lime-50 dark:hover:bg-lime-400/5 rounded-xl transition uppercase tracking-widest"
            >
              Today
            </motion.button>
          </div>

          {/* Subjects section */}
          <div className="px-4 py-5">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">
                My Subjects
              </h3>
              <span className="text-[10px] font-bold text-lime-500 bg-lime-400/10 px-2 py-0.5 rounded-full">
                {subjects.length}
              </span>
            </div>

            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {subjects.map((s) => (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group flex items-center gap-3 rounded-2xl px-3 py-3 bg-gray-50 dark:bg-gray-900/40 border border-transparent dark:border-gray-800/50 hover:border-gray-200 dark:hover:border-gray-700 transition-all"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-sm"
                      style={{ backgroundColor: s.color }}
                    />

                    {editingId === s.id ? (
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                        className="flex-1 bg-white dark:bg-gray-800 text-xs px-2 py-1 rounded-md outline-none ring-1 ring-lime-400"
                      />
                    ) : (
                      <span className="flex-1 text-gray-700 dark:text-gray-300 text-sm font-medium truncate">
                        {s.name}
                      </span>
                    )}

                    {subjectGoals[s.id] && (
                      <span className="text-[8px] font-black bg-lime-400 text-gray-950 px-1.5 py-0.5 rounded-md">
                        GOAL
                      </span>
                    )}

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openGoalModal(s)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition text-xs"
                      >
                        🎯
                      </button>
                      <button
                        onClick={() => startEdit(s)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition text-xs"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDeleteSubject(s.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-md transition text-xs"
                      >
                        🗑️
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add Subject */}
            <div className="mt-4 flex gap-2 p-1">
              <input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="New subject..."
                className="flex-1 bg-gray-50 dark:bg-gray-900 text-sm px-4 py-2.5 rounded-2xl border-none focus:ring-2 focus:ring-lime-400/50 transition dark:text-white"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                className="w-10 h-10 rounded-2xl bg-lime-400 text-gray-950 flex items-center justify-center font-bold text-xl shadow-lg shadow-lime-400/20"
              >
                +
              </motion.button>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 text-center tracking-widest uppercase">
            Consistency is Key
          </p>
        </div>
      </aside>

      {/* Goal Modal */}
      <AnimatePresence>
        {goalModalSubject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setGoalModalSubject(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#151821] rounded-[2rem] p-8 shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: goalModalSubject.color }}
                />
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  Set Goal
                </h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Subject Goal
                  </label>
                  <input
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-3.5 text-sm dark:text-white"
                    placeholder="e.g. Complete 50 lectures"
                    value={goalForm.goal}
                    onChange={(e) =>
                      setGoalForm({ ...goalForm, goal: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Start
                    </label>
                    <input
                      type="date"
                      className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm dark:text-white"
                      value={goalForm.startDate}
                      onChange={(e) =>
                        setGoalForm({ ...goalForm, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      End
                    </label>
                    <input
                      type="date"
                      className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm dark:text-white"
                      value={goalForm.endDate}
                      onChange={(e) =>
                        setGoalForm({ ...goalForm, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setGoalModalSubject(null)}
                  className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveGoal}
                  className="flex-1 py-4 bg-lime-400 text-gray-950 font-black rounded-2xl shadow-xl shadow-lime-400/20 text-sm"
                >
                  Save Goal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style> */}
    </>
  );
}
