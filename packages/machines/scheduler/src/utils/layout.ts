import { toCalendarDate, toCalendarDateTime, type CalendarDateTime } from "@internationalized/date"
import type { EventPosition, SchedulerEvent, SchedulerPayload } from "../scheduler.types"
import { getMinutesSinceMidnight, rangesOverlap, type DayBounds, type TimeRange } from "./time"

/** An all-day event fills its lane; nothing positions it vertically. */
export const ALL_DAY_POSITION: EventPosition = { top: 0, height: 1, left: 0, width: 1, column: 0, totalColumns: 1 }

/** Stand-in for an event the layout never placed — renders as a zero-height box. */
export const UNPLACED_POSITION: EventPosition = { top: 0, height: 0, left: 0, width: 1, column: 0, totalColumns: 1 }

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
  params: { events: SchedulerEvent<E>[] } & DayBounds,
): Map<string, EventPosition> {
  const { events, dayStartHour, dayEndHour } = params
  const result = new Map<string, EventPosition>()
  if (events.length === 0) return result

  const totalMinutes = (dayEndHour - dayStartHour) * 60

  const timed: SchedulerEvent<E>[] = []
  for (const e of events) {
    if (e.allDay) {
      result.set(e.id, ALL_DAY_POSITION)
    } else {
      timed.push(e)
    }
  }

  // pack within a resource only, so two resources' events each stay full width
  const columns = new Map<string, { column: number; totalColumns: number }>()
  for (const group of groupByResource(timed)) {
    for (const [id, assignment] of computeColumnLayout(group)) {
      columns.set(id, assignment)
    }
  }

  for (const event of timed) {
    const assignment = columns.get(event.id) ?? { column: 0, totalColumns: 1 }
    const dayStartMins = dayStartHour * 60
    const startMins = Math.max(0, getMinutesSinceMidnight(event.start) - dayStartMins)
    const endMins = Math.min(totalMinutes, getMinutesSinceMidnight(event.end) - dayStartMins)

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

/** `end` is exclusive, so it's pushed a day out to include the last visible day. */
export function getVisibleEvents<E extends SchedulerPayload = SchedulerPayload>(
  events: SchedulerEvent<E>[],
  visibleRange: TimeRange,
): SchedulerEvent<E>[] {
  const range = { start: visibleRange.start, end: visibleRange.end.add({ days: 1 }) }
  return events.filter((e) => rangesOverlap(e, range))
}

/** Day buckets in chronological order, each sorted by start time. Used by the agenda view. */
export function getAgendaGroups<E extends SchedulerPayload = SchedulerPayload>(
  events: SchedulerEvent<E>[],
): { date: CalendarDateTime; events: SchedulerEvent<E>[] }[] {
  const byKey = new Map<string, { date: CalendarDateTime; events: SchedulerEvent<E>[] }>()
  const sorted = [...events].sort((a, b) => a.start.compare(b.start))
  for (const e of sorted) {
    const cal = toCalendarDate(e.start)
    const key = cal.toString()
    const bucket = byKey.get(key)
    if (bucket) bucket.events.push(e)
    else byKey.set(key, { date: toCalendarDateTime(cal), events: [e] })
  }
  const groups = [...byKey.values()]
  groups.sort((a, b) => a.date.compare(b.date))
  return groups
}

/** A multi-day event lands in every day bucket it spans, inclusive. */
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

/** Ids of timed events overlapping at least one other. `allDay` events never conflict. */
/** Events only collide within a resource. Without resources everything lands in one group. */
function groupByResource<E extends SchedulerPayload = SchedulerPayload>(
  events: SchedulerEvent<E>[],
): SchedulerEvent<E>[][] {
  const groups = new Map<string, SchedulerEvent<E>[]>()
  for (const event of events) {
    const key = event.resourceId ?? ""
    const group = groups.get(key)
    if (group) group.push(event)
    else groups.set(key, [event])
  }
  return [...groups.values()]
}

export function getEventConflicts<E extends SchedulerPayload = SchedulerPayload>(
  events: SchedulerEvent<E>[],
): Set<string> {
  const conflictIds = new Set<string>()
  for (const group of groupByResource(events)) {
    const timed = group.filter((e) => !e.allDay).sort((a, b) => a.start.compare(b.start))
    let active: SchedulerEvent<E>[] = []
    for (const e of timed) {
      active = active.filter((a) => a.end.compare(e.start) > 0)
      if (active.length > 0) {
        conflictIds.add(e.id)
        for (const a of active) conflictIds.add(a.id)
      }
      active.push(e)
    }
  }
  return conflictIds
}

export function getEventPosition<E extends SchedulerPayload = SchedulerPayload>(
  params: { event: SchedulerEvent<E>; events: SchedulerEvent<E>[] } & DayBounds,
): EventPosition {
  const { event, ...layoutParams } = params
  if (event.allDay) return ALL_DAY_POSITION
  const map = getEventLayout(layoutParams)
  return map.get(event.id) ?? UNPLACED_POSITION
}
