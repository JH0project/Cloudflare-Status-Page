"use client"

import React, { useEffect } from 'react';
import type { KvMonitors } from 'cf-status-page-types';
import UptimeGraph from './UptimeGraph';
import ResponseGraph from './ResponseGraph';
import { Container, Divider, Paper, Typography, Link as MuiLink } from '@mui/material';
import { useRouter } from 'next/navigation';
import config from '../../../config.json'
import Link from 'next/link';

export default function Monitors({ kvMonitors }: { kvMonitors: KvMonitors }) {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 2 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [router])

  const allOperational = Object.keys(kvMonitors).map((monitor) => kvMonitors[monitor].operational).every((monitor) => monitor === true)

  return (
    <Container maxWidth='md' >
      <Paper elevation={5} style={{ padding: '2.5vh 2vw', margin: '5vh 0' }}>
        <Typography variant='h3' component='h1' style={{ textAlign: 'left' }}>
          {config.settings.title}
        </Typography >
      </Paper>
      <Paper elevation={5} style={{ padding: '2.5vh 2vw', margin: '5vh 0', backgroundColor: allOperational ? '#2ecc71' : '' }}>
        <Typography variant='h3' component='h1' style={{ color: '#fff', textAlign: 'left' }}>
          {allOperational ? 'All Systems Operational' : 'Outage'}
        </Typography >
      </Paper>
      <Paper elevation={5} style={{ padding: '5vh 0', margin: '5vh 0' }}>
        <Container>
          {Object.keys(kvMonitors).map((monitorName, i) => {
            const kvMonitor = kvMonitors[monitorName]
            return (<>
              {i !== 0 && <Divider style={{ margin: '2.5vh 0' }} />}
              <Typography variant='h6' component='h2' style={{ color: kvMonitor.operational ? '#2ecc71' : '' }}>
                <MuiLink style={{ color: 'inherit' }} underline='hover' component={Link} href={config.monitors[i].url}>
                  {config.monitors[i].name}
                </MuiLink>
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
    </Container >
  )
}
