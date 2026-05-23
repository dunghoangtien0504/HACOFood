"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Search, Calendar, ChevronDown, Plus, FileText, ArrowUpRight, Wallet,
  TrendingUp, BarChart3,
} from "lucide-react";
import { cn, formatCompactVND, formatPercent } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import {
  payrollSummary, DEFAULT_RULES, listDepartments, DEPT_BY_ID, useHACOUpdate, notify
} from "@/lib/queries";

export default function CompensationPage() {
  useHACOUpdate();

  const [activeTab, setActiveTab] = useState("Bảng lương");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");

  const summary = payrollSummary();
  const filtered = summary.rows.filter((r) => {
    if (deptFilter !== "all" && r.employee.departmentId !== deptFilter) return false;
    if (search && !r.employee.fullName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const deptList = listDepartments();

  const compStats = [
    { label: "Tổng quỹ lương gross", val: summary.grossTotal, tVal: "kỳ T5/2026" },
    { label: "Bonus KPI giải ngân", val: summary.bonusTotal, tVal: `${(summary.bonusTotal / summary.grossTotal * 100).toFixed(1)}% gross` },
    { label: "BHXH/BHYT/BHTN", val: summary.insuranceTotal, tVal: "10.5% NLĐ" },
    { label: "Chi phí công ty", val: summary.companyCostTotal, tVal: "+ 17.5% BHXH" },
  ];

  // chart payroll theo phòng
  const chartByDept = deptList.map((d) => {
    const rs = summary.rows.filter((r) => r.employee.departmentId === d.id);
    return {
      name: d.code,
      gross: Math.round(rs.reduce((s, r) => s + r.payroll.gross, 0) / 1_000_000),
      bonus: Math.round(rs.reduce((s, r) => s + r.payroll.bonusEarned, 0) / 1_000_000),
    };
  });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Lương thưởng & Đãi ngộ"
        breadcrumbs={["Trang chủ", "Tài chính", "Lương thưởng"]}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-zinc-200 px-3 py-2 rounded-lg text-xs font-bold text-zinc-600">
              <Calendar className="size-3" /> Kỳ T5/2026 <ChevronDown className="size-3" />
            </div>
            <button
              onClick={() => { notify(); alert("Đã cập nhật và đồng bộ dữ liệu bảng lương thời gian thực!"); }}
              className="bg-[#1b5e20] hover:bg-[#154618] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg shadow-[#1b5e20]/20 flex items-center gap-2 transition-colors"
            >
              <Plus className="size-3" /> Chạy lại payroll
            </button>
          </div>
        }
      />

      {/* Top stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {compStats.map((s, idx) => (
          <div key={idx} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{s.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-xl font-black text-zinc-900">{formatCompactVND(s.val)}</h3>
              <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1"><ArrowUpRight className="size-3 text-emerald-500" /> {s.tVal}</p>
            </div>
          </div>
        ))}
      </div>

      {/* KPI summary banner */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center"><Wallet className="size-5" /></div>
          <div>
            <p className="text-sm font-black text-emerald-900">Payroll/Revenue: <span className="text-emerald-700">{formatPercent(summary.payrollOverRevenue * 100, 1)}</span></p>
            <p className="text-xs text-emerald-700/80 mt-0.5">
              Bonus pool {formatCompactVND(summary.bonusTotal)} · TB/người {formatCompactVND(summary.avgPerHead)} · {summary.rows.length} nhân sự
            </p>
          </div>
        </div>
        <p className="text-[10px] font-bold text-emerald-700 uppercase">computePayroll() đã chạy theo {DEFAULT_RULES.length} bậc rule</p>
      </div>

      {/* Chart + Table */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-[2.5rem] p-6 shadow-sm">
          <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-6">Quỹ lương theo phòng (triệu)</h3>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartByDept} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f4" />
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip />
                <Bar dataKey="gross" fill="#1b5e20" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="bonus" fill="#86efac" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2 text-[11px] font-bold">
            {DEFAULT_RULES.map((r, i) => (
              <div key={i} className="flex justify-between text-zinc-500">
                <span>≥ {Math.round(r.threshold * 100)}%</span>
                <span className="text-zinc-900">×{r.multiplier.toFixed(1)} bonus</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-6">
              {["Bảng lương", "Cấu hình rule", "Lịch sử"].map((t) => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={cn("text-xs font-black transition-all pb-2 border-b-2",
                    activeTab === t ? "border-[#1b5e20] text-zinc-900" : "border-transparent text-zinc-400")}>{t}</button>
              ))}
            </div>
            <div className="flex gap-3">
              <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-bold text-zinc-700 px-3 py-2 outline-none">
                <option value="all">Tất cả phòng</option>
                {deptList.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm nhân sự..." className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-xs outline-none w-48" />
              </div>
            </div>
          </div>

          {activeTab === "Bảng lương" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-zinc-400 font-bold border-b border-zinc-50 uppercase tracking-widest">
                    <th className="pb-4">Nhân sự</th>
                    <th className="pb-4 text-center">KPI</th>
                    <th className="pb-4 text-right">Cơ bản</th>
                    <th className="pb-4 text-right">Bonus</th>
                    <th className="pb-4 text-right">Gross</th>
                    <th className="pb-4 text-right">Net</th>
                    <th className="pb-4 text-center">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filtered.map((r) => {
                    const kpiPct = Math.round(r.payroll.kpiCompletion * 100);
                    return (
                      <tr key={r.employee.id} className="hover:bg-zinc-50/50">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-zinc-900 text-white text-[10px] font-black flex items-center justify-center">{r.employee.avatarInitials}</div>
                            <div>
                              <p className="font-black text-zinc-900">{r.employee.fullName}</p>
                              <p className="text-[9px] text-zinc-400 font-bold">{r.employee.position}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black",
                            kpiPct >= 95 ? "bg-emerald-50 text-emerald-600"
                              : kpiPct >= 85 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600")}>{kpiPct}%</span>
                        </td>
                        <td className="py-4 text-right font-bold text-zinc-500">{formatCompactVND(r.payroll.baseSalary)}</td>
                        <td className="py-4 text-right font-bold text-emerald-600">+{formatCompactVND(r.payroll.bonusEarned)}</td>
                        <td className="py-4 text-right font-black text-zinc-900">{formatCompactVND(r.payroll.gross)}</td>
                        <td className="py-4 text-right font-black text-blue-600">{formatCompactVND(r.payroll.net)}</td>
                        <td className="py-4 text-center">
                          {r.override ? (
                            <span title={r.override.note} className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[8px] font-black uppercase">override</span>
                          ) : (
                            <span className="text-[9px] text-zinc-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="text-center text-xs text-zinc-400 py-8 italic">Không có nhân sự khớp bộ lọc.</p>}
            </div>
          )}

          {activeTab === "Cấu hình rule" && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500">5 bậc rule mặc định: nếu KPI completion vượt threshold, hệ số bonus được áp dụng. Hệ số phòng (DEPT_MULTIPLIER) cộng thêm.</p>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-zinc-400 font-bold border-b border-zinc-50 uppercase tracking-widest">
                    <th className="pb-3">Threshold KPI</th>
                    <th className="pb-3 text-right">Bonus multiplier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {DEFAULT_RULES.map((r, i) => (
                    <tr key={i}>
                      <td className="py-3 font-bold">≥ {Math.round(r.threshold * 100)}%</td>
                      <td className="py-3 text-right font-black text-[#1b5e20]">×{r.multiplier.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "Lịch sử" && (
            <p className="text-xs text-zinc-400 italic py-8 text-center">Chưa có lịch sử payroll trước T5/2026.</p>
          )}
        </div>
      </div>
    </div>
  );
}
