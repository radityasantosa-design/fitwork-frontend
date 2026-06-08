/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useGazeGesture } from "../hooks/useGazeGesture";
import { useGazeOverlay, GazeOverlayPortal } from "../hooks/useGazeOverlay";
import { CalibrationOverlay } from "../components/CalibrationOverlay";

/**
 * GazeControlProvider
 * ---------------------------------------------------------------
 * Kendali gaze + gesture tingkat GLOBAL (Smart Control). Kamera, overlay
 * titik tatapan, dan eksekusi aksi (klik/scroll via gesture) hidup di
 * seluruh aplikasi — bukan terkunci di satu halaman. Halaman Eye & Gesture
 * hanya menjadi panel kontrol (nyalakan/matikan, kalibrasi, lihat status).
 *
 * Overlay & calibration di-render di sini supaya selalu tampil di atas
 * halaman manapun yang sedang dibuka.
 */

const GazeControlContext = createContext(null);

export function GazeControlProvider({ children }) {
  const {
    videoRef, gaze, gesture, fps, status, sessionStats,
    start, stop, preload, getRawGaze, setCalibration,
  } = useGazeGesture();

  const [eye, setEye] = useState(true);
  const [gestureOn, setGestureOn] = useState(true);
  const [auto, setAuto] = useState(false);
  const [calibrated, setCalibrated] = useState(false);
  const [showCalib, setShowCalib] = useState(false);

  const running = status === "running";
  const faceDetected = running && gaze != null;
  const activeGestureName = gesture?.name && gesture.name !== "Idle" ? gesture.name : null;

  // Overlay tatapan global: aktif saat tracking jalan & sudah dikalibrasi.
  const overlayReady = running && calibrated;
  const effectiveGaze = eye && overlayReady ? gaze : null;
  const effectiveGesture = gestureOn && overlayReady ? gesture : null;
  const { dotPos } = useGazeOverlay(effectiveGaze, effectiveGesture, overlayReady);

  const handleCalibComplete = useCallback((cal) => {
    setCalibration(cal);
    setCalibrated(true);
    setShowCalib(false);
  }, [setCalibration]);

  // Matikan kontrol: stop kamera + reset status kalibrasi sesi.
  const disable = useCallback(() => {
    stop();
    setCalibrated(false);
  }, [stop]);

  // Ambil MediaStream aktif (untuk preview di halaman Eye & Gesture).
  const getStream = useCallback(() => videoRef.current?.srcObject || null, [videoRef]);

  const value = useMemo(() => ({
    gaze, gesture, fps, status, sessionStats,
    start, stop, disable, preload, getRawGaze, getStream,
    running, faceDetected, calibrated,
    eye, setEye, gestureOn, setGestureOn, auto, setAuto,
    requestCalibration: () => setShowCalib(true),
  }), [
    gaze, gesture, fps, status, sessionStats,
    start, stop, disable, preload, getRawGaze, getStream,
    running, faceDetected, calibrated, eye, gestureOn, auto,
  ]);

  return (
    <GazeControlContext.Provider value={value}>
      {/* Video sumber MediaPipe — SELALU mounted di level global supaya kamera
          tidak mati saat pindah halaman. Halaman Eye & Gesture menampilkan
          preview lewat <GazePreview/> (mirror stream yang sama). */}
      <video
        ref={videoRef}
        muted
        playsInline
        style={{ position: "fixed", width: 1, height: 1, opacity: 0, pointerEvents: "none", top: -9999, left: -9999 }}
      />
      {children}

      {/* Titik tatapan global di atas halaman manapun */}
      <GazeOverlayPortal dotPos={dotPos} gestureName={activeGestureName} />

      {/* Kalibrasi 5-titik global */}
      {showCalib && running && (
        <CalibrationOverlay
          getRawGaze={getRawGaze}
          onComplete={handleCalibComplete}
          onCancel={() => setShowCalib(false)}
        />
      )}
    </GazeControlContext.Provider>
  );
}

export function useGazeControl() {
  const ctx = useContext(GazeControlContext);
  if (!ctx) throw new Error("useGazeControl harus dipakai di dalam GazeControlProvider");
  return ctx;
}

export default GazeControlProvider;
