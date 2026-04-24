import {
  isSameDay,
  isToday,
  isWeekend,
  now,
  startOfMonth,
  toCalendarDate,
  toCalendarDateTime,
  type CalendarDateTime,
  type DateValue,
} from "@internationalized/date"
import type { Service } from "@zag-js/core"
import { getMonthDays, getMonthNames, getTodayDate, getWeekDays } from "@zag-js/date-utils"
import {
  dataAttr,
  getEventKey,
  getEventPoint,
  getEventTarget,
  isComposingEvent,
  isEditableElement,
  isLeftClick,
} from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./scheduler.anatomy"
import * as dom from "./scheduler.dom"
import type {
  DayColumnProps,
  SchedulerApi,
  SchedulerPayload,
  SchedulerSchema,
  ViewItemProps,
  VisibleRangeText,
  WeekDay,
} from "./scheduler.types"
import { getDurationMinutes } from "./scheduler.utils"
import { getAgendaGroups, getEventConflicts, getEventLayout, getVisibleEvents, groupEventsByDay } from "./utils/layout"
import { expandRecurringEvents } from "./utils/rrule"
import { getTimePercent, rangesOverlap } from "./utils/time"

const defaultTranslations = {
  prevTriggerLabel: "Previous",
  nextTriggerLabel: "Next",
  todayTriggerLabel: "Today",
  viewLabels: { day: "Day", week: "Week", month: "Month", year: "Year", agenda: "Agenda" },
}

const FOCUS_DATE_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Enter", " "])

const getTimeRangeBounds = (start: DateValue, end: DateValue, dayStartHour: number, dayEndHour: number) => {
  const s = getTimePercent(start, dayStartHour, dayEndHour)
  const e = getTimePercent(end, dayStartHour, dayEndHour)
  return { top: `${s * 100}%`, height: `${(e - s) * 100}%` }
}

const formatDuration = (start: DateValue, end: DateValue): string => {
  const diff = Math.max(0, getDurationMinutes(start, end))
  const h = Math.floor(diff / 60)
  const m = diff % 60
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}

