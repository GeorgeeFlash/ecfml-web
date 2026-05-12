import { mlFetch } from '@/lib/api-client'
import { NextResponse } from 'next/server'

/**
 * POST /api/models/train — Start model training (RF or SVR)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await mlFetch('/api/v1/models/train', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return NextResponse.json(data, { status: 202 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
