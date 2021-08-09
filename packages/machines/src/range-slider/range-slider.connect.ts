import { StateMachine as S } from "@ui-machines/core"
import { cast } from "@core-foundation/utils/fn"
import { NumericRange } from "@core-foundation/numeric-range"
import { Point } from "@core-graphics/point"
import {
  dataAttr,
  determineEventKey,
  getStepMultipler,
  defaultPropNormalizer,
  PropNormalizer,
} from "../dom-utils"
import {
  DOMHTMLProps,
  DOMInputProps,
  EventKeyMap,
  WithDataAttr,
} from "../type-utils"
import { getElementIds } from "./range-slider.dom"
import {
  RangeSliderMachineContext,
  RangeSliderMachineState,
} from "./range-slider.machine"

export function connectRangeSliderMachine(
  state: S.State<RangeSliderMachineContext, RangeSliderMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize: PropNormalizer = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const { min, max, value: values } = ctx

  // const range = new Range(ctx)
  const ids = getElementIds(ctx.uid)

  const ariaLabel = ctx["aria-label"]
  const ariaLabelledBy = ctx["aria-labelledby"]

  const isFocused = state.matches("focus")

  const innerTrackStart = (values[0] / ctx.max) * 100
  const innerTrackEnd = (values[values.length - 1] / ctx.max) * 100
  const innerTrackWidth = innerTrackEnd - innerTrackStart

  return {
    getThumbProps(index: number) {
      const value = values[index]
      const percent = new NumericRange({ min, max, value }).toPercent()
      const range = NumericRange.fromValues(ctx.value, ctx)[index]
      const ariaValueText = ctx.getAriaValueText?.(value, index)

      return normalize<WithDataAttr<DOMHTMLProps>>({
        id: ids.getThumbId(index),
        "data-disabled": dataAttr(ctx.disabled),
        "data-orientation": ctx.orientation,
        "data-focused": dataAttr(isFocused),
        draggable: false,
        "aria-disabled": ctx.disabled || undefined,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabel ? undefined : ariaLabelledBy,
        "aria-orientation": ctx.orientation,
        "aria-valuemax": range.max,
        "aria-valuemin": range.min,
        "aria-valuenow": values[index],
        "aria-valuetext": ariaValueText,
        style: {
          "--slider-thumb-percent": `${percent}%`,
        },
        role: "slider",
        tabIndex: ctx.disabled ? -1 : 0,
        onBlur() {
          send("BLUR")
        },
        onFocus() {
          send({ type: "FOCUS", index })
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
      })
    },

    getInputProps(index: number) {
      return normalize<DOMInputProps>({
        type: "hidden",
        value: ctx.value[index],
        id: ids.getInputId(index),
      })
    },

    innerTrackProps: normalize<WithDataAttr<DOMHTMLProps>>({
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-state": state,
      style: {
        "--slider-inner-track-start": `${innerTrackStart}%`,
        "--slider-inner-track-width": `${innerTrackWidth}%`,
      },
    }),

    rootProps: normalize<WithDataAttr<DOMHTMLProps>>({
      id: ids.root,
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-focused": dataAttr(isFocused),
      tabIndex: -1,
      style: {
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        msUserSelect: "none",
      },
      onPointerDown(event) {
        if (event.button !== 0) return

        event.preventDefault()
        event.stopPropagation()

        send({
          type: "POINTER_DOWN",
          point: Point.fromPointerEvent(cast(event)),
        })
      },
    }),
  }
}
