"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Bot,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Left Side: Branding & Experience */}
      <div className="hidden md:flex md:w-[60%] bg-[#1b5e20] relative items-center justify-center p-20 overflow-hidden">
        <div className="relative z-10 space-y-12 max-w-xl">
           <div className="flex items-center gap-4">
              <div className="size-16 rounded-[2rem] bg-white flex items-center justify-center font-black text-[#1b5e20] text-2xl shadow-2xl">HC</div>
              <div className="flex flex-col text-white">
                 <h1 className="text-3xl font-black tracking-tight uppercase">Bếp Cô Hạ OS</h1>
                 <p className="text-xs font-black text-white/60 tracking-[0.3em] uppercase">Enterprise Operating System</p>
              </div>
           </div>

           <div className="space-y-6">
              <h2 className="text-5xl font-black text-white leading-tight">Quản trị doanh nghiệp bằng <span className="text-emerald-400">Trí tuệ nhân tạo.</span></h2>
              <p className="text-lg text-white/70 font-medium leading-relaxed">Hệ điều hành tích hợp AI COO giúp bạn tối ưu hóa 40% hiệu suất vận hành và đưa ra quyết định dựa trên dữ liệu thời gian thực.</p>
           </div>

           <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/10">
              <div className="space-y-2">
                 <p className="text-3xl font-black text-white">92%</p>
                 <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Tự động hóa KPI</p>
              </div>
              <div className="space-y-2">
                 <p className="text-3xl font-black text-white">18+</p>
                 <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Phân hệ chuyên sâu</p>
              </div>
           </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -right-20 -bottom-20 size-[600px] bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -left-20 -top-20 size-[400px] bg-emerald-400/10 rounded-full blur-3xl" />
        
        {/* Floating AI Badge */}
        <div className="absolute bottom-20 right-20 p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl animate-bounce-slow">
           <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-emerald-400 flex items-center justify-center text-[#1b5e20]">
                 <Bot className="size-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">AI Status</p>
                 <p className="text-sm font-black text-white">COO is Online</p>
              </div>
           </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white md:bg-transparent">
        <div className="w-full max-w-[420px] space-y-10">
           <div className="text-center md:text-left">
              <h3 className="text-3xl font-black text-zinc-900 tracking-tight">Đăng nhập</h3>
              <p className="text-sm font-bold text-zinc-400 mt-2">Chào mừng bạn trở lại với hệ thống quản trị.</p>
           </div>

           <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Email công việc</label>
                 <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                    <input 
                      type="email" 
                      required
                      placeholder="name@hacofood.vn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold outline-none focus:border-[#1b5e20] focus:ring-4 focus:ring-[#1b5e20]/5 transition-all"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Mật khẩu</label>
                    <button type="button" className="text-[10px] font-black text-[#1b5e20] uppercase">Quên mật khẩu?</button>
                 </div>
                 <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold outline-none focus:border-[#1b5e20] focus:ring-4 focus:ring-[#1b5e20]/5 transition-all"
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
                 <input type="checkbox" className="size-4 rounded border-zinc-200 text-[#1b5e20] focus:ring-[#1b5e20]/20" />
                 <span className="text-xs font-bold text-zinc-500">Ghi nhớ đăng nhập trên thiết bị này</span>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full py-5 bg-[#1b5e20] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#1b5e20]/20 flex items-center justify-center gap-3 hover:bg-[#144317] transition-all relative overflow-hidden",
                  isLoading && "opacity-80 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Đăng nhập hệ thống <ArrowRight className="size-4" /></>
                )}
                {isLoading && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
              </button>
           </form>

           <div className="pt-10 border-t border-zinc-50 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                 <ShieldCheck className="size-6 text-[#1b5e20] shrink-0" />
                 <p className="text-[10px] font-bold text-[#1b5e20]/70 leading-relaxed uppercase">Hệ thống sử dụng bảo mật đa tầng. Phiên làm việc của bạn sẽ được mã hóa đầu cuối (End-to-end encrypted).</p>
              </div>

              <div className="flex justify-center gap-8">
                 <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest cursor-pointer hover:text-zinc-900">Trợ giúp</p>
                 <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest cursor-pointer hover:text-zinc-900">Chính sách bảo mật</p>
                 <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest cursor-pointer hover:text-zinc-900">Điều khoản</p>
              </div>
           </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
