import type { StateMachine as S } from "@ui-machines/core"
import { dataAttr, EventKeyMap, getEventKey, getEventStep, getNativeEvent } from "@ui-machines/dom-utils"
import { multiply, percentToValue, valueToPercent } from "@ui-machines/number-utils"
import { getEventPoint } from "@ui-machines/rect-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { isLeftClick, isModifiedEvent } from "@ui-machines/utils"
import { dom } from "./slider.dom"
import type { MachineContext, MachineState } from "./slider.types"

export function connect<T extends PropTypes = ReactPropTypes>(
  state: S.State<MachineContext, MachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const { context: ctx } = state

  const ariaLabel = ctx["aria-label"]
  const ariaLabelledBy = ctx["aria-labelledby"]
  const ariaValueText = ctx.getAriaValueText?.(ctx.value)

  const isFocused = state.matches("focus")
  const isDragging = state.matches("dragging")

  return {
    // state
    isFocused,
    isDragging,
    value: ctx.value,
    percent: valueToPercent(ctx.value, ctx),

    // methods
    setValue(value: number) {
      send({ type: "SET_VALUE", value })
    },
    getPercentValue(percent: number) {
      return percentToValue(percent, ctx)
    },
    blur() {
      if (ctx.disabled) return
      send("BLUR")
    },
    focus() {
      if (ctx.disabled) return
      send("FOCUS")
    },
    increment() {
      send("INCREMENT")
    },
    decrement() {
      send("DECREMENT")
    },

    labelProps: normalize.label<T>({
      "data-part": "label",
      "data-disabled": dataAttr(ctx.disabled),
      id: dom.getLabelId(ctx),
      htmlFor: dom.getInputId(ctx),
      onClick(event) {
        if (!ctx.isInteractive) return
        event.preventDefault()
        dom.getThumbEl(ctx)?.focus()
      },
      style: {
        userSelect: "none",
      },
    }),

    outputProps: normalize.output<T>({
      "data-part": "output",
      "data-disabled": dataAttr(ctx.disabled),
      id: dom.getOutputId(ctx),
      htmlFor: dom.getInputId(ctx),
      "aria-live": "off",
    }),

    thumbProps: normalize.element<T>({
      "data-part": "thumb",
      id: dom.getThumbId(ctx),
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-focus": dataAttr(isFocused),
      draggable: false,
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
      onBlur() {
        if (ctx.disabled) return
        send("BLUR")
      },
      onFocus() {
        if (ctx.disabled) return
        send("FOCUS")
      },
      onKeyDown(event) {
        if (!ctx.isInteractive) return
        const step = multiply(getEventStep(event), ctx.step)
        let prevent = true
        const keyMap: EventKeyMap = {
          ArrowUp() {
            send({ type: "ARROW_UP", step })
            prevent = ctx.isVertical
          },
          ArrowDown() {
            send({ type: "ARROW_DOWN", step })
            prevent = ctx.isVertical
          },
          ArrowLeft() {
            send({ type: "ARROW_LEFT", step })
            prevent = ctx.isHorizontal
          },
          ArrowRight() {
            send({ type: "ARROW_RIGHT", step })
            prevent = ctx.isHorizontal
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

        if (!exec) return
        exec(event)

        if (prevent) {
          event.preventDefault()
          event.stopPropagation()
        }
      },
      style: dom.getThumbStyle(ctx),
    }),

    // Slider Hidden Input (useful for forms)
    inputProps: normalize.input<T>({
      "data-part": "input",
      type: "hidden",
      value: ctx.value,
      name: ctx.name,
      id: dom.getInputId(ctx),
    }),

    // Slider Track Attributes
    trackProps: normalize.element<T>({
      "data-part": "track",
      id: dom.getTrackId(ctx),
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-focus": dataAttr(isFocused),
      style: dom.getTrackStyle(),
    }),

    // Slider Range Attributes
    rangeProps: normalize.element<T>({
      "data-part": "range",
      id: dom.getRangeId(ctx),
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      style: dom.getRangeStyle(ctx),
    }),

    // Slider Container or Root Attributes
    rootProps: normalize.element<T>({
      "data-part": "root",
      id: dom.getRootId(ctx),
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-focus": dataAttr(isFocused),
      "aria-disabled": ctx.disabled || undefined,
      onPointerDown(event) {
        if (!ctx.isInteractive) return

        const evt = getNativeEvent(event)
        if (!isLeftClick(evt) || isModifiedEvent(evt)) return

        const point = getEventPoint(evt)
        send({ type: "POINTER_DOWN", point })

        event.preventDefault()
        event.stopPropagation()
      },
      style: dom.getRootStyle(ctx),
    }),

    getMarkerProps({ value }: { value: number }) {
      const percent = valueToPercent(value, ctx)
      const style = dom.getMarkerStyle(ctx, percent)
      const state = value > ctx.value ? "over-value" : value < ctx.value ? "under-value" : "at-value"

      return normalize.element<T>({
        "data-part": "marker",
        id: dom.getMarkerId(ctx, value),
        role: "presentation",
        "data-value": value,
        "aria-hidden": true,
        "data-disabled": dataAttr(ctx.disabled),
        "data-state": state,
        style,
      })
    },
  }
}
