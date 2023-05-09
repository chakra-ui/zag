import { ariaAttr, dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { dom } from "./switch.dom"
import type { Send, State } from "./switch.types"
import { parts } from "./switch.anatomy"
import { visuallyHiddenStyle } from "@zag-js/visually-hidden"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isDisabled = state.context.disabled
  const isReadOnly = state.context.readOnly
  const isInteractive = !(isReadOnly || isDisabled)

  const isFocusable = state.context.focusable
  const isFocused = !isDisabled && state.context.focused

  const dataAttrs = {
    "data-active": dataAttr(state.context.active),
    "data-focus": dataAttr(isFocused),
    "data-hover": dataAttr(state.context.hovered),
    "data-readonly": dataAttr(isReadOnly),
    "data-disabled": dataAttr(isDisabled),
    "data-checked": dataAttr(state.context.checked),
    "data-invalid": dataAttr(state.context.invalid),
  }

  const trulyDisabled = isDisabled && !isFocusable

  return {
    /**
     * Whether the checkbox is checked
     */
    isChecked: state.context.checked,
    /**
     * Whether the checkbox is disabled
     */
    isDisabled,
    /**
     * Whether the checkbox is focused
     */
    isFocused,
    /**
     * Whether the checkbox is readonly
     */
    isReadOnly,
    /**
     * Function to set the checked state of the switch.
     */
    setChecked(value: boolean) {
      if (isDisabled) return
      send({ type: "CHECKED.SET", checked: value })
    },

    rootProps: normalize.label({
      ...parts.root.attrs,
      ...dataAttrs,
      id: dom.getRootId(state.context),
      htmlFor: dom.getInputId(state.context),
      onPointerMove() {
        if (!isInteractive) return
        send({ type: "CONTEXT.SET", context: { hovered: true } })
      },
      onPointerLeave() {
        if (!isInteractive) return
        send({ type: "CONTEXT.SET", context: { hovered: false } })
      },
      onPointerDown(event) {
        if (!isInteractive) return
        // On pointerdown, the input blurs and returns focus to the `body`,
        // we need to prevent this.
        if (isFocused) event.preventDefault()
        send({ type: "CONTEXT.SET", context: { active: true } })
      },
      onPointerUp() {
        if (!isInteractive) return
        send({ type: "CONTEXT.SET", context: { active: false } })
      },
    }),

    labelProps: normalize.element({
      ...parts.label.attrs,
      ...dataAttrs,
      id: dom.getLabelId(state.context),
    }),

    thumbProps: normalize.element({
      ...parts.thumb.attrs,
      ...dataAttrs,
      id: dom.getThumbId(state.context),
      "aria-hidden": true,
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
      defaultChecked: state.context.checked,
      "data-focus": dataAttr(isFocused),
      "data-hover": dataAttr(state.context.hovered),
      disabled: trulyDisabled,
      "data-disabled": dataAttr(isDisabled),
      "aria-readonly": ariaAttr(isReadOnly),
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
