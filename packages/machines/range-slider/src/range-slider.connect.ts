import { dataAttr, EventKeyMap, getEventKey, getEventStep, getNativeEvent } from "@ui-machines/dom-utils"
import { multiply, percentToValue, toRanges, valueToPercent } from "@ui-machines/number-utils"
import { getEventPoint } from "@ui-machines/rect-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { isLeftClick, isModifiedEvent } from "@ui-machines/utils"
import { dom, getRangeAtIndex } from "./range-slider.dom"
import { Send, State } from "./range-slider.types"

export function connect<T extends PropTypes = ReactPropTypes>(state: State, send: Send, normalize = normalizeProp) {
  const ariaLabel = state.context["aria-label"]
  const ariaLabelledBy = state.context["aria-labelledby"]
  const values = state.context.value

  const isFocused = state.matches("focus")
  const isDragging = state.matches("dragging")

  return {
    // state
    values: state.context.value,
    isDragging,
    isFocused,

    // methods
    setValue(values: number[]) {
      send({ type: "SET_VALUE", value: values })
    },
    getThumbValue(index: number) {
      return values[index]
    },
    setThumbValue(index: number, value: number) {
      send({ type: "SET_VALUE", index, value })
    },
    getThumbPercent(index: number) {
      return valueToPercent(values[index], state.context)
    },
    setThumbPercent(index: number, percent: number) {
      const value = percentToValue(percent, state.context)
      send({ type: "SET_VALUE", index, value })
    },
    getPercentValue(percent: number) {
      return percentToValue(percent, state.context)
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
    focus(index = 0) {
      if (state.context.disabled) return
      send({ type: "FOCUS", index })
    },
    blur() {
      if (state.context.disabled) return
      send({ type: "BLUR" })
    },

    // dom attributes
    labelProps: normalize.label<T>({
      "data-part": "label",
      id: dom.getLabelId(state.context),
      htmlFor: dom.getInputId(state.context, 0),
      onClick(event) {
        if (!state.context.isInteractive) return
        event.preventDefault()
        dom.getFirstEl(state.context)?.focus()
      },
      style: {
        userSelect: "none",
      },
    }),

    outputProps: normalize.output<T>({
      "data-part": "output",
      id: dom.getOutputId(state.context),
      htmlFor: values.map((v, i) => dom.getInputId(state.context, i)).join(" "),
      "aria-live": "off",
    }),

    trackProps: normalize.element<T>({
      "data-part": "track",
      id: dom.getTrackId(state.context),
      "data-disabled": dataAttr(state.context.disabled),
      "data-orientation": state.context.orientation,
      "data-focus": dataAttr(isFocused),
      style: dom.getTrackStyle(),
    }),

    getThumbProps(index: number) {
      const value = values[index]
      const spacing = multiply(state.context.minStepsBetweenThumbs, state.context.step)
      const range = toRanges({ ...state.context, spacing })[index]

      const ariaValueText = state.context.getAriaValueText?.(value, index)
      const _ariaLabel = Array.isArray(ariaLabel) ? ariaLabel[index] : ariaLabel
      const _ariaLabelledBy = Array.isArray(ariaLabelledBy) ? ariaLabelledBy[index] : ariaLabelledBy

      return normalize.element<T>({
        "data-part": "thumb",
        "data-index": index,
        id: dom.getThumbId(state.context, index),
        "data-disabled": dataAttr(state.context.disabled),
        "data-orientation": state.context.orientation,
        "data-focus": dataAttr(isFocused),
        draggable: false,
        "aria-disabled": state.context.disabled || undefined,
        "aria-label": _ariaLabel,
        "aria-labelledby": _ariaLabelledBy ?? dom.getLabelId(state.context),
        "aria-orientation": state.context.orientation,
        "aria-valuemax": range.max,
        "aria-valuemin": range.min,
        "aria-valuenow": values[index],
        "aria-valuetext": ariaValueText,
        role: "slider",
        tabIndex: state.context.disabled ? -1 : 0,
        style: dom.getThumbStyle(state.context, index),
        onBlur() {
          if (state.context.disabled) return
          send("BLUR")
        },
        onFocus() {
          if (state.context.disabled) return
          send({ type: "FOCUS", index })
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
      })
    },

    getInputProps(index: number) {
      return normalize.input<T>({
        "data-part": "input",
        name: state.context.name?.[index],
        type: "hidden",
        value: state.context.value[index],
        id: dom.getInputId(state.context, index),
      })
    },

    rangeProps: normalize.element<T>({
      id: dom.getRangeId(state.context),
      "data-part": "range",
      "data-disabled": dataAttr(state.context.disabled),
      "data-orientation": state.context.orientation,
      style: dom.getRangeStyle(state.context),
    }),

    rootProps: normalize.element<T>({
      "data-part": "root",
      id: dom.getRootId(state.context),
      "data-disabled": dataAttr(state.context.disabled),
      "data-orientation": state.context.orientation,
      "data-focus": dataAttr(isFocused),
      style: dom.getRootStyle(state.context),
      onPointerDown(event) {
        if (!state.context.isInteractive) return

        const evt = getNativeEvent(event)
        if (!isLeftClick(evt) || isModifiedEvent(evt)) return

        send({ type: "POINTER_DOWN", point: getEventPoint(evt) })

        event.preventDefault()
        event.stopPropagation()
      },
    }),

    getMarkerProps({ value }: { value: number }) {
      const percent = valueToPercent(value, state.context)
      const style = dom.getMarkerStyle(state.context, percent)
      let markerState: "over-value" | "under-value" | "at-value"

      if (Math.max(...state.context.value) < value) {
        markerState = "over-value"
      } else if (Math.min(...state.context.value) > value) {
        markerState = "under-value"
      } else {
        markerState = "at-value"
      }

      return normalize.element<T>({
        "data-part": "marker",
        id: dom.getMarkerId(state.context, value),
        role: "presentation",
        "data-value": value,
        "aria-hidden": true,
        "data-disabled": dataAttr(state.context.disabled),
        "data-state": markerState,
        style,
      })
    },
  }
}
