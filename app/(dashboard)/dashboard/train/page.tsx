import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const metadata: Metadata = {
  title: 'Model Training',
  description: 'Train Random Forest and SVR models on preprocessed data.',
}

export default function TrainPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Model Training</h1>
        <p className="mt-1 text-muted-foreground">
          Train Random Forest and SVR models. ANN and LSTM have been removed in
          v3.0 — use the LangGraph Agent on the Forecast page for LLM-based
          forecasting.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          <strong>v3.0 Note:</strong> Only Random Forest and SVR are available
          for training. The LangGraph Agent engine does not require training —
          access it from the{' '}
          <a href="/dashboard/forecast" className="font-medium underline underline-offset-4">
            Forecast
          </a>{' '}
          page.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Model configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Model Configuration</CardTitle>
            <CardDescription>
              Select a preprocessing job and configure hyperparameters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pre-processing Job</label>
              <div className="flex h-10 items-center rounded-md border px-3 text-sm text-muted-foreground">
                No jobs available
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Model</label>
              <div className="flex gap-3">
                <Badge variant="default" className="cursor-pointer px-4 py-1.5">
                  Random Forest
                </Badge>
                <Badge variant="secondary" className="cursor-pointer px-4 py-1.5">
                  SVR
                </Badge>
              </div>
            </div>

            {/* RF Hyperparameters */}
            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-medium">Random Forest Hyperparameters</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">N Estimators</label>
                  <div className="flex h-9 items-center rounded-md border px-3 text-sm">
                    200
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Max Depth</label>
                  <div className="flex h-9 items-center rounded-md border px-3 text-sm">
                    None
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Min Samples Split</label>
                  <div className="flex h-9 items-center rounded-md border px-3 text-sm">
                    2
                  </div>
                </div>
              </div>
            </div>

            <Button className="w-full" disabled>
              Start Training
            </Button>
          </CardContent>
        </Card>

        {/* Previous runs */}
        <Card>
          <CardHeader>
            <CardTitle>Training History</CardTitle>
            <CardDescription>
              View previous model training runs and their status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                No training runs yet. Configure and start a model above.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
