import { NextResponse } from "next/server";
import { mlFetch } from "@/lib/api-client";
import {
  wrapSuccess,
  parseStatusFromErrorMessage,
  getOrGenerateCorrelationId,
  buildErrorResponse,
} from "@/lib/api-response";

/**
 * POST /api/weather-datasets/[id]/delete — Remove a weather dataset.
 * Proxies to FastAPI: DELETE /api/v1/datasets/weather/{id}
 */
export async function POST(
  request: Request,
  ctx: RouteContext<"/api/weather-datasets/[id]/delete">,
) {
  const correlationId = getOrGenerateCorrelationId(request);
  try {
    const { id } = await ctx.params;

    const data = await mlFetch(`/api/v1/datasets/weather/${id}`, {
      method: "DELETE",
      headers: { "X-Correlation-ID": correlationId },
    });

    return NextResponse.json(wrapSuccess(data), {
      status: 200,
      headers: { "X-Correlation-ID": correlationId },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = parseStatusFromErrorMessage(message);
    console.error(
      `[weather-datasets:delete][POST] correlation_id=${correlationId} error=`,
      message,
    );
    const errBody = buildErrorResponse(
      "BACKEND_ERROR",
      message,
      status,
      correlationId,
    );
    return NextResponse.json(errBody, {
      status,
      headers: { "X-Correlation-ID": correlationId },
    });
  }
}
