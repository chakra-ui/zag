import { getLocalTimeZone, parseDateTime, type CalendarDateTime } from "@internationalized/date"
import { createMachine, memo, type PropFn, type Scope } from "@zag-js/core"
import { getNearestScrollableAncestor, raf, trackPointerMove } from "@zag-js/dom-query"
import * as dom from "./scheduler.dom"
import type { SchedulerSchema } from "./scheduler.types"
import { createAutoScroller } from "./utils/auto-scroll"
import { getDropDelta, pointToDateTime, pointToTimeOnDay } from "./utils/drag"
import { createDayCellLabels, createFormatters, createHourRange } from "./utils/formatter"
import { getFocusDateForKey } from "./utils/focus-date"
import { findEvent, findResource } from "./utils/event"
import { getDaysBetween, getMinutesBetween, getToday, maxDateTime, minDateTime, startOfDay } from "./utils/time"
import { getNextDate, getPrevDate, getVisibleRange } from "./utils/visible-range"

const WORK_WEEK_DAYS = [1, 2, 3, 4, 5]

/** Length an all-day event takes on when dropped into the time grid, matching FullCalendar. */
const DEFAULT_TIMED_DURATION_MINUTES = 60
const NO_EVENTS: SchedulerSchema["props"]["events"] = []
const NO_RESOURCES: SchedulerSchema["props"]["resources"] = []

