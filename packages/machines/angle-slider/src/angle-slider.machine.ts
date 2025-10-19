import { raf, setElementValue, trackPointerMove } from "@zag-js/dom-query"
import { createRect, getPointAngle } from "@zag-js/rect-utils"
import type { Point } from "@zag-js/types"
import { snapValueToStep } from "@zag-js/utils"
import { createMachine } from "@zag-js/core"
import * as dom from "./angle-slider.dom"
import type { AngleSliderSchema } from "./angle-slider.types"

const MIN_VALUE = 0
const MAX_VALUE = 359

export const machine = createMachine<AngleSliderSchema>({
  props({ props }) {
    return {
      step: 1,
      defaultValue: 0,
      ...props,
    }
  },

  context({ prop, bindable }) {
    return {
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value) {
          prop("onValueChange")?.({ value, valueAsDegree: `${value}deg` })
        },
      })),
    }
  },

  refs() {
    return {
      thumbDragOffset: null,
    }
  },

  computed: {
    interactive: ({ prop }) => !(prop("disabled") || prop("readOnly")),
    valueAsDegree: ({ context }) => `${context.get("value")}deg`,
  },

  watch({ track, context, action }) {
    track([() => context.get("value")], () => {
      action(["syncInputElement"])
    })
  },

  initialState() {
    return "idle"
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
        "THUMB.POINTER_DOWN": {
          target: "dragging",
          actions: ["setThumbDragOffset", "focusThumb"],
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
        "THUMB.POINTER_DOWN": {
          target: "dragging",
          actions: ["setThumbDragOffset", "focusThumb"],
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
      entry: ["focusThumb"],
      effects: ["trackPointerMove"],
      on: {
        "DOC.POINTER_UP": {
          target: "focused",
          actions: ["invokeOnChangeEnd", "clearThumbDragOffset"],
        },
        "DOC.POINTER_MOVE": {
          actions: ["setPointerValue"],
        },
      },
    },
  },

  implementations: {
    effects: {
      trackPointerMove({ scope, send }) {
        return trackPointerMove(scope.getDoc(), {
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
      syncInputElement({ scope, context }) {
        const inputEl = dom.getHiddenInputEl(scope)
        setElementValue(inputEl, context.get("value").toString())
      },
      invokeOnChangeEnd({ context, prop, computed }) {
        prop("onValueChangeEnd")?.({
          value: context.get("value"),
          valueAsDegree: computed("valueAsDegree"),
        })
      },
      setPointerValue({ scope, event, context, prop, refs }) {
        const controlEl = dom.getControlEl(scope)
        if (!controlEl) return
        const angularOffset = refs.get("thumbDragOffset")
        const deg = getAngle(controlEl, event.point, angularOffset)
        context.set("value", constrainAngle(deg, prop("step")))
      },
      setValueToMin({ context }) {
        context.set("value", MIN_VALUE)
      },
      setValueToMax({ context }) {
        context.set("value", MAX_VALUE)
      },
      setValue({ context, event }) {
        context.set("value", clampAngle(event.value))
      },
      decrementValue({ context, event, prop }) {
        const value = snapValueToStep(
          context.get("value") - event.step,
          MIN_VALUE,
          MAX_VALUE,
          event.step ?? prop("step"),
        )
        context.set("value", value)
      },
      incrementValue({ context, event, prop }) {
        const value = snapValueToStep(
          context.get("value") + event.step,
          MIN_VALUE,
          MAX_VALUE,
          event.step ?? prop("step"),
        )
        context.set("value", value)
      },
      focusThumb({ scope }) {
        raf(() => {
          dom.getThumbEl(scope)?.focus({ preventScroll: true })
        })
      },
      setThumbDragOffset(params) {
        const { refs, event } = params
        refs.set("thumbDragOffset", event.angularOffset ?? null)
      },
      clearThumbDragOffset({ refs }) {
        refs.set("thumbDragOffset", null)
      },
    },
  },
})

function getAngle(controlEl: HTMLElement, point: Point, angularOffset?: number | null) {
  const rect = createRect(controlEl.getBoundingClientRect())
  const angle = getPointAngle(rect, point)

  // Apply angular offset for relative thumb dragging
  if (angularOffset != null) {
    return angle - angularOffset
  }

  return angle
}

function clampAngle(degree: number) {
  return Math.min(Math.max(degree, MIN_VALUE), MAX_VALUE)
}

function constrainAngle(degree: number, step: number) {
  const clampedDegree = clampAngle(degree)
  const upperStep = Math.ceil(clampedDegree / step)
  const nearestStep = Math.round(clampedDegree / step)
  return upperStep >= clampedDegree / step
    ? upperStep * step === MAX_VALUE
      ? MIN_VALUE
      : upperStep * step
    : nearestStep * step
}
