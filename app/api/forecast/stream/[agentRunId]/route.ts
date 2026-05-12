import { auth } from '@clerk/nextjs/server'

const BASE = process.env.FASTAPI_URL ?? 'http://localhost:8000'

/**
 * GET /api/forecast/stream/[agentRunId] — SSE proxy for LangGraph agent events
 * Proxies the FastAPI SSE endpoint to the browser.
 */
export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/forecast/stream/[agentRunId]'>
) {
  const { agentRunId } = await ctx.params
  const { getToken } = await auth()
  const token = await getToken()

  const upstream = await fetch(
    `${BASE}/api/v1/forecast/stream/${agentRunId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
      },
    }
  )

  if (!upstream.ok || !upstream.body) {
    return new Response(
      JSON.stringify({ error: `Upstream returned ${upstream.status}` }),
      { status: upstream.status, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Proxy the SSE stream directly to the client
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
