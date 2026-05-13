import { auth } from "@clerk/nextjs/server";

const BASE = process.env.FASTAPI_URL?.trim() || "http://localhost:8000";

function resolveBackendUrl(path: string) {
  return new URL(path, BASE).toString();
}

/**
 * JWT-injecting fetch wrapper for FastAPI backend calls.
 * Automatically attaches the Clerk JWT as a Bearer token.
 * Must be called from server components or route handlers.
 */
export async function mlFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error("Missing Clerk token for backend request");
  }

  const res = await fetch(resolveBackendUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = (err && (err.detail ?? err)) ?? null;
    if (detail) {
      const detailStr =
        typeof detail === "string" ? detail : JSON.stringify(detail);
      throw new Error(`${detailStr} (FastAPI ${res.status})`);
    }
    throw new Error(`FastAPI ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Like `mlFetch` but returns the raw `Response` so callers can inspect status and headers.
 * Use when the route needs to propagate backend status codes or headers (e.g., 202 Accepted).
 */
export async function mlFetchRaw(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error("Missing Clerk token for backend request");
  }

  return fetch(resolveBackendUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}
