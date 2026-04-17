import type { DateValue } from "@internationalized/date"

export interface SchedulerEvent<T = Record<string, unknown>> {
  id: string
  start: DateValue
  end: DateValue
  recurrence?: { rrule: string; exdate?: DateValue[] } | undefined
  [key: string]: unknown
}

/**
 * A function that expands a single recurring event into individual instances
 * within the given date range. Consumers provide this using their preferred
 * RRULE library (e.g. rrule.js, rruleset).
 *
 * @example
 * import { RRule } from "rrule"
 *
 * const expander: RecurrenceExpander = (event, range) => {
 *   const rule = RRule.fromString(event.recurrence!.rrule)
 *   return rule.between(toDate(range.start), toDate(range.end)).map((d, i) => ({
 *     ...event,
 *     id: `${event.id}:${i}`,
 *     start: fromDate(d, "UTC"),
 *     end: fromDate(addMinutes(d, getDurationMins(event)), "UTC"),
 *   }))
 * }
 */
export type RecurrenceExpander<T = Record<string, unknown>> = (
  event: SchedulerEvent<T>,
  range: { start: DateValue; end: DateValue },
) => SchedulerEvent<T>[]

/**
 * Expand recurring events within `range` using the provided `expander`.
 * Non-recurring events are passed through unchanged.
 * The machine receives only the flat expanded list.
 */
export function expandEvents<T = Record<string, unknown>>(
  events: SchedulerEvent<T>[],
  range: { start: DateValue; end: DateValue },
  expander: RecurrenceExpander<T>,
): SchedulerEvent<T>[] {
  return events.flatMap((event) => (event.recurrence ? expander(event, range) : [event]))
}
