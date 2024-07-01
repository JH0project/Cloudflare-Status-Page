"use client"

//import 'server-only'
import type { KVNamespace } from '@cloudflare/workers-types'
import type { MonthSummery } from 'cf-status-page-types'
import { notFound } from 'next/navigation.js';
import Monitors from './Monitors';
import config from '../../../config.json'
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const getKvMonitors = async (): Promise<any | null> => {
  //if (!process.env.KV_STATUS_PAGE)
  return fetch(`${config.settings.url}/api/status`).then((res) => res.status === 200 ? res.json() : null);
  //const { KV_STATUS_PAGE } = (process.env as unknown as { KV_STATUS_PAGE: KVNamespace });
  //return KV_STATUS_PAGE.get("monitors_data_v1_1", { type: 'json' });
}

export default function Home() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getKvMonitors().then((res) => { setData(res) })
  }, [])

  return (
    <>
      {data && <Monitors kvMonitors={data} />}
    </>
  )
}
