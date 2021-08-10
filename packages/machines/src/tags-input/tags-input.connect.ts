import { StateMachine as S } from "@ui-machines/core"
import { validateBlur } from "@core-dom/event"
import { determineEventKey, dataAttr, defaultPropNormalizer, PropNormalizer } from "../dom-utils"
import { DOMButtonProps, DOMHTMLProps, DOMInputProps, EventKeyMap, WithDataAttr } from "../type-utils"
import { getElementIds, getElements } from "./tags-input.dom"
import { TagsInputMachineContext, TagsInputMachineState } from "./tags-input.machine"

type TagProps = {
  index: string | number
  value: string
}

export function connectTagsInputMachine(
  state: S.State<TagsInputMachineContext, TagsInputMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize: PropNormalizer = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const ids = getElementIds(ctx.uid)

  const isInputFocused = state.matches("focused:input", "navigating:tag")
  const isEditingTag = state.matches("editing:tag")
  const valueAsString = ctx.value.join(",")

  return {
    value: ctx.value,
    valueAsString,

    rootProps: normalize<WithDataAttr<DOMHTMLProps>>({
      "data-count": ctx.value.length,
      "data-disabled": dataAttr(ctx.disabled),
      "data-focus": dataAttr(isInputFocused),
      id: ids.root,
      onPointerDown() {
        send("POINTER_DOWN")
      },
    }),

    inputProps: normalize<DOMInputProps>({
      id: ids.input,
      value: ctx.inputValue,
      autoComplete: "off",
      onChange(event) {
        send({ type: "TYPE", value: event.target.value })
      },
      onFocus() {
        send("FOCUS")
      },
      onBlur(event) {
        const isValidBlur = validateBlur(event, {
          exclude: getElements(ctx).root,
        })
        if (isValidBlur) {
          send("BLUR")
        }
      },
      onPaste() {
        send("PASTE")
      },
      onKeyDown(event) {
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
          ","(event) {
            event.preventDefault()
            send("COMMA")
          },
          Enter(event) {
            event.preventDefault()
            send("ENTER")
          },
        }

        const key = determineEventKey(event, ctx)
        const exec = keyMap[key]
        exec?.(event)
      },
    }),

    hiddenInputProps() {
      return normalize<DOMInputProps>({
        type: "hidden",
        name: ctx.name,
        id: ctx.uid,
        value: valueAsString,
      })
    },

    getTagProps({ index, value }: TagProps) {
      const id = ids.getTagId(index)
      return normalize<WithDataAttr<DOMHTMLProps>>({
        id,
        hidden: isEditingTag ? ctx.editedId === id : false,
        "data-value": value,
        "data-selected": dataAttr(id === ctx.focusedId),
        "data-ownedby": ids.root,
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
      const uid = ids.getTagId(index)
      const active = ctx.editedId === uid
      return normalize<DOMInputProps>({
        id: `${uid}-input`,
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
      const uid = ids.getTagId(index)
      return normalize<DOMButtonProps>({
        id: `${uid}-close`,
        type: "button",
        "aria-label": `Delete ${value}`,
        tabIndex: -1,
        onClick() {
          send({
            type: "CLICK_DELETE_BUTTON",
            id: uid,
          })
        },
      })
    },
  }
}
