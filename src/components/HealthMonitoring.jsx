import { useState } from "react";
import { motion } from "motion/react";
import { Heart, Eye, Zap, Camera as CameraIcon, CameraOff, Loader2 } from "lucide-react";
import { Card, GaugeRing, StatusPill, TimelineItem } from "./shared";
import { useHealthData } from "../hooks/useHealthData";
import { useFaceVitals } from "../hooks/useFaceVitals";

const PERCLOS_THRESHOLD = Number(import.meta.env.VITE_PERCLOS_THRESHOLD) || 0.4;

/** Kamera nyata + overlay PERCLOS dari MediaPipe FaceMesh. */
function CameraFeed({ face }) {
  const { videoRef, canvasRef, vitals, status, start, stop } = face;
  const active = status === "running" || status === "no-face" || status === "loading";

  const statusLabel = {
    idle: "Camera off",
    loading: "Loading model…",
    running: vitals.faceDetected ? "Tracking" : "Searching face…",
    "no-face": "No face detected",
    denied: "Camera denied",
    error: "Camera error",
  }[status] || status;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600 }} className="text-neutral-900 dark:text-white">Camera feed</h3>
        <span className="inline-flex items-center gap-1.5 text-accent text-xs">
          <span className={`w-1.5 h-1.5 rounded-full bg-accent ${status === "running" ? "animate-pulse" : "opacity-40"}`} /> rPPG
        </span>
      </div>

      <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-neutral-900">
        {/* Video kamera (di-mirror agar terasa natural) */}
        <video
          ref={videoRef}
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
        {/* Canvas scratch untuk sampling rPPG (tak terlihat) */}
        <canvas ref={canvasRef} width={640} height={480} className="hidden" />

        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-linear-to-br from-primary/30 via-transparent to-accent/20">
            <CameraIcon size={28} className="text-white/70" />
            <button
              onClick={start}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent/90 text-white text-sm font-semibold active:scale-95 transition"
            >
              Start camera
            </button>
            {status === "denied" && <span className="text-danger text-xs">Izin kamera ditolak</span>}
            {status === "error" && <span className="text-danger text-xs">Gagal memuat model CV</span>}
          </div>
        )}

        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 size={24} className="text-white animate-spin" />
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-black/50 text-white text-xs font-mono">
            {status === "running" ? "640p · live" : "offline"}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-black/50 text-white text-xs">{statusLabel}</span>
        </div>

        {active && (
          <button
            onClick={stop}
            className="absolute top-3 right-3 w-7 h-7 rounded-md bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition"
            aria-label="Stop camera"
          >
            <CameraOff size={14} />
          </button>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <div className="text-white/70 mb-1.5 flex justify-between text-xs font-mono">
            <span>PERCLOS</span><span>{vitals.perclos} / {PERCLOS_THRESHOLD}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
            <motion.div
              className={`h-full ${vitals.perclos > PERCLOS_THRESHOLD ? "bg-danger" : "bg-accent"}`}
              animate={{ width: `${Math.min((vitals.perclos / PERCLOS_THRESHOLD) * 100, 100)}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>
      <p className="text-neutral-400 dark:text-neutral-500 mt-3 text-xs leading-relaxed">
        Facial landmarks tracked locally with MediaPipe. No video leaves your device.
      </p>
    </Card>
  );
}

// Bangun timeline kontekstual dari pembacaan terkini (bukan data statis)
function buildTimeline({ stressLevel, fatigueScore, vitals, focusScore }, now) {
  const t = (offsetMin) => {
    const d = new Date(now.getTime() - offsetMin * 60000);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  const items = [];
  if (stressLevel > 65) items.push({ time: t(0), text: `Stress spike detected — index at ${Math.round(stressLevel)}%`, type: "critical" });
  else if (stressLevel > 40) items.push({ time: t(0), text: `Stress index rising — now ${Math.round(stressLevel)}%`, type: "warning" });
  else items.push({ time: t(0), text: `Stress index stable at ${Math.round(stressLevel)}%`, type: "info" });

  if (vitals.perclos > PERCLOS_THRESHOLD) items.push({ time: t(5), text: `Eye strain warning — PERCLOS ${vitals.perclos}`, type: "warning" });
  else items.push({ time: t(5), text: `Blink rate normal — PERCLOS ${vitals.perclos}`, type: "info" });

  if (vitals.pupilDilation > 0.6) items.push({ time: t(12), text: "Pupil dilation increased — cognitive load high", type: "warning" });
  if (fatigueScore > 60) items.push({ time: t(18), text: `Fatigue elevated — score ${Math.round(fatigueScore)}%`, type: "critical" });
  else items.push({ time: t(18), text: `Fatigue under control — ${Math.round(fatigueScore)}%`, type: "info" });

  items.push({ time: t(25), text: `Focus session sustained — ${Math.round(focusScore)}/100`, type: "info" });
  return items;
}

export function HealthMonitoring() {
  const face = useFaceVitals();
  const camLive = face.status === "running" && face.vitals.faceDetected;

  // Kirim vitals kamera ke backend ML saat kamera aktif; jika tidak, hook
  // tetap menarik data mock/terakhir agar UI tidak pernah kosong.
  const { data, isLive, transport } = useHealthData(camLive ? face.vitals : null);

  // Saat kamera live, vitals yang ditampilkan = hasil CV nyata (bukan API).
  const vitals = camLive
    ? { ...data.vitals, ...face.vitals }
    : data.vitals;
  const { stressLevel, fatigueScore } = data;

  const hrStatus = vitals.heartRate > 100 ? "warning" : "normal";
  const pupilPct = Math.round(vitals.pupilDilation * 100);
  const pupilStatus = vitals.pupilDilation > 0.6 ? "warning" : "normal";
  const perclosStatus = vitals.perclos > PERCLOS_THRESHOLD ? "alert" : vitals.perclos > PERCLOS_THRESHOLD * 0.7 ? "warning" : "normal";

  const events = buildTimeline({ ...data, vitals }, new Date());

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(20px,4vw,28px)", fontWeight: 600 }} className="text-neutral-900 dark:text-white">
            Health Monitoring
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1" style={{ fontSize: 14 }}>
            {isLive
              ? `Live feed · ${transport === "signalr" ? "SignalR real-time" : "HTTP polling"}${camLive ? " · camera" : ""}`
              : "offline (mock)"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={stressLevel > 65 ? "alert" : "normal"} label={stressLevel > 65 ? "High stress" : "Normal"} />
          {vitals.perclos > PERCLOS_THRESHOLD && <StatusPill status="warning" label="Caution: eye strain" />}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-6">

        {/* Camera feed — kamera + MediaPipe FaceMesh nyata */}
        <CameraFeed face={face} />

        {/* Live vitals — dari kamera (CV) saat live, atau API */}
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
              <GaugeRing value={vitals.heartRate} max={140} size={88} unit="bpm" status={hrStatus} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center"><Eye size={18} /></div>
                <div>
                  <div className="text-neutral-600 dark:text-neutral-400 text-sm">Pupil Dilation</div>
                  <div className="text-neutral-400 text-xs">Cognitive load index</div>
                </div>
              </div>
              <GaugeRing value={pupilPct} size={88} unit="%" status={pupilStatus} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center"><Zap size={18} /></div>
                <div>
                  <div className="text-neutral-600 dark:text-neutral-400 text-sm">PERCLOS</div>
                  <div className="text-neutral-400 text-xs">Eye closure ratio</div>
                </div>
              </div>
              <GaugeRing value={vitals.perclos} max={PERCLOS_THRESHOLD} size={88} status={perclosStatus} />
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
