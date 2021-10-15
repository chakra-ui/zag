import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, defaultPropNormalizer } from "../utils/dom-attr"
import { getEventKey } from "../utils/keyboard-event"
import { DOM, Props } from "../utils/types"
import { validateBlur } from "../utils/validate-blur"
import { dom } from "./tags-input.dom"
import { TagsInputMachineContext, TagsInputMachineState } from "./tags-input.machine"

type TagProps = {
  index: string | number
  value: string
}

export function tagsInputConnect(
  state: S.State<TagsInputMachineContext, TagsInputMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state

  const isInputFocused = state.matches("focused:input", "navigating:tag")
  const isEditingTag = state.matches("editing:tag")

  return {
    value: ctx.value,
    valueAsString: ctx.valueAsString,

    rootProps: normalize<Props.Element>({
      "data-count": ctx.value.length,
      "data-disabled": dataAttr(ctx.disabled),
      "data-focus": dataAttr(isInputFocused),
      id: dom.getRootId(ctx),
      onPointerDown() {
        send("POINTER_DOWN")
      },
    }),

    inputProps: normalize<Props.Input>({
      id: dom.getInputId(ctx),
      value: ctx.inputValue,
      autoComplete: "off",
      disabled: ctx.disabled,
      onChange(event) {
        send({ type: "TYPE", value: event.target.value })
      },
      onFocus() {
        send("FOCUS")
      },
      onBlur(event) {
        const isValidBlur = validateBlur(event, {
          exclude: dom.getRootEl(ctx),
        })
        if (isValidBlur) {
          send("BLUR")
        }
      },
      onPaste() {
        send("PASTE")
      },
      onKeyDown(event) {
        const keyMap: DOM.EventKeyMap = {
          ArrowDown() {
            send("ARROW_DOWN")
          },
          ArrowLeft() {
            send("ARROW_LEFT")
          },
          ArrowRight() {
            if (ctx.focusedId) {
              event.preventDefault()
            }
            send("ARROW_RIGHT")
          },
          Escape(event) {
            event.preventDefault()
            send("ESCAPE")
          },
          Backspace() {
            send("BACKSPACE")
          },
          Delete() {
            send("DELETE")
          },
          Comma(event) {
            event.preventDefault()
            send("COMMA")
          },
          Enter(event) {
            event.preventDefault()
            send("ENTER")
          },
        }

        const key = getEventKey(event, ctx)
        const exec = keyMap[key]
        exec?.(event)
      },
    }),

    hiddenInputProps: normalize<Props.Input>({
      type: "hidden",
      name: ctx.name,
      id: ctx.uid,
      value: ctx.valueAsString,
    }),

    getTagProps({ index, value }: TagProps) {
      const id = dom.getTagId(ctx, index)
      return normalize<Props.Element>({
        id,
        hidden: isEditingTag ? ctx.editedId === id : false,
        "data-value": value,
        "data-disabled": dataAttr(ctx.disabled),
        "data-selected": dataAttr(id === ctx.focusedId),
        "data-ownedby": dom.getRootId(ctx),
        onPointerDown(event) {
          event.preventDefault()
          send({ type: "POINTER_DOWN_TAG", id })
        },
        onDoubleClick() {
          send({ type: "DOUBLE_CLICK_TAG", id })
        },
      })
    },

    getTagInputProps({ index }: { index: number }) {
      const id = dom.getTagId(ctx, index)
      const active = ctx.editedId === id
      return normalize<Props.Input>({
        id: `${id}-input`,
        type: "text",
        tabIndex: -1,
        hidden: isEditingTag ? !active : true,
        value: active ? ctx.editedTagValue : "",
        onChange(event) {
          send({ type: "TAG_INPUT_TYPE", value: event.target.value })
        },
        onBlur() {
          send("TAG_INPUT_BLUR")
        },
        onKeyDown(event) {
          const keyMap: DOM.EventKeyMap = {
            Enter() {
              send("TAG_INPUT_ENTER")
            },
            Escape() {
              send("TAG_INPUT_ESCAPE")
            },
          }

          const exec = keyMap[event.key]

          if (exec) {
            event.preventDefault()
            exec(event)
          }
        },
      })
    },

    getTagDeleteButtonProps({ index, value }: TagProps) {
      return normalize<Props.Button>({
        id: dom.getTagDeleteBtnId(ctx, index),
        type: "button",
        "aria-label": `Delete ${value}`,
        tabIndex: -1,
        onClick() {
          send({
            type: "DELETE_TAG",
            id: dom.getTagId(ctx, index),
          })
        },
      })
    },
  }
}
