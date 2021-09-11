import { NumericRange } from "@core-foundation/numeric-range"
import { cast } from "@core-foundation/utils/fn"
import { Point } from "@core-graphics/point"
import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, defaultPropNormalizer } from "../utils/dom-attr"
import { getEventKey } from "../utils/get-event-key"
import { getEventStep } from "../utils/get-step"
import { EventKeyMap, HTMLProps, InputProps } from "../utils/types"
import { getIds, getStyles } from "./range-slider.dom"
import { RangeSliderMachineContext, RangeSliderMachineState } from "./range-slider.machine"

export function rangeSliderConnect(
  state: S.State<RangeSliderMachineContext, RangeSliderMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const { value: values, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy } = ctx

  const ids = getIds(ctx.uid)

  const isFocused = state.matches("focus")
  const isDragging = state.matches("dragging")
  const styles = getStyles(ctx)

  return {
    values: ctx.value,
    isDragging,
    isFocused,

    trackProps: normalize<HTMLProps>({
      id: ids.track,
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-focused": dataAttr(isFocused),
      style: styles.track,
    }),

    getThumbProps(index: number) {
      const value = values[index]
      const range = NumericRange.fromValues(ctx.value, ctx)[index]
      const ariaValueText = ctx.getAriaValueText?.(value, index)

      return normalize<HTMLProps>({
        id: ids.getThumbId(index),
        "data-disabled": dataAttr(ctx.disabled),
        "data-orientation": ctx.orientation,
        "data-focused": dataAttr(isFocused),
        draggable: false,
        "aria-disabled": ctx.disabled || undefined,
        "aria-label": ariaLabel?.[index],
        "aria-labelledby": ariaLabel ? undefined : ariaLabelledBy?.[index],
        "aria-orientation": ctx.orientation,
        "aria-valuemax": range.max,
        "aria-valuemin": range.min,
        "aria-valuenow": values[index],
        "aria-valuetext": ariaValueText,
        role: "slider",
        tabIndex: ctx.disabled ? -1 : 0,
        style: styles.getThumb(index),
        onBlur() {
          send("BLUR")
        },
        onFocus() {
          send({ type: "FOCUS", index })
        },
        onKeyDown(event) {
          const step = getEventStep(event) * ctx.step
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

          const key = getEventKey(event, ctx)
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
      return normalize<InputProps>({
        name: ctx.name?.[index],
        type: "hidden",
        value: ctx.value[index],
        id: ids.getInputId(index),
      })
    },

    rangeProps: normalize<HTMLProps>({
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-state": state,
      style: styles.range,
    }),

    rootProps: normalize<HTMLProps>({
      id: ids.root,
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-focused": dataAttr(isFocused),
      style: styles.root,
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
