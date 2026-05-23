"use client";

import React, { useMemo, useState } from "react";
import ReactFlow, { Background, Controls, Edge, Node, Handle, Position, Panel } from "reactflow";
import "reactflow/dist/style.css";
import { cn, formatCompactVND, formatPercent } from "@/lib/utils";
import {
  Users, LayoutGrid, UserCheck, Wallet, Target, Download, Share2, ChevronRight, ShieldCheck,
  TrendingUp, Sparkles, ChefHat, FlaskConical, Truck,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  COMPANY, listDepartmentsWithKpi, getDepartmentSummary, EMP_BY_ID,
  type DeptId, useHACOUpdate,
} from "@/lib/queries";

// Map icon name (string trong demo.ts) → component lucide
const ICONS: Record<string, React.ReactNode> = {
  ShieldCheck: <ShieldCheck className="size-6" />,
  TrendingUp: <TrendingUp className="size-6" />,
  Sparkles: <Sparkles className="size-6" />,
  ChefHat: <ChefHat className="size-6" />,
  FlaskConical: <FlaskConical className="size-6" />,
  Truck: <Truck className="size-6" />,
  Wallet: <Wallet className="size-6" />,
  LayoutGrid: <LayoutGrid className="size-6" />,
  UserCheck: <UserCheck className="size-6" />,
};

const DeptNode = ({ data }: { data: any }) => (
  <div className={cn("px-6 py-5 shadow-2xl rounded-[2rem] bg-white border-2 min-w-[240px] transition-all group hover:-translate-y-1",
    data.selected ? "border-[#1b5e20] ring-8 ring-[#1b5e20]/5" : "border-zinc-50")}>
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-zinc-200 !border-white shadow-sm" />
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={cn("size-12 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg", data.color)}>
          {ICONS[data.icon] ?? <Users className="size-6" />}
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">KPI</p>
          <p className={cn("text-sm font-black",
            data.kpi >= 95 ? "text-emerald-600" : data.kpi >= 85 ? "text-amber-500" : "text-rose-500")}>{data.kpi}%</p>
        </div>
      </div>
      <div>
        <h4 className="text-base font-black text-zinc-900 group-hover:text-[#1b5e20] transition-colors">{data.label}</h4>
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Trưởng phòng: {data.manager}</p>
      </div>
      <div className="pt-4 border-t border-zinc-50 flex items-center justify-between">
        <span className="text-[10px] font-black text-zinc-900 uppercase">{data.headcount} nhân sự</span>
        <span className="text-[10px] font-black text-zinc-400 uppercase">{data.code}</span>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-zinc-200 !border-white shadow-sm" />
  </div>
);

const nodeTypes = { dept: DeptNode };

