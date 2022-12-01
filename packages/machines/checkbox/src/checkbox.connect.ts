import { ariaAttr, dataAttr, visuallyHiddenStyle } from "@zag-js/dom-utils"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { dom } from "./checkbox.dom"
import type { Send, State } from "./checkbox.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isChecked = state.matches("checked")

  const isInteractive = state.context.isInteractive
  const isIndeterminate = state.context.indeterminate
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

  const stateView = state.matches("checked") ? "checked" : "unchecked"
  const view = state.context.indeterminate ? "mixed" : stateView

  return {
    isChecked,
    isDisabled,
    isIndeterminate,
    isFocused,
    isReadOnly,
    view,
    setChecked(checked: boolean) {
      send({ type: "SET_STATE", checked, manual: true })
    },
    setIndeterminate(indeterminate: boolean) {
      send({ type: "SET_INDETERMINATE", value: indeterminate })
    },

    rootProps: normalize.element({
      "data-part": "root",
      id: dom.getRootId(state.context),
      "data-focus": dataAttr(isFocused),
      "data-disabled": dataAttr(isDisabled),
      "data-checked": dataAttr(isChecked),
      "data-hover": dataAttr(isHovered),
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

    labelProps: normalize.label({
      "data-part": "label",
      htmlFor: dom.getInputId(state.context),
      id: dom.getLabelId(state.context),
      "data-focus": dataAttr(isFocused),
      "data-hover": dataAttr(isHovered),
      "data-readonly": dataAttr(isReadOnly),
      "data-disabled": dataAttr(isDisabled),
      "data-checked": dataAttr(isChecked),
      "data-invalid": dataAttr(isInvalid),
      onPointerDown(event) {
        if (!isInteractive) return
        event.preventDefault()
        event.stopPropagation()
      },
    }),

    controlProps: normalize.element({
      "data-part": "control",
      id: dom.getControlId(state.context),
      "data-focus": dataAttr(isFocused),
      "data-disabled": dataAttr(isDisabled),
      "data-hover": dataAttr(isHovered),
      "data-indeterminate": dataAttr(isIndeterminate),
      "data-invalid": dataAttr(isInvalid),
      "data-checked": dataAttr(isChecked),
      "data-readonly": dataAttr(isReadOnly),
      "aria-hidden": true,
      "data-active": dataAttr(isActive),
    }),

    inputProps: normalize.input({
      "data-part": "input",
      id: dom.getInputId(state.context),
      type: "checkbox",
      required: isRequired,
      defaultChecked: isChecked,
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
