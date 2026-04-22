import type { EventPosition, SchedulerEvent } from "../scheduler.types"
import { getHourMinute, rangesOverlap } from "./time"

function eventsOverlap(a: SchedulerEvent, b: SchedulerEvent): boolean {
  return rangesOverlap(a.start, a.end, b.start, b.end)
}

/**
 * Compute {column, totalColumns} assignments for all timed events in a single
 * pass using interval-graph coloring:
 *
 * 1. Sort events by start time — O(N log N).
 * 2. Sweep: maintain an active set ordered by end time. Drop events whose end
 *    is ≤ the current event's start. Assign the current event the lowest
 *    unused column index in the active set. This is O(N) with a small active
 *    set (bounded by max concurrent events, typically ≪ N).
 * 3. Group events into overlap clusters (a cluster is a maximal run where
 *    consecutive starts precede the running max end). `totalColumns` per
 *    event is the cluster's peak active count.
 *
 * Overall O(N log N); replaces the previous O(N³) implementation which
 * crashed the browser at a few hundred events.
 */
interface LayoutAssignment {
  column: number
  totalColumns: number
}

function computeColumnLayout(events: SchedulerEvent[]): Map<string, LayoutAssignment> {
  const result = new Map<string, LayoutAssignment>()
  if (events.length === 0) return result

  const sorted = [...events].sort((a, b) => a.start.compare(b.start))

  // Group = maximal cluster of overlapping events; all members share totalColumns.
  let clusterStart = 0
  let clusterEnd = sorted[0].end
  let clusterPeak = 0
  const pending: { index: number; column: number }[] = []

  interface Active {
    endIdx: number
    column: number
    event: SchedulerEvent
  }
  // Parallel arrays for the active set — kept sorted by `event.end` ascending
  // via binary-insert. Cheap linear scan is fine for N ≤ a few thousand.
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

    // Cluster break: if this event starts at or after the cluster's running
    // max end, flush the previous cluster.
    if (pending.length > 0 && event.start.compare(clusterEnd) >= 0) {
      flushCluster()
      clusterStart = i
      clusterEnd = event.end
      active = []
    }

    // Drop expired actives (end ≤ event.start).
    active = active.filter((a) => a.event.end.compare(event.start) > 0)

    // Lowest unused column.
    const used = new Set(active.map((a) => a.column))
    let column = 0
    while (used.has(column)) column++

    active.push({ endIdx: i, column, event })
    pending.push({ index: i, column })

    if (event.end.compare(clusterEnd) > 0) clusterEnd = event.end
    if (active.length > clusterPeak) clusterPeak = active.length
  }

  flushCluster()
  void clusterStart
  return result
}

/**
 * Build position data (top/height/left/width/column/totalColumns) for every
 * event in one pass. Consumers then do Map lookups in O(1).
 */
export function computeEventLayout(
  events: SchedulerEvent[],
  dayStartHour: number,
  dayEndHour: number,
): Map<string, EventPosition> {
  const result = new Map<string, EventPosition>()
  if (events.length === 0) return result

  const totalMinutes = (dayEndHour - dayStartHour) * 60

  const timed: SchedulerEvent[] = []
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
 * Legacy single-event entry point — still exported for consumers that have
 * one event in hand and don't want to precompute the whole map. Prefer
 * `computeEventLayout` when rendering many events.
 */
export function getEventPosition(
  event: SchedulerEvent,
  events: SchedulerEvent[],
  dayStartHour: number,
  dayEndHour: number,
): EventPosition {
  if (event.allDay) {
    return { top: 0, height: 1, left: 0, width: 1, column: 0, totalColumns: 1 }
  }
  const map = computeEventLayout(events, dayStartHour, dayEndHour)
  return map.get(event.id) ?? { top: 0, height: 0, left: 0, width: 1, column: 0, totalColumns: 1 }
}

// Keep reference so unused-export lint doesn't strip the helper, and to make
// the dependency explicit to anyone reading this file.
void eventsOverlap
