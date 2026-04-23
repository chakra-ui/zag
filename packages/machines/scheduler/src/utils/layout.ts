import type { EventPosition, SchedulerEvent } from "../scheduler.types"
import { getHourMinute } from "./time"

interface LayoutAssignment {
  column: number
  totalColumns: number
}

function computeColumnLayout<E>(events: SchedulerEvent<E>[]): Map<string, LayoutAssignment> {
  const result = new Map<string, LayoutAssignment>()
  if (events.length === 0) return result

  const sorted = [...events].sort((a, b) => a.start.compare(b.start))

  let clusterEnd = sorted[0].end
  let clusterPeak = 0
  const pending: { index: number; column: number }[] = []

  interface Active {
    column: number
    event: SchedulerEvent<E>
  }
  let active: Active[] = []

  const flushCluster = () => {
    const cols = clusterPeak
    for (const p of pending) {
      result.set(sorted[p.index].id, { column: p.column, totalColumns: cols })
    }
    pending.length = 0
    clusterPeak = 0
  }

  for (let i = 0; i < sorted.length; i++) {
    const event = sorted[i]

    if (pending.length > 0 && event.start.compare(clusterEnd) >= 0) {
      flushCluster()
      clusterEnd = event.end
      active = []
    }

    active = active.filter((a) => a.event.end.compare(event.start) > 0)

    const used = new Set(active.map((a) => a.column))
    let column = 0
    while (used.has(column)) column++

    active.push({ column, event })
    pending.push({ index: i, column })

    if (event.end.compare(clusterEnd) > 0) clusterEnd = event.end
    if (active.length > clusterPeak) clusterPeak = active.length
  }

  flushCluster()
  return result
}

export function computeEventLayout<E>(
  events: SchedulerEvent<E>[],
  dayStartHour: number,
  dayEndHour: number,
): Map<string, EventPosition> {
  const result = new Map<string, EventPosition>()
  if (events.length === 0) return result

  const totalMinutes = (dayEndHour - dayStartHour) * 60

  const timed: SchedulerEvent<E>[] = []
  for (const e of events) {
    if (e.allDay) {
      result.set(e.id, { top: 0, height: 1, left: 0, width: 1, column: 0, totalColumns: 1 })
    } else {
      timed.push(e)
    }
  }

  const columns = computeColumnLayout(timed)

  for (const event of timed) {
    const assignment = columns.get(event.id) ?? { column: 0, totalColumns: 1 }
    const { hour: sh, minute: sm } = getHourMinute(event.start)
    const { hour: eh, minute: em } = getHourMinute(event.end)
    const startMins = Math.max(0, (sh - dayStartHour) * 60 + sm)
    const endMins = Math.min(totalMinutes, (eh - dayStartHour) * 60 + em)

    result.set(event.id, {
      top: startMins / totalMinutes,
      height: (endMins - startMins) / totalMinutes,
      left: assignment.column / assignment.totalColumns,
      width: 1 / assignment.totalColumns,
      column: assignment.column,
      totalColumns: assignment.totalColumns,
    })
  }

  return result
}

export function getEventPosition<E>(
  event: SchedulerEvent<E>,
  events: SchedulerEvent<E>[],
  dayStartHour: number,
  dayEndHour: number,
): EventPosition {
  if (event.allDay) {
    return { top: 0, height: 1, left: 0, width: 1, column: 0, totalColumns: 1 }
  }
  const map = computeEventLayout(events, dayStartHour, dayEndHour)
  return map.get(event.id) ?? { top: 0, height: 0, left: 0, width: 1, column: 0, totalColumns: 1 }
}
