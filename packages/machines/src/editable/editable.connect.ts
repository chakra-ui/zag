import { StateMachine as S } from "@ui-machines/core"
import { ariaAttr, defaultPropNormalizer, validateBlur } from "../utils"
import type { DOM, Props } from "../utils/types"
import { dom } from "./editable.dom"
import { EditableMachineContext, EditableMachineState } from "./editable.machine"

export function editableConnect(
  state: S.State<EditableMachineContext, EditableMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const isEditing = state.matches("edit")

  const isInteractive = !(ctx.disabled || ctx.readonly)
  const tabIndex = isInteractive && ctx.isPreviewFocusable ? 0 : undefined

  return {
    isEditing,
    isValueEmpty: ctx.value === "",

    inputProps: normalize<Props.Input>({
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
          send("CLICK_OUTSIDE")
        }
      },
      onChange(event) {
        send({ type: "TYPE", value: event.currentTarget.value })
      },
      onKeyDown(event) {
        const keyMap: DOM.EventKeyMap = {
          Escape() {
            send("CANCEL")
          },
          Enter(event) {
            if (!event.shiftKey && !event.metaKey) {
              send("SUBMIT")
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

    previewProps: normalize<Props.Element>({
      children: ctx.value === "" ? ctx.placeholder : ctx.value,
      hidden: isEditing,
      "aria-disabled": ariaAttr(ctx.disabled),
      tabIndex,
      onFocus() {
        send("FOCUS")
      },
      onDoubleClick() {
        send("DBLCLICK")
      },
    }),

    editButtonProps: normalize<Props.Button>({
      id: dom.getEditBtnId(ctx),
      "aria-label": "Submit",
      type: "button",
      onClick() {
        send("EDIT")
      },
    }),

    submitButtonProps: normalize<Props.Button>({
      id: dom.getSubmitBtnId(ctx),
      "aria-label": "Submit",
      type: "button",
      onClick() {
        send("SUBMIT")
      },
    }),

    cancelButtonProps: normalize<Props.Button>({
      "aria-label": "Cancel",
      id: dom.getCancelBtnId(ctx),
      type: "button",
      onClick() {
        send("CANCEL")
      },
    }),
  }
}
