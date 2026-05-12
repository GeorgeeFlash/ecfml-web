import { NextResponse } from "next/server";
import { mlFetch } from "@/lib/api-client";

/**
 * GET /api/weather-datasets — List weather datasets for the current user.
 * Proxies to FastAPI: GET /api/v1/datasets/weather
 */
export async function GET() {
  try {
    // Forward the request to the FastAPI backend.
    const data = await mlFetch("/api/v1/datasets/weather");
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/weather-datasets — Create a weather dataset linked to a consumption dataset.
 * Proxies to FastAPI: POST /api/v1/datasets/weather
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const datasetId =
      (body?.datasetId as string | undefined) ??
      (body?.dataset_id as string | undefined);
    const uploadthingUrl =
      (body?.uploadthingUrl as string | undefined) ??
      (body?.file_url as string | undefined);
    const uploadthingKey =
      (body?.uploadthingKey as string | undefined) ??
      (body?.uploadthing_key as string | undefined);
    const id = (body?.id as string | undefined) ?? undefined;

    if (!datasetId || !uploadthingUrl || !uploadthingKey) {
      return NextResponse.json(
        { error: "datasetId, uploadthingUrl, and uploadthingKey are required" },
        { status: 400 },
      );
    }

    // Map frontend camelCase payload to FastAPI's snake_case contract.
    const payload = {
      ...(id ? { id } : {}),
      dataset_id: datasetId,
      file_url: uploadthingUrl,
      uploadthing_key: uploadthingKey,
    };

    const data = await mlFetch("/api/v1/datasets/weather", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
