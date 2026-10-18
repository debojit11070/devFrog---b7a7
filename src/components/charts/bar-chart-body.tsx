"use client";

import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDatum, ChartKind } from "@/components/charts/bar-chart-card";

// SVG attributes do not resolve CSS variables reliably, so chart colours are literal values.
// Three hues only: indigo, emerald, rose (plus a neutral slate for "other").
const PALETTE = ["#6366f1", "#10b981", "#f43f5e", "#94a3b8"];

/** The actual recharts tree, split out so it can be loaded lazily (recharts is the heaviest dependency in the app). */
export default function ChartBody({ data, valueLabel, kind }: { data: ChartDatum[]; valueLabel: string; kind: ChartKind }) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const grid = dark ? "#263056" : "#e2e8f0";
  const text = dark ? "#9aa4bf" : "#64748b";
  const tooltipStyle = {
    borderRadius: 8,
    borderColor: grid,
    fontSize: 12,
    backgroundColor: dark ? "#121933" : "#ffffff",
    color: dark ? "#e6e9f2" : "#0f172a",
  };
  const colorOf = (item: ChartDatum, index: number) => item.color ?? PALETTE[index % PALETTE.length];

  if (kind === "pie") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius="55%" outerRadius="80%" paddingAngle={2} stroke="none">
            {data.map((item, index) => (
              <Cell key={item.label} fill={colorOf(item, index)} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [String(value), valueLabel]} contentStyle={tooltipStyle} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: text }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (kind === "line") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={grid} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: text }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: text }} />
          <Tooltip formatter={(value) => [String(value), valueLabel]} contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="value" stroke={PALETTE[0]} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={grid} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: text }} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: text }} />
        <Tooltip
          cursor={{ fill: "rgba(99,102,241,0.08)" }}
          formatter={(value) => [String(value), valueLabel]}
          contentStyle={tooltipStyle}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
          {data.map((item, index) => (
            <Cell key={item.label} fill={item.color ?? PALETTE[0]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
