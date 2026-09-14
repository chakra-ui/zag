import {
  isSameDay,
  isToday,
  isWeekend,
  now,
  startOfMonth,
  toCalendarDate,
  toCalendarDateTime,
} from "@internationalized/date"
import type { Service } from "@zag-js/core"
import { getMonthDays, getMonthNames, getWeekDays } from "@zag-js/date-utils"
import {
  dataAttr,
  getEventKey,
  getEventPoint,
  getEventTarget,
  isComposingEvent,
  isEditableElement,
  isLeftClick,
} from "@zag-js/dom-query"
import { mergeWithDefault } from "@zag-js/utils"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./scheduler.anatomy"
import * as dom from "./scheduler.dom"
import type {
  DayColumnProps,
  RootState,
  SchedulerApi,
  SchedulerResource,
  SchedulerPayload,
  SchedulerSchema,
  SchedulerTranslations,
  ViewItemProps,
  VisibleRangeText,
  WeekDay,
} from "./scheduler.types"
import { getAllDaySegments } from "./utils/all-day"
import { getColumns, getVisibleDays } from "./utils/column"
import { getDragState } from "./utils/drag"
import { findEvent } from "./utils/event"
import {
  UNPLACED_POSITION,
  getAgendaGroups,
  getEventConflicts,
  getEventLayout,
  getVisibleEvents,
  groupEventsByDay,
} from "./utils/layout"
import { expandRecurringEvents } from "./utils/rrule"
import { createTimelineLayout } from "./utils/timeline"
import {
  formatDuration,
  getMinutesSinceMidnight,
  getTimePercent,
  getTimeRangeBounds,
  getToday,
  rangesOverlap,
} from "./utils/time"

const defaultTranslations: Required<SchedulerTranslations> = {
  prevTriggerLabel: "Previous",
  nextTriggerLabel: "Next",
  todayTriggerLabel: "Today",
  viewSelectLabel: "Calendar view",
  viewText: {
    day: "Day",
    week: "Week",
    month: "Month",
    year: "Year",
    agenda: "Agenda",
    timeline: "Timeline",
  },
}

const FOCUS_DATE_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Enter", " "])

