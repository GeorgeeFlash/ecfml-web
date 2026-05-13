/**
 * Shared utilities for normalizing API responses and error handling across route handlers.
 */

interface SuccessResponse {
  data: unknown;
  meta?: Record<string, unknown>;
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    status: number;
    correlation_id: string;
    timestamp: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Wrap payload in `{ data: ... }` envelope if it's not already wrapped.
 * Allows backends to return raw payloads or pre-wrapped envelopes interchangeably.
 */
export function wrapSuccess(payload: unknown): SuccessResponse {
  if (
    payload &&
    typeof payload === 'object' &&
    (('data' in payload && payload.data !== undefined) ||
      ('error' in payload && payload.error !== undefined))
  ) {
    return payload as SuccessResponse;
  }
  return { data: payload };
}

/**
 * Extract HTTP status code from error message.
 * FastAPI error messages formatted as "FastAPI 404" are parsed; defaults to 500.
 */
export function parseStatusFromErrorMessage(
  msg: string | undefined
): number {
  if (!msg) return 500;
  const m = msg.match(/FastAPI (\d{3})/) as RegExpMatchArray | null;
  if (m) return Number(m[1]);
  return 500;
}

/**
 * Generate or retrieve correlation ID from request headers.
 * Uses web standard `crypto.randomUUID()` if available; falls back to placeholder.
 */
export function getOrGenerateCorrelationId(request: Request): string {
  return (
    request.headers.get("x-correlation-id") ??
    globalThis.crypto?.randomUUID?.() ??
    "cid-unknown"
  );
}

/**
 * Build a standard error response envelope.
 */
export function buildErrorResponse(
  code: string,
  message: string,
  status: number,
  correlationId: string,
  details?: Record<string, unknown>
): ErrorResponse {
  return {
    error: {
      code,
      message,
      status,
      correlation_id: correlationId,
      timestamp: new Date().toISOString(),
      ...(details ? { details } : {}),
    },
  };
}
