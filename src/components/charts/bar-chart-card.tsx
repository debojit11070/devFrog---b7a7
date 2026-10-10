"use client";

import dynamic from "next/dynamic";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/states";
import { Skeleton } from "@/components/ui/skeleton";

export interface ChartDatum {
  label: string;
  value: number;
  color?: string;
}

// recharts is ~90kb gzipped and only renders on the admin dashboard, so it is
// loaded on demand instead of bloating every route's initial bundle.
const BarChartBody = dynamic(() => import("@/components/charts/bar-chart-body"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

/** Labelled bar chart in the app's palette. Renders an empty state rather than a blank chart. */
export function BarChartCard({
  title,
  description,
  data,
  valueLabel,
}: {
  title: string;
  description?: string;
  data: ChartDatum[];
  valueLabel: string;
}) {
  const hasData = data.some((item) => item.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-64 w-full" role="img" aria-label={`${title}: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`}>
            <BarChartBody data={data} valueLabel={valueLabel} />
          </div>
        ) : (
          <EmptyState icon={BarChart3} title="Nothing to chart yet" description="Data will appear once there is activity." />
        )}
      </CardContent>
    </Card>
  );
}
