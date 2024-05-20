import { Time } from "@internationalized/date"
import { createMachine, guards } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { raf } from "@zag-js/dom-query"
import { getPlacement } from "@zag-js/popper"
import { compact, isEqual, match, next, prev } from "@zag-js/utils"
import { dom } from "./time-picker.dom"
import type { MachineContext, MachineState, TimeUnit, UserDefinedContext } from "./time-picker.types"
import {
  clampTime,
  getCurrentTime,
  getHourPeriod,
  getStringifiedValue,
  getTimeValue,
  is12HourFormat,
} from "./time-picker.utils"

const { and } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "time-picker",
      initial: ctx.open ? "open" : "idle",
      context: {
        value: null,
        locale: "en-US",
        ...ctx,
        focusedColumn: "hour",
        focusedValue: null,
        currentTime: null,
        positioning: {
          placement: "bottom-start",
          gutter: 8,
          ...ctx.positioning,
        },
      },

      computed: {
        valueAsString: (ctx) => getStringifiedValue(ctx),
        hour12: (ctx) => is12HourFormat(ctx.locale),
        period: (ctx) => getHourPeriod(ctx.value?.hour),
      },

      watch: {
        open: ["toggleVisibility"],
        value: ["syncInputElement"],
        period: ["syncInputElement"],
        focusedColumn: ["syncFocusedValue"],
        focusedValue: ["focusCell"],
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
          activities: ["computePlacement", "trackDismissableElement"],
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
    },
    {
      guards: {
        shouldRestoreFocus: (ctx) => !!ctx.restoreFocus,
        isOpenControlled: (ctx) => !!ctx["open.controlled"],
        isInteractOutsideEvent: (_ctx, evt) => evt.previousEvent?.type === "INTERACT_OUTSIDE",
      },
      activities: {
        computePlacement(ctx) {
          ctx.currentPlacement = ctx.positioning.placement
          const anchorEl = () => dom.getControlEl(ctx)
          const positionerEl = () => dom.getPositionerEl(ctx)
          return getPlacement(anchorEl, positionerEl, {
            defer: true,
            ...ctx.positioning,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        trackDismissableElement(ctx, _evt, { send }) {
          if (ctx.disableLayer) return
          return trackDismissableElement(dom.getContentEl(ctx), {
            defer: true,
            exclude: [dom.getTriggerEl(ctx), dom.getClearTriggerEl(ctx)],
            onEscapeKeyDown(event) {
              event.preventDefault()
              ctx.restoreFocus = true
              send({ type: "CONTENT.ESCAPE" })
            },
            onInteractOutside(event) {
              ctx.restoreFocus = !event.detail.focusable
            },
            onDismiss() {
              send({ type: "INTERACT_OUTSIDE" })
            },
          })
        },
      },
      actions: {
        reposition(ctx, evt) {
          const positionerEl = () => dom.getPositionerEl(ctx)
          getPlacement(dom.getTriggerEl(ctx), positionerEl, {
            ...ctx.positioning,
            ...evt.options,
            defer: true,
            listeners: false,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        toggleVisibility(ctx, evt, { send }) {
          send({ type: ctx.open ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: evt })
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.({ open: true })
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.({ open: false })
        },
        setInputValue(ctx, evt) {
          const timeValue = getTimeValue(ctx, evt.value)
          if (!timeValue) return
          set.value(ctx, timeValue.time)
        },
        syncInputElement(ctx) {
          const inputEl = dom.getInputEl(ctx)
          if (!inputEl) return
          inputEl.value = ctx.valueAsString
        },
        setUnitValue(ctx, evt) {
          const { unit, value } = evt
          const current = ctx.value ?? ctx.currentTime ?? new Time(0)
          const nextTime = match(unit, {
            hour: () => current.set({ hour: ctx.hour12 ? value + 12 : value }),
            minute: () => current.set({ minute: value }),
            second: () => current.set({ second: value }),
            period: () => {
              if (!ctx.value) return
              const diff = value === "pm" ? 12 : 0
              return ctx.value.set({ hour: (ctx.value.hour % 12) + diff })
            },
          })

          if (!nextTime) return
          set.value(ctx, nextTime)
        },
        setValue(ctx, evt) {
          if (!(evt.value instanceof Time)) return
          set.value(ctx, evt.value)
        },
        clearValue(ctx) {
          set.value(ctx, null)
        },
        setFocusedValue(ctx, evt) {
          set.focusedValue(ctx, evt.value)
        },
        setFocusedColumn(ctx, evt) {
          set.focusedColumn(ctx, evt.unit)
        },
        resetFocusedCell(ctx) {
          set.focusedColumn(ctx, "hour")
          set.focusedValue(ctx, null)
        },
        clampTimeValue(ctx) {
          if (!ctx.value) return
          const nextTime = clampTime(ctx.value, ctx.min, ctx.max)
          set.value(ctx, nextTime)
        },
        setCurrentTime(ctx) {
          ctx.currentTime = getCurrentTime()
        },
        scrollColumnsToTop(ctx) {
          raf(() => {
            const columnEls = dom.getColumnEls(ctx)
            for (const columnEl of columnEls) {
              const cellEl = dom.getInitialFocusCell(ctx, columnEl.dataset.unit as TimeUnit)
              if (!cellEl) continue
              columnEl.scrollTop = cellEl.offsetTop - 4
            }
          })
        },
        focusTriggerElement(ctx) {
          dom.getTriggerEl(ctx)?.focus({ preventScroll: true })
        },
        focusInputElement(ctx) {
          dom.getInputEl(ctx)?.focus({ preventScroll: true })
        },
        focusHourColumn(ctx) {
          raf(() => {
            const hourEl = dom.getInitialFocusCell(ctx, "hour")
            if (!hourEl) return
            set.focusedValue(ctx, dom.getCellValue(hourEl))
          })
        },
        focusPreviousCell(ctx) {
          raf(() => {
            const cells = dom.getColumnCellEls(ctx, ctx.focusedColumn)
            const focusedEl = dom.getFocusedCell(ctx)
            const focusedIndex = focusedEl ? cells.indexOf(focusedEl) : -1
            const prevCell = prev(cells, focusedIndex, { loop: false })
            if (!prevCell) return
            set.focusedValue(ctx, dom.getCellValue(prevCell))
          })
        },
        focusNextCell(ctx) {
          raf(() => {
            const cells = dom.getColumnCellEls(ctx, ctx.focusedColumn)
            const focusedEl = dom.getFocusedCell(ctx)
            const focusedIndex = focusedEl ? cells.indexOf(focusedEl) : -1

            const nextCell = next(cells, focusedIndex, { loop: false })
            if (!nextCell) return

            set.focusedValue(ctx, dom.getCellValue(nextCell))
          })
        },
        selectFocusedCell(ctx) {
          const current = ctx.value ?? ctx.currentTime ?? new Time(0)

          let value = ctx.focusedValue
          let column = ctx.focusedColumn

          if (column === "hour" && ctx.hour12) {
            value = ctx.hour12 ? value + 12 : value
          } else if (ctx.focusedColumn === "period") {
            column = "hour"
            const diff = value === "pm" ? 12 : 0
            value = (current.hour % 12) + diff
          }

          const nextTime = current.set({ [column]: value })
          set.value(ctx, nextTime)
        },
        focusPreviousColumnCell(ctx) {
          raf(() => {
            const columns = dom.getColumnEls(ctx)
            const currentColumnEl = dom.getColumnEl(ctx, ctx.focusedColumn)
            const focusedIndex = columns.indexOf(currentColumnEl!)

            const prevColumnEl = prev(columns, focusedIndex, { loop: false })
            if (!prevColumnEl) return

            set.focusedColumn(ctx, dom.getColumnUnit(prevColumnEl))
          })
        },
        focusNextColumnCell(ctx) {
          raf(() => {
            const columns = dom.getColumnEls(ctx)
            const currentColumnEl = dom.getColumnEl(ctx, ctx.focusedColumn)
            const focusedIndex = columns.indexOf(currentColumnEl!)

            const nextColumnEl = next(columns, focusedIndex, { loop: false })
            if (!nextColumnEl) return

            set.focusedColumn(ctx, dom.getColumnUnit(nextColumnEl))
          })
        },
        focusCell(ctx) {
          queueMicrotask(() => {
            const cellEl = dom.getFocusedCell(ctx)
            cellEl?.focus()
          })
        },
        syncFocusedValue(ctx) {
          if (ctx.focusedValue === null) return
          queueMicrotask(() => {
            const cellEl = dom.getInitialFocusCell(ctx, ctx.focusedColumn)
            set.focusedValue(ctx, dom.getCellValue(cellEl))
          })
        },
      },
      compareFns: {
        value: isTimeEqual,
      },
    },
  )
}

const isTimeEqual = (a: Time | null, b: Time | null) => {
  return a?.toString() === b?.toString()
}

const invoke = {
  change(ctx: MachineContext) {
    ctx.onValueChange?.({
      value: ctx.value,
      valueAsString: ctx.valueAsString,
    })
  },
  focusChange(ctx: MachineContext) {
    ctx.onFocusChange?.({
      value: ctx.value,
      valueAsString: ctx.valueAsString,
      focusedValue: ctx.focusedValue,
      focusedUnit: ctx.focusedColumn,
    })
  },
}

const set = {
  value(ctx: MachineContext, value: Time | null) {
    if (isTimeEqual(ctx.value, value)) return
    ctx.value = value
    invoke.change(ctx)
  },
  focusedValue(ctx: MachineContext, value: any) {
    if (isEqual(ctx.focusedValue, value)) return
    ctx.focusedValue = value
    invoke.focusChange(ctx)
  },
  focusedColumn(ctx: MachineContext, column: TimeUnit) {
    if (ctx.focusedColumn === column) return
    ctx.focusedColumn = column
  },
}
