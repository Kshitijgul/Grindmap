import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-lime-400 rounded-lg flex items-center justify-center">
                <span className="text-gray-950 font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-lg">
                <span className="text-white">GRIND</span>{' '}
                <span className="text-lime-400">MAP</span>
              </span>
            </Link>

            {/* Nav Buttons */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-gray-700 rounded-lg hover:border-gray-600 transition"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-gray-950 bg-lime-400 rounded-lg hover:bg-lime-300 transition"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <p className="text-lime-400 text-sm font-semibold tracking-wide">
              — STUDY OS FOR SERIOUS LEARNERS
            </p>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Map your{' '}
              <span className="text-lime-400">grind.</span>
              <br />
              Own the outcome.
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Track sessions, build streaks, and see every hour compound into real progress.
              Built for students who don't just study — they execute.
            </p>

            {/* Features List */}
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-lime-400 rounded-full"></span>
                Task planner with deadlines and priorities
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-lime-400 rounded-full"></span>
                Daily, weekly, monthly progress views
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-lime-400 rounded-full"></span>
                Streak system to keep momentum alive
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-lime-400 rounded-full"></span>
                Visual heatmap of your study activity
              </li>
            </ul>

            {/* Stats */}
            <div className="pt-8 border-t border-gray-800">
              <div className="flex gap-8">
                <div>
                  <p className="text-2xl font-bold text-white">48K+</p>
                  <p className="text-gray-500 text-sm">Students</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">2.1M</p>
                  <p className="text-gray-500 text-sm">Sessions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">94%</p>
                  <p className="text-gray-500 text-sm">Goal rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Auth Card */}
          <div className="flex justify-center lg:justify-end">
            {/* <AuthCard /> */}
          </div>
        </div>

        {/* Feature Sections */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 pt-16 border-t border-gray-800">
          <div className="space-y-3">
            <h3 className="text-white font-semibold">Fast onboarding</h3>
            <p className="text-gray-400 text-sm">
              Sign up in seconds with email. Your study plan is ready before you close the tab.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-white font-semibold">Personal dashboard</h3>
            <p className="text-gray-400 text-sm">
              After login, see your streak, today's tasks, and progress across every subject you're tracking.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-white font-semibold">Works everywhere</h3>
            <p className="text-gray-400 text-sm">
              Designed to look sharp on any device. Track your grind on desktop, tablet, or mobile.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-500 text-sm text-center">
            © 2026 GrindMap. Built for students who execute.
          </p>
        </div>
      </footer>
    </div>
  );
}

function AuthCard() {
  return (
    <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button className="flex-1 py-4 text-sm font-medium text-lime-400 border-b-2 border-lime-400 bg-gray-800/50">
          Log in
        </button>
        <button className="flex-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-300">
          Create account
        </button>
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-4">
        {/* Social Buttons (Disabled) */}
        <div className="grid grid-cols-2 gap-3">
          <button className="py-2.5 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 text-sm font-medium flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            </svg>
            Google
          </button>
          <button className="py-2.5 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 text-sm font-medium flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-6.225 0-1.38.45-2.535 1.185-3.435.225.585.99 1.005 1.98 1.005 1.395 0 2.58-.465 3.465-1.155.09.675.285 1.29.57 1.845-3.375.15-6.285-1.74-6.285-4.845 0-1.065.3-2.07.825-2.925 1.545 1.905 3.855 3.15 6.435 3.285-.075-.345-.15-.705-.15-1.08 0-2.61 2.115-4.725 4.725-4.725 1.365 0 2.595.57 3.465 1.485 1.08-.21 2.085-.6 3.015-1.155-.36 1.11-1.11 2.04-2.085 2.64.96-.105 1.875-.36 2.745-.72-.63.945-1.44 1.77-2.355 2.415z"/>
            </svg>
            GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-gray-900 text-gray-500">or continue with email</span>
          </div>
        </div>

        {/* Email Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">EMAIL</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">PASSWORD</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
            />
          </div>

          <Link
            to="/login"
            className="block w-full py-3 bg-lime-400 hover:bg-lime-300 text-gray-950 font-semibold rounded-lg text-center transition"
          >
            Log in to GrindMap
          </Link>

          <p className="text-center text-sm text-gray-500">
            No account?{' '}
            <Link to="/register" className="text-lime-400 hover:underline">
              Create one free
            </Link>
          </p>
        </div>

        {/* Info Box */}
        <div className="pt-4 mt-4 border-t border-gray-800">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-lime-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lime-400">★</span>
            </div>
            <div>
              <p className="text-sm text-gray-400">
                Once logged in, you'll see your <span className="text-lime-400">study dashboard</span> —
                streaks, heatmap, and today's plan.
              </p>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-500">Streak tracker</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-500">Progress heatmap</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-500">Goal setting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
