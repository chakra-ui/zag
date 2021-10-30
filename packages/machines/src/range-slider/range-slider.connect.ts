import { cast } from "tiny-fn"
import { isLeftClick, isModifiedEvent } from "tiny-guard"
import { toRanges } from "tiny-num"
import { fromPointerEvent } from "tiny-point/dom"
import type { DOM, Props } from "../utils"
import { dataAttr, defaultPropNormalizer, getEventKey, getEventStep } from "../utils"
import { dom } from "./range-slider.dom"
import { RangeSliderSend, RangeSliderState } from "./range-slider.types"

export function rangeSliderConnect(state: RangeSliderState, send: RangeSliderSend, normalize = defaultPropNormalizer) {
  const { context: ctx } = state
  const { value: values, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy } = ctx

  const isFocused = state.matches("focus")
  const isDragging = state.matches("dragging")

  return {
    values: ctx.value,
    isDragging,
    isFocused,

    labelProps: normalize<Props.Label>({
      id: dom.getLabelId(ctx),
      htmlFor: dom.getInputId(ctx, 0),
      onClick(event) {
        event.preventDefault()
        dom.getFirstEl(ctx)?.focus()
      },
      style: {
        userSelect: "none",
      },
    }),

    // Slider Output Display properties. Usually formatted using `Intl.NumberFormat`
    outputProps: normalize<Props.Output>({
      id: dom.getOutputId(ctx),
      htmlFor: values.map((v, i) => dom.getInputId(ctx, i)).join(" "),
      "aria-live": "off",
    }),

    trackProps: normalize<Props.Element>({
      id: dom.getTrackId(ctx),
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-focused": dataAttr(isFocused),
      style: dom.getTrackStyle(),
    }),

    getThumbProps(index: number) {
      const value = values[index]
      const range = toRanges(ctx)[index]
      const ariaValueText = ctx.getAriaValueText?.(value, index)
      const _ariaLabel = Array.isArray(ariaLabel) ? ariaLabel[index] : ariaLabel
      const _ariaLabelledBy = Array.isArray(ariaLabelledBy) ? ariaLabelledBy[index] : ariaLabelledBy

      return normalize<Props.Element>({
        id: dom.getThumbId(ctx, index),
        "data-disabled": dataAttr(ctx.disabled),
        "data-orientation": ctx.orientation,
        "data-focused": dataAttr(isFocused),
        draggable: false,
        "aria-disabled": ctx.disabled || undefined,
        "aria-label": _ariaLabel,
        "aria-labelledby": _ariaLabelledBy ?? dom.getLabelId(ctx),
        "aria-orientation": ctx.orientation,
        "aria-valuemax": range.max,
        "aria-valuemin": range.min,
        "aria-valuenow": values[index],
        "aria-valuetext": ariaValueText,
        role: "slider",
        tabIndex: ctx.disabled ? -1 : 0,
        style: dom.getThumbStyle(ctx, index),
        onBlur() {
          send("BLUR")
        },
        onFocus() {
          send({ type: "FOCUS", index })
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
      })
    },

    getInputProps(index: number) {
      return normalize<Props.Input>({
        name: ctx.name?.[index],
        type: "hidden",
        value: ctx.value[index],
        id: dom.getInputId(ctx, index),
      })
    },

    rangeProps: normalize<Props.Element>({
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-state": state,
      style: dom.getRangeStyle(ctx),
    }),

    rootProps: normalize<Props.Element>({
      id: dom.getRootId(ctx),
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-focused": dataAttr(isFocused),
      style: dom.getRootStyle(ctx),
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
    }),
  }
}
