import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import WeeklyView from "../components/WeeklyView";
import DaySchedule from "../components/DaySchedule";
import MonthlyChart from "../components/MonthlyChart";
import StatsPanel from "../components/StatsPanel";
import WeeklyProgressLineChart from "../components/WeeklyProgressLineChart";
import MonthlyProgressLineChart from "../components/MonthlyProgressLineChart";
import SubjectTimeline from "../components/SubjectTimeline";
import FocusSessionReport from "../components/FocusSessionReport";
import DailyRoutine from "../components/DailyRoutine";
import DraggableDashboard from "../components/DraggableDashboard";
import SettingsModal from "../components/SettingsModal";
import { useTheme } from "../context/ThemeContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState({});
  const [subjectGoals, setSubjectGoals] = useState({});
  const [focusSessions, setFocusSessions] = useState({});
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const initialLoadDoneRef = useRef(false);
  const [showSettings, setShowSettings] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    if (user) loadUserData();
  }, [user]);

  async function loadUserData() {
    if (initialLoadDoneRef.current) return;
    try {
      setLoading(true);
      const rangeStart = new Date();
      rangeStart.setMonth(rangeStart.getMonth() - 1);
      rangeStart.setDate(1);
      const rangeEnd = new Date();
      rangeEnd.setMonth(rangeEnd.getMonth() + 2);
      rangeEnd.setDate(1);
      const rangeStartStr = rangeStart.toISOString().split("T")[0];
      const rangeEndStr = rangeEnd.toISOString().split("T")[0];

      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects").select("*").eq("user_id", user.id);
      if (subjectsError) throw subjectsError;
      setSubjects(subjectsData || []);

      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks").select("*").eq("user_id", user.id)
        .gte("date", rangeStartStr).lt("date", rangeEndStr);
      if (tasksError) throw tasksError;
      const tasksByDate = {};
      (tasksData || []).forEach((task) => {
        if (!tasksByDate[task.date]) tasksByDate[task.date] = [];
        tasksByDate[task.date].push(task);
      });
      setTasks(tasksByDate);

      const { data: goalsData, error: goalsError } = await supabase
        .from("subject_goals").select("*").eq("user_id", user.id);
      if (goalsError) throw goalsError;
      const goalsBySubject = {};
      (goalsData || []).forEach((goal) => { goalsBySubject[goal.subject_id] = goal; });
      setSubjectGoals(goalsBySubject);

      const { data: sessionsData, error: sessionsError } = await supabase
        .from("focus_sessions").select("*").eq("user_id", user.id)
        .gte("date", rangeStartStr).lt("date", rangeEndStr);
      if (sessionsError) throw sessionsError;
      const sessionsByDate = {};
      (sessionsData || []).forEach((session) => {
        if (!sessionsByDate[session.date]) sessionsByDate[session.date] = [];
        sessionsByDate[session.date].push(session);
      });
      setFocusSessions(sessionsByDate);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
      initialLoadDoneRef.current = true;
    }
  }

  async function handleSignOut() { await signOut(); navigate("/"); }

  async function addSubject(name, color) {
    const { data, error } = await supabase.from("subjects")
      .insert([{ user_id: user.id, name, color }]).select().single();
    if (error) throw error;
    setSubjects([...subjects, data]);
  }

  async function updateSubject(id, updates) {
    const { error } = await supabase.from("subjects").update(updates)
      .eq("id", id).eq("user_id", user.id);
    if (error) throw error;
    setSubjects(subjects.map((s) => s.id === id ? { ...s, ...updates } : s));
  }

  async function deleteSubject(id) {
    const { error } = await supabase.from("subjects").delete()
      .eq("id", id).eq("user_id", user.id);
    if (error) throw error;
    setSubjects(subjects.filter((s) => s.id !== id));
  }

  async function addTask(date, subjectId, topic, goal = 1) {
    const { data, error } = await supabase.from("tasks")
      .insert([{ user_id: user.id, date, subject_id: subjectId, topic, goal, completed: false }])
      .select().single();
    if (error) throw error;
    setTasks((prev) => ({ ...prev, [date]: [...(prev[date] || []), data] }));
  }

  async function toggleTask(taskId, date) {
    const task = tasks[date]?.find((t) => t.id === taskId);
    if (!task) return;
    const { error } = await supabase.from("tasks")
      .update({ completed: !task.completed }).eq("id", taskId).eq("user_id", user.id);
    if (error) throw error;
    setTasks((prev) => ({
      ...prev,
      [date]: prev[date].map((t) => t.id === taskId ? { ...t, completed: !t.completed } : t),
    }));
  }

  async function updateTask(taskId, date, updates) {
    const { error } = await supabase.from("tasks").update(updates)
      .eq("id", taskId).eq("user_id", user.id);
    if (error) throw error;
    setTasks((prev) => ({
      ...prev,
      [date]: prev[date].map((t) => t.id === taskId ? { ...t, ...updates } : t),
    }));
  }

  async function deleteTask(taskId, date) {
    const { error } = await supabase.from("tasks").delete()
      .eq("id", taskId).eq("user_id", user.id);
    if (error) throw error;
    setTasks((prev) => ({ ...prev, [date]: prev[date].filter((t) => t.id !== taskId) }));
  }

  async function updateSubjectGoal(subjectId, goal, startDate, endDate) {
    const existing = subjectGoals[subjectId];
    if (existing) {
      const { error } = await supabase.from("subject_goals")
        .update({ goal, start_date: startDate, end_date: endDate })
        .eq("id", existing.id).eq("user_id", user.id);
      if (error) throw error;
      setSubjectGoals((prev) => ({
        ...prev,
        [subjectId]: { ...prev[subjectId], goal, start_date: startDate, end_date: endDate },
      }));
    } else {
      const { data, error } = await supabase.from("subject_goals")
        .insert([{ user_id: user.id, subject_id: subjectId, goal, start_date: startDate, end_date: endDate }])
        .select().single();
      if (error) throw error;
      setSubjectGoals((prev) => ({ ...prev, [subjectId]: data }));
    }
  }

  async function logFocusSession(date, taskId, subjectId, durationMinutes, startTime, endTime) {
    const { data, error } = await supabase.from("focus_sessions")
      .insert([{ user_id: user.id, date, task_id: taskId, subject_id: subjectId, duration_minutes: durationMinutes, start_time: startTime, end_time: endTime }])
      .select().single();
    if (error) throw error;
    setFocusSessions((prev) => ({ ...prev, [date]: [...(prev[date] || []), data] }));
  }

  function getWeekDates(dateStr) {
    const date = new Date(dateStr + "T00:00:00");
    const day = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((day + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    });
  }

  function getMonthDailyData(dateStr, tasks) {
    const date = new Date(dateStr + "T00:00:00");
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const d = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayTasks = tasks[d] || [];
      const total = dayTasks.length;
      const completed = dayTasks.filter((t) => t.completed).length;
      return { date: d, day, total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
    });
  }

  function getMonthStats(dateStr, tasks) {
    const date = new Date(dateStr + "T00:00:00");
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let total = 0, completed = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const d = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayTasks = tasks[d] || [];
      total += dayTasks.length;
      completed += dayTasks.filter((t) => t.completed).length;
    }
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }

  function getWeekStats(dateStr, tasks) {
    const weekDates = getWeekDates(dateStr);
    let total = 0, completed = 0;
    weekDates.forEach((d) => {
      const dayTasks = tasks[d] || [];
      total += dayTasks.length;
      completed += dayTasks.filter((t) => t.completed).length;
    });
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }

  function getSubjectStats(dateStr, tasks, subjects) {
    const date = new Date(dateStr + "T00:00:00");
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const stats = {};
    subjects.forEach((s) => { stats[s.name] = { total: 0, completed: 0 }; });
    for (let day = 1; day <= daysInMonth; day++) {
      const d = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      (tasks[d] || []).forEach((task) => {
        const subject = subjects.find((s) => s.id === task.subject_id);
        const name = subject?.name;
        if (name) {
          if (!stats[name]) stats[name] = { total: 0, completed: 0 };
          stats[name].total++;
          if (task.completed) stats[name].completed++;
        }
      });
    }
    return stats;
  }

  function getStreakDays(tasks) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const dayTasks = tasks[dateStr] || [];
      if (i === 0) continue;
      if (dayTasks.length === 0) break;
      if (dayTasks.filter((t) => t.completed).length === 0) break;
      streak++;
    }
    return streak;
  }

  if (loading && !initialLoadDone) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading your grind...</p>
        </motion.div>
      </div>
    );
  }

  const rightPanelContent = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6 w-full"
    >
      <DailyRoutine />
      <StatsPanel
        monthStats={getMonthStats(selectedDate, tasks)}
        weekStats={getWeekStats(selectedDate, tasks)}
        subjectStats={getSubjectStats(selectedDate, tasks, subjects)}
        subjects={subjects}
        streakDays={getStreakDays(tasks)}
      />
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 overflow-x-hidden">
      {/* Top Bar */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md sticky top-0 z-50 w-full">
        <div className="h-full px-3 sm:px-4 lg:px-6 flex items-center justify-between max-w-[100vw]">
          {/* Left */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="xl:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-lime-400 rounded-xl flex items-center justify-center shadow-lg shadow-lime-400/30">
                <span className="text-gray-950 font-black text-lg">G</span>
              </div>
              <span className="font-black text-xl tracking-tighter text-gray-900 dark:text-white hidden sm:block">
                GRIND<span className="text-lime-400">MAP</span>
              </span>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="hidden lg:block text-sm text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
              {user?.email}
            </span>

            <button
              onClick={() => setRightPanelOpen(true)}
              className="xl:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center text-lg"
            >
              ⚙️
            </button>

            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center text-lg"
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            <button
              onClick={handleSignOut}
              className="hidden sm:block px-4 py-1.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-500/50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex w-full min-w-0">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          subjects={subjects}
          onAddSubject={addSubject}
          onUpdateSubject={updateSubject}
          onDeleteSubject={deleteSubject}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          subjectGoals={subjectGoals}
          onSetGoal={updateSubjectGoal}
        />

        {/* Main Content - Fixed overflow issues here */}
        <main className="flex-1 min-w-0 min-h-[calc(100vh-3.5rem)] xl:ml-72 xl:mr-80 transition-all duration-300 p-3 sm:p-5 lg:p-6 w-full">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-full overflow-x-hidden"
          >
            <DraggableDashboard
              components={{
                subjectTimeline: (
                  <SubjectTimeline
                    subjects={subjects.map((s) => ({
                      ...s,
                      startDate: subjectGoals[s.id]?.start_date || null,
                      endDate: subjectGoals[s.id]?.end_date || null,
                      goal: subjectGoals[s.id]?.goal || null,
                    }))}
                    getSubjectTimelineStats={(subjectId, startDate, endDate) => {
                      if (!startDate || !endDate)
                        return { total: 0, completed: 0, percentage: 0, daysCompleted: 0, daysPassed: 0, daysRemaining: 0 };
                      const start = new Date(startDate + "T00:00:00");
                      const end = new Date(endDate + "T00:00:00");
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      let total = 0, completed = 0, daysCompleted = 0, daysPassed = 0;
                      const cursor = new Date(start);
                      while (cursor <= end) {
                        const d = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
                        const dayTasks = (tasks[d] || []).filter((t) => t.subject_id === subjectId);
                        if (cursor <= today) {
                          daysPassed++;
                          if (dayTasks.length > 0 && dayTasks.every((t) => t.completed)) daysCompleted++;
                        }
                        total += dayTasks.length;
                        completed += dayTasks.filter((t) => t.completed).length;
                        cursor.setDate(cursor.getDate() + 1);
                      }
                      const daysRemaining = Math.max(0, Math.ceil((end - today) / (1000 * 60 * 60 * 24)));
                      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                      return { total, completed, percentage, daysCompleted, daysPassed, daysRemaining };
                    }}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    updateSubjectGoal={updateSubjectGoal}
                  />
                ),
                weeklyView: (
                  <WeeklyView
                    weekDates={getWeekDates(selectedDate)}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    getDayTasks={(date) => tasks[date] || []}
                    getDayStats={(date) => {
                      const dayTasks = tasks[date] || [];
                      const total = dayTasks.length;
                      const completed = dayTasks.filter((t) => t.completed).length;
                      return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
                    }}
                    subjects={subjects}
                  />
                ),
                weeklyProgressChart: (
                  <WeeklyProgressLineChart
                    weekDates={getWeekDates(selectedDate)}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    getDayStats={(date) => {
                      const dayTasks = tasks[date] || [];
                      const total = dayTasks.length;
                      const completed = dayTasks.filter((t) => t.completed).length;
                      return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
                    }}
                  />
                ),
                daySchedule: (
                  <DaySchedule
                    date={selectedDate}
                    tasks={(tasks[selectedDate] || []).map((t) => ({
                      ...t,
                      done: t.completed,
                      subject: subjects.find((s) => s.id === t.subject_id)?.name || "",
                      subject_id: t.subject_id,
                    }))}
                    subjects={subjects}
                    addTask={(date, subject, topic) => {
                      const subjectObj = subjects.find((s) => s.name === subject);
                      if (subjectObj) addTask(date, subjectObj.id, topic);
                    }}
                    toggleTask={(date, taskId) => toggleTask(taskId, date)}
                    removeTask={(date, taskId) => deleteTask(taskId, date)}
                    updateTask={(date, taskId, updates) => updateTask(taskId, date, updates)}
                    getDayTasks={(date) =>
                      (tasks[date] || []).map((t) => ({
                        ...t,
                        done: t.completed,
                        subject: subjects.find((s) => s.id === t.subject_id)?.name || "",
                      }))
                    }
                    updateTaskFocusSession={() => {}}
                    incrementTaskFocusSession={() => {}}
                    logFocusSession={logFocusSession}
                  />
                ),
                monthlyProgressChart: (
                  <MonthlyProgressLineChart
                    dailyData={getMonthDailyData(selectedDate, tasks)}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                  />
                ),
                monthlyBarChart: (
                  <MonthlyChart
                    dailyData={getMonthDailyData(selectedDate, tasks)}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                  />
                ),
                focusSessionReport: (
                  <FocusSessionReport
                    sessions={(focusSessions[selectedDate] || []).map((s) => ({
                      ...s,
                      subject: subjects.find((sub) => sub.id === s.subject_id)?.name || "Unknown",
                      subjectColor: subjects.find((sub) => sub.id === s.subject_id)?.color || "#6366f1",
                      taskTopic: tasks[selectedDate]?.find((t) => t.id === s.task_id)?.topic || "",
                      startTime: s.start_time,
                      endTime: s.end_time,
                      durationMinutes: s.duration_minutes,
                    }))}
                    totalMinutes={(focusSessions[selectedDate] || []).reduce(
                      (sum, s) => sum + (s.duration_minutes || 0), 0
                    )}
                  />
                ),
              }}
            />
          </motion.div>
        </main>

        {/* Desktop Right Panel */}
        <aside className="hidden xl:block fixed right-0 top-14 w-80 h-[calc(100vh-3.5rem)] border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-y-auto overflow-x-hidden z-30">
          {rightPanelContent}
        </aside>
      </div>

      {/* Mobile Right Panel */}
      <AnimatePresence>
        {rightPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRightPanelOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-14 right-0 h-[calc(100vh-3.5rem)] w-80 max-w-[90vw] bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 z-50 overflow-y-auto overflow-x-hidden"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center z-10">
                <h3 className="font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-widest">
                  Stats & Routine
                </h3>
                <button
                  onClick={() => setRightPanelOpen(false)}
                  className="text-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              {rightPanelContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </div>
  );
}