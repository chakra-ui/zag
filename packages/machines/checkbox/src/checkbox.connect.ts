import { normalizeProp, PropTypes, ReactPropTypes } from "@zag-js/types"
import { dataAttr, visuallyHiddenStyle } from "@zag-js/dom-utils"
import { State, Send } from "./checkbox.types"
import { dom } from "./checkbox.dom"
import { utils } from "./checkbox.utils"

export function connect<T extends PropTypes = ReactPropTypes>(state: State, send: Send, normalize = normalizeProp) {
  const isChecked = state.matches("checked")

  const isInteractive = state.context.isInteractive

  const isIndeterminate = state.context.indeterminate
  const isDisabled = state.context.disabled
  const isInvalid = state.context.invalid
  const isReadOnly = state.context.readonly
  const isRequired = state.context.required
  const isFocusable = state.context.focusable

  const isActive = state.context.active
  const isHovered = state.context.hovered
  const isFocused = !isDisabled && state.context.focused

  const ariaLabel = state.context["aria-label"]
  const ariaLabelledBy = state.context["aria-labelledby"] ?? dom.getLabelId(state.context)
  const ariaDescribedBy = state.context["aria-describedby"]
  const ariaChecked = isIndeterminate ? "mixed" : isChecked

  const name = state.context.name
  const value = state.context.value

  const trulyDisabled = isDisabled && !isFocusable

  const stateView = state.value && state.value !== "unknown" ? state.value : "unchecked"
  const view = state.context.indeterminate ? "mixed" : stateView

  return {
    view,
    isChecked,
    isIndeterminate,
    isFocused,
    setChecked(checked: boolean) {
      send({ type: "SET_STATE", checked, manual: true })
    },
    setIndeterminate(indeterminate: boolean) {
      send({ type: "SET_INDETERMINATE", indeterminate })
    },

    rootProps: normalize.element<T>({
      "data-part": "root",
      id: dom.getRootId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-checked": dataAttr(isChecked),
      "data-hover": dataAttr(isHovered),
      "data-invalid": dataAttr(isInvalid),
      "data-readonly": dataAttr(isReadOnly),
      onPointerMove() {
        if (!isInteractive) return
        send({ type: "SET_HOVERED", hovered: true })
      },
      onPointerLeave() {
        if (!isInteractive) return
        send({ type: "SET_HOVERED", hovered: false })
      },
      onPointerDown() {
        if (!isInteractive) return
        // On mousedown, the input blurs and returns focus to the `body`,
        // we need to prevent this. Native checkboxes keeps focus on `input`
        // event.preventDefault();
        send({ type: "SET_ACTIVE", active: true })
      },
      onPointerUp() {
        if (!isInteractive) return
        send({ type: "SET_ACTIVE", active: false })
      },
    }),

    labelProps: normalize.label<T>({
      "data-part": "label",
      htmlFor: dom.getInputId(state.context),
      id: dom.getLabelId(state.context),
      "data-hover": dataAttr(isHovered),
      "data-readonly": dataAttr(isReadOnly),
      "data-disabled": dataAttr(isDisabled),
      "data-checked": dataAttr(isChecked),
      "data-invalid": dataAttr(isInvalid),
      onPointerDown(event) {
        if (!isInteractive) return
        utils.stopEvent(event)
      },
    }),

    controlProps: normalize.element<T>({
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

    inputProps: normalize.input<T>({
      "data-part": "input",
      id: dom.getInputId(state.context),
      type: "checkbox",
      required: isRequired,
      checked: isChecked,
      disabled: trulyDisabled,
      readOnly: isReadOnly,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-invalid": isInvalid,
      "aria-checked": ariaChecked,
      "aria-describedby": ariaDescribedBy,
      "aria-disabled": isDisabled,
      name,
      value,
      style: visuallyHiddenStyle,
      onChange(event) {
        send({ type: "TOGGLE", event })
      },
      onBlur() {
        send({ type: "SET_FOCUSED", focused: false })
      },
      onFocus() {
        send({ type: "SET_FOCUSED", focused: true })
      },
      onKeyDown(event) {
        if (event.key === " ") {
          send({ type: "SET_ACTIVE", active: true })
        }
      },
      onKeyUp(event) {
        if (event.key === " ") {
          send({ type: "SET_ACTIVE", active: false })
        }
      },
    }),
  }
}
