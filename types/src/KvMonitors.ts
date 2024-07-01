export interface Check {
  incidents: number[],
  summery: {
    [index: string]: {
      n: number
      ms: number
      a: number
    }
  },
  res: {
    t: number
    loc: string
    ms: number
  }[]
}

export interface KvMonitor {
  operational: boolean
  incidents: {
    start: number
    status: number
    statusText: string
    end?: number
  }[],
  checks: {
    [index: string]: Check
  }
}

export interface KvMonitors {
  lastCheck: number
  allOperational: boolean
  monitors: {
    [index: string]: KvMonitor
  }
}

export interface Checks {
  // incidents: {
  //   [index: string]: {
  //     start: number
  //     status: number
  //     statusText: string
  //     end?: number
  //   }[]
  // },
  summery: {
    [index: string]: {
      [index: string]: {
        n: number
        ms: number
        a: number
      }
    }
  },
  res: {
    t: number
    l: string
    ms: {
      [index: string]: number | null
    }
  }[]
}

export interface MonitorDay {
  lastCheck: number,
  operational: {
    [index: string]: boolean
  },
  checks: Checks
}

export interface MonthSummery {
  // Date
  [index: string]: {
    // Location
    [index: string]: {
      // Monitor
      [index: string]: {
        n: number
        ms: number
        a: number
      }
    }
  },
}