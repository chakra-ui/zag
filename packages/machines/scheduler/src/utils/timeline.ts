import type { CalendarDateTime } from "@internationalized/date"
import type {
  SchedulerEvent,
  SchedulerPayload,
  SchedulerResource,
  TimelineRow,
  TimelineSlot,
  TimelineState,
} from "../scheduler.types"
import type { TimeRange } from "./time"

export interface TimelineLayout<E extends SchedulerPayload> {
  /** Null when the event falls outside the range. */
  getSpan(event: SchedulerEvent<E>): { offset: number; size: number } | null
  /** Built on first call and reused, so views that never render a timeline pay nothing. */
  getState(): TimelineState<E>
}

/** The lane a timeline falls back to when no resources are configured. */
const UNGROUPED_ROWS: TimelineRow<any>[] = [{ id: "all", title: "All" }]

export interface TimelineLayoutParams<E extends SchedulerPayload> {
  range: TimeRange
  resources: SchedulerResource<E>[]
  days: CalendarDateTime[]
  timeZone: string
  formatSlotLabel: (date: Date) => string
}

/** Lays the range out horizontally: one lane per resource, one slot per day. */
export function createTimelineLayout<E extends SchedulerPayload>(params: TimelineLayoutParams<E>): TimelineLayout<E> {
  const { range, resources, days, timeZone, formatSlotLabel } = params

  const startMs = range.start.toDate(timeZone).getTime()
  const endMs = range.end.add({ days: 1 }).toDate(timeZone).getTime()
  const spanMs = Math.max(1, endMs - startMs)
  const fractionOf = (ms: number) => (ms - startMs) / spanMs

  let state: TimelineState<E> | undefined

  const buildRows = (): TimelineRow<E>[] => {
    if (!resources.length) return UNGROUPED_ROWS
    return resources.map((resource) => ({ id: resource.id, title: resource.title, resource }))
  }

  const buildSlots = (): TimelineSlot[] =>
    days.map((date) => {
      const end = date.add({ days: 1 })
      const from = date.toDate(timeZone).getTime()
      const to = end.toDate(timeZone).getTime()
      return {
        start: date,
        end,
        label: formatSlotLabel(date.toDate(timeZone)),
        offset: fractionOf(from),
        size: (to - from) / spanMs,
      }
    })

  return {
    getSpan(event) {
      // clamped so an event running past either edge still renders in the lane
      const from = Math.max(event.start.toDate(timeZone).getTime(), startMs)
      const to = Math.min(event.end.toDate(timeZone).getTime(), endMs)
      if (to <= from) return null
      return { offset: fractionOf(from), size: (to - from) / spanMs }
    },
    getState() {
      state ??= { rows: buildRows(), slots: buildSlots() }
      return state
    },
  }
}
