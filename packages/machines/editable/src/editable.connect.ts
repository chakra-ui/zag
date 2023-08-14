import type { EventKeyMap } from "@zag-js/dom-event"
import { ariaAttr, dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./editable.anatomy"
import { dom } from "./editable.dom"
import type { MachineApi, Send, State } from "./editable.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isDisabled = state.context.disabled
  const isInteractive = state.context.isInteractive
  const isReadOnly = state.context.readOnly
  const isValueEmpty = state.context.isValueEmpty
  const isInvalid = state.context.invalid

  const autoResize = state.context.autoResize
  const translations = state.context.translations

  const isEditing = state.matches("edit")

  const placeholderProp = state.context.placeholder
  const placeholder =
    typeof placeholderProp === "string" ? { edit: placeholderProp, preview: placeholderProp } : placeholderProp

  return {
    isEditing,
    isValueEmpty: isValueEmpty,
    value: state.context.value,

    setValue(value: string) {
      send({ type: "SET_VALUE", value })
    },

    clearValue() {
      send({ type: "SET_VALUE", value: "" })
    },

    edit() {
      if (!isInteractive) return
      send("EDIT")
    },
    /**
     * Function to exit edit mode, and discard any changes
     */
    cancel() {
      if (!isInteractive) return
      send("CANCEL")
    },

    submit() {
      if (!isInteractive) return
      send("SUBMIT")
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
    }),

    areaProps: normalize.element({
      ...parts.area.attrs,
      id: dom.getAreaId(state.context),
      style: autoResize ? { display: "inline-grid" } : undefined,
      "data-focus": dataAttr(isEditing),
      "data-disabled": dataAttr(isDisabled),
      "data-placeholder-shown": dataAttr(isValueEmpty),
    }),

    labelProps: normalize.label({
      ...parts.label.attrs,
      id: dom.getLabelId(state.context),
      htmlFor: dom.getInputId(state.context),
      "data-focus": dataAttr(isEditing),
      "data-invalid": dataAttr(isInvalid),
      onPointerDown(event) {
        if (!isEditing) {
          event.preventDefault()
          dom.getPreviewEl(state.context)?.focus()
        }
      },
    }),

    inputProps: normalize.input({
      ...parts.input.attrs,
      "aria-label": translations.input,
      name: state.context.name,
      form: state.context.form,
      id: dom.getInputId(state.context),
      hidden: autoResize ? undefined : !isEditing,
      placeholder: placeholder?.edit,
      disabled: isDisabled,
      "data-disabled": dataAttr(isDisabled),
      readOnly: isReadOnly,
      "data-readonly": dataAttr(isReadOnly),
      "aria-invalid": ariaAttr(isInvalid),
      "data-invalid": dataAttr(isInvalid),
      defaultValue: state.context.value,
      size: autoResize ? 1 : undefined,
      onChange(event) {
        send({ type: "TYPE", value: event.currentTarget.value })
      },
      onKeyDown(event) {
        const keyMap: EventKeyMap = {
          Escape() {
            send("CANCEL")
          },
          Enter(event) {
            if (!event.shiftKey && !event.metaKey) {
              send("ENTER")
            }
          },
        }

        const exec = keyMap[event.key]

        if (exec) {
          event.preventDefault()
          exec(event)
        }
      },
      style: autoResize
        ? {
            all: "unset",
            gridArea: "1 / 1 / auto / auto",
            visibility: !isEditing ? "hidden" : undefined,
          }
        : undefined,
    }),

    previewProps: normalize.element({
      id: dom.getPreviewId(state.context),
      ...parts.preview.attrs,
      "data-placeholder-shown": dataAttr(isValueEmpty),
      "aria-readonly": ariaAttr(isReadOnly),
      "data-readonly": dataAttr(isDisabled),
      "data-disabled": dataAttr(isDisabled),
      "aria-disabled": ariaAttr(isDisabled),
      "aria-invalid": ariaAttr(isInvalid),
      "data-invalid": dataAttr(isInvalid),
      children: isValueEmpty ? placeholder?.preview : state.context.value,
      hidden: autoResize ? undefined : isEditing,
      tabIndex: isInteractive && state.context.isPreviewFocusable ? 0 : undefined,
      onFocus() {
        if (!isInteractive) return
        send("FOCUS")
      },
      onDoubleClick() {
        if (!isInteractive) return
        send("DBLCLICK")
      },
      style: autoResize
        ? {
            whiteSpace: "pre",
            userSelect: "none",
            gridArea: "1 / 1 / auto / auto",
            visibility: isEditing ? "hidden" : undefined,
            // in event the preview overflow's the parent element
            overflow: "hidden",
            textOverflow: "ellipsis",
          }
        : undefined,
    }),

    editTriggerProps: normalize.button({
      ...parts.editTrigger.attrs,
      id: dom.getEditTriggerId(state.context),
      "aria-label": translations.edit,
      type: "button",
      disabled: isDisabled,
      onClick() {
        if (!isInteractive) return
        send("EDIT")
      },
    }),

    controlProps: normalize.element({
      id: dom.getControlId(state.context),
      ...parts.control.attrs,
    }),

    submitTriggerProps: normalize.button({
      ...parts.submitTrigger.attrs,
      id: dom.getSubmitTriggerId(state.context),
      "aria-label": translations.submit,
      disabled: isDisabled,
      type: "button",
      onClick() {
        if (!isInteractive) return
        send("SUBMIT")
      },
    }),

    cancelTriggerProps: normalize.button({
      ...parts.cancelTrigger.attrs,
      "aria-label": translations.cancel,
      id: dom.getCancelTriggerId(state.context),
      type: "button",
      disabled: isDisabled,
      onClick() {
        if (!isInteractive) return
        send("CANCEL")
      },
    }),
  }
}
