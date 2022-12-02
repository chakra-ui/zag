import { createMachine } from "@zag-js/core"
import { raf, trackPointerMove } from "@zag-js/dom-utils"
import { trackElementsSize } from "@zag-js/element-size"
import { trackFormControl } from "@zag-js/form-utils"
import { compact } from "@zag-js/utils"
import { dom, getClosestIndex } from "./range-slider.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./range-slider.types"
import { utils } from "./range-slider.utils"

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
        values: [0, 100],
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
      },

      watch: {
        values: ["invokeOnChange", "dispatchChangeEvent"],
      },

      activities: ["trackFormControlState", "trackThumbsSize"],

      on: {
        SET_VALUE: {
          actions: "setValue",
        },
        INCREMENT: {
          actions: "incrementAtIndex",
        },
        DECREMENT: {
          actions: "decrementAtIndex",
        },
      },

      entry: "checkValue",

      states: {
        idle: {
          on: {
            POINTER_DOWN: {
              target: "dragging",
              actions: ["setActiveIndex", "invokeOnChangeStart", "setPointerValue", "focusActiveThumb"],
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
              actions: ["setActiveIndex", "invokeOnChangeStart", "setPointerValue", "focusActiveThumb"],
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
      },
      activities: {
        trackFormControlState(ctx) {
          return trackFormControl(dom.getRootEl(ctx), {
            onFieldsetDisabled() {
              ctx.disabled = true
            },
            onFormReset() {
              if (!ctx.name) return

              ctx.values.forEach((_value, index) => {
                if (ctx.initialValues[index] != null) {
                  ctx.values[index] = ctx.initialValues[index]
                }
              })
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
          ctx.onChangeStart?.({ value: ctx.values })
        },
        invokeOnChangeEnd(ctx) {
          ctx.onChangeEnd?.({ value: ctx.values })
        },
        invokeOnChange(ctx) {
          ctx.onChange?.({ value: ctx.values })
        },
        dispatchChangeEvent(ctx) {
          raf(() => {
            dom.dispatchChangeEvent(ctx)
          })
        },
        setActiveIndex(ctx, evt) {
          ctx.activeIndex = evt.index ?? getClosestIndex(ctx, evt)
        },
        clearActiveIndex(ctx) {
          ctx.activeIndex = -1
        },
        setPointerValue(ctx, evt) {
          const value = dom.getValueFromPoint(ctx, evt.point)
          if (value == null) return
          ctx.values[ctx.activeIndex] = utils.convert(ctx, value, ctx.activeIndex)
        },
        focusActiveThumb(ctx) {
          raf(() => {
            const thumb = dom.getThumbEl(ctx, ctx.activeIndex)
            thumb?.focus()
          })
        },
        decrementAtIndex(ctx, evt) {
          ctx.values[ctx.activeIndex] = utils.decrement(ctx, evt.index, evt.step)
        },
        incrementAtIndex(ctx, evt) {
          ctx.values[ctx.activeIndex] = utils.increment(ctx, evt.index, evt.step)
        },
        setActiveThumbToMin(ctx) {
          const { min } = utils.getRangeAtIndex(ctx, ctx.activeIndex)
          ctx.values[ctx.activeIndex] = min
        },
        setActiveThumbToMax(ctx) {
          const { max } = utils.getRangeAtIndex(ctx, ctx.activeIndex)
          ctx.values[ctx.activeIndex] = max
        },
        checkValue(ctx) {
          let values = utils.check(ctx, ctx.values)
          ctx.values = values
          ctx.initialValues = values.slice()
        },
        setValue(ctx, evt) {
          // set value at specified index
          if (typeof evt.index === "number" && typeof evt.value === "number") {
            ctx.values[evt.index] = utils.convert(ctx, evt.value, evt.index)
            return
          }

          // set values
          if (Array.isArray(evt.value)) {
            ctx.values = utils.check(ctx, evt.value)
          }
        },
      },
    },
  )
}
