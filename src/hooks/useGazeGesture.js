import { useCallback, useRef, useState } from "react";

/**
 * useGazeGesture
 * -------------------------------------------------------------
 * Kendali non-invasif (proposal §Fitur "Kendali Digital Non-Invasif"):
 *   - GAZE  : arah pandang dari posisi iris relatif kelopak mata
 *             (MediaPipe FaceMesh, refineLandmarks).
 *   - GESTURE: deteksi isyarat tangan (MediaPipe Hands) — pinch/click,
 *             open palm/cursor, two-finger scroll, spread/zoom.
 *
 * Semua diproses LOKAL. Mengembalikan gaze {x,y} ternormalisasi [0..1]
 * dan gesture aktif beserta confidence. Status N/A bila tak terdeteksi.
 */

const SCRIPTS = [
  "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
  "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js",
  "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js",
];

// Iris & sudut mata (FaceMesh refineLandmarks)
const L_IRIS = 468, R_IRIS = 473;
const L_EYE_L = 33, L_EYE_R = 133, L_EYE_T = 159, L_EYE_B = 145;
const R_EYE_L = 362, R_EYE_R = 263, R_EYE_T = 386, R_EYE_B = 374;

// Landmark tangan (MediaPipe Hands, 21 titik)
const WRIST = 0, THUMB_TIP = 4, INDEX_TIP = 8, MIDDLE_TIP = 12,
  RING_TIP = 16, PINKY_TIP = 20, INDEX_PIP = 6, MIDDLE_PIP = 10,
  RING_PIP = 14, PINKY_PIP = 18;

let _p = null;
function loadScripts() {
  if (_p) return _p;
  _p = Promise.all(
    SCRIPTS.map(
      (src) =>
        new Promise((res, rej) => {
          if (document.querySelector(`script[src="${src}"]`)) return res();
          const s = document.createElement("script");
          s.src = src; s.crossOrigin = "anonymous";
          s.onload = res; s.onerror = () => rej(new Error(`Gagal memuat ${src}`));
          document.head.appendChild(s);
        })
    )
  );
  return _p;
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** Posisi iris relatif kotak mata → gaze [0..1] per sumbu. */
function eyeGaze(lm, iris, L, R, T, B) {
  const x = (lm[iris].x - lm[L].x) / ((lm[R].x - lm[L].x) || 1);
  const y = (lm[iris].y - lm[T].y) / ((lm[B].y - lm[T].y) || 1);
  return { x, y };
}

/** Apakah satu jari "terangkat" (tip lebih tinggi/jauh dari sendi PIP). */
function fingerUp(lm, tip, pip) {
  return lm[tip].y < lm[pip].y; // koordinat y kecil = lebih atas
}

/** Klasifikasi gesture dari 21 landmark tangan. */
function classifyGesture(lm) {
  const handSize = dist(lm[WRIST], lm[MIDDLE_PIP]) || 1;
  const pinch = dist(lm[THUMB_TIP], lm[INDEX_TIP]) / handSize; // kecil = pinch
  const spread = dist(lm[INDEX_TIP], lm[PINKY_TIP]) / handSize; // besar = terbuka

  const idx = fingerUp(lm, INDEX_TIP, INDEX_PIP);
  const mid = fingerUp(lm, MIDDLE_TIP, MIDDLE_PIP);
  const ring = fingerUp(lm, RING_TIP, RING_PIP);
  const pinky = fingerUp(lm, PINKY_TIP, PINKY_PIP);
  const upCount = [idx, mid, ring, pinky].filter(Boolean).length;

  if (pinch < 0.35) return { name: "Click", hint: "Pinch detected", conf: Math.min(1, (0.35 - pinch) / 0.35 + 0.3) };
  if (idx && mid && !ring && !pinky) return { name: "Scroll", hint: "Two fingers up", conf: 0.8 };
  if (upCount >= 4 && spread > 0.9) return { name: "Zoom", hint: "Spread fingers", conf: 0.75 };
  if (upCount >= 4) return { name: "Cursor Move", hint: "Open palm", conf: 0.7 };
  return { name: "Idle", hint: "No clear gesture", conf: 0.3 };
}

export function useGazeGesture() {
  const videoRef = useRef(null);
  const faceMeshRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const gazeSmooth = useRef({ x: 0.5, y: 0.5 });

  const [gaze, setGaze] = useState(null);     // {x,y} atau null
  const [gesture, setGesture] = useState(null); // {name,hint,conf} atau null
  const [fps, setFps] = useState(0);
  const [status, setStatus] = useState("idle"); // idle|loading|running|denied|error
  const frameTimes = useRef([]);

  const onFace = useCallback((results) => {
    const now = performance.now();
    frameTimes.current.push(now);
    if (frameTimes.current.length > 30) frameTimes.current.shift();
    const ft = frameTimes.current;
    if (ft.length > 1) setFps(Math.round((ft.length - 1) / ((ft[ft.length - 1] - ft[0]) / 1000)));

    const faces = results.multiFaceLandmarks;
    if (!faces || faces.length === 0) { setGaze(null); return; }
    const lm = faces[0];
    const gl = eyeGaze(lm, L_IRIS, L_EYE_L, L_EYE_R, L_EYE_T, L_EYE_B);
    const gr = eyeGaze(lm, R_IRIS, R_EYE_L, R_EYE_R, R_EYE_T, R_EYE_B);
    // rata-rata kedua mata; mirror x agar sesuai tampilan kamera ter-mirror
    let x = 1 - (gl.x + gr.x) / 2;
    let y = (gl.y + gr.y) / 2;
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));
    // smoothing
    gazeSmooth.current.x = gazeSmooth.current.x * 0.7 + x * 0.3;
    gazeSmooth.current.y = gazeSmooth.current.y * 0.7 + y * 0.3;
    setGaze({ x: Number(gazeSmooth.current.x.toFixed(3)), y: Number(gazeSmooth.current.y.toFixed(3)) });
  }, []);

  const onHands = useCallback((results) => {
    const hands = results.multiHandLandmarks;
    if (!hands || hands.length === 0) { setGesture(null); return; }
    setGesture(classifyGesture(hands[0]));
  }, []);

  const start = useCallback(async () => {
    try {
      setStatus("loading");
      await loadScripts();
      const { FaceMesh, Hands, Camera } = window;
      if (!FaceMesh || !Hands || !Camera) throw new Error("MediaPipe gagal dimuat");

      const fm = new FaceMesh({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}` });
      fm.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
      fm.onResults(onFace);
      faceMeshRef.current = fm;

      const hands = new Hands({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
      hands.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
      hands.onResults(onHands);
      handsRef.current = hands;

      const video = videoRef.current;
      const cam = new Camera(video, {
        onFrame: async () => {
          if (faceMeshRef.current) await faceMeshRef.current.send({ image: video });
          if (handsRef.current) await handsRef.current.send({ image: video });
        },
        width: 640, height: 480,
      });
      cameraRef.current = cam;
      await cam.start();
      setStatus("running");
    } catch (e) {
      setStatus(e?.name === "NotAllowedError" ? "denied" : "error");
      console.error("[useGazeGesture]", e);
    }
  }, [onFace, onHands]);

  const stop = useCallback(() => {
    try { cameraRef.current?.stop?.(); } catch {}
    try {
      const stream = videoRef.current?.srcObject;
      stream?.getTracks?.().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch {}
    setGaze(null); setGesture(null); setStatus("idle");
  }, []);

  return { videoRef, gaze, gesture, fps, status, start, stop };
}

export default useGazeGesture;
