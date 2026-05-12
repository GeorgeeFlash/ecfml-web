'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Props {
  reasoning: string | null
  confidence?: string
}

export function AgentReasoningPanel({ reasoning, confidence }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (!reasoning) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Agent Reasoning</CardTitle>
          {confidence && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                confidence === 'high'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : confidence === 'medium'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {confidence} confidence
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`text-sm text-muted-foreground leading-relaxed ${
            !expanded ? 'line-clamp-4' : ''
          }`}
        >
          {reasoning}
        </div>
        {reasoning.length > 300 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs"
          >
            {expanded ? 'Show less' : 'Show more'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
