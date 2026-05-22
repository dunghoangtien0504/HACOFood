"use client";

import {
  TrendingUp, Users, Target, Wallet, Activity,
  CreditCard, AlertTriangle, Zap, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

import AIDashboardBriefing from "@/components/ai/AIDashboardBriefing";
import { cn, formatCompactVND, formatPercent, formatNumber } from "@/lib/utils";
import {
  dashboardHeadlines, getFinanceHistory,
  listKpis, listKpiSummariesByDepartment,
  runForecast, listAlerts, listAuditLog,
  EMP_BY_ID, KPI_BY_ID,
  cashflowSeries, calcRunwayMonths,
  FINANCE_SNAPSHOT,
} from "@/lib/queries";

export default function DashboardPage() {
  const head = dashboardHeadlines();
  const history = getFinanceHistory();
  const cashflow = cashflowSeries();
  const runway = calcRunwayMonths();

  // KPI cảnh báo (đỏ + cam) — top 6 theo ưu tiên
  const allKpis = listKpis();
  const riskKpis = [...allKpis]
    .map((k) => ({ kpi: k, completion: k.direction === "increase" ? k.actual / k.target : k.target / Math.max(k.actual, 1) }))
    .sort((a, b) => a.completion - b.completion)
    .slice(0, 6);

  const deptKpiAvg = listKpiSummariesByDepartment().map((d) => ({ n: d.department.name, v: Math.round(d.avgCompletion * 100), color: d.department.color.replace("bg-", "") }));

  const alerts = listAlerts().filter((a) => !a.resolvedAt).slice(0, 5);
  const recentAudit = listAuditLog().slice(0, 4);

  // 3 what-if scenarios
  const wifs = [
    { label: "Sales hụt 20%", res: runForecast([{ kpiId: "kpi_rev", deltaPercent: -0.2 }]) },
    { label: "Payroll +15%", res: runForecast([{ kpiId: "kpi_payroll_cost", deltaPercent: 0.15 }]) },
    { label: "Food Cost +8%", res: runForecast([{ kpiId: "kpi_food_cost", deltaPercent: 0.08 }]) },
  ];

  const topCards = [
    { label: "Doanh thu tháng", val: formatCompactVND(head.revenue), sub: "+8.4%", trend: "up" },
    { label: "Gross Profit", val: formatCompactVND(head.grossProfit), sub: formatPercent(head.grossMargin * 100, 1), trend: "up" },
    { label: "Net Profit", val: formatCompactVND(head.netProfit), sub: formatPercent(head.netMargin * 100, 1), trend: "up" },
    { label: "KPI Company", val: formatPercent(head.kpiCompletion * 100, 0), sub: `${head.kpiGreen}/${head.kpiGreen + head.kpiAmber + head.kpiRed} xanh`, trend: "up" },
    { label: "Headcount", val: String(head.headcount), sub: `${head.departmentCount} phòng ban`, trend: "none" },
    { label: "Payroll Cost", val: formatCompactVND(head.payrollGross), sub: formatPercent(head.payrollOverRevenue * 100, 1), trend: "up" },
  ];

  const sparkData = history.map((h) => ({ v: h.revenue / 1_000_000_000 }));

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <AIDashboardBriefing />

      {/* ROW 1 — KPI cards */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
        {topCards.map((c, i) => (
          <div key={i} className="bg-white border border-zinc-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{c.label}</p>
                <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full", c.trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-zinc-50 text-zinc-500")}>
                  {c.trend === "up" && "↑"} {c.sub}
                </span>
              </div>
              <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{c.val}</h3>
              <div className="h-10 w-full opacity-30 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkData}>
                    <Area type="monotone" dataKey="v" stroke="#1b5e20" strokeWidth={2} fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ROW 2 — Risk KPI · Company KPI · Revenue trend */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Rủi ro KPI</h3>
            <span className="size-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-[10px] font-black">{head.kpiRed}</span>
          </div>
          <div className="space-y-6">
            {riskKpis.map(({ kpi, completion }) => (
              <div key={kpi.id} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-zinc-900">{kpi.name}</p>
                  <p className="text-[9px] font-bold text-zinc-300 uppercase mt-0.5">{kpi.code}</p>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black border",
                  completion >= 0.95 ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : completion >= 0.85 ? "bg-amber-50 text-amber-600 border-amber-100"
                      : "bg-rose-50 text-rose-600 border-rose-100"
                )}>
                  {Math.round(completion * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm text-center flex flex-col justify-center relative">
          <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest absolute top-8 left-0 right-0">KPI company tổng</h3>
          <div className="py-12">
            <span className="text-[80px] font-black text-zinc-900 leading-none">{Math.round(head.kpiCompletion * 100)}%</span>
            <p className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] mt-2">Đạt KPI</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-zinc-50">
            <div className="flex items-center justify-center gap-3">
              <div className="size-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black text-zinc-400 uppercase">Xanh: {head.kpiGreen}</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="size-2 rounded-full bg-amber-500" />
              <span className="text-[10px] font-black text-zinc-400 uppercase">Vàng: {head.kpiAmber}</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="size-2 rounded-full bg-rose-500" />
              <span className="text-[10px] font-black text-zinc-400 uppercase">Đỏ: {head.kpiRed}</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="size-2 rounded-full bg-zinc-200" />
              <span className="text-[10px] font-black text-zinc-400 uppercase">Tổng: {head.kpiGreen + head.kpiAmber + head.kpiRed}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Doanh thu 6 tháng</h3>
            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black">{formatPercent(((history.at(-1)!.revenue / history[0].revenue) - 1) * 100, 1)}</span>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <Area type="monotone" dataKey="revenue" stroke="#1b5e20" strokeWidth={3} fillOpacity={0.1} fill="#1b5e20" />
                <XAxis dataKey="period" hide />
                <Tooltip formatter={(v) => formatCompactVND(Number(v))} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 3 — Revenue vs Profit · Tasks · Incentive */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-xs font-black text-zinc-900 uppercase tracking-tight mb-8">Doanh thu vs Lợi nhuận 6 tháng</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f4" />
                <XAxis dataKey="period" tickFormatter={(p) => p.slice(-2)} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(1)}T`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => formatCompactVND(Number(v))} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex gap-4 mb-8">
            <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase">Đang mở: {head.tasksOpen}</div>
            <div className="px-3 py-1 bg-rose-50 text-rose-500 rounded-lg text-[9px] font-black uppercase">Overdue: {head.tasksOverdue}</div>
            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase">Linked KPI: {Math.round(head.tasksLinkedKpi * 100)}%</div>
          </div>
          <div className="space-y-4 text-xs">
            {[
              { l: "Tổng task", v: head.tasksTotal },
              { l: "Đã hoàn thành", v: head.tasksTotal - head.tasksOpen },
              { l: "Đang chạy", v: head.tasksOpen },
              { l: "Quá hạn", v: head.tasksOverdue },
            ].map((s) => (
              <div key={s.l} className="flex justify-between items-center font-bold">
                <span className="text-zinc-400">{s.l}</span>
                <span className="text-zinc-900 font-black">{s.v}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">{Math.round(head.tasksLinkedKpi * 100)}% task đã gắn KPI</p>
        </div>

        <div className="lg:col-span-3 bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-xs font-black text-zinc-900 uppercase tracking-tight mb-8">Incentive snapshot</h3>
          <div className="space-y-8">
            <div>
              <span className="text-3xl font-black text-zinc-900 tracking-tight">{formatCompactVND(head.bonusPool)}</span>
              <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">Bonus pool kỳ này</p>
            </div>
            <div className="space-y-4 pt-4 border-t border-zinc-50">
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-zinc-400">Gross payroll</span>
                <span className="text-zinc-900">{formatCompactVND(head.payrollGross)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-zinc-400">Payroll / Revenue</span>
                <span className="text-emerald-500 font-black">{formatPercent(head.payrollOverRevenue * 100, 1)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-zinc-400">Cash</span>
                <span className="text-zinc-900">{formatCompactVND(head.cash)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 4 — Dept ranking · Alerts · Recent activity */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-xs font-black text-zinc-900 uppercase tracking-tight mb-8">Xếp hạng phòng ban theo KPI</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptKpiAvg} layout="vertical">
                <XAxis type="number" hide domain={[0, 120]} />
                <YAxis type="category" dataKey="n" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
                <Tooltip />
                <Bar dataKey="v" radius={[0, 4, 4, 0]} barSize={16}>
                  {deptKpiAvg.map((d, i) => (
                    <Cell key={i} fill={d.v >= 95 ? "#10b981" : d.v >= 85 ? "#f59e0b" : "#f43f5e"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Cảnh báo đang mở</h3>
            <span className="text-[10px] font-black text-blue-600 uppercase">{head.alerts.total} mục</span>
          </div>
          <div className="space-y-4">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-zinc-50 pb-3 last:border-0">
                <div className="flex gap-3">
                  <div className={cn("size-2 rounded-full mt-1.5",
                    a.severity === "critical" || a.severity === "danger" ? "bg-rose-500"
                      : a.severity === "warning" ? "bg-amber-500" : "bg-blue-500")} />
                  <div>
                    <p className="text-xs font-bold text-zinc-900">{a.title}</p>
                    <p className="text-[9px] font-bold text-zinc-400 mt-0.5">{new Date(a.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                </div>
                <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase",
                  a.severity === "critical" || a.severity === "danger" ? "bg-rose-100 text-rose-700"
                    : a.severity === "warning" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700")}>
                  {a.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-8">Hoạt động gần đây</h3>
          <div className="space-y-6">
            {recentAudit.map((a) => {
              const actor = EMP_BY_ID[a.actorId];
              return (
                <div key={a.id} className="flex items-center gap-4">
                  <div className="size-10 rounded-full flex items-center justify-center text-white font-black text-xs bg-emerald-700">{actor?.avatarInitials ?? "?"}</div>
                  <div>
                    <p className="text-xs font-black text-zinc-900">{actor?.fullName ?? a.actorId} <span className="font-medium text-zinc-500">{a.summary}</span></p>
                    <p className="text-[10px] font-bold text-zinc-400 mt-0.5">{new Date(a.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ROW 5 — Insights from real data */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            t: `Lead Marketing đạt ${formatNumber(KPI_BY_ID["kpi_mkt_leads"].actual)} (${Math.round(KPI_BY_ID["kpi_mkt_leads"].actual / KPI_BY_ID["kpi_mkt_leads"].target * 100)}%)`,
            desc: `CPL hiện ${formatNumber(KPI_BY_ID["kpi_mkt_cpl"].actual)}đ vs target ${formatNumber(KPI_BY_ID["kpi_mkt_cpl"].target)}đ — vượt ngưỡng. Cân nhắc tối ưu creative B campaign Hè.`,
            color: "bg-blue-50 text-blue-900 border-blue-100",
          },
          {
            t: `Sales close rate B2B chỉ ${KPI_BY_ID["kpi_close_rate"].actual}% (target ${KPI_BY_ID["kpi_close_rate"].target}%)`,
            desc: "Pipeline đủ nhưng tỉ lệ chốt thấp. Đề xuất rà soát qualification & training onboarding sales mới.",
            color: "bg-rose-50 text-rose-900 border-rose-100",
          },
          {
            t: `Payroll/Revenue ở mức ${formatPercent(head.payrollOverRevenue * 100, 1)} — tối ưu`,
            desc: `Giữ tỷ lệ này ≤ 14% khi tuyển 4 vị trí mới Q2 (đã mở: ${4} JD).`,
            color: "bg-emerald-50 text-emerald-900 border-emerald-100",
          },
        ].map((ins, i) => (
          <div key={i} className={cn("p-8 rounded-[2.5rem] border relative overflow-hidden", ins.color)}>
            <div className="flex items-center gap-3 mb-4">
              <Zap className="size-4" />
              <h4 className="text-sm font-black uppercase tracking-tight">{ins.t}</h4>
            </div>
            <p className="text-xs font-medium leading-relaxed opacity-80">{ins.desc}</p>
          </div>
        ))}
      </div>

      {/* ROW 6 — Execution · Finance · What-if */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-8 flex items-center gap-2"><Activity className="size-3" /> Execution</h3>
          <div className="space-y-4 text-xs">
            <Row l="Task đang mở" v={String(head.tasksOpen)} />
            <Row l="Task overdue" v={String(head.tasksOverdue)} c={head.tasksOverdue > 0 ? "text-rose-500" : "text-emerald-500"} />
            <Row l="% task gắn KPI" v={formatPercent(head.tasksLinkedKpi * 100, 0)} />
            <Row l="On-time rate" v={formatPercent((1 - head.tasksOverdue / Math.max(head.tasksTotal, 1)) * 100, 0)} c="text-emerald-500" />
          </div>
        </div>
        <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-8 flex items-center gap-2"><CreditCard className="size-3" /> Finance</h3>
          <div className="space-y-4 text-xs">
            <Row l="Cash" v={formatCompactVND(FINANCE_SNAPSHOT.cash)} />
            <Row l="AR" v={formatCompactVND(FINANCE_SNAPSHOT.ar)} />
            <Row l="AP" v={formatCompactVND(FINANCE_SNAPSHOT.ap)} />
            <Row l="Runway" v={`${runway} tháng`} c="text-blue-500" />
          </div>
        </div>
        <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-8 flex items-center gap-2"><AlertTriangle className="size-3 text-amber-500" /> What-if Net Profit</h3>
          <div className="space-y-4 text-right">
            {wifs.map((w) => (
              <div key={w.label} className="space-y-1">
                <p className={cn("text-[11px] font-black", w.res.netProfitDelta >= 0 ? "text-emerald-500" : "text-rose-500")}>
                  {w.res.netProfitDelta >= 0 ? "+" : ""}{formatCompactVND(w.res.netProfitDelta)} NP
                </p>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">{w.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ l, v, c }: { l: string; v: string; c?: string }) {
  return (
    <div className="flex justify-between items-center font-bold">
      <span className="text-zinc-400">{l}</span>
      <span className={cn("font-black", c || "text-zinc-900")}>{v}</span>
    </div>
  );
}
