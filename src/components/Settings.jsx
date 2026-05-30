import { useState } from "react";
import { User, Bell, ShieldCheck, Plug, HelpCircle, Camera, Eye, Building2 } from "lucide-react";
import { Card, Toggle } from "./shared";

const sections = [
  { id: "account",       label: "Account",        icon: <User size={15} /> },
  { id: "notifications", label: "Notifications",  icon: <Bell size={15} /> },
  { id: "privacy",       label: "Privacy & Data", icon: <ShieldCheck size={15} /> },
  { id: "integrations",  label: "Integrations",   icon: <Plug size={15} /> },
  { id: "help",          label: "Help",            icon: <HelpCircle size={15} /> },
];

export function Settings() {
  const [active, setActive] = useState("privacy");
  const [camera, setCamera] = useState(true);
  const [share,  setShare]  = useState(false);
  const [hr,     setHr]     = useState(true);
  const [push,   setPush]   = useState(true);
  const [email,  setEmail]  = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6">

      {/* Profile card */}
      <Card className="p-5 lg:p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center text-white shrink-0" style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700 }}>
            RS
          </div>
          <div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 600 }} className="text-neutral-900 dark:text-white">Raditya Santosa</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">
              Senior Product Designer · <span className="inline-flex items-center gap-1"><Building2 size={11} /> Lumen Labs</span>
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-5 lg:gap-6">

        {/* Side nav */}
        <Card className="p-2 h-fit">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition ${
                active === s.id
                  ? "bg-primary/10 text-primary dark:bg-accent/12 dark:text-accent"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-800 dark:hover:text-white"
              }`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </Card>

        {/* Content panel */}
        <Card className="p-5 lg:p-6">
          {active === "privacy" && (
            <div className="space-y-5">
              <SectionHeader title="Privacy & Data" desc="You control what FitWork sees, stores, and shares." />
              <SettingsRow icon={<Camera size={15} />} title="Camera access"      desc="Required for eye tracking and rPPG vitals."                         on={camera} onChange={setCamera} />
              <SettingsRow icon={<ShieldCheck size={15} />} title="Health data sharing" desc="Send anonymized aggregates for product research."              on={share}  onChange={setShare} />
              <SettingsRow icon={<Eye size={15} />}    title="HR visibility"       desc="Allow your manager to see weekly wellness summaries."               on={hr}     onChange={setHr} />
              <div className="rounded-xl p-3.5 bg-accent/8 border border-accent/20 text-primary dark:text-accent text-sm leading-relaxed">
                Data is processed on-device by default. Network sync uses end-to-end encryption.
              </div>
            </div>
          )}
          {active === "notifications" && (
            <div className="space-y-5">
              <SectionHeader title="Notifications" desc="Choose how you'd like to be reminded." />
              <SettingsRow icon={<Bell size={15} />} title="Push notifications"  desc="Break, posture, and stress alerts."     on={push}  onChange={setPush} />
              <SettingsRow icon={<Bell size={15} />} title="Daily email summary" desc="Sent at 6 PM each weekday."             on={email} onChange={setEmail} />
            </div>
          )}
          {active === "integrations" && (
            <div className="space-y-5">
              <SectionHeader title="Integrations" desc="Connect FitWork to your work tools." />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <IntegrationCard name="Slack"            desc="Auto-DND during deep work" color="#4A154B" />
                <IntegrationCard name="Google Calendar"  desc="Sync focus blocks"         color="#4285F4" />
                <IntegrationCard name="Microsoft Teams"  desc="Status auto-update"        color="#5059C9" />
              </div>
            </div>
          )}
          {active === "account" && (
            <div className="space-y-5">
              <SectionHeader title="Account" desc="Manage your personal information." />
              <Field label="Full name"  value="Raditya Santosa" />
              <Field label="Email"      value="raditya.santosa@fitwork.io" />
              <Field label="Job title"  value="Senior Product Designer" />
              <Field label="Company"    value="Lumen Labs" />
            </div>
          )}
          {active === "help" && (
            <div className="space-y-3">
              <SectionHeader title="Help & Support" desc="Visit our knowledge base or chat with the wellness coach." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {["Knowledge Base", "Contact Support", "Video Tutorials", "Release Notes"].map((item) => (
                  <button key={item} className="p-4 rounded-xl border border-neutral-200 dark:border-white/10 text-left text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-white/5 hover:border-accent/40 transition">
                    {item} →
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function SectionHeader({ title, desc }) {
  return (
    <div>
      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 600 }} className="text-neutral-900 dark:text-white">{title}</h3>
      <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">{desc}</p>
    </div>
  );
}

function SettingsRow({ icon, title, desc, on, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent/10 text-primary dark:text-accent flex items-center justify-center shrink-0">{icon}</div>
        <div>
          <div className="text-neutral-800 dark:text-white font-semibold text-sm">{title}</div>
          <div className="text-neutral-500 dark:text-neutral-400 mt-0.5 text-xs leading-relaxed">{desc}</div>
        </div>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

function IntegrationCard({ name, desc, color }) {
  return (
    <div className="p-4 rounded-2xl border border-neutral-200 dark:border-white/10 hover:border-accent/40 transition">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: color }}>
        {name[0]}
      </div>
      <div className="mt-3 text-neutral-800 dark:text-white font-semibold text-sm">{name}</div>
      <div className="text-neutral-500 dark:text-neutral-400 mt-0.5 text-xs">{desc}</div>
      <button className="mt-3 w-full py-1.5 rounded-lg border border-accent/40 text-primary dark:text-accent hover:bg-accent/8 text-xs font-semibold transition">Connect</button>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <label className="text-neutral-500 dark:text-neutral-400 text-sm">{label}</label>
      <input
        defaultValue={value}
        className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/5 text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
      />
    </div>
  );
}