export default function OrgPage() {
  useHACOUpdate();
  const departments = listDepartmentsWithKpi();
  const [selectedId, setSelectedId] = useState<DeptId | null>(null);

  const { nodes, edges } = useMemo(() => {
    // root = công ty; children = các phòng
    const COMPANY_NODE: Node = {
      id: "co",
      type: "dept",
      data: {
        label: COMPANY.name,
        code: COMPANY.code,
        manager: EMP_BY_ID[departments.find((d) => d.id === "dept_exec")?.headEmployeeId ?? "emp_001"]?.fullName,
        kpi: Math.round(departments.reduce((s, d) => s + d.kpiAvg, 0) / departments.length),
        color: "bg-zinc-900",
        icon: "ShieldCheck",
        headcount: departments.reduce((s, d) => s + d.headcount, 0),
      },
      position: { x: 600, y: 0 },
    };

    const childNodes: Node[] = departments
      .filter((d) => d.id !== "dept_exec")
      .map((d, i) => ({
        id: d.id,
        type: "dept",
        data: {
          label: d.name,
          code: d.code,
          manager: EMP_BY_ID[d.headEmployeeId]?.fullName ?? "—",
          kpi: d.kpiAvg,
          color: d.color,
          icon: d.icon,
          headcount: d.headcount,
        },
        position: { x: i * 320, y: 280 },
      }));

    const e: Edge[] = childNodes.map((n) => ({
      id: `e_${n.id}`, source: "co", target: n.id, animated: true, style: { stroke: "#e5e7eb" },
    }));

    return { nodes: [COMPANY_NODE, ...childNodes], edges: e };
  }, [departments]);

  const onNodeClick = (_: any, node: Node) => {
    if (node.id !== "co") setSelectedId(node.id as DeptId);
  };

  const detail = selectedId ? getDepartmentSummary(selectedId) : null;

  return (
    <div className="space-y-6 animate-fade-in pb-10 h-full flex flex-col">
      <PageHeader
        title={`Sơ đồ tổ chức — ${COMPANY.name}`}
        breadcrumbs={["Trang chủ", "Hệ thống", "Sơ đồ tổ chức"]}
        actions={
          <div className="flex items-center gap-3">
            <button className="bg-white border border-zinc-200 px-4 py-2 rounded-2xl font-black text-xs text-zinc-600 flex items-center gap-2 shadow-sm">
              <Share2 className="size-3" /> Xuất sơ đồ
            </button>
            <button className="bg-[#1b5e20] text-white px-6 py-2 rounded-2xl font-black text-xs shadow-xl shadow-[#1b5e20]/20 flex items-center gap-2">
              <Download className="size-3" /> Tải báo cáo
            </button>
          </div>
        }
      />

      <div className="flex-1 grid gap-6 lg:grid-cols-12 min-h-[700px]">
        <div className={cn("rounded-[3rem] border border-zinc-100 bg-white shadow-sm overflow-hidden relative transition-all duration-500",
          detail ? "lg:col-span-8" : "lg:col-span-12")}>
          <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodeClick={onNodeClick} fitView className="bg-zinc-50/20">
            <Background color="#1b5e20" gap={40} size={1} />
            <Controls />
            <Panel position="bottom-center" className="bg-zinc-900 text-white p-4 rounded-[2rem] shadow-2xl flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-emerald-500" /> <span className="text-[10px] font-black uppercase">≥95% KPI</span></div>
              <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-amber-500" /> <span className="text-[10px] font-black uppercase">85-94%</span></div>
              <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-rose-500" /> <span className="text-[10px] font-black uppercase">&lt;85%</span></div>
            </Panel>
          </ReactFlow>
        </div>

        {detail && (
          <div className="lg:col-span-4 rounded-[3rem] border border-zinc-100 bg-white p-10 shadow-xl overflow-y-auto custom-scrollbar animate-fade-in relative">
            <button onClick={() => setSelectedId(null)} className="absolute top-8 right-8 size-10 rounded-full hover:bg-zinc-50 flex items-center justify-center text-zinc-300">×</button>
            <div className="text-center mb-10">
              <div className={cn("size-24 rounded-[2rem] flex items-center justify-center text-white shadow-2xl mx-auto mb-6", detail.department.color)}>
                {ICONS[detail.department.icon] ?? <Users className="size-6" />}
              </div>
              <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">{detail.department.name}</h3>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-2">{detail.department.scope}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <Box label="Nhân sự" val={String(detail.metrics.headcountReported)} />
              <Box label="KPI Tháng" val={formatPercent(detail.metrics.kpiAvgCompletion * 100, 0)} accent={detail.metrics.kpiAvgCompletion >= 0.95 ? "text-emerald-600" : "text-amber-500"} />
              <Box label="Ngân sách" val={formatCompactVND(detail.metrics.budgetMonthly)} />
              <Box label="Chi thực" val={formatCompactVND(detail.metrics.costActual)} accent={detail.metrics.budgetUtilization > 1 ? "text-rose-500" : "text-zinc-900"} />
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Target className="size-3" /> KPI trọng điểm
                </h4>
                <div className="space-y-4">
                  {detail.kpis.slice(0, 5).map((k) => {
                    const c = k.direction === "increase" ? k.actual / k.target : k.target / Math.max(k.actual, 1);
                    return (
                      <div key={k.id} className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="text-zinc-500 truncate pr-2">{k.name}</span>
                          <span className="text-zinc-900 shrink-0">{Math.round(c * 100)}%</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-50 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full",
                            c >= 0.95 ? "bg-emerald-500" : c >= 0.85 ? "bg-amber-500" : "bg-rose-500")}
                            style={{ width: `${Math.min(c * 100, 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-50">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Lãnh đạo</h4>
                <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="size-12 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-black">{detail.head?.avatarInitials ?? "?"}</div>
                  <div>
                    <p className="text-sm font-black text-zinc-900">{detail.head?.fullName}</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">{detail.head?.position}</p>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full mt-12 py-4 bg-zinc-900 text-white rounded-[1.5rem] font-black text-xs uppercase shadow-2xl hover:bg-zinc-800 flex items-center justify-center gap-3">
              Xem chi tiết phòng <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Box({ label, val, accent }: { label: string; val: string; accent?: string }) {
  return (
    <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 text-center">
      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={cn("text-xl font-black", accent ?? "text-zinc-900")}>{val}</p>
    </div>
  );
}
