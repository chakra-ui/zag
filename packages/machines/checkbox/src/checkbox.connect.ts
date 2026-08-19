import { dataAttr, getEventTarget, visuallyHiddenStyle } from "@zag-js/dom-query"
import { isFocusVisible } from "@zag-js/focus-visible"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { Service } from "@zag-js/core"
import { parts } from "./checkbox.anatomy"
import * as dom from "./checkbox.dom"
import type { CheckboxApi, CheckboxSchema, RootState } from "./checkbox.types"

export function connect<T extends PropTypes>(
  service: Service<CheckboxSchema>,
  normalize: NormalizeProps<T>,
): CheckboxApi<T> {
  const { send, context, prop, computed, scope } = service
  const disabled = !!prop("disabled")
  const readOnly = !!prop("readOnly")
  const required = !!prop("required")
  const invalid = !!prop("invalid")

  const focused = !disabled && context.get("focused")
  const focusVisible = !disabled && context.get("focusVisible")

  const checked = computed("checked")
  const indeterminate = computed("indeterminate")
  const checkedState = context.get("checked")

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getRootState(): RootState {
    return {
      checked,
      indeterminate,
      disabled,
      invalid,
      required,
      readOnly,
      focused,
      focusVisible,
      hovered: context.get("hovered"),
      active: context.get("active"),
    }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    checked,
    disabled,
    indeterminate,
    focused,
    checkedState,

    setChecked(checked) {
      send({ type: "CHECKED.SET", checked, isTrusted: false })
    },

    toggleChecked() {
      send({ type: "CHECKED.TOGGLE", checked: checked, isTrusted: false })
    },

    getRootState,
    getRootProps() {
      const rootState = getRootState()
      return normalize.label({
        ...parts.root.attrs(scope.id),
        ...getDataAttrs(rootState),
        dir: prop("dir"),
        htmlFor: dom.getHiddenInputId(scope),
        onPointerMove() {
          if (disabled) return
          send({ type: "CONTEXT.SET", context: { hovered: true } })
        },
        onPointerLeave() {
          if (disabled) return
          send({ type: "CONTEXT.SET", context: { hovered: false } })
        },
        onClick(event) {
          const target = getEventTarget<Element>(event)
          if (target === dom.getHiddenInputEl(scope)) {
            event.stopPropagation()
          }
        },
      })
    },

    getLabelProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.label.attrs(scope.id),
        ...getDataAttrs(rootState),
        dir: prop("dir"),
        id: dom.getLabelId(scope),
      })
    },

    getControlProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.control.attrs(scope.id),
        ...getDataAttrs(rootState),
        dir: prop("dir"),
        "aria-hidden": true,
      })
    },

    getIndicatorProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.indicator.attrs(scope.id),
        ...getDataAttrs(rootState),
        dir: prop("dir"),
        hidden: !rootState.indeterminate && !rootState.checked,
      })
    },

    getHiddenInputProps() {
      const rootState = getRootState()
      return normalize.input({
        id: dom.getHiddenInputId(scope),
        type: "checkbox",
        required: prop("required"),
        defaultChecked: rootState.checked,
        disabled: rootState.disabled,
        "aria-labelledby": dom.getLabelId(scope),
        "aria-invalid": rootState.invalid,
        name: prop("name"),
        form: prop("form"),
        value: prop("value"),
        style: visuallyHiddenStyle,
        onFocus() {
          const focusVisible = isFocusVisible()
          send({ type: "CONTEXT.SET", context: { focused: true, focusVisible } })
        },
        onBlur() {
          send({ type: "CONTEXT.SET", context: { focused: false, focusVisible: false } })
        },
        onClick(event) {
          if (readOnly) {
            event.preventDefault()
            return
          }

          const checked = event.currentTarget.checked
          send({ type: "CHECKED.SET", checked, isTrusted: true })
        },
      })
    },
  }
}

function getDataAttrs(rootState: RootState) {
  return {
    "data-active": dataAttr(rootState.active),
    "data-focus": dataAttr(rootState.focused),
    "data-focus-visible": dataAttr(rootState.focusVisible),
    "data-readonly": dataAttr(rootState.readOnly),
    "data-hover": dataAttr(rootState.hovered),
    "data-disabled": dataAttr(rootState.disabled),
    "data-state": rootState.indeterminate ? "indeterminate" : rootState.checked ? "checked" : "unchecked",
    "data-invalid": dataAttr(rootState.invalid),
    "data-required": dataAttr(rootState.required),
  }
}
