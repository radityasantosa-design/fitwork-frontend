import { Card } from "./shared";

const colors = [
  { name: "Primary / Deep Teal", hex: "#0F6E56", token: "--color-primary", role: "Brand, headings, primary actions" },
  { name: "Accent / Cyan-Green", hex: "#1D9E75", token: "--color-accent", role: "CTAs, highlights, success" },
  { name: "Warning / Amber", hex: "#BA7517", token: "--color-warning", role: "Break alerts, caution" },
  { name: "Danger / Soft Red", hex: "#E24B4A", token: "--color-danger", role: "Critical stress, errors" },
  { name: "Background Light", hex: "#F8FAF9", token: "--bg-light", role: "Light mode canvas" },
  { name: "Background Dark", hex: "#1A1F1E", token: "--bg-dark", role: "Dark mode canvas" },
];

const typography = [
  { label: "Display H1", family: "Sora", size: 32, weight: 600, sample: "Work Smart. Stay Well." },
  { label: "Heading H2", family: "Sora", size: 24, weight: 600, sample: "Health Recommendations" },
  { label: "Heading H3", family: "Sora", size: 18, weight: 600, sample: "Today's Focus Score" },
  { label: "Body Default", family: "Inter", size: 15, weight: 400, sample: "Your data is private and encrypted end-to-end." },
  { label: "Body Small", family: "Inter", size: 13, weight: 400, sample: "Last 8 hours · live session active" },
  { label: "Data Label", family: "JetBrains Mono", size: 13, weight: 500, sample: "72 bpm · 0.18 PERCLOS · 87/100" },
];

const spacing = [4, 8, 12, 16, 24, 32, 48, 64];
const radius = [
  { name: "sm", px: 8 },
  { name: "md", px: 12 },
  { name: "lg", px: 16 },
  { name: "xl", px: 24 },
  { name: "full", px: 999 },
];

export function DesignTokens() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 600 }} className="text-neutral-900 dark:text-white">
          Design Tokens
        </h1>
        <p className="text-neutral-500 mt-1" style={{ fontSize: 14 }}>
          The single source of truth for FitWork's visual language.
        </p>
      </div>

      <Card className="p-6">
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 600 }} className="text-neutral-900 dark:text-white mb-4">Color System</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colors.map((c) => (
            <div key={c.hex} className="rounded-2xl border border-neutral-200 dark:border-white/10 overflow-hidden">
              <div className="h-24" style={{ background: c.hex }} />
              <div className="p-3.5">
                <div className="text-neutral-900 dark:text-white" style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                <div className="flex items-center justify-between mt-1.5">
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} className="text-neutral-500">{c.hex}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} className="text-neutral-400">{c.token}</span>
                </div>
                <p className="text-neutral-500 mt-2" style={{ fontSize: 12, lineHeight: 1.5 }}>{c.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 600 }} className="text-neutral-900 dark:text-white mb-4">Typography</h3>
        <div className="divide-y divide-neutral-200 dark:divide-white/5">
          {typography.map((t) => (
            <div key={t.label} className="flex flex-col md:flex-row md:items-center gap-3 py-4">
              <div className="md:w-44">
                <div className="text-neutral-900 dark:text-white" style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</div>
                <div className="text-neutral-500" style={{ fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace" }}>
                  {t.family} · {t.size}px · {t.weight}
                </div>
              </div>
              <div
                className="text-neutral-800 dark:text-neutral-100 flex-1"
                style={{ fontFamily: `'${t.family}', sans-serif`, fontSize: t.size, fontWeight: t.weight, lineHeight: 1.4 }}
              >
                {t.sample}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 600 }} className="text-neutral-900 dark:text-white mb-4">Spacing (8px grid)</h3>
          <div className="space-y-3">
            {spacing.map((s) => (
              <div key={s} className="flex items-center gap-3">
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} className="text-neutral-500 w-10">{s}px</span>
                <div className="h-3 rounded bg-accent" style={{ width: s * 2 }} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 600 }} className="text-neutral-900 dark:text-white mb-4">Border Radius</h3>
          <div className="grid grid-cols-5 gap-3">
            {radius.map((r) => (
              <div key={r.name} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-primary" style={{ borderRadius: r.px }} />
                <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }} className="text-neutral-500">{r.name}</span>
                <span style={{ fontSize: 11 }} className="text-neutral-400">{r.px === 999 ? "∞" : `${r.px}px`}</span>
              </div>
            ))}
          </div>

          <h4 className="text-neutral-900 dark:text-white mt-7 mb-3" style={{ fontSize: 13, fontWeight: 600 }}>Elevation</h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "sm", style: "shadow-sm" },
              { name: "md", style: "shadow-md" },
              { name: "lg", style: "shadow-xl" },
            ].map((e) => (
              <div key={e.name} className={`h-16 rounded-2xl bg-white dark:bg-elevation-dark flex items-center justify-center ${e.style}`}>
                <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }} className="text-neutral-500">{e.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 600 }} className="text-neutral-900 dark:text-white mb-4">Interactive States</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: "Default", cls: "bg-primary text-white" },
            { label: "Hover", cls: "bg-primary-hover text-white shadow-md -translate-y-0.5" },
            { label: "Active / Pressed", cls: "bg-primary-active text-white scale-[0.98]" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-neutral-200 dark:border-white/10 p-4">
              <div className="text-neutral-500 mb-3" style={{ fontSize: 12 }}>{s.label}</div>
              <div className={`px-4 py-2.5 rounded-xl inline-block transition ${s.cls}`} style={{ fontSize: 13, fontWeight: 500 }}>Start session</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
