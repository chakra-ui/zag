import { toCalendarDate, type CalendarDateTime } from "@internationalized/date"
import type { AllDaySegment, SchedulerEvent, SchedulerPayload } from "../scheduler.types"

export interface AllDaySegmentParams<E extends SchedulerPayload> {
  events: SchedulerEvent<E>[]
  days: CalendarDateTime[]
  /** Live gesture, so the dragged bar tracks the pointer instead of snapping on release. */
  live?: { eventId: string; start: CalendarDateTime; end: CalendarDateTime } | null
}

/**
 * One bar per event rather than one chip per day, so a multi-day event reads as a single continuous range and only its true ends carry resize handles.
 */
export function getAllDaySegments<E extends SchedulerPayload>(params: AllDaySegmentParams<E>): AllDaySegment<E>[] {
  const { events, days, live } = params
  if (!days.length) return []

  const dayKeys = days.map((d) => toCalendarDate(d))

  const segments: AllDaySegment<E>[] = []
  for (const event of events) {
    if (!event.allDay) continue
    const dragging = live?.eventId === event.id
    const start = toCalendarDate(dragging ? live!.start : event.start)
    const end = toCalendarDate(dragging ? live!.end : event.end)

    // scan rather than index: a work-week filter leaves the visible days non-contiguous
    let first = -1
    let last = -1
    dayKeys.forEach((day, index) => {
      if (day.compare(start) < 0 || day.compare(end) > 0) return
      if (first === -1) first = index
      last = index
    })
    if (first === -1) continue

    segments.push({
      event,
      column: first,
      span: last - first + 1,
      isStart: dayKeys[first]!.compare(start) === 0,
      isEnd: dayKeys[last]!.compare(end) === 0,
      dragging,
      level: 0,
    })
  }

  // longest bars settle first, so short ones fill the gaps they leave
  segments.sort((a, b) => a.column - b.column || b.span - a.span)

  const levelEnds: number[] = []
  for (const segment of segments) {
    let level = 0
    while (levelEnds[level] != null && levelEnds[level]! >= segment.column) level++
    levelEnds[level] = segment.column + segment.span - 1
    segment.level = level
  }

  return segments
}
