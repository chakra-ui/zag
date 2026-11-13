import { ariaAttr, dataAttr, getNativeEvent, isLeftClick, isVirtualClick } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes, Required } from "@zag-js/types"
import { mergeWithDefault } from "@zag-js/utils"
import { parts } from "./password-input.anatomy"
import * as dom from "./password-input.dom"
import type { IntlTranslations, PasswordInputApi, PasswordInputService, RootState } from "./password-input.types"

const defaultTranslations: Required<IntlTranslations> = {
  visibilityTrigger: (visible) => (visible ? "Hide password" : "Show password"),
}

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
  const translations = mergeWithDefault(defaultTranslations, prop("translations"))

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getRootState(): RootState {
    return { disabled, invalid, readOnly, required, visible }
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
      const rootState = getRootState()
      return normalize.label({
        ...parts.label.attrs(scope.id),
        htmlFor: dom.getInputId(scope),
        "data-disabled": dataAttr(rootState.disabled),
        "data-invalid": dataAttr(rootState.invalid),
        "data-readonly": dataAttr(rootState.readOnly),
        "data-required": dataAttr(rootState.required),
      })
    },

    getInputProps() {
      const rootState = getRootState()
      return normalize.input({
        ...parts.input.attrs(scope.id),
        id: dom.getInputId(scope),
        autoCapitalize: "off",
        name: prop("name"),
        required: rootState.required,
        autoComplete: prop("autoComplete"),
        spellCheck: false,
        readOnly: rootState.readOnly,
        disabled: rootState.disabled,
        type: rootState.visible ? "text" : "password",
        "data-state": rootState.visible ? "visible" : "hidden",
        "aria-invalid": ariaAttr(rootState.invalid),
        "data-disabled": dataAttr(rootState.disabled),
        "data-invalid": dataAttr(rootState.invalid),
        "data-readonly": dataAttr(rootState.readOnly),
        ...(prop("ignorePasswordManagers") ? passwordManagerProps : {}),
      })
    },

    getVisibilityTriggerProps() {
      const rootState = getRootState()
      return normalize.button({
        ...parts.visibilityTrigger.attrs(scope.id),
        type: "button",
        "aria-controls": dom.getInputId(scope),
        "data-readonly": dataAttr(rootState.readOnly),
        disabled: rootState.disabled,
        "data-disabled": dataAttr(rootState.disabled),
        "data-state": rootState.visible ? "visible" : "hidden",
        "aria-label": translations?.visibilityTrigger?.(rootState.visible),
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          if (!interactive) return
          event.preventDefault()
          service.send({ type: "TRIGGER.CLICK", src: "pointer" })
        },
        onClick(event) {
          // pointer clicks are handled on pointerdown
          if (!isVirtualClick(getNativeEvent(event))) return
          if (!interactive) return
          service.send({ type: "TRIGGER.CLICK", src: "keyboard" })
        },
      })
    },

    getIndicatorProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.indicator.attrs(scope.id),
        "aria-hidden": true,
        "data-state": rootState.visible ? "visible" : "hidden",
        "data-disabled": dataAttr(rootState.disabled),
        "data-invalid": dataAttr(rootState.invalid),
        "data-readonly": dataAttr(rootState.readOnly),
      })
    },

    getControlProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.control.attrs(scope.id),
        "data-disabled": dataAttr(rootState.disabled),
        "data-invalid": dataAttr(rootState.invalid),
        "data-readonly": dataAttr(rootState.readOnly),
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
