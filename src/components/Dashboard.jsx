import { Activity, Brain, Clock, Coffee, Sparkles, Lightbulb, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, MetricCard, GaugeRing, StatusPill } from "./shared";

const data = [
  { t: "9 AM",  productivity: 65, stress: 22 },
  { t: "10 AM", productivity: 78, stress: 28 },
  { t: "11 AM", productivity: 88, stress: 35 },
  { t: "12 PM", productivity: 72, stress: 48 },
  { t: "1 PM",  productivity: 60, stress: 40 },
  { t: "2 PM",  productivity: 85, stress: 55 },
  { t: "3 PM",  productivity: 90, stress: 62 },
  { t: "4 PM",  productivity: 76, stress: 50 },
];

const insights = [
  { icon: <Lightbulb size={16} />, title: "Schedule deep work at 11 AM", body: "Your peak focus window is 10:30–11:30. Block calendar holds for it." },
  { icon: <Coffee size={16} />,    title: "Take a 5-min stretch",        body: "Stress index rose 18% in the last hour. A short break should reset it." },
  { icon: <TrendingUp size={16} />, title: "+12% over yesterday",        body: "Your productivity is trending up. Keep current break cadence." },
];

export function Dashboard({ onTriggerBreak }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6">

      {/* Hero row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <GaugeRing value={87} size={88} status="normal" />
          <div>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(20px,4vw,28px)", fontWeight: 600 }} className="text-neutral-900 dark:text-white">
              Good morning, Raditya
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1" style={{ fontSize: 14 }}>
              Focus score: <span className="text-primary dark:text-accent font-semibold">87 / 100</span> — you're in flow state.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status="normal" label="Live session active" />
          <button
            onClick={onTriggerBreak}
            className="px-4 py-2 rounded-xl border border-warning/40 text-warning bg-warning/10 hover:bg-warning/20 transition text-sm font-medium"
          >
            Simulate break alert
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <MetricCard label="Today's Focus Score" value={87}       unit="/100"    delta="▲ 12% vs yesterday" status="normal"  icon={<Brain size={18} />} />
        <MetricCard label="Stress Level"         value={42}       unit="%"       delta="Moderate — rising"  status="warning" icon={<Activity size={18} />} />
        <MetricCard label="Active Work Hours"    value="5h 24m"                 delta="2 deep-work blocks" status="normal"  icon={<Clock size={18} />} />
        <MetricCard label="Break Compliance"     value={68}       unit="%"       delta="Below target"       status="warning" icon={<Coffee size={18} />} />
      </div>

      {/* Chart + Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-6">
        <Card className="xl:col-span-2 p-5 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 600 }} className="text-neutral-900 dark:text-white">
                Productivity vs Stress Index
              </h3>
              <p className="text-neutral-400 dark:text-neutral-500 mt-0.5" style={{ fontSize: 13 }}>Last 8 hours</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Productivity</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> Stress</span>
            </div>
          </div>
          <div className="h-60 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: -20, top: 8, right: 8 }}>
                <CartesianGrid stroke="currentColor" strokeOpacity={0.07} vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--color-surface-dark, #fff)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, fontSize: 12 }}
                  itemStyle={{ color: "#6b7280" }}
                />
                <Line type="monotone" dataKey="productivity" stroke="#0F6E56" strokeWidth={2.5} dot={{ r: 3, fill: "#0F6E56" }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="stress"       stroke="#BA7517" strokeWidth={2.5} dot={{ r: 3, fill: "#BA7517" }} activeDot={{ r: 5 }} />
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

      {/* Live session bar */}
      <Card className="p-3.5 px-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
            </span>
            <span className="text-neutral-700 dark:text-neutral-200 font-medium text-sm">Live session</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Eye tracking: <span className="text-accent font-mono">active</span></span>
            <span>Gesture: <span className="text-accent font-mono">active</span></span>
            <span>HR: <span className="font-mono text-neutral-700 dark:text-neutral-200">72 bpm</span></span>
            <span>PERCLOS: <span className="font-mono text-neutral-700 dark:text-neutral-200">0.18</span></span>
          </div>
        </div>
      </Card>
    </div>
  );
}
