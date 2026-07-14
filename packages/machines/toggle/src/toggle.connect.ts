import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./toggle.anatomy"
import type { RootState, ToggleApi, ToggleService } from "./toggle.types"

export function connect<T extends PropTypes>(service: ToggleService, normalize: NormalizeProps<T>): ToggleApi<T> {
  const { context, prop, send, scope } = service
  const pressed = context.get("pressed")
  const disabled = !!prop("disabled")

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getRootState(): RootState {
    return { pressed, disabled }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    pressed,
    disabled,
    setPressed(value) {
      send({ type: "PRESS.SET", value })
    },

    getRootState,
    getRootProps() {
      const rootState = getRootState()
      return normalize.element({
        type: "button",
        ...parts.root.attrs(scope.id),
        disabled: rootState.disabled,
        "aria-pressed": rootState.pressed,
        "data-pressed": dataAttr(rootState.pressed),
        "data-disabled": dataAttr(rootState.disabled),
        onClick(event) {
          if (event.defaultPrevented) return
          if (rootState.disabled) return
          send({ type: "PRESS.TOGGLE" })
        },
      })
    },

    getIndicatorProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.indicator.attrs(scope.id),
        "data-disabled": dataAttr(rootState.disabled),
        "data-pressed": dataAttr(rootState.pressed),
      })
    },
  }
}