export function connect<T extends PropTypes, E extends SchedulerPayload = SchedulerPayload>(
  service: Service<SchedulerSchema<E>>,
  normalize: NormalizeProps<T>,
): SchedulerApi<T, E> {
  const { state, send, context, prop, computed, scope, refs } = service

  const view = context.get("view")
  const date = context.get("date")
  const visibleRange = computed("visibleRange")

  const focusedEventId = context.get("focusedEventId")
  const focusedDate = context.get("focusedDate")
  const selectedEventId = context.get("selectedEventId")

  const liveDrag = context.get("liveDrag")
  const dragEventId = liveDrag?.eventId

  const isDragging = state.matches("event-dragging")
  const isSelectingSlot = state.matches("slot-selecting")
  const isResizing = state.matches("event-resizing")

  const rawEvents = prop("events") ?? []
  const events = expandRecurringEvents({
    events: rawEvents,
    range: visibleRange,
    limit: prop("maxRecurrenceInstances"),
    expander: prop("expandRecurrence"),
  })
  const translations = prop("translations")
  const t = { ...defaultTranslations, ...translations }

  const visibleEvents = getVisibleEvents(events, visibleRange)

  const eventPositions = getEventLayout(visibleEvents, prop("dayStartHour"), prop("dayEndHour"))

  const eventsById = new Map(events.map((e) => [e.id, e]))
  const eventsByDayKey = groupEventsByDay(visibleEvents)
  const conflictIds = getEventConflicts(visibleEvents)

  const locale = prop("locale")
  const timeZone = prop("timeZone")
  const startOfWeekProp = prop("startOfWeek")
  const dayStartHour = prop("dayStartHour")
  const dayEndHour = prop("dayEndHour")
  const dir = prop("dir")

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

  const weekDays = getWeekDays(visibleRange.start, startOfWeekProp, timeZone, locale) as WeekDay[]

  const formatters = computed("formatters")
  const dayCellLabels = computed("dayCellLabels")

  const hourRange = computed("hourRange")

  const startText = formatters.range.format(visibleRange.start.toDate(timeZone))
  const endText = formatters.range.format(visibleRange.end.toDate(timeZone))
  const visibleRangeText: VisibleRangeText = {
    start: startText,
    end: endText,
    formatted: startText === endText ? startText : `${startText} – ${endText}`,
  }

  const toJsDate = (d: DateValue): Date => toCalendarDateTime(d).toDate(timeZone)
  const monthNames = getMonthNames(locale, "long", date)

  const getDragState = (): SchedulerApi<T, E>["dragState"] => {
    if (!(isDragging || isResizing) || !dragEventId) return null

    const evt = eventsById.get(dragEventId)
    if (!evt) return null

    const snap = refs.get("dragStartSnapshot")
    if (!snap) return null

    return {
      kind: isResizing ? "resize" : "drag",
      event: evt,
      start: liveDrag?.start ?? snap.start,
      end: liveDrag?.end ?? snap.end,
      origin: snap,
    }
  }

  const dragState = getDragState()

  const selectedSlot = context.get("selectedSlot")
  const liveSlot = context.get("liveSlot")
  const activeSlot = liveSlot ?? selectedSlot

  return {
    view,
    date,
    today,
    visibleRange,
    visibleRangeText,
    visibleDays,
    formatTime(d) {
      return formatters.time.format(toJsDate(d))
    },
    formatTimeRange(s, e) {
      return `${formatters.time.format(toJsDate(s))} – ${formatters.time.format(toJsDate(e))}`
    },
    formatLongDate(d) {
      return formatters.longDate.format(toJsDate(d))
    },
    formatDuration,
    formatWeekDay(d, style = "short") {
      const key = style === "short" ? "weekDayShort" : style === "long" ? "weekDayLong" : "weekDayNarrow"
      return formatters[key].format(toJsDate(d))
    },
    weekDays,
    hourRange,
    events,
    visibleEvents,
    getAgendaGroups() {
      return getAgendaGroups(visibleEvents)
    },
    isDragging,
    isSelectingSlot,
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

    focusedDate,
    setFocusedDate(date) {
      send({ type: "FOCUS_DATE_SET", date })
    },
    clearFocusedDate() {
      send({ type: "FOCUS_DATE_CLEAR" })
    },

    getEventById(id) {
      return eventsById.get(id)
    },

    getTimePercent(date) {
      return getTimePercent(date, dayStartHour, dayEndHour)
    },

    getMonthName(d) {
      return formatters.month.format(d.toDate(timeZone))
    },
    monthNames,
    getMonthGrid(ref = date) {
      // Always 6 rows, matching Google/Apple Calendar. Short months fill with
      // next-month trailing days; styling dims them via `[data-outside]`.
      return getMonthDays(startOfMonth(ref), locale, 6, startOfWeekProp)
    },

    getDragPreviewProps({ date }) {
      const active = !!dragState && isSameDay(dragState.start, date)
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

    getDragOriginProps({ date }) {
      const active = !!dragState && isSameDay(dragState.origin.start, date)
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

    getSelectedSlotProps({ date }) {
      const active = !!activeSlot && isSameDay(activeSlot.start, date)
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

    getEventsForDay(date) {
      return eventsByDayKey.get(toCalendarDate(date).toString()) ?? []
    },

    getEventsForSlot(start, end) {
      const events = eventsByDayKey.get(toCalendarDate(start).toString()) ?? []
      return events.filter((e) => rangesOverlap(e.start, e.end, start, end))
    },

    hasConflict(event) {
      return conflictIds.has(event.id)
    },

    getEventEl(eventId) {
      return dom.getEventEl(scope, eventId)
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
        "data-dragging": dataAttr(isDragging),
        "data-resizing": dataAttr(isResizing),
        "data-selecting-slot": dataAttr(isSelectingSlot),
        style: {
          "--scheduler-visible-days": visibleDays.length,
          "--scheduler-day-count": visibleDays.length,
          "--scheduler-hour-count": hourRange.end - hourRange.start,
        },
        onKeyDown(e) {
          if (e.defaultPrevented) return
          if (isComposingEvent(e)) return
          if (isEditableElement(getEventTarget(e))) return
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
      const { date } = props
      return normalize.element({
        ...parts.columnHeader.attrs(scope.id),
        role: "columnheader",
        "data-date": date.toString(),
        "data-today": dataAttr(isToday(date, timeZone)),
        "data-weekend": dataAttr(isWeekend(date, locale)),
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

    getHourLabelProps(props) {
      return normalize.element({
        ...parts.hourLabel.attrs(scope.id),
        "data-hour": props.hour.value,
        style: { top: `${props.hour.percent * 100}%` },
      })
    },

    getHourLineProps(props) {
      return normalize.element({
        ...parts.hourLine.attrs(scope.id),
        "aria-hidden": "true",
        "data-hour": props.hour.value,
        style: { top: `${props.hour.percent * 100}%` },
      })
    },

    getTimeSlotProps(props) {
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

    getDayColumnState({ date }) {
      return {
        isToday: isToday(date, timeZone),
        isWeekend: isWeekend(date, locale),
        isDropTarget: !!liveDrag && liveDrag.kind === "drag" && isSameDay(liveDrag.start, date),
        isDragPreviewDay: !!dragState && isSameDay(dragState.start, date),
        isDragOriginDay: !!dragState && isSameDay(dragState.origin.start, date),
        isSelectedSlotDay: !!activeSlot && isSameDay(activeSlot.start, date),
      }
    },

    getDayColumnProps(props) {
      const { date } = props
      const key = date.toString()
      const dayState = this.getDayColumnState({ date })
      const slotMinutes = prop("slotInterval")
      const slotFromClientY = (currentTarget: HTMLElement, clientY: number) => {
        const rect = currentTarget.getBoundingClientRect()
        const relY = Math.max(0, Math.min(clientY - rect.top, rect.height - 1))
        const totalMinutes = (dayEndHour - dayStartHour) * 60
        const raw = (relY / rect.height) * totalMinutes
        const snapped = Math.round(raw / slotMinutes) * slotMinutes
        const start = toCalendarDateTime(date).set({
          hour: Math.min(dayStartHour + Math.floor(snapped / 60), dayEndHour - 1),
          minute: snapped % 60,
        })
        return { start, end: start.add({ minutes: slotMinutes }) }
      }

      const overlayVars: Record<string, string> = {}
      if (dayState.isDragPreviewDay) {
        const b = getTimeRangeBounds(dragState!.start, dragState!.end, dayStartHour, dayEndHour)
        overlayVars["--scheduler-drag-preview-top"] = b.top
        overlayVars["--scheduler-drag-preview-height"] = b.height
      }
      if (dayState.isDragOriginDay) {
        const b = getTimeRangeBounds(dragState!.origin.start, dragState!.origin.end, dayStartHour, dayEndHour)
        overlayVars["--scheduler-drag-origin-top"] = b.top
        overlayVars["--scheduler-drag-origin-height"] = b.height
      }
      if (dayState.isSelectedSlotDay) {
        const b = getTimeRangeBounds(activeSlot!.start, activeSlot!.end, dayStartHour, dayEndHour)
        overlayVars["--scheduler-slot-top"] = b.top
        overlayVars["--scheduler-slot-height"] = b.height
      }

      return normalize.element({
        ...parts.dayColumn.attrs(scope.id),
        id: dom.getDayColumnId(scope, key),
        role: "gridcell",
        "data-date": key,
        "data-drop-target": dataAttr(dayState.isDropTarget),
        style: { userSelect: "none", ...overlayVars },
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          const target = getEventTarget<HTMLElement>(event)
          if (!target || target.closest(scope.selector(parts.event))) return
          const { start, end } = slotFromClientY(target, event.clientY)
          send({ type: "SLOT_POINTER_DOWN", start, end, point: getEventPoint(event) })
        },
        onDoubleClick(event) {
          const target = getEventTarget<HTMLElement>(event)
          if (!target || target.closest(scope.selector(parts.event))) return
          const { start, end } = slotFromClientY(target, event.clientY)
          prop("onSlotDoubleClick")?.({ start, end, allDay: false })
        },
      })
    },

    getDayCellProps(props) {
      const { date, referenceDate = date, allDay = false } = props
      const key = date.toString()
      const outside = !allDay && (date.month !== referenceDate.month || date.year !== referenceDate.year)
      const todayCell = isToday(date, timeZone)
      const weekend = isWeekend(date, locale)
      const selected = !!context.get("selectedSlot") && isSameDay(date, context.get("selectedSlot")!.start)
      const start = date
      const end = date.add({ days: 1 })
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
        "aria-selected": selected || undefined,
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

    getDayCellTriggerProps(props) {
      const { date, referenceDate } = props
      const tabTarget = focusedDate ?? context.get("date")
      const focused = isSameDay(date, tabTarget)
      const todayCell = isToday(date, timeZone)
      const inMonth = referenceDate ? date.month === referenceDate.month && date.year === referenceDate.year : undefined
      const dateKey = toCalendarDate(date).toString()
      const events = eventsByDayKey.get(dateKey) ?? []
      // Cached formatter result (see `computed.dayCellLabels`) — avoids
      // N formatter.format() calls per render on a re-focused grid.
      const dateLabel =
        dayCellLabels.get(dateKey) ?? formatters.longDate.format(toCalendarDateTime(date).toDate(timeZone))
      const parts_: string[] = [dateLabel]
      if (todayCell) parts_.push(t.todayTriggerLabel ?? "Today")
      if (events.length > 0) parts_.push(`${events.length} ${events.length === 1 ? "event" : "events"}`)
      return normalize.element({
        ...parts.dayCellTrigger.attrs(scope.id),
        role: "button",
        tabIndex: focused ? 0 : -1,
        "aria-label": parts_.join(", "),
        "data-date": date.toString(),
        "data-focus": dataAttr(focused),
        "data-in-month": inMonth === undefined ? undefined : dataAttr(inMonth),
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: "FOCUS_DATE_SET", date })
          prop("onDayActivate")?.({ date })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (isComposingEvent(event)) return
          const key = getEventKey(event)
          if (FOCUS_DATE_KEYS.has(key)) {
            event.preventDefault()
            send({ type: "FOCUS_DATE_KEYDOWN", key })
          }
        },
      })
    },

    getMonthGridProps(props) {
      const { date } = props
      return normalize.element({
        ...parts.monthGrid.attrs(scope.id),
        role: "grid",
        "aria-label": `${formatters.month.format(date.toDate(timeZone))} ${date.year}`,
      })
    },

    getWeekRowProps() {
      return normalize.element({
        ...parts.weekRow.attrs(scope.id),
        role: "row",
      })
    },

    getWeekdayHeaderRowProps() {
      return normalize.element({
        ...parts.weekdayHeaderRow.attrs(scope.id),
        role: "row",
      })
    },

    getWeekdayHeaderCellProps(props) {
      const { day } = props
      return normalize.element({
        ...parts.weekdayHeaderCell.attrs(scope.id),
        role: "columnheader",
        "aria-label": day.long,
      })
    },

    getEventProps(props) {
      const { event, layout = "grid" } = props
      const evtState = this.getEventState(event.id)
      const pos = event.allDay || layout === "list" ? null : this.getEventPosition(event)
      return normalize.element({
        ...parts.event.attrs(scope.id),
        id: dom.getEventId(scope, event.id),
        role: "button",
        tabIndex: 0,
        "data-event-id": event.id,
        "data-layout": layout,
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
              userSelect: "none",
              "--event-color": event.color,
            }
          : { userSelect: "none", "--event-color": event.color },
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
          if (e.defaultPrevented) return
          if (isComposingEvent(e)) return
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

    getEventResizeHandleProps(props) {
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

    getCurrentTimeIndicatorProps({ date }) {
      const currentTime = now(prop("timeZone"))
      const dayStart = prop("dayStartHour")
      const dayEnd = prop("dayEndHour")
      const hour = currentTime.hour
      const showIndicator = isSameDay(currentTime, date)
      const inRange = showIndicator && hour >= dayStart && hour < dayEnd
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

    getMoreEventsProps(props) {
      return normalize.button({
        ...parts.moreEvents.attrs(scope.id),
        type: "button",
        "data-date": props.date.toString(),
        "data-count": props.count,
      })
    },

    getAgendaGroupProps(props) {
      return normalize.element({
        ...parts.agendaGroup.attrs(scope.id),
        "data-date": props.date.toString(),
      })
    },

    getAgendaGroupTitleProps(props) {
      return normalize.element({
        ...parts.agendaGroupTitle.attrs(scope.id),
        "data-date": props.date.toString(),
      })
    },
  }
}
