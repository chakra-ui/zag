import { createMachine } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import type { MachineContext, MachineState, UserDefinedContext } from "./time-picker.types"
import { dom } from "./time-picker.dom"
import { getPlacement } from "@zag-js/popper"
import { Time } from "@internationalized/date"
import { getFormatedValue } from "./time-picker.utils"
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
        value: new Time(0),
        period: "am",
        ...ctx,
        positioning: {
          placement: "bottom-start",
          gutter: 8,
          ...ctx.positioning,
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
                actions: ["invokeOnClose"],
              },
            ],
            "CONTROLLED.CLOSE": [
              {
                target: "idle",
                actions: ["invokeOnClose"],
              },
            ],
            "CONTENT.INTERACT_OUTSIDE": {
              target: "idle",
            },
            "POSITIONING.SET": {
              actions: ["reposition"],
            },
            "HOUR.CLICK": {
              actions: ["setHour", "invokeValueChange", "syncInputElement"],
            },
            "MINUTE.CLICK": {
              actions: ["setMinute", "invokeValueChange", "syncInputElement"],
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
        syncInputElement(ctx) {
          const inputEl = dom.getInputEl(ctx)
          if (!inputEl) return
          inputEl.value = getFormatedValue(ctx)
        },
        focusContentEl(ctx) {
          raf(() => {
            dom.getContentEl(ctx)?.focus({ preventScroll: true })
          })
        },
        setHour(ctx, { hour }) {
          if (ctx.period === "pm") {
            hour += 12
          }
          ctx.value = ctx.value.set({ hour })
        },
        setMinute(ctx, { minute }) {
          ctx.value = ctx.value.set({ minute })
        },
        setPeriod(ctx, { period }) {
          if (ctx.period === "am" && period === "pm") {
            ctx.value = ctx.value.add({ hours: 12 })
          } else if (ctx.period === "pm" && period === "am") {
            ctx.value = ctx.value.add({ hours: -12 })
          }
          ctx.period = period
        },
      },
    },
  )
}
