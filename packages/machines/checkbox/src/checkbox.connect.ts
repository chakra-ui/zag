import { dataAttr, visuallyHiddenStyle } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./checkbox.anatomy"
import { dom } from "./checkbox.dom"
import type { MachineApi, Send, State } from "./checkbox.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const disabled = state.context.isDisabled
  const focused = !disabled && state.context.focused
  const checked = state.context.isChecked
  const indeterminate = state.context.isIndeterminate
  const readOnly = state.context.readOnly

  const dataAttrs = {
    "data-active": dataAttr(state.context.active),
    "data-focus": dataAttr(focused),
    "data-readonly": dataAttr(readOnly),
    "data-hover": dataAttr(state.context.hovered),
    "data-disabled": dataAttr(disabled),
    "data-state": indeterminate ? "indeterminate" : state.context.checked ? "checked" : "unchecked",
    "data-invalid": dataAttr(state.context.invalid),
  }

  return {
    checked,
    disabled,
    indeterminate,
    focused,
    checkedState: state.context.checked,

    setChecked(checked) {
      send({ type: "CHECKED.SET", checked, isTrusted: false })
    },

    toggleChecked() {
      send({ type: "CHECKED.TOGGLE", checked: checked, isTrusted: false })
    },

    getRootProps() {
      return normalize.label({
        ...parts.root.attrs,
        ...dataAttrs,
        dir: state.context.dir,
        id: dom.getRootId(state.context),
        htmlFor: dom.getHiddenInputId(state.context),
        onPointerMove() {
          if (disabled) return
          send({ type: "CONTEXT.SET", context: { hovered: true } })
        },
        onPointerLeave() {
          if (disabled) return
          send({ type: "CONTEXT.SET", context: { hovered: false } })
        },
        onClick(event) {
          if (event.target === dom.getHiddenInputEl(state.context)) {
            event.stopPropagation()
          }
        },
      })
    },

    getLabelProps() {
      return normalize.element({
        ...parts.label.attrs,
        ...dataAttrs,
        dir: state.context.dir,
        id: dom.getLabelId(state.context),
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        ...dataAttrs,
        dir: state.context.dir,
        id: dom.getControlId(state.context),
        "aria-hidden": true,
      })
    },

    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs,
        ...dataAttrs,
        dir: state.context.dir,
        hidden: !indeterminate && !state.context.checked,
      })
    },

    getHiddenInputProps() {
      return normalize.input({
        id: dom.getHiddenInputId(state.context),
        type: "checkbox",
        required: state.context.required,
        defaultChecked: checked,
        disabled: disabled,
        "aria-labelledby": dom.getLabelId(state.context),
        "aria-invalid": state.context.invalid,
        name: state.context.name,
        form: state.context.form,
        value: state.context.value,
        style: visuallyHiddenStyle,
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
