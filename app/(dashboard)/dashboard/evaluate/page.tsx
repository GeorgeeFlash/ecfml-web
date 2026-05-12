import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Model Evaluation',
  description: 'Compare RF, SVR, and LangGraph Agent forecasting performance — RMSE, MAE, MAPE, R².',
}

export default function EvaluatePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Model Evaluation
        </h1>
        <p className="mt-1 text-muted-foreground">
          Three-way comparison: Random Forest vs SVR vs LangGraph Agent.
          Metrics computed on the held-out test set.
        </p>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Comparison</CardTitle>
          <CardDescription>
            RMSE, MAE, MAPE, and R² across all three forecasting engines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Engine</TableHead>
                <TableHead className="text-right">RMSE</TableHead>
                <TableHead className="text-right">MAE</TableHead>
                <TableHead className="text-right">MAPE</TableHead>
                <TableHead className="text-right">R²</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No evaluation results yet. Train models and run evaluations first.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Actual vs Predicted chart placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Actual vs Predicted</CardTitle>
            <CardDescription>
              Overlay chart comparing actual test values against model predictions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                Select a model to view the chart.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feature Importance chart placeholder */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Feature Importance</CardTitle>
                <CardDescription>
                  Top 15 features by importance (Random Forest only).
                </CardDescription>
              </div>
              <Badge variant="outline">RF Only</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                Train a Random Forest model first.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent reasoning panel placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>LLM Agent Reasoning</CardTitle>
          <CardDescription>
            The agent&apos;s explanation of its forecasting methodology and
            confidence assessment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              Run an agent evaluation to see reasoning.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
