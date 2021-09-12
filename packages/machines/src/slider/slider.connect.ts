import { NumericRange } from "@core-foundation/numeric-range"
import { cast } from "@core-foundation/utils"
import { Point } from "@core-graphics/point"
import type { StateMachine as S } from "@ui-machines/core"
import { dataAttr, defaultPropNormalizer } from "../utils/dom-attr"
import { getEventKey } from "../utils/get-event-key"
import { getEventStep } from "../utils/get-step"
import type { EventKeyMap, HTMLProps, InputProps, LabelProps, OutputProps } from "../utils/types"
import { getElements, getIds, getStyles } from "./slider.dom"
import type { SliderMachineContext, SliderMachineState } from "./slider.machine"

export function sliderConnect(
  state: S.State<SliderMachineContext, SliderMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const ids = getIds(ctx.uid)

  const ariaLabel = ctx["aria-label"]
  const ariaLabelledBy = ctx["aria-labelledby"]
  const ariaValueText = ctx.getAriaValueText?.(ctx.value)

  const isFocused = state.matches("focus")
  const isDragging = state.matches("dragging")

  const styles = getStyles(ctx)

  return {
    // State values
    isFocused,
    isDragging,
    value: ctx.value,
    percent: new NumericRange(ctx).toPercent(),

    // Slider Label properties
    labelProps: normalize<LabelProps>({
      id: ids.label,
      htmlFor: ids.input,
      onClick(event) {
        const { thumb } = getElements(ctx)
        event.preventDefault()
        thumb?.focus()
      },
      style: {
        userSelect: "none",
      },
    }),

    // Slider Output Display properties. Usually formatted using `Intl.NumberFormat`
    outputProps: normalize<OutputProps>({
      id: ids.output,
      htmlFor: ids.input,
      "aria-live": "off",
    }),

    // Slider Thumb properties
    thumbProps: normalize<HTMLProps>({
      id: ids.thumb,
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-focused": dataAttr(isFocused),
      draggable: false,

      // ARIA Attributes for accessibility
      "aria-disabled": ctx.disabled || undefined,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabel ? undefined : ariaLabelledBy ?? ids.label,
      "aria-orientation": ctx.orientation,
      "aria-valuemax": ctx.max,
      "aria-valuemin": ctx.min,
      "aria-valuenow": ctx.value,
      "aria-valuetext": ariaValueText,
      role: "slider",
      tabIndex: ctx.disabled ? -1 : 0,

      // Event listeners
      onBlur() {
        send("BLUR")
      },
      onFocus() {
        send("FOCUS")
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
      style: styles.thumb,
    }),

    // Slider Hidden Input (useful for forms)
    inputProps: normalize<InputProps>({
      type: "hidden",
      value: ctx.value,
      name: ctx.name,
      id: ids.input,
    }),

    // Slider Track Attributes
    trackProps: normalize<HTMLProps>({
      id: ids.track,
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-focused": dataAttr(isFocused),
      style: styles.track,
    }),

    // Slider Range Attributes
    rangeProps: normalize<HTMLProps>({
      id: ids.range,
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-value": ctx.value,
      style: styles.range,
    }),

    // Slider Container or Root Attributes
    rootProps: normalize<HTMLProps>({
      id: ids.root,
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-focused": dataAttr(isFocused),
      "aria-disabled": ctx.disabled || undefined,
      onPointerDown(event) {
        // allow only primary pointer clicks
        if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey) {
          return
        }
        event.preventDefault()
        event.stopPropagation()
        send({
          type: "POINTER_DOWN",
          point: Point.fromPointerEvent(cast(event)),
        })
      },
      style: styles.root,
    }),
  }
}
