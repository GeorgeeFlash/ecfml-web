import { auth } from '@clerk/nextjs/server'

const BASE = process.env.FASTAPI_URL ?? 'http://localhost:8000'

/**
 * JWT-injecting fetch wrapper for FastAPI backend calls.
 * Automatically attaches the Clerk JWT as a Bearer token.
 * Must be called from server components or route handlers.
 */
export async function mlFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { getToken } = await auth()
  const token = await getToken()

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? `FastAPI ${res.status}`)
  }
  return res.json() as Promise<T>
}
