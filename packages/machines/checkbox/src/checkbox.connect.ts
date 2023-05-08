import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { visuallyHiddenStyle } from "@zag-js/visually-hidden"
import { parts } from "./checkbox.anatomy"
import { dom } from "./checkbox.dom"
import type { CheckedState, Send, State } from "./checkbox.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isDisabled = state.context.disabled
  const isFocused = !isDisabled && state.context.focused

  const dataAttrs = {
    "data-active": dataAttr(state.context.active),
    "data-focus": dataAttr(isFocused),
    "data-hover": dataAttr(state.context.hovered),
    "data-disabled": dataAttr(isDisabled),
    "data-checked": dataAttr(state.context.isChecked),
    "data-invalid": dataAttr(state.context.invalid),
    "data-indeterminate": dataAttr(state.context.isIndeterminate),
  }

  return {
    /**
     * Whether the checkbox is checked
     */
    isChecked: state.context.isChecked,
    /**
     * Whether the checkbox is disabled
     */
    isDisabled,

    /**
     * Whether the checkbox is indeterminate
     */
    isIndeterminate: state.context.isIndeterminate,
    /**
     * Whether the checkbox is focused
     */
    isFocused,
    /**
     *  The checked state of the checkbox
     */
    checkedState: state.context.checked,
    /**
     * Function to set the checked state of the checkbox
     */
    setChecked(checked: CheckedState) {
      if (isDisabled) return
      send({ type: "CHECKED.SET", checked })
    },

    rootProps: normalize.label({
      ...parts.root.attrs,
      ...dataAttrs,
      id: dom.getRootId(state.context),
      htmlFor: dom.getInputId(state.context),
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

    inputProps: normalize.input({
      ...parts.input.attrs,
      id: dom.getInputId(state.context),
      type: "checkbox",
      required: state.context.required,
      defaultChecked: state.context.isChecked,
      disabled: isDisabled,
      "data-disabled": dataAttr(isDisabled),
      "aria-labelledby": dom.getLabelId(state.context),
      "aria-invalid": state.context.invalid,
      name: state.context.name,
      form: state.context.form,
      value: state.context.value,
      style: visuallyHiddenStyle,
      onChange() {
        send({ type: "CHECKED.TOGGLE" })
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
