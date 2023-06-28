"use client"

import { Container, Divider, Paper, Tooltip, Typography } from '@mui/material';
import React from 'react';
import ResponseGraph from './ResponseGraph';

const getGradient = (UpPresentage: number) => {
  var hex = function (x) {
    x = x.toString(16);
    return (x.length == 1) ? '0' + x : x;
  };

  var r = Math.ceil(59 * UpPresentage + 231 * (1 - UpPresentage));
  var g = Math.ceil(165 * UpPresentage + 76 * (1 - UpPresentage));
  var b = Math.ceil(92 * UpPresentage + 60 * (1 - UpPresentage));

  return '#' + hex(r) + hex(g) + hex(b);
}

const getUpPresentage = (data, day) => {
  if (!data.checks[day]) return undefined
  if (data.checks[day].incidents.length === 0) return 1;
  const startOfDay = new Date(day).setUTCHours(0, 0, 0, 0)
  let sumOfDownTime = 0
  data.checks[day].incidents.forEach((incidentIndex) => {
    const incident = data.incidents[incidentIndex]
    const start = Math.max(incident.start, startOfDay)
    const end = Math.min(incident.end, startOfDay + 86400000)
    sumOfDownTime += end - start
  })
  return Math.round((86400000 - sumOfDownTime) / 86400) / 1000
}

export default function UptimeGraph({ data }: { data: any[] }) {
  let last90Uptime = 0;
  const last90Days = new Array(90).fill(1).map((_, i) => {
    const day = new Date(Date.now() - 86400000 * 89 + 86400000 * i).toISOString().split('T')[0]
    const upPresentage = getUpPresentage(data, day)
    last90Uptime += (upPresentage ?? 1) / 90
    return {
      day,
      upPresentage
    }
  })
  return (
    <Container maxWidth='md'>
      <Paper style={{ margin: '5vh 0', padding: '2.5vh 0' }} elevation={5}>
        <Container maxWidth='xl'>
          <Typography variant='h6' component='h2' style={{ color: data.operational ? '#2ecc71' : '' }}>
            Main
            <span style={{ float: 'right', color: data.operational ? '#3BA55C' : '' }}>{data.operational ? 'Operational' : 'Outage'}</span>
          </Typography>
          <svg preserveAspectRatio="none" height="34" viewBox="0 0 448 34" style={{ width: '100%' }}>
            {last90Days.map(({ day, upPresentage }, i) =>
              <Tooltip title={<div style={{ textAlign: 'center' }}>
                {day}
                <br />
                {upPresentage !== undefined ? upPresentage * 100 + ' %' : 'No Data'}
                <br />
                <div style={{ width: '10vw', height: '10vh' }}>
                  <ResponseGraph data={Object.keys(data.checks).map((day) => data.checks[day].res).flat()} day={90 - i} local={false} />
                </div>
              </div>} arrow key={i}>
                <rect height="34" width="3.5" x={5 * i} y="0" fill={upPresentage !== undefined ? getGradient(upPresentage) : '#B3BAC5'} data-html="true"></rect>
              </Tooltip>
            )}
          </svg>
          <div style={{ display: 'flex', color: '#72767d' }}>
            <Typography variant='body2' style={{ flex: '1 1 0', textAlign: 'left', width: '4%' }}>90 days ago</Typography>
            <Divider style={{ flex: '5 1 0' }} ><Typography variant='body2'>{Math.round(last90Uptime * 10000) / 100} % uptime</Typography></Divider >
            <Typography variant='body2' style={{ flex: '1 1 0', textAlign: 'right' }}>Today</Typography>
          </div>
        </Container>
      </Paper>
    </Container>
  )
}
