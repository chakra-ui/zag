import { createMachine, ref } from "@ui-machines/core"
import { nextTick } from "tiny-fn"
import { decrement, increment, snapToStep } from "../utils/number"
import { fromElement } from "tiny-rect/from-element"
import { trackPointerMove } from "../utils"
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
            actions: [
              "setActiveIndex",
              "setValueForEvent",
              "invokeOnChangeStart",
              "invokeOnChange",
              "focusActiveThumb",
            ],
          },
          FOCUS: {
            target: "focus",
            actions: ["setActiveIndex", "focusActiveThumb"],
          },
        },
      },
      focus: {
        entry: "focusActiveThumb",
        on: {
          POINTER_DOWN: {
            target: "dragging",
            actions: [
              "setActiveIndex",
              "setValueForEvent",
              "invokeOnChangeStart",
              "invokeOnChange",
              "focusActiveThumb",
            ],
          },
          ARROW_LEFT: {
            actions: ["decrementAtIndex", "invokeOnChange"],
          },
          ARROW_RIGHT: {
            actions: ["incrementAtIndex", "invokeOnChange"],
          },
          ARROW_UP: {
            actions: ["incrementAtIndex", "invokeOnChange"],
          },
          ARROW_DOWN: {
            actions: ["decrementAtIndex", "invokeOnChange"],
          },
          PAGE_UP: {
            actions: ["incrementAtIndex", "invokeOnChange"],
          },
          PAGE_DOWN: {
            actions: ["decrementAtIndex", "invokeOnChange"],
          },
          HOME: {
            actions: ["setActiveThumbToMin", "invokeOnChange"],
          },
          END: {
            actions: ["setActiveThumbToMax", "invokeOnChange"],
          },
          BLUR: {
            target: "idle",
            actions: ["resetActiveIndex"],
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
        },
      },
    },
  },
  {
    activities: {
      trackPointerMove(ctx, _evt, { send }) {
        return trackPointerMove({
          ctx,
          onPointerMove(_evt, info) {
            const value = dom.getValueFromPoint(ctx, info.point)
            if (value == null) return
            ctx.value[ctx.activeIndex] = value
            ctx.onChange?.(ctx.value)
            dom.dispatchChangeEvent(ctx)
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
      resetActiveIndex(ctx) {
        ctx.activeIndex = -1
      },
      setValueForEvent(ctx, evt) {
        const value = dom.getValueFromPoint(ctx, evt.point)
        if (value != null) ctx.value[ctx.activeIndex] = value
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
