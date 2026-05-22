"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactVND } from "@/lib/utils";

export function AreaTrend({
  data,
  dataKey = "value",
  xKey = "label",
  color = "#10b981",
  height = 240,
}: {
  data: any[];
  dataKey?: string;
  xKey?: string;
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f4" vertical={false} />
        <XAxis 
          dataKey={xKey} 
          stroke="#a1a1aa" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tick={{ fill: '#a1a1aa' }}
          dy={10}
        />
        <YAxis
          stroke="#a1a1aa"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatCompactVND(v)}
          tick={{ fill: '#a1a1aa' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            fontSize: "12px",
            color: "#18181b",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
          }}
          itemStyle={{ color: "#10b981" }}
          formatter={(v: any) => [formatCompactVND(v), "Doanh thu"]}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorValue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
