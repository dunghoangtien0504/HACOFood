"use client";

import Link from "next/link";
import { ShieldOff, ArrowLeft, Home } from "lucide-react";
import { useDemoSession, ROLE_LABELS } from "@/lib/auth/demoSession";

export default function UnauthorizedPage() {
  const { user } = useDemoSession();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-8">
      <div className="text-center max-w-md space-y-8">
        {/* Icon */}
        <div className="size-24 rounded-[2rem] bg-rose-50 border-2 border-rose-100 flex items-center justify-center mx-auto">
          <ShieldOff className="size-10 text-rose-500" />
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-zinc-900">Không có quyền truy cập</h1>
          <p className="text-sm text-zinc-500 font-medium leading-relaxed">
            Tài khoản <span className="font-black text-zinc-900">{user.fullName}</span>{" "}
            ({ROLE_LABELS[user.role]}) không có quyền xem trang này.
          </p>
          <p className="text-xs text-zinc-400">
            Liên hệ CEO hoặc HR Admin để được cấp quyền truy cập.
          </p>
        </div>

        {/* Role badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-full">
          <div className="size-2 rounded-full bg-rose-400" />
          <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">
            Role hiện tại: {ROLE_LABELS[user.role]}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-zinc-200 rounded-xl font-bold text-sm text-zinc-600 hover:border-zinc-300 transition-colors"
          >
            <ArrowLeft className="size-4" /> Quay lại
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-3 bg-[#1b5e20] text-white rounded-xl font-bold text-sm hover:bg-[#144317] transition-colors"
          >
            <Home className="size-4" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
