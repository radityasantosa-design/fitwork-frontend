import { useEffect, useRef, useState } from "react";

/**
 * useHealthData
 * -------------------------------------------------------------
 * Mengambil data kesehatan dari Azure Function (VITE_API_URL)
 * setiap 5 detik. Jika API tidak tersedia / error, otomatis
 * fallback ke mock data sehingga UI tetap hidup saat demo.
 *
 * Hook ini juga:
 *  - menormalisasi response ke bentuk kontrak API yang lengkap
 *    (mengisi field yang belum dikirim backend dengan default),
 *  - menurunkan breakWarning di sisi client kalau backend belum
 *    mengirimnya,
 *  - mengakumulasi history (productivity vs stress) untuk chart.
 */

const API_URL = import.meta.env.VITE_API_URL;
const POLL_INTERVAL = 5000;
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

export function useHealthData() {
  const [data, setData] = useState(MOCK_DATA);
  const [history, setHistory] = useState(SEED_HISTORY);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      // Tanpa API_URL → tetap pakai mock
      if (!API_URL) {
        if (active) setIsLive(false);
        return;
      }
      try {
        const controller = new AbortController();
        const to = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(API_URL, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        clearTimeout(to);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.status === "error") throw new Error(json.message || "API error");

        const normalized = normalize(json);
        if (!active) return;

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
      } catch (e) {
        if (!active) return;
        // Fallback: pertahankan data terakhir / mock, tandai offline
        setIsLive(false);
        setError(e.message || "fetch failed");
      }
    }

    fetchData();
    timer.current = setInterval(fetchData, POLL_INTERVAL);
    return () => {
      active = false;
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  return { data, history, isLive, lastUpdated, error };
}

export default useHealthData;
