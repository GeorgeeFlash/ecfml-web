import type { Metadata } from 'next'
import { auth, currentUser } from '@clerk/nextjs/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'ECFML system overview — view your datasets, models, and forecasts at a glance.',
}

export default async function DashboardPage() {
  const user = await currentUser()
  const firstName = user?.firstName ?? 'Researcher'

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your electricity consumption forecasting pipeline is ready.
        </p>
      </div>

      {/* Pipeline Steps */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PipelineCard
          step={1}
          title="Upload Data"
          description="Upload ENEO consumption and ERA5 weather datasets"
          href="/dashboard/data"
          status="ready"
        />
        <PipelineCard
          step={2}
          title="Pre-process"
          description="Impute, detect outliers, engineer features, and split"
          href="/dashboard/preprocess"
          status="waiting"
        />
        <PipelineCard
          step={3}
          title="Train Models"
          description="Train Random Forest and SVR on processed data"
          href="/dashboard/train"
          status="waiting"
        />
        <PipelineCard
          step={4}
          title="Evaluate"
          description="Compare RF, SVR, and LangGraph Agent — RMSE, MAE, MAPE, R²"
          href="/dashboard/evaluate"
          status="waiting"
        />
        <PipelineCard
          step={5}
          title="Forecast"
          description="Generate short- and medium-term forecasts with any engine"
          href="/dashboard/forecast"
          status="waiting"
        />
        <PipelineCard
          step={6}
          title="AI Chat"
          description="Chat with the system about your data and results"
          href="/dashboard/ai"
          status="coming-soon"
        />
      </div>

      {/* Quick Stats (placeholder for real data) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Datasets" value="0" description="Uploaded" />
        <StatCard title="Models Trained" value="0" description="RF + SVR" />
        <StatCard title="Agent Runs" value="0" description="LangGraph" />
        <StatCard title="Forecasts" value="0" description="Generated" />
      </div>
    </div>
  )
}

function PipelineCard({
  step,
  title,
  description,
  href,
  status,
}: {
  step: number
  title: string
  description: string
  href: string
  status: 'ready' | 'waiting' | 'complete' | 'coming-soon'
}) {
  const statusConfig = {
    ready: { label: 'Ready', variant: 'default' as const },
    waiting: { label: 'Waiting', variant: 'secondary' as const },
    complete: { label: 'Complete', variant: 'default' as const },
    'coming-soon': { label: 'Low Priority', variant: 'outline' as const },
  }

  const config = statusConfig[status]

  return (
    <a href={href} className="group">
      <Card className="transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
              {step}
            </div>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
          <CardTitle className="mt-3 text-lg group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </a>
  )
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string
  value: string
  description: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
