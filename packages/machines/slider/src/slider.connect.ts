import { EventKeyMap, getEventKey, getEventStep, getNativeEvent, isLeftClick, isModifiedEvent } from "@zag-js/dom-event"
import { ariaAttr, dataAttr } from "@zag-js/dom-query"
import { getPercentValue, getValuePercent } from "@zag-js/numeric-range"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./slider.anatomy"
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

  function getPercentValueFn(percent: number) {
    return getPercentValue(percent, state.context.min, state.context.max, state.context.step)
  }

  function getValuePercentFn(value: number) {
    return getValuePercent(value, state.context.min, state.context.max)
  }

  // TODO - getMarkerState

  return {
    /**
     * Whether the slider is focused.
     */
    isFocused,
    /**
     * Whether the slider is being dragged.
     */
    isDragging,
    /**
     * The value of the slider.
     */
    value: state.context.value,
    /**
     * The value of the slider as a percent.
     */
    percent: getValuePercent(state.context.value, state.context.min, state.context.max),
    /**
     * Function to set the value of the slider.
     */
    setValue(value: number) {
      send({ type: "SET_VALUE", value })
    },
    /**
     * Returns the value of the slider at the given percent.
     */
    getPercentValue: getPercentValueFn,
    /**
     * Returns the percent of the slider at the given value.
     */
    getValuePercent: getValuePercentFn,
    /**
     * Function to focus the slider.
     */
    focus() {
      dom.getThumbEl(state.context)?.focus()
    },
    /**
     * Function to increment the value of the slider by the step.
     */
    increment() {
      send("INCREMENT")
    },
    /**
     * Function to decrement the value of the slider by the step.
     */
    decrement() {
      send("DECREMENT")
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      "data-disabled": dataAttr(isDisabled),
      "data-focus": dataAttr(isFocused),
      "data-orientation": state.context.orientation,
      "data-invalid": dataAttr(isInvalid),
      id: dom.getRootId(state.context),
      dir: state.context.dir,
      style: dom.getRootStyle(state.context),
    }),

    labelProps: normalize.label({
      ...parts.label.attrs,
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "data-focus": dataAttr(isFocused),
      id: dom.getLabelId(state.context),
      htmlFor: dom.getHiddenInputId(state.context),
      onClick(event) {
        if (!isInteractive) return
        event.preventDefault()
        dom.getThumbEl(state.context)?.focus()
      },
      style: dom.getLabelStyle(),
    }),

    thumbProps: normalize.element({
      ...parts.thumb.attrs,
      id: dom.getThumbId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-orientation": state.context.orientation,
      "data-focus": dataAttr(isFocused),
      draggable: false,
      "aria-invalid": ariaAttr(isInvalid),
      "data-invalid": dataAttr(isInvalid),
      "aria-disabled": ariaAttr(isDisabled),
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

    hiddenInputProps: normalize.input({
      ...parts.hiddenInput.attrs,
      type: "text",
      defaultValue: state.context.value,
      name: state.context.name,
      form: state.context.form,
      id: dom.getHiddenInputId(state.context),
      hidden: true,
    }),

    outputProps: normalize.output({
      ...parts.output.attrs,
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      id: dom.getOutputId(state.context),
      htmlFor: dom.getHiddenInputId(state.context),
      "aria-live": "off",
    }),

    trackProps: normalize.element({
      ...parts.track.attrs,
      id: dom.getTrackId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-focus": dataAttr(isFocused),
      "data-invalid": dataAttr(isInvalid),
      "data-orientation": state.context.orientation,
      style: dom.getTrackStyle(),
    }),

    rangeProps: normalize.element({
      ...parts.range.attrs,
      id: dom.getRangeId(state.context),
      "data-focus": dataAttr(isFocused),
      "data-invalid": dataAttr(isInvalid),
      "data-disabled": dataAttr(isDisabled),
      "data-orientation": state.context.orientation,
      style: dom.getRangeStyle(state.context),
    }),

    controlProps: normalize.element({
      ...parts.control.attrs,
      id: dom.getControlId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "data-orientation": state.context.orientation,
      "data-focus": dataAttr(isFocused),
      onPointerDown(event) {
        if (!isInteractive) return

        const evt = getNativeEvent(event)
        if (!isLeftClick(evt) || isModifiedEvent(evt)) return

        const point = { x: evt.clientX, y: evt.clientY }
        send({ type: "POINTER_DOWN", point })

        event.preventDefault()
        event.stopPropagation()
      },
      style: dom.getControlStyle(),
    }),

    markerGroupProps: normalize.element({
      ...parts.markerGroup.attrs,
      role: "presentation",
      "aria-hidden": true,
      "data-orientation": state.context.orientation,
      style: dom.getMarkerGroupStyle(),
    }),

    getMarkerProps({ value }: { value: number }) {
      const percent = getValuePercentFn(value)
      const style = dom.getMarkerStyle(state.context, percent)
      const markerState =
        value > state.context.value ? "over-value" : value < state.context.value ? "under-value" : "at-value"

      return normalize.element({
        ...parts.marker.attrs,
        id: dom.getMarkerId(state.context, value),
        role: "presentation",
        "data-orientation": state.context.orientation,
        "data-value": value,
        "data-disabled": dataAttr(isDisabled),
        "data-state": markerState,
        style,
      })
    },
  }
}
