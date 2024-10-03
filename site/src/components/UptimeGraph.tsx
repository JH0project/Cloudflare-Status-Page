"use client"

import { Container, Divider, Paper, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';
import ResponseGraph from '@/components/ResponseGraph';
import type { Checks, KvMonitor } from 'cf-status-page-types';

const getGradient = (UpPresentage: number) => {
  const toHex = (color: number) => {
    const hex = color.toString(16);
    return (hex.length == 1) ? '0' + hex : hex;
  };

  const r = Math.ceil(59 * UpPresentage + 231 * (1 - UpPresentage));
  const g = Math.ceil(165 * UpPresentage + 76 * (1 - UpPresentage));
  const b = Math.ceil(92 * UpPresentage + 60 * (1 - UpPresentage));

  return '#' + toHex(r) + toHex(g) + toHex(b);
}

const getDayIncidentInfo = (checks: {
  [index: string]: Checks
}, day: string, monitorName: string) => {
  if (!checks[day]) return [undefined, undefined]

  const uptime = checks[day].res.filter((res) => res.ms[monitorName]).map((res) => res.ms[monitorName])
  const downCount = uptime.filter((ms) => ms === null).length
  if (downCount === 0) return [1, 0];
  const upCount = uptime.filter((ms) => ms !== null).length
  if (upCount === 0) return [0, 1];

  const noOfincidents = uptime.filter((ms, i) => ms === null && (i === 0 ? true : ms !== null && uptime[i - 1] === null)).length
  const uptimePercent = upCount / (upCount + downCount)

  return [uptimePercent, noOfincidents]
}

export default function UptimeGraph({ monitorName, checks, day = 90 }: {
  monitorName: string, checks: {
    [index: string]: Checks
  }, day?: number
}) {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'), { defaultMatches: true })
  const lastDays = useMediaQuery(theme.breakpoints.up('sm'), { defaultMatches: true }) ? mdUp ? 90 : 60 : 30

  let lastX0Uptime = 0;
  const lastX0Days = new Array(lastDays).fill(1).map((_, i) => {
    const day = new Date(Date.now() - 86400000 * (lastDays - 1) + 86400000 * i).toISOString().split('T')[0]
    const [upPresentage, noOfincidents] = getDayIncidentInfo(checks, day, monitorName)
    lastX0Uptime += (upPresentage ?? 1) / lastDays
    return {
      day,
      upPresentage,
      noOfincidents
    }
  })
  return (
    <>
      <svg preserveAspectRatio="none" height="34" viewBox="0 0 448 34" style={{ width: '100%' }}>
        {lastX0Days.map(({ day, upPresentage, noOfincidents }, i) =>
          <Tooltip title={<div style={{ textAlign: 'center' }}>
            {day}
            <br />
            {upPresentage !== undefined && noOfincidents !== undefined ? `${upPresentage * 100}% ${noOfincidents} incident(s)` : 'No Data'}
            <br />
            {/* <div style={{ width: '10vw', height: '10vh' }}>
              <ResponseGraph data={Object.keys(kvMonitor.checks).map((day) => kvMonitor.checks[day].res).flat()} day={lastDays - i} local={false} />
            </div> */}
          </div>} arrow key={i} enterTouchDelay={0}>
            <rect height="34" width={`${0.6 * (90 / lastDays)}%`} x={5 * (90 / lastDays) * i} y="0" fill={upPresentage !== undefined ? getGradient(upPresentage) : '#B3BAC5'}></rect>
          </Tooltip>
        )}
      </svg>
      <div style={{ display: 'flex', color: '#72767d' }}>
        <Typography variant='body2' style={{ flex: '1 1 0', textAlign: 'left' }}>{lastDays} days ago</Typography>
        <Divider style={{ flex: '2 1 0' }} ><Typography variant='body2'>{Math.round(lastX0Uptime * 10000) / 100} % uptime</Typography></Divider >
        <Typography variant='body2' style={{ flex: '1 1 0', textAlign: 'right' }}>Today</Typography>
      </div>
    </>
  )
}
