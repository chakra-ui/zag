import type { StateMachine as S } from "@ui-machines/core"
import { cast } from "tiny-fn"
import { isLeftClick, isModifiedEvent } from "tiny-guard"
import { valueToPercent } from "tiny-num"
import { fromPointerEvent } from "tiny-point/dom"
import type { DOM, Props } from "../utils"
import { dataAttr, defaultPropNormalizer, getEventKey, getEventStep } from "../utils"
import { dom } from "./slider.dom"
import type { SliderMachineContext, SliderMachineState } from "./slider.machine"

export function sliderConnect(
  state: S.State<SliderMachineContext, SliderMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state

  const ariaLabel = ctx["aria-label"]
  const ariaLabelledBy = ctx["aria-labelledby"]
  const ariaValueText = ctx.getAriaValueText?.(ctx.value)

  const isFocused = state.matches("focus")
  const isDragging = state.matches("dragging")

  return {
    // State values
    isFocused,
    isDragging,
    value: ctx.value,
    percent: valueToPercent(ctx.value, ctx),

    // Slider Label properties
    labelProps: normalize<Props.Label>({
      id: dom.getLabelId(ctx),
      htmlFor: dom.getInputId(ctx),
      onClick(event) {
        event.preventDefault()
        dom.getThumbEl(ctx)?.focus()
      },
      style: {
        userSelect: "none",
      },
    }),

    // Slider Output Display properties. Usually formatted using `Intl.NumberFormat`
    outputProps: normalize<Props.Output>({
      id: dom.getOutputId(ctx),
      htmlFor: dom.getInputId(ctx),
      "aria-live": "off",
    }),

    // Slider Thumb properties
    thumbProps: normalize<Props.Element>({
      id: dom.getThumbId(ctx),
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-focused": dataAttr(isFocused),
      draggable: false,

      // ARIA Attributes for accessibility
      "aria-disabled": ctx.disabled || undefined,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabel ? undefined : ariaLabelledBy ?? dom.getLabelId(ctx),
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
        const keyMap: DOM.EventKeyMap = {
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
      style: dom.getThumbStyle(ctx),
    }),

    // Slider Hidden Input (useful for forms)
    inputProps: normalize<Props.Input>({
      type: "hidden",
      value: ctx.value,
      name: ctx.name,
      id: dom.getInputId(ctx),
    }),

    // Slider Track Attributes
    trackProps: normalize<Props.Element>({
      id: dom.getTrackId(ctx),
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-focused": dataAttr(isFocused),
      style: dom.getTrackStyle(),
    }),

    // Slider Range Attributes
    rangeProps: normalize<Props.Element>({
      id: dom.getRangeId(ctx),
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-value": ctx.value,
      style: dom.getRangeStyle(ctx),
    }),

    // Slider Container or Root Attributes
    rootProps: normalize<Props.Element>({
      id: dom.getRootId(ctx),
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-focused": dataAttr(isFocused),
      "aria-disabled": ctx.disabled || undefined,
      onPointerDown(event) {
        // allow only primary pointer clicks
        if (!isLeftClick(cast(event)) || isModifiedEvent(cast(event))) return
        event.preventDefault()
        event.stopPropagation()
        send({
          type: "POINTER_DOWN",
          point: fromPointerEvent(cast(event)),
        })
      },
      style: dom.getRootStyle(ctx),
    }),
  }
}
