import { createMachine } from "@zag-js/core"
import { trackPointerMove } from "@zag-js/dom-event"
import { raf } from "@zag-js/dom-query"
import { trackElementsSize } from "@zag-js/element-size"
import { trackFormControl } from "@zag-js/form-utils"
import { getValuePercent } from "@zag-js/numeric-range"
import { compact } from "@zag-js/utils"
import { dom } from "./range-slider.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./range-slider.types"
import {
  assignArray,
  constrainValue,
  decrement,
  getClosestIndex,
  getRangeAtIndex,
  increment,
  normalizeValues,
} from "./range-slider.utils"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "range-slider",
      initial: "idle",

      context: {
        thumbSizes: [],
        thumbAlignment: "contain",
        threshold: 5,
        activeIndex: -1,
        min: 0,
        max: 100,
        step: 1,
        value: [0, 100],
        initialValues: [],
        orientation: "horizontal",
        dir: "ltr",
        minStepsBetweenThumbs: 0,
        ...ctx,
      },

      computed: {
        isHorizontal: (ctx) => ctx.orientation === "horizontal",
        isVertical: (ctx) => ctx.orientation === "vertical",
        isRtl: (ctx) => ctx.orientation === "horizontal" && ctx.dir === "rtl",
        isInteractive: (ctx) => !(ctx.readOnly || ctx.disabled),
        spacing: (ctx) => ctx.minStepsBetweenThumbs * ctx.step,
        hasMeasuredThumbSize: (ctx) => ctx.thumbSizes.length !== 0,
        valuePercent(ctx) {
          return ctx.value.map((value) => 100 * getValuePercent(value, ctx.min, ctx.max))
        },
      },

      watch: {
        value: ["invokeOnChange", "dispatchChangeEvent"],
      },

      entry: ["checkValue"],

      activities: ["trackFormControlState", "trackThumbsSize"],

      on: {
        SET_VALUE: [
          {
            guard: "hasIndex",
            actions: "setValueAtIndex",
          },
          { actions: "setValue" },
        ],
        INCREMENT: {
          actions: "incrementAtIndex",
        },
        DECREMENT: {
          actions: "decrementAtIndex",
        },
      },

      states: {
        idle: {
          on: {
            POINTER_DOWN: {
              target: "dragging",
              actions: ["setClosestThumbIndex", "setPointerValue", "invokeOnChangeStart", "focusActiveThumb"],
            },
            FOCUS: {
              target: "focus",
              actions: "setActiveIndex",
            },
          },
        },
        focus: {
          entry: "focusActiveThumb",
          on: {
            POINTER_DOWN: {
              target: "dragging",
              actions: ["setClosestThumbIndex", "setPointerValue", "invokeOnChangeStart", "focusActiveThumb"],
            },
            ARROW_LEFT: {
              guard: "isHorizontal",
              actions: "decrementAtIndex",
            },
            ARROW_RIGHT: {
              guard: "isHorizontal",
              actions: "incrementAtIndex",
            },
            ARROW_UP: {
              guard: "isVertical",
              actions: "incrementAtIndex",
            },
            ARROW_DOWN: {
              guard: "isVertical",
              actions: "decrementAtIndex",
            },
            PAGE_UP: {
              actions: "incrementAtIndex",
            },
            PAGE_DOWN: {
              actions: "decrementAtIndex",
            },
            HOME: {
              actions: "setActiveThumbToMin",
            },
            END: {
              actions: "setActiveThumbToMax",
            },
            BLUR: {
              target: "idle",
              actions: "clearActiveIndex",
            },
          },
        },
        dragging: {
          entry: "focusActiveThumb",
          activities: "trackPointerMove",
          on: {
            POINTER_UP: {
              target: "focus",
              actions: "invokeOnChangeEnd",
            },
            POINTER_MOVE: {
              actions: "setPointerValue",
            },
          },
        },
      },
    },
    {
      guards: {
        isHorizontal: (ctx) => ctx.isHorizontal,
        isVertical: (ctx) => ctx.isVertical,
        hasIndex: (_ctx, evt) => evt.index != null,
      },
      activities: {
        trackFormControlState(ctx) {
          return trackFormControl(dom.getRootEl(ctx), {
            onFieldsetDisabled() {
              ctx.disabled = true
            },
            onFormReset() {
              if (!ctx.name) return
              assignArray(ctx.value, ctx.initialValues)
            },
          })
        },

        trackPointerMove(ctx, _evt, { send }) {
          return trackPointerMove(dom.getDoc(ctx), {
            onPointerMove(info) {
              send({ type: "POINTER_MOVE", point: info.point })
            },
            onPointerUp() {
              send("POINTER_UP")
            },
          })
        },
        trackThumbsSize(ctx) {
          if (ctx.thumbAlignment !== "contain") return
          return trackElementsSize({
            getNodes() {
              return dom.getElements(ctx)
            },
            observeMutation: true,
            callback(size, index) {
              if (size) {
                ctx.thumbSizes[index] = size
              }
            },
          })
        },
      },
      actions: {
        invokeOnChangeStart(ctx) {
          ctx.onChangeStart?.({ value: ctx.value })
        },
        invokeOnChangeEnd(ctx) {
          ctx.onChangeEnd?.({ value: ctx.value })
        },
        invokeOnChange(ctx) {
          ctx.onChange?.({ value: ctx.value })
        },
        dispatchChangeEvent(ctx) {
          raf(() => {
            dom.dispatchChangeEvent(ctx)
          })
        },
        setClosestThumbIndex(ctx, evt) {
          const pointValue = dom.getValueFromPoint(ctx, evt.point)
          ctx.activeIndex = getClosestIndex(ctx, pointValue)
        },
        setActiveIndex(ctx, evt) {
          ctx.activeIndex = evt.index
        },
        clearActiveIndex(ctx) {
          ctx.activeIndex = -1
        },
        setPointerValue(ctx, evt) {
          const value = dom.getValueFromPoint(ctx, evt.point)
          if (value == null) return
          ctx.value[ctx.activeIndex] = constrainValue(ctx, value, ctx.activeIndex)
        },
        focusActiveThumb(ctx) {
          raf(() => {
            const thumb = dom.getThumbEl(ctx, ctx.activeIndex)
            thumb?.focus()
          })
        },
        decrementAtIndex(ctx, evt) {
          const nextValue = decrement(ctx, evt.index, evt.step)
          assignArray(ctx.value, nextValue)
        },
        incrementAtIndex(ctx, evt) {
          const nextValue = increment(ctx, evt.index, evt.step)
          assignArray(ctx.value, nextValue)
        },
        setActiveThumbToMin(ctx) {
          const { min } = getRangeAtIndex(ctx, ctx.activeIndex)
          ctx.value[ctx.activeIndex] = min
        },
        setActiveThumbToMax(ctx) {
          const { max } = getRangeAtIndex(ctx, ctx.activeIndex)
          ctx.value[ctx.activeIndex] = max
        },
        checkValue(ctx) {
          const nextValue = normalizeValues(ctx, ctx.value)
          assignArray(ctx.value, nextValue)
          assignArray(ctx.initialValues, nextValue)
        },
        setValueAtIndex(ctx, evt) {
          ctx.value[evt.index] = constrainValue(ctx, evt.value, evt.index)
        },
        setValue(ctx, evt) {
          assignArray(ctx.value, normalizeValues(ctx, evt.value))
        },
      },
    },
  )
}
