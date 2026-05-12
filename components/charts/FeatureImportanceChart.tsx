"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FeatureImportance } from "@/types/model";

interface Props {
  data: FeatureImportance[];
  title?: string;
  description?: string;
}

export function FeatureImportanceChart({
  data,
  title = "Feature Importance",
  description = "Top 15 features by importance (Random Forest)",
}: Props) {
  // Sort descending and take top 15
  const sorted = [...data]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 15);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Badge variant="outline">RF Only</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sorted} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted"
              horizontal={false}
            />
            <XAxis
              type="number"
              className="text-xs"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="feature"
              className="text-xs"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={75}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value) => {
                if (typeof value === "number") {
                  return [value.toFixed(4), "Importance"];
                }
                return value;
              }}
            />
            <Bar
              dataKey="importance"
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
              name="Importance"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
