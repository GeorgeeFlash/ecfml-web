"use client";

import { cn } from "@/lib/utils";

interface Props {
  matrix: number[][];
  labels: string[];
  title?: string;
  description?: string;
}

/**
 * Clamp a numeric value to a range.
 */
const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

/**
 * Map correlation values (-1..1) to a diverging color scale.
 */
const valueToColor = (value: number) => {
  const intensity = clamp(Math.abs(value), 0, 1);
  const hue = value >= 0 ? 12 : 220;
  const lightness = 92 - intensity * 45;
  return `hsl(${hue} 70% ${lightness}%)`;
};

/**
 * Render a correlation heatmap grid for preprocessing outputs.
 */
export function CorrelationHeatmap({
  matrix,
  labels,
  title = "Correlation Heatmap",
  description = "Pearson correlation between engineered features",
}: Props) {
  const size = Math.min(matrix.length, labels.length);
  const trimmedLabels = labels.slice(0, size);
  const trimmedMatrix = matrix.slice(0, size).map((row) => row.slice(0, size));

  if (size === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        No correlation matrix available.
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="overflow-auto">
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: `minmax(140px, 1.2fr) repeat(${size}, minmax(44px, 1fr))`,
          }}
        >
          <div />
          {trimmedLabels.map((label) => (
            <div
              key={`col-${label}`}
              className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {label}
            </div>
          ))}
          {trimmedMatrix.map((row, rowIndex) => (
            <div key={`row-${trimmedLabels[rowIndex]}`} className="contents">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {trimmedLabels[rowIndex]}
              </div>
              {row.map((value, colIndex) => {
                const display = Number.isFinite(value) ? value : 0;
                const background = valueToColor(display);
                const textClass =
                  display === 0 ? "text-muted-foreground" : "text-foreground";
                return (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={cn(
                      "flex h-9 items-center justify-center text-[11px] font-medium",
                      textClass,
                    )}
                    style={{ backgroundColor: background }}
                    title={`${trimmedLabels[rowIndex]} / ${trimmedLabels[colIndex]}: ${display.toFixed(2)}`}
                  >
                    {display.toFixed(2)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>-1.0</span>
        <span>0</span>
        <span>1.0</span>
      </div>
    </div>
  );
}
