import { useState } from "react";
import { motion } from "motion/react";
import { MousePointer, Hand, ArrowDownUp, ZoomIn, RefreshCw, CheckCircle2 } from "lucide-react";
import { Card, Toggle, GhostButton } from "./shared";

const gestures = [
  { icon: <MousePointer size={20} />, name: "Cursor Move", hint: "Open palm, slow drift" },
  { icon: <Hand size={20} />,         name: "Click",       hint: "Pinch thumb to index" },
  { icon: <ArrowDownUp size={20} />,  name: "Scroll",      hint: "Two fingers up/down" },
  { icon: <ZoomIn size={20} />,       name: "Zoom",        hint: "Spread or pinch fingers" },
];

export function EyeTracking() {
  const [eye, setEye]       = useState(true);
  const [gesture, setGesture] = useState(true);
  const [auto, setAuto]     = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6">
      <div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(20px,4vw,28px)", fontWeight: 600 }} className="text-neutral-900 dark:text-white">
          Smart Control Center
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1" style={{ fontSize: 14 }}>Non-invasive navigation · powered by AI</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-6">

        {/* Live gaze */}
        <Card className="p-5">
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600 }} className="text-neutral-900 dark:text-white mb-3">Live gaze</h3>
          <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-neutral-900">
            <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-transparent to-accent/10" />
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-9 opacity-10">
              {[...Array(108)].map((_, i) => <div key={i} className="border border-white/30" />)}
            </div>
            <motion.div
              className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full bg-accent/30 backdrop-blur-sm"
              animate={{ left: ["30%","65%","55%","40%","30%"], top: ["40%","30%","60%","55%","40%"] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-accent shadow-[0_0_20px_#1D9E75]" />
            </motion.div>
            <div className="absolute bottom-3 left-3 right-3 flex justify-between text-white/70 text-xs font-mono">
              <span>gaze: x 0.62, y 0.34</span>
              <span>30 fps</span>
            </div>
          </div>
          <p className="text-neutral-400 dark:text-neutral-500 mt-3 text-xs leading-relaxed">
            Look at any UI element. Confirm with a pinch gesture.
          </p>
        </Card>

        {/* Gesture guide */}
        <Card className="p-5">
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600 }} className="text-neutral-900 dark:text-white mb-3">Gesture guide</h3>
          <div className="grid grid-cols-2 gap-3">
            {gestures.map((g, i) => (
              <motion.div
                key={g.name}
                whileHover={{ y: -2 }}
                className="p-4 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/3 hover:border-accent/40 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-primary dark:text-accent flex items-center justify-center">
                  {g.icon}
                </div>
                <div className="mt-3 text-neutral-800 dark:text-white font-semibold text-sm">{g.name}</div>
                <div className="text-neutral-500 dark:text-neutral-400 mt-0.5 text-xs">{g.hint}</div>
                <motion.div className="mt-2 h-1 rounded-full bg-accent/15 overflow-hidden" initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}>
                  <motion.div className="h-full bg-accent" animate={{ width: ["0%","100%","0%"] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }} />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Calibration */}
        <Card className="p-5 flex flex-col">
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600 }} className="text-neutral-900 dark:text-white">Calibration</h3>
          <div className="mt-4 p-4 rounded-2xl bg-accent/8 border border-accent/25">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-accent" />
              <span className="text-primary dark:text-accent font-semibold text-sm">Calibration accurate</span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 32, fontWeight: 600 }} className="text-neutral-900 dark:text-white">92</span>
              <span className="text-neutral-500 text-sm">% accuracy</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-neutral-200 dark:bg-white/10 overflow-hidden">
              <motion.div className="h-full bg-linear-to-r from-accent to-primary" initial={{ width: 0 }} animate={{ width: "92%" }} transition={{ duration: 1.2 }} />
            </div>
          </div>
          <GhostButton className="mt-3 w-full">
            <span className="inline-flex items-center justify-center gap-2 w-full"><RefreshCw size={14} /> Recalibrate</span>
          </GhostButton>

          <div className="mt-6 space-y-4">
            {[
              { label: "Eye tracking",       value: eye,     setter: setEye },
              { label: "Gesture recognition", value: gesture, setter: setGesture },
              { label: "Auto-sensitivity",   value: auto,    setter: setAuto },
            ].map(({ label, value, setter }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-neutral-700 dark:text-neutral-200 text-sm">{label}</span>
                <Toggle on={value} onChange={setter} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
