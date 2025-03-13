import { Time } from "@internationalized/date"
import { createGuards, createMachine } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { raf } from "@zag-js/dom-query"
import { getPlacement, type Placement } from "@zag-js/popper"
import { match, next, prev } from "@zag-js/utils"
import * as dom from "./time-picker.dom"
import type { TimePickerSchema, TimeUnit } from "./time-picker.types"
import {
  clampTime,
  getCurrentTime,
  getHourPeriod,
  getValueString,
  getTimeValue,
  is12HourFormat,
  isTimeEqual,
} from "./time-picker.utils"

const { and } = createGuards<TimePickerSchema>()

export const machine = createMachine<TimePickerSchema>({
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
          const valueAsString = getValueString(value, computed("hour12"), computed("period"), prop("allowSeconds"))
          prop("onValueChange")?.({ value, valueAsString })
        },
      })),
      focusedColumn: bindable<TimeUnit>(() => ({ defaultValue: "hour" })),
      focusedValue: bindable(() => ({ defaultValue: null })),
      currentTime: bindable<Time | null>(() => ({ defaultValue: null })),
      currentPlacement: bindable<Placement | undefined>(() => ({ defaultValue: undefined })),
      restoreFocus: bindable<boolean | undefined>(() => ({ defaultValue: undefined })),
    }
  },

  computed: {
    valueAsString: ({ context, prop, computed }) =>
      getValueString(context.get("value"), computed("hour12"), computed("period"), prop("allowSeconds")),
    hour12: ({ prop }) => is12HourFormat(prop("locale")),
    period: ({ context, prop }) => getHourPeriod(context.get("value")?.hour, prop("locale")),
  },

  watch({ track, action, prop, context, computed }) {
    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })
    track([() => context.hash("value"), () => computed("period")], () => {
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
      actions: ["clearValue"],
    },
    "VALUE.SET": {
      actions: ["setValue"],
    },
    "UNIT.SET": {
      actions: ["setUnitValue"],
    },
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
        "INPUT.ENTER": {
          actions: ["setInputValue", "clampTimeValue"],
        },
        "INPUT.BLUR": {
          target: "idle",
          actions: ["setInputValue", "clampTimeValue"],
        },
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
          actions: ["setInputValue", "clampTimeValue"],
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
      shouldRestoreFocus: ({ context }) => !!context.get("restoreFocus"),
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

      trackDismissableElement({ context, prop, scope, send }) {
        if (prop("disableLayer")) return
        const contentEl = () => dom.getContentEl(scope)
        return trackDismissableElement(contentEl, {
          defer: true,
          exclude: [dom.getTriggerEl(scope), dom.getClearTriggerEl(scope)],
          onEscapeKeyDown(event) {
            event.preventDefault()
            context.set("restoreFocus", true)
            send({ type: "CONTENT.ESCAPE" })
          },
          onInteractOutside(event) {
            context.set("restoreFocus", !event.detail.focusable)
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

      setInputValue({ context, event, prop, computed }) {
        const timeValue = getTimeValue(prop("locale"), computed("period"), event.value)
        if (!timeValue) return
        context.set("value", timeValue.time)
      },

      syncInputElement({ scope, computed }) {
        const inputEl = dom.getInputEl(scope)
        if (!inputEl) return
        inputEl.value = computed("valueAsString")
      },

      setUnitValue({ context, event, computed }) {
        const { unit, value } = event
        const _value = context.get("value")
        const current = _value ?? context.get("currentTime") ?? new Time(0)
        const nextTime = match(unit, {
          hour: () => current.set({ hour: computed("hour12") ? value + 12 : value }),
          minute: () => current.set({ minute: value }),
          second: () => current.set({ second: value }),
          period: () => {
            if (!_value) return
            const diff = value === "pm" ? 12 : 0
            return _value.set({ hour: (_value.hour % 12) + diff })
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

      clampTimeValue({ context, prop }) {
        const value = context.get("value")
        if (!value) return
        const nextTime = clampTime(value, prop("min"), prop("max"))
        context.set("value", nextTime)
      },

      setCurrentTime({ context }) {
        context.set("currentTime", getCurrentTime())
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

        let value = context.get("focusedValue")
        let column = context.get("focusedColumn")

        if (column === "hour" && computed("hour12")) {
          value = computed("hour12") ? value + 12 : value
        } else if (context.get("focusedColumn") === "period") {
          column = "hour"
          const diff = value === "pm" ? 12 : 0
          value = (current.hour % 12) + diff
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
