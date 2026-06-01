import { useEffect, useState } from "react";
import { LayoutDashboard, HeartPulse, Lightbulb, Eye, Settings as SettingsIcon, Bell, Sun, Moon, Menu, X, Smartphone, Palette, HelpCircle, LogIn } from "lucide-react";
import { Logo } from "./components/shared";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { HealthMonitoring } from "./components/HealthMonitoring";
import { Recommendations } from "./components/Recommendations";
import { EyeTracking } from "./components/EyeTracking";
import { Settings } from "./components/Settings";
import { BreakModal } from "./components/BreakModal";
import { DesignTokens } from "./components/DesignTokens";
import { MobilePreview } from "./components/MobilePreview";
import { Onboarding } from "./components/Onboarding";

const nav = [
  { id: "dashboard",       label: "Dashboard",       icon: LayoutDashboard },
  { id: "health",          label: "Health Monitor",  icon: HeartPulse },
  { id: "recommendations", label: "Recommendations", icon: Lightbulb },
  { id: "eye",             label: "Eye & Gesture",   icon: Eye },
  { id: "mobile",          label: "Mobile (390px)",  icon: Smartphone },
  { id: "tokens",          label: "Design Tokens",   icon: Palette },
  { id: "settings",        label: "Settings",        icon: SettingsIcon },
];

