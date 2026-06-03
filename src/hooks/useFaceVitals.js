import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useFaceVitals
 * -------------------------------------------------------------
 * Computer-vision nyata di browser. Menyalakan webcam, menjalankan
 * MediaPipe FaceMesh (refine_landmarks = iris/pupil), lalu menghitung:
 *
 *   - perclos        : rasio mata tertutup (Eye Aspect Ratio → PERCLOS)
 *   - pupilDilation   : lebar iris / lebar mata (indeks beban kognitif)
 *   - heartRate       : estimasi BPM via rPPG (sinyal hijau dahi → FFT)
 *   - blinkRate       : kedipan per menit
 *
 * Semua diproses LOKAL. Tidak ada video yang keluar dari device.
 *
 * Pemakaian:
 *   const { videoRef, canvasRef, vitals, status, start, stop } = useFaceVitals();
 *   <video ref={videoRef} muted playsInline />
 *   <canvas ref={canvasRef} />   // overlay landmark (opsional)
 *
 * status: "idle" | "loading" | "running" | "no-face" | "denied" | "error"
 */

// ── MediaPipe FaceMesh dimuat dari CDN (hindari masalah bundling WASM Vite) ──
const FACEMESH_SCRIPTS = [
  "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
  "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js",
];

// Indeks landmark FaceMesh (468 + 10 iris saat refineLandmarks=true)
const L_EYE = { top: 159, bottom: 145, left: 33, right: 133 };
const R_EYE = { top: 386, bottom: 374, left: 362, right: 263 };
const L_IRIS = [468, 469, 470, 471, 472]; // pusat + 4 tepi
const R_IRIS = [473, 474, 475, 476, 477];
// Titik dahi untuk ROI rPPG (di antara alis, area kulit stabil)
const FOREHEAD = [10, 151, 9, 8, 107, 336];

const PERCLOS_THRESHOLD = Number(import.meta.env.VITE_PERCLOS_THRESHOLD) || 0.4;
const EAR_CLOSED = 0.21; // di bawah ini mata dianggap "tertutup"
const RPPG_WINDOW = 256; // ~8.5 dtk @ 30fps; cukup untuk satu estimasi FFT
const RPPG_MIN_SAMPLES = 150; // mulai estimasi setelah ~5 dtk data

let _scriptPromise = null;
function loadFaceMeshScripts() {
  if (_scriptPromise) return _scriptPromise;
  _scriptPromise = Promise.all(
    FACEMESH_SCRIPTS.map(
      (src) =>
        new Promise((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) return resolve();
          const s = document.createElement("script");
          s.src = src;
          s.crossOrigin = "anonymous";
          s.onload = resolve;
          s.onerror = () => reject(new Error(`Gagal memuat ${src}`));
          document.head.appendChild(s);
        })
    )
  );
  return _scriptPromise;
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** Eye Aspect Ratio: tinggi mata / lebar mata. Kecil = tertutup. */
function eyeAspectRatio(lm, eye) {
  const h = dist(lm[eye.top], lm[eye.bottom]);
  const w = dist(lm[eye.left], lm[eye.right]);
  return w === 0 ? 0 : h / w;
}

/** Diameter iris (rata-rata tepi ke pusat ×2) dinormalisasi ke lebar mata. */
function pupilRatio(lm, irisIdx, eye) {
  const c = lm[irisIdx[0]];
  let r = 0;
  for (let i = 1; i < irisIdx.length; i++) r += dist(lm[irisIdx[i]], c);
  r /= irisIdx.length - 1;
  const eyeW = dist(lm[eye.left], lm[eye.right]);
  return eyeW === 0 ? 0 : (r * 2) / eyeW; // diameter iris / lebar mata
}

/**
 * Estimasi heart rate dari buffer sinyal (warna hijau rata-rata dahi).
 * Detrend → Hann window → DFT → cari puncak di pita 0.7–4 Hz (42–240 bpm).
 * Mengembalikan { bpm, snr } atau null bila sinyal belum cukup.
 */
