import config from '../../../config.json'
import type { ScheduledEvent } from '@cloudflare/workers-types'
import { MonitorDay, MonthSummery } from 'cf-status-page-types'

import {
  getCheckLocation,
  getKVMonitors,
  setKVMonitors,
} from './helpers'

function getDate(time: number) {
  return new Date(time).toISOString().split('T')[0]
}

export async function processCronTrigger(_event: ScheduledEvent) {
  // Get Worker PoP and save it to monitorDayMetadata
  const checkLocation = await getCheckLocation()
  const now = Date.now()
  const checkDay = getDate(now)

  // Get monitors state from KV
  let monitorDay: MonitorDay = await getKVMonitors(checkDay)
  // Create empty state objects if not exists in KV storage yet
  if (!monitorDay) {
    const lastDay = getDate(now - 86400000)
    const lastMonitorDay: MonitorDay = await getKVMonitors(lastDay)
    if (lastMonitorDay) {
      const month = lastDay.slice(0, 7)
      let monthSummery: MonthSummery = await getKVMonitors(month)
      if (!monthSummery)
        monthSummery = {}
      monthSummery[lastDay] = lastMonitorDay.checks.summery
      await setKVMonitors(month, monthSummery)
    }

    monitorDay = {
      lastCheck: now,
      operational: lastMonitorDay ? lastMonitorDay.operational : {},
      checks: {
        // incidents: {},
        summery: {},
        res: [],
      }
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
    // const monitorStatusChanged = monitorDay.operational[monitor.id] ? monitorDay.operational[monitor.id] !== monitorOperational : false

    // Save monitor's last check response status
    monitorDay.operational[monitor.id] = monitorOperational;

    if (config.settings.collectResponseTimes && monitorOperational) {
      // make sure location exists in current checkDay
      if (!monitorDay.checks.summery[checkLocation])
        monitorDay.checks.summery[checkLocation] = {}
      if (!monitorDay.checks.summery[checkLocation][monitor.id])
        monitorDay.checks.summery[checkLocation][monitor.id] = {
          n: 0,
          ms: 0,
          a: 0,
        }

      // increment number of checks and sum of ms
      const no = ++monitorDay.checks.summery[checkLocation][monitor.id].n
      const ms = monitorDay.checks.summery[checkLocation][monitor.id].ms += requestTime

      // save new average ms
      monitorDay.checks.summery[checkLocation][monitor.id].a = Math.round(ms / no)


      res.ms[monitor.id] = monitorOperational ? requestTime : null

      // back online
      // if (monitorStatusChanged) {
      //   monitorDay.monitors[monitor.id].incidents.at(-1)!.end = now;
      // }
    }

    // go dark
    // if (!monitorOperational && monitorStatusChanged) {
    //   monitorDay.monitors[monitor.id].incidents.push({ start: now, status: checkResponse.status, statusText: checkResponse.statusText })
    //   const incidentNumber = monitorDay.monitors[monitor.id].incidents.length - 1
    //   monitorDay.monitors[monitor.id].checks[checkDay].incidents.push(incidentNumber)
    // }
  }

  monitorDay.checks.res.push(res)
  monitorDay.lastCheck = now

  // Save monitorDay to KV storage
  await setKVMonitors(checkDay, monitorDay)

  return new Response('OK')
}
