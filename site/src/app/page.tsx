"use client"

//import 'server-only'
import type { KVNamespace } from '@cloudflare/workers-types'
import type { KvMonitors } from 'cf-status-page-types'
import { notFound } from 'next/navigation.js';
import Monitors from './Monitors';
import config from '../../../config.json'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const getKvMonitors = async (): Promise<KvMonitors | null> => {
  //if (!process.env.KV_STATUS_PAGE)
  return fetch(`${config.settings.url}/api/status`).then((res) => res.status === 200 ? res.json() : null);
  //const { KV_STATUS_PAGE } = (process.env as unknown as { KV_STATUS_PAGE: KVNamespace });
  //return KV_STATUS_PAGE.get("monitors_data_v1_1", { type: 'json' });
}

export default async function Home() {
  const kvMonitors = await getKvMonitors()
  if (!kvMonitors) notFound()

  return (
    <Monitors kvMonitors={kvMonitors} />
  )
}
