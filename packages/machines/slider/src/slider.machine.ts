import { createMachine, ref } from "@ui-machines/core"
import { nextTick } from "tiny-fn"
import { fromElement } from "tiny-rect/from-element"
import { Context, trackPointerMove } from "../utils"
import { clamp, decrement, increment, snapToStep } from "../utils/number"
import { dom } from "./slider.dom"

export type SliderMachineContext = Context<{
  /**
   * The value of the slider
   */
  value: number
  /**
   * The name associated with the slider (when used in a form)
   */
  name?: string
  /**
   * Whether the slider is disabled
   */
  disabled?: boolean
  /**
   * The minimum value of the slider
   */
  min: number
  /**
   * The maximum value of the slider
   */
  max: number
  /**
   * The step value of the slider
   */
  step: number
  /**
   * The move threshold of the slider thumb before it is considered to be moved
   */
  threshold: number
  /**
   * The orientation of the slider
   */
  orientation?: "vertical" | "horizontal"
  /**
   * - "start": Useful when the value represents an absolute value
   * - "center": Useful when the value represents an offset (relative)
   */
  origin?: "start" | "center"
  /**
   * The aria-label of the slider. Useful for providing an accessible name to the slider
   */
  "aria-label"?: string
  /**
   * The `id` of the element that labels the slider. Useful for providing an accessible name to the slider
   */
  "aria-labelledby"?: string
  /**
   * Whether to focus the slider thumb after interaction (scrub and keyboard)
   */
  focusThumbOnChange?: boolean
  /**
   * Function that returns a human readable value for the slider
   */
  getAriaValueText?(value: number): string
  /**
   * Function invoked when the value of the slider changes
   */
  onChange?(value: number): void
  /**
   * Function invoked when the slider value change is done
   */
  onChangeEnd?(value: number): void
  /**
   * Function invoked when the slider value change is started
   */
  onChangeStart?(value: number): void
  /**
   * The slider thumb dimensions
   */
  thumbSize: { width: number; height: number }
  /**
   * @computed Whether the slider is horizontal
   */
  readonly isHorizontal: boolean
  /**
   * @computed Whether the slider is vertical
   */
  readonly isVertical: boolean
  /**
   * @computed Whether the slider is in RTL mode
   */
  readonly isRtl: boolean
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
      isRtl: (ctx) => ctx.orientation === "horizontal" && ctx.dir === "rtl",
    },
    watch: {
      value: ["invokeOnChange", "dispatchChangeEvent"],
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
          FOCUS: "focus",
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
          POINTER_MOVE: {
            actions: "setPointerValue",
          },
        },
      },
    },
  },
  {
    guards: {
      focusThumbOnChange: (ctx) => !!ctx.focusThumbOnChange,
    },
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
          const thumb = dom.getThumbEl(ctx)
          if (!thumb) return
          const { width, height } = fromElement(thumb)
          ctx.thumbSize.width = width
          ctx.thumbSize.height = height
        })
      },
      setPointerValue(ctx, evt) {
        const value = dom.getValueFromPoint(ctx, evt.point)
        if (value == null) return
        ctx.value = value
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
      setValue(ctx, evt) {
        ctx.value = evt.value
      },
    },
  },
)
