import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { visuallyHiddenStyle } from "@zag-js/visually-hidden"
import { parts } from "./checkbox.anatomy"
import { dom } from "./checkbox.dom"
import type { CheckedState, MachineApi, Send, State } from "./checkbox.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isDisabled = state.context.isDisabled
  const isFocused = !isDisabled && state.context.focused
  const isChecked = state.context.isChecked
  const isIndeterminate = state.context.isIndeterminate

  const dataAttrs = {
    "data-active": dataAttr(state.context.active),
    "data-focus": dataAttr(isFocused),
    "data-hover": dataAttr(state.context.hovered),
    "data-disabled": dataAttr(isDisabled),
    "data-state": isIndeterminate ? "indeterminate" : state.context.checked ? "checked" : "unchecked",
    "data-invalid": dataAttr(state.context.invalid),
  }

  return {
    isChecked,
    isDisabled,
    isIndeterminate,
    isFocused,
    checkedState: state.context.checked,

    setChecked(checked: CheckedState) {
      send({ type: "CHECKED.SET", checked, isTrusted: false })
    },

    toggleChecked() {
      send({ type: "CHECKED.TOGGLE", checked: isChecked, isTrusted: false })
    },

    rootProps: normalize.label({
      ...parts.root.attrs,
      ...dataAttrs,
      id: dom.getRootId(state.context),
      htmlFor: dom.getHiddenInputId(state.context),
      onPointerMove() {
        if (isDisabled) return
        send({ type: "CONTEXT.SET", context: { hovered: true } })
      },
      onPointerLeave() {
        if (isDisabled) return
        send({ type: "CONTEXT.SET", context: { hovered: false } })
      },
      onPointerDown(event) {
        if (isDisabled) return
        // On pointerdown, the input blurs and returns focus to the `body`,
        // we need to prevent this.
        if (isFocused && event.pointerType === "mouse") {
          event.preventDefault()
        }
        send({ type: "CONTEXT.SET", context: { active: true } })
      },
      onPointerUp() {
        if (isDisabled) return
        send({ type: "CONTEXT.SET", context: { active: false } })
      },
      onClick(event) {
        if (event.target === dom.getHiddenInputEl(state.context)) {
          event.stopPropagation()
        }
      },
    }),

    labelProps: normalize.element({
      ...parts.label.attrs,
      ...dataAttrs,
      id: dom.getLabelId(state.context),
    }),

    controlProps: normalize.element({
      ...parts.control.attrs,
      ...dataAttrs,
      id: dom.getControlId(state.context),
      "aria-hidden": true,
    }),

    hiddenInputProps: normalize.input({
      id: dom.getHiddenInputId(state.context),
      type: "checkbox",
      required: state.context.required,
      defaultChecked: isChecked,
      disabled: isDisabled,
      "data-disabled": dataAttr(isDisabled),
      "aria-labelledby": dom.getLabelId(state.context),
      "aria-invalid": state.context.invalid,
      name: state.context.name,
      form: state.context.form,
      value: state.context.value,
      style: visuallyHiddenStyle,
      onChange(event) {
        const checked = event.currentTarget.checked
        send({ type: "CHECKED.SET", checked, isTrusted: true })
      },
      onBlur() {
        send({ type: "CONTEXT.SET", context: { focused: false } })
      },
      onFocus() {
        send({ type: "CONTEXT.SET", context: { focused: true } })
      },
      onKeyDown(event) {
        if (event.key === " ") {
          send({ type: "CONTEXT.SET", context: { active: true } })
        }
      },
      onKeyUp(event) {
        if (event.key === " ") {
          send({ type: "CONTEXT.SET", context: { active: false } })
        }
      },
    }),
  }
}
