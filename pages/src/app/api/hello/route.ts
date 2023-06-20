
// Next.js Edge API Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/router-handlers#edge-and-nodejs-runtimes

import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const data = await context.env.KV_STATUS_PAGE.get("monitors_data_v1_1");
  return new Response(JSON.stringify(JSON.parse(data), undefined, '  '))
}
