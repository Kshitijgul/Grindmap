import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';

// ── Theme (your existing context) ──
import { useTheme } from "../context/ThemeContext"; // adjust path if different

// ── Your Logos ──
import GrindMapLogo from "../components/GrindMapLogo";
import NavLogo3 from "../components/NavLogo3";

// ── Animated counter hook ──
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ── Intersection observer hook ──
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export default function HomePage() {
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");

  const [statsRef, statsInView] = useInView(0.3);
  const users = useCounter(12400, 2000, statsInView);
  const sessions = useCounter(840000, 2200, statsInView);
  const hours = useCounter(3200000, 2400, statsInView);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    {
      icon: "📅",
      title: "Daily Planning",
      desc: "Schedule tasks by subject, copy yesterday's plan, and use quick templates to set up your day in seconds.",
    },
    {
      icon: "🎯",
      title: "Focus Timer",
      desc: "Built-in Pomodoro timer with custom intervals, session logging, alarm tones, and a distraction-free fullscreen mode.",
    },
    {
      icon: "📊",
      title: "Progress Analytics",
      desc: "Weekly and monthly charts, streak tracking, subject breakdowns — see exactly where your time goes.",
    },
    {
      icon: "📚",
      title: "Subject Goals",
      desc: "Set timelines for each subject with start/end dates, track completion percentage, and get overdue alerts.",
    },
    {
      icon: "☁️",
      title: "Cloud Sync",
      desc: "Your data syncs instantly across all devices via Supabase — never lose a session or streak.",
    },
    {
      icon: "🌙",
      title: "Dark & Light Mode",
      desc: "Eye-friendly dark mode by default. Switch to light mode whenever you need a change of pace.",
    },
  ];

  const pricing = [
    {
      tier: "Free",
      price: "$0",
      period: "forever",
      color: "from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950",
      border: "border-gray-200 dark:border-gray-800",
      badge: null,
      features: [
        "Up to 5 Subjects",
        "Up to 10 Tasks/day",
        "Basic Focus Timer",
        "7-day History",
        "Weekly Progress Chart",
        "Basic Streak Tracking",
      ],
      missing: [
        "Monthly Charts",
        "Goal Timelines",
        "Focus Reports",
        "Export/Import",
      ],
      cta: "Get Started Free",
      ctaStyle:
        "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100",
    },
    {
      tier: "Premium",
      price: "$4.99",
      period: "/month",
      color:
        "from-lime-50 to-emerald-50 dark:from-lime-500/10 dark:to-emerald-500/5",
      border: "border-lime-300 dark:border-lime-500/40",
      badge: "Most Popular",
      features: [
        "Unlimited Subjects & Tasks",
        "Custom Focus Timer",
        "30-day History",
        "Monthly Progress Charts",
        "Subject Goal Timelines",
        "Focus Session Reports",
        "Export/Import (JSON)",
        "Quick Templates",
        "No Ads",
      ],
      missing: ["Mobile App", "AI Features"],
      cta: "Start Premium",
      ctaStyle:
        "bg-lime-400 text-gray-950 hover:bg-lime-300 dark:bg-lime-400 dark:hover:bg-lime-300",
    },
    {
      tier: "Pro",
      price: "$9.99",
      period: "/month",
      color:
        "from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/5",
      border: "border-indigo-300 dark:border-indigo-500/30",
      badge: "Power Users",
      features: [
        "Everything in Premium",
        "Unlimited History",
        "Mobile Apps (iOS + Android)",
        "AI Study Recommendations",
        "Smart Scheduling",
        "Study Heatmap",
        "Google Calendar Sync",
        "Push Notifications",
        "Custom Themes",
        "Priority Support",
        "Leaderboards & Study Groups",
      ],
      missing: [],
      cta: "Go Pro",
      ctaStyle:
        "bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400",
    },
  ];

  const testimonials = [
    {
      name: "Aryan Mehta",
      role: "JEE Aspirant",
      avatar: "AM",
      color: "#8B5CF6",
      text: "GrindMap transformed how I study. The focus timer keeps me locked in and streak tracking makes me consistent. 95 days streak so far!",
    },
    {
      name: "Priya Sharma",
      role: "UPSC Candidate",
      avatar: "PS",
      color: "#22D3EE",
      text: "The subject timeline feature is a game changer. I can see exactly which subjects I'm behind on and course correct immediately.",
    },
    {
      name: "Rahul Singh",
      role: "Engineering Student",
      avatar: "RS",
      color: "#F472B6",
      text: "Switched from Notion to GrindMap. The analytics alone are worth it — I discovered I study best between 6-9 AM.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 font-['Outfit',_sans-serif] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');

        .hero-gradient { background: radial-gradient(ellipse 80% 60% at 50% -10%, #6366F1 0%, transparent 70%); }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.08); }

        .nav-link { position: relative; }
        .nav-link::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: #a3e635; transition: width 0.2s ease; }
        .nav-link:hover::after { width: 100%; }

        .ticker { animation: ticker 20s linear infinite; }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        .float { animation: float 6s ease-in-out infinite; }
        .float-delay { animation: float 6s ease-in-out 1.5s infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

        .lime-glow { box-shadow: 0 0 0 1px #a3e635, 0 8px 32px rgba(163, 230, 53, 0.25); }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 dark:bg-gray-950/90 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <div className="block sm:hidden">
              <NavLogo3 size={32} />
            </div>
            <div className="hidden sm:block">
              <GrindMapLogo size="default" />
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Pricing", "About", "Contact"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="nav-link text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {link}
              </a>
            ))}
          </div>

          {/* CTA + Theme */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center text-lg"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            <button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-4 py-2"
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="text-sm font-bold bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 active:bg-black transition-all shadow-sm dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100"
            >
              Get Started →
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
            aria-label="Open menu"
          >
            <span
              className={`block h-0.5 bg-gray-900 dark:bg-gray-100 transition-all duration-300 ${menuOpen ? "w-6 rotate-45 translate-y-2" : "w-6"}`}
            />
            <span
              className={`block h-0.5 bg-gray-900 dark:bg-gray-100 transition-all duration-300 ${menuOpen ? "w-0 opacity-0" : "w-4"}`}
            />
            <span
              className={`block h-0.5 bg-gray-900 dark:bg-gray-100 transition-all duration-300 ${menuOpen ? "w-6 -rotate-45 -translate-y-2" : "w-6"}`}
            />
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 ${
            menuOpen ? "max-h-80 py-4" : "max-h-0"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 space-y-1">
            {["Features", "Pricing", "About", "Contact"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-50 dark:border-gray-900"
              >
                {link}
              </a>
            ))}
            <div className="flex gap-3 pt-3">
              <button
                onClick={toggleTheme}
                className="w-12 py-2.5 text-sm font-semibold border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900"
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {isDark ? "☀️" : "🌙"}
              </button>
              <button
                onClick={() => navigate("/login")}
                className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Log In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="flex-1 py-2.5 text-sm font-bold bg-gray-900 text-white rounded-xl dark:bg-white dark:text-gray-950"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 hero-gradient overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-lime-200/30 dark:bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/40 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-lime-50 dark:bg-lime-400/10 border border-lime-200 dark:border-lime-400/20 rounded-full px-4 py-1.5 mb-6">
              <div className="flex -space-x-1.5">
                {["#8B5CF6", "#22D3EE", "#F472B6", "#34D399"].map((c, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-950"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-lime-700 dark:text-lime-300">
                12,400+ students grinding daily
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-['Fraunces',_serif] font-black text-4xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-gray-900 dark:text-white mb-6">
              Study Smarter,{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Track Better,</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 sm:h-4 bg-lime-300/60 dark:bg-lime-400/25 -z-0 skew-x-1" />
              </span>{" "}
              <span className="text-gray-400 dark:text-gray-400 italic font-['Fraunces',_serif]">
                Achieve More.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              GrindMap is the all-in-one study tracker built for serious
              students. Plan your day, focus with Pomodoro, track streaks, and
              see your progress — all in one beautiful dashboard.
            </p>

            {/* Email CTA */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100 dark:focus:ring-lime-400/20 bg-white dark:bg-gray-900 shadow-sm"
              />
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-3.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 active:bg-black transition-all shadow-sm whitespace-nowrap dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100"
              >
                Start Free →
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              No credit card required • Free forever plan available
            </p>
          </div>

          {/* Dashboard preview cards */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                {
                  label: "STREAK",
                  value: "47 🔥",
                  sub: "days in a row",
                  bg: "bg-orange-50 dark:bg-orange-500/10",
                  border: "border-orange-200 dark:border-orange-500/20",
                  val: "text-orange-500 dark:text-orange-300",
                },
                {
                  label: "TODAY",
                  value: "8/10",
                  sub: "tasks done",
                  bg: "bg-lime-50 dark:bg-lime-500/10",
                  border: "border-lime-200 dark:border-lime-500/20",
                  val: "text-lime-600 dark:text-lime-300",
                },
                {
                  label: "FOCUS",
                  value: "3.5h",
                  sub: "session today",
                  bg: "bg-indigo-50 dark:bg-indigo-500/10",
                  border: "border-indigo-200 dark:border-indigo-500/20",
                  val: "text-indigo-600 dark:text-indigo-300",
                },
                {
                  label: "MONTHLY",
                  value: "87%",
                  sub: "completion rate",
                  bg: "bg-violet-50 dark:bg-violet-500/10",
                  border: "border-violet-200 dark:border-violet-500/20",
                  val: "text-violet-600 dark:text-violet-300",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`${card.bg} border ${card.border} rounded-2xl p-4 sm:p-5 card-hover float`}
                  style={{ animationDelay: `${i * 0.4}s` }}
                >
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-widest mb-2">
                    {card.label}
                  </div>
                  <div
                    className={`text-2xl sm:text-3xl font-black ${card.val} mb-1`}
                  >
                    {card.value}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {card.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Center dashboard mockup */}
            <div className="mt-4 bg-gray-900 dark:bg-black rounded-2xl border border-gray-800 dark:border-gray-900 p-4 sm:p-6 shadow-2xl float-delay">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 h-5 bg-gray-800 rounded-lg ml-2" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  {[
                    "Linear Algebra — Lecture 7",
                    "Digital Logic — K-Map Practice",
                    "C Programming — Pointers",
                  ].map((task, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 bg-gray-800/60 rounded-xl px-3 py-2.5"
                    >
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center ${i < 2 ? "bg-lime-400" : "border border-gray-600"}`}
                      >
                        {i < 2 && (
                          <span className="text-[8px] text-gray-950 font-black">
                            ✓
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs ${i < 2 ? "line-through text-gray-600" : "text-gray-300"}`}
                      >
                        {task}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-800/60 rounded-xl p-3 flex flex-col items-center justify-center">
                  <div className="text-lime-400 text-2xl font-black font-mono">
                    25:00
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    Focus Mode
                  </div>
                  <div className="mt-3 w-8 h-8 rounded-full bg-lime-400 flex items-center justify-center">
                    <span className="text-gray-950 text-xs">▶</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="bg-gray-900 py-3 overflow-hidden border-y border-gray-800">
        <div className="flex ticker gap-12 whitespace-nowrap">
          {[...Array(2)].map((_, j) => (
            <div key={j} className="flex gap-12 items-center">
              {[
                "📅 Daily Planning",
                "🎯 Pomodoro Timer",
                "📊 Progress Charts",
                "🔥 Streak Tracking",
                "📚 Subject Goals",
                "☁️ Cloud Sync",
                "🌙 Dark Mode",
                "📱 Mobile Ready",
              ].map((item, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold text-gray-400 tracking-wider uppercase flex items-center gap-2"
                >
                  {item}
                  <span className="text-gray-700">•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <section
        ref={statsRef}
        className="py-16 sm:py-20 bg-white dark:bg-gray-950"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-6 sm:gap-12 max-w-3xl mx-auto text-center">
            {[
              { value: users, suffix: "+", label: "Active Students" },
              { value: sessions, suffix: "+", label: "Focus Sessions Logged" },
              { value: hours, suffix: "+", label: "Study Hours Tracked" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="font-['Fraunces',_serif] font-black text-3xl sm:text-5xl text-gray-900 dark:text-white">
                  {stat.value.toLocaleString()}
                  {stat.suffix}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        id="features"
        className="py-16 sm:py-24 bg-gray-50 dark:bg-[#0f1117]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs font-bold text-lime-600 dark:text-lime-300 tracking-widest uppercase bg-lime-50 dark:bg-lime-400/10 border border-lime-200 dark:border-lime-400/20 px-3 py-1 rounded-full">
              Features
            </span>
            <h2 className="font-['Fraunces',_serif] font-black text-3xl sm:text-5xl text-gray-900 dark:text-white mt-4 mb-4">
              Everything You Need to{" "}
              <span className="text-lime-500">Crush Your Goals</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
              Built by students, for students. Every feature is designed to
              remove friction from your study routine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#12141c] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 card-hover group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      {/* ── ABOUT ── */}
      <section id="about" className="py-16 sm:py-20 bg-white dark:bg-[#0f1117]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Section Label */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 sm:mb-14"
          >
            <span className="text-xs font-bold text-lime-600 dark:text-lime-300 tracking-widest uppercase bg-lime-50 dark:bg-lime-400/10 border border-lime-200 dark:border-lime-400/20 px-3 py-1 rounded-full">
              About
            </span>
            <h2 className="font-['Fraunces',_serif] font-black text-3xl sm:text-5xl text-gray-900 dark:text-white mt-4 mb-3">
              Meet the <span className="text-lime-500">Builder</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
              GrindMap is built solo — by a student, for students.
            </p>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-800 rounded-[28px] overflow-hidden shadow-sm"
          >
            {/* Top Bar */}
            <div className="px-5 sm:px-8 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400">
                  GrindMap
                </span>
              </div>
              <span className="text-[10px] sm:text-xs px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">
                Founder
              </span>
            </div>

            {/* Content Area */}
            <div className="p-5 sm:p-8">
              {/* Profile Section - Stack on mobile, side-by-side on md+ */}
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                {/* Left: Photo + Name */}
                <div className="w-full md:w-auto flex flex-col items-center md:items-start">
                  {/* Profile Picture */}
                  <div className="w-40 h-40 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-2xl sm:rounded-3xl bg-gray-100 dark:bg-gray-800 overflow-hidden border-4 border-white dark:border-gray-900 shadow-lg flex-shrink-0">
                    <img
                      src="/profile1a.png"
                      alt="Kshitij Guladhe"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Name - Below image on mobile, beside on larger */}
                  <div className="mt-4 text-center md:text-left">
                    <h3 className="font-black text-2xl sm:text-3xl text-gray-900 dark:text-white leading-tight">
                      Kshitij Guladhe
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      Founder & Developer
                    </p>

                    {/* LinkedIn button - visible on mobile below name */}
                    <div className="mt-4 md:hidden">
                      <a
                        href="https://www.linkedin.com/in/kshitij-guladhe/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-sm"
                      >
                        Connect on LinkedIn
                        <span>↗</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right: Bio + Why Card */}
                <div className="flex-1 w-full">
                  {/* Bio */}
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-5">
                    Hi, I'm Kshitij. I built GrindMap because I personally
                    struggled with staying consistent during my engineering
                    studies. I tried Notion, Google Calendar, and random apps —
                    but nothing gave me that perfect mix of{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      planning, focus tracking, and real progress visualization
                    </span>
                    .
                  </p>

                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    So I decided to build exactly what I wished existed — a tool
                    that feels like a{" "}
                    <span className="text-lime-600 dark:text-lime-400 font-semibold">
                      personal study coach
                    </span>{" "}
                    rather than just another to-do list.
                  </p>

                  {/* LinkedIn button - hidden on mobile, visible on md+ */}
                  <div className="hidden md:block mb-6">
                    <a
                      href="https://www.linkedin.com/in/kshitij-guladhe/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-sm"
                    >
                      Connect on LinkedIn
                      <span>↗</span>
                    </a>
                  </div>

                  {/* Why I Built This Card */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">💡</span>
                      <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                        Why I Built GrindMap
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      I wanted to create a tool that doesn't just track tasks,
                      but actually helps you build{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        discipline through streaks
                      </span>
                      , smart planning, and beautiful analytics. My goal is to
                      help thousands of students stop feeling overwhelmed and
                      start feeling{" "}
                      <span className="text-lime-600 dark:text-lime-400 font-semibold">
                        in control
                      </span>{" "}
                      of their studies.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Stats Strip */}
              <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: "Built With",
                    value: "React + Supabase",
                    icon: "⚛️",
                  },
                  { label: "Users", value: "12,400+", icon: "👥" },
                  { label: "Focus", value: "Students", icon: "🎓" },
                  { label: "Status", value: "Active Dev", icon: "🔥" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-3.5 sm:p-4 text-center"
                  >
                    <div className="text-lg mb-1">{stat.icon}</div>
                    <div className="text-[10px] uppercase tracking-widest font-black text-gray-400 dark:text-gray-500 mb-0.5">
                      {stat.label}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bottom: Quote / Mission Card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mt-6 rounded-[28px] border border-lime-200 dark:border-lime-400/20 bg-lime-50 dark:bg-lime-400/5 p-6 sm:p-8 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-lime-400/20 flex items-center justify-center text-2xl flex-shrink-0">
                🎯
              </div>
              <div>
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-lime-700 dark:text-lime-300 mb-1">
                  The GrindMap Promise
                </div>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
                  "A calm, beautiful dashboard that pushes you forward every
                  single day — without the burnout. Consistency beats intensity,
                  always."
                </p>
                <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  — Kshitij Guladhe, Founder
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section
        id="pricing"
        className="py-16 sm:py-24 bg-gray-50 dark:bg-[#0f1117]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-violet-600 dark:text-violet-300 tracking-widest uppercase bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-400/20 px-3 py-1 rounded-full">
              Pricing
            </span>
            <h2 className="font-['Fraunces',_serif] font-black text-3xl sm:text-5xl text-gray-900 dark:text-white mt-4 mb-4">
              Simple, Honest Pricing
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
              Start free. Upgrade when you're ready. No hidden fees, cancel
              anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricing.map((plan, i) => (
              <div
                key={i}
                className={`relative bg-gradient-to-b ${plan.color} border ${plan.border} rounded-2xl p-6 sm:p-7 card-hover ${
                  i === 1
                    ? "ring-2 ring-lime-400 shadow-xl dark:shadow-none"
                    : ""
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lime-400 text-gray-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="font-black text-gray-900 dark:text-white text-lg mb-1">
                    {plan.tier}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-['Fraunces',_serif] font-black text-4xl text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/register")}
                  className={`w-full py-3 rounded-xl text-sm font-bold ${plan.ctaStyle} transition-all mb-6 active:scale-95`}
                >
                  {plan.cta}
                </button>

                <div className="space-y-2.5">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-lime-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[8px] text-gray-950 font-black">
                          ✓
                        </span>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {f}
                      </span>
                    </div>
                  ))}
                  {plan.missing.map((f, j) => (
                    <div
                      key={j}
                      className="flex items-start gap-2.5 opacity-40"
                    >
                      <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[8px] text-white font-black">
                          ✕
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-500 line-through">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
            Need a plan for your school or institution?{" "}
            <a
              href="#contact"
              className="text-indigo-500 font-semibold hover:underline"
            >
              Contact us for Enterprise pricing →
            </a>
          </p>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 sm:py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-['Fraunces',_serif] font-black text-3xl sm:text-4xl text-gray-900 dark:text-white mb-4">
              Students Love GrindMap
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-[#12141c] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 card-hover"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white text-sm">
                      {t.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t.role}
                    </div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xs">
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  "{t.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 sm:py-20 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-['Fraunces',_serif] font-black text-3xl sm:text-5xl text-white mb-4">
            Ready to Start <span className="text-lime-400">Grinding?</span>
          </h2>
          <p className="text-gray-400 mb-8 text-sm sm:text-base">
            Join 12,400+ students who track their study progress with GrindMap.
            Free to start, no credit card needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 bg-lime-400 text-gray-950 font-black rounded-xl hover:bg-lime-300 active:bg-lime-500 transition-all shadow-lg shadow-lime-400/20 text-sm"
            >
              Get Started Free →
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 border border-gray-700 text-white font-semibold rounded-xl hover:bg-gray-800 active:bg-gray-700 transition-all text-sm"
            >
              Log In
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        id="contact"
        className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <div className="mb-3">
                <GrindMapLogo size="small" />
              </div>
              <p className="text-xs text-gray-400 leading-relaxed max-w-[200px]">
                The study tracker for serious students. Built with ❤️ for
                learners worldwide.
              </p>
            </div>
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Changelog", "Roadmap"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Press"],
              },
              {
                title: "Support",
                links: ["Help Center", "Contact", "Privacy Policy", "Terms"],
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3">
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              © 2026 GrindMap. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Made for students, by students 🎓
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
