import config from '../../../config.json'
import type { ScheduledEvent } from '@cloudflare/workers-types'

import {
  getCheckLocation,
  getKVMonitors,
  setKVMonitors,
} from './helpers'

function getDate() {
  return new Date().toISOString().split('T')[0]
}

export async function processCronTrigger(_event: ScheduledEvent) {
  // Get Worker PoP and save it to monitorsStateMetadata
  const checkLocation = await getCheckLocation()
  const checkDay = getDate()
  const now = Date.now()

  // Get monitors state from KV
  let monitorsState = await getKVMonitors()
  // Create empty state objects if not exists in KV storage yet
  if (!monitorsState) {
    monitorsState = {
      lastCheck: now,
      allOperational: true,
      monitors: {}
    }
  }

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

    // Create default monitor state if does not exist yet
    if (typeof monitorsState.monitors[monitor.id] === 'undefined') {
      monitorsState.monitors[monitor.id] = {
        operational: true,
        incidents: [],
        checks: {},
      }
    }

    // Perform a check and measure time
    const requestStartTime = performance.now()
    const checkResponse = await fetch(monitor.url, init)
    const requestTime = Math.round(performance.now() - requestStartTime)

    // Determine whether operational and status changed
    const monitorOperational = checkResponse.status === (monitor.expectStatus || 200)
    const monitorStatusChanged = monitorsState.monitors[monitor.id].operational !== monitorOperational

    // make sure checkDay exists in checks in cases when needed
    if (
      (config.settings.collectResponseTimes || !monitorOperational) &&
      !monitorsState.monitors[monitor.id].checks.hasOwnProperty(checkDay)
    ) {
      monitorsState.monitors[monitor.id].checks[checkDay] = {
        incidents: [],
        summery: {},
        res: [],
      }
      if (!monitorsState.monitors[monitor.id].operational) {
        monitorsState.monitors[monitor.id].checks[checkDay].incidents.push(monitorsState.monitors[monitor.id].incidents.length - 1)
      }
    }

    // Save monitor's last check response status
    monitorsState.monitors[monitor.id].operational = monitorOperational;
    if (!monitorOperational) monitorsState.allOperational = false


    if (config.settings.collectResponseTimes && monitorOperational) {
      // make sure location exists in current checkDay
      if (
        !monitorsState.monitors[monitor.id].checks[checkDay].summery.hasOwnProperty(
          checkLocation,
        )
      ) {
        monitorsState.monitors[monitor.id].checks[checkDay].summery[
          checkLocation
        ] = {
          n: 0,
          ms: 0,
          a: 0,
        }
      }

      // increment number of checks and sum of ms
      const no = ++monitorsState.monitors[monitor.id].checks[checkDay].summery[
        checkLocation
      ].n
      const ms = (monitorsState.monitors[monitor.id].checks[checkDay].summery[
        checkLocation
      ].ms += requestTime)

      // save new average ms
      monitorsState.monitors[monitor.id].checks[checkDay].summery[
        checkLocation
      ].a = Math.round(ms / no)

      monitorsState.monitors[monitor.id].checks[checkDay].res.push({
        t: now,
        loc: checkLocation,
        ms: requestTime
      })

      // back online
      if (monitorStatusChanged) {
        monitorsState.monitors[monitor.id].incidents.at(-1)!.end = now;
      }
    }

    // go dark
    if (!monitorOperational && monitorStatusChanged) {
      monitorsState.monitors[monitor.id].incidents.push({ start: now, status: checkResponse.status, statusText: checkResponse.statusText })
      const incidentNumber = monitorsState.monitors[monitor.id].incidents.length - 1
      monitorsState.monitors[monitor.id].checks[checkDay].incidents.push(incidentNumber)
    }
  }

  monitorsState.lastCheck = now

  // Save monitorsState to KV storage
  await setKVMonitors(monitorsState)

  return new Response('OK')
}
