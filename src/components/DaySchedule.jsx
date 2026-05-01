import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DAY_NAMES, MONTH_NAMES } from "../utils/calender";
import FocusTimer from "./FocusTimer";

export default function DaySchedule({
  date,
  tasks,
  subjects,
  addTask,
  toggleTask,
  removeTask,
  updateTask,
  getDayTasks,
  updateTaskFocusSession,
  incrementTaskFocusSession,
  logFocusSession,
}) {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || "");
  const [topic, setTopic] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [editTopic, setEditTopic] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [focusTimerTask, setFocusTimerTask] = useState(null);

  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0].name);
    }
  }, [subjects, selectedSubject]);

  const d = new Date(`${date}T00:00:00`);
  const dayName = DAY_NAMES[d.getDay()];
  const monthName = MONTH_NAMES[d.getMonth()];
  const dayNum = d.getDate();
  const year = d.getFullYear();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
  const isToday = date === todayStr;

  const completedCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAdd = () => {
    if (!topic.trim()) return;
    const subjectToUse = selectedSubject || subjects[0]?.name;
    if (!subjectToUse) return;
    addTask(date, subjectToUse, topic.trim());
    setTopic("");
  };

  const getSubjectColor = (name) => subjects.find((s) => s.name === name)?.color || "#6366f1";

  const startEdit = (task) => {
    setEditingTask(task.id);
    setEditTopic(task.topic);
  };

  const saveEdit = (taskId) => {
    if (editTopic.trim()) {
      updateTask(date, taskId, { topic: editTopic.trim() });
    }
    setEditingTask(null);
  };

  const copyFromYesterday = () => {
    const yesterday = new Date(`${date}T00:00:00`);
    yesterday.setDate(yesterday.getDate() - 1);
    const ydStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(
      yesterday.getDate()
    ).padStart(2, "0")}`;
    const yTasks = getDayTasks(ydStr);
    yTasks.forEach((t) => addTask(date, t.subject, t.topic));
  };

  const quickTemplates = [
    { subject: "Linear Algebra", topic: "Lecture - Eigenvalues & Eigenvectors" },
    { subject: "Digital Logic", topic: "Practice - K-Map Problems" },
    { subject: "Data Structures", topic: "Implement - Binary Search Tree" },
    { subject: "Operating Systems", topic: "Notes - Process Scheduling" },
    { subject: "Computer Networks", topic: "Revision - TCP/IP Model" },
  ];

  const filteredTemplates = quickTemplates.filter((qt) => subjects.some((s) => s.name === qt.subject));

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
    >
      <div
        className={`border-b border-slate-200 px-3 py-4 sm:px-5 lg:px-6 dark:border-slate-800 ${
          isToday
            ? "bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/35 dark:to-purple-900/35"
            : "bg-slate-50 dark:bg-slate-900"
        }`}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {isToday && (
                <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Today
                </span>
              )}
              <h2 className="text-base font-bold text-slate-900 sm:text-lg lg:text-xl dark:text-white">
                {dayName}, {monthName} {dayNum}, {year}
              </h2>
            </div>
          </div>

          {totalCount > 0 && (
            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">Completion</p>
                <p
                  className={`text-lg font-bold ${
                    pct === 100 ? "text-emerald-500" : pct >= 50 ? "text-amber-500" : "text-indigo-500"
                  }`}
                >
                  {pct}%
                </p>
              </div>
              <div className="h-11 w-11 shrink-0">
                <svg viewBox="0 0 36 36" className="-rotate-90 transform">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="3"
                  />
                  <motion.path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={pct === 100 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#6366f1"}
                    strokeWidth="3"
                    strokeDasharray={`${pct}, 100`}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: `${pct}, 100` }}
                    transition={{ duration: 0.5 }}
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        {totalCount > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{completedCount} completed</span>
              <span>{totalCount - completedCount} remaining</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.45 }}
                style={{
                  background: pct === 100 ? "#10b981" : "linear-gradient(90deg, #6366f1, #8b5cf6)",
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="border-b border-slate-200 bg-slate-50/70 px-3 py-4 sm:px-5 lg:px-6 dark:border-slate-800 dark:bg-slate-950/30">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[180px_1fr_auto] md:items-end">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {subjects.length === 0 && <option value="">No subjects yet</option>}
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Topic / Lecture / Task
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="e.g. Lecture 7 - Eigenvalues"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={!topic.trim() || subjects.length === 0}
            className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 md:w-auto dark:disabled:bg-slate-700"
          >
            Add Task
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={copyFromYesterday}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Copy Yesterday Plan
          </button>
          <button
            onClick={() => setShowQuickAdd((v) => !v)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Quick Templates
          </button>
        </div>

        <AnimatePresence initial={false}>
          {showQuickAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 overflow-hidden"
            >
              <div className="space-y-1 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
                {filteredTemplates.map((qt) => (
                  <button
                    key={`${qt.subject}-${qt.topic}`}
                    onClick={() => {
                      addTask(date, qt.subject, qt.topic);
                      setShowQuickAdd(false);
                    }}
                    className="flex w-full items-start gap-2 rounded px-2 py-2 text-left text-xs text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <span
                      className="mt-1 h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: getSubjectColor(qt.subject) }}
                    />
                    <span className="min-w-0">
                      <span className="mr-1 font-medium text-slate-500 dark:text-slate-400">{qt.subject}:</span>
                      <span className="break-words">{qt.topic}</span>
                    </span>
                  </button>
                ))}
                {filteredTemplates.length === 0 && (
                  <p className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400">Add subjects first to use templates</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800/70">
        {tasks.length === 0 ? (
          <div className="px-4 py-12 text-center sm:px-6">
            <p className="text-base font-medium text-slate-600 dark:text-slate-300">No tasks scheduled</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add your study plan for this day above</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className={`group px-3 py-3.5 sm:px-5 lg:px-6 ${
                  task.done ? "bg-emerald-50/60 dark:bg-emerald-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/20"
                }`}
              >
                <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 gap-y-2 md:grid-cols-[auto_auto_auto_1fr_auto] md:items-center md:gap-3">
                  <span className="w-5 text-right font-mono text-xs text-slate-500 dark:text-slate-400">{index + 1}</span>

                  <button
                    onClick={() => toggleTask(date, task.id)}
                    className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition ${
                      task.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-400 hover:border-indigo-500 dark:border-slate-600"
                    }`}
                  >
                    {task.done && (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <span
                    className="w-fit rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${getSubjectColor(task.subject)}20`,
                      color: getSubjectColor(task.subject),
                      borderLeft: `3px solid ${getSubjectColor(task.subject)}`,
                    }}
                  >
                    {task.subject}
                  </span>

                  <div className="col-span-3 md:col-span-1 md:col-start-4">
                    {editingTask === task.id ? (
                      <input
                        value={editTopic}
                        onChange={(e) => setEditTopic(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(task.id);
                          if (e.key === "Escape") setEditingTask(null);
                        }}
                        onBlur={() => saveEdit(task.id)}
                        className="w-full rounded border border-indigo-500 bg-white px-2 py-1 text-sm text-slate-900 dark:bg-slate-800 dark:text-white"
                        autoFocus
                      />
                    ) : (
                      <button
                        type="button"
                        onDoubleClick={() => startEdit(task)}
                        title="Double-click to edit"
                        className={`w-full text-left text-sm ${
                          task.done ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <span className="break-words">{task.topic}</span>
                      </button>
                    )}
                  </div>

                  <div className="col-span-3 flex flex-wrap items-center gap-1 md:col-span-1 md:col-start-5 md:flex-nowrap md:justify-end md:opacity-70 md:transition-opacity md:group-hover:opacity-100">
                    {task.done && (
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                        Done
                      </span>
                    )}

                    <button
                      onClick={() => setFocusTimerTask(task)}
                      className="rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-600 transition hover:bg-slate-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Focus {task.sessionsCompleted > 0 ? `(${task.sessionsCompleted})` : ""}
                    </button>
                    <button
                      onClick={() => startEdit(task)}
                      className="rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-600 transition hover:bg-slate-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeTask(date, task.id)}
                      className="rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-600 transition hover:bg-slate-200 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {tasks.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-slate-200 bg-slate-50/80 px-3 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-5 lg:px-6 dark:border-slate-800 dark:bg-slate-950/30">
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <span>
              <span className="font-bold text-emerald-500">{completedCount}</span> completed
            </span>
            <span>
              <span className="font-bold text-amber-500">{totalCount - completedCount}</span> pending
            </span>
          </div>
          {pct === 100 && <span className="font-semibold text-emerald-500">All done. Great work.</span>}
        </div>
      )}

      {focusTimerTask && (
        <FocusTimer
          task={{ ...focusTimerTask, subjectColor: getSubjectColor(focusTimerTask.subject) }}
          date={date}
          updateTaskFocusSession={updateTaskFocusSession}
          incrementTaskFocusSession={incrementTaskFocusSession}
          logFocusSession={logFocusSession}
          onClose={() => setFocusTimerTask(null)}
        />
      )}
    </motion.section>
  );
}