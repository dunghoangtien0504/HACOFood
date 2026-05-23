"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bot,
  History,
  RotateCcw,
  Users,
  Activity,
} from "lucide-react";
import {
  FINANCE_SNAPSHOT,
  KPIS,
  TASKS,
  ALERTS,
  APPROVALS,
  DEPARTMENTS,
  EMPLOYEES,
  completionOf,
  statusOf,
  useHACOUpdate,
  type Kpi,
} from "@/lib/queries";
import { useDemoSession, ROLE_LABELS } from "@/lib/auth/demoSession";

// ------------------------------------------------------------------ //
// Types                                                               //
// ------------------------------------------------------------------ //
type InsightType = "critical" | "opportunity" | "ops" | "people";

interface Insight {
  type: InsightType;
  title: string;
  desc: string;
  action: string;
}

// ------------------------------------------------------------------ //
// Static fallback (shown when ANTHROPIC_API_KEY not configured)       //
// ------------------------------------------------------------------ //
const FALLBACK_INSIGHTS: Insight[] = [
  {
    type: "critical",
    title: "Rủi ro hụt doanh thu T5",
    desc: "Dựa trên tốc độ chốt deal hiện tại, dự báo doanh thu tháng 5 chỉ đạt 81% kế hoạch (5.2 tỷ / mục tiêu 6.4 tỷ). Thiếu hụt khoảng 1.2 tỷ VNĐ.",
    action: "Đẩy mạnh chương trình khuyến mãi B2B và kiểm tra lại phễu Marketing trong tuần này.",
  },
  {
    type: "opportunity",
    title: "Tối ưu hóa chi phí Marketing",
    desc: "Chi phí OPEX đang ở mức 1.375 tỷ / tháng — chiếm 26% doanh thu. Kênh Facebook đang có hiệu suất cao.",
    action: "Tăng 20% ngân sách cho nhóm quảng cáo hiệu suất cao để tối đa hóa ROI tháng 6.",
  },
  {
    type: "ops",
    title: "Task quá hạn cần xử lý",
    desc: "Có nhiều task đang bị đình trệ hoặc quá hạn trong hệ thống. Điều này ảnh hưởng trực tiếp đến KPI phòng ban.",
    action: "Review toàn bộ task 'blocked' và 'overdue' trong buổi họp team hôm nay.",
  },
];

// ------------------------------------------------------------------ //
// Helper: build context object from live state                        //
// ------------------------------------------------------------------ //
function buildContext(role: string) {
  const snap = FINANCE_SNAPSHOT;
  const REV_TARGET = 6_400_000_000;

  // Top KPIs (company-level + critical dept KPIs, max 12)
  const priorityKpiIds = [
    "kpi_np", "kpi_rev", "kpi_cogs", "kpi_opex",
    "kpi_rev_b2b", "kpi_rev_b2c", "kpi_food_cost", "kpi_wastage",
    "kpi_mkt_spend", "kpi_payroll_cost", "kpi_nps", "kpi_lead_time",
  ];
  const kpiData = priorityKpiIds
    .map((id) => KPIS.find((k) => k.id === id))
    .filter((k): k is Kpi => k !== undefined)
    .map((k) => ({
      code: k.code,
      name: k.name,
      actual: k.actual,
      target: k.target,
      unit: k.unit,
      completion_pct: Math.round(completionOf(k) * 100),
      status: statusOf(completionOf(k)),
      dept: k.ownerDepartmentId,
    }));

  // Task summary
  const now = new Date();
  const taskData = {
    total: TASKS.length,
    done: TASKS.filter((t) => t.status === "done").length,
    in_progress: TASKS.filter((t) => t.status === "in_progress").length,
    overdue: TASKS.filter(
      (t) => t.status !== "done" && new Date(t.dueDate) < now
    ).length,
    blocked: TASKS.filter((t) => t.status === "blocked").length,
    completion_pct: Math.round(
      (TASKS.filter((t) => t.status === "done").length / Math.max(TASKS.length, 1)) * 100
    ),
  };

  // Open alerts
  const openAlerts = ALERTS.filter((a) => !a.resolvedAt).slice(0, 8).map((a) => ({
    severity: a.severity,
    title: a.title,
    source: a.source,
  }));

  // Pending approvals
  const pendingApprovals = APPROVALS.filter((a) => a.status === "pending");
  const pendingApprovalValue = pendingApprovals.reduce((s, a) => s + a.amount, 0);

  // Department summary
  const deptData = DEPARTMENTS.map((d) => {
    const deptKpis = KPIS.filter((k) => k.ownerDepartmentId === d.id);
    const avgKpi =
      deptKpis.length > 0
        ? Math.round(
            (deptKpis.reduce((s, k) => s + completionOf(k), 0) / deptKpis.length) * 100
          )
        : 0;
    return {
      name: d.name,
      headcount: EMPLOYEES.filter((e) => e.departmentId === d.id).length,
      kpi_avg_pct: avgKpi,
      budget_monthly_vnd: d.budgetMonthly,
      cost_actual_vnd: d.costActual,
      budget_used_pct: Math.round((d.costActual / d.budgetMonthly) * 100),
    };
  });

  // Extra context for specific roles
  const extraContext: Record<string, unknown> = {};
  if (role === "hr_admin") {
    const APPROVALS_HR = APPROVALS.filter((a) => a.kind === "hire" && a.status === "pending");
    extraContext.open_hire_requests = APPROVALS_HR.length;
    extraContext.total_employees = EMPLOYEES.length;
  }

  return {
    period: snap.period,
    finance: {
      revenue_vnd: snap.revenue,
      revenue_target_vnd: REV_TARGET,
      revenue_vs_target_pct: Math.round((snap.revenue / REV_TARGET) * 100),
      gross_profit_vnd: snap.grossProfit,
      gross_margin_pct: Math.round((snap.grossProfit / snap.revenue) * 100),
      opex_vnd: snap.opex,
      opex_to_rev_pct: Math.round((snap.opex / snap.revenue) * 100),
      ebitda_vnd: snap.ebitda,
      net_profit_vnd: snap.netProfit,
      net_margin_pct: Math.round((snap.netProfit / snap.revenue) * 100),
      cash_vnd: snap.cash,
      short_term_debt_vnd: snap.shortTermDebt,
    },
    kpis: kpiData,
    tasks: taskData,
    open_alerts: openAlerts,
    pending_approvals_count: pendingApprovals.length,
    pending_approvals_value_vnd: pendingApprovalValue,
    departments: deptData,
    total_employees: EMPLOYEES.filter((e) => e.status === "active").length,
    ...extraContext,
  };
}

