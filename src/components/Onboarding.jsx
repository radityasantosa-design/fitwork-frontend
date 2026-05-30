import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, X } from "lucide-react";

const steps = [
  {
    title: "Your daily focus score",
    body: "We calculate this from your eye-tracking data, heart-rate variability, and active work hours. Aim for 80+.",
    target: { top: "100px", left: "32px", width: "320px" },
    arrow: "top",
  },
  {
    title: "Live wellness metrics",
    body: "Tap any card to drill into the underlying signals. Cards turn amber when a metric drifts out of range.",
    target: { top: "260px", left: "32px", width: "calc(100% - 64px)" },
    arrow: "top",
  },
  {
    title: "AI insights, every 30 min",
    body: "Personalized nudges based on patterns from the last hour. Tap to dismiss or schedule.",
    target: { top: "440px", right: "32px", width: "340px" },
    arrow: "right",
  },
  {
    title: "Live session bar",
    body: "Always shows what FitWork is sensing. A green dot means data is flowing; red means a check is needed.",
    target: { bottom: "32px", left: "32px", width: "calc(100% - 64px)" },
    arrow: "bottom",
  },
];

export function Onboarding({ onClose }) {
  const [step, setStep] = useState(0);
  const s = steps[step];

  return (
    <AnimatePresence>
      <motion.div
        key="onboarding-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] pointer-events-auto"
      />
      <motion.div
        key={`tip-${step}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="fixed z-50"
        style={s.target}
      >
        <div className="relative rounded-2xl bg-white dark:bg-surface-dark border border-accent/30 shadow-2xl p-5 max-w-sm">
          <div className="flex items-start justify-between">
            <span className="px-2 py-0.5 rounded-md bg-accent/15 text-primary dark:text-accent" style={{ fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
              {step + 1} / {steps.length}
            </span>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white">
              <X size={16} />
            </button>
          </div>
          <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 600 }} className="text-neutral-900 dark:text-white mt-3">
            {s.title}
          </h4>
          <p className="text-neutral-500 mt-1.5" style={{ fontSize: 13.5, lineHeight: 1.55 }}>{s.body}</p>
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-accent" : "w-1.5 bg-neutral-300 dark:bg-white/15"}`} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-white" style={{ fontSize: 12.5 }}>
                Skip
              </button>
              <button
                onClick={() => (step === steps.length - 1 ? onClose() : setStep(step + 1))}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover active:bg-primary-active text-white transition"
                style={{ fontSize: 12.5, fontWeight: 600 }}
              >
                {step === steps.length - 1 ? "Got it" : "Next"} {step !== steps.length - 1 && <ArrowRight size={12} />}
              </button>
            </div>
          </div>
          <span className="absolute -top-1.5 left-10 w-3 h-3 rotate-45 bg-white dark:bg-surface-dark border-l border-t border-accent/30" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
