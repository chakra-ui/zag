import {
  ariaAttr,
  dataAttr,
  getEventKey,
  getEventPoint,
  getEventStep,
  isLeftClick,
  isModifierKey,
} from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { first, getPercentValue, getValuePercent, last } from "@zag-js/utils"
import { parts } from "./slider.anatomy"
import * as dom from "./slider.dom"
import {
  getControlStyle,
  getMarkerGroupStyle,
  getMarkerStyle,
  getRangeStyle,
  getRootStyle,
  getThumbStyle,
} from "./slider.style"
import type { SliderApi, SliderService } from "./slider.types"
import { getRangeAtIndex } from "./slider.utils"

export function connect<T extends PropTypes>(service: SliderService, normalize: NormalizeProps<T>): SliderApi<T> {
  const { state, send, context, prop, computed, scope } = service

  const ariaLabel = prop("aria-label")
  const ariaLabelledBy = prop("aria-labelledby")

  const sliderValue = context.get("value")
  const focusedIndex = context.get("focusedIndex")

  const focused = state.matches("focus")
  const dragging = state.matches("dragging")

  const disabled = computed("isDisabled")
  const invalid = prop("invalid")
  const interactive = computed("isInteractive")

  const isHorizontal = prop("orientation") === "horizontal"
  const isVertical = prop("orientation") === "vertical"

  function getValuePercentFn(value: number) {
    return getValuePercent(value, prop("min"), prop("max"))
  }

  function getPercentValueFn(percent: number) {
    return getPercentValue(percent, prop("min"), prop("max"), prop("step"))
  }

  return {
    value: sliderValue,
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
      return getRangeAtIndex(service, index).min
    },
    getThumbMax(index) {
      return getRangeAtIndex(service, index).max
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
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-orientation": prop("orientation"),
        "data-invalid": dataAttr(invalid),
        "data-dragging": dataAttr(dragging),
        "data-focus": dataAttr(focused),
        id: dom.getLabelId(scope),
        htmlFor: dom.getHiddenInputId(scope, 0),
        onClick(event) {
          if (!interactive) return
          event.preventDefault()
          dom.getFirstThumbEl(scope)?.focus()
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
        "data-orientation": prop("orientation"),
        "data-dragging": dataAttr(dragging),
        "data-invalid": dataAttr(invalid),
        "data-focus": dataAttr(focused),
        id: dom.getRootId(scope),
        dir: prop("dir"),
        style: getRootStyle(service),
      })
    },

    getValueTextProps() {
      return normalize.element({
        ...parts.valueText.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-orientation": prop("orientation"),
        "data-invalid": dataAttr(invalid),
        "data-focus": dataAttr(focused),
        id: dom.getValueTextId(scope),
      })
    },

    getTrackProps() {
      return normalize.element({
        ...parts.track.attrs,
        dir: prop("dir"),
        id: dom.getTrackId(scope),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-dragging": dataAttr(dragging),
        "data-orientation": prop("orientation"),
        "data-focus": dataAttr(focused),
        style: { position: "relative" },
      })
    },

    getThumbProps(props) {
      const { index = 0, name } = props

      const value = sliderValue[index]
      const range = getRangeAtIndex(service, index)
      const valueText = prop("getAriaValueText")?.({ value, index })
      const _ariaLabel = Array.isArray(ariaLabel) ? ariaLabel[index] : ariaLabel
      const _ariaLabelledBy = Array.isArray(ariaLabelledBy) ? ariaLabelledBy[index] : ariaLabelledBy

      return normalize.element({
        ...parts.thumb.attrs,
        dir: prop("dir"),
        "data-index": index,
        "data-name": name,
        id: dom.getThumbId(scope, index),
        "data-disabled": dataAttr(disabled),
        "data-orientation": prop("orientation"),
        "data-focus": dataAttr(focused && focusedIndex === index),
        "data-dragging": dataAttr(dragging && focusedIndex === index),
        draggable: false,
        "aria-disabled": ariaAttr(disabled),
        "aria-label": _ariaLabel,
        "aria-labelledby": _ariaLabelledBy ?? dom.getLabelId(scope),
        "aria-orientation": prop("orientation"),
        "aria-valuemax": range.max,
        "aria-valuemin": range.min,
        "aria-valuenow": sliderValue[index],
        "aria-valuetext": valueText,
        role: "slider",
        tabIndex: disabled ? undefined : 0,
        style: getThumbStyle(service, index),
        onPointerDown(event) {
          if (!interactive) return
          if (!isLeftClick(event)) return

          // Calculate offset from thumb center to maintain constant offset during drag
          const thumbEl = event.currentTarget as HTMLElement
          const rect = thumbEl.getBoundingClientRect()
          const midpoint = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          }
          const offset = {
            x: event.clientX - midpoint.x,
            y: event.clientY - midpoint.y,
          }

          send({ type: "THUMB_POINTER_DOWN", index, offset })
          event.stopPropagation()
        },
        onBlur() {
          if (!interactive) return
          send({ type: "BLUR" })
        },
        onFocus() {
          if (!interactive) return
          send({ type: "FOCUS", index })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!interactive) return

          const step = getEventStep(event) * prop("step")

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
              send({ type: "HOME" })
            },
            End() {
              send({ type: "END" })
            },
          }

          const key = getEventKey(event, {
            dir: prop("dir"),
            orientation: prop("orientation"),
          })
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
        name: name ?? (prop("name") ? prop("name") + (sliderValue.length > 1 ? "[]" : "") : undefined),
        form: prop("form"),
        type: "text",
        hidden: true,
        defaultValue: sliderValue[index],
        id: dom.getHiddenInputId(scope, index),
      })
    },

    getRangeProps() {
      return normalize.element({
        id: dom.getRangeId(scope),
        ...parts.range.attrs,
        dir: prop("dir"),
        "data-dragging": dataAttr(dragging),
        "data-focus": dataAttr(focused),
        "data-invalid": dataAttr(invalid),
        "data-disabled": dataAttr(disabled),
        "data-orientation": prop("orientation"),
        style: getRangeStyle(service),
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        dir: prop("dir"),
        id: dom.getControlId(scope),
        "data-dragging": dataAttr(dragging),
        "data-disabled": dataAttr(disabled),
        "data-orientation": prop("orientation"),
        "data-invalid": dataAttr(invalid),
        "data-focus": dataAttr(focused),
        style: getControlStyle(),
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
        dir: prop("dir"),
        "aria-hidden": true,
        "data-orientation": prop("orientation"),
        style: getMarkerGroupStyle(),
      })
    },

    getMarkerProps(props) {
      const style = getMarkerStyle(service, props.value)
      let markerState: "over-value" | "under-value" | "at-value"

      if (props.value < first(sliderValue)!) {
        markerState = "under-value"
      } else if (props.value > last(sliderValue)!) {
        markerState = "over-value"
      } else {
        markerState = "at-value"
      }

      return normalize.element({
        ...parts.marker.attrs,
        id: dom.getMarkerId(scope, props.value),
        role: "presentation",
        dir: prop("dir"),
        "data-orientation": prop("orientation"),
        "data-value": props.value,
        "data-disabled": dataAttr(disabled),
        "data-state": markerState,
        style,
      })
    },

    getDraggingIndicatorProps(props) {
      const { index = 0 } = props
      const isDragging = index === focusedIndex && dragging
      return normalize.element({
        ...parts.draggingIndicator.attrs,
        role: "presentation",
        dir: prop("dir"),
        hidden: !isDragging,
        "data-orientation": prop("orientation"),
        "data-state": isDragging ? "open" : "closed",
        style: getThumbStyle(service, index),
      })
    },
  }
}
