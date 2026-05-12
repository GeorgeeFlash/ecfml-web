'use client'
import type { NodeEvent } from '@/types/agent'

const NODE_LABELS: Record<string, string> = {
  data_preparation: 'Preparing data context...',
  forecasting: 'Generating forecast with LLM...',
  validation: 'Validating predictions...',
  revision: 'Revising forecast...',
}

interface Props {
  events: NodeEvent[]
  done: boolean
}

export function AgentProgressPanel({ events, done }: Props) {
  const activeNode = [...events]
    .reverse()
    .find((e) => e.type === 'node_start')?.node

  return (
    <div className="rounded-lg border p-4 space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        Agent Progress
      </p>
      {Object.keys(NODE_LABELS).map((node) => {
        const started = events.some(
          (e) => e.type === 'node_start' && e.node === node
        )
        const complete = events.some(
          (e) => e.type === 'node_complete' && e.node === node
        )
        const duration = events.find(
          (e) => e.type === 'node_complete' && e.node === node
        )?.duration_ms

        return (
          <div key={node} className="flex items-center gap-2 text-sm">
            <span>{complete ? '✅' : started ? '⏳' : '⬜'}</span>
            <span
              className={
                complete
                  ? 'text-green-600'
                  : started
                    ? 'text-blue-600'
                    : 'text-muted-foreground'
              }
            >
              {NODE_LABELS[node]}
            </span>
            {complete && duration && (
              <span className="text-xs text-muted-foreground">
                ({duration}ms)
              </span>
            )}
          </div>
        )
      })}
      {done && (
        <p className="text-xs text-green-600 font-medium pt-1">
          Agent complete.
        </p>
      )}
    </div>
  )
}
