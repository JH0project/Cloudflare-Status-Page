import config from '../../../config.json'
import type { ScheduledEvent } from '@cloudflare/workers-types'
import { MonitorMonth } from 'cf-status-page-types'

import {
  getCheckLocation,
  getKVMonitors,
  setKVMonitors,
} from './helpers'

function getDate(time: number) {
  return new Date(time).toISOString().split('T')[0]
}

export async function processCronTrigger(_event: ScheduledEvent) {
  // Get Worker PoP and save it to monitorMonthMetadata
  const checkLocation = await getCheckLocation()
  const now = Date.now()
  const checkDay = getDate(now)

  // Get monitors state from KV
  let monitorMonth: MonitorMonth = await getKVMonitors(checkDay.slice(0, 7))
  // Create empty state objects if not exists in KV storage yet
  if (!monitorMonth) {
    const lastDay = getDate(now - 86400000)
    const lastMonitorMonth: MonitorMonth = await getKVMonitors(lastDay.slice(0, 7))

    monitorMonth = {
      lastCheck: now,
      operational: lastMonitorMonth ? lastMonitorMonth.operational : {},
      checks: {
        // incidents: {},
      }
    }
  }

  if (!monitorMonth.checks[checkDay]) {
    monitorMonth.checks[checkDay] = {
      summery: {},
      res: [],
      incidents: {},
    }
  }

  const res: {
    t: number
    l: string
    ms: {
      [index: string]: number | null
    }
  } = { t: now, l: checkLocation, ms: {} }

  for (const monitor of config.monitors) {

    console.log(`Checking ${monitor.name} ...`)

    // Fetch the monitors URL
    const init: Parameters<typeof fetch>[1] = {
      method: monitor.method || 'GET',
      redirect: monitor.followRedirect ? 'follow' : 'manual',
      headers: {
        //@ts-expect-error
        'User-Agent': config.settings.user_agent || 'cf-workers-status-poller',
      },
    }

    // Perform a check and measure time
    const requestStartTime = performance.now()
    const checkResponse = await fetch(monitor.url, init)
    const requestTime = Math.round(performance.now() - requestStartTime)

    // Determine whether operational and status changed
    const monitorOperational = checkResponse.status === (monitor.expectStatus || 200)
    // const monitorStatusChanged = monitorMonth.operational[monitor.id] ? monitorMonth.operational[monitor.id] !== monitorOperational : false

    // Save monitor's last check response status
    monitorMonth.operational[monitor.id] = monitorOperational;

    if (config.settings.collectResponseTimes && monitorOperational) {
      // make sure location exists in current checkDay
      if (!monitorMonth.checks[checkDay].summery[checkLocation])
        monitorMonth.checks[checkDay].summery[checkLocation] = {}
      if (!monitorMonth.checks[checkDay].summery[checkLocation][monitor.id])
        monitorMonth.checks[checkDay].summery[checkLocation][monitor.id] = {
          n: 0,
          ms: 0,
          a: 0,
        }

      // increment number of checks and sum of ms
      const no = ++monitorMonth.checks[checkDay].summery[checkLocation][monitor.id].n
      const ms = monitorMonth.checks[checkDay].summery[checkLocation][monitor.id].ms += requestTime

      // save new average ms
      monitorMonth.checks[checkDay].summery[checkLocation][monitor.id].a = Math.round(ms / no)

      // back online
      // if (monitorStatusChanged) {
      //   monitorMonth.monitors[monitor.id].incidents.at(-1)!.end = now;
      // }
    }

    res.ms[monitor.id] = monitorOperational ? requestTime : null

    // go dark
    // if (!monitorOperational && monitorStatusChanged) {
    //   monitorMonth.monitors[monitor.id].incidents.push({ start: now, status: checkResponse.status, statusText: checkResponse.statusText })
    //   const incidentNumber = monitorMonth.monitors[monitor.id].incidents.length - 1
    //   monitorMonth.monitors[monitor.id].checks[checkDay].incidents.push(incidentNumber)
    // }
  }

  monitorMonth.checks[checkDay].res.push(res)
  monitorMonth.lastCheck = now

  // Save monitorMonth to KV storage
  await setKVMonitors(checkDay.slice(0, 7), monitorMonth)

  return new Response('OK')
}
