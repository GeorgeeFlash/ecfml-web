'use client'
import { useEffect, useState } from 'react'
import type { JobStatus } from '@/types/model'

interface JobState {
  status: JobStatus
  progress?: number
  error?: string
}

/**
 * Polls the RF/SVR training job status endpoint at a regular interval.
 * Stops polling when the job reaches a terminal state (COMPLETE or FAILED).
 */
export function useJobPoller(jobId: string | null, intervalMs = 3000) {
  const [state, setState] = useState<JobState>({ status: 'PENDING' })

  useEffect(() => {
    if (!jobId) return
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/models/jobs/${jobId}/status`)
        const data: JobState = await res.json()
        setState(data)
        if (data.status === 'COMPLETE' || data.status === 'FAILED') {
          clearInterval(id)
        }
      } catch {
        setState({ status: 'FAILED', error: 'Failed to poll job status' })
        clearInterval(id)
      }
    }, intervalMs)
    return () => clearInterval(id)
  }, [jobId, intervalMs])

  return state
}
