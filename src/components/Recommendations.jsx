import { useState } from "react";
import { Brain, Dumbbell, Apple, Moon, Share2, Download } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Card, PrimaryButton, GhostButton } from "./shared";

const tabs = [
  { id: "mental", label: "Mental", icon: <Brain size={16} /> },
  { id: "physical", label: "Physical", icon: <Dumbbell size={16} /> },
  { id: "nutrition", label: "Nutrition", icon: <Apple size={16} /> },
  { id: "sleep", label: "Sleep", icon: <Moon size={16} /> },
];

const recs = {
  mental: [
    { title: "5-min box breathing", desc: "Reduces cortisol and resets focus.", impact: "+12% focus" },
    { title: "Single-task block", desc: "Mute notifications for 45 min.", impact: "+18% output" },
    { title: "Brief meditation", desc: "Guided session in Calm app.", impact: "−22% stress" },
  ],
  physical: [
    { title: "Posture reset", desc: "Roll shoulders, align spine.", impact: "+8% comfort" },
    { title: "Wrist & neck stretch", desc: "60-second sequence.", impact: "−15% strain" },
    { title: "Walk after lunch", desc: "10-min outdoor walk.", impact: "+10% energy" },
  ],
  nutrition: [
    { title: "Hydrate now", desc: "You're 1.5 cups behind target.", impact: "+6% focus" },
    { title: "Add protein at lunch", desc: "Stabilizes afternoon energy.", impact: "−12% slump" },
    { title: "Limit caffeine after 2pm", desc: "Improves sleep onset tonight.", impact: "+9% sleep" },
  ],
  sleep: [
    { title: "Wind-down at 10:30 PM", desc: "Dim lights, no screens.", impact: "+14% deep sleep" },
    { title: "Cool bedroom", desc: "Set thermostat to 67°F.", impact: "+7% recovery" },
    { title: "Consistent wake time", desc: "Anchor circadian rhythm.", impact: "−18% fatigue" },
  ],
};

const radarData = [
  { dim: "Focus", val: 78 },
  { dim: "Stress", val: 55 },
  { dim: "Fatigue", val: 42 },
  { dim: "Posture", val: 80 },
  { dim: "Cognitive Load", val: 65 },
];

export function Recommendations() {
  const [tab, setTab] = useState("mental");
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 600 }} className="text-neutral-900 dark:text-white">Health Recommendations</h1>
        <p className="text-neutral-500 mt-1" style={{ fontSize: 14 }}>Personalized actions based on today's session.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-neutral-500" style={{ fontSize: 13 }}>Today's Health Score</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 600 }} className="text-neutral-900 dark:text-white">74</span>
                <span className="text-neutral-500" style={{ fontSize: 14 }}>/ 100</span>
                <span className="ml-2 px-2 py-0.5 rounded-md bg-warning/15 text-warning" style={{ fontSize: 12, fontWeight: 500 }}>Moderate Risk</span>
              </div>
            </div>
            <div className="flex gap-2">
              <GhostButton><span className="inline-flex items-center gap-1.5"><Share2 size={14} /> Share with HR</span></GhostButton>
              <PrimaryButton><span className="inline-flex items-center gap-1.5"><Download size={14} /> Export PDF</span></PrimaryButton>
            </div>
          </div>
          <div className="mt-5 h-2.5 rounded-full bg-neutral-200 dark:bg-white/5 overflow-hidden flex">
            <div className="h-full bg-accent" style={{ width: "40%" }} />
            <div className="h-full bg-warning" style={{ width: "34%" }} />
            <div className="h-full bg-danger/70" style={{ width: "26%" }} />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border transition ${tab === t.id ? "bg-primary text-white border-primary" : "border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-white/5"}`}
                style={{ fontSize: 13, fontWeight: 500 }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            {recs[tab].map((r, i) => (
              <div key={i} className="p-4 rounded-2xl border border-neutral-200 dark:border-white/10 hover:border-accent/40 transition group">
                <div className="w-9 h-9 rounded-xl bg-accent/10 text-primary dark:text-accent flex items-center justify-center group-hover:scale-105 transition">
                  {tabs.find((t) => t.id === tab)?.icon}
                </div>
                <div className="mt-3 text-neutral-900 dark:text-white" style={{ fontSize: 14, fontWeight: 600 }}>{r.title}</div>
                <p className="text-neutral-500 mt-1" style={{ fontSize: 12.5, lineHeight: 1.55 }}>{r.desc}</p>
                <span className="inline-block mt-3 px-2 py-0.5 rounded-md bg-accent/15 text-primary dark:text-accent" style={{ fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{r.impact}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 600 }} className="text-neutral-900 dark:text-white">Wellness profile</h3>
          <p className="text-neutral-500 mt-1" style={{ fontSize: 13 }}>5-dimension balance</p>
          <div className="h-72 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(120,120,120,0.18)" />
                <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: "#888" }} />
                <Radar dataKey="val" stroke="#0F6E56" fill="#1D9E75" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
