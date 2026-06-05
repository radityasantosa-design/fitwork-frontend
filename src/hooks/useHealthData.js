import { useEffect, useRef, useState } from "react";

/**
 * useHealthData
 * -------------------------------------------------------------
 * Sumber data kesehatan untuk UI, dengan DUA mode transport yang
 * dipilih otomatis:
 *
 *   1. SignalR (real-time)  — bila VITE_SIGNALR_ENABLED=true DAN
 *      endpoint /negotiate berhasil. Vitals di-POST ke /messages,
 *      backend menghitung skor lalu push balik event 'healthUpdate'.
 *   2. Polling HTTP         — fallback otomatis bila SignalR tidak
 *      tersedia/ gagal. GET/POST /healthscore tiap beberapa detik.
 *
 * Jika keduanya gagal, UI tetap hidup memakai mock data.
 *
 * Hook ini juga: menormalisasi response, menurunkan breakWarning di
 * sisi client bila perlu, dan mengakumulasi history untuk chart.
 */

const API_URL = import.meta.env.VITE_API_URL; // .../api/healthscore
const API_BASE = API_URL ? API_URL.replace(/\/healthscore\/?$/, "") : null;
const SIGNALR_ENABLED = import.meta.env.VITE_SIGNALR_ENABLED === "true";
const POLL_INTERVAL = 5000;     // polling fallback
const PUSH_INTERVAL = 2000;     // kirim vitals saat mode SignalR
const MAX_HISTORY = 12;

// ── Mock data (fallback) — bentuk penuh sesuai API contract ──
const MOCK_DATA = {
  status: "ok",
  userId: "raditya-001",
  timestamp: new Date().toISOString(),
  focusScore: 87,
  stressLevel: 42,
  fatigueScore: 38,
  vitals: {
    heartRate: 72,
    pupilDilation: 0.64,
    perclos: 0.18,
  },
  breakWarning: {
    triggered: true,
    reason: "long_session",
    recommendedMinutes: 10,
  },
  sessionInfo: {
    activeWorkHours: 5.4,
    deepWorkBlocks: 2,
    breakCompliance: 68,
  },
};

// Seed history supaya chart tidak kosong di awal
const SEED_HISTORY = [
  { t: "09:00", productivity: 65, stress: 22 },
  { t: "10:00", productivity: 78, stress: 28 },
  { t: "11:00", productivity: 88, stress: 35 },
  { t: "12:00", productivity: 72, stress: 48 },
  { t: "13:00", productivity: 60, stress: 40 },
  { t: "14:00", productivity: 85, stress: 55 },
];

/** Turunkan breakWarning bila backend belum menyertakannya. */
function deriveBreakWarning(stressLevel, fatigueScore, activeWorkHours) {
  const highStress = stressLevel > 65;
  const highFatigue = fatigueScore > 60;
  const longSession = activeWorkHours > 2.5;
  const triggered = highStress || highFatigue || longSession;

  let reason = null;
  if (highStress && highFatigue) reason = "cognitive_overload";
  else if (highStress) reason = "stress_index_high";
  else if (highFatigue) reason = "fatigue_detected";
  else if (longSession) reason = "long_session";

  return { triggered, reason, recommendedMinutes: triggered ? 10 : null };
}

/** Gabungkan response API (parsial) dengan default mock yang lengkap. */
function normalize(raw) {
  const vitals = { ...MOCK_DATA.vitals, ...(raw.vitals || {}) };
  const sessionInfo = { ...MOCK_DATA.sessionInfo, ...(raw.sessionInfo || {}) };
  const focusScore = raw.focusScore ?? MOCK_DATA.focusScore;
  const stressLevel = raw.stressLevel ?? MOCK_DATA.stressLevel;
  const fatigueScore = raw.fatigueScore ?? MOCK_DATA.fatigueScore;

  const breakWarning =
    raw.breakWarning ||
    deriveBreakWarning(stressLevel, fatigueScore, sessionInfo.activeWorkHours);

  return {
    status: raw.status || "ok",
    userId: raw.userId || MOCK_DATA.userId,
    timestamp: raw.timestamp || new Date().toISOString(),
    focusScore,
    stressLevel,
    fatigueScore,
    vitals,
    breakWarning,
    sessionInfo,
  };
}

