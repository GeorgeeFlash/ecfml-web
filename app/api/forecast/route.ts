import { mlFetchRaw } from "@/lib/api-client";
import {
  wrapSuccess,
  parseStatusFromErrorMessage,
  getOrGenerateCorrelationId,
  buildErrorResponse,
} from "@/lib/api-response";
import { NextResponse } from "next/server";

/**
 * POST /api/forecast — Create a forecast (RF, SVR, or Agent)
 */
export async function POST(request: Request) {
  const correlationId = getOrGenerateCorrelationId(request);
  try {
    const body = await request.json();

    const engine = (body?.engine as string | undefined) ?? undefined;
    const preprocessJobId =
      (body?.preprocessJobId as string | undefined) ??
      (body?.preprocess_job_id as string | undefined);
    const modelRunId =
      (body?.modelRunId as string | undefined) ??
      (body?.model_run_id as string | undefined);
    const startDate =
      (body?.startDate as string | undefined) ??
      (body?.start_date as string | undefined);
    const horizonDays =
      (body?.horizonDays as number | undefined) ??
      (body?.horizon_days as number | undefined);
    const resolution = (body?.resolution as string | undefined) ?? undefined;
    const modelOverride =
      (body?.modelOverride as string | undefined) ??
      (body?.model_override as string | undefined);
    const processedFilePath =
      (body?.processedFilePath as string | undefined) ??
      (body?.processed_file_path as string | undefined);

    const payload: Record<string, unknown> = {
      ...(engine ? { engine } : {}),
      ...(preprocessJobId ? { preprocess_job_id: preprocessJobId } : {}),
      ...(modelRunId ? { model_run_id: modelRunId } : {}),
      ...(startDate ? { start_date: startDate } : {}),
      ...(typeof horizonDays !== "undefined" ? { horizon_days: horizonDays } : {}),
      ...(resolution ? { resolution } : {}),
      ...(modelOverride ? { model_override: modelOverride } : {}),
      ...(processedFilePath ? { processed_file_path: processedFilePath } : {}),
    };

    const res = await mlFetchRaw("/api/v1/forecast", {
      method: "POST",
      headers: { "X-Correlation-ID": correlationId },
      body: JSON.stringify(payload),
    });

    const responsePayload = await res.json().catch(() => null);
    const wrapped = wrapSuccess(responsePayload);
    const headers: Record<string, string> = {
      "X-Correlation-ID": correlationId,
    };
    const location = res.headers.get("Location");
    if (location) headers["Location"] = location;

    // Propagate backend status (200 or 202 typically)
    return NextResponse.json(wrapped, { status: res.status, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = parseStatusFromErrorMessage(message);
    console.error(
      `[forecast][POST] correlation_id=${correlationId} error=`,
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
