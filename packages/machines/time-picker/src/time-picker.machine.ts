import { Time } from "@internationalized/date"
import { setup } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { raf } from "@zag-js/dom-query"
import { getPlacement, type Placement } from "@zag-js/popper"
import { match, next, prev } from "@zag-js/utils"
import * as dom from "./time-picker.dom"
import type { TimePickerSchema, TimeUnit } from "./time-picker.types"
import { isTimeEqual } from "./utils/assertion"
import { clampTime, stringToTime, timeToString } from "./utils/conversion"
import { getHourFormat } from "./utils/hour-format"

const {
  guards: { and },
  createMachine,
} = setup<TimePickerSchema>()

export const machine = createMachine({
  props({ props }) {
    return {
      locale: "en-US",
      ...props,
      positioning: {
        placement: "bottom-start",
        gutter: 8,
        ...props.positioning,
      },
    }
  },

  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen")
    return open ? "open" : "idle"
  },

  context({ prop, bindable, getComputed }) {
    return {
      value: bindable(() => ({
        value: prop("value"),
        defaultValue: prop("defaultValue"),
        hash(a) {
          return a?.toString() ?? ""
        },
        isEqual: isTimeEqual,
        onChange(value) {
          const computed = getComputed()
          const valueAsString = timeToString(value, prop("locale"), computed("hourFormat").is12Hour)
          prop("onValueChange")?.({ value, valueAsString })
        },
      })),
      focusedColumn: bindable<TimeUnit>(() => ({
        defaultValue: "hour",
      })),
      focusedValue: bindable(() => ({
        defaultValue: null,
      })),
      currentTime: bindable<Time | null>(() => ({
        defaultValue: null,
      })),
      currentPlacement: bindable<Placement | undefined>(() => ({
        defaultValue: undefined,
      })),
      restoreFocus: bindable<boolean | undefined>(() => ({
        defaultValue: undefined,
      })),
    }
  },

  computed: {
    valueAsString: ({ context, prop }) => {
      return timeToString(context.get("value"), prop("locale"), prop("allowSeconds"))
    },
    hourFormat: ({ prop }) => {
      return getHourFormat(prop("locale"))
    },
  },

  watch({ track, action, prop, context }) {
    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })
    track([() => context.hash("value")], () => {
      action(["syncInputElement"])
    })
    track([() => context.get("focusedColumn")], () => {
      action(["syncFocusedValue"])
    })
    track([() => context.get("focusedValue")], () => {
      action(["focusCell"])
    })
  },

  on: {
    "VALUE.CLEAR": {
      actions: ["clearValue", "focusInputEl"],
    },
    "VALUE.SET": {
      actions: ["setValue"],
    },
    "UNIT.SET": {
      actions: ["setUnitValue"],
    },
    "INPUT.ENTER": {
      actions: ["selectParsedTime"],
    },
    // "INPUT.BLUR": {
    //   target: "idle",
    //   actions: ["selectParsedTime"],
    // },
  },

  states: {
    idle: {
      tags: ["closed"],
      on: {
        "INPUT.FOCUS": {
          target: "focused",
        },
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen"],
          },
        ],
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen"],
          },
        ],
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["invokeOnOpen"],
        },
      },
    },
    focused: {
      tags: ["closed"],
      on: {
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen"],
          },
        ],
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen"],
          },
        ],
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["invokeOnOpen"],
        },
      },
    },
    open: {
      tags: ["open"],
      entry: ["setCurrentTime", "scrollColumnsToTop", "focusHourColumn"],
      exit: ["resetFocusedCell"],
      effects: ["computePlacement", "trackDismissableElement"],
      on: {
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "focused",
            actions: ["invokeOnClose"],
          },
        ],
        "INPUT.ENTER": {
          actions: ["selectParsedTime"],
        },
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "idle",
            actions: ["invokeOnClose"],
          },
        ],
        "CONTROLLED.CLOSE": [
          {
            guard: and("shouldRestoreFocus", "isInteractOutsideEvent"),
            target: "focused",
            actions: ["focusTriggerElement"],
          },
          {
            guard: "shouldRestoreFocus",
            target: "focused",
            actions: ["focusInputElement"],
          },
          {
            target: "idle",
          },
        ],
        "CONTENT.ESCAPE": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "focused",
            actions: ["invokeOnClose", "focusInputElement"],
          },
        ],
        INTERACT_OUTSIDE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            guard: "shouldRestoreFocus",
            target: "focused",
            actions: ["invokeOnClose", "focusTriggerElement"],
          },
          {
            target: "idle",
            actions: ["invokeOnClose"],
          },
        ],
        "POSITIONING.SET": {
          actions: ["reposition"],
        },
        "UNIT.CLICK": {
          actions: ["setFocusedValue", "setFocusedColumn", "setUnitValue"],
        },
        "CONTENT.ARROW_UP": {
          actions: ["focusPreviousCell"],
        },
        "CONTENT.ARROW_DOWN": {
          actions: ["focusNextCell"],
        },
        "CONTENT.ARROW_LEFT": {
          actions: ["focusPreviousColumnCell"],
        },
        "CONTENT.ARROW_RIGHT": {
          actions: ["focusNextColumnCell"],
        },
        "CONTENT.ENTER": {
          actions: ["selectFocusedCell", "focusNextColumnCell"],
        },
      },
    },
  },

  implementations: {
    guards: {
      shouldRestoreFocus: ({ refs }) => !!refs.get("restoreFocus"),
      isOpenControlled: ({ prop }) => prop("open") != null,
      isInteractOutsideEvent: ({ event }) => event.previousEvent?.type === "INTERACT_OUTSIDE",
    },

    effects: {
      computePlacement({ context, prop, scope }) {
        context.set("currentPlacement", prop("positioning").placement)
        const anchorEl = () => dom.getControlEl(scope)
        const positionerEl = () => dom.getPositionerEl(scope)
        return getPlacement(anchorEl, positionerEl, {
          defer: true,
          ...prop("positioning"),
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },

      trackDismissableElement({ prop, scope, send, refs }) {
        if (prop("disableLayer")) return
        const contentEl = () => dom.getContentEl(scope)
        return trackDismissableElement(contentEl, {
          defer: true,
          exclude: [dom.getTriggerEl(scope), dom.getClearTriggerEl(scope), dom.getInputEl(scope)],
          onEscapeKeyDown(event) {
            event.preventDefault()
            refs.set("restoreFocus", true)
            send({ type: "CONTENT.ESCAPE" })
          },
          onInteractOutside(event) {
            refs.set("restoreFocus", !event.detail.focusable)
          },
          onDismiss() {
            send({ type: "INTERACT_OUTSIDE" })
          },
        })
      },
    },

    actions: {
      reposition({ context, prop, scope, event }) {
        const positionerEl = () => dom.getPositionerEl(scope)
        getPlacement(dom.getTriggerEl(scope), positionerEl, {
          ...prop("positioning"),
          ...event.options,
          defer: true,
          listeners: false,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },

      toggleVisibility({ prop, send, event }) {
        send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: event })
      },

      invokeOnOpen({ prop }) {
        prop("onOpenChange")?.({ open: true })
      },

      invokeOnClose({ prop }) {
        prop("onOpenChange")?.({ open: false })
      },

      selectParsedTime({ context, event, prop }) {
        let parsedTime = stringToTime(event.value, prop("locale"))
        if (!parsedTime) return
        const nextTime = clampTime(parsedTime, prop("min"), prop("max"))
        context.set("value", nextTime)
      },

      syncInputElement({ scope, computed }) {
        const inputEl = dom.getInputEl(scope)
        if (!inputEl) return
        inputEl.value = computed("valueAsString")
      },

      focusInputEl({ scope }) {
        raf(() => {
          dom.getInputEl(scope)?.focus()
        })
      },

      setUnitValue({ context, event, computed }) {
        const { unit, value } = event
        const current = context.get("value") ?? context.get("currentTime")
        if (!current) return

        const hourFormat = computed("hourFormat")

        const nextTime = match(unit, {
          hour: () => {
            // Use centralized hour format logic
            const hour24 = hourFormat.preservePeriodHour(value, current.hour)
            return current.set({ hour: hour24 })
          },
          minute: () => current.set({ minute: value }),
          second: () => current.set({ second: value }),
          period: () => {
            // Convert current hour to 12-hour format, then back to 24-hour with new period
            const hour12 = hourFormat.to12Hour(current.hour)
            const newHour24 = hourFormat.to24Hour(hour12, value)
            return current.set({ hour: newHour24 })
          },
        })

        if (!nextTime) return
        context.set("value", nextTime)
      },

      setValue({ context, event }) {
        if (!(event.value instanceof Time)) return
        context.set("value", event.value)
      },

      clearValue({ context }) {
        context.set("value", null)
      },

      setFocusedValue({ context, event }) {
        context.set("focusedValue", event.value)
      },

      setFocusedColumn({ context, event }) {
        context.set("focusedColumn", event.unit)
      },

      resetFocusedCell({ context }) {
        context.set("focusedColumn", "hour")
        context.set("focusedValue", null)
      },

      setCurrentTime({ context }) {
        const date = new Date()
        const currentTime = new Time(date.getHours(), date.getMinutes(), date.getSeconds())
        context.set("currentTime", currentTime)
      },

      scrollColumnsToTop({ scope }) {
        raf(() => {
          const columnEls = dom.getColumnEls(scope)
          for (const columnEl of columnEls) {
            const cellEl = dom.getInitialFocusCell(scope, columnEl.dataset.unit as TimeUnit)
            if (!cellEl) continue
            columnEl.scrollTop = cellEl.offsetTop - 4
          }
        })
      },

      focusTriggerElement({ scope }) {
        dom.getTriggerEl(scope)?.focus({ preventScroll: true })
      },

      focusInputElement({ scope }) {
        dom.getInputEl(scope)?.focus({ preventScroll: true })
      },

      focusHourColumn({ context, scope }) {
        raf(() => {
          const hourEl = dom.getInitialFocusCell(scope, "hour")
          if (!hourEl) return
          context.set("focusedValue", dom.getCellValue(hourEl))
        })
      },

      focusPreviousCell({ context, scope }) {
        raf(() => {
          const cells = dom.getColumnCellEls(scope, context.get("focusedColumn"))
          const focusedEl = dom.getFocusedCell(scope)
          const focusedIndex = focusedEl ? cells.indexOf(focusedEl) : -1
          const prevCell = prev(cells, focusedIndex, { loop: false })
          if (!prevCell) return
          context.set("focusedValue", dom.getCellValue(prevCell))
        })
      },

      focusNextCell({ context, scope }) {
        raf(() => {
          const cells = dom.getColumnCellEls(scope, context.get("focusedColumn"))
          const focusedEl = dom.getFocusedCell(scope)
          const focusedIndex = focusedEl ? cells.indexOf(focusedEl) : -1

          const nextCell = next(cells, focusedIndex, { loop: false })
          if (!nextCell) return

          context.set("focusedValue", dom.getCellValue(nextCell))
        })
      },

      selectFocusedCell({ context, computed }) {
        const current = context.get("value") ?? context.get("currentTime") ?? new Time(0)
        const hourFormat = computed("hourFormat")

        let value = context.get("focusedValue")
        let column = context.get("focusedColumn")

        if (column === "hour" && hourFormat.is12Hour) {
          // Use centralized hour format logic to preserve period
          value = hourFormat.preservePeriodHour(value, current.hour)
        } else if (context.get("focusedColumn") === "period") {
          column = "hour"
          // Convert current hour to 12-hour format, then back to 24-hour with new period
          const hour12 = hourFormat.to12Hour(current.hour)
          value = hourFormat.to24Hour(hour12, value)
        }

        const nextTime = current.set({ [column]: value })
        context.set("value", nextTime)
      },

      focusPreviousColumnCell({ context, scope }) {
        raf(() => {
          const columns = dom.getColumnEls(scope)
          const currentColumnEl = dom.getColumnEl(scope, context.get("focusedColumn"))
          const focusedIndex = columns.indexOf(currentColumnEl!)

          const prevColumnEl = prev(columns, focusedIndex, { loop: false })
          if (!prevColumnEl) return

          context.set("focusedColumn", dom.getColumnUnit(prevColumnEl))
        })
      },

      focusNextColumnCell({ context, scope }) {
        raf(() => {
          const columns = dom.getColumnEls(scope)
          const currentColumnEl = dom.getColumnEl(scope, context.get("focusedColumn"))
          const focusedIndex = columns.indexOf(currentColumnEl!)

          const nextColumnEl = next(columns, focusedIndex, { loop: false })
          if (!nextColumnEl) return

          context.set("focusedColumn", dom.getColumnUnit(nextColumnEl))
        })
      },

      focusCell({ scope }) {
        queueMicrotask(() => {
          const cellEl = dom.getFocusedCell(scope)
          cellEl?.focus()
        })
      },

      syncFocusedValue({ context, scope }) {
        if (context.get("focusedValue") === null) return
        queueMicrotask(() => {
          const cellEl = dom.getInitialFocusCell(scope, context.get("focusedColumn"))
          context.set("focusedValue", dom.getCellValue(cellEl))
        })
      },
    },
  },
})
