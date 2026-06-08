import { useEffect, useRef, useCallback, createElement } from "react";
import { createPortal } from "react-dom";

/**
 * useGazeOverlay
 * ---------------------------------------------------------------
 * Render titik tatapan (gaze dot) di atas seluruh halaman menggunakan
 * React Portal, dan eksekusi aksi nyata saat gesture terdeteksi:
 *
 *   • "Cursor Move" / "Idle"  → dot bergerak, tidak ada aksi
 *   • "Click" (pinch)         → klik elemen di bawah dot
 *   • "Scroll" (2 jari)       → scroll halaman ke arah tatapan vertikal
 *   • "Zoom"                  → tidak ada aksi (reserved)
 *
 * Menggunakan koordinat gaze {x, y} ternormalisasi [0..1] dari
 * useGazeGesture dan memetakannya ke piksel layar penuh.
 *
 * @param {object|null} gaze     - {x, y} dari useGazeGesture, null bila tak terdeteksi
 * @param {object|null} gesture  - {name, conf} dari useGazeGesture, null bila tak ada
 * @param {boolean}     running  - apakah tracking sedang aktif
 * @returns {{ GazeOverlay: ReactElement|null, dotPos: {x,y}|null }}
 */
export function useGazeOverlay(gaze, gesture, running) {
  const lastClickTime = useRef(0);
  const lastScrollTime = useRef(0);
  const dotPos = gaze && running
    ? { x: gaze.x * window.innerWidth, y: gaze.y * window.innerHeight }
    : null;

  // Eksekusi klik pada elemen di bawah titik gaze
  const fireClick = useCallback((px, py) => {
    const now = Date.now();
    if (now - lastClickTime.current < 800) return; // debounce 0.8 detik
    lastClickTime.current = now;

    // Overlay sudah pointer-events:none, jadi elementFromPoint mengabaikannya.
    const el = document.elementFromPoint(px, py);
    if (!el || el === document.body || el === document.documentElement) return;

    // Naik ke ancestor interaktif terdekat (button/a/input/[role=button]).
    const target = el.closest("button, a, input, select, textarea, [role='button'], [onclick]") || el;
    try { target.focus?.(); } catch { /* elemen tak fokusabel */ }
    try { target.click?.(); } catch { /* elemen tak klikabel */ }
  }, []);

  // Eksekusi scroll berdasarkan posisi vertikal tatapan
  const fireScroll = useCallback((py) => {
    const now = Date.now();
    if (now - lastScrollTime.current < 150) return; // throttle 150ms
    lastScrollTime.current = now;

    const center = window.innerHeight / 2;
    const delta = (py - center) * 0.3; // skala scroll
    window.scrollBy({ top: delta, behavior: "auto" });
  }, []);

  // Eksekusi aksi berdasarkan gesture aktif
  useEffect(() => {
    if (!running || !gaze || !gesture) return;
    const px = gaze.x * window.innerWidth;
    const py = gaze.y * window.innerHeight;

    if (gesture.name === "Click" && gesture.conf > 0.5) {
      fireClick(px, py);
    } else if (gesture.name === "Scroll" && gesture.conf > 0.5) {
      fireScroll(py);
    }
  }, [gesture, gaze, running, fireClick, fireScroll]);

  return { dotPos };
}

/**
 * GazeOverlayPortal
 * ---------------------------------------------------------------
 * Komponen yang merender dot tatapan di atas seluruh dokumen
 * menggunakan React Portal ke document.body.
 *
 * @param {object|null} dotPos   - {x, y} dalam piksel layar, null bila tidak aktif
 * @param {string}      gesture  - nama gesture aktif ("Click", "Scroll", dll)
 */
export function GazeOverlayPortal({ dotPos, gestureName }) {
  if (!dotPos) return null;

  const isClick = gestureName === "Click";
  const isScroll = gestureName === "Scroll";

  const overlay = createElement(
    "div",
    {
      id: "fitwork-gaze-overlay",
      style: {
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 99999,
        overflow: "hidden",
      },
    },
    // Lingkaran luar (halo)
    createElement("div", {
      style: {
        position: "absolute",
        left: dotPos.x,
        top: dotPos.y,
        width: isClick ? 48 : 40,
        height: isClick ? 48 : 40,
        marginLeft: isClick ? -24 : -20,
        marginTop: isClick ? -24 : -20,
        borderRadius: "50%",
        background: isClick
          ? "rgba(29,158,117,0.25)"
          : isScroll
          ? "rgba(100,180,255,0.2)"
          : "rgba(29,158,117,0.15)",
        border: `2px solid ${isClick ? "#1D9E75" : isScroll ? "#64b4ff" : "rgba(29,158,117,0.5)"}`,
        transition: "left 0.08s linear, top 0.08s linear, width 0.1s, height 0.1s",
        boxShadow: isClick ? "0 0 16px #1D9E7588" : "none",
      },
    }),
    // Titik tengah
    createElement("div", {
      style: {
        position: "absolute",
        left: dotPos.x,
        top: dotPos.y,
        width: 10,
        height: 10,
        marginLeft: -5,
        marginTop: -5,
        borderRadius: "50%",
        background: isClick ? "#1D9E75" : isScroll ? "#64b4ff" : "#1D9E75",
        transition: "left 0.08s linear, top 0.08s linear",
        boxShadow: `0 0 8px ${isClick ? "#1D9E75" : "#1D9E7588"}`,
      },
    }),
    // Label gesture aktif
    gestureName && gestureName !== "Idle" && gestureName !== "Cursor Move"
      ? createElement(
          "div",
          {
            style: {
              position: "absolute",
              left: dotPos.x + 20,
              top: dotPos.y - 24,
              background: "rgba(0,0,0,0.65)",
              color: "#fff",
              fontSize: 11,
              fontFamily: "monospace",
              padding: "2px 6px",
              borderRadius: 4,
              whiteSpace: "nowrap",
              transition: "left 0.08s linear, top 0.08s linear",
              pointerEvents: "none",
            },
          },
          gestureName
        )
      : null
  );

  return createPortal(overlay, document.body);
}
