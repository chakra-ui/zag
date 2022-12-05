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
      initial: "unknown",

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
      },

      watch: {
        value: ["invokeOnChange", "dispatchChangeEvent"],
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

      states: {
        unknown: {
          on: {
            SETUP: {
              target: "idle",
              actions: "checkValue",
            },
          },
        },
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

              ctx.value.forEach((_value, index) => {
                if (ctx.initialValues[index] != null) {
                  ctx.value[index] = ctx.initialValues[index]
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
          ctx.onChangeStart?.({ value: ctx.value })
        },
        invokeOnChangeEnd(ctx) {
          ctx.onChangeEnd?.({ value: ctx.value })
        },
        invokeOnChange(ctx, evt) {
          if (evt.type !== "SETUP") {
            ctx.onChange?.({ value: ctx.value })
          }
        },
        dispatchChangeEvent(ctx, evt) {
          if (evt.type !== "SETUP") {
            raf(() => {
              dom.dispatchChangeEvent(ctx)
            })
          }
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
          ctx.value[ctx.activeIndex] = utils.convert(ctx, value, ctx.activeIndex)
        },
        focusActiveThumb(ctx) {
          raf(() => {
            const thumb = dom.getThumbEl(ctx, ctx.activeIndex)
            thumb?.focus()
          })
        },
        decrementAtIndex(ctx, evt) {
          ctx.value[ctx.activeIndex] = utils.decrement(ctx, evt.index, evt.step)
        },
        incrementAtIndex(ctx, evt) {
          ctx.value[ctx.activeIndex] = utils.increment(ctx, evt.index, evt.step)
        },
        setActiveThumbToMin(ctx) {
          const { min } = utils.getRangeAtIndex(ctx, ctx.activeIndex)
          ctx.value[ctx.activeIndex] = min
        },
        setActiveThumbToMax(ctx) {
          const { max } = utils.getRangeAtIndex(ctx, ctx.activeIndex)
          ctx.value[ctx.activeIndex] = max
        },
        checkValue(ctx) {
          let value = utils.check(ctx, ctx.value)
          ctx.value = value
          ctx.initialValues = value.slice()
        },
        setValue(ctx, evt) {
          // set value at specified index
          if (typeof evt.index === "number" && typeof evt.value === "number") {
            ctx.value[evt.index] = utils.convert(ctx, evt.value, evt.index)
            return
          }

          // set values
          if (Array.isArray(evt.value)) {
            ctx.value = utils.check(ctx, evt.value)
          }
        },
      },
    },
  )
}
