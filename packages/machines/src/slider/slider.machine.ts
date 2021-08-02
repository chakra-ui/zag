import { createMachine, preserve } from "@ui-machines/core"
import {
  addDomEvent,
  dispatchInputEvent,
  EventListenerWithPointInfo as Listener,
} from "@core-dom/event"
import { is } from "@core-foundation/utils/is"
import { nextTick, pipe } from "@core-foundation/utils/fn"
import { NumericRange } from "@core-foundation/numeric-range"
import { WithDOM } from "../type-utils"
import { getElements, pointToValue } from "./slider.dom"

export type SliderMachineContext = WithDOM<{
  value: number
  name?: string
  disabled?: boolean
  min: number
  max: number
  step: number
  threshold: number
  orientation?: "vertical" | "horizontal"
  "aria-label"?: string
  "aria-labelledby"?: string
  getAriaValueText?(value: number): string
  onChange?(value: number): void
  onChangeEnd?(value: number): void
  onChangeStart?(value: number): void
}>

export type SliderMachineState = {
  value: "mounted" | "idle" | "panning" | "focus"
}

export const sliderMachine = createMachine<
  SliderMachineContext,
  SliderMachineState
>(
  {
    id: "slider-machine",
    initial: "mounted",
    context: {
      uid: "slider",
      disabled: false,
      threshold: 5,
      direction: "ltr",
      orientation: "horizontal",
      value: 0,
      step: 1,
      min: 0,
      max: 100,
    },
    on: {
      STOP: "focus",
    },
    states: {
      mounted: {
        on: {
          SETUP: {
            target: "idle",
            actions: ["setId", "setOwnerDocument"],
          },
        },
      },
      idle: {
        on: {
          POINTER_DOWN: {
            target: "panning",
            actions: ["setValueForEvent", "invokeOnChangeStart", "focusThumb"],
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
            target: "panning",
            actions: [
              "setValueForEvent",
              "invokeOnChangeStart",
              "invokeOnChange",
              "focusThumb",
            ],
          },
          ARROW_LEFT: {
            actions: ["decrement", "invokeOnChange"],
          },
          ARROW_RIGHT: {
            actions: ["increment", "invokeOnChange"],
          },
          ARROW_UP: {
            actions: ["increment", "invokeOnChange"],
          },
          ARROW_DOWN: {
            actions: ["decrement", "invokeOnChange"],
          },
          PAGE_UP: {
            actions: ["increment", "invokeOnChange"],
          },
          PAGE_DOWN: {
            actions: ["decrement", "invokeOnChange"],
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
      panning: {
        entry: "focusThumb",
        activities: "attachPointerTrackers",
        on: {
          POINTER_UP: { target: "focus", actions: "invokeOnChangeEnd" },
        },
      },
    },
  },
  {
    activities: {
      attachPointerTrackers(ctx, _evt, { send }) {
        const doc = ctx.doc ?? document

        const onPointerMove: Listener = (event, info) => {
          if (info.point.distance() < ctx.threshold) {
            return
          }

          // Because Safari doesn't trigger mouseup events when it's above a `<select>`
          if (is.mouseEvent(event) && event.button === 0) {
            send("POINTER_UP")
            return
          }

          const value = pointToValue(ctx, info.point)
          if (typeof value === "undefined") return

          ctx.value = value
          ctx.onChange?.(value)
          dispatchChangeEvent(ctx)
        }

        const onPointerUp = () => {
          send("POINTER_UP")
        }

        return pipe(
          addDomEvent(doc, "pointermove", onPointerMove, false),
          addDomEvent(doc, "pointerup", onPointerUp, false),
          addDomEvent(doc, "pointercancel", onPointerUp, false),
          addDomEvent(doc, "contextmenu", onPointerUp, false),
        )
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
      setValueForEvent(ctx, evt) {
        const value = pointToValue(ctx, evt.point)
        if (value != null) ctx.value = value
      },
      focusThumb(ctx) {
        nextTick(() => {
          const { thumb } = getElements(ctx)
          thumb?.focus()
        })
      },
      decrement(ctx, evt) {
        const range = new NumericRange(ctx).decrement(evt.step)
        ctx.value = new NumericRange(ctx)
          .setValue(+range)
          .snapToStep()
          .clamp()
          .valueOf()
      },
      increment(ctx, evt) {
        const range = new NumericRange(ctx).increment(evt.step)
        ctx.value = new NumericRange(ctx)
          .setValue(+range)
          .snapToStep()
          .clamp()
          .valueOf()
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
