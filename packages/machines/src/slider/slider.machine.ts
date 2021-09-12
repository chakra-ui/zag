import { dispatchInputEvent } from "@core-dom/event"
import { NumericRange } from "@core-foundation/numeric-range"
import { nextTick } from "@core-foundation/utils/fn"
import { fromElement } from "@core-graphics/rect/create"
import { createMachine, preserve } from "@ui-machines/core"
import { trackPointerMove } from "../utils/pointer-move"
import { WithDOM } from "../utils/types"
import { getElements, getValueFromPoint } from "./slider.dom"

export type SliderMachineContext = WithDOM<{
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
  rangeOrigin?: "start" | "center"
  "aria-label"?: string
  "aria-labelledby"?: string
  focusThumbOnChange?: boolean
  getAriaValueText?(value: number): string
  onChange?(value: number): void
  onChangeEnd?(value: number): void
  onChangeStart?(value: number): void
  thumbSize: { width: number; height: number } | null
}>

export type SliderMachineState = {
  value: "unknown" | "idle" | "dragging" | "focus"
}

export const sliderMachine = createMachine<SliderMachineContext, SliderMachineState>(
  {
    id: "slider-machine",
    initial: "unknown",
    context: {
      thumbSize: null,
      uid: "slider",
      disabled: false,
      threshold: 5,
      dir: "ltr",
      rangeOrigin: "start",
      orientation: "horizontal",
      value: 0,
      step: 1,
      min: 0,
      max: 100,
      focusThumbOnChange: true,
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
            actions: ["setPointerValue", "invokeOnChangeStart", "invokeOnChange", "focusThumb"],
          },
          ARROW_LEFT: {
            actions: ["decrementValue", "invokeOnChange"],
          },
          ARROW_RIGHT: {
            actions: ["incrementValue", "invokeOnChange"],
          },
          ARROW_UP: {
            actions: ["incrementValue", "invokeOnChange"],
          },
          ARROW_DOWN: {
            actions: ["decrementValue", "invokeOnChange"],
          },
          PAGE_UP: {
            actions: ["incrementValue", "invokeOnChange"],
          },
          PAGE_DOWN: {
            actions: ["decrementValue", "invokeOnChange"],
          },
          HOME: {
            actions: ["setToMin", "invokeOnChange"],
          },
          END: {
            actions: ["setToMax", "invokeOnChange"],
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
            const value = getValueFromPoint(ctx, info.point)
            if (value == null) return

            ctx.value = value
            ctx.onChange?.(value)
            dispatchChangeEvent(ctx)
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
        ctx.doc = preserve(evt.doc)
      },
      invokeOnChangeStart(ctx) {
        ctx.onChangeStart?.(ctx.value)
      },
      invokeOnChangeEnd(ctx) {
        ctx.onChangeEnd?.(ctx.value)
      },
      invokeOnChange(ctx) {
        ctx.onChange?.(ctx.value)
        dispatchChangeEvent(ctx)
      },
      setThumbSize(ctx) {
        nextTick(() => {
          const { thumb } = getElements(ctx)
          if (!thumb) return
          ctx.thumbSize = fromElement(thumb).size
        })
      },
      setPointerValue(ctx, evt) {
        const value = getValueFromPoint(ctx, evt.point)
        if (value != null) ctx.value = value
      },
      focusThumb(ctx) {
        nextTick(() => {
          const { thumb } = getElements(ctx)
          thumb?.focus()
        })
      },
      decrementValue(ctx, evt) {
        const range = new NumericRange(ctx).decrement(evt.step)
        ctx.value = range.snapToStep().clamp().valueOf()
      },
      incrementValue(ctx, evt) {
        const range = new NumericRange(ctx).increment(evt.step)
        ctx.value = range.snapToStep().clamp().valueOf()
      },
      setToMin(ctx) {
        ctx.value = new NumericRange(ctx).setToMin().valueOf()
      },
      setToMax(ctx) {
        ctx.value = new NumericRange(ctx).setToMax().valueOf()
      },
    },
  },
)

// dispatch change/input event to closest `form` element
function dispatchChangeEvent(ctx: SliderMachineContext) {
  const { input } = getElements(ctx)
  if (input) dispatchInputEvent(input, ctx.value)
}
