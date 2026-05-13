import { auth } from "@clerk/nextjs/server";

const BASE = process.env.FASTAPI_URL?.trim() || "http://localhost:8000";

function resolveBackendUrl(path: string) {
  return new URL(path, BASE).toString();
}

/**
 * GET /api/forecast/stream/[agentRunId] — SSE proxy for LangGraph agent events
 * Proxies the FastAPI SSE endpoint to the browser.
 */
export async function GET(
  request: Request,
  ctx: RouteContext<"/api/forecast/stream/[agentRunId]">,
) {
  const { agentRunId } = await ctx.params;
  const { getToken } = await auth();
  const token = await getToken();

  const correlationId =
    request.headers.get("x-correlation-id") ??
    globalThis.crypto?.randomUUID?.() ??
    "cid-unknown";

  if (!token) {
    return new Response(
      JSON.stringify({
        error: "Missing Clerk token",
        correlation_id: correlationId,
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "X-Correlation-ID": correlationId,
        },
      },
    );
  }

  const upstream = await fetch(
    resolveBackendUrl(`/api/v1/forecast/stream/${agentRunId}`),
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
        "X-Correlation-ID": correlationId,
      },
    },
  );

  if (!upstream.ok || !upstream.body) {
    return new Response(
      JSON.stringify({
        error: `Upstream returned ${upstream.status}`,
        correlation_id: correlationId,
      }),
      {
        status: upstream.status,
        headers: {
          "Content-Type": "application/json",
          "X-Correlation-ID": correlationId,
        },
      },
    );
  }

  // Proxy the SSE stream directly to the client and echo correlation id
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "X-Correlation-ID": correlationId,
    },
  });
}
