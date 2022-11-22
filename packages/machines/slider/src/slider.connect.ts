import {
  dataAttr,
  EventKeyMap,
  getEventKey,
  getEventStep,
  getNativeEvent,
  getEventPoint,
  isLeftClick,
  isModifiedEvent,
} from "@zag-js/dom-utils"
import { percentToValue, valueToPercent } from "@zag-js/number-utils"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { dom } from "./slider.dom"
import type { Send, State } from "./slider.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const ariaLabel = state.context["aria-label"]
  const ariaLabelledBy = state.context["aria-labelledby"]
  const ariaValueText = state.context.getAriaValueText?.(state.context.value)

  const isFocused = state.matches("focus")
  const isDragging = state.matches("dragging")
  const isDisabled = state.context.disabled
  const isInteractive = state.context.isInteractive
  const isInvalid = state.context.invalid

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
    focus() {
      dom.getThumbEl(state.context)?.focus()
    },
    increment() {
      send("INCREMENT")
    },
    decrement() {
      send("DECREMENT")
    },

    rootProps: normalize.element({
      "data-part": "root",
      "data-disabled": dataAttr(isDisabled),
      "data-focus": dataAttr(isFocused),
      "data-orientation": state.context.orientation,
      "data-invalid": dataAttr(isInvalid),
      id: dom.getRootId(state.context),
      dir: state.context.dir,
      style: dom.getRootStyle(state.context),
    }),

    labelProps: normalize.label({
      "data-part": "label",
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "data-focus": dataAttr(isFocused),
      id: dom.getLabelId(state.context),
      htmlFor: dom.getInputId(state.context),
      onClick(event) {
        if (!isInteractive) return
        event.preventDefault()
        dom.getThumbEl(state.context)?.focus()
      },
      style: dom.getLabelStyle(),
    }),

    thumbProps: normalize.element({
      "data-part": "thumb",
      id: dom.getThumbId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-orientation": state.context.orientation,
      "data-focus": dataAttr(isFocused),
      draggable: false,
      "aria-invalid": isInvalid || undefined,
      "data-invalid": dataAttr(isInvalid),
      "aria-disabled": isDisabled || undefined,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabel ? undefined : ariaLabelledBy ?? dom.getLabelId(state.context),
      "aria-orientation": state.context.orientation,
      "aria-valuemax": state.context.max,
      "aria-valuemin": state.context.min,
      "aria-valuenow": state.context.value,
      "aria-valuetext": ariaValueText,
      role: "slider",
      tabIndex: isDisabled ? undefined : 0,
      onBlur() {
        if (!isInteractive) return
        send("BLUR")
      },
      onFocus() {
        if (!isInteractive) return
        send("FOCUS")
      },
      onKeyDown(event) {
        if (!isInteractive) return
        const step = getEventStep(event) * state.context.step
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
        }
      },
      style: dom.getThumbStyle(state.context),
    }),

    inputProps: normalize.input({
      "data-part": "input",
      type: "text",
      defaultValue: state.context.value,
      name: state.context.name,
      form: state.context.form,
      id: dom.getInputId(state.context),
      hidden: true,
    }),

    outputProps: normalize.output({
      "data-part": "output",
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      id: dom.getOutputId(state.context),
      htmlFor: dom.getInputId(state.context),
      "aria-live": "off",
    }),

    trackProps: normalize.element({
      "data-part": "track",
      id: dom.getTrackId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-focus": dataAttr(isFocused),
      "data-invalid": dataAttr(isInvalid),
      "data-orientation": state.context.orientation,
      style: dom.getTrackStyle(),
    }),

    rangeProps: normalize.element({
      "data-part": "range",
      id: dom.getRangeId(state.context),
      "data-focus": dataAttr(isFocused),
      "data-invalid": dataAttr(isInvalid),
      "data-disabled": dataAttr(isDisabled),
      "data-orientation": state.context.orientation,
      style: dom.getRangeStyle(state.context),
    }),

    controlProps: normalize.element({
      "data-part": "control",
      id: dom.getControlId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "data-orientation": state.context.orientation,
      "data-focus": dataAttr(isFocused),
      onPointerDown(event) {
        if (!isInteractive) return

        const evt = getNativeEvent(event)
        if (!isLeftClick(evt) || isModifiedEvent(evt)) return

        const point = getEventPoint(evt)
        send({ type: "POINTER_DOWN", point })

        event.preventDefault()
        event.stopPropagation()
      },
      style: dom.getControlStyle(),
    }),

    markerGroupProps: normalize.element({
      "data-part": "marker-group",
      role: "presentation",
      "aria-hidden": true,
      "data-orientation": state.context.orientation,
      style: dom.getMarkerGroupStyle(),
    }),

    getMarkerProps({ value }: { value: number }) {
      const percent = valueToPercent(value, state.context)
      const style = dom.getMarkerStyle(state.context, percent)
      const markerState =
        value > state.context.value ? "over-value" : value < state.context.value ? "under-value" : "at-value"

      return normalize.element({
        "data-part": "marker",
        role: "presentation",
        "data-orientation": state.context.orientation,
        id: dom.getMarkerId(state.context, value),
        "data-value": value,
        "data-disabled": dataAttr(isDisabled),
        "data-state": markerState,
        style,
      })
    },
  }
}
