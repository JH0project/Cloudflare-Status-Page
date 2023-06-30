"use client"

import React, { useEffect, useState } from 'react';
import type { KvMonitors } from 'cf-status-page-types';
import UptimeGraph from './UptimeGraph';
import ResponseGraph from './ResponseGraph';
import { Container, Divider, Paper, Typography, Link as MuiLink } from '@mui/material';
import { useRouter } from 'next/navigation';
import config from '../../../config.json'
import NextLink from 'next/link';

const Link = (args: Parameters<typeof MuiLink>[0]) => <MuiLink component={NextLink} {...args} />

export default function Monitors({ kvMonitors }: { kvMonitors: KvMonitors }) {
  const router = useRouter()
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [router])

  return (
    <Container maxWidth='md' style={{ padding: '0 0 5vh 0' }}>
      <Typography variant='h3' component='h1' style={{ margin: '2.5vh 1vw' }}>
        {config.settings.title}
      </Typography >
      <Paper elevation={5} style={{ padding: '2.5vh 2vw', margin: '0 0 5vh 0', backgroundColor: kvMonitors.allOperational ? '#2ecc71' : '', display: "flex", alignItems: 'center' }}>
        <Typography variant='h3' component='h1' style={{ color: '#fff', textAlign: 'left', flex: "4 1 0" }}>
          {kvMonitors.allOperational ? 'All Systems Operational' : 'Outage'}
        </Typography >
        <Typography variant='body1' component='p' style={{ color: '#fff', textAlign: 'right', flex: "1 1 0" }}>
          {`${Math.round((now - kvMonitors.lastCheck) / 1000)} Seconds ago`}
        </Typography >
      </Paper>
      <Paper elevation={5} style={{ padding: '5vh 0', margin: '5vh 0' }}>
        <Container>
          {Object.keys(kvMonitors.monitors).map((monitorName, i) => {
            const kvMonitor = kvMonitors.monitors[monitorName]
            return (<>
              {i !== 0 && <Divider style={{ margin: '2.5vh 0' }} />}
              <Typography variant='h6' component='h2' style={{ color: kvMonitor.operational ? '#2ecc71' : '' }}>
                <Link style={{ color: 'inherit' }} underline='hover' href={config.monitors[i].url}>
                  {config.monitors[i].name}
                </Link>
                <span style={{ float: 'right', color: kvMonitor.operational ? '#3BA55C' : '' }}>{kvMonitor.operational ? 'Operational' : 'Outage'}</span>
              </Typography >
              <UptimeGraph kvMonitor={kvMonitor} monitorName={monitorName} key={monitorName} />
              <div style={{ height: '20vh', width: '100%' }}>
                <ResponseGraph data={Object.keys(kvMonitor.checks).map((day) => kvMonitor.checks[day].res).flat()} />
              </div>
            </>)
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
