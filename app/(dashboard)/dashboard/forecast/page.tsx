import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Forecast',
  description: 'Generate forecasts using RF, SVR, or LangGraph Agent.',
}

export default function ForecastPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Forecast</h1>
        <p className="mt-1 text-muted-foreground">
          Generate short- and medium-term electricity consumption forecasts.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Select engine and parameters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Engine</label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="cursor-pointer px-3 py-1.5">RF</Badge>
                <Badge variant="secondary" className="cursor-pointer px-3 py-1.5">SVR</Badge>
                <Badge variant="default" className="cursor-pointer px-3 py-1.5">Agent</Badge>
              </div>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">Active Model</p>
              <p className="mt-0.5 text-sm font-medium">openai/gpt-5.4</p>
            </div>
            <Button className="w-full" disabled>Generate Forecast</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Forecast Output</CardTitle>
            <CardDescription>Results appear as an interactive chart.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Agent Progress</p>
              {['Preparing data...', 'Generating forecast...', 'Validating...', 'Revising...'].map((s) => (
                <div key={s} className="flex items-center gap-2 text-sm">
                  <span>⬜</span>
                  <span className="text-muted-foreground">{s}</span>
                </div>
              ))}
            </div>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">Generate a forecast to see results.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
