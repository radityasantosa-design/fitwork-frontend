import { motion } from "motion/react";
import { Lock, Mail, ShieldCheck, Eye } from "lucide-react";
import { Logo, PrimaryButton } from "./shared";

export function Login({ onEnter }) {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-bg-light dark:bg-bg-dark">
      <div className="relative hidden lg:flex items-center justify-center bg-linear-to-br from-primary via-primary-hover to-accent overflow-hidden p-12">
        <div className="absolute inset-0 opacity-30">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-white/40"
              style={{ width: 120 + i * 60, height: 120 + i * 60, left: "50%", top: "50%", marginLeft: -(60 + i * 30), marginTop: -(60 + i * 30) }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>
        <div className="relative z-10 text-white max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center mb-6 border border-white/20">
            <Eye size={36} className="text-white" />
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 36, fontWeight: 700, lineHeight: 1.15 }}>
            Your intelligent work companion.
          </h1>
          <p className="mt-4 text-white/80" style={{ fontSize: 15, lineHeight: 1.6 }}>
            FitWork blends AI eye-tracking, gesture control, and real-time health analysis to help remote workers stay focused, healthy, and balanced.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {["Focus", "Wellness", "Insights"].map((t) => (
              <div key={t} className="rounded-xl bg-white/10 backdrop-blur border border-white/15 px-3 py-2.5 text-center" style={{ fontSize: 13 }}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Logo size={32} />
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 600 }} className="mt-8 text-neutral-900 dark:text-white">
            Welcome back
          </h2>
          <p className="text-neutral-500 mt-1" style={{ fontSize: 14 }}>Work Smart. Stay Well.</p>

          <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); onEnter(); }}>
            <div>
              <label style={{ fontSize: 13 }} className="text-neutral-600 dark:text-neutral-300">Email</label>
              <div className="mt-1.5 relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  defaultValue="raditya.santosa@fitwork.io"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-surface-dark text-neutral-900 dark:text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  style={{ fontSize: 14 }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13 }} className="text-neutral-600 dark:text-neutral-300">Password</label>
              <div className="mt-1.5 relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  defaultValue="••••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-surface-dark text-neutral-900 dark:text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  style={{ fontSize: 14 }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between" style={{ fontSize: 13 }}>
              <label className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                <input type="checkbox" defaultChecked className="accent-accent" /> Remember me
              </label>
              <a className="text-primary dark:text-accent hover:underline">Forgot password?</a>
            </div>

            <PrimaryButton className="w-full">Sign in</PrimaryButton>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200 dark:border-white/10" /></div>
              <div className="relative flex justify-center"><span className="px-3 bg-bg-light dark:bg-bg-dark text-neutral-400" style={{ fontSize: 12 }}>OR</span></div>
            </div>

            <button type="button" onClick={onEnter} className="w-full py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-surface-dark hover:bg-neutral-50 dark:hover:bg-white/5 flex items-center justify-center gap-2.5 text-neutral-700 dark:text-neutral-200" style={{ fontSize: 14, fontWeight: 500 }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
              Continue with Google
            </button>
          </form>

          <div className="mt-8 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-accent/10 text-primary dark:text-accent border border-accent/20" style={{ fontSize: 12 }}>
            <ShieldCheck size={14} /> Your data is private & encrypted end-to-end.
          </div>
        </div>
      </div>
    </div>
  );
}
