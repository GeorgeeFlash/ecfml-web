import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Data Management',
  description: 'Upload and manage ENEO consumption datasets and ERA5 weather data.',
}

export default function DataPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
        <p className="mt-1 text-muted-foreground">
          Upload consumption and weather datasets, then validate and preview.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload consumption dataset */}
        <Card>
          <CardHeader>
            <CardTitle>Consumption Dataset</CardTitle>
            <CardDescription>
              Upload ENEO electricity consumption data (CSV or Excel).
              Required columns: date/timestamp, consumption_kwh.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-primary/50">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to upload
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Select File
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload weather dataset */}
        <Card>
          <CardHeader>
            <CardTitle>Weather Dataset</CardTitle>
            <CardDescription>
              Upload ERA5 weather data (temperature, humidity, rainfall) in CSV
              format. Optional — improves forecast accuracy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-primary/50">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to upload
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Select File
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Uploaded datasets list */}
      <Card>
        <CardHeader>
          <CardTitle>Your Datasets</CardTitle>
          <CardDescription>
            Manage your uploaded datasets. Validate and preview before
            processing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              No datasets uploaded yet. Upload a consumption dataset to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
