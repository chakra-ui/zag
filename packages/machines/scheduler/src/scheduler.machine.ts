import { getLocalTimeZone, today } from "@internationalized/date"
import { createMachine, memo } from "@zag-js/core"
import type { DateValue } from "@zag-js/date-utils"
import { getNearestScrollableAncestor, trackPointerMove } from "@zag-js/dom-query"
import * as dom from "./scheduler.dom"
import type { SchedulerSchema } from "./scheduler.types"
import { pointToDateTime, pointToTimeOnDay } from "./utils/drag"
import { getMinutesBetween } from "./utils/time"
import { getNextDate, getPrevDate, getVisibleRange } from "./utils/visible-range"

export const machine = createMachine<SchedulerSchema>({
  props({ props }) {
    return {
      defaultView: "week",
      slotInterval: 30,
      dayStartHour: 0,
      dayEndHour: 24,
      workWeekDays: [1, 2, 3, 4, 5],
      locale: "en-US",
      showCurrentTime: true,
      showWeekNumbers: false,
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
        defaultValue: prop("defaultDate") ?? today(prop("timeZone") ?? getLocalTimeZone()),
        value: prop("date"),
        onChange(date) {
          prop("onDateChange")?.({ date })
        },
      })),
      focusedEventId: bindable<string | null>(() => ({
        defaultValue: null,
      })),
      selectedEventId: bindable<string | null>(() => ({
        defaultValue: null,
      })),
      selectedSlot: bindable<{ start: DateValue; end: DateValue } | null>(() => ({
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
      dragEventId: null,
      dragOrigin: null,
      dragEdge: null,
      dragStartSnapshot: null,
      dragCurrentStart: null,
      dragCurrentEnd: null,
      dragSlotStart: null,
      dragSlotEnd: null,
    }
  },

  computed: {
    visibleRange: memo(
      ({ context, prop }) => [context.get("view"), context.get("date"), prop("locale"), prop("startOfWeek")],
      ([view, date, locale, startOfWeek]) => getVisibleRange(view, date, locale, startOfWeek),
    ),
    isInteractive: ({ prop }) => !prop("disabled"),
  },

  on: {
    SET_VIEW: { actions: ["setView"] },
    SET_DATE: { actions: ["setDate"] },
    GO_TO_TODAY: { actions: ["goToToday"] },
    GO_TO_NEXT: { actions: ["goToNext"] },
    GO_TO_PREV: { actions: ["goToPrev"] },
    EVENT_CLICK: { actions: ["invokeOnEventClick"] },
    EVENT_FOCUS: { actions: ["setFocusedEvent"] },
    EVENT_BLUR: { actions: ["clearFocusedEvent"] },
  },

  states: {
    idle: {
      on: {
        SLOT_POINTER_DOWN: {
          guard: "isNotDisabled",
          target: "slot-selecting",
          actions: ["initSlotDrag", "clearSelectedEvent", "clearSelectedSlot"],
        },
        EVENT_POINTER_DOWN: {
          guard: "canDragEvent",
          target: "event-dragging",
          actions: ["initEventDrag"],
        },
        RESIZE_HANDLE_POINTER_DOWN: {
          guard: "canResizeEvent",
          target: "event-resizing",
          actions: ["initEventResize"],
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
          actions: ["invokeOnEventDrop", "clearEventDrag"],
        },
        ESCAPE: {
          target: "idle",
          actions: ["restoreEventFromSnapshot", "clearEventDrag"],
        },
      },
    },

    "event-resizing": {
      effects: ["trackPointerMove"],
      on: {
        POINTER_MOVE: { actions: ["updateEventResizePosition"] },
        POINTER_UP: {
          target: "idle",
          actions: ["invokeOnEventResize", "clearEventDrag"],
        },
        ESCAPE: {
          target: "idle",
          actions: ["restoreEventFromSnapshot", "clearEventDrag"],
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
        const evt = prop("events")?.find((e) => e.id === event.eventId)
        if (!evt || evt.disabled) return false
        return prop("canDragEvent")?.(evt) ?? true
      },
      canResizeEvent({ prop, event }) {
        if (prop("disabled")) return false
        const evt = prop("events")?.find((e) => e.id === event.eventId)
        if (!evt || evt.disabled) return false
        return prop("canResizeEvent")?.(evt) ?? true
      },
    },

    effects: {
      trackPointerMove({ scope, send }) {
        let rafId: number | null = null
        let latest: { x: number; y: number } | null = null
        const win = scope.getWin()

        const EDGE_THRESHOLD = 50
        const MAX_SCROLL_SPEED = 12
        const gridEl = dom.getGridEl(scope)
        const scrollEl = gridEl ? getNearestScrollableAncestor(gridEl) : null
        let scrollRafId: number | null = null
        let scrollDir = 0

        const stopScroll = () => {
          if (scrollRafId != null) {
            win.cancelAnimationFrame(scrollRafId)
            scrollRafId = null
          }
          scrollDir = 0
        }

        const startScroll = () => {
          if (scrollRafId != null || !scrollEl) return
          const tick = () => {
            if (!scrollEl || scrollDir === 0) {
              scrollRafId = null
              return
            }
            scrollEl.scrollTop += scrollDir
            scrollRafId = win.requestAnimationFrame(tick)
          }
          scrollRafId = win.requestAnimationFrame(tick)
        }

        const maybeAutoScroll = (point: { x: number; y: number }) => {
          if (!scrollEl) return
          const rect = scrollEl.getBoundingClientRect()
          const fromTop = point.y - rect.top
          const fromBottom = rect.bottom - point.y
          if (fromTop < EDGE_THRESHOLD && fromTop > -EDGE_THRESHOLD) {
            const proximity = 1 - Math.max(0, fromTop) / EDGE_THRESHOLD
            scrollDir = -Math.ceil(proximity * MAX_SCROLL_SPEED)
            startScroll()
          } else if (fromBottom < EDGE_THRESHOLD && fromBottom > -EDGE_THRESHOLD) {
            const proximity = 1 - Math.max(0, fromBottom) / EDGE_THRESHOLD
            scrollDir = Math.ceil(proximity * MAX_SCROLL_SPEED)
            startScroll()
          } else {
            stopScroll()
          }
        }

        const cleanupTracker = trackPointerMove(scope.getDoc(), {
          onPointerMove(info) {
            latest = info.point
            maybeAutoScroll(info.point)
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
            stopScroll()
            send({ type: "POINTER_UP" })
          },
        })

        return () => {
          stopScroll()
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
        context.set("date", today(prop("timeZone") ?? getLocalTimeZone()))
      },
      goToNext({ context }) {
        context.set("date", getNextDate(context.get("view"), context.get("date")))
      },
      goToPrev({ context }) {
        context.set("date", getPrevDate(context.get("view"), context.get("date")))
      },
      invokeOnEventClick({ context, prop, event }) {
        const evt = prop("events")?.find((e) => e.id === event.eventId)
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

      initSlotDrag({ refs, context, event }) {
        refs.set("dragSlotStart", event.start)
        refs.set("dragSlotEnd", event.end)
        context.set("liveSlot", { start: event.start, end: event.end })
      },
      updateSlotDragEnd({ refs, context, event, prop, computed, scope }) {
        const gridEl = dom.getGridEl(scope)
        if (!gridEl) return
        const rect = gridEl.getBoundingClientRect()
        const visibleRange = computed("visibleRange")
        const newEnd = pointToDateTime(
          event.point,
          rect,
          visibleRange,
          prop("dayStartHour"),
          prop("dayEndHour"),
          prop("slotInterval"),
        )
        refs.set("dragSlotEnd", newEnd)
        const start = refs.get("dragSlotStart")
        if (start) {
          const [s, e] = start.compare(newEnd) <= 0 ? [start, newEnd] : [newEnd, start]
          context.set("liveSlot", { start: s, end: e })
        }
      },
      invokeOnSlotSelect({ prop, refs, context }) {
        const start = refs.get("dragSlotStart")
        const end = refs.get("dragSlotEnd")
        if (!start || !end) return
        const [s, e] = start.compare(end) <= 0 ? [start, end] : [end, start]
        if (s.compare(e) === 0) {
          const slotEnd = s.add({ minutes: prop("slotInterval") })
          context.set("selectedSlot", { start: s, end: slotEnd })
          prop("onSlotClick")?.({ start: s, end: slotEnd, allDay: false })
          return
        }
        context.set("selectedSlot", { start: s, end: e })
        prop("onSlotRangeSelect")?.({ start: s, end: e })
      },
      clearSlotDrag({ refs, context }) {
        refs.set("dragSlotStart", null)
        refs.set("dragSlotEnd", null)
        context.set("liveSlot", null)
      },

      initEventDrag({ refs, context, event, prop }) {
        const evt = prop("events")?.find((e) => e.id === event.eventId)
        if (!evt) return
        refs.set("dragEventId", event.eventId)
        refs.set("dragOrigin", event.point)
        refs.set("dragStartSnapshot", { start: evt.start, end: evt.end })
        refs.set("dragCurrentStart", evt.start)
        refs.set("dragCurrentEnd", evt.end)
        context.set("liveDrag", { eventId: event.eventId, kind: "drag", edge: null, start: evt.start, end: evt.end })
      },
      updateEventDragPosition({ refs, context, event, prop, computed, scope }) {
        const gridEl = dom.getGridEl(scope)
        if (!gridEl) return
        const gridRect = gridEl.getBoundingClientRect()
        const visibleRange = computed("visibleRange")

        const firstCol = gridEl.querySelector("[data-scheduler-day-column]") as HTMLElement | null
        const colRect = firstCol?.getBoundingClientRect()
        const contentRect = colRect
          ? { left: colRect.left, top: colRect.top, width: gridRect.right - colRect.left, height: colRect.height }
          : gridRect

        const snapshot = refs.get("dragStartSnapshot")
        if (!snapshot) return

        const cursorTime = pointToDateTime(
          event.point,
          contentRect,
          visibleRange,
          prop("dayStartHour"),
          prop("dayEndHour"),
          prop("slotInterval"),
        )

        const dragOrigin = refs.get("dragOrigin")
        let newStart = cursorTime
        if (dragOrigin) {
          const originTime = pointToDateTime(
            dragOrigin,
            contentRect,
            visibleRange,
            prop("dayStartHour"),
            prop("dayEndHour"),
            prop("slotInterval"),
          )
          const offsetMins = getMinutesBetween(originTime, snapshot.start)
          newStart = cursorTime.add({ minutes: offsetMins })
        }

        const durationMins = getMinutesBetween(snapshot.start, snapshot.end)
        const newEnd = newStart.add({ minutes: durationMins })
        refs.set("dragCurrentStart", newStart)
        refs.set("dragCurrentEnd", newEnd)
        const eventId = refs.get("dragEventId")
        const prev = context.get("liveDrag")
        if (eventId && (!prev || prev.start.compare(newStart) !== 0 || prev.end.compare(newEnd) !== 0)) {
          context.set("liveDrag", { eventId, kind: "drag", edge: null, start: newStart, end: newEnd })
        }
      },
      invokeOnEventDrop({ prop, refs }) {
        const eventId = refs.get("dragEventId")
        const evt = prop("events")?.find((e) => e.id === eventId)
        if (!evt) return
        const snapshot = refs.get("dragStartSnapshot")
        const newStart = refs.get("dragCurrentStart") ?? evt.start
        const newEnd = refs.get("dragCurrentEnd") ?? evt.end
        if (snapshot && snapshot.start.compare(newStart) === 0 && snapshot.end.compare(newEnd) === 0) return
        prop("onEventDrop")?.({ event: evt, newStart, newEnd })
      },

      initEventResize({ refs, context, event, prop }) {
        const evt = prop("events")?.find((e) => e.id === event.eventId)
        if (!evt) return
        refs.set("dragEventId", event.eventId)
        refs.set("dragEdge", event.edge)
        refs.set("dragOrigin", event.point)
        refs.set("dragStartSnapshot", { start: evt.start, end: evt.end })
        refs.set("dragCurrentStart", evt.start)
        refs.set("dragCurrentEnd", evt.end)
        context.set("liveDrag", {
          eventId: event.eventId,
          kind: "resize",
          edge: event.edge,
          start: evt.start,
          end: evt.end,
        })
      },
      updateEventResizePosition({ refs, context, event, prop, scope }) {
        const gridEl = dom.getGridEl(scope)
        if (!gridEl) return
        const gridRect = gridEl.getBoundingClientRect()
        const firstCol = gridEl.querySelector("[data-scheduler-day-column]") as HTMLElement | null
        const colRect = firstCol?.getBoundingClientRect()
        const contentTop = colRect ? colRect.top : gridRect.top
        const contentHeight = colRect ? colRect.height : gridRect.height

        const edge = refs.get("dragEdge")
        const snapshot = refs.get("dragStartSnapshot")
        if (!snapshot) return
        const refDate = edge === "start" ? snapshot.start : snapshot.end
        const newTime = pointToTimeOnDay(
          event.point.y,
          contentTop,
          contentHeight,
          prop("dayStartHour"),
          prop("dayEndHour"),
          prop("slotInterval"),
          refDate,
        )
        if (edge === "start") {
          refs.set("dragCurrentStart", newTime)
        } else {
          refs.set("dragCurrentEnd", newTime)
        }
        const eventId = refs.get("dragEventId")
        const start = refs.get("dragCurrentStart")
        const end = refs.get("dragCurrentEnd")
        const prev = context.get("liveDrag")
        if (eventId && start && end && (!prev || prev.start.compare(start) !== 0 || prev.end.compare(end) !== 0)) {
          context.set("liveDrag", { eventId, kind: "resize", edge: edge ?? "end", start, end })
        }
      },
      invokeOnEventResize({ prop, refs }) {
        const eventId = refs.get("dragEventId")
        const evt = prop("events")?.find((e) => e.id === eventId)
        if (!evt) return
        const snapshot = refs.get("dragStartSnapshot")
        const newStart = refs.get("dragCurrentStart") ?? evt.start
        const newEnd = refs.get("dragCurrentEnd") ?? evt.end
        const edge = refs.get("dragEdge") ?? "end"
        if (snapshot && snapshot.start.compare(newStart) === 0 && snapshot.end.compare(newEnd) === 0) return
        prop("onEventResize")?.({ event: evt, newStart, newEnd, edge })
      },

      restoreEventFromSnapshot({ refs, context }) {
        const snapshot = refs.get("dragStartSnapshot")
        if (!snapshot) return
        refs.set("dragCurrentStart", snapshot.start)
        refs.set("dragCurrentEnd", snapshot.end)
        context.set("liveDrag", null)
      },
      clearEventDrag({ refs, context }) {
        refs.set("dragEventId", null)
        refs.set("dragOrigin", null)
        refs.set("dragEdge", null)
        refs.set("dragStartSnapshot", null)
        refs.set("dragCurrentStart", null)
        refs.set("dragCurrentEnd", null)
        context.set("liveDrag", null)
      },
    },
  },
})
