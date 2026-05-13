import { mlFetch } from '@/lib/api-client'
import {
  wrapSuccess,
  parseStatusFromErrorMessage,
  getOrGenerateCorrelationId,
  buildErrorResponse,
} from '@/lib/api-response'
import { NextResponse } from 'next/server'

/**
 * POST /api/datasets/[id]/validate — Trigger dataset validation
 */
export async function POST(
  request: Request,
  ctx: RouteContext<'/api/datasets/[id]/validate'>
) {
  const correlationId = getOrGenerateCorrelationId(request)
  try {
    const { id } = await ctx.params
    // forward any body from client to backend validation endpoint
    const rawBody = await request.json().catch(() => undefined);
    let payload: Record<string, unknown> | undefined = undefined;
    if (rawBody) {
      const fileUrl =
        (rawBody?.fileUrl as string | undefined) ??
        (rawBody?.file_url as string | undefined);
      const requiredColumns =
        (rawBody?.requiredColumns as string[] | undefined) ??
        (rawBody?.required_columns as string[] | undefined) ?? undefined;
      payload = {};
      if (fileUrl) payload.file_url = fileUrl;
      if (requiredColumns) payload.required_columns = requiredColumns;
    }

    const data = await mlFetch(`/api/v1/datasets/${id}/validate`, {
      method: 'POST',
      headers: { 'X-Correlation-ID': correlationId },
      body: payload ? JSON.stringify(payload) : undefined,
    })

    // Backend may return 200 (sync report) or 202 (async job info). mlFetch will return the parsed JSON.
    const wrapped = wrapSuccess(data)
    // If wrapped.data contains job_id, return 202 to indicate accepted/processing
    const status =
      wrapped.data &&
      typeof wrapped.data === 'object' &&
      'job_id' in wrapped.data
        ? 202
        : 200
    return NextResponse.json(wrapped, { status, headers: { 'X-Correlation-ID': correlationId } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const status = parseStatusFromErrorMessage(message)
    console.error(`[datasets:validate][POST] correlation_id=${correlationId} error=`, message)
    const errBody = buildErrorResponse('BACKEND_ERROR', message, status, correlationId)
    return NextResponse.json(errBody, { status, headers: { 'X-Correlation-ID': correlationId } })
  }
}
