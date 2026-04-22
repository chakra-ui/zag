import { dataAttr, getEventKey, getEventPoint, isLeftClick } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./scheduler.anatomy"
import * as dom from "./scheduler.dom"
import type {
  DayCellProps,
  DayColumnProps,
  EventProps,
  EventResizeHandleProps,
  EventStyle,
  HourRange,
  MoreEventsProps,
  SchedulerApi,
  SchedulerEvent,
  SchedulerService,
  TimeSlotProps,
  ViewItemProps,
  ViewType,
  VisibleRangeText,
  WeekDay,
} from "./scheduler.types"
import {
  now,
  getLocalTimeZone,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  toCalendarDate,
  toCalendarDateTime,
  type CalendarDateTime,
  type DateValue,
} from "@internationalized/date"
import { getTimePercent, rangesOverlap } from "./utils/time"
import { computeEventLayout } from "./utils/layout"
import { toDayOfWeekToken } from "./utils/visible-range"
import { getTodayDate, getWeekDays } from "@zag-js/date-utils"
import type { MonthGridDay } from "./scheduler.types"

export function connect<T extends PropTypes>(service: SchedulerService, normalize: NormalizeProps<T>): SchedulerApi<T> {
  const { state, send, context, prop, computed, scope, refs } = service

  const view = context.get("view")
  const date = context.get("date")
  const visibleRange = computed("visibleRange")
  const focusedEventId = context.get("focusedEventId")
  const selectedEventId = context.get("selectedEventId")
  const liveDrag = context.get("liveDrag")
  const dragEventId = liveDrag?.eventId ?? refs.get("dragEventId")

  const isDragging = state.matches("event-dragging")
  const isSlotSelecting = state.matches("slot-selecting")
  const isResizing = state.matches("event-resizing")

  const rawEvents = prop("events") ?? []
  const expandRecurrence = prop("expandRecurrence")
  const limit = prop("maxRecurrenceInstances")
  const expandedEvents = expandRecurrence
    ? rawEvents.flatMap((e) => (e.recurrence ? expandRecurrence(e, visibleRange) : [e]))
    : rawEvents
  const events = typeof limit === "number" ? expandedEvents.slice(0, limit) : expandedEvents
  const translations = prop("translations")

  const defaultTranslations = {
    prevTriggerLabel: "Previous",
    nextTriggerLabel: "Next",
    todayTriggerLabel: "Today",
    viewLabels: { day: "Day", week: "Week", month: "Month", year: "Year", agenda: "Agenda" },
  }
  const t = { ...defaultTranslations, ...translations }

  // Extend end by 1 day: visibleRange.end is a CalendarDate (midnight), so events
  // on the final day would be excluded by a strict range check.
  const rangeFilterEnd = visibleRange.end.add({ days: 1 })
  const visibleEvents = events.filter((e) => rangesOverlap(e.start, e.end, visibleRange.start, rangeFilterEnd))

  // Single O(N log N) layout pass — avoids calling getEventPosition N times
  // with O(N²) overlap resolution each, which previously crashed the browser
  // at a few hundred events.
  const eventPositions = computeEventLayout(visibleEvents, prop("dayStartHour"), prop("dayEndHour"))

  // Index every event by id for O(1) lookup from consumer code.
  const eventsById = new Map<string, SchedulerEvent>()
  for (const e of events) eventsById.set(e.id, e)

  // Pre-bucket events by day key for O(1) `getEventsForDay`. A single event
  // can span multiple days (overnight) — push it into each key it touches.
  const eventsByDayKey = new Map<string, SchedulerEvent[]>()
  for (const e of visibleEvents) {
    let cur = toCalendarDate(e.start)
    const stop = toCalendarDate(e.end)
    while (cur.compare(stop) <= 0) {
      const key = cur.toString()
      const bucket = eventsByDayKey.get(key)
      if (bucket) bucket.push(e)
      else eventsByDayKey.set(key, [e])
      cur = cur.add({ days: 1 })
    }
  }

  // Pre-compute conflicting event ids via a sweep, so hasConflict / getEventState
  // are O(1) instead of O(N) per call. Sort by start; two events conflict iff
  // their intervals overlap, i.e. max(startA, startB) < min(endA, endB).
  const conflictIds = new Set<string>()
  const timedSorted = visibleEvents.filter((e) => !e.allDay).sort((a, b) => a.start.compare(b.start))
  // Active = events we've opened but not yet passed their end, sorted by end asc.
  let active: SchedulerEvent[] = []
  for (const e of timedSorted) {
    active = active.filter((a) => a.end.compare(e.start) > 0)
    if (active.length > 0) {
      conflictIds.add(e.id)
      for (const a of active) conflictIds.add(a.id)
    }
    active.push(e)
  }

  const locale = prop("locale")
  const timeZone = prop("timeZone") ?? getLocalTimeZone()
  const weekStartDay = prop("weekStartDay")
  const dayStartHour = prop("dayStartHour")
  const dayEndHour = prop("dayEndHour")
  const dir = (prop("dir") ?? "ltr") as "ltr" | "rtl"

  const today = getTodayDate(timeZone, visibleRange.start.calendar)

  // Enumerate inclusive dates in the visible range.
  const visibleDays: DateValue[] = []
  {
    let cur = visibleRange.start
    while (cur.compare(visibleRange.end) <= 0) {
      visibleDays.push(cur)
      cur = cur.add({ days: 1 })
    }
  }

  // 7 localized weekday headers ordered by the week's start day.
  const weekDaysRaw = getWeekDays(visibleRange.start, weekStartDay, timeZone, locale) as unknown as Array<{
    value: DateValue
    short: string
    long: string
    narrow: string
  }>
  const weekDays: WeekDay[] = weekDaysRaw.map((w) => ({
    value: w.value,
    short: w.short,
    long: w.long,
    narrow: w.narrow,
  }))

  const hourFormatter = new Intl.DateTimeFormat(locale, { timeZone, hour: "numeric", minute: "2-digit" })
  const hourSpan = dayEndHour - dayStartHour
  const hourRefDate = toCalendarDateTime(visibleRange.start)
  const hourRange: HourRange = {
    start: dayStartHour,
    end: dayEndHour,
    hours: Array.from({ length: hourSpan + 1 }, (_, i) => {
      const value = dayStartHour + i
      const labelDate = hourRefDate.set({ hour: Math.min(value, 23), minute: 0 })
      const percent = hourSpan === 0 ? 0 : i / hourSpan
      return {
        value,
        label: hourFormatter.format(labelDate.toDate(timeZone)),
        percent,
        style: { top: `${percent * 100}%` },
      }
    }),
  }

  const rangeFormatter = new Intl.DateTimeFormat(locale, { timeZone, month: "short", day: "numeric", year: "numeric" })
  const startText = rangeFormatter.format(visibleRange.start.toDate(timeZone))
  const endText = rangeFormatter.format(visibleRange.end.toDate(timeZone))
  const visibleRangeText: VisibleRangeText = {
    start: startText,
    end: endText,
    formatted: startText === endText ? startText : `${startText} – ${endText}`,
  }

  const totalDayMinutes = (dayEndHour - dayStartHour) * 60
  const timePercent = (d: DateValue): number => {
    const dt = d as CalendarDateTime
    const h = dt.hour ?? 0
    const m = dt.minute ?? 0
    const mins = (h - dayStartHour) * 60 + m
    if (mins <= 0) return 0
    if (mins >= totalDayMinutes) return 1
    return mins / totalDayMinutes
  }

  const monthFormatter = new Intl.DateTimeFormat(locale, { timeZone, month: "long" })
  const getMonthName = (d: DateValue) => monthFormatter.format(d.toDate(timeZone))
  const monthNames = Array.from({ length: 12 }, (_, i) =>
    monthFormatter.format(date.set({ month: i + 1 }).toDate(timeZone)),
  )

  const todayKey = toCalendarDate(today).toString()
  const sameDay = (a: DateValue, b: DateValue) => toCalendarDate(a).compare(toCalendarDate(b)) === 0
  const isTodayDate = (d: DateValue) => toCalendarDate(d).toString() === todayKey
  const isWeekendDate = (d: DateValue) => {
    // JS Date dow: 0 = Sun, 6 = Sat
    const dow = new Date(d.year, d.month - 1, d.day).getDay()
    return dow === 0 || dow === 6
  }

  const weekStartDayName = toDayOfWeekToken(weekStartDay)

  const getMonthGrid = (ref: DateValue = date): MonthGridDay[][] => {
    const monthStart = startOfMonth(ref)
    const monthEnd = endOfMonth(ref)
    const gridStart = startOfWeek(monthStart, locale, weekStartDayName)
    const gridEnd = endOfWeek(monthEnd, locale, weekStartDayName)
    const weeks: MonthGridDay[][] = []
    let cur: DateValue = gridStart
    while (cur.compare(gridEnd) <= 0) {
      const week: MonthGridDay[] = []
      for (let i = 0; i < 7; i++) {
        week.push({
          date: cur,
          inMonth: cur.month === ref.month && cur.year === ref.year,
          isToday: isTodayDate(cur),
          isWeekend: isWeekendDate(cur),
        })
        cur = cur.add({ days: 1 })
      }
      weeks.push(week)
    }
    return weeks
  }

  return {
    view,
    date,
    today,
    visibleRange,
    visibleRangeText,
    visibleDays,
    weekDays,
    hourRange,
    dir,
    events,
    isDragging,
    isSlotSelecting,
    isResizing,

    setView(v: ViewType) {
      send({ type: "SET_VIEW", view: v })
    },
    setDate(d) {
      send({ type: "SET_DATE", date: d })
    },
    goToToday() {
      send({ type: "GO_TO_TODAY" })
    },
    goToNext() {
      send({ type: "GO_TO_NEXT" })
    },
    goToPrev() {
      send({ type: "GO_TO_PREV" })
    },

    getEventById(id) {
      return eventsById.get(id)
    },

    getTimePercent(d) {
      return timePercent(d)
    },

    getMonthName(d) {
      return getMonthName(d)
    },
    monthNames,
    getMonthGrid(d) {
      return getMonthGrid(d ?? date)
    },

    getEventStyle(event) {
      const pos = this.getEventPosition(event)
      return {
        position: "absolute",
        top: `${pos.top * 100}%`,
        height: `${pos.height * 100}%`,
        insetInlineStart: `${pos.left * 100}%`,
        insetInlineEnd: `${(1 - pos.left - pos.width) * 100}%`,
        "--event-color": event.color,
      } as EventStyle
    },

    getDragGhost({ date: d }) {
      if (!liveDrag) return null
      if (toCalendarDate(liveDrag.start).toString() !== toCalendarDate(d).toString()) return null
      const evt = eventsById.get(liveDrag.eventId)
      if (!evt) return null
      const topPct = timePercent(liveDrag.start) * 100
      const heightPct = (timePercent(liveDrag.end) - timePercent(liveDrag.start)) * 100
      return {
        event: evt,
        style: {
          position: "absolute",
          top: `${topPct}%`,
          height: `${heightPct}%`,
          insetInlineStart: "2px",
          insetInlineEnd: "2px",
          "--event-color": evt.color,
        } as EventStyle,
      }
    },

    getDragOrigin({ date: d }) {
      const origin = (() => {
        if (!(isDragging || isResizing) || !dragEventId) return null
        const snap = refs.get("dragStartSnapshot")
        if (!snap) return null
        return { eventId: dragEventId, start: snap.start, end: snap.end }
      })()
      if (!origin) return null
      if (toCalendarDate(origin.start).toString() !== toCalendarDate(d).toString()) return null
      const evt = eventsById.get(origin.eventId)
      if (!evt) return null
      const topPct = timePercent(origin.start) * 100
      const heightPct = (timePercent(origin.end) - timePercent(origin.start)) * 100
      return {
        event: evt,
        style: {
          position: "absolute",
          top: `${topPct}%`,
          height: `${heightPct}%`,
          insetInlineStart: "2px",
          insetInlineEnd: "2px",
          "--event-color": evt.color,
        } as EventStyle,
      }
    },

    getEventState(id) {
      const draggingThis = isDragging && dragEventId === id
      const resizingThis = isResizing && dragEventId === id
      const focused = focusedEventId === id
      const selected = selectedEventId === id
      const conflict = conflictIds.has(id)
      return { dragging: draggingThis, resizing: resizingThis, focused, selected, conflict }
    },

    getEventPosition(event) {
      const basePos = eventPositions.get(event.id) ?? {
        top: 0,
        height: 0,
        left: 0,
        width: 1,
        column: 0,
        totalColumns: 1,
      }

      // Live resize: reflect current drag bounds on the actual event (not a ghost).
      // Safe because resize doesn't change day or left/width — only top/height.
      if (isResizing && dragEventId === event.id) {
        const dragStart = (liveDrag?.start ?? refs.get("dragCurrentStart")) as DateValue | null
        const dragEnd = (liveDrag?.end ?? refs.get("dragCurrentEnd")) as DateValue | null
        if (dragStart && dragEnd) {
          const dayStartHour = prop("dayStartHour")
          const dayEndHour = prop("dayEndHour")
          const totalMinutes = (dayEndHour - dayStartHour) * 60
          const sh = (dragStart as CalendarDateTime).hour ?? 0
          const sm = (dragStart as CalendarDateTime).minute ?? 0
          const eh = (dragEnd as CalendarDateTime).hour ?? 0
          const em = (dragEnd as CalendarDateTime).minute ?? 0
          const startMins = Math.max(0, (sh - dayStartHour) * 60 + sm)
          const endMins = Math.min(totalMinutes, (eh - dayStartHour) * 60 + em)
          return {
            ...basePos,
            top: startMins / totalMinutes,
            height: Math.max(0.005, (endMins - startMins) / totalMinutes),
          }
        }
      }

      return basePos
    },

    dragPreview:
      (isDragging || isResizing) && dragEventId
        ? {
            eventId: dragEventId,
            start: liveDrag?.start ?? refs.get("dragCurrentStart"),
            end: liveDrag?.end ?? refs.get("dragCurrentEnd"),
          }
        : null,

    dragOrigin: (() => {
      if (!(isDragging || isResizing) || !dragEventId) return null
      const snap = refs.get("dragStartSnapshot")
      if (!snap) return null
      return { eventId: dragEventId, start: snap.start, end: snap.end }
    })(),

    getEventsForDay(d) {
      // O(1): hit the prebuilt per-day bucket.
      return eventsByDayKey.get(toCalendarDate(d).toString()) ?? []
    },

    getEventsForSlot(start, end) {
      // Slot windows are narrow (minutes) — filter the bucket of the start
      // day rather than scanning every event. O(K) where K = events in that day.
      const bucket = eventsByDayKey.get(toCalendarDate(start).toString()) ?? []
      return bucket.filter((e) => rangesOverlap(e.start, e.end, start, end))
    },

    hasConflict(event) {
      // O(1): conflict set was precomputed by the sweep.
      return conflictIds.has(event.id)
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs(scope.id),
        id: dom.getRootId(scope),
        tabIndex: 0,
        dir,
        "data-view": view,
        "data-dir": dir,
        // Root-level flags so descendants (events, columns) can dim / disable
        // pointer-events while any gesture is active — the Mantine pattern.
        "data-dragging": dataAttr(isDragging),
        "data-resizing": dataAttr(isResizing),
        "data-slot-selecting": dataAttr(isSlotSelecting),
        style: {
          // Expose layout-critical counts so children can lay themselves out via
          // CSS (grid-template-columns) without plumbing JS. Consumers can still
          // override the gutter width or hour-row height via matching vars.
          ["--scheduler-visible-days" as any]: visibleDays.length,
          ["--scheduler-day-count" as any]: visibleDays.length,
          ["--scheduler-hour-count" as any]: hourRange.end - hourRange.start,
        },
        onKeyDown(e) {
          if (e.defaultPrevented) return
          const target = e.target as HTMLElement
          if (target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) return
          const key = getEventKey(e)
          switch (key) {
            case "Escape":
              send({ type: "ESCAPE" })
              return
            case "t":
            case "T":
              send({ type: "GO_TO_TODAY" })
              e.preventDefault()
              return
            case "d":
            case "D":
              send({ type: "SET_VIEW", view: "day" })
              e.preventDefault()
              return
            case "w":
            case "W":
              send({ type: "SET_VIEW", view: "week" })
              e.preventDefault()
              return
            case "m":
            case "M":
              send({ type: "SET_VIEW", view: "month" })
              e.preventDefault()
              return
            case "y":
            case "Y":
              send({ type: "SET_VIEW", view: "year" })
              e.preventDefault()
              return
          }
        },
      })
    },

    getHeaderProps() {
      return normalize.element({
        ...parts.header.attrs(scope.id),
      })
    },

    getHeaderTitleProps() {
      return normalize.element({
        ...parts.headerTitle.attrs(scope.id),
        "aria-live": "polite",
      })
    },

    getPrevTriggerProps() {
      return normalize.button({
        ...parts.prevTrigger.attrs(scope.id),
        type: "button",
        "aria-label": t.prevTriggerLabel,
        onClick() {
          send({ type: "GO_TO_PREV" })
        },
      })
    },

    getNextTriggerProps() {
      return normalize.button({
        ...parts.nextTrigger.attrs(scope.id),
        type: "button",
        "aria-label": t.nextTriggerLabel,
        onClick() {
          send({ type: "GO_TO_NEXT" })
        },
      })
    },

    getTodayTriggerProps() {
      return normalize.button({
        ...parts.todayTrigger.attrs(scope.id),
        type: "button",
        "aria-label": t.todayTriggerLabel,
        onClick() {
          send({ type: "GO_TO_TODAY" })
        },
      })
    },

    getViewSelectProps() {
      return normalize.element({
        ...parts.viewSelect.attrs(scope.id),
        role: "toolbar",
        "aria-label": "Calendar view",
      })
    },

    getViewItemProps(props: ViewItemProps) {
      const isActive = view === props.view
      return normalize.button({
        ...parts.viewSelect.attrs(scope.id),
        type: "button",
        "aria-pressed": isActive,
        "data-active": dataAttr(isActive),
        "data-view": props.view,
        onClick() {
          send({ type: "SET_VIEW", view: props.view })
        },
      })
    },

    getGridProps() {
      return normalize.element({
        ...parts.grid.attrs(scope.id),
        id: dom.getGridId(scope),
        role: "grid",
        "data-view": view,
      })
    },

    getAllDayRowProps() {
      return normalize.element({
        ...parts.allDayRow.attrs(scope.id),
        role: "row",
      })
    },

    getTimeGutterProps() {
      return normalize.element({
        ...parts.timeGutter.attrs(scope.id),
        "aria-hidden": "true",
      })
    },

    getTimeSlotProps(props: TimeSlotProps) {
      const key = `${props.start.toString()}:${props.end.toString()}`
      return normalize.element({
        ...parts.timeSlot.attrs(scope.id),
        id: dom.getTimeSlotId(scope, key),
        role: "gridcell",
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          const point = getEventPoint(event)
          send({ type: "SLOT_POINTER_DOWN", start: props.start, end: props.end, point })
        },
      })
    },

    getDayColumnProps(props: DayColumnProps) {
      const key = props.date.toString()
      // When a drag preview resolves to this day, mark the column as the
      // drop target so consumers can light it up (Mantine-style).
      const isDropTarget = !!liveDrag && liveDrag.kind === "drag" && toCalendarDate(liveDrag.start).toString() === key
      return normalize.element({
        ...parts.dayColumn.attrs(scope.id),
        id: dom.getDayColumnId(scope, key),
        role: "gridcell",
        "data-date": key,
        "data-drop-target": dataAttr(isDropTarget),
      })
    },

    getDayCellProps(props: DayCellProps) {
      const { date: d, referenceDate = date } = props
      const key = d.toString()
      const outside = d.month !== referenceDate.month || d.year !== referenceDate.year
      const todayCell = isTodayDate(d)
      const weekend = isWeekendDate(d)
      const selected = !!context.get("selectedSlot") && sameDay(d, context.get("selectedSlot")!.start)
      return normalize.element({
        ...parts.dayCell.attrs(scope.id),
        id: dom.getDayCellId(scope, key),
        role: "gridcell",
        "data-date": key,
        "data-today": dataAttr(todayCell),
        "data-outside": dataAttr(outside),
        "data-weekend": dataAttr(weekend),
        "data-selected": dataAttr(selected),
        "aria-current": todayCell ? "date" : undefined,
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          const point = getEventPoint(event)
          const start = d
          const end = d.add({ days: 1 })
          send({ type: "SLOT_POINTER_DOWN", start, end, point })
        },
      })
    },

    getEventProps(props: EventProps) {
      const { event } = props
      const evtState = this.getEventState(event.id)
      return normalize.element({
        ...parts.event.attrs(scope.id),
        id: dom.getEventId(scope, event.id),
        role: "button",
        tabIndex: 0,
        "data-event-id": event.id,
        "data-dragging": dataAttr(evtState.dragging),
        "data-resizing": dataAttr(evtState.resizing),
        "data-focused": dataAttr(evtState.focused),
        "data-selected": dataAttr(evtState.selected),
        "data-conflict": dataAttr(evtState.conflict),
        "data-disabled": dataAttr(!!event.disabled),
        "data-all-day": dataAttr(!!event.allDay),
        style: event.allDay ? undefined : this.getEventStyle(event),
        onClick(e) {
          e.stopPropagation()
          send({ type: "EVENT_CLICK", eventId: event.id })
        },
        onFocus() {
          send({ type: "EVENT_FOCUS", eventId: event.id })
        },
        onBlur() {
          send({ type: "EVENT_BLUR", eventId: event.id })
        },
        onPointerDown(e) {
          if (!isLeftClick(e) || event.disabled) return
          e.stopPropagation()
          const point = getEventPoint(e)
          send({ type: "EVENT_POINTER_DOWN", eventId: event.id, point })
        },
        onKeyDown(e) {
          const keyMap: EventKeyMap = {
            Enter() {
              send({ type: "EVENT_CLICK", eventId: event.id })
            },
            Space() {
              send({ type: "EVENT_CLICK", eventId: event.id })
            },
            Escape() {
              send({ type: "ESCAPE" })
            },
          }
          const exec = keyMap[getEventKey(e)]
          if (exec) {
            e.preventDefault()
            exec(e)
          }
        },
      })
    },

    getEventResizeHandleProps(props: EventResizeHandleProps) {
      const { event, edge } = props
      return normalize.element({
        ...parts.eventResizeHandle.attrs(scope.id),
        "data-edge": edge,
        "aria-hidden": "true",
        onPointerDown(e) {
          if (!isLeftClick(e) || event.disabled) return
          e.stopPropagation()
          const point = getEventPoint(e)
          send({ type: "RESIZE_HANDLE_POINTER_DOWN", eventId: event.id, edge, point })
        },
      })
    },

    getCurrentTimeIndicatorProps() {
      const currentTime = now(prop("timeZone") ?? getLocalTimeZone())
      const dayStart = prop("dayStartHour")
      const dayEnd = prop("dayEndHour")
      const hour = currentTime.hour
      const inRange = hour >= dayStart && hour < dayEnd
      const percent = getTimePercent(currentTime, dayStart, dayEnd)
      return normalize.element({
        ...parts.currentTimeIndicator.attrs(scope.id),
        "aria-hidden": "true",
        role: "presentation",
        "data-hidden": dataAttr(!inRange),
        hidden: !inRange || !prop("showCurrentTime") ? true : undefined,
        style: {
          position: "absolute",
          insetInlineStart: "0",
          insetInlineEnd: "0",
          top: `${percent * 100}%`,
        },
      })
    },

    getMoreEventsProps(props: MoreEventsProps) {
      return normalize.button({
        ...parts.moreEvents.attrs(scope.id),
        type: "button",
        "data-date": props.date.toString(),
        "data-count": props.count,
      })
    },
  }
}
