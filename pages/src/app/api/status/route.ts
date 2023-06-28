
// Next.js Edge API Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/router-handlers#edge-and-nodejs-runtimes

import type { NextRequest } from 'next/server'
import type { KVNamespace } from '@cloudflare/workers-types'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { KV_STATUS_PAGE } = (process.env as unknown as { KV_STATUS_PAGE: KVNamespace });
  const data = await KV_STATUS_PAGE.get("monitors_data_v1_1", { type: 'json' });
  return new Response(JSON.stringify(data, undefined, '  '))
}
