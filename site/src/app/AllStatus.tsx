"use client"

import React, { useEffect, useState } from 'react';
import type { KvMonitors } from 'cf-status-page-types';
import { Paper, Typography } from '@mui/material';


export default function Monitors({ kvMonitors }: { kvMonitors: KvMonitors }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const allOutage = kvMonitors.allOperational || Object.keys(kvMonitors.monitors).map((kvMonitor) => kvMonitors.monitors[kvMonitor].operational).every(v => v === false)

  return (
    <Paper elevation={5} style={{ padding: '2.5vh 2vw', margin: '0 0 5vh 0', backgroundColor: kvMonitors.allOperational ? '#2ecc71' : allOutage ? '#e74c3c' : '#e67e22', display: "flex", alignItems: 'center' }}>
      <Typography variant='h3' component='h1' style={{ color: '#fff', textAlign: 'left', flex: "4 1 0" }}>
        {kvMonitors.allOperational ? 'All Systems Operational' : allOutage ? 'Major System Outage' : 'Partial System Outage'}
      </Typography >
      <Typography variant='body1' component='p' style={{ color: '#fff', textAlign: 'right', flex: "1 1 0" }}>
        {`${Math.round((now - kvMonitors.lastCheck) / 1000)} Seconds ago`}
      </Typography >
    </Paper>
  )
}