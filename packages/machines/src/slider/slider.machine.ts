import { createMachine, ref, StateMachine } from "@ui-machines/core"
import { nextTick } from "tiny-fn"
import { clamp, decrement, increment, snapToStep } from "tiny-num"
import { fromElement } from "tiny-rect/from-element"
import { trackPointerMove } from "../utils/pointer-move"
import { DOM } from "../utils/types"
import { dom } from "./slider.dom"

export type SliderMachineContext = DOM.Context<{
  value: number
  name?: string
  disabled?: boolean
  min: number
  max: number
  step: number
  threshold: number
  orientation?: "vertical" | "horizontal"
  /**
   * - "start": Useful when the value represents an absolute value
   * - "center": Useful when the value represents an offset (relative)
   */
  origin?: "start" | "center"
  "aria-label"?: string
  "aria-labelledby"?: string
  focusThumbOnChange?: boolean
  getAriaValueText?(value: number): string
  onChange?(value: number): void
  onChangeEnd?(value: number): void
  onChangeStart?(value: number): void
  thumbSize: { width: number; height: number }
}> &
  StateMachine.Computed<{
    isHorizontal: boolean
    isVertical: boolean
    isRtl: boolean
  }>

export type SliderMachineState = {
  value: "unknown" | "idle" | "dragging" | "focus"
}

export const sliderMachine = createMachine<SliderMachineContext, SliderMachineState>(
  {
    id: "slider-machine",
    initial: "unknown",
    context: {
      thumbSize: { width: 0, height: 0 },
      uid: "slider",
      disabled: false,
      threshold: 5,
      dir: "ltr",
      origin: "start",
      orientation: "horizontal",
      value: 0,
      step: 1,
      min: 0,
      max: 100,
      focusThumbOnChange: true,
    },
    computed: {
      isHorizontal: (ctx) => ctx.orientation === "horizontal",
      isVertical: (ctx) => ctx.orientation === "vertical",
      isRtl: (ctx) => ctx.dir === "rtl",
    },
    watch: {
      value: "invokeOnChange",
    },
    on: {
      STOP: "focus",
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
            actions: ["setPointerValue", "invokeOnChangeStart", "focusThumb"],
          },
          FOCUS: {
            target: "focus",
            actions: "focusThumb",
          },
        },
      },
      focus: {
        entry: "focusThumb",
        on: {
          POINTER_DOWN: {
            target: "dragging",
            actions: ["setPointerValue", "invokeOnChangeStart", "focusThumb"],
          },
          ARROW_LEFT: {
            actions: ["decrement"],
          },
          ARROW_RIGHT: {
            actions: ["increment"],
          },
          ARROW_UP: {
            actions: ["increment"],
          },
          ARROW_DOWN: {
            actions: ["decrement"],
          },
          PAGE_UP: {
            actions: ["increment"],
          },
          PAGE_DOWN: {
            actions: ["decrement"],
          },
          HOME: {
            actions: ["setToMin"],
          },
          END: {
            actions: ["setToMax"],
          },
          BLUR: "idle",
        },
      },
      dragging: {
        entry: "focusThumb",
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
    guards: {
      isRtl: (ctx) => ctx.dir === "rtl",
      focusThumbOnChange: (ctx) => !!ctx.focusThumbOnChange,
    },
    activities: {
      trackPointerMove(ctx, _evt, { send }) {
        return trackPointerMove({
          ctx,
          onPointerMove(_e, info) {
            const value = dom.getValueFromPoint(ctx, info.point)
            if (value == null) return

            ctx.value = value
            ctx.onChange?.(value)
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
          const thumb = dom.getThumbEl(ctx)
          if (!thumb) return
          const rect = fromElement(thumb)
          ctx.thumbSize.width = rect.width
          ctx.thumbSize.height = rect.height
        })
      },
      setPointerValue(ctx, evt) {
        const value = dom.getValueFromPoint(ctx, evt.point)
        if (value != null) ctx.value = value
      },
      focusThumb(ctx) {
        nextTick(() => dom.getThumbEl(ctx)?.focus())
      },
      decrement(ctx, evt) {
        let value = decrement(ctx.value, evt.step ?? ctx.step)
        value = parseFloat(snapToStep(value, ctx.step))
        ctx.value = clamp(value, ctx)
      },
      increment(ctx, evt) {
        let value = increment(ctx.value, evt.step ?? ctx.step)
        value = parseFloat(snapToStep(value, ctx.step))
        ctx.value = clamp(value, ctx)
      },
      setToMin(ctx) {
        ctx.value = ctx.min
      },
      setToMax(ctx) {
        ctx.value = ctx.max
      },
    },
  },
)
