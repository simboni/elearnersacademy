"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const AXIS_COLOR = "#94a3b8";
const GRID_COLOR = "rgba(148,163,184,0.18)";
const SKY = "#48a7d4";
const GOLD = "#eab830";

interface TooltipEntry {
  value?: number | string;
  name?: string;
  dataKey?: string | number;
  color?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  formatter?: (value: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-navy-100 bg-white px-3 py-2 text-xs shadow-lg dark:border-navy-700 dark:bg-navy-800">
      <p className="mb-1 font-semibold text-navy-900 dark:text-white">{label}</p>
      {payload.map((entry, i) => {
        const raw = typeof entry.value === "number" ? entry.value : Number(entry.value ?? 0);
        return (
          <p key={i} className="flex items-center gap-1.5 text-navy-600 dark:text-slate-300">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {formatter ? formatter(raw) : raw}
          </p>
        );
      })}
    </div>
  );
}

/* ---------------- Enrollments area chart ---------------- */

export interface EnrollmentPoint {
  month: string;
  count: number;
}

export function EnrollmentsAreaChart({ data }: { data: EnrollmentPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="enrollGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={SKY} stopOpacity={0.4} />
            <stop offset="95%" stopColor={SKY} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="month"
          stroke={AXIS_COLOR}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={AXIS_COLOR}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={40}
        />
        <Tooltip
          content={<ChartTooltip formatter={(v) => `${v} student${v === 1 ? "" : "s"}`} />}
          cursor={{ stroke: SKY, strokeOpacity: 0.25 }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke={SKY}
          strokeWidth={2.5}
          fill="url(#enrollGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ---------------- Revenue per-course bar chart ---------------- */

export interface RevenuePoint {
  name: string;
  revenue: number;
}

export function RevenueBarChart({
  data,
  currency = "KES",
}: {
  data: RevenuePoint[];
  currency?: string;
}) {
  const fmt = (v: number) =>
    v === 0
      ? "Free"
      : `${currency === "KES" ? "Ksh" : currency === "USD" ? "$" : currency} ${v.toLocaleString(
          undefined,
          { maximumFractionDigits: 0 }
        )}`;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD} stopOpacity={1} />
            <stop offset="100%" stopColor={GOLD} stopOpacity={0.55} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="name"
          stroke={AXIS_COLOR}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval={0}
          height={48}
          tickFormatter={(v: string) => (v.length > 14 ? `${v.slice(0, 13)}…` : v)}
        />
        <YAxis
          stroke={AXIS_COLOR}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
        />
        <Tooltip
          content={<ChartTooltip formatter={fmt} />}
          cursor={{ fill: "rgba(234,184,48,0.12)" }}
        />
        <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[6, 6, 0, 0]} maxBarSize={56} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ---------------- Monthly earnings bar chart ---------------- */

export interface EarningsPoint {
  month: string;
  revenue: number;
}

export function EarningsChart({
  data,
  currency = "KES",
}: {
  data: EarningsPoint[];
  currency?: string;
}) {
  const fmt = (v: number) =>
    v === 0
      ? "Ksh 0"
      : `${currency === "KES" ? "Ksh" : currency === "USD" ? "$" : currency} ${v.toLocaleString(
          undefined,
          { maximumFractionDigits: 0 }
        )}`;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD} stopOpacity={1} />
            <stop offset="100%" stopColor={GOLD} stopOpacity={0.5} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="month"
          stroke={AXIS_COLOR}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={AXIS_COLOR}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
        />
        <Tooltip
          content={<ChartTooltip formatter={fmt} />}
          cursor={{ fill: "rgba(234,184,48,0.12)" }}
        />
        <Bar dataKey="revenue" fill="url(#earningsGradient)" radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
