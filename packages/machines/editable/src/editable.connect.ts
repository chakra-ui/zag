import { ariaAttr, EventKeyMap } from "@ui-machines/dom-utils"
import { validateBlur } from "@ui-machines/dom-utils/focus-event"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./editable.dom"
import { EditableSend, EditableState } from "./editable.types"

export function editableConnect<T extends PropTypes = ReactPropTypes>(
  state: EditableState,
  send: EditableSend,
  normalize = normalizeProp,
) {
  const { context: ctx } = state
  const isEditing = state.matches("edit")

  return {
    isEditing,
    isValueEmpty: ctx.isValueEmpty,

    inputProps: normalize.input<T>({
      id: dom.getInputId(ctx),
      hidden: !isEditing,
      placeholder: ctx.placeholder,
      disabled: ctx.disabled,
      "aria-disabled": ctx.disabled,
      value: ctx.value,
      onBlur(event) {
        const isValidBlur = validateBlur(event, {
          exclude: [dom.getCancelBtnEl(ctx), dom.getSubmitBtnEl(ctx)],
          fallback: ctx.pointerdownNode,
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
    }),

    previewProps: normalize.element<T>({
      children: ctx.value === "" ? ctx.placeholder : ctx.value,
      hidden: isEditing,
      "aria-disabled": ariaAttr(ctx.disabled),
      tabIndex: ctx.isInteractive && ctx.isPreviewFocusable ? 0 : undefined,
      onFocus() {
        send("FOCUS")
      },
      onDoubleClick() {
        send("DBLCLICK")
      },
    }),

    editButtonProps: normalize.button<T>({
      id: dom.getEditBtnId(ctx),
      "aria-label": "Submit",
      type: "button",
      onClick() {
        send("EDIT")
      },
    }),

    submitButtonProps: normalize.button<T>({
      id: dom.getSubmitBtnId(ctx),
      "aria-label": "Submit",
      type: "button",
      onClick() {
        send("SUBMIT")
      },
    }),

    cancelButtonProps: normalize.button<T>({
      "aria-label": "Cancel",
      id: dom.getCancelBtnId(ctx),
      type: "button",
      onClick() {
        send("CANCEL")
      },
    }),
  }
}
