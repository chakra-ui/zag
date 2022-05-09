import { dataAttr, EventKeyMap, getEventKey, getNativeEvent, matchAttr, validateBlur } from "@zag-js/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@zag-js/types"
import { dom } from "./tags-input.dom"
import type { Send, State, TagProps } from "./tags-input.types"

export function connect<T extends PropTypes = ReactPropTypes>(state: State, send: Send, normalize = normalizeProp) {
  const isInteractive = state.context.isInteractive
  const isDisabled = state.context.disabled
  const isReadonly = state.context.readonly
  const isInvalid = state.context.invalid || state.context.isOverflowing

  const messages = state.context.messages

  const isInputFocused = state.hasTag("focused")
  const isEditingTag = state.matches("editing:tag")
  const isEmpty = state.context.count === 0

  return {
    isEmpty,
    inputValue: state.context.trimmedInputValue,
    value: state.context.value,
    count: state.context.count,
    valueAsString: state.context.valueAsString,
    isAtMax: state.context.isAtMax,
    setValue(value: string[]) {
      send({ type: "SET_VALUE", value })
    },
    clearAll() {
      send("CLEAR_ALL")
    },
    addValue(value: string) {
      send({ type: "ADD_TAG", value })
    },
    deleteValue(id: string) {
      send({ type: "DELETE_TAG", id })
    },
    setInputValue(value: string) {
      send({ type: "SET_INPUT_VALUE", value })
    },
    clearInputValue() {
      send({ type: "SET_INPUT_VALUE", value: "" })
    },
    focus() {
      dom.getInputEl(state.context)?.focus()
    },

    rootProps: normalize.element<T>({
      dir: state.context.dir,
      "data-part": "root",
      "data-invalid": dataAttr(isInvalid),
      "data-readonly": dataAttr(isReadonly),
      "data-disabled": dataAttr(isDisabled),
      "data-focus": dataAttr(isInputFocused),
      "data-empty": dataAttr(isEmpty),
      id: dom.getRootId(state.context),
      onPointerDown() {
        if (!isInteractive) return
        send("POINTER_DOWN")
      },
    }),

    labelProps: normalize.label<T>({
      "data-part": "label",
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "data-readonly": dataAttr(isReadonly),
      id: dom.getLabelId(state.context),
      htmlFor: dom.getInputId(state.context),
    }),

    controlProps: normalize.element<T>({
      id: dom.getControlId(state.context),
      "data-part": "control",
      tabIndex: isReadonly ? 0 : undefined,
      "data-disabled": dataAttr(isDisabled),
      "data-readonly": dataAttr(isReadonly),
      "data-invalid": dataAttr(isInvalid),
      "data-focus": dataAttr(isInputFocused),
    }),

    inputProps: normalize.input<T>({
      "data-part": "input",
      "data-invalid": dataAttr(isInvalid),
      "aria-invalid": isInvalid,
      "data-readonly": dataAttr(isReadonly),
      maxLength: state.context.maxLength,
      id: dom.getInputId(state.context),
      value: state.context.inputValue,
      autoComplete: "off",
      autoCorrect: "off",
      autoCapitalize: "none",
      disabled: isDisabled || isReadonly,
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

        // handle composition when used as combobox
        const attr = matchAttr(event.currentTarget)
        const isCombobox = attr.is("role", "combobox")
        const isExpanded = attr.is("aria-expanded", "true")

        const keyMap: EventKeyMap = {
          ArrowDown() {
            send("ARROW_DOWN")
          },
          ArrowLeft() {
            if (isCombobox && isExpanded) return
            send("ARROW_LEFT")
          },
          ArrowRight() {
            if (state.context.focusedId) {
              event.preventDefault()
            }
            if (isCombobox && isExpanded) return
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
          Enter(event) {
            event.preventDefault()
            send("ENTER")
          },
        }

        const key = getEventKey(event, state.context)
        const exec = keyMap[key]

        if (exec) {
          exec?.(event)
          return
        }

        const isDelimiter = event.key === state.context.delimiter
        if (isDelimiter) {
          event.preventDefault()
          send("DELIMITER_KEY")
        }
      },
    }),

    hiddenInputProps: normalize.input<T>({
      "data-part": "hidden-input",
      type: "text",
      hidden: true,
      name: state.context.name,
      id: dom.getHiddenInputId(state.context),
      defaultValue: state.context.valueAsString,
    }),

    getTagProps(options: TagProps) {
      const { value } = options
      const id = dom.getTagId(state.context, options)
      return normalize.element<T>({
        "data-part": "tag",
        id,
        hidden: isEditingTag ? state.context.editedId === id : false,
        "data-value": value,
        "data-disabled": dataAttr(isDisabled),
        "data-selected": dataAttr(id === state.context.focusedId),
        onPointerDown(event) {
          if (!isInteractive) return
          event.preventDefault()
          send({ type: "POINTER_DOWN_TAG", id })
        },
        onDoubleClick() {
          if (!isInteractive) return
          send({ type: "DOUBLE_CLICK_TAG", id })
        },
      })
    },

    getTagInputProps(options: TagProps) {
      const id = dom.getTagId(state.context, options)
      const active = state.context.editedId === id
      return normalize.input<T>({
        "data-part": "tag-input",
        "aria-label": messages.tagEdited(options.value),
        "aria-hidden": true,
        disabled: isDisabled,
        id: dom.getTagInputId(state.context, options),
        type: "text",
        tabIndex: -1,
        hidden: isEditingTag ? !active : true,
        value: active ? state.context.editedTagValue : "",
        onChange(event) {
          send({ type: "TAG_INPUT_TYPE", value: event.target.value })
        },
        onBlur(event) {
          send({ type: "TAG_INPUT_BLUR", target: event.relatedTarget })
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

    getTagDeleteButtonProps(options: TagProps) {
      const id = dom.getTagId(state.context, options)
      return normalize.button<T>({
        "data-part": "delete-button",
        id: dom.getTagDeleteBtnId(state.context, options),
        type: "button",
        disabled: isDisabled,
        "aria-label": messages.deleteTagButtonLabel(options.value),
        tabIndex: -1,
        onPointerDown(event) {
          if (!isInteractive) {
            event.preventDefault()
          }
        },
        onPointerMove(event) {
          if (!isInteractive) return
          dom.setHoverIntent(event.currentTarget)
        },
        onPointerLeave(event) {
          if (!isInteractive) return
          dom.clearHoverIntent(event.currentTarget)
        },
        onClick() {
          if (!isInteractive) return
          send({ type: "DELETE_TAG", id })
        },
      })
    },

    clearButtonProps: normalize.button<T>({
      "data-part": "clear-button",
      id: dom.getClearButtonId(state.context),
      type: "button",
      "data-readonly": dataAttr(isReadonly),
      disabled: isDisabled,
      "aria-label": messages.clearButtonLabel,
      hidden: isEmpty,
      onClick() {
        if (!isInteractive) return
        send("CLEAR_ALL")
      },
    }),
  }
}
