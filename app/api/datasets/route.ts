import { mlFetch } from "@/lib/api-client";
import {
  wrapSuccess,
  parseStatusFromErrorMessage,
  getOrGenerateCorrelationId,
  buildErrorResponse,
} from "@/lib/api-response";
import { NextResponse } from "next/server";

/**
 * GET /api/datasets — List user's datasets
 * Proxies to FastAPI: GET /api/v1/datasets
 */
export async function GET(request: Request) {
  const correlationId = getOrGenerateCorrelationId(request);
  try {
    const data = await mlFetch("/api/v1/datasets", {
      method: "GET",
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
      `[datasets][GET] correlation_id=${correlationId} error=`,
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

/**
 * POST /api/datasets — Create a dataset record after upload
 * Proxies to FastAPI: POST /api/v1/datasets
 */
export async function POST(request: Request) {
  const correlationId = getOrGenerateCorrelationId(request);
  try {
    const body = await request.json();
    const name = (body?.name as string | undefined) ?? undefined;
    const uploadthingUrl =
      (body?.uploadthingUrl as string | undefined) ??
      (body?.file_url as string | undefined);
    const uploadthingKey =
      (body?.uploadthingKey as string | undefined) ??
      (body?.uploadthing_key as string | undefined);
    const id = (body?.id as string | undefined) ?? undefined;

    if (!name || !uploadthingUrl || !uploadthingKey) {
      return NextResponse.json(
        {
          error:
            "name, uploadthingUrl (file_url), and uploadthingKey (uploadthing_key) are required",
        },
        { status: 400 },
      );
    }

    const payload = {
      ...(id ? { id } : {}),
      name,
      file_url: uploadthingUrl,
      uploadthing_key: uploadthingKey,
    };

    const data = await mlFetch("/api/v1/datasets", {
      method: "POST",
      headers: { "X-Correlation-ID": correlationId },
      body: JSON.stringify(payload),
    });
    const wrapped = wrapSuccess(data);
    const headers = { "X-Correlation-ID": correlationId };
    // If backend included Location header, propagate it. mlFetch currently discards headers, so best-effort only.
    return NextResponse.json(wrapped, { status: 201, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = parseStatusFromErrorMessage(message);
    console.error(
      `[datasets][POST] correlation_id=${correlationId} error=`,
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
