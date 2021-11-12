import { createMachine, ref } from "@ui-machines/core"
import { nextTick } from "tiny-fn"
import { fromElement } from "tiny-rect/from-element"
import { trackPointerMove } from "../utils"
import { decrement, increment, snapToStep } from "../utils/number"
import { dom, getClosestIndex, getRangeAtIndex } from "./range-slider.dom"
import { RangeSliderMachineContext, RangeSliderMachineState } from "./range-slider.types"

export const rangeSliderMachine = createMachine<RangeSliderMachineContext, RangeSliderMachineState>(
  {
    id: "range-slider-machine",
    initial: "unknown",
    context: {
      thumbSize: null,
      uid: "48",
      threshold: 5,
      activeIndex: -1,
      min: 0,
      max: 100,
      step: 1,
      value: [0, 100],
      orientation: "horizontal",
      dir: "ltr",
      minStepsBetweenThumbs: 0,
    },
    computed: {
      isHorizontal: (ctx) => ctx.orientation === "horizontal",
      isVertical: (ctx) => ctx.orientation === "vertical",
      isRtl: (ctx) => ctx.orientation === "horizontal" && ctx.dir === "rtl",
    },
    watch: {
      value: ["invokeOnChange", "dispatchChangeEvent"],
    },
    states: {
      unknown: {
        on: {
          SETUP: {
            target: "idle",
            actions: ["setId", "setOwnerDocument", "setThumbSize"],
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
            actions: "decrementAtIndex",
          },
          ARROW_RIGHT: {
            actions: "incrementAtIndex",
          },
          ARROW_UP: {
            actions: "incrementAtIndex",
          },
          ARROW_DOWN: {
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
    activities: {
      trackPointerMove(ctx, _evt, { send }) {
        return trackPointerMove({
          ctx,
          onPointerMove(info) {
            send({ type: "POINTER_MOVE", point: info.point })
          },
          onPointerUp() {
            send("POINTER_UP")
          },
        })
      },
    },
    actions: {
      setId(ctx, evt) {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = ref(evt.doc)
      },
      invokeOnChangeStart(ctx) {
        ctx.onChangeStart?.(ctx.value)
      },
      invokeOnChangeEnd(ctx) {
        ctx.onChangeEnd?.(ctx.value)
      },
      invokeOnChange(ctx) {
        ctx.onChange?.(ctx.value)
      },
      dispatchChangeEvent(ctx) {
        dom.dispatchChangeEvent(ctx)
      },
      setThumbSize(ctx) {
        nextTick(() => {
          const thumbs = dom.getElements(ctx)
          ctx.thumbSize = thumbs.map((thumb) => {
            const { width, height } = fromElement(thumb)
            return { width, height }
          })
        })
      },
      setActiveIndex(ctx, evt) {
        ctx.activeIndex = getClosestIndex(ctx, evt)
      },
      clearActiveIndex(ctx) {
        ctx.activeIndex = -1
      },
      setPointerValue(ctx, evt) {
        const value = dom.getValueFromPoint(ctx, evt.point)
        if (value == null) return
        ctx.value[ctx.activeIndex] = value
      },
      focusActiveThumb(ctx) {
        nextTick(() => {
          const thumb = dom.getThumbEl(ctx, ctx.activeIndex)
          thumb?.focus()
        })
      },
      decrementAtIndex(ctx, evt) {
        const value = snapToStep(decrement(getRangeAtIndex(ctx).value, evt.step), ctx.step)
        ctx.value[ctx.activeIndex] = parseFloat(value)
      },
      incrementAtIndex(ctx, evt) {
        const value = snapToStep(increment(getRangeAtIndex(ctx).value, evt.step), ctx.step)
        ctx.value[ctx.activeIndex] = parseFloat(value)
      },
      setActiveThumbToMin(ctx) {
        const { min } = getRangeAtIndex(ctx)
        ctx.value[ctx.activeIndex] = min
      },
      setActiveThumbToMax(ctx) {
        const { max } = getRangeAtIndex(ctx)
        ctx.value[ctx.activeIndex] = max
      },
    },
  },
)