function clockLabel(ts) {
  const d = ts ? new Date(ts) : new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * @param {object|null} liveVitals  Vitals dari kamera (useFaceVitals). Bila ada,
 *   dikirim ke backend (POST) supaya skor ML dihitung dari pembacaan nyata.
 *   Bila null, hook GET data (mock/last) seperti biasa.
 */
/** Body vitals yang dikirim ke backend (dari kamera). */
function vitalsBody(v) {
  if (!v) return undefined;
  return JSON.stringify({
    heartRate: v.heartRate,
    perclos: v.perclos,
    pupilDilation: v.pupilDilation,
    blinkRate: v.blinkRate,
    isSlumping: v.isSlumping ? 1 : 0,
    facialTension: v.expression ? v.expression.tension : undefined,
  });
}

export function useHealthData(liveVitals = null) {
  const [data, setData] = useState(MOCK_DATA);
  const [history, setHistory] = useState(SEED_HISTORY);
  const [isLive, setIsLive] = useState(false);
  const [transport, setTransport] = useState("offline"); // offline | polling | signalr
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const timer = useRef(null);
  // Ref agar interval/SignalR selalu membaca vitals terbaru tanpa re-subscribe.
  const vitalsRef = useRef(liveVitals);
  vitalsRef.current = liveVitals;

  useEffect(() => {
    let active = true;
    let connection = null;
    let pushTimer = null;

    // Terapkan payload (dari polling ATAU push SignalR) ke state.
    function commit(json) {
      if (!active || !json || json.status === "error") return;
      const normalized = normalize(json);
      setData(normalized);
      setIsLive(true);
      setError(null);
      setLastUpdated(new Date());
      setHistory((prev) => {
        const next = [
          ...prev,
          {
            t: clockLabel(normalized.timestamp),
            productivity: Math.round(normalized.focusScore),
            stress: Math.round(normalized.stressLevel),
          },
        ];
        return next.slice(-MAX_HISTORY);
      });
    }

    // ── Mode 1: SignalR real-time ────────────────────────────────
    async function startSignalR() {
      try {
        const { HubConnectionBuilder } = await import("@microsoft/signalr");
        // Client SignalR otomatis memanggil `${API_BASE}/negotiate` (POST)
        // untuk mendapat URL + accessToken Azure SignalR Service, lalu
        // membuka koneksi WebSocket ke service tersebut.
        connection = new HubConnectionBuilder()
          // withCredentials:false → negotiate jadi CORS non-credential; cukup
          // origin spesifik di Function App → CORS. Azure SignalR pakai accessToken.
          .withUrl(`${API_BASE}`, { withCredentials: false })
          .withAutomaticReconnect()
          .build();

        connection.on("healthUpdate", (payload) => commit(payload));
        await connection.start();
        if (!active) return false;

        setTransport("signalr");

        // Kirim vitals kamera secara berkala → backend hitung & push balik.
        const sendVitals = async () => {
          const v = vitalsRef.current;
          if (!v) return; // tanpa kamera, biarkan broadcast lain mengisi
          try {
            await fetch(`${API_BASE}/messages`, {
              method: "POST",
              // text/plain = "simple request" → hindari preflight CORS (OPTIONS),
              // yang ditolak Functions host. Body tetap JSON; backend baca via get_json().
              headers: { "Content-Type": "text/plain" },
              body: vitalsBody(v),
            });
          } catch { /* abaikan; reconnect otomatis */ }
        };
        await sendVitals();
        pushTimer = setInterval(sendVitals, PUSH_INTERVAL);
        return true;
      } catch (e) {
        console.warn("[useHealthData] SignalR tidak tersedia, fallback polling:", e?.message);
        try { await connection?.stop?.(); } catch {}
        connection = null;
        return false;
      }
    }

    // ── Mode 2: Polling HTTP (fallback) ──────────────────────────
    async function poll() {
      if (!API_URL) { if (active) { setIsLive(false); setTransport("offline"); } return; }
      try {
        const controller = new AbortController();
        const to = setTimeout(() => controller.abort(), 8000);
        const v = vitalsRef.current;
        const res = await fetch(API_URL, {
          // POST pakai Content-Type text/plain + tanpa header non-safelisted (mis. Accept)
          // → "simple request" tanpa preflight OPTIONS (yang ditolak Functions host).
          method: v ? "POST" : "GET",
          headers: v ? { "Content-Type": "text/plain" } : { Accept: "application/json" },
          body: vitalsBody(v),
          signal: controller.signal,
        });
        clearTimeout(to);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        commit(await res.json());
      } catch (e) {
        if (!active) return;
        setIsLive(false);
        setError(e.message || "fetch failed");
      }
    }

    function startPolling() {
      setTransport("polling");
      poll();
      timer.current = setInterval(poll, POLL_INTERVAL);
    }

    // ── Pilih transport ──────────────────────────────────────────
    (async () => {
      const usedSignalR = SIGNALR_ENABLED && API_BASE ? await startSignalR() : false;
      if (active && !usedSignalR) startPolling();
    })();

    return () => {
      active = false;
      if (timer.current) clearInterval(timer.current);
      if (pushTimer) clearInterval(pushTimer);
      try { connection?.stop?.(); } catch {}
    };
  }, []);

  return { data, history, isLive, transport, lastUpdated, error };
}

export default useHealthData;
