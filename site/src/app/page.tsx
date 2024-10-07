"use client"

//import 'server-only'
import type { MonitorMonth } from 'cf-status-page-types'
import config from '../../../config.json'
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Link from '@/components/Link';
import AllStatusWithData, { AllStatus } from '@/components/AllStatus';
import OverallResponseGraph from '@/components/OverallResponseGraph';
import UptimeGraph from '@/components/UptimeGraph';
import { useEffect, useState } from 'react';

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
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
  const [_dataLoaded, setDataLoaded] = useState([false, false, false])

  useEffect(() => {
    getKvMonitors(getYearMonth(new Date())).then((res) => {
      setData(oldData => ({
        checks: { ...oldData.checks, ...res.checks },
        lastCheck: res.lastCheck > oldData.lastCheck ? res.lastCheck : oldData.lastCheck,
        operational: res.lastCheck > oldData.lastCheck ? res.operational : oldData.operational,
      }))
      setDataLoaded(oldData => [true, oldData[1], oldData[2]])
    }).catch(() => { });

    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    getKvMonitors(getYearMonth(lastMonth)).then((res) => {
      setData(oldData => ({
        checks: { ...oldData.checks, ...res.checks },
        lastCheck: res.lastCheck > oldData.lastCheck ? res.lastCheck : oldData.lastCheck,
        operational: res.lastCheck > oldData.lastCheck ? res.operational : oldData.operational,
      }))
      setDataLoaded(oldData => [oldData[0], true, oldData[2]])
    }).catch(() => { });

    const last2Month = new Date()
    last2Month.setMonth(last2Month.getMonth() - 2)
    getKvMonitors(getYearMonth(last2Month)).then((res) => {
      setData(oldData => ({
        checks: { ...oldData.checks, ...res.checks },
        lastCheck: res.lastCheck > oldData.lastCheck ? res.lastCheck : oldData.lastCheck,
        operational: res.lastCheck > oldData.lastCheck ? res.operational : oldData.operational,
      }))
      setDataLoaded(oldData => [oldData[0], oldData[1], true])
    }).catch(() => { });
  }, [])

  return (
    <>
      {data.lastCheck === 0 ?
        <AllStatus /> :
        <AllStatusWithData operational={data.operational} lastCheck={data.lastCheck} defaultNow={Date.now()} />}
      <Paper elevation={5} style={{ padding: '5vh 0', margin: '5vh 0' }}>
        <Container>
          {config.monitors.map(({ id: monitorName, name, url }, i) =>
            <Box key={i}>
              {i !== 0 && <Divider style={{ margin: '2.5vh 0' }} />}
              <Typography variant='h6' component='h2' style={{ color: data.operational[monitorName] ? '#2ecc71' : '' }}>
                <Link style={{ color: 'inherit' }} underline='hover' href={url}>
                  {name}
                </Link>
                <span style={{ float: 'right', color: data.operational[monitorName] ? '#3BA55C' : '' }}>{data.operational[monitorName] ? 'Operational' : 'Outage'}</span>
              </Typography >
              <UptimeGraph checks={data.checks} monitorName={monitorName} key={monitorName} />
              <div style={{ height: '20vh', width: '100%' }}>
                <OverallResponseGraph checks={data.checks} monitorName={monitorName} />
              </div>
            </Box>
          )}
        </Container>
      </Paper >
    </>
  )
}
