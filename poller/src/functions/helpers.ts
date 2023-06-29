import type { KvMonitors } from 'cf-status-page-types'

const kvDataKey = 'monitors_data_v1_1'

export async function getKVMonitors(): Promise<KvMonitors> {
  // trying both to see performance difference
  //@ts-ignore
  return (KV_STATUS_PAGE as KVNamespace).get(kvDataKey, 'json')
  //return JSON.parse(await KV_STATUS_PAGE.get(kvDataKey, 'text'))
}

export async function setKVMonitors(data: any) {
  return setKV(kvDataKey, JSON.stringify(data))
}

export async function setKV(key: string, value: string, metadata?: any | null, expirationTtl?: number) {
  //@ts-ignore
  return (KV_STATUS_PAGE as KVNamespace).put(key, value, { metadata, expirationTtl })
}

export async function getCheckLocation() {
  const res = await fetch('https://cloudflare-dns.com/dns-query', {
    method: 'OPTIONS',
  })
  return res.headers.get('cf-ray')!.split('-')[1]
}
