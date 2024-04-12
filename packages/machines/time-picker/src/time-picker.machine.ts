import { createMachine } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import type { MachineContext, MachineState, UserDefinedContext } from "./time-picker.types"
import { dom } from "./time-picker.dom"
import { getPlacement } from "@zag-js/popper"
import { Time } from "@internationalized/date"
import { getTimeValue, getStringifiedValue } from "./time-picker.utils"
import { trackDismissableElement } from "@zag-js/dismissable"
import { raf } from "@zag-js/dom-query"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "time-picker",
      initial: ctx.open ? "open" : "idle",
      watch: {
        open: ["toggleVisibility"],
      },
      context: {
        value: undefined,
        period: "am",
        ...ctx,
        positioning: {
          placement: "bottom-end",
          gutter: 8,
          ...ctx.positioning,
        },
      },
      on: {
        "INPUT.BLUR": {
          actions: ["applyInputValue", "syncInputElement"],
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
                target: "open",
                actions: ["invokeOnOpen"],
              },
            ],
            "CONTROLLED.OPEN": [
              {
                target: "open",
                actions: ["invokeOnOpen"],
              },
            ],
          },
        },
        focused: {
          tags: ["closed"],
          on: {
            "TRIGGER.CLICK": [
              {
                target: "idle",
                actions: ["invokeOnOpen"],
              },
            ],
            "CONTROLLED.OPEN": [
              {
                target: "open",
                actions: ["invokeOnOpen"],
              },
            ],
          },
        },
        open: {
          tags: ["open"],
          entry: ["focusContentEl"],
          activities: ["computePlacement", "trackDismissableElement"],
          on: {
            "TRIGGER.CLICK": [
              {
                target: "idle",
                actions: ["invokeOnClose", "scrollUpColumns"],
              },
            ],
            "CONTROLLED.CLOSE": [
              {
                target: "idle",
                actions: ["invokeOnClose", "scrollUpColumns"],
              },
            ],
            "CONTENT.INTERACT_OUTSIDE": {
              target: "idle",
              actions: ["invokeOnClose", "scrollUpColumns"],
            },
            "POSITIONING.SET": {
              actions: ["reposition", "scrollUpColumns"],
            },
            "HOUR.CLICK": {
              actions: ["setHour", "invokeValueChange", "syncInputElement"],
            },
            "MINUTE.CLICK": {
              actions: ["setMinute", "invokeValueChange", "syncInputElement"],
            },
            "SECOND.CLICK": {
              actions: ["setSecond", "invokeValueChange", "syncInputElement"],
            },
            "PERIOD.CLICK": {
              actions: ["setPeriod", "invokeValueChange", "syncInputElement"],
            },
          },
        },
      },
    },
    {
      guards: {},
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
          const contentEl = () => dom.getContentEl(ctx)
          return trackDismissableElement(contentEl, {
            defer: true,
            exclude: [dom.getTriggerEl(ctx), dom.getClearTriggerEl(ctx)],
            // onFocusOutside: ctx.onFocusOutside,
            // onPointerDownOutside: ctx.onPointerDownOutside,
            // onInteractOutside(event) {
            //   ctx.onInteractOutside?.(event)
            //   ctx.restoreFocus = !event.detail.focusable
            // },
            onDismiss() {
              send({ type: "CONTENT.INTERACT_OUTSIDE" })
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
        invokeValueChange(ctx) {
          ctx.onValueChange?.({ value: ctx.value })
        },
        applyInputValue(ctx, evt) {
          const timeValue = getTimeValue(evt.value)
          if (!timeValue) return
          ctx.value = timeValue.time
          ctx.period = timeValue.period
        },
        syncInputElement(ctx) {
          const inputEl = dom.getInputEl(ctx)
          if (!inputEl) return
          inputEl.value = getStringifiedValue(ctx)
        },
        focusContentEl(ctx) {
          raf(() => {
            dom.getContentEl(ctx)?.focus({ preventScroll: true })
          })
        },
        setHour(ctx, { hour }) {
          ctx.value = (ctx.value ?? new Time(0)).set({ hour })
        },
        setMinute(ctx, { minute }) {
          ctx.value = (ctx.value ?? new Time(0)).set({ minute })
        },
        setSecond(ctx, { second }) {
          ctx.value = (ctx.value ?? new Time(0)).set({ second })
        },
        setPeriod(ctx, { period }) {
          ctx.period = period
        },
        clearValue(ctx) {
          ctx.value = undefined
          ctx.period = "am"
        },
        scrollUpColumns(ctx) {
          const columnEls = dom.getContentColumnEls(ctx)
          for (const columnEl of columnEls) {
            columnEl.scrollTo({ top: 0 })
          }
        },
      },
    },
  )
}
