import {
  getEventKey,
  getEventPoint,
  getEventStep,
  getNativeEvent,
  isLeftClick,
  isModifiedEvent,
  type EventKeyMap,
} from "@zag-js/dom-event"
import { ariaAttr, dataAttr } from "@zag-js/dom-query"
import { getPercentValue, getValuePercent } from "@zag-js/numeric-range"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./range-slider.anatomy"
import { dom } from "./range-slider.dom"
import type { MachineApi, Send, State } from "./range-slider.types"
import { getRangeAtIndex } from "./range-slider.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const ariaLabel = state.context["aria-label"]
  const ariaLabelledBy = state.context["aria-labelledby"]
  const sliderValue = state.context.value

  const isFocused = state.matches("focus")
  const isDragging = state.matches("dragging")

  const isDisabled = state.context.isDisabled
  const isInvalid = state.context.invalid
  const isInteractive = state.context.isInteractive

  function getValuePercentFn(value: number) {
    return getValuePercent(value, state.context.min, state.context.max)
  }

  function getPercentValueFn(percent: number) {
    return getPercentValue(percent, state.context.min, state.context.max, state.context.step)
  }

  return {
    value: state.context.value,
    isDragging,
    isFocused,

    setValue(value: number[]) {
      send({ type: "SET_VALUE", value: value })
    },

    getThumbValue(index: number) {
      return sliderValue[index]
    },

    setThumbValue(index: number, value: number) {
      send({ type: "SET_VALUE", index, value })
    },

    getValuePercent: getValuePercentFn,

    getPercentValue: getPercentValueFn,

    getThumbPercent(index: number) {
      return getValuePercentFn(sliderValue[index])
    },

    setThumbPercent(index: number, percent: number) {
      const value = getPercentValueFn(percent)
      send({ type: "SET_VALUE", index, value })
    },

    getThumbMin(index: number) {
      return getRangeAtIndex(state.context, index).min
    },

    getThumbMax(index: number) {
      return getRangeAtIndex(state.context, index).max
    },

    increment(index: number) {
      send({ type: "INCREMENT", index })
    },

    decrement(index: number) {
      send({ type: "DECREMENT", index })
    },

    focus() {
      if (!isInteractive) return
      send({ type: "FOCUS", index: 0 })
    },

    labelProps: normalize.label({
      ...parts.label.attrs,
      "data-disabled": dataAttr(isDisabled),
      "data-orientation": state.context.orientation,
      "data-invalid": dataAttr(isInvalid),
      "data-focus": dataAttr(isFocused),
      id: dom.getLabelId(state.context),
      htmlFor: dom.getHiddenInputId(state.context, 0),
      onClick(event) {
        if (!isInteractive) return
        event.preventDefault()
        dom.getFirstEl(state.context)?.focus()
      },
      style: {
        userSelect: "none",
      },
    }),

    rootProps: normalize.element({
      ...parts.root.attrs,
      "data-disabled": dataAttr(isDisabled),
      "data-orientation": state.context.orientation,
      "data-invalid": dataAttr(isInvalid),
      "data-focus": dataAttr(isFocused),
      id: dom.getRootId(state.context),
      dir: state.context.dir,
      style: dom.getRootStyle(state.context),
    }),

    outputProps: normalize.output({
      ...parts.output.attrs,
      "data-disabled": dataAttr(isDisabled),
      "data-orientation": state.context.orientation,
      "data-invalid": dataAttr(isInvalid),
      "data-focus": dataAttr(isFocused),
      id: dom.getOutputId(state.context),
      htmlFor: sliderValue.map((_v, i) => dom.getHiddenInputId(state.context, i)).join(" "),
      "aria-live": "off",
    }),

    trackProps: normalize.element({
      ...parts.track.attrs,
      id: dom.getTrackId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "data-orientation": state.context.orientation,
      "data-focus": dataAttr(isFocused),
      style: { position: "relative" },
    }),

    getThumbProps(index: number) {
      const value = sliderValue[index]
      const range = getRangeAtIndex(state.context, index)
      const ariaValueText = state.context.getAriaValueText?.(value, index)
      const _ariaLabel = Array.isArray(ariaLabel) ? ariaLabel[index] : ariaLabel
      const _ariaLabelledBy = Array.isArray(ariaLabelledBy) ? ariaLabelledBy[index] : ariaLabelledBy

      return normalize.element({
        ...parts.thumb.attrs,
        "data-index": index,
        id: dom.getThumbId(state.context, index),
        "data-disabled": dataAttr(isDisabled),
        "data-orientation": state.context.orientation,
        "data-focus": dataAttr(isFocused && state.context.focusedIndex === index),
        draggable: false,
        "aria-disabled": ariaAttr(isDisabled),
        "aria-label": _ariaLabel,
        "aria-labelledby": _ariaLabelledBy ?? dom.getLabelId(state.context),
        "aria-orientation": state.context.orientation,
        "aria-valuemax": range.max,
        "aria-valuemin": range.min,
        "aria-valuenow": sliderValue[index],
        "aria-valuetext": ariaValueText,
        role: "slider",
        tabIndex: isDisabled ? undefined : 0,
        style: dom.getThumbStyle(state.context, index),
        onPointerDown(event) {
          send({ type: "THUMB_POINTER_DOWN", index })
          event.stopPropagation()
        },
        onBlur() {
          if (!isInteractive) return
          send("BLUR")
        },
        onFocus() {
          if (!isInteractive) return
          send({ type: "FOCUS", index })
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
            event.stopPropagation()
          }
        },
      })
    },

    getHiddenInputProps(index: number) {
      return normalize.input({
        name: `${state.context.name}[${index}]`,
        form: state.context.form,
        type: "text",
        hidden: true,
        defaultValue: state.context.value[index],
        id: dom.getHiddenInputId(state.context, index),
      })
    },

    rangeProps: normalize.element({
      id: dom.getRangeId(state.context),
      ...parts.range.attrs,
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
      "data-orientation": state.context.orientation,
      "data-invalid": dataAttr(isInvalid),
      "data-focus": dataAttr(isFocused),
      style: dom.getControlStyle(),
      onPointerDown(event) {
        if (!isInteractive) return

        const evt = getNativeEvent(event)
        if (!isLeftClick(evt) || isModifiedEvent(evt)) return

        const point = getEventPoint(evt)
        send({ type: "POINTER_DOWN", point })

        event.preventDefault()
        event.stopPropagation()
      },
    }),

    markerGroupProps: normalize.element({
      ...parts.markerGroup.attrs,
      role: "presentation",
      "aria-hidden": true,
      "data-orientation": state.context.orientation,
      style: dom.getMarkerGroupStyle(),
    }),

    getMarkerProps({ value }: { value: number }) {
      const style = dom.getMarkerStyle(state.context, value)
      let markerState: "over-value" | "under-value" | "at-value"

      const first = state.context.value[0]
      const last = state.context.value[state.context.value.length - 1]

      if (value < first) {
        markerState = "under-value"
      } else if (value > last) {
        markerState = "over-value"
      } else {
        markerState = "at-value"
      }

      return normalize.element({
        ...parts.marker.attrs,
        id: dom.getMarkerId(state.context, value),
        role: "presentation",
        dir: state.context.dir,
        "data-orientation": state.context.orientation,
        "data-value": value,
        "data-disabled": dataAttr(isDisabled),
        "data-state": markerState,
        style,
      })
    },
  }
}
