export async function getKVMonitors(key: string): Promise<any> {
  // trying both to see performance difference
  //@ts-ignore
  return (KV_STATUS_PAGE as KVNamespace).get(key, 'json')
  //return JSON.parse(await KV_STATUS_PAGE.get(kvDataKey, 'text'))
}

export async function setKVMonitors(key: string, data: any) {
  return setKV(key, JSON.stringify(data))
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
