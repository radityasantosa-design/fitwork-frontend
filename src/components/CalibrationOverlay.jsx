import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { useT } from "../i18n/LanguageProvider";

/**
 * CalibrationOverlay
 * ---------------------------------------------------------------
 * Kalibrasi 5-titik untuk eye-tracking. Menampilkan target fullscreen
 * di 5 posisi (4 sudut + tengah). Untuk tiap titik, user menatapnya
 * selama SAMPLE_MS sambil sistem mengumpulkan nilai iris MENTAH via
 * getRawGaze(). Dari sebaran sampel dihitung rentang min/max per sumbu,
 * lalu diteruskan ke onComplete sebagai mapping kalibrasi.
 *
 * @param {() => {x,y}} getRawGaze  - ambil nilai iris mentah terbaru
 * @param {(cal) => void} onComplete - dipanggil dgn { x:{min,max}, y:{min,max} }
 * @param {() => void} onCancel     - batalkan kalibrasi
 */

const SETTLE_MS = 600;    // jeda agar mata pindah dulu sebelum sampling
const POINTS = [
  { x: 0.5,  y: 0.5  },   // tengah dulu (netral)
  { x: 0.08, y: 0.08 },   // kiri-atas
  { x: 0.92, y: 0.08 },   // kanan-atas
  { x: 0.92, y: 0.92 },   // kanan-bawah
  { x: 0.08, y: 0.92 },   // kiri-bawah
];

// Butuh sekian sampel VALID (wajah terdeteksi) agar satu titik dianggap selesai.
const NEEDED_SAMPLES = 45; // ≈1.5 dtk @30fps bila wajah stabil

export function CalibrationOverlay({ getRawGaze, onComplete, onCancel }) {
  const { t } = useT();
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("settle"); // settle | sampling
  const [progress, setProgress] = useState(0);
  const [faceLost, setFaceLost] = useState(false);
  const samplesRef = useRef([]); // [{ point:{x,y}, raw:{x,y} }]

  useEffect(() => {
    let raf;
    const point = POINTS[idx];
    const collected = [];

    // Fase "settle": beri jeda agar mata pindah ke titik baru sebelum sampling.
    const settleTimer = setTimeout(() => {
      setPhase("sampling");

      const tick = () => {
        const raw = getRawGaze();
        if (raw) {
          collected.push(raw);
          setFaceLost(false);
        } else {
          // Wajah hilang → progress berhenti maju sampai wajah kembali.
          setFaceLost(true);
        }
        setProgress(Math.min(1, collected.length / NEEDED_SAMPLES));

        if (collected.length < NEEDED_SAMPLES) {
          raf = requestAnimationFrame(tick);
        } else {
          // median tiap sumbu → tahan outlier
          const xs = collected.map((r) => r.x).sort((a, b) => a - b);
          const ys = collected.map((r) => r.y).sort((a, b) => a - b);
          const med = (arr) => arr.length ? arr[Math.floor(arr.length / 2)] : 0.5;
          samplesRef.current.push({ point, raw: { x: med(xs), y: med(ys) } });

          if (idx < POINTS.length - 1) {
            setPhase("settle");
            setProgress(0);
            setIdx((i) => i + 1);
          } else {
            finalize();
          }
        }
      };
      raf = requestAnimationFrame(tick);
    }, SETTLE_MS);

    function finalize() {
      const s = samplesRef.current;
      // Rentang iris: gabung sampel dari semua titik tepi.
      const rawXs = s.map((p) => p.raw.x);
      const rawYs = s.map((p) => p.raw.y);
      const cal = {
        x: { min: Math.min(...rawXs), max: Math.max(...rawXs) },
        y: { min: Math.min(...rawYs), max: Math.max(...rawYs) },
      };
      onComplete(cal);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settleTimer);
    };
  }, [idx, getRawGaze, onComplete]);

  const target = POINTS[idx];

  return createPortal(
    <div className="fixed inset-0 z-[100000] bg-neutral-900/95 backdrop-blur-sm">
      {/* Instruksi */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center px-4">
        <h2 className="text-white text-xl font-semibold" style={{ fontFamily: "'Sora', sans-serif" }}>
          {t("eye.calibTitle")}
        </h2>
        <p className="text-white/70 text-sm mt-2">
          {phase === "sampling" ? t("eye.calibLook") : t("eye.calibGetReady")}
        </p>
        <p className="text-accent text-xs mt-3 font-mono">
          {idx + 1} / {POINTS.length}
        </p>
        {faceLost && phase === "sampling" && (
          <p className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-warning/90 text-white text-xs font-medium">
            {t("eye.calibFaceLost")}
          </p>
        )}
      </div>

      {/* Target titik */}
      <motion.div
        className="absolute"
        animate={{ left: `${target.x * 100}%`, top: `${target.y * 100}%` }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        style={{ marginLeft: -32, marginTop: -32 }}
      >
        <div className="relative w-16 h-16">
          {/* Cincin progress */}
          <svg className="absolute inset-0 -rotate-90" width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
            <circle
              cx="32" cy="32" r="28" fill="none" stroke="#1D9E75" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 28}
              strokeDashoffset={2 * Math.PI * 28 * (1 - (phase === "sampling" ? progress : 0))}
            />
          </svg>
          {/* Titik tengah berdenyut */}
          <motion.div
            className="absolute inset-0 m-auto w-5 h-5 rounded-full bg-accent shadow-[0_0_24px_#1D9E75]"
            animate={{ scale: phase === "sampling" ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Batalkan */}
      <button
        onClick={onCancel}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition"
      >
        {t("eye.calibCancel")}
      </button>
    </div>,
    document.body
  );
}

export default CalibrationOverlay;
