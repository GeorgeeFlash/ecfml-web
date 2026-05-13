import { mlFetchRaw } from "@/lib/api-client";
import {
  wrapSuccess,
  parseStatusFromErrorMessage,
  getOrGenerateCorrelationId,
  buildErrorResponse,
} from "@/lib/api-response";
import { NextResponse } from "next/server";

/**
 * POST /api/models/train — Start model training (RF or SVR)
 */
export async function POST(request: Request) {
  const correlationId = getOrGenerateCorrelationId(request);
  try {
    const body = await request.json();

    const jobId =
      (body?.jobId as string | undefined) ??
      (body?.job_id as string | undefined);
    const preprocessJobId =
      (body?.preprocessJobId as string | undefined) ??
      (body?.preprocess_job_id as string | undefined);
    const modelType =
      (body?.modelType as string | undefined) ??
      (body?.model_type as string | undefined);
    const hyperparams = (body?.hyperparams as unknown) ?? body?.hyperparams;
    const processedFilePath =
      (body?.processedFilePath as string | undefined) ??
      (body?.processed_file_path as string | undefined);

    const payload: Record<string, unknown> = {
      ...(jobId ? { job_id: jobId } : {}),
      ...(preprocessJobId ? { preprocess_job_id: preprocessJobId } : {}),
      ...(modelType ? { model_type: modelType } : {}),
      ...(hyperparams ? { hyperparams } : {}),
      ...(processedFilePath ? { processed_file_path: processedFilePath } : {}),
    };

    const res = await mlFetchRaw("/api/v1/models/train", {
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
    return NextResponse.json(wrapped, { status: res.status || 202, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = parseStatusFromErrorMessage(message);
    console.error(
      `[models:train][POST] correlation_id=${correlationId} error=`,
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
