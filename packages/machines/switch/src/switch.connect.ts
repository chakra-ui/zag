import { ariaAttr, dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { dom } from "./switch.dom"
import type { Send, State } from "./switch.types"
import { parts } from "./switch.anatomy"
import { visuallyHiddenStyle } from "@zag-js/visually-hidden"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isChecked = state.matches("checked")

  const isInteractive = state.context.isInteractive
  const isDisabled = state.context.disabled
  const isInvalid = state.context.invalid
  const isReadOnly = state.context.readOnly
  const isRequired = state.context.required
  const isFocusable = state.context.focusable

  const isActive = state.context.active
  const isHovered = state.context.hovered
  const isFocused = !isDisabled && state.context.focused

  const ariaLabel = state.context["aria-label"]
  const ariaLabelledBy = state.context["aria-labelledby"] ?? dom.getLabelId(state.context)
  const ariaDescribedBy = state.context["aria-describedby"]

  const name = state.context.name
  const form = state.context.form
  const value = state.context.value

  const trulyDisabled = isDisabled && !isFocusable

  return {
    /**
     * Whether the checkbox is checked
     */
    isChecked,
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
      send({ type: "SET_STATE", checked: value })
    },

    rootProps: normalize.label({
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
      htmlFor: dom.getInputId(state.context),
      "data-focus": dataAttr(isFocused),
      "data-hover": dataAttr(isHovered),
      "data-disabled": dataAttr(isDisabled),
      "data-checked": dataAttr(isChecked),
      "data-invalid": dataAttr(isInvalid),
      "data-readonly": dataAttr(isReadOnly),
      onPointerMove() {
        if (!isInteractive) return
        send({ type: "SET_HOVERED", value: true })
      },
      onPointerLeave() {
        if (!isInteractive) return
        send({ type: "SET_HOVERED", value: false })
      },
      onPointerDown(event) {
        if (!isInteractive) return
        // On pointerdown, the input blurs and returns focus to the `body`,
        // we need to prevent this.
        if (isFocused) event.preventDefault()
        send({ type: "SET_ACTIVE", value: true })
      },
      onPointerUp() {
        if (!isInteractive) return
        send({ type: "SET_ACTIVE", value: false })
      },
    }),

    labelProps: normalize.element({
      ...parts.label.attrs,
      id: dom.getLabelId(state.context),
      "data-focus": dataAttr(isFocused),
      "data-hover": dataAttr(isHovered),
      "data-readonly": dataAttr(isReadOnly),
      "data-disabled": dataAttr(isDisabled),
      "data-checked": dataAttr(isChecked),
      "data-invalid": dataAttr(isInvalid),
    }),

    thumbProps: normalize.element({
      ...parts.thumb.attrs,
      id: dom.getThumbId(state.context),
      "data-focus": dataAttr(isFocused),
      "data-hover": dataAttr(isHovered),
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "data-checked": dataAttr(isChecked),
      "data-readonly": dataAttr(isReadOnly),
      "aria-hidden": true,
    }),

    controlProps: normalize.element({
      ...parts.control.attrs,
      id: dom.getControlId(state.context),
      "data-focus": dataAttr(isFocused),
      "data-hover": dataAttr(isHovered),
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "data-checked": dataAttr(isChecked),
      "data-readonly": dataAttr(isReadOnly),
      "aria-hidden": true,
      "data-active": dataAttr(isActive),
    }),

    inputProps: normalize.input({
      ...parts.input.attrs,
      id: dom.getInputId(state.context),
      type: "checkbox",
      required: isRequired,
      defaultChecked: isChecked,
      "data-focus": dataAttr(isFocused),
      "data-hover": dataAttr(isHovered),
      disabled: trulyDisabled,
      "data-disabled": dataAttr(isDisabled),
      "aria-readonly": ariaAttr(isReadOnly),
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-invalid": isInvalid,
      "aria-describedby": ariaDescribedBy,
      name,
      form,
      value,
      style: visuallyHiddenStyle,
      onChange() {
        send({ type: "TOGGLE" })
      },
      onBlur() {
        send({ type: "SET_FOCUSED", value: false })
      },
      onFocus() {
        send({ type: "SET_FOCUSED", value: true })
      },
      onKeyDown(event) {
        if (event.key === " ") {
          send({ type: "SET_ACTIVE", value: true })
        }
      },
      onKeyUp(event) {
        if (event.key === " ") {
          send({ type: "SET_ACTIVE", value: false })
        }
      },
    }),
  }
}
