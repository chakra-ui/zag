import { getEventPoint, getEventStep } from "@zag-js/dom-event"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./angle-slider.anatomy"
import { dom } from "./angle-slider.dom"
import type { MachineApi, Send, State } from "./angle-slider.types"
import { dataAttr } from "@zag-js/dom-query"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const dragging = state.matches("dragging")

  const value = state.context.value
  const valueAsDegree = state.context.valueAsDegree

  const disabled = state.context.disabled
  const invalid = state.context.invalid
  const readOnly = state.context.readOnly
  const interactive = state.context.interactive

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
        id: dom.getRootId(state.context),
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
        htmlFor: dom.getHiddenInputId(state.context),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        onClick(event) {
          if (!interactive) return
          event.preventDefault()
          dom.getThumbEl(state.context)?.focus()
        },
      })
    },

    getHiddenInputProps() {
      return normalize.element({
        type: "hidden",
        value,
        name: state.context.name,
        id: dom.getHiddenInputId(state.context),
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        role: "presentation",
        id: dom.getControlId(state.context),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        onPointerDown(event) {
          if (!interactive) return
          const point = getEventPoint(event)
          send({ type: "CONTROL.POINTER_DOWN", point })
        },
      })
    },

    getThumbProps() {
      return normalize.element({
        ...parts.thumb.attrs,
        id: dom.getThumbId(state.context),
        role: "slider",
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

          const step = getEventStep(event) * state.context.step

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
        id: dom.getValueTextId(state.context),
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
