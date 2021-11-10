import { StateMachine as S } from "@ui-machines/core"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/prop-types"
import { dataAttr } from "../utils/dom-attr"
import { getEventKey } from "../utils/keyboard-event"
import { EventKeyMap } from "../utils/types"
import { validateBlur } from "../utils/validate-blur"
import { dom } from "./tags-input.dom"
import { TagsInputMachineContext, TagsInputMachineState } from "./tags-input.machine"

type TagProps = {
  index: string | number
  value: string
}

export function tagsInputConnect<T extends PropTypes = ReactPropTypes>(
  state: S.State<TagsInputMachineContext, TagsInputMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const { context: ctx } = state

  const isInputFocused = state.matches("focused:input", "navigating:tag")
  const isEditingTag = state.matches("editing:tag")

  return {
    value: ctx.value,
    valueAsString: ctx.valueAsString,

    rootProps: normalize.element<T>({
      "data-count": ctx.value.length,
      "data-disabled": dataAttr(ctx.disabled),
      "data-focus": dataAttr(isInputFocused),
      id: dom.getRootId(ctx),
      onPointerDown() {
        send("POINTER_DOWN")
      },
    }),

    inputProps: normalize.input<T>({
      id: dom.getInputId(ctx),
      value: ctx.inputValue,
      autoComplete: "off",
      disabled: ctx.disabled,
      onChange(event) {
        const evt = (event.nativeEvent || event) as InputEvent
        if (evt.isComposing || evt.inputType === "insertFromPaste") return
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
      onPaste(event) {
        const value = event.clipboardData.getData("text/plain")
        send({ type: "PASTE", value })
      },
      onKeyDown(event) {
        const evt = event.nativeEvent || event
        if (evt.isComposing) return
        const keyMap: EventKeyMap = {
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

    hiddenInputProps: normalize.input<T>({
      type: "hidden",
      name: ctx.name,
      id: ctx.uid,
      value: ctx.valueAsString,
    }),

    getTagProps({ index, value }: TagProps) {
      const id = dom.getTagId(ctx, index)
      return normalize.element<T>({
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
      return normalize.input<T>({
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
          const keyMap: EventKeyMap = {
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
      return normalize.button<T>({
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
