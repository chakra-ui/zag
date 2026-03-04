import { createMachine, memo } from "@zag-js/core"
import { raf, resizeObserverBorderBox, setElementValue, trackFormControl, trackPointerMove } from "@zag-js/dom-query"
import type { Size } from "@zag-js/types"
import {
  callAll,
  clampValue,
  getValuePercent,
  getValueRanges,
  isEqual,
  isValueWithinRange,
  pick,
  setValueAtIndex,
  snapValueToStep,
} from "@zag-js/utils"
import * as dom from "./slider.dom"
import type { SliderSchema } from "./slider.types"
import {
  constrainValue,
  decrement,
  getClosestIndex,
  getRangeAtIndex,
  increment,
  normalizeValues,
  resolveThumbCollision,
  selectMovableThumb,
} from "./slider.utils"

const isEqualSize = (a: Size | null, b: Size | null) => {
  return a?.width === b?.width && a?.height === b?.height
}

const normalize = (value: number[], min: number, max: number, step: number, minStepsBetweenThumbs: number) => {
  const ranges = getValueRanges(value, min, max, minStepsBetweenThumbs * step)
  return ranges.map((range) => {
    const snapValue = snapValueToStep(range.value, range.min, range.max, step)
    const rangeValue = clampValue(snapValue, range.min, range.max)
    if (!isValueWithinRange(rangeValue, min, max)) {
      throw new Error(
        "[zag-js/slider] The configured `min`, `max`, `step` or `minStepsBetweenThumbs` values are invalid",
      )
    }
    return rangeValue
  })
}