export function connect<T extends PropTypes, E extends SchedulerPayload = SchedulerPayload>(
  service: Service<SchedulerSchema<E>>,
  normalize: NormalizeProps<T>,
): SchedulerApi<T, E> {
  const { state, send, context, prop, computed, scope, refs } = service

  const locale = prop("locale")
  const timeZone = prop("timeZone")
  const startOfWeekProp = prop("startOfWeek")
  const dayStartHour = prop("dayStartHour")
  const dayEndHour = prop("dayEndHour")
  const dir = prop("dir")

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

  const events = expandRecurringEvents({
    events: prop("events"),
    range: visibleRange,
    limit: prop("maxRecurrenceInstances"),
    expander: prop("expandRecurrence"),
  })
  const translations = mergeWithDefault(defaultTranslations, prop("translations"))

  const visibleEvents = getVisibleEvents(events, visibleRange)

  const eventPositions = getEventLayout({ events: visibleEvents, dayStartHour, dayEndHour })

  const eventsById = new Map(events.map((e) => [e.id, e]))
  const eventsByDayKey = groupEventsByDay(visibleEvents)
  const conflictIds = getEventConflicts(visibleEvents)

  const today = getToday(timeZone)

  const visibleDays = getVisibleDays({
    range: visibleRange,
    workWeekOnly: !!prop("workWeekOnly") && view === "week",
    workWeekDays: prop("workWeekDays"),
  })

  const resources = prop("resources")
  const isGroupedByResource = prop("groupBy") === "resource" && resources.length > 0
  const columns = getColumns({ days: visibleDays, resources, isGroupedByResource })

  const draggedResourceId = findEvent(prop("events"), dragEventId)?.resourceId

  /** A column only shows drag overlays for the lane the dragged event belongs to. */
  const ownsDraggedEvent = (resource?: { id: string }) => !resource || resource.id === draggedResourceId

  const formatters = computed("formatters")

  const timeline = createTimelineLayout({
    range: visibleRange,
    resources,
    days: visibleDays,
    timeZone,
    formatSlotLabel: (d) => formatters.weekDayShort.format(d),
  })

  const dayCellLabels = computed("dayCellLabels")

  const hourRange = computed("hourRange")

  const startText = formatters.range.format(visibleRange.start.toDate(timeZone))
  const endText = formatters.range.format(visibleRange.end.toDate(timeZone))
  const visibleRangeText: VisibleRangeText = {
    start: startText,
    end: endText,
    formatted: startText === endText ? startText : `${startText} – ${endText}`,
  }

  const dragState = getDragState({
    isDragging,
    isResizing,
    liveDrag,
    snapshot: refs.get("dragStartSnapshot"),
    eventsById,
  })

  const selectedSlot = context.get("selectedSlot")
  const liveSlot = context.get("liveSlot")
  const activeSlot = liveSlot ?? selectedSlot

  // State getters are pure and serializable — independent of `normalize`.
  function getRootState(): RootState {
    return { view, dragging: isDragging, resizing: isResizing, selectingSlot: isSelectingSlot }
  }

  return {
    view,
    date,
    today,
    visibleRange,
    visibleRangeText,
    visibleDays,
    columns,
    resources,
    getTimelineState: timeline.getState,
    getAllDaySegments() {
      return getAllDaySegments({ events: visibleEvents, days: visibleDays, live: liveDrag })
    },
    formatTime(d) {
      return formatters.time.format(d.toDate(timeZone))
    },
    formatTimeRange(s, e) {
      return `${formatters.time.format(s.toDate(timeZone))} – ${formatters.time.format(e.toDate(timeZone))}`
    },
    formatLongDate(d) {
      return formatters.longDate.format(d.toDate(timeZone))
    },
    formatDuration,
    formatWeekDay(d, style = "short") {
      const key = style === "short" ? "weekDayShort" : style === "long" ? "weekDayLong" : "weekDayNarrow"
      return formatters[key].format(d.toDate(timeZone))
    },
    getWeekDays() {
      return getWeekDays(visibleRange.start, startOfWeekProp, timeZone, locale) as WeekDay[]
    },
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
      send({ type: "VIEW.SET", view })
    },
    setDate(date) {
      send({ type: "DATE.SET", date })
    },
    goToToday() {
      send({ type: "GOTO.TODAY" })
    },
    goToNext() {
      send({ type: "GOTO.NEXT" })
    },
    goToPrev() {
      send({ type: "GOTO.PREV" })
    },
    clearSelectedSlot() {
      context.set("selectedSlot", null)
    },

    selectedSlot,
    dragState,

    focusedDate,
    setFocusedDate(date) {
      send({ type: "FOCUS_DATE.SET", date })
    },
    clearFocusedDate() {
      send({ type: "FOCUS_DATE.CLEAR" })
    },

    getEventById(id) {
      return eventsById.get(id)
    },

    getTimePercent(date) {
      return getTimePercent({ date, dayStartHour, dayEndHour })
    },

    getMonthName(d) {
      return formatters.month.format(d.toDate(timeZone))
    },
    getViewText(view) {
      return translations.viewText[view] ?? view
    },
    getMonthNames() {
      return getMonthNames(locale, "long", date)
    },
    getMonthGrid(ref = date) {
      // always 6 rows (as Google/Apple do); short months fill with trailing days
      return getMonthDays(startOfMonth(ref), locale, 6, startOfWeekProp)
    },

    getDragPreviewProps({ date, resource }) {
      // every resource column shares a date, so the preview must also match the lane.
      // an all-day gesture moves its own bar, so the hour grid stays out of it.
      const active = !!dragState && !dragState.allDay && isSameDay(dragState.start, date) && ownsDraggedEvent(resource)
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

    getDragOriginProps({ date, resource }) {
      const active =
        !!dragState && !dragState.event.allDay && isSameDay(dragState.origin.start, date) && ownsDraggedEvent(resource)
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
      // only the event under the gesture can be in an invalid position
      const invalid = (draggingThis || resizingThis) && !!liveDrag?.invalid
      return { dragging: draggingThis, resizing: resizingThis, focused, selected, conflict, invalid }
    },

    getEventPosition(event) {
      const basePos = eventPositions.get(event.id) ?? UNPLACED_POSITION

      if (isResizing && dragEventId === event.id && liveDrag) {
        const totalMinutes = (dayEndHour - dayStartHour) * 60
        const dayStartMins = dayStartHour * 60
        const startMins = Math.max(0, getMinutesSinceMidnight(liveDrag.start) - dayStartMins)
        const endMins = Math.min(totalMinutes, getMinutesSinceMidnight(liveDrag.end) - dayStartMins)
        return {
          ...basePos,
          top: startMins / totalMinutes,
          // a zero-height box would be invisible mid-resize
          height: Math.max(0.005, (endMins - startMins) / totalMinutes),
        }
      }

      return basePos
    },

    getEventsForDay(date) {
      return eventsByDayKey.get(toCalendarDate(date).toString()) ?? []
    },

    getEventsForColumn(column) {
      const dayEvents = eventsByDayKey.get(toCalendarDate(column.date).toString()) ?? []
      if (!column.resource) return dayEvents
      return dayEvents.filter((event) => event.resourceId === column.resource!.id)
    },

    getEventsForSlot(start, end) {
      const events = eventsByDayKey.get(toCalendarDate(start).toString()) ?? []
      return events.filter((e) => rangesOverlap(e, { start, end }))
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

    getRootState,
    getRootProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.root.attrs(scope.id),
        id: dom.getRootId(scope),
        tabIndex: 0,
        dir,
        "data-view": rootState.view,
        "data-dragging": dataAttr(rootState.dragging),
        "data-resizing": dataAttr(rootState.resizing),
        "data-selecting-slot": dataAttr(rootState.selectingSlot),
        "data-drop-invalid": dataAttr(!!liveDrag?.invalid),
        style: {
          "--scheduler-visible-days": visibleDays.length,
          "--scheduler-day-count": visibleDays.length,
          "--scheduler-columns": columns.length,
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
              send({ type: "GOTO.TODAY" })
              e.preventDefault()
              return
            case "d":
            case "D":
              send({ type: "VIEW.SET", view: "day" })
              e.preventDefault()
              return
            case "w":
            case "W":
              send({ type: "VIEW.SET", view: "week" })
              e.preventDefault()
              return
            case "m":
            case "M":
              send({ type: "VIEW.SET", view: "month" })
              e.preventDefault()
              return
            case "y":
            case "Y":
              send({ type: "VIEW.SET", view: "year" })
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
        "aria-label": translations.prevTriggerLabel,
        onClick() {
          send({ type: "GOTO.PREV" })
        },
      })
    },

    getNextTriggerProps() {
      return normalize.button({
        ...parts.nextTrigger.attrs(scope.id),
        type: "button",
        "aria-label": translations.nextTriggerLabel,
        onClick() {
          send({ type: "GOTO.NEXT" })
        },
      })
    },

    getTodayTriggerProps() {
      return normalize.button({
        ...parts.todayTrigger.attrs(scope.id),
        type: "button",
        "aria-label": translations.todayTriggerLabel,
        onClick() {
          send({ type: "GOTO.TODAY" })
        },
      })
    },

    getViewSelectProps() {
      return normalize.element({
        ...parts.viewSelect.attrs(scope.id),
        role: "toolbar",
        "aria-label": translations.viewSelectLabel,
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
          send({ type: "VIEW.SET", view: props.view })
        },
      })
    },

    getColumnHeadersProps() {
      return normalize.element({
        ...parts.columnHeaders.attrs(scope.id),
        id: dom.getColumnHeadersId(scope),
        role: "row",
      })
    },

    getColumnHeaderProps(props: DayColumnProps) {
      const { date, resource } = props
      return normalize.element({
        ...parts.columnHeader.attrs(scope.id),
        role: "columnheader",
        "data-date": date.toString(),
        "data-resource": resource?.id,
        "data-disabled": dataAttr(resource?.disabled),
        style: resource?.color ? ({ "--resource-color": resource.color } as any) : undefined,
        "data-today": dataAttr(isToday(date, timeZone)),
        "data-weekend": dataAttr(isWeekend(date, locale)),
      })
    },

    getGridProps() {
      return normalize.element({
        ...parts.grid.attrs(scope.id),
        id: dom.getGridId(scope),
        role: "grid",
        "aria-colcount": visibleDays.length,
        "aria-label": visibleRangeText.formatted,
        // the header and all-day rows render outside the grid so they can stick above the scroller
        "aria-owns": [dom.getColumnHeadersId(scope), dom.getAllDayRowId(scope), dom.getGridRowId(scope)].join(" "),
        "data-view": view,
      })
    },

    getTimelineProps() {
      const { rows, slots } = timeline.getState()
      return normalize.element({
        ...parts.timeline.attrs(scope.id),
        role: "grid",
        "aria-colcount": slots.length,
        "aria-rowcount": rows.length,
        "aria-label": visibleRangeText.formatted,
        style: {
          "--scheduler-timeline-slots": slots.length,
          "--scheduler-timeline-rows": rows.length,
        },
      })
    },

    getTimelineHeaderProps() {
      return normalize.element({
        ...parts.timelineHeader.attrs(scope.id),
        role: "row",
      })
    },

    getTimelineSlotProps(props) {
      const { slot } = props
      return normalize.element({
        ...parts.timelineSlot.attrs(scope.id),
        role: "columnheader",
        "data-date": slot.start.toString(),
        "data-today": dataAttr(isToday(slot.start, timeZone)),
        style: { insetInlineStart: `${slot.offset * 100}%`, width: `${slot.size * 100}%` },
      })
    },

    getTimelineRowProps(props) {
      const { row } = props
      return normalize.element({
        ...parts.timelineRow.attrs(scope.id),
        role: "row",
        "data-resource": row.resource?.id,
        "data-disabled": dataAttr(row.resource?.disabled),
        style: row.resource?.color ? ({ "--resource-color": row.resource.color } as any) : undefined,
      })
    },

    getTimelineRowHeaderProps(props) {
      const { row } = props
      return normalize.element({
        ...parts.timelineRowHeader.attrs(scope.id),
        role: "rowheader",
        "data-resource": row.resource?.id,
      })
    },

    getTimelineTrackProps(props) {
      const { row } = props
      return normalize.element({
        ...parts.timelineTrack.attrs(scope.id),
        role: "gridcell",
        "data-resource": row.resource?.id,
        style: { position: "relative" },
      })
    },

    getEventsForRow(row) {
      if (!row.resource) return visibleEvents
      return visibleEvents.filter((event) => event.resourceId === row.resource!.id)
    },

    getGridRowProps() {
      return normalize.element({
        ...parts.gridRow.attrs(scope.id),
        id: dom.getGridRowId(scope),
        role: "row",
      })
    },

    getAllDayRowProps() {
      return normalize.element({
        ...parts.allDayRow.attrs(scope.id),
        id: dom.getAllDayRowId(scope),
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
        role: "rowheader",
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
          send({ type: "SLOT.POINTER_DOWN", start: props.start, end: props.end, point })
        },
      })
    },

    getDayColumnState({ date }) {
      // a gesture aimed at the all-day row leaves the hour grid alone, in both directions:
      // the preview follows the pointer's region, the origin follows where the event started
      const inGrid = !!dragState && !dragState.allDay
      return {
        isToday: isToday(date, timeZone),
        isWeekend: isWeekend(date, locale),
        isDropTarget: !!liveDrag && !liveDrag.allDay && liveDrag.kind === "drag" && isSameDay(liveDrag.start, date),
        isDragPreviewDay: inGrid && isSameDay(dragState!.start, date),
        isDragOriginDay: !!dragState && !dragState.event.allDay && isSameDay(dragState.origin.start, date),
        isSelectedSlotDay: !!activeSlot && isSameDay(activeSlot.start, date),
      }
    },

    getDayColumnProps(props) {
      const { date, resource } = props
      const key = resource ? `${date.toString()}:${resource.id}` : date.toString()
      const dayState = this.getDayColumnState({ date })
      const slotMinutes = prop("slotInterval")
      const slotFromClientY = (currentTarget: HTMLElement, clientY: number) => {
        const rect = currentTarget.getBoundingClientRect()
        const relY = Math.max(0, Math.min(clientY - rect.top, rect.height - 1))
        const totalMinutes = (dayEndHour - dayStartHour) * 60
        const raw = (relY / rect.height) * totalMinutes
        const snapped = Math.round(raw / slotMinutes) * slotMinutes
        const start = date.set({
          hour: Math.min(dayStartHour + Math.floor(snapped / 60), dayEndHour - 1),
          minute: snapped % 60,
        })
        return { start, end: start.add({ minutes: slotMinutes }) }
      }

      const overlayVars: Record<string, string> = {}
      if (dayState.isDragPreviewDay) {
        const b = getTimeRangeBounds({ start: dragState!.start, end: dragState!.end, dayStartHour, dayEndHour })
        overlayVars["--scheduler-drag-preview-top"] = b.top
        overlayVars["--scheduler-drag-preview-height"] = b.height
      }
      if (dayState.isDragOriginDay) {
        const b = getTimeRangeBounds({ ...dragState!.origin, dayStartHour, dayEndHour })
        overlayVars["--scheduler-drag-origin-top"] = b.top
        overlayVars["--scheduler-drag-origin-height"] = b.height
      }
      if (dayState.isSelectedSlotDay) {
        const b = getTimeRangeBounds({ ...activeSlot!, dayStartHour, dayEndHour })
        overlayVars["--scheduler-slot-top"] = b.top
        overlayVars["--scheduler-slot-height"] = b.height
      }

      return normalize.element({
        ...parts.dayColumn.attrs(scope.id),
        id: dom.getDayColumnId(scope, key),
        role: "gridcell",
        "data-date": date.toString(),
        "data-resource": resource?.id,
        "data-disabled": dataAttr(resource?.disabled),
        "data-drop-target": dataAttr(dayState.isDropTarget),
        style: {
          userSelect: "none",
          ...(resource?.color ? { "--resource-color": resource.color } : {}),
          ...overlayVars,
        },
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          if (resource?.disabled) return
          const target = getEventTarget<HTMLElement>(event)
          if (!target || target.closest(scope.selector(parts.event))) return
          const { start, end } = slotFromClientY(target, event.clientY)
          send({ type: "SLOT.POINTER_DOWN", start, end, resource, point: getEventPoint(event) })
        },
        onDoubleClick(event) {
          const target = getEventTarget<HTMLElement>(event)
          if (!target || target.closest(scope.selector(parts.event))) return
          const { start, end } = slotFromClientY(target, event.clientY)
          prop("onSlotDoubleClick")?.({ start, end, allDay: false, resource })
        },
        onDragOver(event) {
          // only claim the drop when the consumer opted in, so unrelated drags fall through
          if (!prop("onEventReceive") || resource?.disabled) return
          event.preventDefault()
        },
        onDrop(event) {
          const onReceive = prop("onEventReceive")
          if (!onReceive || resource?.disabled) return
          event.preventDefault()
          const target = getEventTarget<HTMLElement>(event)
          if (!target) return
          const format = prop("dataTransferFormat") ?? "text/plain"
          const data = event.dataTransfer?.getData(format) ?? ""
          const { start, end } = slotFromClientY(target, event.clientY)
          onReceive({ start, end, resource: resource as SchedulerResource<E> | undefined, data })
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
      const dropTarget = allDay && !!dragState?.allDay && isSameDay(dragState.start, date)
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
        "data-drop-target": dataAttr(dropTarget),
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
      // cached (see `computed.dayCellLabels`) to avoid N format() calls per render
      const dateLabel = dayCellLabels.get(dateKey) ?? formatters.longDate.format(date.toDate(timeZone))
      const parts_: string[] = [dateLabel]
      if (todayCell) parts_.push(translations.todayTriggerLabel)
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
          send({ type: "FOCUS_DATE.SET", date })
          prop("onDayActivate")?.({ date })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (isComposingEvent(event)) return
          const key = getEventKey(event)
          if (FOCUS_DATE_KEYS.has(key)) {
            event.preventDefault()
            send({ type: "FOCUS_DATE.KEYDOWN", key })
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
      const { event, layout = "grid", segment } = props
      const evtState = this.getEventState(event.id)
      // the timeline runs horizontally, so it spans the range rather than one day column
      const timelinePos = layout === "timeline" ? timeline.getSpan(event) : null
      const bar = layout === "all-day" ? segment : undefined
      const pos = event.allDay || layout === "list" || timelinePos || bar ? null : this.getEventPosition(event)
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
        "data-invalid": dataAttr(evtState.invalid),
        "data-disabled": dataAttr(!!event.disabled),
        "data-all-day": dataAttr(!!event.allDay),
        // a bar clipped by the visible range has no grabbable edge on that side
        "data-clip-start": dataAttr(!!bar && !bar.isStart),
        "data-clip-end": dataAttr(!!bar && !bar.isEnd),
        style: bar
          ? {
              // rendered inside the cell it starts on and allowed to overflow across the rest, so
              // the all-day row keeps a valid `row` > `gridcell` structure
              position: "absolute",
              insetInlineStart: 0,
              width: `calc(${bar.span} * 100% + ${bar.span - 1}px)`,
              top: `calc(${bar.level} * var(--scheduler-all-day-bar-height, 19px))`,
              userSelect: "none",
              "--event-color": event.color,
            }
          : timelinePos
            ? {
                position: "absolute",
                insetInlineStart: `${timelinePos.offset * 100}%`,
                width: `${timelinePos.size * 100}%`,
              }
            : pos
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
          send({ type: "EVENT.CLICK", eventId: event.id })
        },
        onFocus() {
          send({ type: "EVENT.FOCUS", eventId: event.id })
        },
        onBlur() {
          send({ type: "EVENT.BLUR", eventId: event.id })
        },
        onPointerDown(e) {
          if (!isLeftClick(e) || event.disabled) return
          e.stopPropagation()
          const point = getEventPoint(e)
          send({ type: "EVENT.POINTER_DOWN", eventId: event.id, point })
        },
        onKeyDown(e) {
          if (e.defaultPrevented) return
          if (isComposingEvent(e)) return
          const keyMap: EventKeyMap = {
            Enter() {
              send({ type: "EVENT.CLICK", eventId: event.id })
            },
            Space() {
              send({ type: "EVENT.CLICK", eventId: event.id })
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
          send({ type: "RESIZE_HANDLE.POINTER_DOWN", eventId: event.id, edge, point })
        },
      })
    },

    getCurrentTimeIndicatorProps({ date }) {
      // now() is zoned; the scheduler works in wall-clock time
      const currentTime = toCalendarDateTime(now(prop("timeZone")))
      const dayStart = prop("dayStartHour")
      const dayEnd = prop("dayEndHour")
      const hour = currentTime.hour
      const showIndicator = isSameDay(currentTime, date)
      const inRange = showIndicator && hour >= dayStart && hour < dayEnd
      const percent = getTimePercent({ date: currentTime, dayStartHour: dayStart, dayEndHour: dayEnd })
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
