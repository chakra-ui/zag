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
  const ariaLabel = state.context["aria-label"]
  const ariaLabelledBy = state.context["aria-labelledby"]
  const ariaValueText = state.context.getAriaValueText?.(state.context.value)

  const isFocused = state.matches("focus")
  const isDragging = state.matches("dragging")
  const isDisabled = state.context.disabled

  return {
    isFocused,
    isDragging,
    value: state.context.value,
    percent: valueToPercent(state.context.value, state.context),

    setValue(value: number) {
      send({ type: "SET_VALUE", value })
    },
    getPercentValue(percent: number) {
      return percentToValue(percent, state.context)
    },
    blur() {
      if (isDisabled) return
      send("BLUR")
    },
    focus() {
      if (isDisabled) return
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
      "data-disabled": dataAttr(isDisabled),
      id: dom.getLabelId(state.context),
      htmlFor: dom.getInputId(state.context),
      onClick(event) {
        if (!state.context.isInteractive) return
        event.preventDefault()
        dom.getThumbEl(state.context)?.focus()
      },
      style: {
        userSelect: "none",
      },
    }),

    outputProps: normalize.output<T>({
      "data-part": "output",
      "data-disabled": dataAttr(isDisabled),
      id: dom.getOutputId(state.context),
      htmlFor: dom.getInputId(state.context),
      "aria-live": "off",
    }),

    thumbProps: normalize.element<T>({
      "data-part": "thumb",
      id: dom.getThumbId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-orientation": state.context.orientation,
      "data-focus": dataAttr(isFocused),
      draggable: false,
      "aria-disabled": isDisabled || undefined,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabel ? undefined : ariaLabelledBy ?? dom.getLabelId(state.context),
      "aria-orientation": state.context.orientation,
      "aria-valuemax": state.context.max,
      "aria-valuemin": state.context.min,
      "aria-valuenow": state.context.value,
      "aria-valuetext": ariaValueText,
      role: "slider",
      tabIndex: state.context.isInteractive ? 0 : undefined,
      onBlur() {
        if (isDisabled) return
        send("BLUR")
      },
      onFocus() {
        if (isDisabled) return
        send("FOCUS")
      },
      onKeyDown(event) {
        if (!state.context.isInteractive) return
        const step = multiply(getEventStep(event), state.context.step)
        let prevent = true
        const keyMap: EventKeyMap = {
          ArrowUp() {
            send({ type: "ARROW_UP", step })
            prevent = state.context.isVertical
          },
          ArrowDown() {
            send({ type: "ARROW_DOWN", step })
            prevent = state.context.isVertical
          },
          ArrowLeft() {
            send({ type: "ARROW_LEFT", step })
            prevent = state.context.isHorizontal
          },
          ArrowRight() {
            send({ type: "ARROW_RIGHT", step })
            prevent = state.context.isHorizontal
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

        const key = getEventKey(event, state.context)
        const exec = keyMap[key]

        if (!exec) return
        exec(event)

        if (prevent) {
          event.preventDefault()
          event.stopPropagation()
        }
      },
      style: dom.getThumbStyle(state.context),
    }),

    inputProps: normalize.input<T>({
      "data-part": "input",
      type: "hidden",
      value: state.context.value,
      name: state.context.name,
      id: dom.getInputId(state.context),
    }),

    trackProps: normalize.element<T>({
      "data-part": "track",
      id: dom.getTrackId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-orientation": state.context.orientation,
      "data-focus": dataAttr(isFocused),
      style: dom.getTrackStyle(),
    }),

    rangeProps: normalize.element<T>({
      "data-part": "range",
      id: dom.getRangeId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-orientation": state.context.orientation,
      style: dom.getRangeStyle(state.context),
    }),

    rootProps: normalize.element<T>({
      "data-part": "root",
      id: dom.getRootId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-orientation": state.context.orientation,
      "data-focus": dataAttr(isFocused),
      "aria-disabled": isDisabled || undefined,
      onPointerDown(event) {
        if (!state.context.isInteractive) return

        const evt = getNativeEvent(event)
        if (!isLeftClick(evt) || isModifiedEvent(evt)) return

        const point = getEventPoint(evt)
        send({ type: "POINTER_DOWN", point })

        event.preventDefault()
        event.stopPropagation()
      },
      style: dom.getRootStyle(state.context),
    }),

    getMarkerProps({ value }: { value: number }) {
      const percent = valueToPercent(value, state.context)
      const style = dom.getMarkerStyle(state.context, percent)
      const markerState =
        value > state.context.value ? "over-value" : value < state.context.value ? "under-value" : "at-value"

      return normalize.element<T>({
        "data-part": "marker",
        id: dom.getMarkerId(state.context, value),
        role: "presentation",
        "data-value": value,
        "aria-hidden": true,
        "data-disabled": dataAttr(isDisabled),
        "data-state": markerState,
        style,
      })
    },
  }
}
