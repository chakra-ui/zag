import { ariaAttr, dataAttr, isLeftClick } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./password-input.anatomy"
import * as dom from "./password-input.dom"
import type {
  InputState,
  PasswordInputApi,
  PasswordInputService,
  RootState,
  VisibilityTriggerState,
} from "./password-input.types"

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

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getRootState(): RootState {
    return { disabled, invalid, readOnly }
  }

  function getInputState(): InputState {
    return { disabled, invalid, readOnly, visible }
  }

  function getVisibilityTriggerState(): VisibilityTriggerState {
    return { disabled, readOnly, visible }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

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

    getRootState,
    getRootProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.root.attrs(scope.id),
        dir: prop("dir"),
        "data-disabled": dataAttr(rootState.disabled),
        "data-invalid": dataAttr(rootState.invalid),
        "data-readonly": dataAttr(rootState.readOnly),
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

    getInputState,
    getInputProps() {
      const inputState = getInputState()
      return normalize.input({
        ...parts.input.attrs(scope.id),
        id: dom.getInputId(scope),
        autoCapitalize: "off",
        name: prop("name"),
        required: prop("required"),
        autoComplete: prop("autoComplete"),
        spellCheck: false,
        readOnly: inputState.readOnly,
        disabled: inputState.disabled,
        type: inputState.visible ? "text" : "password",
        "data-state": inputState.visible ? "visible" : "hidden",
        "aria-invalid": ariaAttr(inputState.invalid),
        "data-disabled": dataAttr(inputState.disabled),
        "data-invalid": dataAttr(inputState.invalid),
        "data-readonly": dataAttr(inputState.readOnly),
        ...(prop("ignorePasswordManagers") ? passwordManagerProps : {}),
      })
    },

    getVisibilityTriggerState,
    getVisibilityTriggerProps() {
      const visibilityTriggerState = getVisibilityTriggerState()
      return normalize.button({
        ...parts.visibilityTrigger.attrs(scope.id),
        type: "button",
        tabIndex: -1,
        "aria-controls": dom.getInputId(scope),
        "aria-expanded": visibilityTriggerState.visible,
        "data-readonly": dataAttr(visibilityTriggerState.readOnly),
        disabled: visibilityTriggerState.disabled,
        "data-disabled": dataAttr(visibilityTriggerState.disabled),
        "data-state": visibilityTriggerState.visible ? "visible" : "hidden",
        "aria-label": translations?.visibilityTrigger?.(visibilityTriggerState.visible),
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
