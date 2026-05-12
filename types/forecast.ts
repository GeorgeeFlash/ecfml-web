/** Forecast-related TypeScript types */

import type { SourceType, TimeseriesPoint } from './model'

export type Resolution = 'HOURLY' | 'DAILY' | 'WEEKLY'
export type ForecastEngine = 'RF' | 'SVR' | 'AGENT'

export interface ForecastRequest {
  engine: ForecastEngine
  modelRunId?: string       // Required for RF/SVR
  preprocessJobId: string
  startDate: string         // ISO 8601
  horizonDays: number
  resolution: Resolution
  modelOverride?: string    // Agent only: override active LLM model
}

export interface ForecastRun {
  id: string
  userId: string
  modelRunId: string | null
  agentRunId: string | null
  sourceType: SourceType
  startDate: string
  horizonDays: number
  resolution: Resolution
  forecastJson: TimeseriesPoint[]
  agentReasoningText: string | null
  createdAt: string
}

export interface ForecastResponse {
  forecastId: string
  predictions: TimeseriesPoint[]
  reasoning?: string
  confidence?: string
}

export interface AgentForecastResponse {
  agentRunId: string
  status: 'PENDING'
}
