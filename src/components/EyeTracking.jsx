import { useState } from "react";
import { motion } from "motion/react";
import { MousePointer, Hand, ArrowDownUp, ZoomIn, Camera as CameraIcon, CameraOff, Loader2, CheckCircle2 } from "lucide-react";
import { Card, Toggle } from "./shared";
import { useGazeGesture } from "../hooks/useGazeGesture";
import { useT } from "../i18n/LanguageProvider";

// `name` = label kanonik dari hook (untuk pencocokan), `labelKey`/`descKey` = i18n.
const gestures = [
  { icon: <MousePointer size={20} />, name: "Cursor Move", labelKey: "eye.cursorMove", descKey: "eye.cursorMoveDesc" },
  { icon: <Hand size={20} />,         name: "Click",       labelKey: "eye.click",      descKey: "eye.clickDesc" },
  { icon: <ArrowDownUp size={20} />,  name: "Scroll",      labelKey: "eye.scroll",     descKey: "eye.scrollDesc" },
  { icon: <ZoomIn size={20} />,       name: "Zoom",        labelKey: "eye.zoom",       descKey: "eye.zoomDesc" },
];

export function EyeTracking() {
  const { t } = useT();
  const { videoRef, gaze, gesture, fps, status, start, stop } = useGazeGesture();
  const [eye, setEye]         = useState(true);
  const [gestureOn, setGesture] = useState(true);
  const [auto, setAuto]       = useState(false);

  const running = status === "running";
  const active = running || status === "loading";
  const activeGestureName = gesture?.name && gesture.name !== "Idle" ? gesture.name : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6">
      <div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(20px,4vw,28px)", fontWeight: 600 }} className="text-neutral-900 dark:text-white">
          {t("eye.title")}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1" style={{ fontSize: 14 }}>
          {t("eye.sub", { state: running ? t("eye.cameraOn") : t("eye.cameraOff") })}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-6">

        {/* Live gaze — kamera nyata + titik gaze dari iris */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600 }} className="text-neutral-900 dark:text-white">{t("eye.liveGaze")}</h3>
            {active && (
              <button onClick={stop} className="text-neutral-400 hover:text-danger transition" aria-label={t("eye.stopTracking")}>
                <CameraOff size={16} />
              </button>
            )}
          </div>
          <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-neutral-900">
            <video ref={videoRef} muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />

            {!active && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-linear-to-br from-primary/20 via-transparent to-accent/10">
                <CameraIcon size={26} className="text-white/70" />
                <button onClick={start} className="px-4 py-2 rounded-xl bg-accent hover:bg-accent/90 text-white text-sm font-semibold active:scale-95 transition">
                  {t("eye.startTracking")}
                </button>
                {status === "denied" && <span className="text-danger text-xs">{t("health.permissionDenied")}</span>}
                {status === "error" && <span className="text-danger text-xs">{t("health.modelError")}</span>}
              </div>
            )}

            {status === "loading" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 size={24} className="text-white animate-spin" />
              </div>
            )}

            {/* Titik gaze nyata */}
            {running && gaze && (
              <motion.div
                className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full bg-accent/30 backdrop-blur-sm pointer-events-none"
                animate={{ left: `${gaze.x * 100}%`, top: `${gaze.y * 100}%` }}
                transition={{ type: "tween", duration: 0.12 }}
              >
                <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-accent shadow-[0_0_20px_#1D9E75]" />
              </motion.div>
            )}

            <div className="absolute bottom-3 left-3 right-3 flex justify-between text-white/70 text-xs font-mono">
              <span>{gaze ? `gaze: x ${gaze.x} y ${gaze.y}` : "gaze: --"}</span>
              <span>{running ? `${fps} fps` : "offline"}</span>
            </div>
            {running && !gaze && (
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-warning/80 text-white text-xs">{t("health.camNoFace")}</div>
            )}
          </div>
          <p className="text-neutral-400 dark:text-neutral-500 mt-3 text-xs leading-relaxed">
            {t("eye.gazeHint")}
          </p>
        </Card>

        {/* Gesture guide — highlight gesture yang AKTIF terdeteksi */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600 }} className="text-neutral-900 dark:text-white">{t("eye.gestureGuide")}</h3>
            {running && (
              <span className="text-xs font-mono text-accent">
                {activeGestureName ? `▶ ${activeGestureName}` : t("eye.noHand")}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {gestures.map((g) => {
              const isActive = activeGestureName === g.name;
              return (
                <motion.div
                  key={g.name}
                  animate={{ scale: isActive ? 1.03 : 1 }}
                  className={`p-4 rounded-2xl border transition ${
                    isActive
                      ? "border-accent bg-accent/10"
                      : "border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/3"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? "bg-accent text-white" : "bg-accent/10 text-primary dark:text-accent"}`}>
                    {g.icon}
                  </div>
                  <div className="mt-3 text-neutral-800 dark:text-white font-semibold text-sm">{t(g.labelKey)}</div>
                  <div className="text-neutral-500 dark:text-neutral-400 mt-0.5 text-xs">{t(g.descKey)}</div>
                  <div className="mt-2 h-1 rounded-full bg-accent/15 overflow-hidden">
                    <motion.div className="h-full bg-accent" animate={{ width: isActive ? `${Math.round((gesture?.conf || 0) * 100)}%` : "0%" }} transition={{ duration: 0.2 }} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* Calibration / toggles */}
        <Card className="p-5 flex flex-col">
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600 }} className="text-neutral-900 dark:text-white">{t("eye.statusTitle")}</h3>
          <div className="mt-4 p-4 rounded-2xl bg-accent/8 border border-accent/25">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className={running ? "text-accent" : "text-neutral-400"} />
              <span className={`font-semibold text-sm ${running ? "text-primary dark:text-accent" : "text-neutral-400"}`}>
                {running ? t("eye.trackingActive") : t("eye.trackingIdle")}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 32, fontWeight: 600 }} className="text-neutral-900 dark:text-white">
                {running ? fps : "--"}
              </span>
              <span className="text-neutral-500 text-sm">fps</span>
            </div>
            <div className="mt-1 text-neutral-400 text-xs">
              {gesture ? `${t("eye.handDetected")}: ${gesture.name} (${Math.round(gesture.conf * 100)}%)` : t("eye.noHand")}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {[
              { label: t("eye.eyeTracking"),        value: eye,       setter: setEye },
              { label: t("eye.gestureRecognition"), value: gestureOn, setter: setGesture },
              { label: t("eye.autoSensitivity"),    value: auto,      setter: setAuto },
            ].map(({ label, value, setter }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-neutral-700 dark:text-neutral-200 text-sm">{label}</span>
                <Toggle on={value} onChange={setter} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
