import { ariaAttr, dataAttr, isLeftClick } from "@zag-js/dom-query"
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
  const required = !!prop("required")
  const interactive = !(readOnly || disabled)
  const translations = prop("translations")

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
    toggleVisible() {
      service.send({ type: "VISIBILITY.SET", value: !visible })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs(scope.id),
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs(scope.id),
        htmlFor: dom.getInputId(scope),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        "data-required": dataAttr(required),
      })
    },

    getInputProps() {
      return normalize.input({
        ...parts.input.attrs(scope.id),
        id: dom.getInputId(scope),
        autoCapitalize: "off",
        name: prop("name"),
        required: prop("required"),
        autoComplete: prop("autoComplete"),
        spellCheck: false,
        readOnly,
        disabled,
        type: visible ? "text" : "password",
        "data-state": visible ? "visible" : "hidden",
        "aria-invalid": ariaAttr(invalid),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        ...(prop("ignorePasswordManagers") ? passwordManagerProps : {}),
      })
    },

    getVisibilityTriggerProps() {
      return normalize.button({
        ...parts.visibilityTrigger.attrs(scope.id),
        type: "button",
        tabIndex: -1,
        "aria-controls": dom.getInputId(scope),
        "aria-expanded": visible,
        "data-readonly": dataAttr(readOnly),
        disabled,
        "data-disabled": dataAttr(disabled),
        "data-state": visible ? "visible" : "hidden",
        "aria-label": translations?.visibilityTrigger?.(visible),
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          if (!interactive) return
          event.preventDefault()
          service.send({ type: "TRIGGER.CLICK" })
        },
      })
    },

    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs(scope.id),
        "aria-hidden": true,
        "data-state": visible ? "visible" : "hidden",
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs(scope.id),
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
