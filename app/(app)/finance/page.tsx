"use client";

import { cn, formatCompactVND, formatPercent } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Search, Filter,
  Download, Plus, BarChart3, Calendar, ChevronDown, Activity,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  getFinanceSnapshot, getFinanceHistory, getCostBreakdown,
  listTransactions, cashflowSeries, calcRunwayMonths, DEPT_BY_ID, useHACOUpdate,
} from "@/lib/queries";
import { useRoleGuard } from "@/lib/auth/useRoleGuard";

const TABS = ["Tổng quan", "P&L", "Bảng cân đối", "Dòng tiền"];

export default function FinancePage() {
  const { allowed, loading } = useRoleGuard(["ceo", "cfo", "auditor"]);
  useHACOUpdate();
  const [activeTab, setActiveTab] = useLocalStorage("finance-active-tab", "Tổng quan");
  if (loading || !allowed) return null;

  const fin = getFinanceSnapshot();
  const history = getFinanceHistory();
  const cost = getCostBreakdown() as { name: string; value: number; color: string }[];
  const txs = listTransactions();
  const cf = cashflowSeries();
  const runway = calcRunwayMonths();

  const financeStats = [
    { label: "Doanh thu tháng", val: fin.revenue, sub: formatPercent((fin.revenue / history[0].revenue - 1) * 100, 1), trend: "up", color: "text-emerald-600" },
    { label: "Giá vốn", val: fin.cogs, sub: `${(fin.cogs / fin.revenue * 100).toFixed(1)}% rev`, trend: "up", color: "text-rose-600" },
    { label: "Lợi nhuận ròng", val: fin.netProfit, sub: formatPercent(fin.netProfit / fin.revenue * 100, 1), trend: "up", color: "text-emerald-600" },
    { label: "Tiền mặt", val: fin.cash, sub: `Runway ${runway} tháng`, trend: "up", color: "text-blue-600" },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Quản trị Tài chính"
        breadcrumbs={["Trang chủ", "Tài chính"]}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-zinc-200 px-3 py-2 rounded-lg text-xs font-bold text-zinc-600">
              <Calendar className="size-3" /> {fin.period} <ChevronDown className="size-3" />
            </div>
            <button className="bg-white border border-zinc-200 px-4 py-2 rounded-lg font-bold text-xs text-zinc-600 flex items-center gap-2"><Download className="size-3" /> Xuất PDF/Excel</button>
            <button className="bg-[#1b5e20] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg shadow-[#1b5e20]/20 flex items-center gap-2"><Plus className="size-3" /> Thu/Chi mới</button>
          </div>
        }
      />

      <div className="flex gap-2 p-1.5 bg-zinc-100/50 border border-zinc-200 rounded-2xl w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={cn("px-5 py-2 rounded-xl text-xs font-black transition-all",
              activeTab === t ? "bg-white text-zinc-900 shadow-sm border border-zinc-200" : "text-zinc-400")}>{t}</button>
        ))}
      </div>

      {activeTab === "Tổng quan" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {financeStats.map((s, idx) => (
              <div key={idx} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm group hover:border-[#1b5e20]/20 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-[#1b5e20]/5 group-hover:text-[#1b5e20] transition-all">
                    {idx === 0 ? <BarChart3 className="size-5" /> : idx === 1 ? <TrendingDown className="size-5" /> : idx === 2 ? <TrendingUp className="size-5" /> : <Wallet className="size-5" />}
                  </div>
                  <div className={cn("flex items-center gap-1 text-[10px] font-black", s.trend === "up" ? "text-emerald-600" : "text-rose-600")}>
                    {s.trend === "up" ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />} {s.sub}
                  </div>
                </div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{s.label}</p>
                <h3 className="text-xl font-black text-zinc-900">{formatCompactVND(s.val)}</h3>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Xu hướng KQKD</h3>
                  <p className="text-xs text-zinc-400 font-bold">Doanh thu vs Chi phí 6 tháng gần nhất</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase"><div className="size-2 rounded-full bg-[#1b5e20]" /> Doanh thu</div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase"><div className="size-2 rounded-full bg-rose-300" /> Chi phí</div>
                </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history.map((h: { cogs: number; opex: number; [k: string]: unknown }) => ({ ...h, totalCost: h.cogs + h.opex }))}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1b5e20" stopOpacity={0.2} /><stop offset="95%" stopColor="#1b5e20" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f4" />
                    <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: "#a1a1aa" }} tickFormatter={(p) => p.slice(-2)} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: "#a1a1aa" }} tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(1)}T`} />
                    <Tooltip formatter={(v) => formatCompactVND(Number(v))} contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                    <Area type="monotone" dataKey="revenue" stroke="#1b5e20" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="totalCost" stroke="#fda4af" strokeWidth={2} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight mb-8">Cơ cấu chi phí</h3>
              <div className="size-48 mx-auto relative mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={cost} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                      {cost.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-zinc-900">{(cost.reduce((s, c) => s + c.value, 0) / 1_000_000_000).toFixed(2)}</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tỷ VND</span>
                </div>
              </div>
              <div className="space-y-4">
                {cost.map((d) => (
                  <div key={d.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="size-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-xs font-black text-zinc-600">{d.name}</span>
                    </div>
                    <span className="text-xs font-black text-zinc-900">{formatCompactVND(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Nhật ký giao dịch gần đây</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-zinc-400 font-bold border-b border-zinc-50 uppercase tracking-widest">
                    <th className="pb-4">Ngày</th>
                    <th className="pb-4">Nội dung</th>
                    <th className="pb-4">Phòng ban</th>
                    <th className="pb-4">TK</th>
                    <th className="pb-4">Loại</th>
                    <th className="pb-4 text-right">Số tiền</th>
                    <th className="pb-4 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {txs.map((t) => {
                    const dept = DEPT_BY_ID[t.departmentId as keyof typeof DEPT_BY_ID];
                    return (
                      <tr key={t.id} className="hover:bg-zinc-50/50">
                        <td className="py-4 font-bold text-zinc-400">{new Date(t.date).toLocaleDateString("vi-VN")}</td>
                        <td className="py-4 font-black text-zinc-900">{t.title}</td>
                        <td className="py-4 text-zinc-500 font-medium">{dept?.name}</td>
                        <td className="py-4 font-mono text-zinc-400 text-[10px]">{t.account}</td>
                        <td className="py-4">
                          <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase",
                            t.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                            {t.type === "income" ? "Thu" : "Chi"}
                          </span>
                        </td>
                        <td className={cn("py-4 text-right font-black", t.type === "income" ? "text-emerald-600" : "text-rose-600")}>
                          {t.type === "income" ? "+" : "−"}{formatCompactVND(t.amount)}
                        </td>
                        <td className="py-4 text-center">
                          <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase",
                            t.status === "posted" ? "bg-emerald-50 text-emerald-600"
                              : t.status === "pending" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600")}>{t.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "P&L" && (
        <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight mb-6">Báo cáo Kết quả Kinh doanh — {fin.period}</h3>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-zinc-100">
              {[
                { label: "Doanh thu thuần", val: fin.revenue, level: 0 },
                { label: "Giá vốn hàng bán (COGS)", val: -fin.cogs, level: 1 },
                { label: "Lợi nhuận gộp", val: fin.grossProfit, level: 0, bold: true },
                { label: "Chi phí vận hành (OpEx)", val: -fin.opex, level: 1 },
                { label: "EBITDA", val: fin.ebitda, level: 0, bold: true },
                { label: "Thuế TNDN", val: -fin.tax, level: 1 },
                { label: "Lợi nhuận ròng", val: fin.netProfit, level: 0, bold: true, accent: true },
              ].map((r) => (
                <tr key={r.label}>
                  <td className={cn("py-3", r.level === 1 && "pl-8 text-zinc-500", r.bold && "font-black text-zinc-900")}>{r.label}</td>
                  <td className={cn("py-3 text-right font-bold tabular-nums",
                    r.val < 0 ? "text-rose-600" : r.accent ? "text-emerald-600 text-lg font-black" : "text-zinc-900")}>
                    {formatCompactVND(Math.abs(r.val))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Bảng cân đối" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-4">TÀI SẢN</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-zinc-100">
                {[
                  { l: "Tiền mặt + tương đương tiền", v: fin.cash },
                  { l: "Phải thu khách hàng (AR)", v: fin.ar },
                  { l: "Hàng tồn kho", v: fin.inventory },
                  { l: "Tài sản cố định", v: fin.fixedAssets },
                ].map((r) => (
                  <tr key={r.l}>
                    <td className="py-3">{r.l}</td>
                    <td className="py-3 text-right font-bold">{formatCompactVND(r.v)}</td>
                  </tr>
                ))}
                <tr className="bg-emerald-50">
                  <td className="py-3 font-black px-2 rounded-l-lg">Tổng tài sản</td>
                  <td className="py-3 text-right font-black px-2 rounded-r-lg text-emerald-700">{formatCompactVND(fin.cash + fin.ar + fin.inventory + fin.fixedAssets)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-4">NGUỒN VỐN</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-zinc-100">
                {[
                  { l: "Phải trả người bán (AP)", v: fin.ap },
                  { l: "Vay ngắn hạn", v: fin.shortTermDebt },
                  { l: "Vay dài hạn", v: fin.longTermDebt },
                  { l: "Vốn chủ sở hữu", v: fin.equity },
                ].map((r) => (
                  <tr key={r.l}>
                    <td className="py-3">{r.l}</td>
                    <td className="py-3 text-right font-bold">{formatCompactVND(r.v)}</td>
                  </tr>
                ))}
                <tr className="bg-emerald-50">
                  <td className="py-3 font-black px-2 rounded-l-lg">Tổng nguồn vốn</td>
                  <td className="py-3 text-right font-black px-2 rounded-r-lg text-emerald-700">{formatCompactVND(fin.ap + fin.shortTermDebt + fin.longTermDebt + fin.equity)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Dòng tiền" && (
        <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight mb-8">Dòng tiền 6 tháng (đv: tỷ VND)</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cf.map((c: { period: string; cashIn: number; cashOut: number; net: number }) => ({ ...c, cashIn: c.cashIn / 1_000_000_000, cashOut: c.cashOut / 1_000_000_000, net: c.net / 1_000_000_000 }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f4" />
                <XAxis dataKey="period" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="cashIn" fill="#1b5e20" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cashOut" fill="#fda4af" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-6 text-xs text-zinc-500 text-center">
            Runway hiện tại: <span className="font-black text-blue-600">{runway} tháng</span> với cash {formatCompactVND(fin.cash)}.
          </p>
        </div>
      )}
    </div>
  );
}
