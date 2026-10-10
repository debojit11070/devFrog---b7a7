"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartDatum } from "@/components/charts/bar-chart-card";

const DEFAULT_COLOR = "#6366f1";
// SVG attributes do not resolve CSS variables reliably, so chart colours are literal values.
const AXIS_STROKE = "#e2e8f0";
const AXIS_TEXT = "#64748b";

/** The actual recharts tree, split out so it can be loaded lazily (recharts is the heaviest dependency in the app). */
export default function BarChartBody({ data, valueLabel }: { data: ChartDatum[]; valueLabel: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={AXIS_STROKE} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: AXIS_TEXT }} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: AXIS_TEXT }} />
        <Tooltip
          cursor={{ fill: "rgba(99,102,241,0.08)" }}
          formatter={(value) => [String(value), valueLabel]}
          contentStyle={{ borderRadius: 8, borderColor: AXIS_STROKE, fontSize: 12 }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
          {data.map((item) => (
            <Cell key={item.label} fill={item.color ?? DEFAULT_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
