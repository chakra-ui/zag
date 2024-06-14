import {
  getEventKey,
  getEventPoint,
  getEventStep,
  isLeftClick,
  isModifierKey,
  type EventKeyMap,
} from "@zag-js/dom-event"
import { ariaAttr, dataAttr } from "@zag-js/dom-query"
import { getPercentValue, getValuePercent } from "@zag-js/numeric-range"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./slider.anatomy"
import { dom } from "./slider.dom"
import type { MachineApi, Send, State } from "./slider.types"
import { getRangeAtIndex } from "./slider.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const ariaLabel = state.context["aria-label"]
  const ariaLabelledBy = state.context["aria-labelledby"]
  const sliderValue = state.context.value

  const focused = state.matches("focus")
  const dragging = state.matches("dragging")

  const disabled = state.context.isDisabled
  const invalid = state.context.invalid
  const interactive = state.context.isInteractive

  const isHorizontal = state.context.orientation === "horizontal"
  const isVertical = state.context.orientation === "vertical"

  function getValuePercentFn(value: number) {
    return getValuePercent(value, state.context.min, state.context.max)
  }

  function getPercentValueFn(percent: number) {
    return getPercentValue(percent, state.context.min, state.context.max, state.context.step)
  }

  return {
    value: state.context.value,
    dragging,
    focused,
    setValue(value) {
      send({ type: "SET_VALUE", value: value })
    },
    getThumbValue(index) {
      return sliderValue[index]
    },
    setThumbValue(index, value) {
      send({ type: "SET_VALUE", index, value })
    },
    getValuePercent: getValuePercentFn,
    getPercentValue: getPercentValueFn,
    getThumbPercent(index) {
      return getValuePercentFn(sliderValue[index])
    },
    setThumbPercent(index, percent) {
      const value = getPercentValueFn(percent)
      send({ type: "SET_VALUE", index, value })
    },
    getThumbMin(index) {
      return getRangeAtIndex(state.context, index).min
    },
    getThumbMax(index) {
      return getRangeAtIndex(state.context, index).max
    },
    increment(index) {
      send({ type: "INCREMENT", index })
    },
    decrement(index) {
      send({ type: "DECREMENT", index })
    },
    focus() {
      if (!interactive) return
      send({ type: "FOCUS", index: 0 })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        dir: state.context.dir,
        "data-disabled": dataAttr(disabled),
        "data-orientation": state.context.orientation,
        "data-invalid": dataAttr(invalid),
        "data-dragging": dataAttr(dragging),
        "data-focus": dataAttr(focused),
        id: dom.getLabelId(state.context),
        htmlFor: dom.getHiddenInputId(state.context, 0),
        onClick(event) {
          if (!interactive) return
          event.preventDefault()
          dom.getFirstEl(state.context)?.focus()
        },
        style: {
          userSelect: "none",
          WebkitUserSelect: "none",
        },
      })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        "data-disabled": dataAttr(disabled),
        "data-orientation": state.context.orientation,
        "data-dragging": dataAttr(dragging),
        "data-invalid": dataAttr(invalid),
        "data-focus": dataAttr(focused),
        id: dom.getRootId(state.context),
        dir: state.context.dir,
        style: dom.getRootStyle(state.context),
      })
    },

    getValueTextProps() {
      return normalize.element({
        ...parts.valueText.attrs,
        dir: state.context.dir,
        "data-disabled": dataAttr(disabled),
        "data-orientation": state.context.orientation,
        "data-invalid": dataAttr(invalid),
        "data-focus": dataAttr(focused),
        id: dom.getValueTextId(state.context),
      })
    },

    getTrackProps() {
      return normalize.element({
        ...parts.track.attrs,
        dir: state.context.dir,
        id: dom.getTrackId(state.context),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-dragging": dataAttr(dragging),
        "data-orientation": state.context.orientation,
        "data-focus": dataAttr(focused),
        style: { position: "relative" },
      })
    },

    getThumbProps(props) {
      const { index = 0, name } = props

      const value = sliderValue[index]
      const range = getRangeAtIndex(state.context, index)
      const valueText = state.context.getAriaValueText?.({ value, index })
      const _ariaLabel = Array.isArray(ariaLabel) ? ariaLabel[index] : ariaLabel
      const _ariaLabelledBy = Array.isArray(ariaLabelledBy) ? ariaLabelledBy[index] : ariaLabelledBy

      return normalize.element({
        ...parts.thumb.attrs,
        dir: state.context.dir,
        "data-index": index,
        "data-name": name,
        id: dom.getThumbId(state.context, index),
        "data-disabled": dataAttr(disabled),
        "data-orientation": state.context.orientation,
        "data-focus": dataAttr(focused && state.context.focusedIndex === index),
        "data-dragging": dataAttr(dragging && state.context.focusedIndex === index),
        draggable: false,
        "aria-disabled": ariaAttr(disabled),
        "aria-label": _ariaLabel,
        "aria-labelledby": _ariaLabelledBy ?? dom.getLabelId(state.context),
        "aria-orientation": state.context.orientation,
        "aria-valuemax": range.max,
        "aria-valuemin": range.min,
        "aria-valuenow": sliderValue[index],
        "aria-valuetext": valueText,
        role: "slider",
        tabIndex: disabled ? undefined : 0,
        style: dom.getThumbStyle(state.context, index),
        onPointerDown(event) {
          if (!interactive) return
          send({ type: "THUMB_POINTER_DOWN", index })
          event.stopPropagation()
        },
        onBlur() {
          if (!interactive) return
          send("BLUR")
        },
        onFocus() {
          if (!interactive) return
          send({ type: "FOCUS", index })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!interactive) return

          const step = getEventStep(event) * state.context.step

          const keyMap: EventKeyMap = {
            ArrowUp() {
              if (isHorizontal) return
              send({ type: "ARROW_INC", step, src: "ArrowUp" })
            },
            ArrowDown() {
              if (isHorizontal) return
              send({ type: "ARROW_DEC", step, src: "ArrowDown" })
            },
            ArrowLeft() {
              if (isVertical) return
              send({ type: "ARROW_DEC", step, src: "ArrowLeft" })
            },
            ArrowRight() {
              if (isVertical) return
              send({ type: "ARROW_INC", step, src: "ArrowRight" })
            },
            PageUp() {
              send({ type: "ARROW_INC", step, src: "PageUp" })
            },
            PageDown() {
              send({ type: "ARROW_DEC", step, src: "PageDown" })
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

          if (exec) {
            exec(event)
            event.preventDefault()
            event.stopPropagation()
          }
        },
      })
    },

    getHiddenInputProps(props) {
      const { index = 0, name } = props
      return normalize.input({
        name:
          name ?? (state.context.name ? state.context.name + (state.context.value.length > 1 ? "[]" : "") : undefined),
        form: state.context.form,
        type: "text",
        hidden: true,
        defaultValue: state.context.value[index],
        id: dom.getHiddenInputId(state.context, index),
      })
    },

    getRangeProps() {
      return normalize.element({
        id: dom.getRangeId(state.context),
        ...parts.range.attrs,
        dir: state.context.dir,
        "data-dragging": dataAttr(dragging),
        "data-focus": dataAttr(focused),
        "data-invalid": dataAttr(invalid),
        "data-disabled": dataAttr(disabled),
        "data-orientation": state.context.orientation,
        style: dom.getRangeStyle(state.context),
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        dir: state.context.dir,
        id: dom.getControlId(state.context),
        "data-dragging": dataAttr(dragging),
        "data-disabled": dataAttr(disabled),
        "data-orientation": state.context.orientation,
        "data-invalid": dataAttr(invalid),
        "data-focus": dataAttr(focused),
        style: dom.getControlStyle(),
        onPointerDown(event) {
          if (!interactive) return
          if (!isLeftClick(event)) return
          if (isModifierKey(event)) return

          const point = getEventPoint(event)
          send({ type: "POINTER_DOWN", point })

          event.preventDefault()
          event.stopPropagation()
        },
      })
    },

    getMarkerGroupProps() {
      return normalize.element({
        ...parts.markerGroup.attrs,
        role: "presentation",
        dir: state.context.dir,
        "aria-hidden": true,
        "data-orientation": state.context.orientation,
        style: dom.getMarkerGroupStyle(),
      })
    },

    getMarkerProps(props) {
      const style = dom.getMarkerStyle(state.context, props.value)
      let markerState: "over-value" | "under-value" | "at-value"

      const first = state.context.value[0]
      const last = state.context.value[state.context.value.length - 1]

      if (props.value < first) {
        markerState = "under-value"
      } else if (props.value > last) {
        markerState = "over-value"
      } else {
        markerState = "at-value"
      }

      return normalize.element({
        ...parts.marker.attrs,
        id: dom.getMarkerId(state.context, props.value),
        role: "presentation",
        dir: state.context.dir,
        "data-orientation": state.context.orientation,
        "data-value": props.value,
        "data-disabled": dataAttr(disabled),
        "data-state": markerState,
        style,
      })
    },
  }
}
