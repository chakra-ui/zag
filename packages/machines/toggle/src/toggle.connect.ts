import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./toggle.anatomy"
import type { ToggleApi, ToggleService } from "./toggle.types"

export function connect<T extends PropTypes>(service: ToggleService, normalize: NormalizeProps<T>): ToggleApi<T> {
  const { context, prop, send } = service
  const pressed = context.get("pressed")
  return {
    pressed,
    disabled: !!prop("disabled"),
    setPressed(value) {
      send({ type: "PRESS.SET", value })
    },

    getRootProps() {
      return normalize.element({
        type: "button",
        ...parts.root.attrs,
        disabled: prop("disabled"),
        "aria-pressed": pressed,
        "data-state": pressed ? "on" : "off",
        "data-pressed": dataAttr(pressed),
        "data-disabled": dataAttr(prop("disabled")),
        onClick(event) {
          if (event.defaultPrevented) return
          if (prop("disabled")) return
          send({ type: "PRESS.TOGGLE" })
        },
      })
    },

    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs,
        "data-disabled": dataAttr(prop("disabled")),
        "data-pressed": dataAttr(pressed),
        "data-state": pressed ? "on" : "off",
      })
    },
  }
}
