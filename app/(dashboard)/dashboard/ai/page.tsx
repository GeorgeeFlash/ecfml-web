import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'AI Chat',
  description: 'Chat with the ECFML system about your data and forecasting results.',
}

export default function AIChatPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Chat</h1>
          <p className="mt-1 text-muted-foreground">
            Ask questions about your datasets, model performance, and forecasts.
          </p>
        </div>
        <Badge variant="outline">Low Priority</Badge>
      </div>

      <Card className="h-[calc(100vh-16rem)]">
        <CardHeader>
          <CardTitle>Chat</CardTitle>
          <CardDescription>
            Powered by Vercel AI SDK v6. This feature is planned for a future sprint.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">
            AI chat will be available in a future sprint.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
