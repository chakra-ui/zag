import { ariaAttr, dataAttr, EventKeyMap, validateBlur } from "@zag-js/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@zag-js/types"
import { dom } from "./editable.dom"
import { Send, State } from "./editable.types"

export function connect<T extends PropTypes = ReactPropTypes>(state: State, send: Send, normalize = normalizeProp) {
  const isDisabled = state.context.disabled
  const isInteractive = state.context.isInteractive
  const isReadonly = state.context.readonly
  const isValueEmpty = state.context.isValueEmpty
  const isInvalid = state.context.invalid

  const pointerdownNode = state.context.pointerdownNode
  const autoResize = state.context.autoResize
  const messages = state.context.messages

  const isEditing = state.matches("edit")
  const _placeholder = state.context.placeholder
  const placeholder = typeof _placeholder === "string" ? { edit: _placeholder, preview: _placeholder } : _placeholder

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
    cancel() {
      if (!isInteractive) return
      send("CANCEL")
    },
    submit() {
      if (!isInteractive) return
      send("SUBMIT")
    },

    rootProps: normalize.element<T>({
      "data-part": "root",
      id: dom.getRootId(state.context),
    }),

    areaProps: normalize.element<T>({
      "data-part": "area",
      id: dom.getAreaId(state.context),
      style: autoResize ? { display: "inline-grid" } : undefined,
      "data-focus": dataAttr(isEditing),
      "data-disabled": dataAttr(isDisabled),
      "data-placeholder-shown": dataAttr(isValueEmpty),
    }),

    labelProps: normalize.label<T>({
      "data-part": "label",
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

    inputProps: normalize.input<T>({
      "data-part": "input",
      "aria-label": messages.input,
      name: state.context.name,
      id: dom.getInputId(state.context),
      hidden: autoResize ? undefined : !isEditing,
      placeholder: placeholder?.edit,
      disabled: isDisabled,
      "data-disabled": dataAttr(isDisabled),
      readOnly: isReadonly,
      "data-readonly": dataAttr(isReadonly),
      "aria-invalid": ariaAttr(isInvalid),
      "data-invalid": dataAttr(isInvalid),
      value: state.context.value,
      size: autoResize ? 1 : undefined,
      onBlur(event) {
        const isValidBlur = validateBlur(event, {
          exclude: [dom.getCancelBtnEl(state.context), dom.getSubmitBtnEl(state.context)],
          fallback: pointerdownNode,
        })
        if (isValidBlur) {
          send("BLUR")
        }
      },
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

    previewProps: normalize.element<T>({
      id: dom.getPreviewId(state.context),
      "data-part": "preview",
      "data-placeholder-shown": dataAttr(isValueEmpty),
      "aria-readonly": ariaAttr(isReadonly),
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

    editButtonProps: normalize.button<T>({
      "data-part": "edit-button",
      id: dom.getEditBtnId(state.context),
      "aria-label": messages.edit,
      type: "button",
      disabled: isDisabled,
      onClick() {
        if (!isInteractive) return
        send("EDIT")
      },
    }),

    controlGroupProps: normalize.element<T>({
      id: dom.getControlGroupId(state.context),
      "data-part": "control-group",
    }),

    submitButtonProps: normalize.button<T>({
      "data-part": "submit-button",
      id: dom.getSubmitBtnId(state.context),
      "aria-label": messages.submit,
      disabled: isDisabled,
      type: "button",
      onClick() {
        if (!isInteractive) return
        send("SUBMIT")
      },
    }),

    cancelButtonProps: normalize.button<T>({
      "data-part": "cancel-button",
      "aria-label": messages.cancel,
      id: dom.getCancelBtnId(state.context),
      type: "button",
      disabled: isDisabled,
      onClick() {
        if (!isInteractive) return
        send("CANCEL")
      },
    }),
  }
}
