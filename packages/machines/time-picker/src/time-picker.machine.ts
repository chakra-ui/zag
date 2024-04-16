import { createMachine, guards } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import type { MachineContext, MachineState, TimeUnit, UserDefinedContext } from "./time-picker.types"
import { dom } from "./time-picker.dom"
import { getPlacement } from "@zag-js/popper"
import { Time } from "@internationalized/date"
import { getTimeValue, getStringifiedValue, get12HourFormatPeriodHour, is12HourFormat } from "./time-picker.utils"
import { trackDismissableElement } from "@zag-js/dismissable"
import { raf } from "@zag-js/dom-query"

const { and } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "time-picker",
      initial: ctx.open ? "open" : "idle",
      context: {
        value: undefined,
        locale: "en-US",
        period: "am",
        ...ctx,
        positioning: {
          placement: "bottom-end",
          gutter: 8,
          ...ctx.positioning,
        },
      },

      watch: {
        open: ["toggleVisibility"],
      },

      on: {
        "INPUT.BLUR": {
          actions: ["applyInputValue", "checkValidInputValue", "syncInputElement"],
        },
        "INPUT.ENTER": {
          actions: ["applyInputValue", "checkValidInputValue", "syncInputElement"],
        },
        "VALUE.CLEAR": {
          actions: ["clearValue", "syncInputElement"],
        },
      },

      states: {
        idle: {
          tags: ["closed"],
          on: {
            "TRIGGER.CLICK": [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["invokeOnOpen", "focusFirstHour"],
              },
            ],
            OPEN: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["invokeOnOpen", "focusFirstHour"],
              },
            ],
            "CONTROLLED.OPEN": {
              target: "open",
              actions: ["invokeOnOpen", "focusFirstHour"],
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
                actions: ["invokeOnOpen", "focusFirstHour"],
              },
            ],
            OPEN: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["invokeOnOpen", "focusFirstHour"],
              },
            ],
            "CONTROLLED.OPEN": {
              target: "open",
              actions: ["invokeOnOpen", "focusFirstHour"],
            },
          },
        },
        open: {
          tags: ["open"],
          entry: ["focusFirstHour"],
          activities: ["computePlacement", "trackDismissableElement"],
          on: {
            "TRIGGER.CLICK": [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnClose"],
              },
              {
                target: "focused",
                actions: ["invokeOnClose", "scrollUpColumns"],
              },
            ],
            CLOSE: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnClose"],
              },
              {
                target: "idle",
                actions: ["invokeOnClose", "scrollUpColumns"],
              },
            ],
            "CONTROLLED.CLOSE": [
              {
                guard: and("shouldRestoreFocus", "isInteractOutsideEvent"),
                target: "focused",
                actions: ["focusTriggerElement", "scrollUpColumns"],
              },
              {
                guard: "shouldRestoreFocus",
                target: "focused",
                actions: ["focusInputElement", "scrollUpColumns"],
              },
              {
                target: "idle",
                actions: ["scrollUpColumns", "scrollUpColumns"],
              },
            ],
            INTERACT_OUTSIDE: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnClose", "scrollUpColumns"],
              },
              {
                guard: "shouldRestoreFocus",
                target: "focused",
                actions: ["invokeOnClose", "focusTriggerElement", "scrollUpColumns"],
              },
              {
                target: "idle",
                actions: ["invokeOnClose", "scrollUpColumns"],
              },
            ],
            "POSITIONING.SET": {
              actions: ["reposition", "scrollUpColumns"],
            },
            "HOUR.CLICK": {
              actions: ["setHour", "syncInputElement"],
            },
            "MINUTE.CLICK": {
              actions: ["setMinute", "syncInputElement"],
            },
            "SECOND.CLICK": {
              actions: ["setSecond", "syncInputElement"],
            },
            "PERIOD.CLICK": {
              actions: ["setPeriod", "checkValidInputValue", "syncInputElement"],
            },
            "CONTENT.COLUMN.ARROW_UP": {
              actions: ["focusPreviousCell"],
            },
            "CONTENT.COLUMN.ARROW_DOWN": {
              actions: ["focusNextCell"],
            },
            "CONTENT.COLUMN.ARROW_LEFT": {
              actions: ["focusPreviousColumnFirstCell"],
            },
            "CONTENT.COLUMN.ARROW_RIGHT": {
              actions: ["focusNextColumnFirstCell"],
            },
            "CONTENT.COLUMN.ENTER": {
              actions: ["setCurrentCell", "focusNextColumnFirstCell"],
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
          const triggerEl = () => dom.getTriggerEl(ctx)
          const positionerEl = () => dom.getPositionerEl(ctx)
          return getPlacement(triggerEl, positionerEl, {
            defer: true,
            ...ctx.positioning,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        trackDismissableElement(ctx, _evt, { send }) {
          return trackDismissableElement(dom.getContentEl(ctx), {
            defer: true,
            exclude: [dom.getTriggerEl(ctx), dom.getInputEl(ctx), dom.getClearTriggerEl(ctx)],
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
        applyInputValue(ctx, evt) {
          const timeValue = getTimeValue(evt.value, ctx)
          if (!timeValue) return
          ctx.value = timeValue.time
          ctx.period = timeValue.period
        },
        syncInputElement(ctx) {
          const inputEl = dom.getInputEl(ctx)
          if (!inputEl) return
          inputEl.value = getStringifiedValue(ctx)
        },
        setHour(ctx, { hour }) {
          const newValue = (ctx.value ?? new Time(0)).set({ hour: get12HourFormatPeriodHour(hour, ctx.period) })
          if (ctx.min && ctx.min.compare(newValue) > 0) {
            ctx.value = newValue.set({ minute: ctx.min.minute, second: ctx.min.second })
            return
          }
          ctx.value = newValue
          invoke.change(ctx)
        },
        setMinute(ctx, { minute }) {
          const newValue = (ctx.value ?? new Time(0)).set({ minute })
          if (ctx.min && ctx.min.compare(newValue) > 0) {
            ctx.value = newValue.set({ second: ctx.min.second })
            return
          }
          ctx.value = newValue
          invoke.change(ctx)
        },
        setSecond(ctx, { second }) {
          ctx.value = (ctx.value ?? new Time(0)).set({ second })
          invoke.change(ctx)
        },
        setPeriod(ctx, { period }) {
          if (period === ctx.period) return
          ctx.period = period
          if (ctx.value) {
            const diff = period === "pm" ? 12 : 0
            ctx.value = ctx.value.set({ hour: (ctx.value.hour % 12) + diff })
          }
          invoke.change(ctx)
        },
        clearValue(ctx) {
          ctx.value = undefined
          ctx.period = "am"
        },
        checkValidInputValue(ctx, _, { send }) {
          const { value, min, max } = ctx
          if (!value) return
          if ((min && min.compare(value) > 0) || (max && max.compare(value) < 0)) {
            send({ type: "VALUE.CLEAR" })
          }
        },
        scrollUpColumns(ctx) {
          const columnEls = dom.getContentColumnEls(ctx)
          for (const columnEl of columnEls) {
            columnEl.scrollTo({ top: 0 })
          }
        },
        focusTriggerElement(ctx) {
          dom.getTriggerEl(ctx)?.focus({ preventScroll: true })
        },
        focusInputElement(ctx) {
          dom.getInputEl(ctx)?.focus({ preventScroll: true })
        },
        focusFirstHour(ctx) {
          raf(() => {
            const el = dom.getHourCellEls(ctx)?.[0]
            if (!el) return
            el?.focus()
            const { value, unit } = el.dataset
            invoke.focusChange(ctx, value, unit)
          })
        },
        focusPreviousCell(ctx, evt) {
          raf(() => {
            const previous = evt.target.previousSibling
            if (previous && !previous.disabled) {
              previous.focus()
              const { value, unit } = previous.dataset
              invoke.focusChange(ctx, value, unit)
            }
          })
        },
        focusNextCell(ctx, evt) {
          raf(() => {
            const next = evt.target.nextSibling
            if (next && !next.disabled) {
              const { value, unit } = next.dataset
              if (unit === "period" && !is12HourFormat(ctx.locale)) return
              next.focus()
              invoke.focusChange(ctx, value, unit)
            }
          })
        },
        setCurrentCell(_, evt, { send }) {
          const { value, unit } = evt.target.dataset
          switch (unit) {
            case "hour":
              send({ type: "HOUR.CLICK", hour: value })
              break
            case "minute":
              send({ type: "MINUTE.CLICK", minute: value })
              break
            case "second":
              send({ type: "SECOND.CLICK", second: value })
              break
            case "period":
              send({ type: "PERIOD.CLICK", period: value })
              break
          }
        },
        focusPreviousColumnFirstCell(ctx, evt) {
          raf(() => {
            const { value, unit } = evt.target.dataset
            switch (unit) {
              case "minute":
                dom.getHourCellEls(ctx)?.[0]?.focus()
                break
              case "second":
                dom.getMinuteCellEls(ctx)?.[0]?.focus()
                break
              case "period":
                if (ctx.withSeconds) {
                  dom.getSecondCellEls(ctx)?.[0]?.focus()
                } else {
                  dom.getMinuteCellEls(ctx)?.[0]?.focus()
                }
                break
              default:
                break
            }
            invoke.focusChange(ctx, value, unit)
          })
        },
        focusNextColumnFirstCell(ctx, evt) {
          raf(() => {
            const { value, unit } = evt.target.dataset
            switch (unit) {
              case "hour":
                dom.getMinuteCellEls(ctx)?.[0]?.focus()
                break
              case "minute":
                if (ctx.withSeconds) {
                  dom.getSecondCellEls(ctx)?.[0]?.focus()
                } else {
                  dom.getPeriodCellEls(ctx)?.[0]?.focus()
                }
                break
              case "second":
                if (!is12HourFormat(ctx.locale)) return
                dom.getPeriodCellEls(ctx)?.[0]?.focus()
                break
              default:
                break
            }
            invoke.focusChange(ctx, value, unit)
          })
        },
      },
    },
  )
}

const invoke = {
  change(ctx: MachineContext) {
    ctx.onValueChange?.({ value: ctx.value, valueAsString: getStringifiedValue(ctx) })
  },
  focusChange(ctx: MachineContext, focusValue?: string, focusUnit?: string) {
    if (!ctx.onFocusChange || !focusValue || !focusUnit) return
    ctx.onFocusChange({
      value: ctx.value,
      valueAsString: getStringifiedValue(ctx),
      focusedCell: {
        value: parseInt(focusValue),
        unit: focusUnit as TimeUnit,
      },
    })
  },
}
