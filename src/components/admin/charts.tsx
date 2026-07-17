"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const PALETTE = ["#48a7d4", "#eab830", "#001931", "#10b981", "#f43f5e", "#8b5cf6", "#f97316"];

const axisStyle = { fontSize: 12, fill: "#64748b" } as const;

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  fontSize: 12,
  color: "#001931",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
} as const;

export type MonthCount = { month: string; count: number };
export type MonthRevenue = { month: string; revenue: number };
export type NameValue = { name: string; value: number };

export function SignupsLineChart({ data }: { data: MonthCount[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="month" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#48a7d4", strokeWidth: 1 }} />
        <Line
          type="monotone"
          dataKey="count"
          name="New users"
          stroke="#48a7d4"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "#48a7d4" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RevenueAreaChart({ data }: { data: MonthRevenue[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="revGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eab830" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#eab830" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="month" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={64} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ stroke: "#eab830", strokeWidth: 1 }}
          formatter={(value: number | string) => [`Ksh ${Number(value).toLocaleString()}`, "Revenue"]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#eab830"
          strokeWidth={2.5}
          fill="url(#revGold)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({ data }: { data: NameValue[] }) {
  if (!data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-navy-400">
        No category data yet.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={52}
          outerRadius={92}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
