import { createMachine } from "@zag-js/core"
import { trackPointerMove, type Point } from "@zag-js/dom-event"
import { raf } from "@zag-js/dom-query"
import { snapValueToStep } from "@zag-js/numeric-range"
import { createRect, getPointAngle } from "@zag-js/rect-utils"
import { compact } from "@zag-js/utils"
import { dom } from "./angle-slider.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./angle-slider.types"

const MIN_VALUE = 0
const MAX_VALUE = 360

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "angle-slider",
      initial: "idle",

      context: {
        value: 0,
        step: 1,
        disabled: false,
        readOnly: false,
        ...ctx,
      },

      computed: {
        interactive: (ctx) => !(ctx.disabled || ctx.readOnly),
        valueAsDegree: (ctx) => `${ctx.value}deg`,
      },

      watch: {
        value: ["syncInputElements"],
      },

      on: {
        "VALUE.SET": {
          actions: ["setValue"],
        },
      },

      states: {
        idle: {
          on: {
            "CONTROL.POINTER_DOWN": {
              target: "dragging",
              actions: ["setPointerValue", "focusThumb"],
            },
            "THUMB.FOCUS": {
              target: "focused",
            },
          },
        },

        focused: {
          on: {
            "CONTROL.POINTER_DOWN": {
              target: "dragging",
              actions: ["setPointerValue", "focusThumb"],
            },
            "THUMB.ARROW_DEC": {
              actions: ["decrementValue", "invokeOnChangeEnd"],
            },
            "THUMB.ARROW_INC": {
              actions: ["incrementValue", "invokeOnChangeEnd"],
            },
            "THUMB.HOME": {
              actions: ["setValueToMin", "invokeOnChangeEnd"],
            },
            "THUMB.END": {
              actions: ["setValueToMax", "invokeOnChangeEnd"],
            },
            "THUMB.BLUR": {
              target: "idle",
            },
          },
        },

        dragging: {
          entry: "focusThumb",
          activities: "trackPointerMove",
          on: {
            "DOC.POINTER_UP": {
              target: "focused",
              actions: "invokeOnChangeEnd",
            },
            "DOC.POINTER_MOVE": {
              actions: "setPointerValue",
            },
          },
        },
      },
    },
    {
      activities: {
        trackPointerMove(ctx, _evt, { send }) {
          return trackPointerMove(dom.getDoc(ctx), {
            onPointerMove(info) {
              send({ type: "DOC.POINTER_MOVE", point: info.point })
            },
            onPointerUp() {
              send({ type: "DOC.POINTER_UP" })
            },
          })
        },
      },

      actions: {
        syncInputElement(ctx) {
          const inputEl = dom.getHiddenInputEl(ctx)
          dom.setValue(inputEl, ctx.value)
        },
        invokeOnChangeEnd(ctx) {
          invoke.valueChangeEnd(ctx)
        },
        setPointerValue(ctx, evt) {
          const controlEl = dom.getControlEl(ctx)!
          if (!controlEl) return
          const deg = getAngle(controlEl, evt.point)
          const value = constrainAngle(deg, ctx.step)
          set.value(ctx, value)
        },
        setValueToMin(ctx) {
          set.value(ctx, MIN_VALUE)
        },
        setValueToMax(ctx) {
          set.value(ctx, MAX_VALUE)
        },
        setValue(ctx, evt) {
          set.value(ctx, evt.value)
        },
        decrementValue(ctx, evt) {
          const value = snapValueToStep(ctx.value - evt.step, MIN_VALUE, MAX_VALUE, evt.step ?? ctx.step)
          set.value(ctx, value)
        },
        incrementValue(ctx, evt) {
          const value = snapValueToStep(ctx.value + evt.step, MIN_VALUE, MAX_VALUE, evt.step ?? ctx.step)
          set.value(ctx, value)
        },
        focusThumb(ctx) {
          raf(() => {
            dom.getThumbEl(ctx)?.focus({ preventScroll: true })
          })
        },
      },
    },
  )
}

function getAngle(controlEl: HTMLElement, point: Point) {
  const rect = createRect(controlEl.getBoundingClientRect())
  return getPointAngle(rect, point)
}

function constrainAngle(degree: number, step: number) {
  const clampedDegree = Math.min(Math.max(degree, MIN_VALUE), MAX_VALUE)
  const upperStep = Math.ceil(clampedDegree / step)
  const nearestStep = Math.round(clampedDegree / step)
  return upperStep >= clampedDegree / step
    ? upperStep * step === MAX_VALUE
      ? MIN_VALUE
      : upperStep * step
    : nearestStep * step
}

const invoke = {
  valueChange(ctx: MachineContext) {
    ctx.onValueChange?.({ value: ctx.value, valueAsDegree: ctx.valueAsDegree })
  },
  valueChangeEnd(ctx: MachineContext) {
    ctx.onValueChangeEnd?.({ value: ctx.value, valueAsDegree: ctx.valueAsDegree })
  },
}

const set = {
  value: (ctx: MachineContext, value: number) => {
    if (ctx.value === value) return
    ctx.value = value
    invoke.valueChange(ctx)
  },
}
