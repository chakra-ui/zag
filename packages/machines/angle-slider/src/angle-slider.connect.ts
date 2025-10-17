import { dataAttr, getEventPoint, getEventStep, isLeftClick } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./angle-slider.anatomy"
import * as dom from "./angle-slider.dom"
import type { AngleSliderService, AngleSliderApi } from "./angle-slider.types"

export function connect<T extends PropTypes>(
  service: AngleSliderService,
  normalize: NormalizeProps<T>,
): AngleSliderApi<T> {
  const { state, send, context, prop, computed, scope } = service

  const dragging = state.matches("dragging")

  const value = context.get("value")
  const valueAsDegree = computed("valueAsDegree")

  const disabled = prop("disabled")
  const invalid = prop("invalid")
  const readOnly = prop("readOnly")
  const interactive = computed("interactive")

  const ariaLabel = prop("aria-label")
  const ariaLabelledBy = prop("aria-labelledby")

  return {
    value,
    valueAsDegree,
    dragging,
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        style: {
          "--value": value,
          "--angle": valueAsDegree,
        },
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        id: dom.getLabelId(scope),
        htmlFor: dom.getHiddenInputId(scope),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        onClick(event) {
          if (!interactive) return
          event.preventDefault()
          dom.getThumbEl(scope)?.focus()
        },
      })
    },

    getHiddenInputProps() {
      return normalize.element({
        type: "hidden",
        value,
        name: prop("name"),
        id: dom.getHiddenInputId(scope),
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        role: "presentation",
        id: dom.getControlId(scope),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        onPointerDown(event) {
          if (!interactive) return
          if (!isLeftClick(event)) return
          const point = getEventPoint(event)
          send({ type: "CONTROL.POINTER_DOWN", point })
          event.stopPropagation()
        },
        style: {
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        },
      })
    },

    getThumbProps() {
      return normalize.element({
        ...parts.thumb.attrs,
        id: dom.getThumbId(scope),
        role: "slider",
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy ?? dom.getLabelId(scope),
        "aria-valuemax": 360,
        "aria-valuemin": 0,
        "aria-valuenow": value,
        tabIndex: readOnly || interactive ? 0 : undefined,
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        onFocus() {
          send({ type: "THUMB.FOCUS" })
        },
        onBlur() {
          send({ type: "THUMB.BLUR" })
        },
        onKeyDown(event) {
          if (!interactive) return

          const step = getEventStep(event) * prop("step")

          switch (event.key) {
            case "ArrowLeft":
            case "ArrowUp":
              event.preventDefault()
              send({ type: "THUMB.ARROW_DEC", step })
              break
            case "ArrowRight":
            case "ArrowDown":
              event.preventDefault()
              send({ type: "THUMB.ARROW_INC", step })
              break
            case "Home":
              event.preventDefault()
              send({ type: "THUMB.HOME" })
              break
            case "End":
              event.preventDefault()
              send({ type: "THUMB.END" })
              break
            default:
              break
          }
        },
        style: {
          rotate: `var(--angle)`,
        },
      })
    },

    getValueTextProps() {
      return normalize.element({
        ...parts.valueText.attrs,
        id: dom.getValueTextId(scope),
      })
    },

    getMarkerGroupProps() {
      return normalize.element({
        ...parts.markerGroup.attrs,
      })
    },

    getMarkerProps(props) {
      let markerState: "under-value" | "over-value" | "at-value"

      if (props.value < value) {
        markerState = "under-value"
      } else if (props.value > value) {
        markerState = "over-value"
      } else {
        markerState = "at-value"
      }

      return normalize.element({
        ...parts.marker.attrs,
        "data-value": props.value,
        "data-state": markerState,
        "data-disabled": dataAttr(disabled),
        style: {
          "--marker-value": props.value,
          rotate: `calc(var(--marker-value) * 1deg)`,
        },
      })
    },
  }
}
