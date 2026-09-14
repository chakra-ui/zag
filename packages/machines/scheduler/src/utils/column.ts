import type { CalendarDateTime } from "@internationalized/date"
import type { SchedulerColumn, SchedulerPayload, SchedulerResource } from "../scheduler.types"
import type { TimeRange } from "./time"

export function getVisibleDays(params: {
  range: TimeRange
  workWeekOnly: boolean
  workWeekDays: number[]
}): CalendarDateTime[] {
  const { range, workWeekOnly, workWeekDays } = params
  const days: CalendarDateTime[] = []
  let cur = range.start
  while (cur.compare(range.end) <= 0) {
    days.push(cur)
    cur = cur.add({ days: 1 })
  }

  if (!workWeekOnly || workWeekDays.length === 0 || workWeekDays.length >= 7) return days

  const allowed = new Set(workWeekDays)
  return days.filter((d) => allowed.has(new Date(d.year, d.month - 1, d.day).getDay()))
}

/** A column is a day, or a day × resource when grouping by resource. */
export function getColumns<E extends SchedulerPayload>(params: {
  days: CalendarDateTime[]
  resources: SchedulerResource<E>[]
  isGroupedByResource: boolean
}): SchedulerColumn<E>[] {
  const { days, resources, isGroupedByResource } = params
  if (!isGroupedByResource) return days.map((date) => ({ date }))
  return days.flatMap((date) => resources.map((resource) => ({ date, resource })))
}
