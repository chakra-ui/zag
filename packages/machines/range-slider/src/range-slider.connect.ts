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
import { percentToValue, toRanges, valueToPercent } from "@zag-js/number-utils"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { dom } from "./range-slider.dom"
import type { Send, State } from "./range-slider.types"
import { utils } from "./range-slider.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const ariaLabel = state.context["aria-label"]
  const ariaLabelledBy = state.context["aria-labelledby"]
  const sliderValue = state.context.value

  const isFocused = state.matches("focus")
  const isDragging = state.matches("dragging")
  const isDisabled = state.context.disabled
  const isInvalid = state.context.invalid

  const isInteractive = state.context.isInteractive

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
    getThumbPercent(index: number) {
      return valueToPercent(sliderValue[index], state.context)
    },
    setThumbPercent(index: number, percent: number) {
      const value = percentToValue(percent, state.context)
      send({ type: "SET_VALUE", index, value })
    },
    getPercentValue(percent: number) {
      return percentToValue(percent, state.context)
    },
    getThumbMin(index: number) {
      return utils.getRangeAtIndex(state.context, index).min
    },
    getThumbMax(index: number) {
      return utils.getRangeAtIndex(state.context, index).max
    },
    increment(index: number) {
      send({ type: "INCREMENT", index })
    },
    decrement(index: number) {
      send({ type: "DECREMENT", index })
    },
    focus(index = 0) {
      if (!isInteractive) return
      send({ type: "FOCUS", index })
    },

    labelProps: normalize.label({
      "data-part": "label",
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "data-focus": dataAttr(isFocused),
      id: dom.getLabelId(state.context),
      htmlFor: dom.getInputId(state.context, 0),
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
      "data-part": "root",
      "data-disabled": dataAttr(isDisabled),
      "data-orientation": state.context.orientation,
      "data-invalid": dataAttr(isInvalid),
      id: dom.getRootId(state.context),
      dir: state.context.dir,
      style: dom.getRootStyle(state.context),
    }),

    outputProps: normalize.output({
      "data-part": "output",
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      id: dom.getOutputId(state.context),
      htmlFor: sliderValue.map((_v, i) => dom.getInputId(state.context, i)).join(" "),
      "aria-live": "off",
    }),

    trackProps: normalize.element({
      "data-part": "track",
      id: dom.getTrackId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "data-orientation": state.context.orientation,
      "data-focus": dataAttr(isFocused),
      style: { position: "relative" },
    }),

    getThumbProps(index: number) {
      const value = sliderValue[index]
      const range = toRanges(state.context)[index]
      const ariaValueText = state.context.getAriaValueText?.(value, index)
      const _ariaLabel = Array.isArray(ariaLabel) ? ariaLabel[index] : ariaLabel
      const _ariaLabelledBy = Array.isArray(ariaLabelledBy) ? ariaLabelledBy[index] : ariaLabelledBy

      return normalize.element({
        "data-part": "thumb",
        "data-index": index,
        id: dom.getThumbId(state.context, index),
        "data-disabled": dataAttr(isDisabled),
        "data-orientation": state.context.orientation,
        "data-focus": dataAttr(isFocused && state.context.activeIndex === index),
        draggable: false,
        "aria-disabled": isDisabled || undefined,
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

    getInputProps(index: number) {
      return normalize.input({
        "data-part": "input",
        name: `${state.context.name}[${index}]`,
        form: state.context.form,
        type: "text",
        hidden: true,
        defaultValue: state.context.value[index],
        id: dom.getInputId(state.context, index),
      })
    },

    rangeProps: normalize.element({
      id: dom.getRangeId(state.context),
      "data-part": "range",
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
      "data-orientation": state.context.orientation,
      "data-invalid": dataAttr(isInvalid),
      "data-focus": dataAttr(isFocused),
      style: dom.getControlStyle(),
      onPointerDown(event) {
        if (!isInteractive) return

        const evt = getNativeEvent(event)
        if (!isLeftClick(evt) || isModifiedEvent(evt)) return

        send({ type: "POINTER_DOWN", point: getEventPoint(evt) })

        event.preventDefault()
        event.stopPropagation()
      },
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
      let markerState: "over-value" | "under-value" | "at-value"

      if (Math.max(...state.context.value) < value) {
        markerState = "over-value"
      } else if (Math.min(...state.context.value) > value) {
        markerState = "under-value"
      } else {
        markerState = "at-value"
      }

      return normalize.element({
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
