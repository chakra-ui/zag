import type { Service } from "@zag-js/core"
import { ariaAttr, dataAttr, isApple, isComposingEvent } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./editable.anatomy"
import * as dom from "./editable.dom"
import type { EditableApi, EditableSchema } from "./editable.types"

export function connect<T extends PropTypes>(
  service: Service<EditableSchema>,
  normalize: NormalizeProps<T>,
): EditableApi<T> {
  const { state, context, send, prop, scope, computed } = service
  const disabled = prop("disabled")
  const interactive = computed("isInteractive")
  const readOnly = prop("readOnly")
  const invalid = prop("invalid")
  const autoResize = prop("autoResize")
  const translations = prop("translations")

  const editing = state.matches("edit")

  const placeholderProp = prop("placeholder")
  const placeholder =
    typeof placeholderProp === "string" ? { edit: placeholderProp, preview: placeholderProp } : placeholderProp

  const value = context.get("value")
  const empty = value.trim() === ""

  const valueText = empty ? (placeholder?.preview ?? "") : value

  return {
    editing,
    empty,
    value,
    valueText,
    setValue(value) {
      send({ type: "VALUE.SET", value, src: "setValue" })
    },
    clearValue() {
      send({ type: "VALUE.SET", value: "", src: "clearValue" })
    },
    edit() {
      if (!interactive) return
      send({ type: "EDIT" })
    },
    cancel() {
      if (!interactive) return
      send({ type: "CANCEL" })
    },
    submit() {
      if (!interactive) return
      send({ type: "SUBMIT" })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        dir: prop("dir"),
      })
    },

    getAreaProps() {
      return normalize.element({
        ...parts.area.attrs,
        id: dom.getAreaId(scope),
        dir: prop("dir"),
        style: autoResize ? { display: "inline-grid" } : undefined,
        "data-focus": dataAttr(editing),
        "data-disabled": dataAttr(disabled),
        "data-placeholder-shown": dataAttr(empty),
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        id: dom.getLabelId(scope),
        dir: prop("dir"),
        htmlFor: dom.getInputId(scope),
        "data-focus": dataAttr(editing),
        "data-invalid": dataAttr(invalid),
        onClick() {
          if (editing) return
          const previewEl = dom.getPreviewEl(scope)
          previewEl?.focus({ preventScroll: true })
        },
      })
    },

    getInputProps() {
      return normalize.input({
        ...parts.input.attrs,
        dir: prop("dir"),
        "aria-label": translations?.input,
        name: prop("name"),
        form: prop("form"),
        id: dom.getInputId(scope),
        hidden: autoResize ? undefined : !editing,
        placeholder: placeholder?.edit,
        maxLength: prop("maxLength"),
        required: prop("required"),
        disabled: disabled,
        "data-disabled": dataAttr(disabled),
        readOnly: readOnly,
        "data-readonly": dataAttr(readOnly),
        "aria-invalid": ariaAttr(invalid),
        "data-invalid": dataAttr(invalid),
        "data-autoresize": dataAttr(autoResize),
        defaultValue: value,
        size: autoResize ? 1 : undefined,
        onChange(event) {
          send({
            type: "VALUE.SET",
            src: "input.change",
            value: event.currentTarget.value,
          })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (isComposingEvent(event)) return

          const keyMap: EventKeyMap = {
            Escape() {
              send({ type: "CANCEL" })
              event.preventDefault()
            },
            Enter(event) {
              if (!computed("submitOnEnter")) return
              const { localName } = event.currentTarget

              // when used as a textarea, we want to allow the user to enter a newline
              if (localName === "textarea") {
                const submitMod = isApple() ? event.metaKey : event.ctrlKey
                if (!submitMod) return
                send({ type: "SUBMIT", src: "keydown.enter" })
                return
              }

              // when used as an input, we want to submit the form
              if (localName === "input" && !event.shiftKey && !event.metaKey) {
                send({ type: "SUBMIT", src: "keydown.enter" })
                event.preventDefault()
              }
            },
          }

          const exec = keyMap[event.key]

          if (exec) {
            exec(event)
          }
        },
        style: autoResize
          ? {
              gridArea: "1 / 1 / auto / auto",
              visibility: !editing ? "hidden" : undefined,
            }
          : undefined,
      })
    },

    getPreviewProps() {
      return normalize.element({
        id: dom.getPreviewId(scope),
        ...parts.preview.attrs,
        dir: prop("dir"),
        "data-placeholder-shown": dataAttr(empty),
        "aria-readonly": ariaAttr(readOnly),
        "data-readonly": dataAttr(disabled),
        "data-disabled": dataAttr(disabled),
        "aria-disabled": ariaAttr(disabled),
        "aria-invalid": ariaAttr(invalid),
        "data-invalid": dataAttr(invalid),
        "aria-label": translations?.edit,
        "data-autoresize": dataAttr(autoResize),
        children: valueText,
        hidden: autoResize ? undefined : editing,
        tabIndex: interactive ? 0 : undefined,
        onClick() {
          if (!interactive) return
          if (prop("activationMode") !== "click") return
          send({ type: "EDIT", src: "click" })
        },
        onFocus() {
          if (!interactive) return
          if (prop("activationMode") !== "focus") return
          send({ type: "EDIT", src: "focus" })
        },
        onDoubleClick(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
          if (prop("activationMode") !== "dblclick") return
          send({ type: "EDIT", src: "dblclick" })
        },
        style: autoResize
          ? {
              whiteSpace: "pre",
              userSelect: "none",
              gridArea: "1 / 1 / auto / auto",
              visibility: editing ? "hidden" : undefined,
              // in event the preview overflow's the parent element
              overflow: "hidden",
              textOverflow: "ellipsis",
            }
          : undefined,
      })
    },

    getEditTriggerProps() {
      return normalize.button({
        ...parts.editTrigger.attrs,
        id: dom.getEditTriggerId(scope),
        dir: prop("dir"),
        "aria-label": translations?.edit,
        hidden: editing,
        type: "button",
        disabled: disabled,
        onClick(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
          send({ type: "EDIT", src: "edit.click" })
        },
      })
    },

    getControlProps() {
      return normalize.element({
        id: dom.getControlId(scope),
        ...parts.control.attrs,
        dir: prop("dir"),
      })
    },

    getSubmitTriggerProps() {
      return normalize.button({
        ...parts.submitTrigger.attrs,
        dir: prop("dir"),
        id: dom.getSubmitTriggerId(scope),
        "aria-label": translations?.submit,
        hidden: !editing,
        disabled: disabled,
        type: "button",
        onClick(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
          send({ type: "SUBMIT", src: "submit.click" })
        },
      })
    },

    getCancelTriggerProps() {
      return normalize.button({
        ...parts.cancelTrigger.attrs,
        dir: prop("dir"),
        "aria-label": translations?.cancel,
        id: dom.getCancelTriggerId(scope),
        hidden: !editing,
        type: "button",
        disabled: disabled,
        onClick(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
          send({ type: "CANCEL", src: "cancel.click" })
        },
      })
    },
  }
}
