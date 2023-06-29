"use client"

import React from 'react';
import type { KvMonitors } from 'cf-status-page-types';
import UptimeGraph from './UptimeGraph';
import ResponseGraph from './ResponseGraph';
import { Container, Divider, Paper } from '@mui/material';

export default function Monitors({ kvMonitors }: { kvMonitors: KvMonitors }) {
  return (
    <Container maxWidth='md' >
      <Paper elevation={5} style={{ padding: '5vh 0', margin: '5vh 0' }}>
        <Container>
          {Object.keys(kvMonitors).map((monitorName, i) => <>
            {i !== 0 && <Divider style={{ margin: '2.5vh 0' }} />}
            <UptimeGraph kvMonitor={kvMonitors[monitorName]} monitorName={monitorName} key={monitorName} />
            <div style={{ height: '20vh', width: '100%' }}>
              <ResponseGraph data={Object.keys(kvMonitors[monitorName].checks).map((day) => kvMonitors[monitorName].checks[day].res).flat()} />
            </div>
          </>)}
        </Container>
      </Paper>
    </Container>
  )
}
