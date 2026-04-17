import { dataAttr, getEventKey, getEventPoint, isLeftClick } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./scheduler.anatomy"
import * as dom from "./scheduler.dom"
import type {
  DayCellProps,
  DayColumnProps,
  EventProps,
  EventResizeHandleProps,
  MoreEventsProps,
  ResourceHeaderProps,
  SchedulerApi,
  SchedulerService,
  TimeSlotProps,
  ViewType,
} from "./scheduler.types"
import { now, getLocalTimeZone } from "@internationalized/date"
import { getTimePercent, rangesOverlap } from "./utils/time"
import { getEventPosition } from "./utils/layout"

export function connect<T extends PropTypes>(service: SchedulerService, normalize: NormalizeProps<T>): SchedulerApi<T> {
  const { state, send, context, prop, computed, scope, refs } = service

  const view = context.get("view")
  const date = context.get("date")
  const visibleRange = computed("visibleRange")
  const focusedEventId = context.get("focusedEventId")
  const dragEventId = refs.get("dragEventId")

  const isDragging = state.matches("event-dragging")
  const isSlotSelecting = state.matches("slot-selecting")
  const isResizing = state.matches("event-resizing")

  const events = prop("events") ?? []
  const translations = prop("translations")

  const defaultTranslations = {
    prevTriggerLabel: "Previous",
    nextTriggerLabel: "Next",
    todayTriggerLabel: "Today",
    viewLabels: { day: "Day", week: "Week", month: "Month", year: "Year", agenda: "Agenda" },
  }
  const t = { ...defaultTranslations, ...translations }

  return {
    view,
    date,
    visibleRange,
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

    getEventState(id) {
      const draggingThis = isDragging && dragEventId === id
      const resizingThis = isResizing && dragEventId === id
      const focused = focusedEventId === id
      const evt = events.find((e) => e.id === id)
      const conflict = evt
        ? events.some((e) => e.id !== id && rangesOverlap(e.start, e.end, evt.start, evt.end))
        : false
      return { dragging: draggingThis, resizing: resizingThis, focused, conflict }
    },

    getEventPosition(event) {
      const dayEvents = events.filter((e) => {
        return rangesOverlap(e.start, e.end, visibleRange.start, visibleRange.end)
      })
      return getEventPosition(event, dayEvents, prop("dayStartHour"), prop("dayEndHour"))
    },

    getEventsForDay(d) {
      return events.filter((e) => {
        const dayStart = d
        const dayEnd = d.add({ days: 1 })
        return rangesOverlap(e.start, e.end, dayStart, dayEnd)
      })
    },

    getEventsForSlot(start, end, resourceId) {
      return events.filter((e) => {
        const matchesResource = resourceId ? e.resourceId === resourceId : true
        return matchesResource && rangesOverlap(e.start, e.end, start, end)
      })
    },

    hasConflict(event) {
      return events.some((e) => e.id !== event.id && rangesOverlap(e.start, e.end, event.start, event.end))
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        tabIndex: 0,
        "data-view": view,
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
        ...parts.header.attrs,
      })
    },

    getHeaderTitleProps() {
      return normalize.element({
        ...parts.headerTitle.attrs,
        "aria-live": "polite",
      })
    },

    getPrevTriggerProps() {
      return normalize.button({
        ...parts.prevTrigger.attrs,
        type: "button",
        "aria-label": t.prevTriggerLabel,
        onClick() {
          send({ type: "GO_TO_PREV" })
        },
      })
    },

    getNextTriggerProps() {
      return normalize.button({
        ...parts.nextTrigger.attrs,
        type: "button",
        "aria-label": t.nextTriggerLabel,
        onClick() {
          send({ type: "GO_TO_NEXT" })
        },
      })
    },

    getTodayTriggerProps() {
      return normalize.button({
        ...parts.todayTrigger.attrs,
        type: "button",
        "aria-label": t.todayTriggerLabel,
        onClick() {
          send({ type: "GO_TO_TODAY" })
        },
      })
    },

    getViewSelectProps() {
      return normalize.element({
        ...parts.viewSelect.attrs,
        role: "toolbar",
        "aria-label": "Calendar view",
      })
    },

    getGridProps() {
      return normalize.element({
        ...parts.grid.attrs,
        id: dom.getGridId(scope),
        role: "grid",
        "data-view": view,
      })
    },

    getAllDayRowProps() {
      return normalize.element({
        ...parts.allDayRow.attrs,
        role: "row",
      })
    },

    getTimeGutterProps() {
      return normalize.element({
        ...parts.timeGutter.attrs,
        "aria-hidden": "true",
      })
    },

    getTimeSlotProps(props: TimeSlotProps) {
      const key = `${props.start.toString()}:${props.end.toString()}`
      return normalize.element({
        ...parts.timeSlot.attrs,
        id: dom.getTimeSlotId(scope, key),
        role: "gridcell",
        "data-resource-id": props.resourceId,
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          const point = getEventPoint(event)
          send({ type: "SLOT_POINTER_DOWN", start: props.start, end: props.end, point, resourceId: props.resourceId })
        },
      })
    },

    getDayColumnProps(props: DayColumnProps) {
      const key = props.date.toString()
      return normalize.element({
        ...parts.dayColumn.attrs,
        id: dom.getDayColumnId(scope, key),
        role: "gridcell",
        "data-date": key,
        "data-resource-id": props.resourceId,
      })
    },

    getDayCellProps(props: DayCellProps) {
      const key = props.date.toString()
      return normalize.element({
        ...parts.dayCell.attrs,
        id: dom.getDayCellId(scope, key),
        role: "gridcell",
        "data-date": key,
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          const point = getEventPoint(event)
          const start = props.date
          const end = props.date.add({ days: 1 })
          send({ type: "SLOT_POINTER_DOWN", start, end, point })
        },
      })
    },

    getResourceHeaderProps(props: ResourceHeaderProps) {
      return normalize.element({
        ...parts.resourceHeader.attrs,
        "data-resource-id": props.resource.id,
      })
    },

    getEventProps(props: EventProps) {
      const { event } = props
      const evtState = this.getEventState(event.id)
      return normalize.element({
        ...parts.event.attrs,
        id: dom.getEventId(scope, event.id),
        role: "button",
        tabIndex: 0,
        "data-event-id": event.id,
        "data-dragging": dataAttr(evtState.dragging),
        "data-resizing": dataAttr(evtState.resizing),
        "data-focused": dataAttr(evtState.focused),
        "data-conflict": dataAttr(evtState.conflict),
        "data-disabled": dataAttr(!!event.disabled),
        "data-all-day": dataAttr(!!event.allDay),
        style: event.allDay
          ? undefined
          : {
              position: "absolute",
              ...(() => {
                const pos = this.getEventPosition(event)
                return { top: pos.top, height: pos.height, left: pos.left, width: pos.width }
              })(),
            },
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
        ...parts.eventResizeHandle.attrs,
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
        ...parts.currentTimeIndicator.attrs,
        "aria-hidden": "true",
        role: "presentation",
        "data-hidden": dataAttr(!inRange),
        hidden: !inRange || !prop("showCurrentTime") ? true : undefined,
        style: {
          position: "absolute",
          left: "0",
          right: "0",
          top: `${percent * 100}%`,
        },
      })
    },

    getMoreEventsProps(props: MoreEventsProps) {
      return normalize.button({
        ...parts.moreEvents.attrs,
        type: "button",
        "data-date": props.date.toString(),
        "data-count": props.count,
      })
    },
  }
}
