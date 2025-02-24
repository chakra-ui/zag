import { createMachine } from "@zag-js/core"
import { raf, setElementValue, trackFormControl, trackPointerMove } from "@zag-js/dom-query"
import { trackElementsSize, type ElementSize } from "@zag-js/element-size"
import { getValuePercent, setValueAtIndex } from "@zag-js/utils"
import * as dom from "./slider.dom"
import type { SliderSchema } from "./slider.types"
import { constrainValue, decrement, getClosestIndex, getRangeAtIndex, increment, normalizeValues } from "./slider.utils"

const isEqualSize = (a: ElementSize | null, b: ElementSize | null) => {
  return a?.width === b?.width && a?.height === b?.height
}

export const machine = createMachine<SliderSchema>({
  props({ props }) {
    return {
      dir: "ltr",
      thumbAlignment: "contain",
      min: 0,
      max: 100,
      step: 1,
      defaultValue: [0],
      origin: "start",
      orientation: "horizontal",
      minStepsBetweenThumbs: 0,
      ...props,
    }
  },

  initialState() {
    return "idle"
  },

  context({ prop, bindable, getContext }) {
    return {
      thumbSize: bindable(() => ({
        defaultValue: prop("thumbSize") || null,
      })),
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        hash(a) {
          return a.join(",")
        },
        onChange(value) {
          prop("onValueChange")?.({ value })
        },
      })),
      focusedIndex: bindable(() => ({
        defaultValue: -1,
        onChange(value) {
          const ctx = getContext()
          prop("onFocusChange")?.({ focusedIndex: value, value: ctx.get("value") })
        },
      })),
      fieldsetDisabled: bindable(() => ({
        defaultValue: false,
      })),
    }
  },

  computed: {
    isHorizontal: ({ prop }) => prop("orientation") === "horizontal",
    isVertical: ({ prop }) => prop("orientation") === "vertical",
    isRtl: ({ prop }) => prop("orientation") === "horizontal" && prop("dir") === "rtl",
    isDisabled: ({ context, prop }) => !!prop("disabled") || context.get("fieldsetDisabled"),
    isInteractive: ({ prop, computed }) => !(prop("readOnly") || computed("isDisabled")),
    hasMeasuredThumbSize: ({ context }) => context.get("thumbSize") != null,
    valuePercent({ context, prop }) {
      return context.get("value").map((value) => 100 * getValuePercent(value, prop("min"), prop("max")))
    },
  },

  watch({ track, action, context }) {
    track([() => context.hash("value")], () => {
      action(["syncInputElements", "dispatchChangeEvent"])
    })
  },

  effects: ["trackFormControlState", "trackThumbsSize"],

  on: {
    SET_VALUE: [
      {
        guard: "hasIndex",
        actions: ["setValueAtIndex"],
      },
      {
        actions: ["setValue"],
      },
    ],
    INCREMENT: {
      actions: ["incrementThumbAtIndex"],
    },
    DECREMENT: {
      actions: ["decrementThumbAtIndex"],
    },
  },

  states: {
    idle: {
      on: {
        POINTER_DOWN: {
          target: "dragging",
          actions: ["setClosestThumbIndex", "setPointerValue", "focusActiveThumb"],
        },
        FOCUS: {
          target: "focus",
          actions: ["setFocusedIndex"],
        },
        THUMB_POINTER_DOWN: {
          target: "dragging",
          actions: ["setFocusedIndex", "focusActiveThumb"],
        },
      },
    },

    focus: {
      entry: ["focusActiveThumb"],
      on: {
        POINTER_DOWN: {
          target: "dragging",
          actions: ["setClosestThumbIndex", "setPointerValue", "focusActiveThumb"],
        },
        THUMB_POINTER_DOWN: {
          target: "dragging",
          actions: ["setFocusedIndex", "focusActiveThumb"],
        },
        ARROW_DEC: {
          actions: ["decrementThumbAtIndex", "invokeOnChangeEnd"],
        },
        ARROW_INC: {
          actions: ["incrementThumbAtIndex", "invokeOnChangeEnd"],
        },
        HOME: {
          actions: ["setFocusedThumbToMin", "invokeOnChangeEnd"],
        },
        END: {
          actions: ["setFocusedThumbToMax", "invokeOnChangeEnd"],
        },
        BLUR: {
          target: "idle",
          actions: ["clearFocusedIndex"],
        },
      },
    },

    dragging: {
      entry: ["focusActiveThumb"],
      effects: ["trackPointerMove"],
      on: {
        POINTER_UP: {
          target: "focus",
          actions: ["invokeOnChangeEnd"],
        },
        POINTER_MOVE: {
          actions: ["setPointerValue"],
        },
      },
    },
  },

  implementations: {
    guards: {
      hasIndex: ({ event }) => event.index != null,
    },

    effects: {
      trackFormControlState({ context, scope }) {
        return trackFormControl(dom.getRootEl(scope), {
          onFieldsetDisabledChange(disabled) {
            context.set("fieldsetDisabled", disabled)
          },
          onFormReset() {
            context.set("value", context.initial("value"))
          },
        })
      },

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
      trackThumbsSize({ context, scope, prop }) {
        if (prop("thumbAlignment") !== "contain" || context.get("thumbSize")) return

        return trackElementsSize({
          getNodes: () => dom.getElements(scope),
          observeMutation: true,
          callback(size) {
            if (!size || isEqualSize(context.get("thumbSize"), size)) return
            context.set("thumbSize", size)
          },
        })
      },
    },
    actions: {
      dispatchChangeEvent({ context, scope }) {
        dom.dispatchChangeEvent(scope, context.get("value"))
      },
      syncInputElements({ context, scope }) {
        context.get("value").forEach((value, index) => {
          const inputEl = dom.getHiddenInputEl(scope, index)
          setElementValue(inputEl, value.toString())
        })
      },
      invokeOnChangeEnd({ prop, context }) {
        prop("onValueChangeEnd")?.({ value: context.get("value") })
      },
      setClosestThumbIndex(params) {
        const { context, event } = params

        const pointValue = dom.getValueFromPoint(params, event.point)
        if (pointValue == null) return

        const focusedIndex = getClosestIndex(params, pointValue)
        context.set("focusedIndex", focusedIndex)
      },
      setFocusedIndex({ context, event }) {
        context.set("focusedIndex", event.index)
      },
      clearFocusedIndex({ context }) {
        context.set("focusedIndex", -1)
      },
      setPointerValue(params) {
        queueMicrotask(() => {
          const { context, event } = params
          const pointValue = dom.getValueFromPoint(params, event.point)
          if (pointValue == null) return

          const focusedIndex = context.get("focusedIndex")
          const value = constrainValue(params, pointValue, focusedIndex)
          context.set("value", (prev) => setValueAtIndex(prev, focusedIndex, value))
        })
      },
      focusActiveThumb({ scope, context }) {
        raf(() => {
          const thumbEl = dom.getThumbEl(scope, context.get("focusedIndex"))
          thumbEl?.focus({ preventScroll: true })
        })
      },
      decrementThumbAtIndex(params) {
        const { context, event } = params
        const value = decrement(params, event.index, event.step)
        context.set("value", value)
      },
      incrementThumbAtIndex(params) {
        const { context, event } = params
        const value = increment(params, event.index, event.step)
        context.set("value", value)
      },
      setFocusedThumbToMin(params) {
        const { context } = params
        const index = context.get("focusedIndex")
        const { min } = getRangeAtIndex(params, index)
        context.set("value", (prev) => setValueAtIndex(prev, index, min))
      },
      setFocusedThumbToMax(params) {
        const { context } = params
        const index = context.get("focusedIndex")
        const { max } = getRangeAtIndex(params, index)
        context.set("value", (prev) => setValueAtIndex(prev, index, max))
      },
      setValueAtIndex(params) {
        const { context, event } = params
        const value = constrainValue(params, event.value, event.index)
        context.set("value", (prev) => setValueAtIndex(prev, event.index, value))
      },
      setValue(params) {
        const { context, event } = params
        const value = normalizeValues(params, event.value)
        context.set("value", value)
      },
    },
  },
})
