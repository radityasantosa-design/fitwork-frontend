import { useState } from "react";
import { motion } from "motion/react";
import { ClipboardCheck, Brain, Activity, Frown, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { Card, PrimaryButton, GhostButton } from "./shared";

const API_URL = import.meta.env.VITE_API_URL; // .../api/healthscore
const ASSESS_URL = API_URL ? API_URL.replace(/\/healthscore\/?$/, "/assess") : null;

// 21 pertanyaan DASS-21 (urutan standar). cat: s=stress a=anxiety d=depression
const QUESTIONS = [
  { c: "s", t: "I found it hard to wind down" },
  { c: "a", t: "I was aware of dryness of my mouth" },
  { c: "d", t: "I couldn't seem to experience any positive feeling at all" },
  { c: "a", t: "I experienced breathing difficulty" },
  { c: "d", t: "I found it difficult to work up the initiative to do things" },
  { c: "s", t: "I tended to over-react to situations" },
  { c: "a", t: "I experienced trembling (e.g. in the hands)" },
  { c: "s", t: "I felt that I was using a lot of nervous energy" },
  { c: "a", t: "I was worried about situations in which I might panic" },
  { c: "d", t: "I felt that I had nothing to look forward to" },
  { c: "s", t: "I found myself getting agitated" },
  { c: "s", t: "I found it difficult to relax" },
  { c: "d", t: "I felt down-hearted and blue" },
  { c: "s", t: "I was intolerant of anything that kept me from getting on" },
  { c: "a", t: "I felt I was close to panic" },
  { c: "d", t: "I was unable to become enthusiastic about anything" },
  { c: "d", t: "I felt I wasn't worth much as a person" },
  { c: "s", t: "I felt that I was rather touchy" },
  { c: "a", t: "I was aware of the action of my heart without exertion" },
  { c: "a", t: "I felt scared without any good reason" },
  { c: "d", t: "I felt that life was meaningless" },
];

const LIKERT = [
  { v: 0, label: "Did not apply" },
  { v: 1, label: "Sometimes" },
  { v: 2, label: "Often" },
  { v: 3, label: "Almost always" },
];

// Faktor hidup (fitur ML) — nilai cocok dgn encoding train_dass_model.py
const LIFE_FACTORS = [
  { key: "social_media_hours", label: "Hours on social media / day", opts: [["< 1h", 0], ["1–3h", 1], ["> 3h", 2]] },
  { key: "financial_problem", label: "Financial problem in family?", opts: [["No", 0], ["Yes", 1]] },
  { key: "friend_conflict", label: "Conflict with friends?", opts: [["Never", 0], ["Rarely", 1], ["Sometimes", 2], ["Often", 3]] },
  { key: "family_violence", label: "Violence in family?", opts: [["No", 0], ["Rarely", 1], ["Sometimes", 2], ["Often", 3]] },
  { key: "recent_breakup", label: "Recent breakup?", opts: [["No", 0], ["Yes", 1]] },
  { key: "bullied", label: "Ever been bullied?", opts: [["No", 0], ["Yes", 1]] },
];

const SCALE_META = {
  stress: { label: "Stress", icon: <Activity size={18} />, color: "text-warning", bg: "bg-warning/10" },
  anxiety: { label: "Anxiety", icon: <Brain size={18} />, color: "text-primary dark:text-accent", bg: "bg-accent/10" },
  depression: { label: "Depression", icon: <Frown size={18} />, color: "text-danger", bg: "bg-danger/10" },
};

const SEVERITY_COLOR = {
  Normal: "bg-accent/15 text-primary dark:text-accent",
  Mild: "bg-warning/15 text-warning",
  Moderate: "bg-warning/20 text-warning",
  Severe: "bg-danger/15 text-danger",
  "Extremely Severe": "bg-danger/25 text-danger",
};

export function Assessment() {
  const [answers, setAnswers] = useState(Array(21).fill(null));
  const [life, setLife] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const answered = answers.filter((a) => a !== null).length;
  const allAnswered = answered === 21;

  async function submit() {
    setLoading(true); setError(null);
    const payload = { answers: answers.map((a) => a ?? 0), lifeFactors: life };
    try {
      if (!ASSESS_URL) throw new Error("API belum dikonfigurasi");
      const res = await fetch(ASSESS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status === "error") throw new Error(json.message);
      setResult(json);
    } catch (e) {
      setError(e.message || "Gagal mengirim asesmen");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setAnswers(Array(21).fill(null)); setLife({}); setResult(null); setError(null);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6 max-w-5xl">
      <div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(20px,4vw,28px)", fontWeight: 600 }} className="text-neutral-900 dark:text-white">
          Mental Health Assessment
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1" style={{ fontSize: 14 }}>
          DASS-21 · over the past week. Validated clinical questionnaire + AI risk insight.
        </p>
      </div>

      {/* ── Hasil ── */}
      {result && (
        <Card className="p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck size={18} className="text-accent" />
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 600 }} className="text-neutral-900 dark:text-white">Your results</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["depression", "anxiety", "stress"].map((s) => {
              const r = result.dass21[s]; const m = SCALE_META[s];
              return (
                <div key={s} className="p-4 rounded-2xl border border-neutral-200 dark:border-white/10">
                  <div className={`w-9 h-9 rounded-xl ${m.bg} ${m.color} flex items-center justify-center`}>{m.icon}</div>
                  <div className="mt-3 text-neutral-800 dark:text-white font-semibold text-sm">{m.label}</div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 600 }} className="text-neutral-900 dark:text-white">{r.score}</span>
                    <span className="text-neutral-400 text-xs">/ 42</span>
                  </div>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-lg text-xs font-semibold ${SEVERITY_COLOR[r.severity] || ""}`}>{r.severity}</span>
                </div>
              );
            })}
          </div>

          {result.mlPrediction && !result.mlPrediction.error && (
            <div className="mt-4 p-4 rounded-2xl bg-accent/8 border border-accent/25">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-accent" />
                <span className="text-primary dark:text-accent font-semibold text-sm">AI insight (from life factors)</span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 text-sm mt-2">
                Predicted stress level: <span className="font-mono font-semibold">{result.mlPrediction.predictedStress}/100</span>
                {result.mlPrediction.modelMAE != null && <span className="text-neutral-400"> · model MAE ±{result.mlPrediction.modelMAE}</span>}
              </p>
              <p className="text-neutral-400 text-xs mt-1">{result.mlPrediction.note}</p>
            </div>
          )}

          <p className="text-neutral-400 text-xs mt-4 leading-relaxed">
            DASS-21 is a screening tool, not a diagnosis. If scores are high or you feel unsafe, please reach out to a mental-health professional.
          </p>
          <GhostButton className="mt-4" onClick={reset}>
            <span className="inline-flex items-center gap-1.5 text-sm"><RotateCcw size={14} /> Retake</span>
          </GhostButton>
        </Card>
      )}

      {/* ── Kuesioner ── */}
      {!result && (
        <>
          <Card className="p-5 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600 }} className="text-neutral-900 dark:text-white">Questionnaire</h3>
              <span className="text-xs text-neutral-400 font-mono">{answered}/21</span>
            </div>
            <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-white/5 overflow-hidden mb-5">
              <motion.div className="h-full bg-accent" animate={{ width: `${(answered / 21) * 100}%` }} transition={{ duration: 0.3 }} />
            </div>

            <div className="space-y-4">
              {QUESTIONS.map((q, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex-1 text-sm text-neutral-700 dark:text-neutral-200">
                    <span className="text-neutral-400 mr-1.5">{i + 1}.</span>{q.t}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {LIKERT.map((opt) => (
                      <button
                        key={opt.v}
                        onClick={() => setAnswers((a) => { const n = [...a]; n[i] = opt.v; return n; })}
                        title={opt.label}
                        className={`w-9 h-9 rounded-lg text-sm font-mono transition ${
                          answers[i] === opt.v
                            ? "bg-primary text-white"
                            : "border border-neutral-200 dark:border-white/10 text-neutral-500 hover:border-accent/40"
                        }`}
                      >
                        {opt.v}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-neutral-400 text-xs mt-4">0 = did not apply · 1 = sometimes · 2 = often · 3 = almost always</p>
          </Card>

          {/* Faktor hidup (opsional, untuk AI) */}
          <Card className="p-5 lg:p-6">
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600 }} className="text-neutral-900 dark:text-white mb-1">Life context <span className="text-neutral-400 font-normal text-sm">(optional · powers AI insight)</span></h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {LIFE_FACTORS.map((f) => (
                <div key={f.key}>
                  <div className="text-sm text-neutral-600 dark:text-neutral-300 mb-1.5">{f.label}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {f.opts.map(([lbl, val]) => (
                      <button
                        key={val}
                        onClick={() => setLife((s) => ({ ...s, [f.key]: val }))}
                        className={`px-3 py-1.5 rounded-lg text-xs transition ${
                          life[f.key] === val
                            ? "bg-primary text-white"
                            : "border border-neutral-200 dark:border-white/10 text-neutral-500 hover:border-accent/40"
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {error && <div className="text-danger text-sm">{error}</div>}

          <div className="flex items-center gap-3">
            <PrimaryButton onClick={submit} className={!allAnswered || loading ? "opacity-50 pointer-events-none" : ""}>
              <span className="inline-flex items-center gap-1.5 text-sm">
                {loading ? "Scoring…" : "See my results"} <ArrowRight size={14} />
              </span>
            </PrimaryButton>
            {!allAnswered && <span className="text-neutral-400 text-xs">Answer all 21 questions to continue</span>}
          </div>
        </>
      )}
    </div>
  );
}
