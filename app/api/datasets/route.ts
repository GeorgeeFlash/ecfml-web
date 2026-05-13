import { mlFetch } from '@/lib/api-client'
import { NextResponse } from 'next/server'

/**
 * GET /api/datasets — List user's datasets
 * Proxies to FastAPI: GET /api/v1/datasets
 */
export async function GET() {
  try {
    const data = await mlFetch('/api/v1/datasets')
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    console.error('Error fetching datasets:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * POST /api/datasets — Create a dataset record after upload
 * Proxies to FastAPI: POST /api/v1/datasets
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await mlFetch('/api/v1/datasets', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    console.error('Error creating dataset:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
