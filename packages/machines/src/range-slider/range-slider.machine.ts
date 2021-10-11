import { createMachine, ref, StateMachine } from "@ui-machines/core"
import { nextTick } from "tiny-fn"
import { decrement, increment, snapToStep } from "tiny-num"
import { closest } from "tiny-point/distance"
import { center } from "tiny-rect"
import { fromElement } from "tiny-rect/from-element"
import { trackPointerMove } from "../utils/pointer-move"
import { Context } from "../utils/types"
import { dom, getRangeAtIndex } from "./range-slider.dom"

export type RangeSliderMachineContext = Context<{
  "aria-label"?: string | string[]
  "aria-labelledby"?: string | string[]
  thumbSize: Array<{ width: number; height: number }> | null
  name?: string[]
  threshold: number
  activeIndex: number
  value: number[]
  disabled?: boolean
  orientation?: "vertical" | "horizontal"
  onChange?(value: number[]): void
  onChangeStart?(value: number[]): void
  onChangeEnd?(value: number[]): void
  getAriaValueText?(value: number, index: number): string
  min: number
  max: number
  step: number
}> &
  StateMachine.Computed<{
    isVertical: boolean
    isHorizontal: boolean
    isRtl: boolean
  }>

export type RangeSliderMachineState = {
  value: "unknown" | "idle" | "dragging" | "focus"
}

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
    },
    computed: {
      isHorizontal: (ctx) => ctx.orientation === "horizontal",
      isVertical: (ctx) => ctx.orientation === "vertical",
      isRtl: (ctx) => ctx.dir === "rtl",
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
          BLUR: "idle",
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
        // evt.index means this was passed on a keyboard event (`onKeyDown`)
        let index = evt.index

        // if there's no index, we assume it's from a pointer down event (`onPointerDown`)
        // and we attempt to compute the closest index
        if (index == null) {
          const thumbs = dom.getElements(ctx)

          // get the center point of all thumbs
          const points = thumbs.map((el) => fromElement(el)).map((rect) => center(rect))

          // get the closest center point from the event ("pointerdown") point
          const getClosest = closest(...points)
          const closestPoint = getClosest(evt.point)
          index = points.indexOf(closestPoint)
        }

        ctx.activeIndex = index
      },
      setValueForEvent(ctx, evt) {
        const value = dom.getValueFromPoint(ctx, evt.point)
        if (typeof value === "number") {
          ctx.value[ctx.activeIndex] = value
        }
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
