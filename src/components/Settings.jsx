import { useState } from "react";
import { User, Bell, ShieldCheck, Plug, HelpCircle, Camera, Eye, Building2 } from "lucide-react";
import { Card, Toggle } from "./shared";

const sections = [
  { id: "account", label: "Account", icon: <User size={16} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { id: "privacy", label: "Privacy & Data", icon: <ShieldCheck size={16} /> },
  { id: "integrations", label: "Integrations", icon: <Plug size={16} /> },
  { id: "help", label: "Help", icon: <HelpCircle size={16} /> },
];

export function Settings() {
  const [active, setActive] = useState("privacy");
  const [camera, setCamera] = useState(true);
  const [share, setShare] = useState(false);
  const [hr, setHr] = useState(true);
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center text-white" style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 700 }}>
            RS
          </div>
          <div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 600 }} className="text-neutral-900 dark:text-white">Raditya Santosa</h2>
            <p className="text-neutral-500" style={{ fontSize: 13 }}>Senior Product Designer · <span className="inline-flex items-center gap-1"><Building2 size={12} /> Lumen Labs</span></p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <Card className="p-2 h-fit">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition ${active === s.id ? "bg-accent/12 text-primary dark:text-accent" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"}`}
              style={{ fontSize: 13.5, fontWeight: 500 }}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </Card>

        <Card className="p-6">
          {active === "privacy" && (
            <div className="space-y-5">
              <div>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 600 }} className="text-neutral-900 dark:text-white">Privacy & Data</h3>
                <p className="text-neutral-500 mt-1" style={{ fontSize: 13 }}>You control what FitWork sees, stores, and shares.</p>
              </div>
              <Row icon={<Camera size={16} />} title="Camera access" desc="Required for eye tracking and rPPG vitals." on={camera} onChange={setCamera} />
              <Row icon={<ShieldCheck size={16} />} title="Health data sharing" desc="Send anonymized aggregates for product research." on={share} onChange={setShare} />
              <Row icon={<Eye size={16} />} title="HR visibility" desc="Allow your manager to see weekly wellness summaries." on={hr} onChange={setHr} />
              <div className="rounded-xl p-3.5 bg-accent/8 border border-accent/20 text-primary dark:text-accent" style={{ fontSize: 12.5, lineHeight: 1.6 }}>
                Data is processed on-device by default. Network sync uses end-to-end encryption.
              </div>
            </div>
          )}
          {active === "notifications" && (
            <div className="space-y-5">
              <div>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 600 }} className="text-neutral-900 dark:text-white">Notifications</h3>
                <p className="text-neutral-500 mt-1" style={{ fontSize: 13 }}>Choose how you'd like to be reminded.</p>
              </div>
              <Row icon={<Bell size={16} />} title="Push notifications" desc="Break, posture, and stress alerts." on={push} onChange={setPush} />
              <Row icon={<Bell size={16} />} title="Daily email summary" desc="Sent at 6 PM each weekday." on={email} onChange={setEmail} />
            </div>
          )}
          {active === "integrations" && (
            <div className="space-y-5">
              <div>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 600 }} className="text-neutral-900 dark:text-white">Integrations</h3>
                <p className="text-neutral-500 mt-1" style={{ fontSize: 13 }}>Connect FitWork to your work tools.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Integration name="Slack" desc="Auto-DND during deep work" color="#4A154B" />
                <Integration name="Google Calendar" desc="Sync focus blocks" color="#4285F4" />
                <Integration name="Microsoft Teams" desc="Status auto-update" color="#5059C9" />
              </div>
            </div>
          )}
          {active === "account" && (
            <div className="space-y-5">
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 600 }} className="text-neutral-900 dark:text-white">Account</h3>
              <Field label="Full name" value="Raditya Santosa" />
              <Field label="Email" value="raditya.santosa@fitwork.io" />
              <Field label="Job title" value="Senior Product Designer" />
              <Field label="Company" value="Lumen Labs" />
            </div>
          )}
          {active === "help" && (
            <div className="space-y-3">
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 600 }} className="text-neutral-900 dark:text-white">Help</h3>
              <p className="text-neutral-500" style={{ fontSize: 13.5, lineHeight: 1.6 }}>Visit our knowledge base or chat with the wellness coach.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Row({ icon, title, desc, on, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent/12 text-primary dark:text-accent flex items-center justify-center flex-shrink-0">{icon}</div>
        <div>
          <div className="text-neutral-900 dark:text-white" style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
          <div className="text-neutral-500 mt-0.5" style={{ fontSize: 12.5, lineHeight: 1.55 }}>{desc}</div>
        </div>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

function Integration({ name, desc, color }) {
  return (
    <div className="p-4 rounded-2xl border border-neutral-200 dark:border-white/10 hover:border-accent/40 transition">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: color, fontSize: 13, fontWeight: 700 }}>
        {name[0]}
      </div>
      <div className="mt-3 text-neutral-900 dark:text-white" style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
      <div className="text-neutral-500 mt-0.5" style={{ fontSize: 12 }}>{desc}</div>
      <button className="mt-3 w-full py-1.5 rounded-lg border border-accent/40 text-primary dark:text-accent hover:bg-accent/10" style={{ fontSize: 12, fontWeight: 600 }}>Connect</button>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <label style={{ fontSize: 13 }} className="text-neutral-500">{label}</label>
      <input defaultValue={value} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-bg-dark text-neutral-900 dark:text-white" style={{ fontSize: 14 }} />
    </div>
  );
}
