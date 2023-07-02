"use client"

import React from 'react';
import type { KvMonitors } from 'cf-status-page-types';
import UptimeGraph from './UptimeGraph';
import { Container, Divider, Paper, Typography, Link as MuiLink } from '@mui/material';
import config from '../../../config.json'
import NextLink from 'next/link';
import OverallResponseGraph from './OverallResponseGraph';
import AllStatus from './AllStatus';

const Link = (args: Parameters<typeof MuiLink>[0]) => <MuiLink component={NextLink} {...args} />

export default function Monitors({ kvMonitors }: { kvMonitors: KvMonitors }) {
  return (
    <Container maxWidth='md' style={{ padding: '0 0 5vh 0' }}>
      <Typography variant='h3' component='h1' style={{ margin: '2.5vh 1vw' }}>
        {config.settings.title}
      </Typography >
      <AllStatus kvMonitors={kvMonitors} />
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
                <OverallResponseGraph data={Object.keys(kvMonitor.checks).map((day) => ({ day, summery: kvMonitor.checks[day].summery })).flat()} />
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
