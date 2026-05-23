"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, Bot, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { setDemoUser, DEMO_USERS, ROLE_LABELS, ROLE_COLORS, type DemoUser } from "@/lib/auth/demoSession";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  // Full login (demo: any credentials work)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Map email to demo user if found, else default to CEO
    const matched = DEMO_USERS.find((u) => u.email === email.trim().toLowerCase());
    const user = matched ?? DEMO_USERS[0];
    setDemoUser(user);
    setTimeout(() => router.push("/dashboard"), 800);
  };

  // Quick demo login — select role instantly
  const handleQuickLogin = (user: DemoUser) => {
    setDemoLoading(user.id);
    setDemoUser(user);
    setTimeout(() => router.push("/dashboard"), 500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row overflow-hidden font-sans">

      {/* ── Left: Branding ────────────────────────────────────────── */}
      <div className="hidden md:flex md:w-[55%] bg-[#1b5e20] relative items-center justify-center p-16 overflow-hidden">
        <div className="relative z-10 space-y-10 max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-[1.5rem] bg-white flex items-center justify-center font-black text-[#1b5e20] text-xl shadow-2xl">HC</div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">Bếp Cô Hạ OS</h1>
              <p className="text-[10px] font-black text-white/50 tracking-[0.3em] uppercase">Enterprise Operating System</p>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white leading-tight">
              Quản trị doanh nghiệp bằng{" "}
              <span className="text-emerald-400">Trí tuệ nhân tạo.</span>
            </h2>
            <p className="text-sm text-white/60 font-medium leading-relaxed">
              Task → KPI cá nhân → KPI phòng ban → KPI công ty → Lợi nhuận.
              Mọi hành động đều có trọng số tác động đến Net Profit.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
            {[
              { v: "28", l: "Màn hình" },
              { v: "23", l: "KPI cascade" },
              { v: "7", l: "Phòng ban" },
            ].map((s) => (
              <div key={s.l} className="space-y-1">
                <p className="text-2xl font-black text-white">{s.v}</p>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{s.l}</p>
              </div>
            ))}
          </div>

          {/* Quick demo role chips */}
          <div className="space-y-3 pt-4">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Truy cập nhanh theo vai trò</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u)}
                  disabled={!!demoLoading}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border border-white/10",
                    demoLoading === u.id
                      ? "bg-white text-[#1b5e20] scale-95"
                      : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  {demoLoading === u.id ? (
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#1b5e20] animate-ping inline-block" />
                      Đang vào...
                    </span>
                  ) : (
                    <>{ROLE_LABELS[u.role]} · {u.fullName.split(" ").pop()}</>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute -right-20 -bottom-20 size-[500px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 size-[350px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Floating AI badge */}
        <div className="absolute bottom-16 right-16 p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-400 flex items-center justify-center text-[#1b5e20]">
              <Bot className="size-5" />
            </div>
            <div>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">AI COO Status</p>
              <p className="text-xs font-black text-white">Online · DEMO MODE</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Login Form ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 bg-white">
        <div className="w-full max-w-[400px] space-y-8">

          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-3 mb-2">
            <div className="size-10 rounded-2xl bg-[#1b5e20] flex items-center justify-center font-black text-white text-sm">HC</div>
            <span className="text-lg font-black text-zinc-900 uppercase">Bếp Cô Hạ OS</span>
          </div>

          <div>
            <h3 className="text-2xl font-black text-zinc-900">Đăng nhập</h3>
            <p className="text-xs font-bold text-zinc-400 mt-1">Dùng email công ty hoặc chọn vai trò demo bên dưới.</p>
          </div>

          {/* Demo quick-login (mobile only / fallback) */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-3 md:hidden">
            <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="size-3" /> Truy cập nhanh — Demo Mode
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u)}
                  disabled={!!demoLoading}
                  className={cn(
                    "py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-left",
                    demoLoading === u.id
                      ? "bg-[#1b5e20] text-white"
                      : "bg-white border border-emerald-100 text-zinc-700 hover:border-[#1b5e20]"
                  )}
                >
                  <span className={cn("inline-block px-1.5 py-0.5 rounded text-[8px] font-black mb-0.5 mr-1", ROLE_COLORS[u.role])}>
                    {ROLE_LABELS[u.role]}
                  </span>
                  <br />
                  {u.fullName.split(" ").slice(-2).join(" ")}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-100" />
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Hoặc đăng nhập bằng email</span>
            <div className="flex-1 h-px bg-zinc-100" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Email công việc</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  placeholder="name@haco.food"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold outline-none focus:border-[#1b5e20] focus:ring-4 focus:ring-[#1b5e20]/5 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Mật khẩu</label>
                <button type="button" className="text-[10px] font-black text-[#1b5e20] uppercase hover:underline">
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold outline-none focus:border-[#1b5e20] focus:ring-4 focus:ring-[#1b5e20]/5 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" id="remember" className="size-4 rounded border-zinc-200 accent-[#1b5e20]" />
              <label htmlFor="remember" className="text-xs font-bold text-zinc-500 cursor-pointer">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-4 bg-[#1b5e20] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#1b5e20]/20 flex items-center justify-center gap-3 hover:bg-[#144317] transition-all",
                isLoading && "opacity-80 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Đăng nhập hệ thống <ArrowRight className="size-4" /></>
              )}
            </button>
          </form>

          {/* Security note */}
          <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <ShieldCheck className="size-5 text-[#1b5e20] shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-zinc-400 leading-relaxed uppercase">
              Phiên làm việc được mã hóa end-to-end. Dữ liệu demo được lưu cục bộ — không gửi lên server.
            </p>
          </div>

          {/* Footer links */}
          <div className="flex justify-center gap-6 pt-2">
            {["Trợ giúp", "Chính sách", "Điều khoản"].map((l) => (
              <button key={l} className="text-[9px] font-black text-zinc-300 uppercase tracking-widest hover:text-zinc-600 transition-colors">
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
