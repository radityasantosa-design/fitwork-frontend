import { Card } from "./shared";

const colors = [
  { name: "Primary / Deep Teal",  hex: "#0F6E56", token: "--color-primary",  role: "Brand, headings, primary actions" },
  { name: "Accent / Cyan-Green",  hex: "#1D9E75", token: "--color-accent",   role: "CTAs, highlights, success" },
  { name: "Warning / Amber",      hex: "#BA7517", token: "--color-warning",  role: "Break alerts, caution" },
  { name: "Danger / Soft Red",    hex: "#E24B4A", token: "--color-danger",   role: "Critical stress, errors" },
  { name: "Background Light",     hex: "#F8FAF9", token: "--color-bg-light", role: "Light mode canvas" },
  { name: "Background Dark",      hex: "#1A1F1E", token: "--color-bg-dark",  role: "Dark mode canvas" },
];

const typography = [
  { label: "Display H1",  family: "Sora",          size: 32, weight: 600, sample: "Work Smart. Stay Well." },
  { label: "Heading H2",  family: "Sora",          size: 24, weight: 600, sample: "Health Recommendations" },
  { label: "Heading H3",  family: "Sora",          size: 18, weight: 600, sample: "Today's Focus Score" },
  { label: "Body Default",family: "Inter",         size: 15, weight: 400, sample: "Your data is private and encrypted end-to-end." },
  { label: "Body Small",  family: "Inter",         size: 13, weight: 400, sample: "Last 8 hours · live session active" },
  { label: "Data Label",  family: "JetBrains Mono",size: 13, weight: 500, sample: "72 bpm · 0.18 PERCLOS · 87/100" },
];

const spacing = [4, 8, 12, 16, 24, 32, 48, 64];
const radii   = [{ name: "sm", px: 8 }, { name: "md", px: 12 }, { name: "lg", px: 16 }, { name: "xl", px: 24 }, { name: "full", px: 999 }];

export function DesignTokens() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6">
      <div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(20px,4vw,28px)", fontWeight: 600 }} className="text-neutral-900 dark:text-white">
          Design Tokens
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1" style={{ fontSize: 14 }}>The single source of truth for FitWork's visual language.</p>
      </div>

      {/* Colors */}
      <Card className="p-5 lg:p-6">
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 600 }} className="text-neutral-900 dark:text-white mb-4">Color System</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colors.map((c) => (
            <div key={c.hex} className="rounded-2xl border border-neutral-200 dark:border-white/10 overflow-hidden">
              <div className="h-20" style={{ background: c.hex }} />
              <div className="p-3.5 bg-white dark:bg-surface-dark">
                <div className="text-neutral-800 dark:text-white font-semibold text-sm">{c.name}</div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-neutral-500 text-xs font-mono">{c.hex}</span>
                  <span className="text-neutral-400 text-xs font-mono">{c.token}</span>
                </div>
                <p className="text-neutral-400 dark:text-neutral-500 mt-2 text-xs leading-relaxed">{c.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Typography */}
      <Card className="p-5 lg:p-6">
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 600 }} className="text-neutral-900 dark:text-white mb-4">Typography</h3>
        <div className="divide-y divide-neutral-100 dark:divide-white/5">
          {typography.map((t) => (
            <div key={t.label} className="flex flex-col md:flex-row md:items-center gap-3 py-4">
              <div className="md:w-44 shrink-0">
                <div className="text-neutral-700 dark:text-neutral-200 font-semibold text-sm">{t.label}</div>
                <div className="text-neutral-400 text-xs font-mono mt-0.5">{t.family} · {t.size}px · {t.weight}</div>
              </div>
              <div className="text-neutral-800 dark:text-neutral-100 flex-1" style={{ fontFamily: `'${t.family}', sans-serif`, fontSize: t.size, fontWeight: t.weight, lineHeight: 1.4 }}>
                {t.sample}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">

        {/* Spacing */}
        <Card className="p-5 lg:p-6">
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 600 }} className="text-neutral-900 dark:text-white mb-4">Spacing (8px grid)</h3>
          <div className="space-y-3">
            {spacing.map((s) => (
              <div key={s} className="flex items-center gap-3">
                <span className="text-neutral-400 text-xs font-mono w-10">{s}px</span>
                <div className="h-3 rounded bg-accent" style={{ width: s * 2 }} />
              </div>
            ))}
          </div>
        </Card>

        {/* Border Radius + Elevation */}
        <Card className="p-5 lg:p-6">
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 600 }} className="text-neutral-900 dark:text-white mb-4">Border Radius</h3>
          <div className="grid grid-cols-5 gap-3">
            {radii.map((r) => (
              <div key={r.name} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-primary" style={{ borderRadius: r.px }} />
                <span className="text-neutral-400 text-xs font-mono">{r.name}</span>
                <span className="text-neutral-300 dark:text-neutral-600 text-xs">{r.px === 999 ? "∞" : `${r.px}px`}</span>
              </div>
            ))}
          </div>

          <h4 className="text-neutral-800 dark:text-white mt-6 mb-3 font-semibold text-sm">Elevation</h4>
          <div className="grid grid-cols-3 gap-3">
            {[{ name: "sm", cls: "shadow-sm" }, { name: "md", cls: "shadow-md" }, { name: "lg", cls: "shadow-xl" }].map((e) => (
              <div key={e.name} className={`h-14 rounded-2xl bg-white dark:bg-elevation-dark flex items-center justify-center ${e.cls}`}>
                <span className="text-neutral-400 text-xs font-mono">{e.name}</span>
              </div>
            ))}
          </div>

          <h4 className="text-neutral-800 dark:text-white mt-6 mb-3 font-semibold text-sm">Interactive States</h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Default", cls: "bg-primary" },
              { label: "Hover",   cls: "bg-primary-hover" },
              { label: "Active",  cls: "bg-primary-active" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className={`px-2 py-2 rounded-lg ${s.cls} text-white text-xs font-semibold`}>Btn</div>
                <span className="text-neutral-400 text-xs mt-1 block">{s.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
