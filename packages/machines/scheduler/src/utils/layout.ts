import type { EventPosition, SchedulerEvent } from "../scheduler.types"
import { getHourMinute, rangesOverlap } from "./time"

function eventsOverlap(a: SchedulerEvent, b: SchedulerEvent): boolean {
  return rangesOverlap(a.start, a.end, b.start, b.end)
}

interface ColumnAssignment {
  column: number
  totalColumns: number
}

/**
 * Greedy interval-graph coloring. Assigns each event to the first column
 * where it does not overlap with the last event in that column.
 * Returns a map of eventId → { column, totalColumns }.
 */
function resolveOverlapColumns(events: SchedulerEvent[]): Map<string, ColumnAssignment> {
  if (events.length === 0) return new Map()

  const sorted = [...events].sort((a, b) => a.start.compare(b.start))
  // columns[i] holds the id of the last event placed in column i
  const columns: string[] = []
  const columnOf = new Map<string, number>()

  for (const event of sorted) {
    let placed = false
    for (let col = 0; col < columns.length; col++) {
      const lastId = columns[col]
      const lastEvent = events.find((e) => e.id === lastId)!
      if (!eventsOverlap(lastEvent, event)) {
        columns[col] = event.id
        columnOf.set(event.id, col)
        placed = true
        break
      }
    }
    if (!placed) {
      columns.push(event.id)
      columnOf.set(event.id, columns.length - 1)
    }
  }

  const result = new Map<string, ColumnAssignment>()
  for (const event of events) {
    const col = columnOf.get(event.id) ?? 0
    // totalColumns = number of columns spanned by the overlap group containing this event
    const overlapping = events.filter((e) => e.id !== event.id && eventsOverlap(e, event))
    const allCols = new Set([col, ...overlapping.map((e) => columnOf.get(e.id) ?? 0)])
    result.set(event.id, { column: col, totalColumns: allCols.size })
  }
  return result
}

/**
 * Compute CSS percentage position for an event within a single day column.
 * All values are percentage strings (e.g. "12.5%") relative to the column height/width.
 */
/**
 * Compute position for an event as 0–1 fractions of the day column.
 * Consumers multiply by 100 for %, or by container dimensions for px.
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

  const timed = events.filter((e) => !e.allDay)
  const columns = resolveOverlapColumns(timed)
  const { column, totalColumns } = columns.get(event.id) ?? { column: 0, totalColumns: 1 }

  const totalMinutes = (dayEndHour - dayStartHour) * 60
  const { hour: sh, minute: sm } = getHourMinute(event.start)
  const { hour: eh, minute: em } = getHourMinute(event.end)

  const startMins = Math.max(0, (sh - dayStartHour) * 60 + sm)
  const endMins = Math.min(totalMinutes, (eh - dayStartHour) * 60 + em)

  const top = startMins / totalMinutes
  const height = (endMins - startMins) / totalMinutes
  const left = column / totalColumns
  const width = 1 / totalColumns

  return { top, height, left, width, column, totalColumns }
}
