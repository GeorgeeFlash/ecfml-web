import { mlFetch } from '@/lib/api-client'
import { NextResponse } from 'next/server'

/**
 * POST /api/forecast — Create a forecast (RF, SVR, or Agent)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await mlFetch('/api/v1/forecast', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