export default function App() {
  const [screen, setScreen]               = useState("dashboard");
  const [dark, setDark]                   = useState(false);
  const [breakOpen, setBreakOpen]         = useState(false);
  const [breakKey, setBreakKey]           = useState(0);
  const [mobileNav, setMobileNav]         = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showLogin, setShowLogin]         = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const openBreak = () => { setBreakKey((k) => k + 1); setBreakOpen(true); };

  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-bg-dark text-neutral-900 dark:text-white transition-colors duration-200" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex min-h-screen">

        {/* ── Sidebar (desktop) ──────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-neutral-200 dark:border-white/5 bg-white dark:bg-surface-dark sticky top-0 h-screen shadow-sm dark:shadow-none">
          <div className="px-5 py-5 border-b border-neutral-100 dark:border-white/5">
            <Logo />
          </div>

          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {nav.map((n) => {
              const Icon = n.icon;
              const active = screen === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setScreen(n.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all active:scale-[0.98]
                    ${active
                      ? "bg-primary/10 text-primary font-semibold dark:bg-accent/15 dark:text-accent"
                      : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-800 dark:hover:text-white"
                    }`}
                  style={{ fontSize: 14 }}
                >
                  <Icon size={18} strokeWidth={active ? 2 : 1.75} />
                  {n.label}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-neutral-100 dark:border-white/5">
            <div className="rounded-2xl p-3.5 bg-linear-to-br from-primary to-accent text-white">
              <div style={{ fontSize: 13, fontWeight: 600 }}>Wellness coach</div>
              <p className="mt-1 text-white/80" style={{ fontSize: 12, lineHeight: 1.5 }}>Want a 1:1 weekly check-in? Pair FitWork with a coach.</p>
              <button className="mt-3 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 active:scale-95 text-white transition" style={{ fontSize: 12, fontWeight: 600 }}>Learn more</button>
            </div>
          </div>
        </aside>

        {/* ── Main content ───────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Header */}
          <header className="sticky top-0 z-30 bg-white dark:bg-surface-dark border-b border-neutral-200 dark:border-white/5 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between px-4 lg:px-6 h-14 lg:h-16">

              {/* Left */}
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-800 dark:hover:text-white active:scale-95 transition"
                  onClick={() => setMobileNav(!mobileNav)}
                  aria-label="Menu"
                >
                  {mobileNav ? <X size={20} /> : <Menu size={20} />}
                </button>
                <div className="lg:hidden"><Logo /></div>
                <h2 className="hidden lg:block text-neutral-700 dark:text-neutral-200" style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600 }}>
                  {nav.find((n) => n.id === screen)?.label}
                </h2>
              </div>

              {/* Right */}
              <div className="flex items-center gap-1.5">
                {screen === "dashboard" && (
                  <button
                    onClick={() => setShowOnboarding(true)}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-primary dark:text-accent hover:bg-primary/10 dark:hover:bg-accent/10 transition text-sm font-medium"
                  >
                    <HelpCircle size={14} /> Tour
                  </button>
                )}
                <button
                  onClick={() => setDark(!dark)}
                  className="w-9 h-9 rounded-lg text-neutral-500 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-neutral-800 dark:hover:text-white flex items-center justify-center transition"
                  aria-label="Toggle theme"
                >
                  {dark ? <Sun size={17} /> : <Moon size={17} />}
                </button>
                <button className="relative w-9 h-9 rounded-lg text-neutral-500 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-neutral-800 dark:hover:text-white flex items-center justify-center transition">
                  <Bell size={17} />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-danger ring-2 ring-white dark:ring-surface-dark" />
                </button>
                <button
                  onClick={() => setShowLogin(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-sm font-semibold transition-all active:scale-95 ml-1"
                >
                  <LogIn size={14} />
                  <span className="hidden sm:inline">Login</span>
                </button>
              </div>
            </div>

          </header>

          {/* Mobile nav drawer — slide-in panel + backdrop */}
          <div className={`lg:hidden fixed inset-0 z-50 ${mobileNav ? "" : "pointer-events-none"}`}>
            {/* Backdrop */}
            <div
              onClick={() => setMobileNav(false)}
              className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${mobileNav ? "opacity-100" : "opacity-0"}`}
            />
            {/* Panel */}
            <aside
              className={`absolute top-0 left-0 h-full w-72 max-w-[82%] bg-white dark:bg-surface-dark border-r border-neutral-200 dark:border-white/5 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}
            >
              <div className="flex items-center justify-between px-5 h-14 border-b border-neutral-100 dark:border-white/5">
                <Logo />
                <button
                  onClick={() => setMobileNav(false)}
                  className="w-9 h-9 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-800 dark:hover:text-white flex items-center justify-center active:scale-95 transition"
                  aria-label="Tutup menu"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {nav.map((n) => {
                  const Icon = n.icon;
                  const active = screen === n.id;
                  return (
                    <button
                      key={n.id}
                      onClick={() => { setScreen(n.id); setMobileNav(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all active:scale-[0.98]
                        ${active
                          ? "bg-primary/10 text-primary font-semibold dark:bg-accent/15 dark:text-accent"
                          : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-800 dark:hover:text-white"
                        }`}
                      style={{ fontSize: 14 }}
                    >
                      <Icon size={18} strokeWidth={active ? 2 : 1.75} /> {n.label}
                    </button>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-neutral-100 dark:border-white/5">
                <div className="rounded-2xl p-3.5 bg-linear-to-br from-primary to-accent text-white">
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Wellness coach</div>
                  <p className="mt-1 text-white/80" style={{ fontSize: 12, lineHeight: 1.5 }}>Pair FitWork with a 1:1 weekly check-in.</p>
                </div>
              </div>
            </aside>
          </div>

          {/* Page content */}
          <main className="flex-1">
            {screen === "dashboard"       && <Dashboard onTriggerBreak={openBreak} />}
            {screen === "health"          && <HealthMonitoring />}
            {screen === "recommendations" && <Recommendations />}
            {screen === "eye"             && <EyeTracking />}
            {screen === "mobile"          && <MobilePreview />}
            {screen === "tokens"          && <DesignTokens />}
            {screen === "settings"        && <Settings />}
          </main>
        </div>
      </div>

      {screen === "dashboard" && showOnboarding && (
        <Onboarding onClose={() => setShowOnboarding(false)} />
      )}

      <BreakModal key={breakKey} open={breakOpen} onClose={() => setBreakOpen(false)} />

      {/* Login modal overlay */}
      {showLogin && (
        <div className="fixed inset-0 z-100">
          <button
            onClick={() => setShowLogin(false)}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-black/20 hover:bg-black/30 backdrop-blur flex items-center justify-center text-white transition"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
          <Login onEnter={() => setShowLogin(false)} />
        </div>
      )}
    </div>
  );
}
