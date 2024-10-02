"use client"

//import 'server-only'
import type { MonitorMonth } from 'cf-status-page-types'
import config from '../../../config.json'
import { useEffect, useState } from 'react';
import { Container, Typography, Paper, Divider, Box } from '@mui/material';
import Link from 'next/link';
import AllStatus from './AllStatus';
import OverallResponseGraph from './OverallResponseGraph';
import UptimeGraph from './UptimeGraph';

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const getKvMonitors = async (key: string): Promise<MonitorMonth> => {
  //if (!process.env.KV_STATUS_PAGE)
  return fetch(`${config.settings.url}/api/kv/${key}`).then((res) => {
    if (res.ok) {
      return res.json()
    }
    throw new Error('Failed to fetch')
  });
  //const { KV_STATUS_PAGE } = (process.env as unknown as { KV_STATUS_PAGE: KVNamespace });
  //return KV_STATUS_PAGE.get("monitors_data_v1_1", { type: 'json' });
}

const getYearMonth = (date: Date) => {
  return date.toISOString().split('T')[0].slice(0, 7)
}

export default function Home() {
  const [data, setData] = useState<MonitorMonth>({
    checks: {},
    lastCheck: 0,
    operational: {},
  })

  useEffect(() => {
    getKvMonitors(getYearMonth(new Date())).then((res) => {
      setData(oldData => ({
        checks: { ...oldData.checks, ...res.checks },
        lastCheck: res.lastCheck > oldData.lastCheck ? res.lastCheck : oldData.lastCheck,
        operational: res.lastCheck > oldData.lastCheck ? res.operational : oldData.operational,
      }))
    }).catch(() => { });

    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    getKvMonitors(getYearMonth(lastMonth)).then((res) => {
      setData(oldData => ({
        checks: { ...oldData.checks, ...res.checks },
        lastCheck: res.lastCheck > oldData.lastCheck ? res.lastCheck : oldData.lastCheck,
        operational: res.lastCheck > oldData.lastCheck ? res.operational : oldData.operational,
      }))
    }).catch(() => { });

    const last2Month = new Date()
    last2Month.setMonth(last2Month.getMonth() - 2)
    getKvMonitors(getYearMonth(last2Month)).then((res) => {
      setData(oldData => ({
        checks: { ...oldData.checks, ...res.checks },
        lastCheck: res.lastCheck > oldData.lastCheck ? res.lastCheck : oldData.lastCheck,
        operational: res.lastCheck > oldData.lastCheck ? res.operational : oldData.operational,
      }))
    }).catch(() => { });
  }, [])

  return (

    <Container maxWidth='md' style={{ padding: '0 0 5vh 0' }}>
      <Typography variant='h3' component='h1' style={{ margin: '2.5vh 1vw' }}>
        {config.settings.title}
      </Typography >
      <AllStatus data={data} />
      <Paper elevation={5} style={{ padding: '5vh 0', margin: '5vh 0' }}>
        <Container>
          {Object.keys(data.operational).map((monitorName, i) => {
            return (<Box key={i}>
              {i !== 0 && <Divider style={{ margin: '2.5vh 0' }} />}
              <Typography variant='h6' component='h2' style={{ color: data.operational[monitorName] ? '#2ecc71' : '' }}>
                <Link style={{ color: 'inherit' }} underline='hover' href={config.monitors[i].url}>
                  {config.monitors[i].name}
                </Link>
                <span style={{ float: 'right', color: data.operational[monitorName] ? '#3BA55C' : '' }}>{data.operational[monitorName] ? 'Operational' : 'Outage'}</span>
              </Typography >
              <UptimeGraph checks={data.checks} monitorName={monitorName} key={monitorName} />
              <div style={{ height: '20vh', width: '100%' }}>
                <OverallResponseGraph checks={data.checks} monitorName={monitorName} />
              </div>
            </Box>)
          })}
        </Container>
      </Paper >
      <div>
        <Typography>
          <Link href='https://github.com/JH0project/Cloudflare-Status-Page'>
            Cloudflare Status Page
          </Link>
          {' by '}
          <Link href='https://github.com/H01001000'>
            H01001000
          </Link>
        </Typography>
        <Typography>{'Powered by '}<Link href='https://www.cloudflare.com/'>Cloudflare</Link>{' and '}<Link href='https://nextjs.org/'>Next.js</Link></Typography>
      </div>
    </Container >
  )
}