export const machine = createMachine<SchedulerSchema>({
  props({ props }) {
    return {
      defaultView: "week",
      slotInterval: 30,
      dayStartHour: 0,
      dayEndHour: 24,
      workWeekDays: WORK_WEEK_DAYS,
      locale: "en-US",
      timeZone: getLocalTimeZone(),
      dir: "ltr",
      showCurrentTime: true,
      showWeekNumbers: false,
      events: NO_EVENTS,
      resources: NO_RESOURCES,
      groupBy: "date",
      maxRecurrenceInstances: 2000,
      ...props,
    }
  },

  initialState() {
    return "idle"
  },

  context({ prop, bindable }) {
    return {
      view: bindable(() => ({
        defaultValue: prop("defaultView"),
        value: prop("view"),
        onChange(view) {
          prop("onViewChange")?.({ view })
        },
      })),
      date: bindable(() => ({
        defaultValue: prop("defaultDate") ?? getToday(prop("timeZone")),
        value: prop("date"),
        onChange(date) {
          prop("onDateChange")?.({ date })
        },
      })),
      focusedEventId: bindable<string | null>(() => ({
        defaultValue: null,
      })),
      focusedDate: bindable<CalendarDateTime | null>(() => ({
        defaultValue: null,
      })),
      selectedEventId: bindable<string | null>(() => ({
        defaultValue: null,
      })),
      selectedSlot: bindable<{ start: CalendarDateTime; end: CalendarDateTime } | null>(() => ({
        defaultValue: null,
      })),
      liveDrag: bindable<SchedulerSchema["context"]["liveDrag"]>(() => ({
        defaultValue: null,
      })),
      liveSlot: bindable<SchedulerSchema["context"]["liveSlot"]>(() => ({
        defaultValue: null,
      })),
    }
  },

  refs() {
    return {
      dragOrigin: null,
      dragStartSnapshot: null,
      slotAnchor: null,
    }
  },

  computed: {
    visibleRange: memo(
      ({ context, prop }) => [context.get("view"), context.get("date"), prop("locale"), prop("startOfWeek")],
      ([view, date, locale, startOfWeek]) => getVisibleRange({ view, date, locale, firstDay: startOfWeek }),
    ),
    formatters: memo(
      ({ prop }) => [prop("locale"), prop("timeZone")],
      ([locale, timeZone]) => createFormatters({ locale, timeZone }),
    ),
    dayCellLabels: memo(
      ({ prop, computed }) => [prop("locale"), prop("timeZone"), computed("visibleRange")],
      ([locale, timeZone, range]) => createDayCellLabels({ locale, timeZone, range }),
    ),
    hourRange: memo(
      ({ prop }) => [prop("dayStartHour"), prop("dayEndHour"), prop("locale")],
      ([dayStartHour, dayEndHour, locale]) => createHourRange({ dayStartHour, dayEndHour, locale }),
    ),
    isInteractive: ({ prop }) => !prop("disabled"),
  },

  on: {
    "VIEW.SET": { actions: ["setView"] },
    "DATE.SET": { actions: ["setDate"] },
    "GOTO.TODAY": { actions: ["goToToday"] },
    "GOTO.NEXT": { actions: ["goToNext"] },
    "GOTO.PREV": { actions: ["goToPrev"] },
    "EVENT.CLICK": { actions: ["invokeOnEventClick", "clearSelectedSlot"] },
    "EVENT.FOCUS": { actions: ["setFocusedEvent"] },
    "EVENT.BLUR": { actions: ["clearFocusedEvent"] },
    "FOCUS_DATE.KEYDOWN": { actions: ["handleFocusDateKeydown"] },
    "FOCUS_DATE.SET": { actions: ["setFocusedDate"] },
    "FOCUS_DATE.CLEAR": { actions: ["clearFocusedDate"] },
  },

  watch({ track, context, action }) {
    track([() => context.get("focusedDate")?.toString() ?? ""], () => {
      action(["focusActiveDayCell"])
    })
  },

  states: {
    idle: {
      on: {
        "SLOT.POINTER_DOWN": {
          guard: "isNotDisabled",
          target: "slot-selecting",
          actions: ["initSlotDrag", "clearSelectedEvent", "clearSelectedSlot"],
        },
        "EVENT.POINTER_DOWN": {
          guard: "canDragEvent",
          target: "event-dragging",
          actions: ["initEventDrag", "clearSelectedSlot"],
        },
        "RESIZE_HANDLE.POINTER_DOWN": {
          guard: "canResizeEvent",
          target: "event-resizing",
          actions: ["initEventResize", "clearSelectedSlot"],
        },
        ESCAPE: { actions: ["clearSelectedEvent", "clearSelectedSlot"] },
      },
    },

    "slot-selecting": {
      effects: ["trackPointerMove"],
      on: {
        POINTER_MOVE: { actions: ["updateSlotDragEnd"] },
        POINTER_UP: {
          target: "idle",
          actions: ["invokeOnSlotSelect", "clearSlotDrag"],
        },
        ESCAPE: {
          target: "idle",
          actions: ["clearSlotDrag"],
        },
      },
    },

    "event-dragging": {
      effects: ["trackPointerMove"],
      on: {
        POINTER_MOVE: { actions: ["updateEventDragPosition"] },
        POINTER_UP: {
          target: "idle",
          actions: ["invokeOnEventDrop", "clearEventGesture"],
        },
        ESCAPE: {
          target: "idle",
          actions: ["restoreEventFromSnapshot", "clearEventGesture"],
        },
      },
    },

    "event-resizing": {
      effects: ["trackPointerMove"],
      on: {
        POINTER_MOVE: { actions: ["updateEventResizePosition"] },
        POINTER_UP: {
          target: "idle",
          actions: ["invokeOnEventResize", "clearEventGesture"],
        },
        ESCAPE: {
          target: "idle",
          actions: ["restoreEventFromSnapshot", "clearEventGesture"],
        },
      },
    },
  },

  implementations: {
    guards: {
      isNotDisabled({ prop }) {
        return !prop("disabled")
      },
      canDragEvent({ prop, event }) {
        if (prop("disabled")) return false
        const evt = findEvent(prop("events"), event.eventId)
        if (!evt || evt.disabled) return false
        return prop("canDragEvent")?.(evt) ?? true
      },
      canResizeEvent({ prop, event }) {
        if (prop("disabled")) return false
        const evt = findEvent(prop("events"), event.eventId)
        if (!evt || evt.disabled) return false
        return prop("canResizeEvent")?.(evt) ?? true
      },
    },

    effects: {
      trackPointerMove({ scope, send }) {
        let rafId: number | null = null
        let latest: { x: number; y: number } | null = null
        const win = scope.getWin()

        const gridEl = dom.getGridEl(scope)
        const autoScroll = createAutoScroller(gridEl ? getNearestScrollableAncestor(gridEl) : null, win)

        const cleanupTracker = trackPointerMove(scope.getDoc(), {
          onPointerMove(info) {
            latest = info.point
            autoScroll.update(info.point)
            // coalesce to one move per frame
            if (rafId != null) return
            rafId = win.requestAnimationFrame(() => {
              rafId = null
              if (!latest) return
              send({ type: "POINTER_MOVE", point: latest })
            })
          },
          onPointerUp() {
            if (rafId != null) {
              win.cancelAnimationFrame(rafId)
              rafId = null
            }
            autoScroll.stop()
            send({ type: "POINTER_UP" })
          },
        })

        return () => {
          autoScroll.stop()
          cleanupTracker()
        }
      },
    },

    actions: {
      setView({ context, event }) {
        context.set("view", event.view)
      },
      setDate({ context, event }) {
        context.set("date", event.date)
      },
      goToToday({ context, prop }) {
        context.set("date", getToday(prop("timeZone")))
      },
      goToNext({ context }) {
        context.set("date", getNextDate(context.get("view"), context.get("date")))
      },
      goToPrev({ context }) {
        context.set("date", getPrevDate(context.get("view"), context.get("date")))
      },
      invokeOnEventClick({ context, prop, event }) {
        const evt = findEvent(prop("events"), event.eventId)
        if (!evt) return
        context.set("selectedEventId", event.eventId)
        prop("onEventClick")?.({ event: evt })
      },
      clearSelectedSlot({ context }) {
        context.set("selectedSlot", null)
      },
      clearSelectedEvent({ context }) {
        context.set("selectedEventId", null)
      },
      setFocusedEvent({ context, event }) {
        context.set("focusedEventId", event.eventId)
      },
      clearFocusedEvent({ context }) {
        context.set("focusedEventId", null)
      },

      setFocusedDate({ context, event }) {
        context.set("focusedDate", event.date)
      },
      clearFocusedDate({ context }) {
        context.set("focusedDate", null)
      },
      focusActiveDayCell({ scope, context }) {
        if (!context.get("focusedDate")) return
        raf(() => {
          dom.getFocusedDayCellTriggerEl(scope)?.focus({ preventScroll: true })
        })
      },
      handleFocusDateKeydown({ context, event, prop }) {
        const cur = context.get("focusedDate") ?? context.get("date")
        if (event.key === "Enter" || event.key === " ") {
          prop("onDayActivate")?.({ date: cur })
          return
        }
        const next = getFocusDateForKey({
          key: event.key,
          date: cur,
          locale: prop("locale"),
          startOfWeek: prop("startOfWeek"),
        })
        if (next) context.set("focusedDate", next)
      },

      initSlotDrag({ refs, context, event }) {
        refs.set("slotAnchor", event.start)
        context.set("liveSlot", { start: event.start, end: event.end, resource: event.resource })
      },
      updateSlotDragEnd({ refs, context, event, prop, computed, scope }) {
        const anchor = refs.get("slotAnchor")
        if (!anchor) return
        const rect = dom.getGridEl(scope)?.getBoundingClientRect()
        if (!rect) return
        const visibleRange = computed("visibleRange")
        const newEnd = pointToDateTime({
          point: event.point,
          rect,
          range: visibleRange,
          dayStartHour: prop("dayStartHour"),
          dayEndHour: prop("dayEndHour"),
          slotInterval: prop("slotInterval"),
        })
        const [s, e] = anchor.compare(newEnd) <= 0 ? [anchor, newEnd] : [newEnd, anchor]
        context.set("liveSlot", { start: s, end: e, resource: context.get("liveSlot")?.resource })
      },
      invokeOnSlotSelect({ prop, context }) {
        const live = context.get("liveSlot")
        if (!live) return
        const { start: s, end: e } = live
        const isClick = s.compare(e) === 0
        const end = isClick ? s.add({ minutes: prop("slotInterval") }) : e
        context.set("selectedSlot", { start: s, end })
        prop("onSlotSelect")?.({
          start: s,
          end,
          allDay: false,
          action: isClick ? "click" : "drag",
          resource: live.resource,
        })
      },
      clearSlotDrag({ refs, context }) {
        refs.set("slotAnchor", null)
        context.set("liveSlot", null)
      },

      initEventDrag({ refs, context, event, prop }) {
        const evt = findEvent(prop("events"), event.eventId)
        if (!evt) return
        refs.set("dragOrigin", event.point)
        refs.set("dragStartSnapshot", { start: evt.start, end: evt.end })
        context.set("liveDrag", {
          eventId: event.eventId,
          kind: "drag",
          edge: null,
          start: evt.start,
          end: evt.end,
          allDay: !!evt.allDay,
        })
      },
      updateEventDragPosition({ refs, context, event, prop, computed, scope }) {
        const snapshot = refs.get("dragStartSnapshot")
        const prev = context.get("liveDrag")
        if (!snapshot || !prev) return

        const contentRect = dom.getContentRect(scope)
        if (!contentRect) return
        const visibleRange = computed("visibleRange")

        const dragParams = {
          rect: contentRect,
          range: visibleRange,
          dayStartHour: prop("dayStartHour"),
          dayEndHour: prop("dayEndHour"),
          slotInterval: prop("slotInterval"),
        }
        const cursorTime = pointToDateTime({ point: event.point, ...dragParams })
        const dragOrigin = refs.get("dragOrigin")

        // the region under the pointer decides what the event becomes. Reported, never applied.
        const allDay = dom.isPointInAllDayRow(scope, event.point)
        const wasAllDay = !!findEvent(prop("events"), prev.eventId)?.allDay

        let newStart: CalendarDateTime
        let newEnd: CalendarDateTime

        if (allDay) {
          // shifting both ends by the same columns keeps midnight and the span, with no minutes
          const dayDelta = getDaysBetween(
            dayAtPoint(scope, dragOrigin ?? event.point, dragParams),
            dayAtPoint(scope, event.point, dragParams),
          )
          newStart = startOfDay(snapshot.start.add({ days: dayDelta }))
          newEnd = startOfDay(snapshot.end.add({ days: dayDelta }))
        } else if (wasAllDay) {
          // all-day -> timed. A day span can't map to minutes, so it takes the default length.
          newStart = cursorTime
          newEnd = newStart.add({ minutes: DEFAULT_TIMED_DURATION_MINUTES })
        } else {
          const offsetMins = dragOrigin
            ? getMinutesBetween(pointToDateTime({ point: dragOrigin, ...dragParams }), snapshot.start)
            : 0
          newStart = cursorTime.add({ minutes: offsetMins })
          newEnd = newStart.add({ minutes: getMinutesBetween(snapshot.start, snapshot.end) })
        }

        if (prev.start.compare(newStart) !== 0 || prev.end.compare(newEnd) !== 0 || prev.allDay !== allDay) {
          const next = { ...prev, start: newStart, end: newEnd, allDay }
          context.set("liveDrag", { ...next, invalid: !isDropAllowed(prop, next) })
        }
      },
      invokeOnEventDrop({ prop, refs, context }) {
        const live = context.get("liveDrag")
        if (!live) return
        const evt = findEvent(prop("events"), live.eventId)
        if (!evt) return
        const snapshot = refs.get("dragStartSnapshot")
        const { start: newStart, end: newEnd } = live
        if (snapshot && snapshot.start.compare(newStart) === 0 && snapshot.end.compare(newEnd) === 0) return
        if (live.invalid) return
        prop("onEventDrop")?.({
          event: evt,
          newStart,
          newEnd,
          allDay: live.allDay,
          delta: getDropDelta(evt.start, newStart),
          resource: findResource(prop("resources"), evt),
        })
      },

      initEventResize({ refs, context, event, prop }) {
        const evt = findEvent(prop("events"), event.eventId)
        if (!evt) return
        refs.set("dragOrigin", event.point)
        refs.set("dragStartSnapshot", { start: evt.start, end: evt.end })
        context.set("liveDrag", {
          eventId: event.eventId,
          kind: "resize",
          edge: event.edge,
          start: evt.start,
          end: evt.end,
          allDay: !!evt.allDay,
        })
      },
      updateEventResizePosition({ refs, context, event, prop, computed, scope }) {
        const snapshot = refs.get("dragStartSnapshot")
        const prev = context.get("liveDrag")
        if (!snapshot || !prev) return

        const contentRect = dom.getContentRect(scope)
        if (!contentRect) return

        const edge = prev.edge ?? "end"
        const params = {
          rect: contentRect,
          range: computed("visibleRange"),
          dayStartHour: prop("dayStartHour"),
          dayEndHour: prop("dayEndHour"),
          slotInterval: prop("slotInterval"),
        }

        let start: CalendarDateTime
        let end: CalendarDateTime

        if (findEvent(prop("events"), prev.eventId)?.allDay) {
          // `end` is inclusive, so the floor is a single day rather than an empty range
          const day = startOfDay(dayAtPoint(scope, event.point, params))
          start = edge === "start" ? minDateTime(day, snapshot.end) : snapshot.start
          end = edge === "start" ? snapshot.end : maxDateTime(day, snapshot.start)
        } else {
          const newTime = pointToTimeOnDay({
            ...params,
            y: event.point.y,
            rect: contentRect,
            referenceDate: edge === "start" ? snapshot.start : snapshot.end,
          })
          // one slot is the floor, so an edge dragged past the other can't invert the event
          const slot = { minutes: prop("slotInterval") }
          start = edge === "start" ? minDateTime(newTime, snapshot.end.subtract(slot)) : snapshot.start
          end = edge === "start" ? snapshot.end : maxDateTime(newTime, snapshot.start.add(slot))
        }

        if (prev.start.compare(start) !== 0 || prev.end.compare(end) !== 0) {
          const next = { ...prev, start, end }
          context.set("liveDrag", { ...next, invalid: !isDropAllowed(prop, next) })
        }
      },
      invokeOnEventResize({ prop, refs, context }) {
        const live = context.get("liveDrag")
        if (!live) return
        const evt = findEvent(prop("events"), live.eventId)
        if (!evt) return
        const snapshot = refs.get("dragStartSnapshot")
        const { start: newStart, end: newEnd } = live
        const edge = live.edge ?? "end"
        if (snapshot && snapshot.start.compare(newStart) === 0 && snapshot.end.compare(newEnd) === 0) return
        if (live.invalid) return
        prop("onEventResize")?.({ event: evt, newStart, newEnd, edge })
      },

      restoreEventFromSnapshot({ context }) {
        context.set("liveDrag", null)
      },
      clearEventGesture({ refs, context }) {
        refs.set("dragOrigin", null)
        refs.set("dragStartSnapshot", null)
        context.set("liveDrag", null)
      },
    },
  },
})

type LiveDrag = NonNullable<SchedulerSchema["context"]["liveDrag"]>

interface PointParams {
  rect: { left: number; top: number; width: number; height: number }
  range: { start: CalendarDateTime; end: CalendarDateTime }
  dayStartHour: number
  dayEndHour: number
  slotInterval: number
}

/** The day under a point. */
function dayAtPoint(scope: Scope, point: { x: number; y: number }, params: PointParams) {
  const cellDate = dom.getAllDayCellDateAt(scope, point)
  return cellDate ? parseDateTime(cellDate) : pointToDateTime({ point, ...params })
}

/** No `canDropEvent` predicate means every position is allowed. */
function isDropAllowed(prop: PropFn<SchedulerSchema>, live: LiveDrag) {
  const canDrop = prop("canDropEvent")
  if (!canDrop) return true
  const event = findEvent(prop("events"), live.eventId)
  if (!event) return true
  return canDrop({
    event,
    newStart: live.start,
    newEnd: live.end,
    allDay: live.allDay,
    delta: getDropDelta(event.start, live.start),
    resource: findResource(prop("resources"), event),
  })
}
