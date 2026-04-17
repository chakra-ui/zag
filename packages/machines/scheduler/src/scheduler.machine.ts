import { createMachine, memo } from "@zag-js/core"
import { trackPointerMove } from "@zag-js/dom-query"
import { getLocalTimeZone, today } from "@internationalized/date"
import * as dom from "./scheduler.dom"
import type { SchedulerSchema } from "./scheduler.types"
import { getMinutesBetween } from "./utils/time"
import { getNextDate, getPrevDate, getVisibleRange } from "./utils/visible-range"
import { pointToDateTime, pointToTimeOnDay } from "./utils/drag"

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
      selectedSlot: bindable<{
        start: import("@internationalized/date").DateValue
        end: import("@internationalized/date").DateValue
        resourceId?: string
      } | null>(() => ({
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
      ({ context, prop }) => [context.get("view"), context.get("date"), prop("locale")] as const,
      ([view, date, locale]) => getVisibleRange(view, date, locale),
    ),
    isInteractive: () => true,
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
          target: "slot-selecting",
          actions: ["initSlotDrag"],
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
      canDragEvent({ prop, event }) {
        const evt = prop("events")?.find((e) => e.id === event.eventId)
        if (!evt || evt.disabled) return false
        return prop("canDragEvent")?.(evt) ?? true
      },
      canResizeEvent({ prop, event }) {
        const evt = prop("events")?.find((e) => e.id === event.eventId)
        if (!evt || evt.disabled) return false
        return prop("canResizeEvent")?.(evt) ?? true
      },
    },

    effects: {
      trackPointerMove({ scope, send }) {
        return trackPointerMove(scope.getDoc(), {
          onPointerMove(info) {
            send({ type: "POINTER_MOVE", point: info.point })
          },
          onPointerUp() {
            send({ type: "POINTER_UP" })
          },
        })
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
      invokeOnEventClick({ prop, event }) {
        const evt = prop("events")?.find((e) => e.id === event.eventId)
        if (!evt) return
        prop("onEventClick")?.({ event: evt })
      },
      setFocusedEvent({ context, event }) {
        context.set("focusedEventId", event.eventId)
      },
      clearFocusedEvent({ context }) {
        context.set("focusedEventId", null)
      },

      initSlotDrag({ refs, event }) {
        refs.set("dragSlotStart", event.start)
        refs.set("dragSlotEnd", event.end)
      },
      updateSlotDragEnd({ refs, event, prop, computed, scope }) {
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
      },
      invokeOnSlotSelect({ prop, refs }) {
        const start = refs.get("dragSlotStart")
        const end = refs.get("dragSlotEnd")
        if (!start || !end) return
        const [s, e] = start.compare(end) <= 0 ? [start, end] : [end, start]
        prop("onSlotSelect")?.({ start: s, end: e })
      },
      clearSlotDrag({ refs }) {
        refs.set("dragSlotStart", null)
        refs.set("dragSlotEnd", null)
      },

      initEventDrag({ refs, event, prop }) {
        const evt = prop("events")?.find((e) => e.id === event.eventId)
        if (!evt) return
        refs.set("dragEventId", event.eventId)
        refs.set("dragOrigin", event.point)
        refs.set("dragStartSnapshot", { start: evt.start, end: evt.end })
        refs.set("dragCurrentStart", evt.start)
        refs.set("dragCurrentEnd", evt.end)
      },
      updateEventDragPosition({ refs, event, prop, computed, scope }) {
        const gridEl = dom.getGridEl(scope)
        if (!gridEl) return
        const rect = gridEl.getBoundingClientRect()
        const visibleRange = computed("visibleRange")
        const newStart = pointToDateTime(
          event.point,
          rect,
          visibleRange,
          prop("dayStartHour"),
          prop("dayEndHour"),
          prop("slotInterval"),
        )
        const snapshot = refs.get("dragStartSnapshot")
        if (!snapshot) return
        const durationMins = getMinutesBetween(snapshot.start, snapshot.end)
        refs.set("dragCurrentStart", newStart)
        refs.set("dragCurrentEnd", newStart.add({ minutes: durationMins }))
      },
      invokeOnEventDrop({ prop, refs }) {
        const eventId = refs.get("dragEventId")
        const evt = prop("events")?.find((e) => e.id === eventId)
        if (!evt) return
        const newStart = refs.get("dragCurrentStart") ?? evt.start
        const newEnd = refs.get("dragCurrentEnd") ?? evt.end
        prop("onEventDrop")?.({ event: evt, newStart, newEnd })
      },

      initEventResize({ refs, event, prop }) {
        const evt = prop("events")?.find((e) => e.id === event.eventId)
        if (!evt) return
        refs.set("dragEventId", event.eventId)
        refs.set("dragEdge", event.edge)
        refs.set("dragOrigin", event.point)
        refs.set("dragStartSnapshot", { start: evt.start, end: evt.end })
        refs.set("dragCurrentStart", evt.start)
        refs.set("dragCurrentEnd", evt.end)
      },
      updateEventResizePosition({ refs, event, prop, scope }) {
        const gridEl = dom.getGridEl(scope)
        if (!gridEl) return
        const rect = gridEl.getBoundingClientRect()
        const edge = refs.get("dragEdge")
        const snapshot = refs.get("dragStartSnapshot")
        if (!snapshot) return
        const refDate = edge === "start" ? snapshot.start : snapshot.end
        const newTime = pointToTimeOnDay(
          event.point.y,
          rect.top,
          rect.height,
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
      },
      invokeOnEventResize({ prop, refs }) {
        const eventId = refs.get("dragEventId")
        const evt = prop("events")?.find((e) => e.id === eventId)
        if (!evt) return
        const newStart = refs.get("dragCurrentStart") ?? evt.start
        const newEnd = refs.get("dragCurrentEnd") ?? evt.end
        const edge = refs.get("dragEdge") ?? "end"
        prop("onEventResize")?.({ event: evt, newStart, newEnd, edge })
      },

      restoreEventFromSnapshot({ refs }) {
        const snapshot = refs.get("dragStartSnapshot")
        if (!snapshot) return
        refs.set("dragCurrentStart", snapshot.start)
        refs.set("dragCurrentEnd", snapshot.end)
      },
      clearEventDrag({ refs }) {
        refs.set("dragEventId", null)
        refs.set("dragOrigin", null)
        refs.set("dragEdge", null)
        refs.set("dragStartSnapshot", null)
        refs.set("dragCurrentStart", null)
        refs.set("dragCurrentEnd", null)
      },
    },
  },
})
