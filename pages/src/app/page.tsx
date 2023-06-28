import 'server-only'
import type { KVNamespace } from '@cloudflare/workers-types'
import ResponseGraph from './ResponseGraph'
import UptimeGraph from './UptimeGraph';

export const revalidate = 120;

const getData = async () => {
  if (process.env.NODE_ENV === 'development')
    return fetch('https://status.jh0project.com/api/status').then(res => res.json());
  const { KV_STATUS_PAGE } = (process.env as unknown as { KV_STATUS_PAGE: KVNamespace });
  return await KV_STATUS_PAGE.get("monitors_data_v1_1", { type: 'json' });
}

export default async function Home() {
  const data = await getData()

  return (
    <div style={{ height: '100vh' }}>
      {Object.keys(data).map((monitor) =>
        <div key={monitor} style={{ width: '100vw' }}>
          <UptimeGraph data={data[monitor]} />
          <div style={{ padding: '0 18.5vw', height: '20vh', width: '100%', margin: 0 }}>
            <ResponseGraph data={Object.keys(data[monitor].checks).map((day) => data[monitor].checks[day].res).flat()} />
          </div>
        </div>
      )}
    </div>
  )
}
