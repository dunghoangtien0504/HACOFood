"use client";

import { useState } from "react";
import { cn, formatCompactVND } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, Filter, Search, Plus, X } from "lucide-react";
import {
  listApprovals,
  approvalsSummary,
  EMP_BY_ID,
  DEPT_BY_ID,
  useHACOUpdate,
  approveApproval,
  rejectApproval,
  createApproval,
  listEmployees,
  listDepartments
} from "@/lib/queries";
import { useDemoSession } from "@/lib/auth/demoSession";

const KIND_LABEL: Record<string, string> = {
  bonus: "Bonus", budget: "Ngân sách", hire: "Tuyển dụng", purchase: "Mua sắm", expense: "Chi phí",
};

export default function ApprovalsPage() {
  const { user } = useDemoSession();
  useHACOUpdate();

  // Only these roles can approve/reject
  const canApprove = ["ceo", "cfo", "hr_admin", "dept_head"].includes(user.role);

  const all = listApprovals();
  const sum = approvalsSummary();
  const employees = listEmployees();
  const departments = listDepartments();

  const [filter, setFilter] = useState<string>("pending");
  const [search, setSearch] = useState("");

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKind, setNewKind] = useState<"bonus" | "budget" | "hire" | "purchase" | "expense">("purchase");
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newRequesterId, setNewRequesterId] = useState(employees[0]?.id || "");
  const [newApproverId, setNewApproverId] = useState("emp_001"); // Default CEO
  const [newDeptId, setNewDeptId] = useState<any>(departments[0]?.id || "dept_prod");
  const [newNote, setNewNote] = useState("");

  const filtered = all.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreateApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createApproval({
      kind: newKind,
      title: newTitle.trim(),
      amount: newAmount ? parseFloat(newAmount) : 0,
      requesterId: newRequesterId,
      approverId: newApproverId,
      departmentId: newDeptId,
      note: newNote.trim(),
    });

    // Reset Form
    setNewTitle("");
    setNewAmount("");
    setNewNote("");
    setShowCreateModal(false);
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">Trung tâm phê duyệt</h1>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">
            {sum.pending} pending · giá trị {formatCompactVND(sum.pendingValue)}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#1b5e20] hover:bg-[#154618] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg shadow-[#1b5e20]/20 flex items-center gap-2 transition-colors"
        >
          <Plus className="size-3" /> Tạo yêu cầu
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { l: "Chờ duyệt", v: sum.pending, color: "text-amber-600" },
          { l: "Giá trị chờ", v: formatCompactVND(sum.pendingValue), color: "text-zinc-900" },
          { l: "Đã duyệt", v: sum.approved30d, color: "text-emerald-600" },
          { l: "Bị từ chối", v: sum.rejected30d, color: "text-rose-600" },
        ].map((s) => (
          <div key={s.l} className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{s.l}</p>
            <p className={cn("text-xl font-black mt-1", s.color)}>{s.v}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="size-4 text-zinc-400" />
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-bold border capitalize transition-colors",
              filter === s ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50")}>{s}</button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm yêu cầu..." className="pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-xs outline-none w-56 focus:border-zinc-400 transition-colors" />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((a) => {
          const requester = EMP_BY_ID[a.requesterId];
          const approver = EMP_BY_ID[a.approverId];
          const dept = DEPT_BY_ID[a.departmentId];
          return (
            <div key={a.id} className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-black uppercase">{KIND_LABEL[a.kind]}</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">{dept?.name}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase",
                      a.status === "approved" ? "bg-emerald-50 text-emerald-600"
                        : a.status === "rejected" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600")}>{a.status}</span>
                  </div>
                  <h3 className="text-sm font-black text-zinc-900">{a.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{a.note}</p>
                  <div className="flex items-center gap-6 mt-3 text-[10px] font-bold text-zinc-400">
                    <span>Requester: <span className="text-zinc-700">{requester?.fullName || "Hệ thống"}</span></span>
                    <span>Approver: <span className="text-zinc-700">{approver?.fullName || "CEO"}</span></span>
                    <span>Created: {new Date(a.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {a.amount > 0 && (
                    <p className="text-lg font-black text-zinc-900">{formatCompactVND(a.amount)}</p>
                  )}
                  {a.status === "pending" && canApprove && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => approveApproval(a.id)}
                        className="px-3 py-1.5 bg-[#1b5e20] hover:bg-[#154618] text-white rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="size-3" /> Duyệt
                      </button>
                      <button
                        onClick={() => rejectApproval(a.id)}
                        className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="size-3" /> Từ chối
                      </button>
                    </div>
                  )}
                  {a.status === "pending" && !canApprove && (
                    <span className="mt-3 inline-block px-2 py-1 bg-zinc-50 text-zinc-400 rounded-lg text-[9px] font-black uppercase">Chờ duyệt</span>
                  )}
                  {a.status !== "pending" && a.decidedAt && (
                    <p className="text-[10px] text-zinc-400 mt-2 flex items-center gap-1 justify-end">
                      <Clock className="size-3" /> {new Date(a.decidedAt).toLocaleDateString("vi-VN")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-xs text-zinc-400 py-8 italic">Không có yêu cầu nào.</p>}
      </div>
    </div>

      {/* CREATE APPROVAL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="text-base font-black text-zinc-900">Tạo Yêu Cầu Phê Duyệt Mới</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleCreateApproval} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Loại yêu cầu</label>
                  <select
                    value={newKind}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setNewKind(val);
                      if (val === "hire") {
                        setNewAmount("0");
                      }
                    }}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-400 transition-colors"
                  >
                    <option value="purchase">Mua sắm (Purchase)</option>
                    <option value="expense">Chi phí (Expense)</option>
                    <option value="budget">Ngân sách (Budget)</option>
                    <option value="hire">Tuyển dụng (Hire)</option>
                    <option value="bonus">Thưởng (Bonus)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Phòng ban liên quan</label>
                  <select
                    value={newDeptId}
                    onChange={(e) => setNewDeptId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-400 transition-colors"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Tiêu đề yêu cầu</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Mua máy pha cafe cho văn phòng hoặc Tuyển dụng 2 nhân viên Marketing..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-400 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Số tiền (VND)</label>
                  <input
                    type="number"
                    disabled={newKind === "hire"}
                    placeholder="Số tiền mong muốn duyệt..."
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-400 transition-colors disabled:bg-zinc-100 disabled:text-zinc-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Người yêu cầu (Requester)</label>
                  <select
                    value={newRequesterId}
                    onChange={(e) => setNewRequesterId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-400 transition-colors"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.fullName} ({DEPT_BY_ID[emp.departmentId]?.name})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Người duyệt (Approver)</label>
                <select
                  value={newApproverId}
                  onChange={(e) => setNewApproverId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-400 transition-colors"
                >
                  <option value="emp_001">Nguyễn Thị Hạ (CEO)</option>
                  <option value="emp_007">Lê Minh Châu (CFO)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Ghi chú chi tiết</label>
                <textarea
                  rows={3}
                  placeholder="Lý do yêu cầu, lợi ích kỳ vọng mang lại cho công ty..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-400 transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1b5e20] hover:bg-[#154618] text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
