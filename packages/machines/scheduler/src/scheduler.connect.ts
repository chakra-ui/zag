import type { Service } from "@zag-js/core"
import { dataAttr, getEventKey, getEventPoint, isLeftClick } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./scheduler.anatomy"
import * as dom from "./scheduler.dom"
import type {
  AgendaGroupProps,
  DayCellProps,
  DayColumnProps,
  EventProps,
  EventResizeHandleProps,
  HourEntryProps,
  HourRange,
  MoreEventsProps,
  SchedulerApi,
  SchedulerEvent,
  SchedulerPayload,
  SchedulerSchema,
  TimeSlotProps,
  ViewItemProps,
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
import { getDurationMinutes } from "./scheduler.utils"
import { expandRecurringEvents } from "./utils/rrule"

export function connect<T extends PropTypes, E extends SchedulerPayload = SchedulerPayload>(
  service: Service<SchedulerSchema<E>>,
  normalize: NormalizeProps<T>,
): SchedulerApi<T, E> {
  const { state, send, context, prop, computed, scope, refs } = service

  const view = context.get("view")
  const date = context.get("date")
  const visibleRange = computed("visibleRange")

  const focusedEventId = context.get("focusedEventId")
  const selectedEventId = context.get("selectedEventId")

  const liveDrag = context.get("liveDrag")
  const dragEventId = liveDrag?.eventId

  const isDragging = state.matches("event-dragging")
  const isSlotSelecting = state.matches("slot-selecting")
  const isResizing = state.matches("event-resizing")

  const rawEvents = prop("events") ?? []
  const events = expandRecurringEvents({
    events: rawEvents,
    range: visibleRange,
    limit: prop("maxRecurrenceInstances"),
    expander: prop("expandRecurrence"),
  })
  const translations = prop("translations")

  const defaultTranslations = {
    prevTriggerLabel: "Previous",
    nextTriggerLabel: "Next",
    todayTriggerLabel: "Today",
    viewLabels: { day: "Day", week: "Week", month: "Month", year: "Year", agenda: "Agenda" },
  }
  const t = { ...defaultTranslations, ...translations }

  // visibleRange.end is midnight, so extend by a day for the overlap check.
  const rangeFilterEnd = visibleRange.end.add({ days: 1 })
  const visibleEvents = events.filter((e) => rangesOverlap(e.start, e.end, visibleRange.start, rangeFilterEnd))

  const eventPositions = computeEventLayout(visibleEvents, prop("dayStartHour"), prop("dayEndHour"))

  const eventsById = new Map<string, SchedulerEvent<E>>()
  for (const e of events) eventsById.set(e.id, e)

  const eventsByDayKey = new Map<string, SchedulerEvent<E>[]>()
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

  const conflictIds = new Set<string>()
  const timedSorted = visibleEvents.filter((e) => !e.allDay).sort((a, b) => a.start.compare(b.start))
  let active: SchedulerEvent<E>[] = []
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
  const startOfWeekProp = prop("startOfWeek")
  const dayStartHour = prop("dayStartHour")
  const dayEndHour = prop("dayEndHour")
  const dir = (prop("dir") ?? "ltr") as "ltr" | "rtl"

  const today = getTodayDate(timeZone, visibleRange.start.calendar)

  let visibleDays: DateValue[] = []
  {
    let cur = visibleRange.start
    while (cur.compare(visibleRange.end) <= 0) {
      visibleDays.push(cur)
      cur = cur.add({ days: 1 })
    }
  }

  const workWeekDays = prop("workWeekDays")
  if (prop("workWeekOnly") && view === "week" && workWeekDays.length > 0 && workWeekDays.length < 7) {
    const allowed = new Set(workWeekDays)
    visibleDays = visibleDays.filter((d) => allowed.has(new Date(d.year, d.month - 1, d.day).getDay()))
  }

  const weekDaysRaw = getWeekDays(visibleRange.start, startOfWeekProp, timeZone, locale) as unknown as Array<{
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
  const pctBounds = (start: DateValue, end: DateValue) => ({
    top: `${timePercent(start) * 100}%`,
    height: `${(timePercent(end) - timePercent(start)) * 100}%`,
  })

  const timeFormatter = new Intl.DateTimeFormat(locale, { timeZone, hour: "numeric", minute: "2-digit" })
  const longDateFormatter = new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
  })
  const weekDayFormatters = computed("weekDayFormatters")
  const toJsDate = (d: DateValue): Date => toCalendarDateTime(d).toDate(timeZone)
  const formatTime = (d: DateValue): string => timeFormatter.format(toJsDate(d))
  const formatTimeRange = (s: DateValue, e: DateValue): string => `${formatTime(s)} – ${formatTime(e)}`
  const formatLongDate = (d: DateValue): string => longDateFormatter.format(toJsDate(d))
  const formatWeekDay = (d: DateValue, style: "short" | "long" | "narrow" = "short"): string =>
    weekDayFormatters[style].format(toJsDate(d))
  const formatDuration = (s: DateValue, e: DateValue): string => {
    const diff = Math.max(0, getDurationMinutes(s, e))
    const h = Math.floor(diff / 60)
    const m = diff % 60
    if (h && m) return `${h}h ${m}m`
    if (h) return `${h}h`
    return `${m}m`
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
    const dow = new Date(d.year, d.month - 1, d.day).getDay()
    return dow === 0 || dow === 6
  }

  const startOfWeekToken = toDayOfWeekToken(startOfWeekProp)

  const getMonthGrid = (ref: DateValue = date): MonthGridDay[][] => {
    const monthStart = startOfMonth(ref)
    const monthEnd = endOfMonth(ref)
    const gridStart = startOfWeek(monthStart, locale, startOfWeekToken)
    const gridEnd = endOfWeek(monthEnd, locale, startOfWeekToken)
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

  const agendaGroups: { date: DateValue; events: SchedulerEvent<E>[] }[] = []
  {
    const byKey = new Map<string, { date: DateValue; events: SchedulerEvent<E>[] }>()
    const sorted = [...visibleEvents].sort((a, b) => a.start.compare(b.start))
    for (const e of sorted) {
      const cal = toCalendarDate(e.start)
      const key = cal.toString()
      const bucket = byKey.get(key)
      if (bucket) bucket.events.push(e)
      else byKey.set(key, { date: cal, events: [e] })
    }
    for (const g of byKey.values()) agendaGroups.push(g)
    agendaGroups.sort((a, b) => a.date.compare(b.date))
  }

  const dragState: SchedulerApi<T, E>["dragState"] = (() => {
    if (!(isDragging || isResizing) || !dragEventId) return null
    const evt = eventsById.get(dragEventId)
    if (!evt) return null
    const snap = refs.get("dragStartSnapshot")
    if (!snap) return null
    const curStart = liveDrag?.start ?? snap.start
    const curEnd = liveDrag?.end ?? snap.end
    return {
      kind: isResizing ? "resize" : "drag",
      event: evt,
      start: curStart,
      end: curEnd,
      origin: { start: snap.start, end: snap.end },
    }
  })()

  const selectedSlot = context.get("selectedSlot")
  const liveSlot = context.get("liveSlot")
  // The slot highlight tracks the live selection during drag and persists
  // as selectedSlot after release until cleared. Single overlay, dual source.
  const activeSlot = liveSlot ?? selectedSlot

  return {
    view,
    date,
    today,
    visibleRange,
    visibleRangeText,
    visibleDays,
    formatTime,
    formatTimeRange,
    formatLongDate,
    formatDuration,
    formatWeekDay,
    weekDays,
    hourRange,
    dir,
    events,
    visibleEvents,
    agendaGroups,
    isDragging,
    isSlotSelecting,
    isResizing,

    setView(view) {
      send({ type: "SET_VIEW", view })
    },
    setDate(date) {
      send({ type: "SET_DATE", date })
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
    clearSelectedSlot() {
      context.set("selectedSlot", null)
    },

    selectedSlot,
    dragState,

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

    getDragPreviewProps({ date: d }) {
      const active = !!dragState && sameDay(dragState.start, d)
      return normalize.element({
        ...parts.dragGhost.attrs(scope.id),
        hidden: !active,
        style: {
          position: "absolute",
          top: "var(--scheduler-drag-preview-top)",
          height: "var(--scheduler-drag-preview-height)",
          "--event-color": dragState?.event.color,
        },
      })
    },

    getDragOriginProps({ date: d }) {
      const active = !!dragState && sameDay(dragState.origin.start, d)
      return normalize.element({
        ...parts.dragOrigin.attrs(scope.id),
        hidden: !active,
        style: {
          position: "absolute",
          top: "var(--scheduler-drag-origin-top)",
          height: "var(--scheduler-drag-origin-height)",
          "--event-color": dragState?.event.color,
        },
      })
    },

    getSelectedSlotProps({ date: d }) {
      const active = !!activeSlot && sameDay(activeSlot.start, d)
      return normalize.element({
        ...parts.slotHighlight.attrs(scope.id),
        hidden: !active,
        "data-active": dataAttr(active),
        "data-pending": dataAttr(!!liveSlot),
        style: {
          position: "absolute",
          top: "var(--scheduler-slot-top)",
          height: "var(--scheduler-slot-height)",
        },
      })
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

      if (isResizing && dragEventId === event.id) {
        const dragStart = liveDrag?.start ?? null
        const dragEnd = liveDrag?.end ?? null
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

    getEventsForDay(d) {
      return eventsByDayKey.get(toCalendarDate(d).toString()) ?? []
    },

    getEventsForSlot(start, end) {
      const bucket = eventsByDayKey.get(toCalendarDate(start).toString()) ?? []
      return bucket.filter((e) => rangesOverlap(e.start, e.end, start, end))
    },

    hasConflict(event) {
      return conflictIds.has(event.id)
    },

    getEventEl(id) {
      return dom.getEventEl(scope, id)
    },

    getSelectedSlotEl() {
      return scope.query(`${scope.selector(parts.slotHighlight)}[data-active]`)
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs(scope.id),
        id: dom.getRootId(scope),
        tabIndex: 0,
        dir,
        "data-view": view,
        "data-dir": dir,
        "data-dragging": dataAttr(isDragging),
        "data-resizing": dataAttr(isResizing),
        "data-slot-selecting": dataAttr(isSlotSelecting),
        style: {
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
        ...parts.viewItem.attrs(scope.id),
        type: "button",
        "aria-pressed": isActive,
        "data-active": dataAttr(isActive),
        "data-view": props.view,
        onClick() {
          send({ type: "SET_VIEW", view: props.view })
        },
      })
    },

    getColumnHeadersProps() {
      return normalize.element({
        ...parts.columnHeaders.attrs(scope.id),
        role: "row",
      })
    },

    getColumnHeaderProps(props: DayColumnProps) {
      const { date: d } = props
      return normalize.element({
        ...parts.columnHeader.attrs(scope.id),
        role: "columnheader",
        "data-date": d.toString(),
        "data-today": dataAttr(isTodayDate(d)),
        "data-weekend": dataAttr(isWeekendDate(d)),
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

    getAllDayLabelProps() {
      return normalize.element({
        ...parts.allDayLabel.attrs(scope.id),
        "aria-hidden": "true",
      })
    },

    getTimeGutterProps() {
      return normalize.element({
        ...parts.timeGutter.attrs(scope.id),
        "aria-hidden": "true",
      })
    },

    getHourLabelProps(props: HourEntryProps) {
      return normalize.element({
        ...parts.hourLabel.attrs(scope.id),
        "data-hour": props.hour.value,
        style: { top: `${props.hour.percent * 100}%` },
      })
    },

    getHourLineProps(props: HourEntryProps) {
      return normalize.element({
        ...parts.hourLine.attrs(scope.id),
        "aria-hidden": "true",
        "data-hour": props.hour.value,
        style: { top: `${props.hour.percent * 100}%` },
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

    getDayColumnState({ date: d }) {
      return {
        isToday: isTodayDate(d),
        isWeekend: isWeekendDate(d),
        isDropTarget: !!liveDrag && liveDrag.kind === "drag" && sameDay(liveDrag.start, d),
        isDragPreviewDay: !!dragState && sameDay(dragState.start, d),
        isDragOriginDay: !!dragState && sameDay(dragState.origin.start, d),
        isSelectedSlotDay: !!activeSlot && sameDay(activeSlot.start, d),
      }
    },

    getDayColumnProps(props: DayColumnProps) {
      const { date: d } = props
      const key = d.toString()
      const dayState = this.getDayColumnState({ date: d })
      const slotMinutes = prop("slotInterval")
      const slotFromClientY = (currentTarget: HTMLElement, clientY: number) => {
        const rect = currentTarget.getBoundingClientRect()
        const relY = Math.max(0, Math.min(clientY - rect.top, rect.height - 1))
        const totalMinutes = (dayEndHour - dayStartHour) * 60
        const raw = (relY / rect.height) * totalMinutes
        const snapped = Math.round(raw / slotMinutes) * slotMinutes
        const start = toCalendarDateTime(d).set({
          hour: Math.min(dayStartHour + Math.floor(snapped / 60), dayEndHour - 1),
          minute: snapped % 60,
        })
        return { start, end: start.add({ minutes: slotMinutes }) }
      }

      const overlayVars: Record<string, string> = {}
      if (dayState.isDragPreviewDay) {
        const b = pctBounds(dragState!.start, dragState!.end)
        overlayVars["--scheduler-drag-preview-top"] = b.top
        overlayVars["--scheduler-drag-preview-height"] = b.height
      }
      if (dayState.isDragOriginDay) {
        const b = pctBounds(dragState!.origin.start, dragState!.origin.end)
        overlayVars["--scheduler-drag-origin-top"] = b.top
        overlayVars["--scheduler-drag-origin-height"] = b.height
      }
      if (dayState.isSelectedSlotDay) {
        const b = pctBounds(activeSlot!.start, activeSlot!.end)
        overlayVars["--scheduler-slot-top"] = b.top
        overlayVars["--scheduler-slot-height"] = b.height
      }

      return normalize.element({
        ...parts.dayColumn.attrs(scope.id),
        id: dom.getDayColumnId(scope, key),
        role: "gridcell",
        "data-date": key,
        "data-drop-target": dataAttr(dayState.isDropTarget),
        style: overlayVars,
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          if ((event.target as HTMLElement).closest("[data-scheduler-event]")) return
          const { start, end } = slotFromClientY(event.currentTarget as HTMLElement, event.clientY)
          send({ type: "SLOT_POINTER_DOWN", start, end, point: getEventPoint(event) })
        },
        onDoubleClick(event) {
          if ((event.target as HTMLElement).closest("[data-scheduler-event]")) return
          const { start, end } = slotFromClientY(event.currentTarget as HTMLElement, event.clientY)
          prop("onSlotDoubleClick")?.({ start, end, allDay: false })
        },
      })
    },

    getDayCellProps(props: DayCellProps) {
      const { date: d, referenceDate = date, allDay = false } = props
      const key = d.toString()
      const outside = !allDay && (d.month !== referenceDate.month || d.year !== referenceDate.year)
      const todayCell = isTodayDate(d)
      const weekend = isWeekendDate(d)
      const selected = !!context.get("selectedSlot") && sameDay(d, context.get("selectedSlot")!.start)
      const start = d
      const end = d.add({ days: 1 })
      return normalize.element({
        ...parts.dayCell.attrs(scope.id),
        id: dom.getDayCellId(scope, key),
        role: "gridcell",
        "data-date": key,
        "data-today": dataAttr(todayCell),
        "data-outside": dataAttr(outside),
        "data-weekend": dataAttr(weekend),
        "data-selected": dataAttr(selected),
        "data-all-day": dataAttr(allDay),
        "aria-current": todayCell ? "date" : undefined,
        onClick(event) {
          if (!isLeftClick(event)) return
          context.set("selectedSlot", { start, end })
          prop("onSlotSelect")?.({ start, end, allDay: true, action: "click" })
        },
        onDoubleClick() {
          prop("onSlotDoubleClick")?.({ start, end, allDay: true })
        },
      })
    },

    getEventProps(props: EventProps<E>) {
      const { event } = props
      const evtState = this.getEventState(event.id)
      const pos = event.allDay ? null : this.getEventPosition(event)
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
        style: pos
          ? {
              position: "absolute",
              top: `${pos.top * 100}%`,
              height: `${pos.height * 100}%`,
              insetInlineStart: `${pos.left * 100}%`,
              insetInlineEnd: `${(1 - pos.left - pos.width) * 100}%`,
              "--event-color": event.color,
            }
          : { "--event-color": event.color },
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

    getEventResizeHandleProps(props: EventResizeHandleProps<E>) {
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

    getCurrentTimeIndicatorProps({ date: d }) {
      const currentTime = now(prop("timeZone") ?? getLocalTimeZone())
      const dayStart = prop("dayStartHour")
      const dayEnd = prop("dayEndHour")
      const hour = currentTime.hour
      const isToday = sameDay(currentTime, d)
      const inRange = isToday && hour >= dayStart && hour < dayEnd
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

    getAgendaGroupProps(props: AgendaGroupProps) {
      return normalize.element({
        ...parts.agendaGroup.attrs(scope.id),
        "data-date": props.date.toString(),
      })
    },

    getAgendaGroupTitleProps(props: AgendaGroupProps) {
      return normalize.element({
        ...parts.agendaGroupTitle.attrs(scope.id),
        "data-date": props.date.toString(),
      })
    },
  }
}
