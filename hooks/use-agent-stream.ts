'use client'
import { useEffect, useState } from 'react'
import type { NodeEvent } from '@/types/agent'

/**
 * SSE subscriber hook for LangGraph agent forecast streams.
 * Connects to the Next.js SSE proxy endpoint and collects
 * node transition events in real-time.
 */
export function useAgentStream(agentRunId: string | null) {
  const [events, setEvents] = useState<NodeEvent[]>([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!agentRunId) return
    const es = new EventSource(`/api/forecast/stream/${agentRunId}`)

    es.onmessage = (e) => {
      const event: NodeEvent = JSON.parse(e.data)
      setEvents((prev) => [...prev, event])
      if (event.type === 'complete' || event.type === 'error') {
        setDone(true)
        es.close()
      }
    }

    es.onerror = () => {
      setEvents((prev) => [
        ...prev,
        {
          type: 'error',
          error:
            'Connection to agent stream lost. Check your network and try again.',
        },
      ])
      setDone(true)
      es.close()
    }

    return () => es.close()
  }, [agentRunId])

  return { events, done }
}
