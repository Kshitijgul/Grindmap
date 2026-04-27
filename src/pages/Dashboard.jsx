import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState({});
  const [subjectGoals, setSubjectGoals] = useState({});
  const [focusSessions, setFocusSessions] = useState({});
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const initialLoadDoneRef = useRef(false); // ← ADD THIS// ← KEY FIX

  // Load user data from Supabase
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  async function loadUserData() {
    // ← KEY FIX: never reload if already loaded once
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

      // 1. Load subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", user.id);

      if (subjectsError) throw subjectsError;
      setSubjects(subjectsData || []);

      // 2. Load tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", rangeStartStr)
        .lt("date", rangeEndStr);

      if (tasksError) throw tasksError;

      const tasksByDate = {};
      (tasksData || []).forEach((task) => {
        if (!tasksByDate[task.date]) tasksByDate[task.date] = [];
        tasksByDate[task.date].push(task);
      });
      setTasks(tasksByDate);

      // 3. Load subject goals
      const { data: goalsData, error: goalsError } = await supabase
        .from("subject_goals")
        .select("*")
        .eq("user_id", user.id);

      if (goalsError) throw goalsError;

      const goalsBySubject = {};
      (goalsData || []).forEach((goal) => {
        goalsBySubject[goal.subject_id] = goal;
      });
      setSubjectGoals(goalsBySubject);

      // 4. Load focus sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("focus_sessions")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", rangeStartStr)
        .lt("date", rangeEndStr);

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
      setInitialLoadDone(true); // ← KEY FIX: mark as loaded
      initialLoadDoneRef.current = true; // ← ADD THIS
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  // ── Subject management ──
  async function addSubject(name, color) {
    const { data, error } = await supabase
      .from("subjects")
      .insert([{ user_id: user.id, name, color }])
      .select()
      .single();
    if (error) throw error;
    setSubjects([...subjects, data]);
  }

  async function updateSubject(id, updates) {
    const { error } = await supabase
      .from("subjects")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }

  async function deleteSubject(id) {
    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;
    setSubjects(subjects.filter((s) => s.id !== id));
  }

  // ── Task management ──
  async function addTask(date, subjectId, topic, goal = 1) {
    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          user_id: user.id,
          date,
          subject_id: subjectId,
          topic,
          goal,
          completed: false,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    setTasks((prev) => ({
      ...prev,
      [date]: [...(prev[date] || []), data],
    }));
  }

  async function toggleTask(taskId, date) {
    const task = tasks[date]?.find((t) => t.id === taskId);
    if (!task) return;
    const { error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", taskId)
      .eq("user_id", user.id);
    if (error) throw error;
    setTasks((prev) => ({
      ...prev,
      [date]: prev[date].map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t,
      ),
    }));
  }

  async function updateTask(taskId, date, updates) {
    const { error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .eq("user_id", user.id);
    if (error) throw error;
    setTasks((prev) => ({
      ...prev,
      [date]: prev[date].map((t) =>
        t.id === taskId ? { ...t, ...updates } : t,
      ),
    }));
  }

  async function deleteTask(taskId, date) {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("user_id", user.id);
    if (error) throw error;
    setTasks((prev) => ({
      ...prev,
      [date]: prev[date].filter((t) => t.id !== taskId),
    }));
  }

  // ── Subject goals ──
  async function updateSubjectGoal(subjectId, goal, startDate, endDate) {
    const existing = subjectGoals[subjectId];
    if (existing) {
      const { error } = await supabase
        .from("subject_goals")
        .update({ goal, start_date: startDate, end_date: endDate })
        .eq("id", existing.id)
        .eq("user_id", user.id);
      if (error) throw error;
      setSubjectGoals((prev) => ({
        ...prev,
        [subjectId]: {
          ...prev[subjectId],
          goal,
          start_date: startDate,
          end_date: endDate,
        },
      }));
    } else {
      const { data, error } = await supabase
        .from("subject_goals")
        .insert([
          {
            user_id: user.id,
            subject_id: subjectId,
            goal,
            start_date: startDate,
            end_date: endDate,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      setSubjectGoals((prev) => ({ ...prev, [subjectId]: data }));
    }
  }

  // ── Focus sessions ──
  async function logFocusSession(
    date,
    taskId,
    subjectId,
    durationMinutes,
    startTime,
    endTime,
  ) {
    const { data, error } = await supabase
      .from("focus_sessions")
      .insert([
        {
          user_id: user.id,
          date,
          task_id: taskId,
          subject_id: subjectId,
          duration_minutes: durationMinutes,
          start_time: startTime,
          end_time: endTime,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    setFocusSessions((prev) => ({
      ...prev,
      [date]: [...(prev[date] || []), data],
    }));
  }

  // ── Helper functions ──
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
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { date: d, day, total, completed, percentage };
    });
  }

  function getMonthStats(dateStr, tasks) {
    const date = new Date(dateStr + "T00:00:00");
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let total = 0,
      completed = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const d = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayTasks = tasks[d] || [];
      total += dayTasks.length;
      completed += dayTasks.filter((t) => t.completed).length;
    }
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }

  function getWeekStats(dateStr, tasks) {
    const weekDates = getWeekDates(dateStr);
    let total = 0,
      completed = 0;
    weekDates.forEach((d) => {
      const dayTasks = tasks[d] || [];
      total += dayTasks.length;
      completed += dayTasks.filter((t) => t.completed).length;
    });
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }

  function getSubjectStats(dateStr, tasks, subjects) {
    const date = new Date(dateStr + "T00:00:00");
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const stats = {};
    subjects.forEach((s) => {
      stats[s.name] = { total: 0, completed: 0 };
    });
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

      // Skip today entirely — streak is based on PAST completed days
      if (i === 0) continue;

      // No tasks on this past day — streak broken
      if (dayTasks.length === 0) break;

      // Tasks exist but none completed — streak broken
      const completedCount = dayTasks.filter((t) => t.completed).length;
      if (completedCount === 0) break;

      // At least 1 task done — count it
      streak++;
    }

    return streak;
  }

  // ── Only show loading screen on very first load ──
  if (loading && !initialLoadDone) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your grind...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top Bar */}
      <header className="h-14 border-b border-gray-800 flex items-center justify-between px-4 bg-gray-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg lg:hidden"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-lime-400 rounded-lg flex items-center justify-center">
              <span className="text-gray-950 font-bold text-xs">A</span>
            </div>
            <span className="font-bold text-white hidden sm:block">
              <span className="text-white">GRIND</span>{" "}
              <span className="text-lime-400">MAP</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 hidden sm:block">
            {user?.email}
          </span>
          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex">
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

        {/* Main Content */}
        {/* Main Content */}
        <main className="flex-1 lg:pl-72 min-h-screen">
          <div className="p-4 lg:p-6">
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
                    getSubjectTimelineStats={(
                      subjectId,
                      startDate,
                      endDate,
                    ) => {
                      if (!startDate || !endDate)
                        return {
                          total: 0,
                          completed: 0,
                          percentage: 0,
                          daysCompleted: 0,
                          daysPassed: 0,
                          daysRemaining: 0,
                        };
                      const start = new Date(startDate + "T00:00:00");
                      const end = new Date(endDate + "T00:00:00");
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      let total = 0,
                        completed = 0,
                        daysCompleted = 0,
                        daysPassed = 0;
                      const cursor = new Date(start);
                      while (cursor <= end) {
                        const d = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
                        const dayTasks = (tasks[d] || []).filter(
                          (t) => t.subject_id === subjectId,
                        );
                        if (cursor <= today) {
                          daysPassed++;
                          if (
                            dayTasks.length > 0 &&
                            dayTasks.every((t) => t.completed)
                          )
                            daysCompleted++;
                        }
                        total += dayTasks.length;
                        completed += dayTasks.filter((t) => t.completed).length;
                        cursor.setDate(cursor.getDate() + 1);
                      }
                      const daysRemaining = Math.max(
                        0,
                        Math.ceil((end - today) / (1000 * 60 * 60 * 24)),
                      );
                      const percentage =
                        total > 0 ? Math.round((completed / total) * 100) : 0;
                      return {
                        total,
                        completed,
                        percentage,
                        daysCompleted,
                        daysPassed,
                        daysRemaining,
                      };
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
                      const completed = dayTasks.filter(
                        (t) => t.completed,
                      ).length;
                      const percentage =
                        total > 0 ? Math.round((completed / total) * 100) : 0;
                      return { total, completed, percentage };
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
                      const completed = dayTasks.filter(
                        (t) => t.completed,
                      ).length;
                      const percentage =
                        total > 0 ? Math.round((completed / total) * 100) : 0;
                      return { total, completed, percentage };
                    }}
                  />
                ),

                daySchedule: (
                  <DaySchedule
                    date={selectedDate}
                    tasks={(tasks[selectedDate] || []).map((t) => ({
                      ...t,
                      done: t.completed,
                      subject:
                        subjects.find((s) => s.id === t.subject_id)?.name || "",
                      subject_id: t.subject_id,
                    }))}
                    subjects={subjects}
                    addTask={(date, subject, topic) => {
                      const subjectObj = subjects.find(
                        (s) => s.name === subject,
                      );
                      if (subjectObj) addTask(date, subjectObj.id, topic);
                    }}
                    toggleTask={(date, taskId) => toggleTask(taskId, date)}
                    removeTask={(date, taskId) => deleteTask(taskId, date)}
                    updateTask={(date, taskId, updates) =>
                      updateTask(taskId, date, updates)
                    }
                    getDayTasks={(date) =>
                      (tasks[date] || []).map((t) => ({
                        ...t,
                        done: t.completed,
                        subject:
                          subjects.find((s) => s.id === t.subject_id)?.name ||
                          "",
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
                      subject:
                        subjects.find((sub) => sub.id === s.subject_id)?.name ||
                        "Unknown",
                      subjectColor:
                        subjects.find((sub) => sub.id === s.subject_id)
                          ?.color || "#6366f1",
                      taskTopic:
                        tasks[selectedDate]?.find((t) => t.id === s.task_id)
                          ?.topic || "",
                      startTime: s.start_time,
                      endTime: s.end_time,
                      durationMinutes: s.duration_minutes,
                    }))}
                    totalMinutes={(focusSessions[selectedDate] || []).reduce(
                      (sum, s) => sum + (s.duration_minutes || 0),
                      0,
                    )}
                  />
                ),
              }}
            />
          </div>
        </main>

        {/* Stats Panel */}

        <div className="flex flex-col gap-4">
          <DailyRoutine />
          <StatsPanel
            monthStats={getMonthStats(selectedDate, tasks)}
            weekStats={getWeekStats(selectedDate, tasks)}
            subjectStats={getSubjectStats(selectedDate, tasks, subjects)}
            subjects={subjects}
            streakDays={getStreakDays(tasks)}
          />
        </div>
      </div>
    </div>
  );
}
