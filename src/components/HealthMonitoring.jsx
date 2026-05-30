import { motion } from "motion/react";
import { Heart, Eye, Zap } from "lucide-react";
import { Card, GaugeRing, StatusPill, TimelineItem } from "./shared";

const events = [
  { time: "2:30 PM", text: "Stress spike detected — heart rate variability dropped", type: "critical" },
  { time: "2:15 PM", text: "Eye strain warning — blink rate below normal",            type: "warning" },
  { time: "1:50 PM", text: "Posture realigned — good",                                type: "info" },
  { time: "1:20 PM", text: "Hydration reminder accepted",                             type: "info" },
  { time: "12:45 PM", text: "Focus session: 45 min sustained attention",              type: "info" },
  { time: "12:00 PM", text: "Pupil dilation increased — cognitive load high",         type: "warning" },
];

function FaceMesh() {
  const points = [
    [40,35],[60,35],[38,40],[62,40],[42,38],[58,38],
    [50,50],[48,55],[52,55],
    [42,65],[50,67],[58,65],
    [35,45],[65,45],[50,30],[50,70],
  ];
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {points.map((p, i) => (
        <motion.circle key={i} cx={p[0]} cy={p[1]} r="0.6" fill="#1D9E75"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.05 }}
        />
      ))}
      {points.slice(0, -2).map((p, i) => {
        const next = points[(i + 1) % points.length];
        return <line key={`l${i}`} x1={p[0]} y1={p[1]} x2={next[0]} y2={next[1]} stroke="#1D9E75" strokeWidth="0.15" opacity="0.5" />;
      })}
    </svg>
  );
}

export function HealthMonitoring() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(20px,4vw,28px)", fontWeight: 600 }} className="text-neutral-900 dark:text-white">
            Health Monitoring
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1" style={{ fontSize: 14 }}>Real-time analysis · Session 02:14:38</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status="normal"  label="Normal" />
          <StatusPill status="warning" label="Caution: eye strain" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-6">

        {/* Camera feed */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600 }} className="text-neutral-900 dark:text-white">Camera feed</h3>
            <span className="inline-flex items-center gap-1.5 text-accent text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> rPPG
            </span>
          </div>
          <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-neutral-900">
            <div className="absolute inset-0 bg-linear-to-br from-primary/30 via-transparent to-accent/20" />
            <FaceMesh />
            <div className="absolute top-3 left-3">
              <span className="px-2 py-0.5 rounded-md bg-black/50 text-white text-xs font-mono">1080p · 30fps</span>
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <div className="text-white/70 mb-1.5 flex justify-between text-xs font-mono">
                <span>PERCLOS</span><span>0.18 / 0.40</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                <motion.div className="h-full bg-accent" initial={{ width: 0 }} animate={{ width: "45%" }} transition={{ duration: 1 }} />
              </div>
            </div>
          </div>
          <p className="text-neutral-400 dark:text-neutral-500 mt-3 text-xs leading-relaxed">
            Facial landmarks tracked locally. No video leaves your device.
          </p>
        </Card>

        {/* Live vitals */}
        <Card className="p-5">
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600 }} className="text-neutral-900 dark:text-white mb-5">Live vitals</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center"><Heart size={18} /></div>
                <div>
                  <div className="text-neutral-600 dark:text-neutral-400 text-sm">Heart Rate (rPPG)</div>
                  <div className="text-neutral-400 text-xs">Resting baseline 68</div>
                </div>
              </div>
              <GaugeRing value={72} max={140} size={88} unit="bpm" status="normal" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center"><Eye size={18} /></div>
                <div>
                  <div className="text-neutral-600 dark:text-neutral-400 text-sm">Pupil Dilation</div>
                  <div className="text-neutral-400 text-xs">Cognitive load index</div>
                </div>
              </div>
              <GaugeRing value={64} size={88} status="warning" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center"><Zap size={18} /></div>
                <div>
                  <div className="text-neutral-600 dark:text-neutral-400 text-sm">Fatigue Score</div>
                  <div className="text-neutral-400 text-xs">Rising in last 20 min</div>
                </div>
              </div>
              <GaugeRing value={38} size={88} status="warning" />
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-5">
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600 }} className="text-neutral-900 dark:text-white mb-3">Timeline</h3>
          <div className="overflow-y-auto max-h-96 pr-1">
            {events.map((e, i) => <TimelineItem key={i} {...e} />)}
          </div>
        </Card>
      </div>
    </div>
  );
}
