import { motion } from "motion/react";

const statusColors = {
  normal: { ring: "stroke-accent", text: "text-primary dark:text-accent", bg: "bg-accent/10", border: "border-accent/30" },
  warning: { ring: "stroke-warning", text: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  alert: { ring: "stroke-danger", text: "text-danger", bg: "bg-danger/10", border: "border-danger/30" },
  inactive: { ring: "stroke-neutral-400", text: "text-neutral-500", bg: "bg-neutral-200/40", border: "border-neutral-300/50" },
};

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-surface-dark border border-neutral-200/70 dark:border-white/5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </div>
  );
}

export function HoverCard({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-surface-dark border border-neutral-200/70 dark:border-white/5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-accent/40 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all cursor-pointer ${className}`}>
      {children}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  unit,
  delta,
  status = "normal",
  icon,
}) {
  const c = statusColors[status];
  return (
    <HoverCard className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div style={{ fontSize: 13 }} className="text-neutral-500 dark:text-neutral-400">{label}</div>
          <div className="flex items-baseline gap-1.5">
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 600 }} className="text-neutral-900 dark:text-white">
              {value}
            </span>
            {unit && <span style={{ fontSize: 13 }} className="text-neutral-500">{unit}</span>}
          </div>
          {delta && <div style={{ fontSize: 12 }} className={c.text}>{delta}</div>}
        </div>
        {icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.bg} ${c.text}`}>{icon}</div>
        )}
      </div>
    </HoverCard>
  );
}

export function GaugeRing({
  value,
  max = 100,
  size = 140,
  label,
  unit,
  status = "normal",
}) {
  const stroke = size < 100 ? 8 : 12;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const c = statusColors[status];
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} className="stroke-neutral-200 dark:stroke-white/10" fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          className={c.ring}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: size * 0.22, fontWeight: 600 }} className="text-neutral-900 dark:text-white">
          {value}
          {unit && <span style={{ fontSize: size * 0.11 }} className="text-neutral-500"> {unit}</span>}
        </span>
        {label && <span style={{ fontSize: 12 }} className="text-neutral-500 mt-0.5">{label}</span>}
      </div>
    </div>
  );
}

export function PrimaryButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:bg-primary-active active:scale-[0.98] text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${className}`}
      style={{ fontSize: 14, fontWeight: 500 }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5 hover:border-accent/40 active:bg-neutral-200 dark:active:bg-white/10 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 ${className}`}
      style={{ fontSize: 14, fontWeight: 500 }}
    >
      {children}
    </button>
  );
}

export function Toggle({ on, onChange, disabled }) {
  return (
    <button
      disabled={disabled}
      onClick={() => onChange?.(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${disabled ? "bg-neutral-200 dark:bg-white/10 opacity-50 cursor-not-allowed" : on ? "bg-accent hover:bg-accent-hover" : "bg-neutral-300 dark:bg-white/10 hover:bg-neutral-400"}`}
    >
      <motion.span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
        animate={{ x: on ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{ left: 0 }}
      />
    </button>
  );
}

export function Avatar({ name = "Raditya Santosa", status = "normal" }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const dot = status === "normal" ? "bg-accent" : status === "warning" ? "bg-warning" : status === "alert" ? "bg-danger" : "bg-neutral-400";
  return (
    <div className="relative">
      <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white" style={{ fontSize: 13, fontWeight: 600 }}>
        {initials}
      </div>
      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-bg-dark ${dot}`} />
    </div>
  );
}

export function TimelineItem({ time, text, type = "info" }) {
  const dotColor = type === "info" ? "bg-accent" : type === "warning" ? "bg-warning" : "bg-danger";
  return (
    <div className="flex gap-3 py-2.5">
      <div className="flex flex-col items-center">
        <span className={`w-2 h-2 rounded-full ${dotColor} mt-1.5`} />
        <span className="flex-1 w-px bg-neutral-200 dark:bg-white/5 my-1" />
      </div>
      <div className="flex-1 pb-2">
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} className="text-neutral-500">{time}</div>
        <div style={{ fontSize: 14 }} className="text-neutral-800 dark:text-neutral-100">{text}</div>
      </div>
    </div>
  );
}

export function StatusPill({ status, label }) {
  const c = statusColors[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${c.bg} ${c.text} border ${c.border}`} style={{ fontSize: 12, fontWeight: 500 }}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "normal" ? "bg-accent" : status === "warning" ? "bg-warning" : status === "alert" ? "bg-danger" : "bg-neutral-400"} animate-pulse`} />
      {label}
    </span>
  );
}

export function Logo({ size = 28 }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" stroke="#0F6E56" strokeWidth="2" />
        <circle cx="16" cy="16" r="4" fill="#1D9E75" />
        <path d="M3 20 L9 20 L11 14 L14 24 L17 12 L20 22 L23 20 L29 20" stroke="#1D9E75" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700 }} className="text-neutral-900 dark:text-white tracking-tight">
        FitWork
      </span>
    </div>
  );
}
