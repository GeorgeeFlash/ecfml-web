import { mlFetch } from "@/lib/api-client";
import {
  wrapSuccess,
  parseStatusFromErrorMessage,
  getOrGenerateCorrelationId,
  buildErrorResponse,
} from "@/lib/api-response";
import { NextResponse } from "next/server";

/**
 * GET /api/models/jobs/[jobId]/status — Poll training job status
 */
export async function GET(
  request: Request,
  ctx: RouteContext<"/api/models/jobs/[jobId]/status">,
) {
  const correlationId = getOrGenerateCorrelationId(request);
  try {
    const { jobId } = await ctx.params;
    const data = await mlFetch(`/api/v1/models/jobs/${jobId}/status`, {
      headers: { "X-Correlation-ID": correlationId },
    });
    const body = wrapSuccess(data);
    return NextResponse.json(body, {
      status: 200,
      headers: { "X-Correlation-ID": correlationId },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = parseStatusFromErrorMessage(message);
    console.error(
      `[models:status][GET] correlation_id=${correlationId} error=`,
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
