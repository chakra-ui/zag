import { toCalendarDate, type CalendarDateTime } from "@internationalized/date"
import type { AllDaySegment, SchedulerEvent, SchedulerPayload } from "../scheduler.types"

export interface AllDaySegmentParams<E extends SchedulerPayload> {
  events: SchedulerEvent<E>[]
  days: CalendarDateTime[]
  /** Live gesture, so the dragged bar tracks the pointer instead of snapping on release. */
  live?: { eventId: string; start: CalendarDateTime; end: CalendarDateTime } | null
  /** Levels to show before the rest become per-day overflow counts. Unbounded when absent. */
  maxRows?: number | undefined
}

export interface AllDayLayout<E extends SchedulerPayload> {
  segments: AllDaySegment<E>[]
  /** Levels the visible segments occupy, so the row can size itself. */
  rows: number
  /** Bars the cap hid, counted per day. */
  overflow: { date: CalendarDateTime; count: number }[]
}

/**
 * One bar per event rather than one chip per day, so a multi-day event reads as a single continuous range and only its true ends carry resize handles.
 */
const EMPTY_LAYOUT: AllDayLayout<any> = { segments: [], rows: 0, overflow: [] }

export function getAllDayLayout<E extends SchedulerPayload>(params: AllDaySegmentParams<E>): AllDayLayout<E> {
  const { events, days, live, maxRows } = params
  if (!days.length) return EMPTY_LAYOUT

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

  if (maxRows == null) {
    return { segments, rows: levelEnds.length, overflow: [] }
  }

  // past the cap a bar becomes a count on each day it would have covered, the way both
  // FullCalendar's `dayMaxEvents` and react-big-calendar's `allDayMaxRows` do it
  const visible = segments.filter((s) => s.level < maxRows)
  const hidden = segments.filter((s) => s.level >= maxRows)
  const counts = new Map<number, number>()
  for (const segment of hidden) {
    for (let i = segment.column; i < segment.column + segment.span; i++) {
      counts.set(i, (counts.get(i) ?? 0) + 1)
    }
  }

  return {
    segments: visible,
    rows: Math.min(levelEnds.length, maxRows),
    overflow: [...counts.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([index, count]) => ({ date: days[index]!, count })),
  }
}
