"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import type { EDACharts } from "@/types/model";

interface Props {
  data: EDACharts["seasonalDecomposition"] | null;
  title?: string;
  description?: string;
}

interface SeriesPoint {
  timestamp: string;
  trend: number | null;
  seasonal: number | null;
  residual: number | null;
}

/**
 * Build a timeseries array from seasonal decomposition data.
 */
const buildSeries = (data: EDACharts["seasonalDecomposition"] | null) => {
  if (!data) return [] as SeriesPoint[];
  const length = Math.min(
    data.timestamps.length,
    data.trend.length,
    data.seasonal.length,
    data.residual.length,
  );

  return Array.from({ length }, (_, index) => ({
    timestamp: new Date(data.timestamps[index]).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }),
    trend: data.trend[index] ?? null,
    seasonal: data.seasonal[index] ?? null,
    residual: data.residual[index] ?? null,
  }));
};

/**
 * Small line chart panel for a single seasonal component.
 */
function DecompositionPanel({
  data,
  dataKey,
  color,
  label,
}: {
  data: SeriesPoint[];
  dataKey: keyof SeriesPoint;
  color: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="timestamp"
              className="text-[10px]"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              className="text-[10px]"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => value.toFixed(0)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              name={label}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Render the seasonal decomposition charts from preprocessing outputs.
 */
export function SeasonalDecomposition({
  data,
  title = "Seasonal Decomposition",
  description = "Trend, seasonal, and residual components",
}: Props) {
  const series = buildSeries(data);

  if (!data || series.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        No seasonal decomposition available.
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border p-4")}>
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">
        <DecompositionPanel
          data={series}
          dataKey="trend"
          color="hsl(var(--chart-1))"
          label="Trend"
        />
        <DecompositionPanel
          data={series}
          dataKey="seasonal"
          color="hsl(var(--chart-2))"
          label="Seasonal"
        />
        <DecompositionPanel
          data={series}
          dataKey="residual"
          color="hsl(var(--chart-3))"
          label="Residual"
        />
      </div>
    </div>
  );
}
