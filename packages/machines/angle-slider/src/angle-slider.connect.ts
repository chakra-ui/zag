import { dataAttr, getEventKey, getEventPoint, getEventStep, getNativeEvent, isLeftClick } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./angle-slider.anatomy"
import * as dom from "./angle-slider.dom"
import type { AngleSliderApi, AngleSliderService, MarkerProps, MarkerState, RootState } from "./angle-slider.types"
import { getAngle, getDisplayAngle } from "./angle-slider.utils"

export function connect<T extends PropTypes>(
  service: AngleSliderService,
  normalize: NormalizeProps<T>,
): AngleSliderApi<T> {
  const { state, send, context, prop, computed, scope } = service

  const dragging = state.matches("dragging")

  const value = context.get("value")
  const valueAsDegree = computed("valueAsDegree")
  const dir = prop("dir")
  const displayAngle = getDisplayAngle(value, dir)

  const disabled = !!prop("disabled")
  const invalid = !!prop("invalid")
  const readOnly = !!prop("readOnly")
  const interactive = computed("interactive")

  const ariaLabel = prop("aria-label")
  const ariaLabelledBy = prop("aria-labelledby")

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getRootState(): RootState {
    return { disabled, invalid, readOnly }
  }

  function getMarkerState(props: MarkerProps): MarkerState {
    const { value: markerValue } = props
    let markerState: MarkerState["state"]

    if (markerValue < value) {
      markerState = "under-value"
    } else if (markerValue > value) {
      markerState = "over-value"
    } else {
      markerState = "at-value"
    }

    return { value: markerValue, disabled, state: markerState }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    value,
    valueAsDegree,
    dragging,
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },

    getRootState,
    getRootProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.root.attrs(scope.id),
        dir: prop("dir"),
        "data-disabled": dataAttr(rootState.disabled),
        "data-invalid": dataAttr(rootState.invalid),
        "data-readonly": dataAttr(rootState.readOnly),
        style: {
          "--value": value,
          "--angle": `${displayAngle}deg`,
        },
      })
    },

    getLabelProps() {
      const rootState = getRootState()
      return normalize.label({
        ...parts.label.attrs(scope.id),
        id: dom.getLabelId(scope),
        htmlFor: dom.getHiddenInputId(scope),
        dir: prop("dir"),
        "data-disabled": dataAttr(rootState.disabled),
        "data-invalid": dataAttr(rootState.invalid),
        "data-readonly": dataAttr(rootState.readOnly),
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
        dir: prop("dir"),
      })
    },

    getControlProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.control.attrs(scope.id),
        role: "presentation",
        dir: prop("dir"),
        "data-disabled": dataAttr(rootState.disabled),
        "data-invalid": dataAttr(rootState.invalid),
        "data-readonly": dataAttr(rootState.readOnly),
        onPointerDown(event) {
          if (!interactive) return
          if (!isLeftClick(event)) return

          const point = getEventPoint(event)
          const controlEl = event.currentTarget

          // Check if pointer is over the thumb (if thumb exists)
          const thumbEl = dom.getThumbEl(scope)
          const composedPath = getNativeEvent(event).composedPath()
          const isOverThumb = thumbEl && composedPath.includes(thumbEl)

          let angularOffset = null
          if (isOverThumb) {
            // Use raw angle for offset; value is already in correct dir space
            const clickAngle = getAngle(controlEl, point)
            angularOffset = clickAngle - value
          }

          send({ type: "CONTROL.POINTER_DOWN", point, angularOffset })
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
      const rootState = getRootState()
      return normalize.element({
        ...parts.thumb.attrs(scope.id),
        id: dom.getThumbId(scope),
        role: "slider",
        dir: prop("dir"),
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy ?? dom.getLabelId(scope),
        "aria-valuemax": 360,
        "aria-valuemin": 0,
        "aria-valuenow": value,
        tabIndex: rootState.readOnly || interactive ? 0 : undefined,
        "data-disabled": dataAttr(rootState.disabled),
        "data-invalid": dataAttr(rootState.invalid),
        "data-readonly": dataAttr(rootState.readOnly),
        onFocus() {
          send({ type: "THUMB.FOCUS" })
        },
        onBlur() {
          send({ type: "THUMB.BLUR" })
        },
        onKeyDown(event) {
          if (!interactive) return

          const step = getEventStep(event) * prop("step")

          const keyMap: EventKeyMap = {
            ArrowLeft() {
              send({ type: "THUMB.ARROW_DEC", step })
            },
            ArrowUp() {
              send({ type: "THUMB.ARROW_DEC", step })
            },
            ArrowRight() {
              send({ type: "THUMB.ARROW_INC", step })
            },
            ArrowDown() {
              send({ type: "THUMB.ARROW_INC", step })
            },
            Home() {
              send({ type: "THUMB.HOME" })
            },
            End() {
              send({ type: "THUMB.END" })
            },
          }

          const key = getEventKey(event, {
            dir: prop("dir"),
            orientation: "horizontal",
          })
          const exec = keyMap[key]

          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },
        style: {
          rotate: `var(--angle)`,
        },
      })
    },

    getValueTextProps() {
      return normalize.element({
        ...parts.valueText.attrs(scope.id),
        dir: prop("dir"),
      })
    },

    getMarkerGroupProps() {
      return normalize.element({
        ...parts.markerGroup.attrs(scope.id),
        dir: prop("dir"),
      })
    },

    getMarkerState,
    getMarkerProps(props) {
      const markerState = getMarkerState(props)
      const markerDisplayAngle = getDisplayAngle(props.value, dir)

      return normalize.element({
        ...parts.marker.attrs(scope.id),
        dir: prop("dir"),
        "data-value": markerState.value,
        "data-state": markerState.state,
        "data-disabled": dataAttr(markerState.disabled),
        style: {
          "--marker-value": props.value,
          "--marker-display-value": markerDisplayAngle,
          rotate: `calc(var(--marker-display-value) * 1deg)`,
        },
      })
    },
  }
}
