/** LangGraph Agent-related TypeScript types */

export type AgentModelId =
  | 'openai/gpt-5.4'
  | 'google/gemini-3.1-pro-preview'
  | 'anthropic/claude-sonnet-4-6'

export interface AgentRun {
  id: string
  userId: string
  preprocessJobId: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED' | 'WARNING'
  modelUsed: AgentModelId
  nodeTraceJson: NodeTrace[] | null
  revisionCount: number
  tokenCount: number | null
  createdAt: string
  updatedAt: string
}

export interface NodeTrace {
  node: string
  startedAt: string
  completedAt: string
  durationMs: number
}

export type NodeEventType =
  | 'node_start'
  | 'node_complete'
  | 'token'
  | 'complete'
  | 'error'

export interface NodeEvent {
  type: NodeEventType
  node?: string
  content?: string
  message?: string
  duration_ms?: number
  forecast_id?: string
  anomaly_pct?: number
  error?: string
}

export interface ForecastOutput {
  predictions: { timestamp: string; value: number }[]
  reasoning: string
  confidence: 'high' | 'medium' | 'low'
}
