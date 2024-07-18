
// Next.js Edge API Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/router-handlers#edge-and-nodejs-runtimes

import type { NextRequest } from 'next/server'
import type { KVNamespace } from '@cloudflare/workers-types'
import { NextResponse } from 'next/server'
import { NextApiRequest } from 'next';

export const runtime = 'edge'

export async function GET(req: NextRequest, { params }: { params: { key: string } }) {
  const { KV_STATUS_PAGE } = (process.env as unknown as { KV_STATUS_PAGE: KVNamespace });
  const { key } = params
  const data = await KV_STATUS_PAGE.get(key, { type: 'text' });
  if (data === null)
    return new NextResponse('Not Found', {
      status: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  return new NextResponse(data, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
