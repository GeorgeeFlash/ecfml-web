import { mlFetch } from '@/lib/api-client'
import { NextResponse } from 'next/server'

/**
 * GET /api/models/jobs/[jobId]/status — Poll training job status
 */
export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/models/jobs/[jobId]/status'>
) {
  try {
    const { jobId } = await ctx.params
    const data = await mlFetch(`/api/v1/models/jobs/${jobId}/status`)
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
