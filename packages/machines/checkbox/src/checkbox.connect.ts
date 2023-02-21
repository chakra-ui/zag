import { visuallyHiddenStyle } from "@zag-js/visually-hidden"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { dom } from "./checkbox.dom"
import { parts } from "./checkbox.anatomy"
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

    rootProps: normalize.label({
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
      htmlFor: dom.getInputId(state.context),
      "data-focus": isFocused || undefined,
      "data-disabled": isDisabled || undefined,
      "data-checked": isChecked || undefined,
      "data-hover": isHovered || undefined,
      "data-invalid": isInvalid || undefined,
      "data-readonly": isReadOnly || undefined,
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
      "data-focus": isFocused || undefined,
      "data-hover": isHovered || undefined,
      "data-readonly": isReadOnly || undefined,
      "data-disabled": isDisabled || undefined,
      "data-checked": isChecked || undefined,
      "data-invalid": isInvalid || undefined,
      onPointerDown(event) {
        if (!isInteractive) return
        // On pointerdown, the input blurs and returns focus to the `body`,
        // we need to prevent this.
        if (isFocused) event.preventDefault()
        event.stopPropagation()
      },
    }),

    controlProps: normalize.element({
      ...parts.control.attrs,
      id: dom.getControlId(state.context),
      "data-focus": isFocused || undefined,
      "data-disabled": isDisabled || undefined,
      "data-hover": isHovered || undefined,
      "data-indeterminate": isIndeterminate || undefined,
      "data-invalid": isInvalid || undefined,
      "data-checked": isChecked || undefined,
      "data-readonly": isReadOnly || undefined,
      "aria-hidden": true,
      "data-active": isActive || undefined,
    }),

    inputProps: normalize.input({
      ...parts.input.attrs,
      id: dom.getInputId(state.context),
      type: "checkbox",
      required: isRequired,
      defaultChecked: isChecked,
      disabled: trulyDisabled,
      "data-disabled": isDisabled || undefined,
      "aria-readonly": isReadOnly || undefined,
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
