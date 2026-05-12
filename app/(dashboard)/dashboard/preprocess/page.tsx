import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Pre-processing',
  description: 'Run the data preprocessing pipeline — impute, detect outliers, engineer features, and split.',
}

export default function PreprocessPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pre-processing</h1>
        <p className="mt-1 text-muted-foreground">
          Run the preprocessing pipeline on your uploaded dataset. Includes
          missing value imputation, outlier detection, feature engineering,
          normalisation, and train/val/test splitting.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Select a dataset and configure split ratios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dataset</label>
              <div className="flex h-10 items-center rounded-md border px-3 text-sm text-muted-foreground">
                No datasets available
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Train</label>
                <div className="flex h-9 items-center rounded-md border px-3 text-sm">
                  70%
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Val</label>
                <div className="flex h-9 items-center rounded-md border px-3 text-sm">
                  15%
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Test</label>
                <div className="flex h-9 items-center rounded-md border px-3 text-sm">
                  15%
                </div>
              </div>
            </div>
            <Button className="w-full" disabled>
              Run Pre-processing
            </Button>
          </CardContent>
        </Card>

        {/* EDA Charts placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Exploratory Data Analysis</CardTitle>
            <CardDescription>
              Visualisations generated after preprocessing — correlation heatmap,
              seasonal decomposition, and distribution plots.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                Run preprocessing to generate EDA charts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
