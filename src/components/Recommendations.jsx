import { useState } from "react";
import { Brain, Dumbbell, Apple, Moon, Share2, Download, AlertTriangle, Coffee } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Card, PrimaryButton, GhostButton } from "./shared";
import { useHealthData } from "../hooks/useHealthData";

const PERCLOS_THRESHOLD = Number(import.meta.env.VITE_PERCLOS_THRESHOLD) || 0.4;

const REASON_COPY = {
  stress_index_high: { title: "Stress index is high", body: "Your stress level crossed the safe threshold. Step away and reset before continuing." },
  fatigue_detected: { title: "Fatigue detected", body: "Sustained fatigue is hurting your recovery. A real break will restore alertness." },
  long_session: { title: "You've been working a long stretch", body: "Long uninterrupted sessions reduce focus quality. Take a short break to stay sharp." },
  cognitive_overload: { title: "Cognitive overload", body: "Both stress and fatigue are elevated. Your brain needs a genuine pause now." },
};

const tabs = [
  { id: "mental",   label: "Mental",    icon: <Brain size={15} /> },
  { id: "physical", label: "Physical",  icon: <Dumbbell size={15} /> },
  { id: "nutrition",label: "Nutrition", icon: <Apple size={15} /> },
  { id: "sleep",    label: "Sleep",     icon: <Moon size={15} /> },
];

