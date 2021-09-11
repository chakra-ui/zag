import { StateMachine as S } from "@ui-machines/core"
import { ariaAttr, defaultPropNormalizer } from "../utils/dom-attr"
import { ButtonProps, EventKeyMap, HTMLProps, InputProps } from "../utils/types"
import { validateBlur } from "../utils/validate-blur"
import { getIds, getElements } from "./editable.dom"
import { EditableMachineContext, EditableMachineState } from "./editable.machine"

export function editableConnect(
  state: S.State<EditableMachineContext, EditableMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const isEditing = state.matches("edit")
  const ids = getIds(ctx.uid)

  const isInteractive = !(ctx.disabled || ctx.readonly)
  const tabIndex = isInteractive && ctx.isPreviewFocusable ? 0 : undefined

  return {
    isEditing,
    isValueEmpty: ctx.value === "",

    inputProps: normalize<InputProps>({
      id: ids.input,
      hidden: !isEditing,
      placeholder: ctx.placeholder,
      disabled: ctx.disabled,
      "aria-disabled": ctx.disabled,
      value: ctx.value,
      onBlur(event) {
        const { cancelBtn, submitBtn } = getElements(ctx)
        const isValidBlur = validateBlur(event, {
          fallback: ctx.pointerdownNode,
          exclude: [cancelBtn, submitBtn],
        })
        if (isValidBlur) {
          send("CLICK_OUTSIDE")
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

    previewProps: normalize<HTMLProps>({
      children: ctx.value === "" ? ctx.placeholder : ctx.value,
      hidden: isEditing,
      "aria-disabled": ariaAttr(ctx.disabled),
      tabIndex,
      onFocus() {
        send("FOCUS")
      },
    }),

    editButtonProps: normalize<ButtonProps>({
      id: ids.editBtn,
      "aria-label": "Submit",
      type: "button",
      onClick() {
        send("EDIT")
      },
    }),

    submitButtonProps: normalize<ButtonProps>({
      id: ids.submitBtn,
      "aria-label": "Submit",
      type: "button",
      onClick() {
        send("SUBMIT")
      },
    }),

    cancelButtonProps: normalize<ButtonProps>({
      "aria-label": "Cancel",
      id: ids.cancelBtn,
      type: "button",
      onClick() {
        send("CANCEL")
      },
    }),
  }
}
