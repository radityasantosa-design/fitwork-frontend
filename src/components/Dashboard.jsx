import { Activity, Brain, Clock, Coffee, Sparkles, Lightbulb, TrendingUp, AlertTriangle, WifiOff } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, MetricCard, GaugeRing, StatusPill } from "./shared";
import { useHealthData } from "../hooks/useHealthData";

const REASON_LABEL = {
  stress_index_high: "Stress index tinggi",
  fatigue_detected: "Kelelahan terdeteksi",
  long_session: "Sesi kerja terlalu panjang",
  cognitive_overload: "Beban kognitif berlebih",
};

function stressStatus(v) {
  return v > 65 ? "alert" : v > 40 ? "warning" : "normal";
}
function fatigueStatus(v) {
  return v > 60 ? "alert" : v > 35 ? "warning" : "normal";
}
function focusStatus(v) {
  return v >= 70 ? "normal" : v >= 50 ? "warning" : "alert";
}

export function Dashboard({ onTriggerBreak }) {
  const { data, history, isLive } = useHealthData();
  const { focusScore, stressLevel, fatigueScore, vitals, sessionInfo, breakWarning } = data;

  const insights = [
    {
      icon: <Lightbulb size={16} />,
      title: focusScore >= 70 ? "You're in a focus window" : "Recover your focus",
      body:
        focusScore >= 70
          ? `Focus score ${focusScore}/100 — schedule deep work now while attention is high.`
          : `Focus dropped to ${focusScore}/100. A short reset can bring it back up.`,
    },
    {
      icon: <Coffee size={16} />,
      title: stressLevel > 40 ? "Take a 5-min stretch" : "Stress under control",
      body:
        stressLevel > 40
          ? `Stress index at ${stressLevel}%. A short break should reset it.`
          : `Stress index at ${stressLevel}% — comfortably in the healthy range.`,
    },
    {
      icon: <TrendingUp size={16} />,
      title: `${sessionInfo.deepWorkBlocks} deep-work blocks today`,
      body: `Active for ${sessionInfo.activeWorkHours}h · break compliance ${sessionInfo.breakCompliance}%.`,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6">

      {/* Hero row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <GaugeRing value={Math.round(focusScore)} size={88} status={focusStatus(focusScore)} />
          <div>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(20px,4vw,28px)", fontWeight: 600 }} className="text-neutral-900 dark:text-white">
              Good morning, Raditya
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1" style={{ fontSize: 14 }}>
              Focus score: <span className="text-primary dark:text-accent font-semibold">{Math.round(focusScore)} / 100</span>
              {focusScore >= 70 ? " — you're in flow state." : " — let's bring it back up."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={isLive ? "normal" : "inactive"} label={isLive ? "Live session active" : "Offline · mock data"} />
          <button
            onClick={onTriggerBreak}
            className="px-4 py-2 rounded-xl border border-warning/40 text-warning bg-warning/10 hover:bg-warning/20 transition text-sm font-medium"
          >
            Simulate break alert
          </button>
        </div>
      </div>

      {/* Break warning banner (muncul kalau triggered) */}
      {breakWarning?.triggered && (
        <Card className="p-4 border-warning/40 bg-warning/8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-warning/15 text-warning flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div>
                <div className="text-neutral-900 dark:text-white font-semibold text-sm">Break recommended</div>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">
                  {REASON_LABEL[breakWarning.reason] || "Time for a short break"} · suggested {breakWarning.recommendedMinutes} min
                </p>
              </div>
            </div>
            <button
              onClick={onTriggerBreak}
              className="px-4 py-2 rounded-xl bg-warning text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition shrink-0"
            >
              Take break now
            </button>
          </div>
        </Card>
      )}

      {/* Metric cards — semua dari API */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <MetricCard label="Today's Focus Score" value={Math.round(focusScore)} unit="/100" delta={focusScore >= 70 ? "In flow" : "Below peak"} status={focusStatus(focusScore)} icon={<Brain size={18} />} />
        <MetricCard label="Stress Level" value={Math.round(stressLevel)} unit="%" delta={stressLevel > 40 ? "Moderate — rising" : "Healthy range"} status={stressStatus(stressLevel)} icon={<Activity size={18} />} />
        <MetricCard label="Fatigue Score" value={Math.round(fatigueScore)} unit="%" delta={fatigueScore > 35 ? "Watch closely" : "Low fatigue"} status={fatigueStatus(fatigueScore)} icon={<Coffee size={18} />} />
        <MetricCard label="Active Work Hours" value={`${sessionInfo.activeWorkHours}h`} delta={`${sessionInfo.deepWorkBlocks} deep-work blocks`} status="normal" icon={<Clock size={18} />} />
      </div>

      {/* Chart + Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-6">
        <Card className="xl:col-span-2 p-5 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 600 }} className="text-neutral-900 dark:text-white">
                Productivity vs Stress Index
              </h3>
              <p className="text-neutral-400 dark:text-neutral-500 mt-0.5" style={{ fontSize: 13 }}>Live · updates every 5s</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Productivity</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> Stress</span>
            </div>
          </div>
          <div className="h-60 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ left: -20, top: 8, right: 8 }}>
                <CartesianGrid stroke="currentColor" strokeOpacity={0.07} vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--color-surface-dark, #fff)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, fontSize: 12 }}
                  itemStyle={{ color: "#6b7280" }}
                />
                <Line type="monotone" dataKey="productivity" stroke="#0F6E56" strokeWidth={2.5} dot={{ r: 3, fill: "#0F6E56" }} activeDot={{ r: 5 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="stress"       stroke="#BA7517" strokeWidth={2.5} dot={{ r: 3, fill: "#BA7517" }} activeDot={{ r: 5 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-accent" />
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 600 }} className="text-neutral-900 dark:text-white">AI Insights</h3>
          </div>
          <div className="space-y-3">
            {insights.map((i, idx) => (
              <div key={idx} className="rounded-xl p-3.5 bg-accent/5 dark:bg-accent/8 border border-accent/20 hover:border-accent/40 transition cursor-pointer">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 text-primary dark:text-accent flex items-center justify-center shrink-0">{i.icon}</div>
                  <div>
                    <div className="text-neutral-800 dark:text-white font-semibold" style={{ fontSize: 13.5 }}>{i.title}</div>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-0.5" style={{ fontSize: 12.5, lineHeight: 1.5 }}>{i.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Live session bar — vitals dari API */}
      <Card className="p-3.5 px-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-between">
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
              </span>
            ) : (
              <WifiOff size={14} className="text-neutral-400" />
            )}
            <span className="text-neutral-700 dark:text-neutral-200 font-medium text-sm">{isLive ? "Live session" : "Offline (mock)"}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Source: <span className={`font-mono ${data.source === "live" ? "text-accent" : "text-neutral-500"}`}>{data.source === "live" ? "camera" : "baseline"}</span></span>
            <span>HR: <span className="font-mono text-neutral-700 dark:text-neutral-200">{vitals.heartRate != null ? `${vitals.heartRate} bpm` : "--"}</span></span>
            <span>PERCLOS: <span className="font-mono text-neutral-700 dark:text-neutral-200">{vitals.perclos != null ? vitals.perclos : "--"}</span></span>
          </div>
        </div>
      </Card>
    </div>
  );
}