function estimateHeartRate(samples, fps) {
  const n = samples.length;
  if (n < RPPG_MIN_SAMPLES) return null;

  // Detrend (hilangkan drift dengan kurangi rata-rata bergerak sederhana)
  const mean = samples.reduce((a, b) => a + b, 0) / n;
  const sig = new Array(n);
  for (let i = 0; i < n; i++) sig[i] = samples[i] - mean;

  // Hann window
  for (let i = 0; i < n; i++) sig[i] *= 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));

  // DFT terbatas pada pita detak jantung (lebih murah daripada FFT penuh)
  const fLow = 0.7, fHigh = 4.0;
  const kLow = Math.floor((fLow * n) / fps);
  const kHigh = Math.ceil((fHigh * n) / fps);
  let bestK = -1, bestMag = 0, totalMag = 0;
  for (let k = kLow; k <= kHigh && k < n / 2; k++) {
    let re = 0, im = 0;
    const w = (2 * Math.PI * k) / n;
    for (let t = 0; t < n; t++) {
      re += sig[t] * Math.cos(w * t);
      im -= sig[t] * Math.sin(w * t);
    }
    const mag = Math.hypot(re, im);
    totalMag += mag;
    if (mag > bestMag) { bestMag = mag; bestK = k; }
  }
  if (bestK < 0) return null;

  const freq = (bestK * fps) / n;
  const bpm = Math.round(freq * 60);
  const snr = totalMag > 0 ? bestMag / (totalMag / (kHigh - kLow + 1)) : 0;
  if (bpm < 42 || bpm > 200) return null;
  return { bpm, snr };
}

