import { type EventKeyMap } from "@zag-js/dom-event"
import { ariaAttr, dataAttr, isComposingEvent, isModKey } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./editable.anatomy"
import { dom } from "./editable.dom"
import type { MachineApi, Send, State } from "./editable.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const disabled = state.context.disabled
  const interactive = state.context.isInteractive
  const readOnly = state.context.readOnly
  const empty = state.context.isValueEmpty
  const invalid = state.context.invalid

  const autoResize = state.context.autoResize
  const translations = state.context.translations

  const editing = state.matches("edit")

  const placeholderProp = state.context.placeholder
  const placeholder =
    typeof placeholderProp === "string" ? { edit: placeholderProp, preview: placeholderProp } : placeholderProp

  const value = state.context.value
  const valueText = empty ? placeholder?.preview ?? "" : value

  return {
    editing,
    empty,
    value,
    valueText,
    setValue(value) {
      send({ type: "SET_VALUE", value })
    },
    clearValue() {
      send({ type: "SET_VALUE", value: "" })
    },
    edit() {
      if (!interactive) return
      send("EDIT")
    },
    cancel() {
      if (!interactive) return
      send("CANCEL")
    },
    submit() {
      if (!interactive) return
      send("SUBMIT")
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(state.context),
        dir: state.context.dir,
      })
    },

    getAreaProps() {
      return normalize.element({
        ...parts.area.attrs,
        id: dom.getAreaId(state.context),
        dir: state.context.dir,
        style: autoResize ? { display: "inline-grid" } : undefined,
        "data-focus": dataAttr(editing),
        "data-disabled": dataAttr(disabled),
        "data-placeholder-shown": dataAttr(empty),
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        id: dom.getLabelId(state.context),
        dir: state.context.dir,
        htmlFor: dom.getInputId(state.context),
        "data-focus": dataAttr(editing),
        "data-invalid": dataAttr(invalid),
        onClick() {
          if (editing) return
          const previewEl = dom.getPreviewEl(state.context)
          previewEl?.focus({ preventScroll: true })
        },
      })
    },

    getInputProps() {
      return normalize.input({
        ...parts.input.attrs,
        dir: state.context.dir,
        "aria-label": translations.input,
        name: state.context.name,
        form: state.context.form,
        id: dom.getInputId(state.context),
        hidden: autoResize ? undefined : !editing,
        placeholder: placeholder?.edit,
        maxLength: state.context.maxLength,
        required: state.context.required,
        disabled: disabled,
        "data-disabled": dataAttr(disabled),
        readOnly: readOnly,
        "data-readonly": dataAttr(readOnly),
        "aria-invalid": ariaAttr(invalid),
        "data-invalid": dataAttr(invalid),
        defaultValue: value,
        size: autoResize ? 1 : undefined,
        onChange(event) {
          send({ type: "TYPE", value: event.currentTarget.value })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (isComposingEvent(event)) return

          const keyMap: EventKeyMap = {
            Escape() {
              send("CANCEL")
              event.preventDefault()
            },
            Enter(event) {
              if (!state.context.submitOnEnter) return
              const { localName } = event.currentTarget

              // when used as a textarea, we want to allow the user to enter a newline
              if (localName === "textarea") {
                if (!isModKey(event)) return
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
              all: "unset",
              gridArea: "1 / 1 / auto / auto",
              visibility: !editing ? "hidden" : undefined,
            }
          : undefined,
      })
    },

    getPreviewProps() {
      return normalize.element({
        id: dom.getPreviewId(state.context),
        ...parts.preview.attrs,
        dir: state.context.dir,
        "data-placeholder-shown": dataAttr(empty),
        "aria-readonly": ariaAttr(readOnly),
        "data-readonly": dataAttr(disabled),
        "data-disabled": dataAttr(disabled),
        "aria-disabled": ariaAttr(disabled),
        "aria-invalid": ariaAttr(invalid),
        "data-invalid": dataAttr(invalid),
        children: valueText,
        hidden: autoResize ? undefined : editing,
        tabIndex: interactive && state.context.isPreviewFocusable ? 0 : undefined,
        onFocus() {
          if (!interactive) return
          if (state.context.activationMode !== "focus") return
          send({ type: "EDIT", src: "focus" })
        },
        onDoubleClick(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
          if (state.context.activationMode !== "dblclick") return
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
        id: dom.getEditTriggerId(state.context),
        dir: state.context.dir,
        "aria-label": translations.edit,
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
        id: dom.getControlId(state.context),
        ...parts.control.attrs,
        dir: state.context.dir,
      })
    },

    getSubmitTriggerProps() {
      return normalize.button({
        ...parts.submitTrigger.attrs,
        dir: state.context.dir,
        id: dom.getSubmitTriggerId(state.context),
        "aria-label": translations.submit,
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
        dir: state.context.dir,
        "aria-label": translations.cancel,
        id: dom.getCancelTriggerId(state.context),
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
