import { CalendarDateTime, toCalendarDate } from "@internationalized/date"
import type { DragState, SchedulerEvent, SchedulerPayload } from "../scheduler.types"
import { getDaysBetween, getMinutesSinceMidnight, type DayBounds, type TimeRange } from "./time"

interface SnapParams extends DayBounds {
  slotInterval: number
}

function snapOffsetToTime(offset: number, height: number, params: SnapParams) {
  const { dayStartHour, dayEndHour, slotInterval } = params
  const totalMinutes = (dayEndHour - dayStartHour) * 60
  const relY = Math.max(0, Math.min(offset, height - 1))
  const snapped = Math.round(((relY / height) * totalMinutes) / slotInterval) * slotInterval
  return {
    hour: Math.min(dayStartHour + Math.floor(snapped / 60), dayEndHour - 1),
    minute: snapped % 60,
  }
}

/** Rebuilt rather than `.set()` so the calendar system (Gregorian, Buddhist, …) survives. */
function atTime(date: CalendarDateTime, time: { hour: number; minute: number }): CalendarDateTime {
  const base = toCalendarDate(date)
  return new CalendarDateTime(base.year, base.month, base.day, time.hour, time.minute)
}

export interface PointToDateTimeParams extends SnapParams {
  point: { x: number; y: number }
  rect: { left: number; top: number; width: number; height: number }
  range: TimeRange
}

export function pointToDateTime(params: PointToDateTimeParams): CalendarDateTime {
  const { point, rect, range } = params

  const totalDays = getDaysBetween(range.start, range.end) + 1
  const relX = Math.max(0, Math.min(point.x - rect.left, rect.width - 1))
  const dayIndex = Math.floor((relX / rect.width) * totalDays)

  return atTime(range.start.add({ days: dayIndex }), snapOffsetToTime(point.y - rect.top, rect.height, params))
}

export interface PointToTimeOnDayParams extends SnapParams {
  y: number
  rect: { top: number; height: number }
  referenceDate: CalendarDateTime
}

/** Resize keeps the day fixed, so only the time comes from the pointer. */
export function pointToTimeOnDay(params: PointToTimeOnDayParams): CalendarDateTime {
  const { y, rect, referenceDate } = params
  return atTime(referenceDate, snapOffsetToTime(y - rect.top, rect.height, params))
}

export interface DragStateParams<E extends SchedulerPayload> {
  isDragging: boolean
  isResizing: boolean
  liveDrag: { eventId: string; start: CalendarDateTime; end: CalendarDateTime; allDay: boolean } | null
  /** Where the gesture started, captured on pointer-down. */
  snapshot: TimeRange | null
  eventsById: Map<string, SchedulerEvent<E>>
}

/** Null unless a gesture is in flight and everything it refers to is still present. */
export function getDragState<E extends SchedulerPayload>(params: DragStateParams<E>): DragState<E> | null {
  const { isDragging, isResizing, liveDrag, snapshot, eventsById } = params
  if (!(isDragging || isResizing) || !liveDrag) return null

  const event = eventsById.get(liveDrag.eventId)
  if (!event || !snapshot) return null

  return {
    kind: isResizing ? "resize" : "drag",
    event,
    start: liveDrag.start,
    end: liveDrag.end,
    origin: snapshot,
    allDay: liveDrag.allDay,
  }
}

/** How far a drop moved an event, split into whole days plus a time-of-day shift. */
export function getDropDelta(from: CalendarDateTime, to: CalendarDateTime) {
  return {
    days: getDaysBetween(from, to),
    minutes: getMinutesSinceMidnight(to) - getMinutesSinceMidnight(from),
  }
}
