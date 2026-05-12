import { mlFetch } from '@/lib/api-client'
import { NextResponse } from 'next/server'

/**
 * GET /api/datasets/[id]/preview — Preview dataset rows
 */
export async function GET(
  request: Request,
  ctx: RouteContext<'/api/datasets/[id]/preview'>
) {
  try {
    const { id } = await ctx.params
    const url = new URL(request.url)
    const rows = url.searchParams.get('rows') ?? '100'
    const data = await mlFetch(`/api/v1/datasets/${id}/preview?rows=${rows}`)
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
