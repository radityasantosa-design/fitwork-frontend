import { useEffect, useState } from "react";
import { LayoutDashboard, HeartPulse, Lightbulb, Eye, Settings as SettingsIcon, Bell, Sun, Moon, Menu, X, Smartphone, Palette, HelpCircle } from "lucide-react";
import { Logo, Avatar } from "./components/shared";
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
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "health", label: "Health Monitor", icon: HeartPulse },
  { id: "recommendations", label: "Recommendations", icon: Lightbulb },
  { id: "eye", label: "Eye & Gesture", icon: Eye },
  { id: "mobile", label: "Mobile (390px)", icon: Smartphone },
  { id: "tokens", label: "Design Tokens", icon: Palette },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [screen, setScreen] = useState("dashboard");
  const [dark, setDark] = useState(false);
  const [breakOpen, setBreakOpen] = useState(false);
  const [breakKey, setBreakKey] = useState(0);
  const [mobileNav, setMobileNav] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  if (!authed) {
    return (
      <div className={dark ? "dark" : ""}>
        <Login onEnter={() => setAuthed(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-bg-light dark:bg-bg-dark text-neutral-900 dark:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex flex-col w-64 border-r border-neutral-200/70 dark:border-white/5 bg-white/60 dark:bg-surface-dark/60 backdrop-blur sticky top-0 h-screen">
          <div className="px-5 py-5 border-b border-neutral-200/70 dark:border-white/5">
            <Logo />
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {nav.map((n) => {
              const Icon = n.icon;
              const active = screen === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setScreen(n.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-[0.98] ${active ? "bg-accent/12 text-primary dark:text-accent" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 hover:translate-x-0.5"}`}
                  style={{ fontSize: 14, fontWeight: active ? 600 : 500 }}
                >
                  <Icon size={18} strokeWidth={1.75} />
                  {n.label}
                </button>
              );
            })}
          </nav>
          <div className="p-3 border-t border-neutral-200/70 dark:border-white/5">
            <div className="rounded-2xl p-3.5 bg-linear-to-br from-primary to-accent text-white">
              <div style={{ fontSize: 13, fontWeight: 600 }}>Wellness coach</div>
              <p className="mt-1 text-white/85" style={{ fontSize: 12, lineHeight: 1.5 }}>Want a 1:1 weekly check-in? Pair FitWork with a coach.</p>
              <button className="mt-3 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 active:scale-95 text-white transition" style={{ fontSize: 12, fontWeight: 600 }}>Learn more</button>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 bg-white/70 dark:bg-bg-dark/70 backdrop-blur border-b border-neutral-200/70 dark:border-white/5">
            <div className="flex items-center justify-between px-4 lg:px-8 h-16">
              <div className="flex items-center gap-3">
                <button className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 active:scale-95 transition" onClick={() => setMobileNav(!mobileNav)}>
                  {mobileNav ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
                </button>
                <div className="lg:hidden"><Logo /></div>
                <h2 className="hidden lg:block text-neutral-700 dark:text-neutral-200" style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600 }}>
                  {nav.find((n) => n.id === screen)?.label}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {screen === "dashboard" && (
                  <button onClick={() => setShowOnboarding(true)} className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-primary dark:text-accent hover:bg-accent/10 active:scale-95 transition" style={{ fontSize: 12.5, fontWeight: 500 }}>
                    <HelpCircle size={14} strokeWidth={1.75} /> Tour
                  </button>
                )}
                <button onClick={() => setDark(!dark)} className="w-9 h-9 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 active:scale-90 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition" aria-label="Theme">
                  {dark ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
                </button>
                <button className="relative w-9 h-9 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 active:scale-90 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition">
                  <Bell size={16} strokeWidth={1.75} />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger" />
                </button>
                <Avatar />
              </div>
            </div>
            {mobileNav && (
              <div className="lg:hidden border-t border-neutral-200/70 dark:border-white/5 p-3 space-y-1 bg-white dark:bg-surface-dark">
                {nav.map((n) => {
                  const Icon = n.icon;
                  const active = screen === n.id;
                  return (
                    <button
                      key={n.id}
                      onClick={() => { setScreen(n.id); setMobileNav(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl active:scale-[0.98] transition ${active ? "bg-accent/12 text-primary dark:text-accent" : "text-neutral-600 dark:text-neutral-300"}`}
                      style={{ fontSize: 14 }}
                    >
                      <Icon size={18} strokeWidth={1.75} /> {n.label}
                    </button>
                  );
                })}
              </div>
            )}
          </header>

          <main className="relative">
            {screen === "dashboard" && <Dashboard onTriggerBreak={() => { setBreakKey((k) => k + 1); setBreakOpen(true); }} />}
            {screen === "health" && <HealthMonitoring />}
            {screen === "recommendations" && <Recommendations />}
            {screen === "eye" && <EyeTracking />}
            {screen === "mobile" && <MobilePreview />}
            {screen === "tokens" && <DesignTokens />}
            {screen === "settings" && <Settings />}
          </main>
        </div>
      </div>

      {screen === "dashboard" && showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}
      <BreakModal key={breakKey} open={breakOpen} onClose={() => setBreakOpen(false)} />
    </div>
  );
}