const recs = {
  mental:    [
    { title: "5-min box breathing", desc: "Reduces cortisol and resets focus.",          impact: "+12% focus" },
    { title: "Single-task block",   desc: "Mute notifications for 45 min.",              impact: "+18% output" },
    { title: "Brief meditation",    desc: "Guided session in Calm app.",                 impact: "−22% stress" },
  ],
  physical:  [
    { title: "Posture reset",       desc: "Roll shoulders, align spine.",                impact: "+8% comfort" },
    { title: "Wrist & neck stretch",desc: "60-second sequence.",                         impact: "−15% strain" },
    { title: "Walk after lunch",    desc: "10-min outdoor walk.",                        impact: "+10% energy" },
  ],
  nutrition: [
    { title: "Hydrate now",          desc: "You're 1.5 cups behind target.",             impact: "+6% focus" },
    { title: "Add protein at lunch", desc: "Stabilizes afternoon energy.",               impact: "−12% slump" },
    { title: "Limit caffeine after 2pm", desc: "Improves sleep onset tonight.",          impact: "+9% sleep" },
  ],
  sleep:     [
    { title: "Wind-down at 10:30 PM", desc: "Dim lights, no screens.",                  impact: "+14% deep sleep" },
    { title: "Cool bedroom",          desc: "Set thermostat to 67°F.",                  impact: "+7% recovery" },
    { title: "Consistent wake time",  desc: "Anchor circadian rhythm.",                 impact: "−18% fatigue" },
  ],
};

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function Recommendations() {
  const [tab, setTab] = useState("mental");
  const currentTab = tabs.find((t) => t.id === tab);
  const { data } = useHealthData();
  const { focusScore, stressLevel, fatigueScore, vitals, breakWarning } = data;

  // Health score gabungan (focus tinggi baik; stress/fatigue rendah baik)
  const healthScore = clamp((focusScore + (100 - stressLevel) + (100 - fatigueScore)) / 3);
  const risk = healthScore >= 75 ? { label: "Low Risk", cls: "bg-accent/15 text-primary dark:text-accent" }
    : healthScore >= 55 ? { label: "Moderate Risk", cls: "bg-warning/15 text-warning" }
    : { label: "High Risk", cls: "bg-danger/15 text-danger" };

  // Segmen progress bar proporsional terhadap komponen skor
  const good = clamp(focusScore);
  const moderate = clamp(stressLevel);
  const poor = clamp(fatigueScore);
  const total = good + moderate + poor || 1;

  // Radar dari pembacaan API (5 dimensi: Focus/Calm/Energy/Eye/Cognitive)
  const radarData = [
    { dim: "Focus", val: clamp(focusScore) },
    { dim: "Calm", val: clamp(100 - stressLevel) },
    { dim: "Energy", val: clamp(100 - fatigueScore) },
    { dim: "Eye Health", val: clamp(100 - (vitals.perclos / PERCLOS_THRESHOLD) * 100) },
    { dim: "Cognitive Load", val: clamp(vitals.pupilDilation * 100) },
  ];

  const reason = breakWarning?.reason ? REASON_COPY[breakWarning.reason] : null;

  // Pilih tab yang paling relevan otomatis & urutkan rec berdasarkan kondisi.
  // (stres tinggi → Mental; fatigue/perclos tinggi → Physical/Sleep)
  const suggestedTab =
    stressLevel > 65 ? "mental"
    : fatigueScore > 60 ? "sleep"
    : vitals.perclos > PERCLOS_THRESHOLD ? "physical"
    : tab;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6">
      <div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(20px,4vw,28px)", fontWeight: 600 }} className="text-neutral-900 dark:text-white">
          Health Recommendations
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1" style={{ fontSize: 14 }}>Personalized actions based on today's session.</p>
      </div>

      {/* AI Advisor — break warning card (muncul kalau triggered) */}
      {breakWarning?.triggered && reason && (
        <Card className="p-5 border-warning/40 bg-linear-to-br from-warning/10 to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-warning/15 text-warning flex items-center justify-center shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <div className="text-neutral-900 dark:text-white font-semibold">{reason.title}</div>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1 max-w-xl leading-relaxed">{reason.body}</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-warning text-white text-sm font-semibold shrink-0">
              <Coffee size={16} /> Break {breakWarning.recommendedMinutes} min
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-6">

        <Card className="xl:col-span-2 p-5 lg:p-6">
          {/* Score header — dari API */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="text-neutral-500 dark:text-neutral-400 text-sm">Today's Health Score</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 600 }} className="text-neutral-900 dark:text-white">{healthScore}</span>
                <span className="text-neutral-400 text-sm">/ 100</span>
                <span className={`ml-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${risk.cls}`}>{risk.label}</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <GhostButton><span className="inline-flex items-center gap-1.5 text-sm"><Share2 size={13} /> Share</span></GhostButton>
              <PrimaryButton><span className="inline-flex items-center gap-1.5 text-sm"><Download size={13} /> Export PDF</span></PrimaryButton>
            </div>
          </div>

          {/* Progress bar proporsional */}
          <div className="mt-4 h-2.5 rounded-full bg-neutral-100 dark:bg-white/5 overflow-hidden flex">
            <div className="h-full bg-accent"   style={{ width: `${(good / total) * 100}%` }} />
            <div className="h-full bg-warning"  style={{ width: `${(moderate / total) * 100}%` }} />
            <div className="h-full bg-danger/70" style={{ width: `${(poor / total) * 100}%` }} />
          </div>

          {/* Tab buttons */}
          <div className="mt-5 flex flex-wrap gap-2 items-center">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition ${
                  tab === t.id
                    ? "bg-primary text-white border-primary"
                    : "border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 hover:border-neutral-300"
                } ${suggestedTab === t.id && tab !== t.id ? "ring-2 ring-accent/40" : ""}`}
              >
                {t.icon} {t.label}
                {suggestedTab === t.id && tab !== t.id && (
                  <span className="ml-1 text-[10px] font-semibold text-primary dark:text-accent">AI</span>
                )}
              </button>
            ))}
          </div>

          {/* Rec cards */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recs[tab].map((r, i) => (
              <div key={i} className="p-4 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/2 hover:border-accent/40 transition group">
                <div className="w-9 h-9 rounded-xl bg-accent/10 text-primary dark:text-accent flex items-center justify-center group-hover:scale-105 transition">
                  {currentTab?.icon}
                </div>
                <div className="mt-3 text-neutral-800 dark:text-white font-semibold text-sm">{r.title}</div>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-xs leading-relaxed">{r.desc}</p>
                <span className="inline-block mt-3 px-2 py-0.5 rounded-md bg-accent/12 text-primary dark:text-accent text-xs font-semibold font-mono">{r.impact}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Wellness radar — dari API */}
        <Card className="p-5 lg:p-6">
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600 }} className="text-neutral-900 dark:text-white">Wellness profile</h3>
          <p className="text-neutral-400 dark:text-neutral-500 mt-1 text-sm">5-dimension balance</p>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
                <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Radar dataKey="val" stroke="#0F6E56" fill="#1D9E75" fillOpacity={0.25} isAnimationActive={false} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
