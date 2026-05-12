import { mlFetch } from '@/lib/api-client'
import { NextResponse } from 'next/server'

/**
 * POST /api/datasets/[id]/validate — Trigger dataset validation
 */
export async function POST(
  _request: Request,
  ctx: RouteContext<'/api/datasets/[id]/validate'>
) {
  try {
    const { id } = await ctx.params
    const data = await mlFetch(`/api/v1/datasets/${id}/validate`, {
      method: 'POST',
    })
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
