import { dataAttr, getEventTarget, visuallyHiddenStyle } from "@zag-js/dom-query"
import { isFocusVisible } from "@zag-js/focus-visible"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./switch.anatomy"
import * as dom from "./switch.dom"
import type { SwitchApi, SwitchService } from "./switch.types"

export function connect<T extends PropTypes>(service: SwitchService, normalize: NormalizeProps<T>): SwitchApi<T> {
  const { context, send, prop, scope } = service

  const disabled = prop("disabled")
  const readOnly = prop("readOnly")
  const checked = !!context.get("checked")

  const focused = !disabled && context.get("focused")
  const focusVisible = !disabled && context.get("focusVisible")

  const dataAttrs = {
    "data-active": dataAttr(context.get("active")),
    "data-focus": dataAttr(focused),
    "data-focus-visible": dataAttr(focusVisible),
    "data-readonly": dataAttr(readOnly),
    "data-hover": dataAttr(context.get("hovered")),
    "data-disabled": dataAttr(disabled),
    "data-state": checked ? "checked" : "unchecked",
    "data-invalid": dataAttr(prop("invalid")),
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

    getRootProps() {
      return normalize.label({
        ...parts.root.attrs,
        ...dataAttrs,
        dir: prop("dir"),
        id: dom.getRootId(scope),
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
          if (disabled) return
          const target = getEventTarget<Element>(event)
          if (target === dom.getHiddenInputEl(scope)) {
            event.stopPropagation()
          }
        },
      })
    },

    getLabelProps() {
      return normalize.element({
        ...parts.label.attrs,
        ...dataAttrs,
        dir: prop("dir"),
        id: dom.getLabelId(scope),
      })
    },

    getThumbProps() {
      return normalize.element({
        ...parts.thumb.attrs,
        ...dataAttrs,
        dir: prop("dir"),
        id: dom.getThumbId(scope),
        "aria-hidden": true,
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        ...dataAttrs,
        dir: prop("dir"),
        id: dom.getControlId(scope),
        "aria-hidden": true,
      })
    },

    getHiddenInputProps() {
      return normalize.input({
        id: dom.getHiddenInputId(scope),
        type: "checkbox",
        required: prop("required"),
        defaultChecked: checked,
        disabled: disabled,
        "aria-labelledby": dom.getLabelId(scope),
        "aria-invalid": prop("invalid"),
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
