import { dataAttr, visuallyHiddenStyle } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./switch.anatomy"
import { dom } from "./switch.dom"
import type { MachineApi, Send, State } from "./switch.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const disabled = state.context.isDisabled
  const focused = !disabled && state.context.focused
  const checked = state.context.checked

  const dataAttrs = {
    "data-active": dataAttr(state.context.active),
    "data-focus": dataAttr(focused),
    "data-hover": dataAttr(state.context.hovered),
    "data-disabled": dataAttr(disabled),
    "data-state": state.context.checked ? "checked" : "unchecked",
    "data-invalid": dataAttr(state.context.invalid),
  }

  return {
    checked: checked,
    disabled: disabled,
    focused: focused,
    setChecked(checked) {
      send({ type: "CHECKED.SET", checked, isTrusted: false })
    },
    toggleChecked() {
      send({ type: "CHECKED.TOGGLE", checked: checked, isTrusted: false })
    },

    rootProps: normalize.label({
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
    }),

    labelProps: normalize.element({
      ...parts.label.attrs,
      ...dataAttrs,
      dir: state.context.dir,
      id: dom.getLabelId(state.context),
    }),

    thumbProps: normalize.element({
      ...parts.thumb.attrs,
      ...dataAttrs,
      dir: state.context.dir,
      id: dom.getThumbId(state.context),
      "aria-hidden": true,
    }),

    controlProps: normalize.element({
      ...parts.control.attrs,
      ...dataAttrs,
      dir: state.context.dir,
      id: dom.getControlId(state.context),
      "aria-hidden": true,
    }),

    hiddenInputProps: normalize.input({
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
      onChange(event) {
        const checked = event.currentTarget.checked
        send({ type: "CHECKED.SET", checked, isTrusted: true })
      },
    }),
  }
}
