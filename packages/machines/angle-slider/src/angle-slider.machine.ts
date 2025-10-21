import { raf, setElementValue, trackPointerMove } from "@zag-js/dom-query"
import { createMachine } from "@zag-js/core"
import * as dom from "./angle-slider.dom"
import type { AngleSliderSchema } from "./angle-slider.types"
import { clampAngle, constrainAngle, getAngle, MIN_VALUE, MAX_VALUE, snapAngleToStep } from "./angle-slider.utils"

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
          actions: ["setThumbDragOffset", "setPointerValue", "focusThumb"],
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
          actions: ["setThumbDragOffset", "setPointerValue", "focusThumb"],
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
        const value = snapAngleToStep(context.get("value") - event.step, event.step ?? prop("step"))
        context.set("value", value)
      },
      incrementValue({ context, event, prop }) {
        const value = snapAngleToStep(context.get("value") + event.step, event.step ?? prop("step"))
        context.set("value", value)
      },
      focusThumb({ scope }) {
        raf(() => {
          dom.getThumbEl(scope)?.focus({ preventScroll: true })
        })
      },
      setThumbDragOffset({ refs, event }) {
        refs.set("thumbDragOffset", event.angularOffset ?? null)
      },
      clearThumbDragOffset({ refs }) {
        refs.set("thumbDragOffset", null)
      },
    },
  },
})
