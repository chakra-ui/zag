import { NumericRange } from "@core-foundation/numeric-range"
import { cast } from "@core-foundation/utils"
import { Point } from "@core-graphics/point"
import {
  defaultPropNormalizer,
  PropNormalizer,
  StateMachine as S,
} from "@ui-machines/core"
import { dataAttr, determineEventKey, getStepMultipler } from "../dom-utils"
import {
  DOMHTMLProps,
  DOMInputProps,
  EventKeyMap,
  WithDataAttr,
} from "../type-utils"
import { getElementIds } from "./slider.dom"
import { SliderMachineContext, SliderMachineState } from "./slider.machine"

export function connectSliderMachine(
  state: S.State<SliderMachineContext, SliderMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize: PropNormalizer = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const range = new NumericRange(ctx)
  const ids = getElementIds(ctx.uid)

  const ariaLabel = ctx["aria-label"]
  const ariaLabelledBy = ctx["aria-labelledby"]
  const ariaValueText = ctx.getAriaValueText?.(ctx.value)

  const isFocused = state.matches("focus")

  return {
    thumbProps: normalize<WithDataAttr<DOMHTMLProps>>({
      id: ids.thumb,
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-focused": dataAttr(isFocused),
      draggable: false,
      "aria-disabled": ctx.disabled || undefined,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabel ? undefined : ariaLabelledBy,
      "aria-orientation": ctx.orientation,
      "aria-valuemax": ctx.max,
      "aria-valuemin": ctx.min,
      "aria-valuenow": ctx.value,
      "aria-valuetext": ariaValueText,
      role: "slider",
      tabIndex: ctx.disabled ? -1 : 0,
      onBlur() {
        send("BLUR")
      },
      onFocus() {
        send("FOCUS")
      },
      onKeyDown(event) {
        const step = getStepMultipler(event) * ctx.step
        const keyMap: EventKeyMap = {
          ArrowUp() {
            send({ type: "ARROW_UP", step })
          },
          ArrowDown() {
            send({ type: "ARROW_DOWN", step })
          },
          ArrowLeft() {
            send({ type: "ARROW_LEFT", step })
          },
          ArrowRight() {
            send({ type: "ARROW_RIGHT", step })
          },
          PageUp() {
            send({ type: "PAGE_UP", step })
          },
          PageDown() {
            send({ type: "PAGE_DOWN", step })
          },
          Home() {
            send("HOME")
          },
          End() {
            send("END")
          },
        }

        const key = determineEventKey(event, ctx)
        const exec = keyMap[key]

        if (exec) {
          event.preventDefault()
          event.stopPropagation()
          exec(event)
        }
      },
    }),

    inputProps: normalize<DOMInputProps>({
      type: "hidden",
      value: ctx.value,
      name: ctx.name,
      id: ids.input,
    }),

    innerTrackProps: normalize<WithDataAttr<DOMHTMLProps>>({
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-state": state,
      "data-value": ctx.value,
    }),

    rootProps: normalize<WithDataAttr<DOMHTMLProps>>({
      id: ids.root,
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-focused": dataAttr(isFocused),
      tabIndex: -1,
      onPointerDown(event) {
        if (event.button !== 0) return

        event.preventDefault()
        event.stopPropagation()

        send({
          type: "POINTER_DOWN",
          point: Point.fromPointerEvent(cast(event)),
        })
      },
      style: {
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        msUserSelect: "none",
        "--slider-thumb-percent": `${range.toPercent()}%`,
      },
    }),
  }
}
