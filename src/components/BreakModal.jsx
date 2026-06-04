import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Eye, Activity, Footprints, X } from "lucide-react";
import { PrimaryButton, GhostButton } from "./shared";
import { useT } from "../i18n/LanguageProvider";

const options = [
  { icon: <Eye size={20} />, titleKey: "breakModal.optEyeTitle", descKey: "breakModal.optEyeDesc" },
  { icon: <Activity size={20} />, titleKey: "breakModal.optStretchTitle", descKey: "breakModal.optStretchDesc" },
  { icon: <Footprints size={20} />, titleKey: "breakModal.optWalkTitle", descKey: "breakModal.optWalkDesc" },
];

export function BreakModal({ open, onClose }) {
  const { t } = useT();
  const [selected, setSelected] = useState(0);
  const [seconds, setSeconds] = useState(300);

  useEffect(() => {
    if (!open) return;
    const i = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(i);
  }, [open]);

  const pct = seconds / 300;
  const r = 22;
  const c = 2 * Math.PI * r;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-surface-dark p-8 shadow-2xl border border-white/10"
          >
            <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 flex items-center justify-center text-neutral-500"><X size={16} /></button>

            <div className="absolute top-5 right-16 flex items-center gap-2">
              <svg width="48" height="48" viewBox="0 0 56 56" className="-rotate-90">
                <circle cx="28" cy="28" r={r} stroke="#eee" strokeWidth="4" fill="none" className="dark:stroke-white/10" />
                <motion.circle cx="28" cy="28" r={r} stroke="#BA7517" strokeWidth="4" fill="none" strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - pct) }} strokeLinecap="round" />
              </svg>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }} className="text-neutral-600 dark:text-neutral-300">
                {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
              </span>
            </div>

            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-20 h-20 rounded-3xl bg-linear-to-br from-warning/20 to-warning/5 border border-warning/30 flex items-center justify-center text-warning"
              >
                <Clock size={40} />
              </motion.div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 600 }} className="text-neutral-900 dark:text-white mt-5">
                {t("breakModal.title")}
              </h2>
              <p className="text-neutral-500 mt-2 max-w-sm" style={{ fontSize: 14, lineHeight: 1.6 }}>
                {t("breakModal.body")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7">
              {options.map((o, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`text-left p-4 rounded-2xl border transition-all ${selected === i ? "border-primary bg-accent/8 ring-2 ring-accent/20" : "border-neutral-200 dark:border-white/10 hover:border-accent/40"}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${selected === i ? "bg-primary text-white" : "bg-accent/10 text-primary dark:text-accent"}`}>
                    {o.icon}
                  </div>
                  <div className="text-neutral-900 dark:text-white" style={{ fontSize: 14, fontWeight: 600 }}>{t(o.titleKey)}</div>
                  <div className="text-neutral-500 mt-0.5" style={{ fontSize: 12, lineHeight: 1.5 }}>{t(o.descKey)}</div>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              <PrimaryButton onClick={onClose} className="flex-1">{t("breakModal.startNow")}</PrimaryButton>
              <GhostButton onClick={onClose} className="flex-1">{t("breakModal.remind5")}</GhostButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
