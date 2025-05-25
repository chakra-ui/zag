import { ariaAttr, dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./password-input.anatomy"
import * as dom from "./password-input.dom"
import type { PasswordInputApi, PasswordInputService } from "./password-input.types"

export function connect<T extends PropTypes>(
  service: PasswordInputService,
  normalize: NormalizeProps<T>,
): PasswordInputApi<T> {
  const { scope, prop, context } = service

  const visible = context.get("visible")
  const disabled = !!prop("disabled")
  const invalid = !!prop("invalid")
  const readOnly = !!prop("readOnly")
  const interactive = !(readOnly || disabled)

  return {
    visible,
    disabled,
    invalid,
    focus() {
      dom.getInputEl(scope)?.focus()
    },
    setVisible(value) {
      service.send({ type: "VISIBILITY.SET", value })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        htmlFor: dom.getInputId(scope),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
      })
    },

    getInputProps(props = {}) {
      const { autoComplete = "current-password", ignorePasswordManagers } = props
      return normalize.input({
        ...parts.input.attrs,
        id: dom.getInputId(scope),
        autoCapitalize: "off",
        autoComplete: autoComplete,
        spellCheck: false,
        readOnly,
        disabled,
        type: visible ? "text" : "password",
        "aria-invalid": ariaAttr(invalid),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        ...(ignorePasswordManagers ? passwordManagerProps : {}),
      })
    },

    getVisibilityTriggerProps() {
      return normalize.button({
        ...parts.visibilityTrigger.attrs,
        type: "button",
        "aria-controls": dom.getInputId(scope),
        "aria-expanded": visible,
        "data-readonly": dataAttr(readOnly),
        disabled,
        "data-state": visible ? "visible" : "hidden",
        "aria-label": visible ? "Hide password" : "Show password",
        onClick(event) {
          if (!interactive) return
          if (event.defaultPrevented) return
          service.send({ type: "TRIGGER.CLICK" })
        },
      })
    },

    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs,
        "aria-hidden": true,
        "data-state": visible ? "visible" : "hidden",
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
      })
    },
  }
}

const passwordManagerProps = {
  // 1Password
  "data-1p-ignore": "",
  // LastPass
  "data-lpignore": "true",
  // Bitwarden
  "data-bwignore": "true",
  // Dashlane
  "data-form-type": "other",
  // Proton Pass
  "data-protonpass-ignore": "true",
}