export function useFaceVitals() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);
  const rafRef = useRef(null);

  // buffer rPPG & deteksi kedip
  const greenBuf = useRef([]);
  const frameTimes = useRef([]);
  const lastBlink = useRef(false);
  const blinkTimes = useRef([]);
  const perclosWindow = useRef([]); // EAR<closed boolean dalam jendela bergulir
  const hrRef = useRef(72);
  const hrConfRef = useRef(0);

  const [vitals, setVitals] = useState({
    heartRate: 72,
    perclos: 0.18,
    pupilDilation: 0.6,
    blinkRate: 15,
    ear: 0.3,
    faceDetected: false,
    hrConfidence: 0,
  });
  const [status, setStatus] = useState("idle");

  const onResults = useCallback((results) => {
    const now = performance.now();
    frameTimes.current.push(now);
    if (frameTimes.current.length > 60) frameTimes.current.shift();

    const faces = results.multiFaceLandmarks;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!faces || faces.length === 0) {
      setStatus("no-face");
      setVitals((v) => ({ ...v, faceDetected: false }));
      return;
    }
    setStatus("running");
    const lm = faces[0];

    // ── PERCLOS via EAR rata-rata kedua mata ──
    const earL = eyeAspectRatio(lm, L_EYE);
    const earR = eyeAspectRatio(lm, R_EYE);
    const ear = (earL + earR) / 2;
    const closed = ear < EAR_CLOSED;

    perclosWindow.current.push(closed ? 1 : 0);
    if (perclosWindow.current.length > 150) perclosWindow.current.shift(); // ~5 dtk
    const perclos =
      perclosWindow.current.reduce((a, b) => a + b, 0) /
      Math.max(perclosWindow.current.length, 1);

    // Deteksi kedip (transisi terbuka→tertutup)
    if (closed && !lastBlink.current) blinkTimes.current.push(now);
    lastBlink.current = closed;
    blinkTimes.current = blinkTimes.current.filter((t) => now - t < 60000);
    const blinkRate = blinkTimes.current.length; // per menit (jendela 60 dtk)

    // ── Pupil dilation ──
    const pupilDilation =
      (pupilRatio(lm, L_IRIS, L_EYE) + pupilRatio(lm, R_IRIS, R_EYE)) / 2;

    // ── rPPG: warna hijau rata-rata pada ROI dahi ──
    let hr = hrRef.current;
    let hrConfidence = hrConfRef.current;
    if (videoRef.current && canvas) {
      const vw = videoRef.current.videoWidth;
      const vh = videoRef.current.videoHeight;
      if (vw && vh) {
        // bounding box dahi dalam piksel
        let minX = 1, minY = 1, maxX = 0, maxY = 0;
        for (const idx of FOREHEAD) {
          minX = Math.min(minX, lm[idx].x); maxX = Math.max(maxX, lm[idx].x);
          minY = Math.min(minY, lm[idx].y); maxY = Math.max(maxY, lm[idx].y);
        }
        const sx = Math.max(0, Math.floor(minX * vw));
        const sy = Math.max(0, Math.floor(minY * vh));
        const sw = Math.max(1, Math.floor((maxX - minX) * vw));
        const sh = Math.max(1, Math.floor((maxY - minY) * vh));
        try {
          const tmp = ctx; // pakai canvas overlay sebagai scratch
          tmp.drawImage(videoRef.current, sx, sy, sw, sh, 0, 0, sw, sh);
          const px = tmp.getImageData(0, 0, sw, sh).data;
          let g = 0;
          for (let i = 0; i < px.length; i += 4) g += px[i + 1];
          g /= px.length / 4;
          greenBuf.current.push(g);
          if (greenBuf.current.length > RPPG_WINDOW) greenBuf.current.shift();
          tmp.clearRect(0, 0, sw, sh);
        } catch { /* CORS/empty frame — abaikan frame ini */ }

        // estimasi fps dari timestamp nyata
        const ft = frameTimes.current;
        const fps =
          ft.length > 1 ? (ft.length - 1) / ((ft[ft.length - 1] - ft[0]) / 1000) : 30;
        const est = estimateHeartRate(greenBuf.current, fps || 30);
        if (est) {
          // smoothing eksponensial agar angka tidak melompat-lompat
          hr = Math.round(hrRef.current * 0.8 + est.bpm * 0.2);
          hrRef.current = hr;
          hrConfidence = Math.min(1, est.snr / 4);
          hrConfRef.current = hrConfidence;
        }
      }
    }

    setVitals({
      heartRate: hr,
      perclos: Number(perclos.toFixed(2)),
      pupilDilation: Number(pupilDilation.toFixed(2)),
      blinkRate,
      ear: Number(ear.toFixed(2)),
      faceDetected: true,
      hrConfidence: Number(hrConfidence.toFixed(2)),
    });
  }, []);

  const start = useCallback(async () => {
    try {
      setStatus("loading");
      await loadFaceMeshScripts();
      const FaceMesh = window.FaceMesh;
      const Camera = window.Camera;
      if (!FaceMesh || !Camera) throw new Error("MediaPipe gagal dimuat");

      const fm = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      fm.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true, // wajib untuk iris/pupil
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      fm.onResults(onResults);
      faceMeshRef.current = fm;

      const video = videoRef.current;
      const cam = new Camera(video, {
        onFrame: async () => {
          if (faceMeshRef.current) await faceMeshRef.current.send({ image: video });
        },
        width: 640,
        height: 480,
      });
      cameraRef.current = cam;
      await cam.start();
      setStatus("running");
    } catch (e) {
      if (e?.name === "NotAllowedError") setStatus("denied");
      else setStatus("error");
      console.error("[useFaceVitals]", e);
    }
  }, [onResults]);

  const stop = useCallback(() => {
    try { cameraRef.current?.stop?.(); } catch {}
    try {
      const stream = videoRef.current?.srcObject;
      stream?.getTracks?.().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch {}
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setStatus("idle");
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { videoRef, canvasRef, vitals, status, start, stop };
}

export default useFaceVitals;