// ------------------------------------------------------------------ //
// Icon & color config per insight type                                //
// ------------------------------------------------------------------ //
const TYPE_CONFIG: Record<
  InsightType,
  { icon: React.ReactNode; iconBg: string; iconText: string; accent: string }
> = {
  critical: {
    icon: <AlertTriangle className="size-4" />,
    iconBg: "bg-rose-500/20",
    iconText: "text-rose-400",
    accent: "text-rose-400",
  },
  opportunity: {
    icon: <TrendingUp className="size-4" />,
    iconBg: "bg-emerald-500/20",
    iconText: "text-emerald-400",
    accent: "text-emerald-400",
  },
  ops: {
    icon: <Zap className="size-4" />,
    iconBg: "bg-blue-500/20",
    iconText: "text-blue-400",
    accent: "text-blue-400",
  },
  people: {
    icon: <Users className="size-4" />,
    iconBg: "bg-purple-500/20",
    iconText: "text-purple-400",
    accent: "text-purple-400",
  },
};

// ------------------------------------------------------------------ //
// Main component                                                       //
// ------------------------------------------------------------------ //
export default function AIDashboardBriefing() {
  const { user } = useDemoSession();
  useHACOUpdate();

  type AnalysisStatus = "idle" | "analyzing" | "done" | "error" | "no_key";
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [insights, setInsights] = useState<Insight[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [analysisTime, setAnalysisTime] = useState(0);

  const runAnalysis = useCallback(async () => {
    setStatus("analyzing");
    setInsights([]);
    setErrorMsg("");
    const t0 = Date.now();

    try {
      const context = buildContext(user.role);
      const res = await fetch("/api/ai-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: user.role, userName: user.fullName, context }),
      });

      // No API key configured → show fallback
      if (res.status === 503) {
        setInsights(FALLBACK_INSIGHTS);
        setStatus("no_key");
        setAnalysisTime(Math.round((Date.now() - t0) / 100) / 10);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? data.error ?? `HTTP ${res.status}`);
      }

      const data = (await res.json()) as { insights?: Insight[] };
      if (!data.insights || data.insights.length === 0) {
        throw new Error("Không nhận được insight từ AI.");
      }

      setInsights(data.insights);
      setStatus("done");
      setAnalysisTime(Math.round((Date.now() - t0) / 100) / 10);
    } catch (err: any) {
      console.error("[AIDashboardBriefing] Error:", err);
      setInsights(FALLBACK_INSIGHTS);
      setErrorMsg(err?.message ?? "Lỗi kết nối AI");
      setStatus("error");
      setAnalysisTime(Math.round((Date.now() - t0) / 100) / 10);
    }
  }, [user.role, user.fullName]);

  // Auto-run on first mount
  useEffect(() => {
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAnalyzing = status === "analyzing";
  const showInsights = status !== "idle" && !isAnalyzing;

  return (
    <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden mb-8 border border-white/10">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#1b5e20]/20 to-transparent pointer-events-none" />
      <div className="absolute -right-20 -top-20 size-64 bg-[#1b5e20]/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute left-1/4 bottom-0 size-48 bg-blue-500/5 rounded-full blur-[80px]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative group">
              <div className="absolute inset-0 bg-[#1b5e20]/20 blur-xl group-hover:bg-[#1b5e20]/40 transition-all rounded-2xl" />
              <Bot
                className={cn(
                  "size-7 text-[#4ade80] relative",
                  isAnalyzing && "animate-pulse"
                )}
              />
            </div>
            <div>
              <h2 className="text-xl font-black flex items-center gap-2">
                Chào buổi sáng, {user.fullName.split(" ").slice(-1)[0]}!{" "}
                <Sparkles className="size-5 text-amber-400" />
              </h2>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">
                {ROLE_LABELS[user.role]} · AI COO đang theo dõi toàn bộ hệ thống
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {status === "no_key" && (
              <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-[10px] font-black uppercase">
                Demo Mode
              </span>
            )}
            {status === "done" && (
              <span className="text-[10px] font-bold text-white/30">
                Phân tích xong trong {analysisTime}s
              </span>
            )}
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className={cn("size-3.5", isAnalyzing && "animate-spin")} />
              {isAnalyzing ? "Đang phân tích..." : "Làm mới phân tích"}
            </button>
          </div>
        </div>

        {/* Analyzing state */}
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-16 space-y-5">
            <div className="flex gap-2">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="size-2.5 bg-[#4ade80] rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
            <div className="space-y-1 text-center">
              <p className="text-white/60 text-xs font-black uppercase tracking-widest">
                AI đang quét toàn bộ dữ liệu công ty...
              </p>
              <p className="text-white/25 text-[10px] font-medium">
                KPIs · Tài chính · Công việc · Cảnh báo · Nhân sự
              </p>
            </div>
          </div>
        )}

        {/* Insights grid */}
        {showInsights && (
          <>
            {(status === "error" || status === "no_key") && (
              <div
                className={cn(
                  "mb-4 px-4 py-2.5 rounded-xl border text-[10px] font-bold flex items-center gap-2",
                  status === "no_key"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                )}
              >
                <Activity className="size-3.5 shrink-0" />
                {status === "no_key"
                  ? "ANTHROPIC_API_KEY chưa được cấu hình — đang hiển thị dữ liệu mẫu. Thêm API key vào .env.local để bật AI thật."
                  : `Lỗi kết nối AI: ${errorMsg} — đang hiển thị dữ liệu mẫu.`}
              </div>
            )}
            <div className="grid gap-5 md:grid-cols-3">
              {insights.map((insight, idx) => {
                const cfg = TYPE_CONFIG[insight.type] ?? TYPE_CONFIG.ops;
                return (
                  <div
                    key={idx}
                    className="bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:bg-white/[0.08] transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={cn(
                          "size-8 rounded-lg flex items-center justify-center shrink-0",
                          cfg.iconBg,
                          cfg.iconText
                        )}
                      >
                        {cfg.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                        {insight.type === "critical"
                          ? "Rủi ro"
                          : insight.type === "opportunity"
                          ? "Cơ hội"
                          : insight.type === "people"
                          ? "Nhân sự"
                          : "Vận hành"}
                      </span>
                    </div>
                    <h3
                      className={cn(
                        "text-sm font-black mb-2 transition-colors",
                        `group-hover:${cfg.accent}`
                      )}
                    >
                      {insight.title}
                    </h3>
                    <p className="text-xs text-white/50 leading-relaxed font-medium mb-4">
                      {insight.desc}
                    </p>
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] font-bold text-white/40 uppercase mb-1.5">
                        Hành động gợi ý:
                      </p>
                      <p className="text-[11px] font-bold text-white/80 leading-relaxed">
                        {insight.action}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Footer status bar */}
        <div className="mt-8 flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {["H", "T", "L", "+"].map((letter, i) => (
                <div
                  key={i}
                  className="size-6 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[8px] font-black"
                >
                  {letter === "+" ? `+${Math.max(0, (EMPLOYEES.filter((e) => e.status === "active").length) - 3)}` : letter}
                </div>
              ))}
            </div>
            <p className="text-[10px] font-bold text-white/40 uppercase">
              AI đã kiểm tra đầu việc của{" "}
              {EMPLOYEES.filter((e) => e.status === "active").length} nhân sự ·{" "}
              {TASKS.filter((t) => t.status === "in_progress").length} task đang chạy
            </p>
          </div>
          <div className="flex items-center gap-3">
            {status === "done" && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#4ade80]">
                <CheckCircle2 className="size-3" /> Claude Opus 4.7
              </span>
            )}
            <button className="text-[10px] font-black text-[#4ade80] uppercase flex items-center gap-2 hover:underline">
              Mở bảng AI COO <ArrowRight className="size-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
