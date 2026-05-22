import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

export function StatCard({
  label,
  value,
  trend,
  trendValue,
  icon: Icon,
  chartData,
  color = "#1b5e20",
  className
}: {
  label: string;
  value: string;
  trend?: "up" | "down";
  trendValue?: string;
  icon?: any;
  chartData?: any[];
  color?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:shadow-md transition-all group", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
        <div className="size-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-[#1b5e20] transition-colors">
          {Icon ? <Icon className="size-4" /> : <TrendingUp className="size-4" />}
        </div>
      </div>
      
      <div className="flex items-end justify-between gap-2">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-zinc-900">{value}</h3>
          {(trend || trendValue) && (
            <div className="flex items-center gap-1">
              {trend === "up" ? (
                <ArrowUpRight className="size-3 text-emerald-600" />
              ) : (
                <ArrowDownRight className="size-3 text-rose-600" />
              )}
              <span className={cn("text-[10px] font-black", trend === "up" ? "text-emerald-600" : "text-rose-600")}>
                {trendValue}
              </span>
              <span className="text-[9px] text-zinc-400 font-medium">so với T3/2026</span>
            </div>
          )}
        </div>

        {chartData && (
          <div className="h-10 w-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="v" 
                  stroke={color} 
                  strokeWidth={2} 
                  fill={`url(#grad-${label})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
