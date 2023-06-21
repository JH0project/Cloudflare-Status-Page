import config from '../../config.json'

import {
  getCheckLocation,
  getKVMonitors,
  setKVMonitors,
} from './helpers'

function getDate() {
  return new Date().toISOString().split('T')[0]
}

export async function processCronTrigger(event) {
  // Get Worker PoP and save it to monitorsStateMetadata
  const checkLocation = await getCheckLocation()
  const checkDay = getDate()
  const now = Date.now()

  // Get monitors state from KV
  let monitorsState = await getKVMonitors()
  // Create empty state objects if not exists in KV storage yet
  if (!monitorsState) {
    monitorsState = {}
  }

  for (const monitor of config.monitors) {

    console.log(`Checking ${monitor.name} ...`)

    // Fetch the monitors URL
    const init = {
      method: monitor.method || 'GET',
      redirect: monitor.followRedirect ? 'follow' : 'manual',
      headers: {
        'User-Agent': config.settings.user_agent || 'cf-workers-status-poller',
      },
    }

    // Create default monitor state if does not exist yet
    if (typeof monitorsState[monitor.id] === 'undefined') {
      monitorsState[monitor.id] = {
        lastIncident: undefined,
        operational: true,
        incidents: [],
        checks: {},
      }
    }

    // Perform a check and measure time
    const requestStartTime = Date.now()
    const checkResponse = await fetch(monitor.url, init)
    const requestTime = Math.round(Date.now() - requestStartTime)

    // Determine whether operational and status changed
    const monitorOperational = checkResponse.status === (monitor.expectStatus || 200)
    const monitorStatusChanged = monitorsState[monitor.id].operational !== monitorOperational

    // make sure checkDay exists in checks in cases when needed
    if (
      (config.settings.collectResponseTimes || !monitorOperational) &&
      !monitorsState[monitor.id].checks.hasOwnProperty(checkDay)
    ) {
      monitorsState[monitor.id].checks[checkDay] = {
        incidents: [],
        summery: {},
        res: {},
      }
      if (!monitorsState[monitor.id].operational) {
        monitorsState[monitor.id].checks[checkDay].incidents.push(monitorsState[monitor.id].lastIncident)
      }
    }

    // Save monitor's last check response status
    monitorsState[monitor.id].operational = monitorOperational;

    if (config.settings.collectResponseTimes && monitorOperational) {
      // make sure location exists in current checkDay
      if (
        !monitorsState[monitor.id].checks[checkDay].res.hasOwnProperty(
          checkLocation,
        )
      ) {
        monitorsState[monitor.id].checks[checkDay].summery[
          checkLocation
        ] = {
          n: 0,
          ms: 0,
          a: 0,
        }
      }

      // increment number of checks and sum of ms
      const no = ++monitorsState[monitor.id].checks[checkDay].summery[
        checkLocation
      ].n
      const ms = (monitorsState[monitor.id].checks[checkDay].summery[
        checkLocation
      ].ms += requestTime)

      // save new average ms
      monitorsState[monitor.id].checks[checkDay].summery[
        checkLocation
      ].a = Math.round(ms / no)

      monitorsState[monitor.id].checks[checkDay].res.push({
        t: now,
        loc: checkLocation,
        ms: requestTime
      })

      // back online
      if (monitorStatusChanged) {
        monitorsState[monitor.id][monitorsState[monitor.id].lastIncident].end = now;
      }
    }

    // go dark
    if (!monitorOperational && monitorStatusChanged) {
      monitorsState[monitor.id].incidents.push({ start: now, status: checkResponse.status, statusText: checkResponse.statusText })
      const incidentNumber = monitorsState[monitor.id].incidents.length - 1
      monitorsState[monitor.id].checks[checkDay].incidents.push(incidentNumber)
    }
  }

  // Save monitorsState to KV storage
  await setKVMonitors(monitorsState)

  return new Response('OK')
}
