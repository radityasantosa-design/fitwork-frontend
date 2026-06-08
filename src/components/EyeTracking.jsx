import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { MousePointer, Hand, ArrowDownUp, ZoomIn, Camera as CameraIcon, CameraOff, Loader2, CheckCircle2, Crosshair, AlertCircle } from "lucide-react";
import { Card, Toggle } from "./shared";
import { useGazeGesture } from "../hooks/useGazeGesture";
import { useGazeOverlay, GazeOverlayPortal } from "../hooks/useGazeOverlay";
import { CalibrationOverlay } from "./CalibrationOverlay";
import { useT } from "../i18n/LanguageProvider";

const gestures = [
  { icon: <MousePointer size={20} />, name: "Cursor Move", labelKey: "eye.cursorMove", descKey: "eye.cursorMoveDesc" },
  { icon: <Hand size={20} />,         name: "Click",       labelKey: "eye.click",      descKey: "eye.clickDesc" },
  { icon: <ArrowDownUp size={20} />,  name: "Scroll",      labelKey: "eye.scroll",     descKey: "eye.scrollDesc" },
  { icon: <ZoomIn size={20} />,       name: "Zoom",        labelKey: "eye.zoom",       descKey: "eye.zoomDesc" },
];

export function EyeTracking() {
  const { t } = useT();
  const { videoRef, gaze, gesture, fps, status, sessionStats, start, stop, preload, getRawGaze, setCalibration } = useGazeGesture();
  const [eye, setEye]         = useState(true);
  const [gestureOn, setGestureOn] = useState(true);
  const [auto, setAuto]       = useState(false);
  const [calibrated, setCalibrated] = useState(false);
  const [showCalib, setShowCalib] = useState(false);

  useEffect(() => {
    let idleId, timeoutId;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(() => preload());
    } else {
      timeoutId = setTimeout(() => preload(), 800);
    }
    return () => {
      if (idleId) window.cancelIdleCallback?.(idleId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [preload]);

  // Hentikan kamera saat keluar dari page → overlay tatapan TIDAK ikut ke page lain.
  useEffect(() => () => stop(), [stop]);

  const running = status === "running";
  const active = running || status === "loading";
  const activeGestureName = gesture?.name && gesture.name !== "Idle" ? gesture.name : null;

  // Overlay tatapan: hanya saat tracking aktif & sudah dikalibrasi.
  const overlayReady = running && calibrated;
  const effectiveGaze = eye && overlayReady ? gaze : null;
  const effectiveGesture = gestureOn && overlayReady ? gesture : null;
  const { dotPos } = useGazeOverlay(effectiveGaze, effectiveGesture, overlayReady);

  const handleCalibComplete = useCallback((cal) => {
    setCalibration(cal);
    setCalibrated(true);
    setShowCalib(false);
  }, [setCalibration]);

  const faceRate = sessionStats.totalFrames > 0
    ? Math.round((sessionStats.faceFrames / sessionStats.totalFrames) * 100)
    : null;
  const handRate = sessionStats.totalFrames > 0
    ? Math.round((sessionStats.handFrames / sessionStats.totalFrames) * 100)
    : null;

  const subtitle = !running
    ? t("eye.sub", { state: t("eye.cameraOff") })
    : !calibrated
      ? t("eye.needCalib")
      : t("eye.overlayHint");

  return (
    <>
      {/* Dot tatapan di atas seluruh halaman (aktif hanya saat tracking + kalibrasi) */}
      <GazeOverlayPortal dotPos={dotPos} gestureName={activeGestureName} />

      {/* Overlay kalibrasi 5-titik */}
      {showCalib && running && (
        <CalibrationOverlay
          getRawGaze={getRawGaze}
          onComplete={handleCalibComplete}
          onCancel={() => setShowCalib(false)}
        />
      )}

      <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6">
        <div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(20px,4vw,28px)", fontWeight: 600 }} className="text-neutral-900 dark:text-white">
            {t("eye.title")}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1" style={{ fontSize: 14 }}>
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-6">

          {/* Live gaze — tampilan kamera dengan dot iris */}
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

              {/* Titik iris kecil di dalam video (referensi) */}
              {running && gaze && (
                <motion.div
                  className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-accent/20 border border-accent/50 pointer-events-none"
                  animate={{ left: `${gaze.x * 100}%`, top: `${gaze.y * 100}%` }}
                  transition={{ type: "tween", duration: 0.08 }}
                >
                  <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-accent" />
                </motion.div>
              )}

              <div className="absolute bottom-3 left-3 right-3 flex justify-between text-white/70 text-xs font-mono">
                <span>{gaze ? `x ${gaze.x} y ${gaze.y}` : "gaze: --"}</span>
                <span>{running ? `${fps} fps` : "offline"}</span>
              </div>
              {running && !gaze && (
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-warning/80 text-white text-xs">{t("health.camNoFace")}</div>
              )}
            </div>
            <p className="text-neutral-400 dark:text-neutral-500 mt-3 text-xs leading-relaxed">
              {running ? t("eye.overlayHint") : t("eye.gazeHint")}
            </p>
          </Card>

          {/* Gesture guide */}
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

          {/* Status + Calibration */}
          <Card className="p-5 flex flex-col gap-5">
            {/* Status tracking */}
            <div>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600 }} className="text-neutral-900 dark:text-white">{t("eye.statusTitle")}</h3>
              <div className="mt-3 p-4 rounded-2xl bg-accent/8 border border-accent/25">
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

              {/* Kalibrasi — wajib sebelum overlay aktif */}
              {running && (
                <div className="mt-3">
                  {calibrated ? (
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-accent/8 border border-accent/25">
                      <span className="flex items-center gap-2 text-accent text-xs font-semibold">
                        <CheckCircle2 size={14} /> {t("eye.calibrated")}
                      </span>
                      <button onClick={() => setShowCalib(true)} className="text-neutral-500 dark:text-neutral-400 hover:text-accent text-xs underline">
                        {t("eye.recalibrate")}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCalib(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white text-sm font-semibold active:scale-95 transition"
                    >
                      <Crosshair size={15} /> {t("eye.startCalib")}
                    </button>
                  )}
                  {!calibrated && (
                    <p className="mt-2 flex items-start gap-1.5 text-warning text-xs">
                      <AlertCircle size={13} className="shrink-0 mt-0.5" /> {t("eye.calibRequired")}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Session stats — data nyata dari MediaPipe */}
            {running && sessionStats.totalFrames > 0 && (
              <div>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600 }} className="text-neutral-900 dark:text-white">{t("eye.sessionStats")}</h3>
                <div className="mt-3 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-500 dark:text-neutral-400">{t("eye.faceDetection")}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-neutral-800 dark:text-white font-semibold">{faceRate}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-accent/15 overflow-hidden">
                      <motion.div className="h-full bg-accent" animate={{ width: `${faceRate}%` }} transition={{ duration: 0.3 }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-500 dark:text-neutral-400">{t("eye.handDetection")}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-neutral-800 dark:text-white font-semibold">{handRate}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-accent/15 overflow-hidden">
                      <motion.div className="h-full bg-accent" animate={{ width: `${handRate}%` }} transition={{ duration: 0.3 }} />
                    </div>
                  </div>
                  <p className="text-neutral-400 dark:text-neutral-500 text-xs">
                    {sessionStats.totalFrames} {t("eye.framesProcessed")}
                  </p>
                </div>
              </div>
            )}

            {/* Toggles */}
            <div className="space-y-4">
              {[
                { label: t("eye.eyeTracking"),        value: eye,       setter: setEye },
                { label: t("eye.gestureRecognition"), value: gestureOn, setter: setGestureOn },
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
    </>
  );
}