export const machine = createMachine<SliderSchema>({
  props({ props }) {
    const min = props.min ?? 0
    const max = props.max ?? 100
    const step = props.step ?? 1
    const defaultValue = props.defaultValue ?? [min]
    const minStepsBetweenThumbs = props.minStepsBetweenThumbs ?? 0
    return {
      dir: "ltr",
      thumbAlignment: "contain",
      origin: "start",
      orientation: "horizontal",
      thumbCollisionBehavior: "none",
      minStepsBetweenThumbs,
      ...props,
      defaultValue: normalize(defaultValue, min, max, step, minStepsBetweenThumbs),
      value: props.value ? normalize(props.value, min, max, step, minStepsBetweenThumbs) : undefined,
      max,
      step,
      min,
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
        isEqual,
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

  refs() {
    return {
      thumbDragOffset: null,
      thumbDragStartValue: null,
    }
  },

  computed: {
    isHorizontal: ({ prop }) => prop("orientation") === "horizontal",
    isVertical: ({ prop }) => prop("orientation") === "vertical",
    isRtl: ({ prop }) => prop("orientation") === "horizontal" && prop("dir") === "rtl",
    isDisabled: ({ context, prop }) => !!prop("disabled") || context.get("fieldsetDisabled"),
    isInteractive: ({ prop, computed }) => !(prop("readOnly") || computed("isDisabled")),
    hasMeasuredThumbSize: ({ context }) => context.get("thumbSize") != null,
    valuePercent: memo(
      ({ context, prop }) => [context.get("value"), prop("min"), prop("max")],
      ([value, min, max]) => value.map((value) => 100 * getValuePercent(value, min, max)),
    ),
  },

  watch({ track, action, context, computed, send }) {
    track([() => context.hash("value")], () => {
      action(["syncInputElements", "dispatchChangeEvent"])
    })

    track([() => computed("isDisabled")], () => {
      if (computed("isDisabled")) {
        send({ type: "POINTER_CANCEL" })
      }
    })
  },

  effects: ["trackFormControlState", "trackThumbSize"],

  on: {
    SET_VALUE: [
      {
        guard: "hasIndex",
        actions: ["setValueAtIndex", "invokeOnChangeEnd"],
      },
      {
        actions: ["setValue", "invokeOnChangeEnd"],
      },
    ],
    INCREMENT: {
      actions: ["incrementThumbAtIndex", "invokeOnChangeEnd"],
    },
    DECREMENT: {
      actions: ["decrementThumbAtIndex", "invokeOnChangeEnd"],
    },
  },

  states: {
    idle: {
      on: {
        POINTER_DOWN: {
          target: "dragging",
          actions: ["setClosestThumbIndex", "setThumbDragStartValue", "setPointerValue", "focusActiveThumb"],
        },
        FOCUS: {
          target: "focus",
          actions: ["setFocusedIndex"],
        },
        THUMB_POINTER_DOWN: {
          target: "dragging",
          actions: ["setFocusedIndex", "setThumbDragOffset", "setThumbDragStartValue", "focusActiveThumb"],
        },
      },
    },

    focus: {
      entry: ["focusActiveThumb"],
      on: {
        POINTER_DOWN: {
          target: "dragging",
          actions: ["setClosestThumbIndex", "setThumbDragStartValue", "setPointerValue", "focusActiveThumb"],
        },
        THUMB_POINTER_DOWN: {
          target: "dragging",
          actions: ["setFocusedIndex", "setThumbDragOffset", "setThumbDragStartValue", "focusActiveThumb"],
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
          actions: ["invokeOnChangeEnd", "clearThumbDragOffset", "clearThumbDragStartValue"],
        },
        POINTER_MOVE: {
          actions: ["setPointerValue"],
        },
        POINTER_CANCEL: {
          target: "idle",
          actions: ["clearFocusedIndex", "clearThumbDragOffset", "clearThumbDragStartValue"],
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

      trackThumbSize({ context, scope, prop }) {
        if (prop("thumbAlignment") !== "contain" || prop("thumbSize")) return

        const exec = (el: HTMLElement) => {
          const rect = dom.getOffsetRect(el)
          const size = pick(rect, ["width", "height"])
          if (isEqualSize(context.get("thumbSize"), size)) return
          context.set("thumbSize", size)
        }

        const thumbEls = dom.getThumbEls(scope)
        thumbEls.forEach(exec)

        const cleanups = thumbEls.map((el) => resizeObserverBorderBox.observe(el, () => exec(el)))

        return callAll(...cleanups)
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
        queueMicrotask(() => {
          prop("onValueChangeEnd")?.({ value: context.get("value") })
        })
      },
      setClosestThumbIndex(params) {
        const { context, event } = params

        const pointValue = dom.getPointValue(params, event.point)
        if (pointValue == null) return

        const focusedIndex = getClosestIndex(params, pointValue)
        context.set("focusedIndex", focusedIndex)
      },
      setFocusedIndex(params) {
        const { context, event } = params
        const movableIndex = selectMovableThumb(params, event.index)
        context.set("focusedIndex", movableIndex)
      },
      clearFocusedIndex({ context }) {
        context.set("focusedIndex", -1)
      },
      setThumbDragOffset(params) {
        const { refs, event } = params
        refs.set("thumbDragOffset", event.offset ?? null)
      },
      clearThumbDragOffset({ refs }) {
        refs.set("thumbDragOffset", null)
      },
      setThumbDragStartValue({ refs, context }) {
        refs.set("thumbDragStartValue", context.get("value").slice())
      },
      clearThumbDragStartValue({ refs }) {
        refs.set("thumbDragStartValue", null)
      },
      setPointerValue(params) {
        queueMicrotask(() => {
          const { context, event, prop, refs } = params
          const pointValue = dom.getPointValue(params, event.point)
          if (pointValue == null) return

          const focusedIndex = context.get("focusedIndex")
          const startValues = refs.get("thumbDragStartValue")

          const result = resolveThumbCollision(
            prop("thumbCollisionBehavior"),
            focusedIndex,
            pointValue,
            context.get("value"),
            prop("min"),
            prop("max"),
            prop("step"),
            prop("minStepsBetweenThumbs"),
            startValues?.[focusedIndex],
          )

          if (result.swapped) {
            context.set("focusedIndex", result.index)
          }

          context.set("value", result.values)
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
