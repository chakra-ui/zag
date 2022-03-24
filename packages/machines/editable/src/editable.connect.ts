import { ariaAttr, dataAttr, EventKeyMap, validateBlur } from "@ui-machines/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./editable.dom"
import { Send, State } from "./editable.types"

export function connect<T extends PropTypes = ReactPropTypes>(state: State, send: Send, normalize = normalizeProp) {
  const pointerdownNode = state.context.pointerdownNode
  const isDisabled = state.context.disabled
  const autoResize = state.context.autoResize
  const isEditing = state.matches("edit")

  return {
    isEditing,
    isValueEmpty: state.context.isValueEmpty,
    value: state.context.value,
    setValue(value: string) {
      send({ type: "SET_VALUE", value })
    },
    edit() {
      send("EDIT")
    },
    cancel() {
      send("CANCEL")
    },
    submit() {
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
      "data-focus": dataAttr(!isEditing),
      "data-disabled": dataAttr(isDisabled),
      "data-empty": dataAttr(state.context.isValueEmpty),
    }),

    inputProps: normalize.input<T>({
      "data-part": "input",
      "aria-label": state.context["aria-label"],
      name: state.context.name,
      id: dom.getInputId(state.context),
      hidden: autoResize ? undefined : !isEditing,
      placeholder: state.context.placeholder,
      disabled: isDisabled,
      "aria-disabled": isDisabled,
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
      "data-empty": dataAttr(state.context.isValueEmpty),
      children: state.context.isValueEmpty ? state.context.placeholder : state.context.value,
      hidden: autoResize ? undefined : isEditing,
      "aria-disabled": ariaAttr(isDisabled),
      tabIndex: state.context.isInteractive && state.context.isPreviewFocusable ? 0 : undefined,
      onFocus() {
        send("FOCUS")
      },
      onDoubleClick() {
        send("DBLCLICK")
      },
      style: autoResize
        ? {
            whiteSpace: "pre",
            userSelect: "none",
            gridArea: "1 / 1 / auto / auto",
            visibility: isEditing ? "hidden" : undefined,
            ...(state.context.maxWidth && {
              maxWidth: state.context.maxWidth,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }),
          }
        : undefined,
    }),

    editButtonProps: normalize.button<T>({
      "data-part": "edit-button",
      id: dom.getEditBtnId(state.context),
      "aria-label": "Submit",
      type: "button",
      onClick() {
        send("EDIT")
      },
    }),

    submitButtonProps: normalize.button<T>({
      "data-part": "submit-button",
      id: dom.getSubmitBtnId(state.context),
      "aria-label": "Submit",
      type: "button",
      onClick() {
        send("SUBMIT")
      },
    }),

    cancelButtonProps: normalize.button<T>({
      "data-part": "cancel-button",
      "aria-label": "Cancel",
      id: dom.getCancelBtnId(state.context),
      type: "button",
      onClick() {
        send("CANCEL")
      },
    }),
  }
}
