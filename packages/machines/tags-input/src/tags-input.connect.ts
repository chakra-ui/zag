import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, EventKeyMap, getEventKey, getNativeEvent, nextTick, validateBlur } from "@ui-machines/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./tags-input.dom"
import { MachineContext, MachineState } from "./tags-input.types"

type TagProps = {
  index: string | number
  value: string
}

export function connect<T extends PropTypes = ReactPropTypes>(
  state: S.State<MachineContext, MachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const isInputFocused = state.matches("focused:input", "navigating:tag")
  const isEditingTag = state.matches("editing:tag")

  return {
    // state
    value: state.context.value,
    valueAsString: state.context.valueAsString,

    // methods
    clear() {
      send("CLEAR_ALL")
    },
    add(value: string) {
      send({ type: "ADD_TAG", value })
    },
    delete(id: string) {
      send({ type: "DELETE_TAG", id })
    },
    focus() {
      nextTick(() => {
        dom.getInputEl(state.context)?.focus()
      })
    },
    blur() {
      dom.getInputEl(state.context)?.blur()
    },

    // attributes
    labelProps: normalize.label<T>({
      "data-part": "label",
      id: dom.getLabelId(state.context),
      htmlFor: dom.getInputId(state.context),
    }),

    rootProps: normalize.element<T>({
      "data-part": "root",
      "data-invalid": dataAttr(state.context.outOfRange),
      "data-disabled": dataAttr(state.context.disabled),
      "data-focus": dataAttr(isInputFocused),
      id: dom.getRootId(state.context),
      onPointerDown() {
        if (!state.context.isInteractive) return
        send("POINTER_DOWN")
      },
    }),

    inputProps: normalize.input<T>({
      "data-part": "input",
      id: dom.getInputId(state.context),
      value: state.context.inputValue,
      autoComplete: "off",
      disabled: state.context.disabled,
      onChange(event) {
        const evt = getNativeEvent(event)
        if (evt.isComposing || evt.inputType === "insertFromPaste") return
        send({ type: "TYPE", value: event.target.value })
      },
      onFocus() {
        send("FOCUS")
      },
      onBlur(event) {
        const isValidBlur = validateBlur(event, {
          exclude: dom.getRootEl(state.context),
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
        const evt = getNativeEvent(event)
        if (evt.isComposing) return
        const keyMap: EventKeyMap = {
          ArrowDown() {
            send("ARROW_DOWN")
          },
          ArrowLeft() {
            send("ARROW_LEFT")
          },
          ArrowRight() {
            if (state.context.focusedId) {
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

        const key = getEventKey(event, state.context)
        const exec = keyMap[key]
        exec?.(event)
      },
    }),

    hiddenInputProps: normalize.input<T>({
      "data-part": "hidden-input",
      type: "hidden",
      name: state.context.name,
      id: dom.getHiddenInputId(state.context),
      value: state.context.valueAsString,
    }),

    getTagProps({ index, value }: TagProps) {
      const id = dom.getTagId(state.context, index)
      return normalize.element<T>({
        "data-part": "tag",
        id,
        hidden: isEditingTag ? state.context.editedId === id : false,
        "data-value": value,
        "data-disabled": dataAttr(state.context.disabled),
        "data-selected": dataAttr(id === state.context.focusedId),
        "data-ownedby": dom.getRootId(state.context),
        onPointerDown(event) {
          if (!state.context.isInteractive) return
          event.preventDefault()
          send({ type: "POINTER_DOWN_TAG", id })
        },
        onDoubleClick() {
          if (!state.context.isInteractive) return
          send({ type: "DOUBLE_CLICK_TAG", id })
        },
      })
    },

    getTagInputProps({ index }: { index: number }) {
      const id = dom.getTagId(state.context, index)
      const active = state.context.editedId === id
      return normalize.input<T>({
        "data-part": "tag-input",
        id: dom.getTagInputId(state.context, index),
        type: "text",
        tabIndex: -1,
        hidden: isEditingTag ? !active : true,
        value: active ? state.context.editedTagValue : "",
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
      const id = dom.getTagId(state.context, index)
      return normalize.button<T>({
        "data-part": "delete-button",
        id: dom.getTagDeleteBtnId(state.context, index),
        type: "button",
        "aria-label": `Delete ${value}`,
        tabIndex: -1,
        onPointerDown(event) {
          if (!state.context.isInteractive) {
            event.preventDefault()
          }
        },
        onPointerOver() {
          if (!state.context.isInteractive) return
          send({ type: "HOVER_DELETE_TAG", id })
        },
        onClick() {
          if (!state.context.isInteractive) return
          send({ type: "DELETE_TAG", id })
        },
      })
    },

    clearButtonProps: normalize.button<T>({
      "data-part": "clear-button",
      id: dom.getClearButtonId(state.context),
      type: "button",
      "aria-label": "Clear all tags",
      hidden: state.context.count === 0,
      onClick() {
        if (!state.context.isInteractive) return
        send("CLEAR_ALL")
      },
    }),
  }
}
