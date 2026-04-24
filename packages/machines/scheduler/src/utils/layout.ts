import { toCalendarDate, type DateValue } from "@internationalized/date"
import type { EventPosition, SchedulerEvent, SchedulerPayload } from "../scheduler.types"
import { getHourMinute, rangesOverlap } from "./time"

interface LayoutAssignment {
  column: number
  totalColumns: number
}

function computeColumnLayout<E extends SchedulerPayload = SchedulerPayload>(
  events: SchedulerEvent<E>[],
): Map<string, LayoutAssignment> {
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

export function getEventLayout<E extends SchedulerPayload = SchedulerPayload>(
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

/**
 * Filter events whose range overlaps `[visibleRange.start, visibleRange.end)`.
 * `visibleRange.end` is midnight of the day after the last visible day, so the
 * interval is half-open and correctly includes events on the final day.
 */
export function getVisibleEvents<E extends SchedulerPayload = SchedulerPayload>(
  events: SchedulerEvent<E>[],
  visibleRange: { start: DateValue; end: DateValue },
): SchedulerEvent<E>[] {
  const rangeEnd = visibleRange.end.add({ days: 1 })
  return events.filter((e) => rangesOverlap(e.start, e.end, visibleRange.start, rangeEnd))
}

/**
 * Group events by their start-day into sorted buckets. Each group is a day
 * with its events sorted by start time. Groups themselves are ordered
 * chronologically. Used by the agenda view.
 */
export function getAgendaGroups<E extends SchedulerPayload = SchedulerPayload>(
  events: SchedulerEvent<E>[],
): { date: DateValue; events: SchedulerEvent<E>[] }[] {
  const byKey = new Map<string, { date: DateValue; events: SchedulerEvent<E>[] }>()
  const sorted = [...events].sort((a, b) => a.start.compare(b.start))
  for (const e of sorted) {
    const cal = toCalendarDate(e.start)
    const key = cal.toString()
    const bucket = byKey.get(key)
    if (bucket) bucket.events.push(e)
    else byKey.set(key, { date: cal, events: [e] })
  }
  const groups = [...byKey.values()]
  groups.sort((a, b) => a.date.compare(b.date))
  return groups
}

/**
 * Bucket events by the calendar-date key of each day they span. A multi-day
 * event lands in every day bucket between `start` and `end` (inclusive).
 */
export function groupEventsByDay<E extends SchedulerPayload = SchedulerPayload>(
  events: SchedulerEvent<E>[],
): Map<string, SchedulerEvent<E>[]> {
  const result = new Map<string, SchedulerEvent<E>[]>()
  for (const e of events) {
    let cur = toCalendarDate(e.start)
    const stop = toCalendarDate(e.end)
    while (cur.compare(stop) <= 0) {
      const key = cur.toString()
      const bucket = result.get(key)
      if (bucket) bucket.push(e)
      else result.set(key, [e])
      cur = cur.add({ days: 1 })
    }
  }
  return result
}

/**
 * Sweep-line detection of overlapping timed events. Returns the set of event
 * ids that conflict with at least one other event. Ignores `allDay` events.
 */
export function getEventConflicts<E extends SchedulerPayload = SchedulerPayload>(
  events: SchedulerEvent<E>[],
): Set<string> {
  const conflictIds = new Set<string>()
  const timed = events.filter((e) => !e.allDay).sort((a, b) => a.start.compare(b.start))
  let active: SchedulerEvent<E>[] = []
  for (const e of timed) {
    active = active.filter((a) => a.end.compare(e.start) > 0)
    if (active.length > 0) {
      conflictIds.add(e.id)
      for (const a of active) conflictIds.add(a.id)
    }
    active.push(e)
  }
  return conflictIds
}

export function getEventPosition<E extends SchedulerPayload = SchedulerPayload>(
  event: SchedulerEvent<E>,
  events: SchedulerEvent<E>[],
  dayStartHour: number,
  dayEndHour: number,
): EventPosition {
  if (event.allDay) {
    return { top: 0, height: 1, left: 0, width: 1, column: 0, totalColumns: 1 }
  }
  const map = getEventLayout(events, dayStartHour, dayEndHour)
  return map.get(event.id) ?? { top: 0, height: 0, left: 0, width: 1, column: 0, totalColumns: 1 }
}
