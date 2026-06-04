import { Activity, Brain, Clock, Coffee, Sparkles, Lightbulb, TrendingUp, AlertTriangle, WifiOff } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, MetricCard, GaugeRing, StatusPill } from "./shared";
import { useHealth } from "../context/HealthProvider";
import { useAuth } from "../context/AuthContext";
import { useT } from "../i18n/LanguageProvider";

function stressStatus(v) { return v == null ? "inactive" : v > 65 ? "alert" : v > 40 ? "warning" : "normal"; }
function fatigueStatus(v) { return v == null ? "inactive" : v > 60 ? "alert" : v > 35 ? "warning" : "normal"; }
function focusStatus(v) { return v == null ? "inactive" : v >= 70 ? "normal" : v >= 50 ? "warning" : "alert"; }
const r = (v) => (v == null ? "--" : Math.round(v));

export function Dashboard({ onTriggerBreak }) {
  const { t } = useT();
  const { profile, isAuthenticated } = useAuth();
  const { data, history, isLive } = useHealth();
  const { focusScore, stressLevel, fatigueScore, vitals, sessionInfo, breakWarning } = data;

  const hasData = focusScore != null;
  const REASON_LABEL = {
    stress_index_high: t("advisor.reasonStressHigh"),
    fatigue_detected: t("advisor.reasonFatigue"),
    long_session: t("advisor.reasonLongSession"),
    cognitive_overload: t("advisor.reasonOverload"),
  };

  // Insight hanya dibangun saat ada pembacaan nyata.
  const insights = hasData
    ? [
        {
          icon: <Lightbulb size={16} />,
          title: focusScore >= 70 ? t("dashboard.insightFocusInTitle") : t("dashboard.insightFocusOutTitle"),
          body: focusScore >= 70
            ? t("dashboard.insightFocusIn", { score: r(focusScore) })
            : t("dashboard.insightFocusOut", { score: r(focusScore) }),
        },
        {
          icon: <Coffee size={16} />,
          title: stressLevel > 40 ? t("dashboard.insightStretchTitle") : t("dashboard.insightStressOkTitle"),
          body: stressLevel > 40
            ? t("dashboard.insightStretch", { score: r(stressLevel) })
            : t("dashboard.insightStressOk", { score: r(stressLevel) }),
        },
        {
          icon: <TrendingUp size={16} />,
          title: t("dashboard.insightBlocksTitle", { n: sessionInfo.deepWorkBlocks ?? 0 }),
          body: t("dashboard.insightBlocks", {
            hours: sessionInfo.activeWorkHours ?? 0,
            compliance: sessionInfo.breakCompliance ?? 0,
          }),
        },
      ]
    : [];

  const greeting = isAuthenticated && profile
    ? t("dashboard.greeting", { name: profile.fullName })
    : t("dashboard.greetingGuest");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6">

      {/* Hero row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <GaugeRing value={focusScore == null ? null : Math.round(focusScore)} size={88} status={focusStatus(focusScore)} />
          <div>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(20px,4vw,28px)", fontWeight: 600 }} className="text-neutral-900 dark:text-white">
              {greeting}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1" style={{ fontSize: 14 }}>
              {hasData ? (
                <>
                  {t("dashboard.focusLine", { score: r(focusScore) })}
                  {focusScore >= 70 ? t("dashboard.inFlow") : t("dashboard.bringBack")}
                </>
              ) : (
                t("dashboard.idleSub")
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={isLive ? "normal" : "inactive"} label={isLive ? t("status.liveActive") : t("status.idle")} />
          <button
            onClick={onTriggerBreak}
            className="px-4 py-2 rounded-xl border border-warning/40 text-warning bg-warning/10 hover:bg-warning/20 transition text-sm font-medium"
          >
            {t("dashboard.simulateBreak")}
          </button>
        </div>
      </div>

      {/* Break warning banner (muncul kalau triggered dari data nyata) */}
      {breakWarning?.triggered && (
        <Card className="p-4 border-warning/40 bg-warning/8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-warning/15 text-warning flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div>
                <div className="text-neutral-900 dark:text-white font-semibold text-sm">{t("dashboard.breakRecommended")}</div>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">
                  {REASON_LABEL[breakWarning.reason] || t("dashboard.breakTime")} · {t("dashboard.suggestedMin", { min: breakWarning.recommendedMinutes })}
                </p>
              </div>
            </div>
            <button
              onClick={onTriggerBreak}
              className="px-4 py-2 rounded-xl bg-warning text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition shrink-0"
            >
              {t("dashboard.takeBreakNow")}
            </button>
          </div>
        </Card>
      )}

      {/* Metric cards — dari shared health state (idle = --) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <MetricCard label={t("dashboard.metricFocus")} value={r(focusScore)} unit="/100" delta={hasData ? (focusScore >= 70 ? t("dashboard.deltaInFlow") : t("dashboard.deltaBelowPeak")) : t("common.noData")} status={focusStatus(focusScore)} icon={<Brain size={18} />} />
        <MetricCard label={t("dashboard.metricStress")} value={r(stressLevel)} unit="%" delta={hasData ? (stressLevel > 40 ? t("dashboard.deltaModerate") : t("dashboard.deltaHealthy")) : t("common.noData")} status={stressStatus(stressLevel)} icon={<Activity size={18} />} />
        <MetricCard label={t("dashboard.metricFatigue")} value={r(fatigueScore)} unit="%" delta={hasData ? (fatigueScore > 35 ? t("dashboard.deltaWatch") : t("dashboard.deltaLowFatigue")) : t("common.noData")} status={fatigueStatus(fatigueScore)} icon={<Coffee size={18} />} />
        <MetricCard label={t("dashboard.metricHours")} value={sessionInfo.activeWorkHours != null ? `${sessionInfo.activeWorkHours}h` : "--"} delta={sessionInfo.deepWorkBlocks != null ? t("dashboard.deepBlocks", { n: sessionInfo.deepWorkBlocks }) : t("common.noData")} status={sessionInfo.activeWorkHours != null ? "normal" : "inactive"} icon={<Clock size={18} />} />
      </div>

      {/* Chart + Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-6">
        <Card className="xl:col-span-2 p-5 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 600 }} className="text-neutral-900 dark:text-white">
                {t("dashboard.chartTitle")}
              </h3>
              <p className="text-neutral-400 dark:text-neutral-500 mt-0.5" style={{ fontSize: 13 }}>{isLive ? t("dashboard.chartLive") : t("dashboard.chartIdle")}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> {t("dashboard.productivity")}</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> {t("dashboard.stress")}</span>
            </div>
          </div>
          <div className="h-60 sm:h-72">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 gap-2">
                <WifiOff size={22} className="opacity-50" />
                <span className="text-sm">{t("dashboard.chartEmpty")}</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ left: -20, top: 8, right: 8 }}>
                  <CartesianGrid stroke="currentColor" strokeOpacity={0.07} vertical={false} />
                  <XAxis dataKey="t" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--color-surface-dark, #fff)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, fontSize: 12 }}
                    itemStyle={{ color: "#6b7280" }}
                  />
                  <Line type="monotone" dataKey="productivity" stroke="#0F6E56" strokeWidth={2.5} dot={{ r: 3, fill: "#0F6E56" }} activeDot={{ r: 5 }} isAnimationActive={false} connectNulls />
                  <Line type="monotone" dataKey="stress"       stroke="#BA7517" strokeWidth={2.5} dot={{ r: 3, fill: "#BA7517" }} activeDot={{ r: 5 }} isAnimationActive={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-accent" />
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 600 }} className="text-neutral-900 dark:text-white">{t("dashboard.aiInsights")}</h3>
          </div>
          {insights.length === 0 ? (
            <div className="rounded-xl p-4 bg-neutral-50 dark:bg-white/3 border border-neutral-200 dark:border-white/10 text-sm text-neutral-400 dark:text-neutral-500">
              {t("dashboard.insightsIdle")}
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((i, idx) => (
                <div key={idx} className="rounded-xl p-3.5 bg-accent/5 dark:bg-accent/8 border border-accent/20 hover:border-accent/40 transition cursor-pointer">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-accent/15 text-primary dark:text-accent flex items-center justify-center shrink-0">{i.icon}</div>
                    <div>
                      <div className="text-neutral-800 dark:text-white font-semibold" style={{ fontSize: 13.5 }}>{i.title}</div>
                      <p className="text-neutral-500 dark:text-neutral-400 mt-0.5" style={{ fontSize: 12.5, lineHeight: 1.5 }}>{i.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Live session bar — vitals dari shared state */}
      <Card className="p-3.5 px-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-between">
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
              </span>
            ) : (
              <WifiOff size={14} className="text-neutral-400" />
            )}
            <span className="text-neutral-700 dark:text-neutral-200 font-medium text-sm">{isLive ? t("dashboard.sessionLive") : t("dashboard.sessionOffline")}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-neutral-500 dark:text-neutral-400 text-xs">
            <span>{t("dashboard.source")}: <span className={`font-mono ${data.source === "live" ? "text-accent" : "text-neutral-500"}`}>{data.source === "live" ? t("status.camera") : t("status.baseline")}</span></span>
            <span>HR: <span className="font-mono text-neutral-700 dark:text-neutral-200">{vitals.heartRate != null ? `${vitals.heartRate} bpm` : "--"}</span></span>
            <span>PERCLOS: <span className="font-mono text-neutral-700 dark:text-neutral-200">{vitals.perclos != null ? vitals.perclos : "--"}</span></span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Dashboard;
