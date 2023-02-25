import { EventKeyMap, getEventKey, getNativeEvent } from "@zag-js/dom-event"
import { ariaAttr, dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./tags-input.anatomy"
import { dom } from "./tags-input.dom"
import type { Send, State, TagProps } from "./tags-input.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isInteractive = state.context.isInteractive
  const isDisabled = state.context.disabled
  const isReadOnly = state.context.readOnly
  const isInvalid = state.context.invalid || state.context.isOverflowing

  const translations = state.context.translations

  const isInputFocused = state.hasTag("focused")
  const isEditingTag = state.matches("editing:tag")
  const isEmpty = state.context.count === 0

  return {
    /**
     * Whether the tags are empty
     */
    isEmpty,
    /**
     * The value of the tags entry input.
     */
    inputValue: state.context.trimmedInputValue,
    /**
     * The value of the tags as an array of strings.
     */
    value: state.context.value,
    /**
     * The value of the tags as a string.
     */
    valueAsString: state.context.valueAsString,
    /**
     * The number of the tags.
     */
    count: state.context.count,
    /**
     * Whether the tags have reached the max limit.
     */
    isAtMax: state.context.isAtMax,
    /**
     * Function to set the value of the tags.
     */
    setValue(value: string[]) {
      send({ type: "SET_VALUE", value })
    },
    /**
     * Function to clear the value of the tags.
     */
    clearValue(id?: string) {
      if (id) {
        send({ type: "CLEAR_TAG", id })
      } else {
        send("CLEAR_VALUE")
      }
    },
    /**
     * Function to add a tag to the tags.
     */
    addValue(value: string) {
      send({ type: "ADD_TAG", value })
    },
    /**
     * Function to set the value of a tag at the given index.
     */
    setValueAtIndex(index: number, value: string) {
      send({ type: "SET_VALUE_AT_INDEX", index, value })
    },
    /**
     * Function to set the value of the tags entry input.
     */
    setInputValue(value: string) {
      send({ type: "SET_INPUT_VALUE", value })
    },
    /**
     * Function to clear the value of the tags entry input.
     */
    clearInputValue() {
      send({ type: "SET_INPUT_VALUE", value: "" })
    },
    /**
     * Function to focus the tags entry input.
     */
    focus() {
      dom.getInputEl(state.context)?.focus()
    },

    rootProps: normalize.element({
      dir: state.context.dir,
      ...parts.root.attrs,
      "data-invalid": dataAttr(isInvalid),
      "data-readonly": dataAttr(isReadOnly),
      "data-disabled": dataAttr(isDisabled),
      "data-focus": dataAttr(isInputFocused),
      "data-empty": dataAttr(isEmpty),
      id: dom.getRootId(state.context),
      onPointerDown() {
        if (!isInteractive) return
        send("POINTER_DOWN")
      },
    }),

    labelProps: normalize.label({
      ...parts.label.attrs,
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "data-readonly": dataAttr(isReadOnly),
      id: dom.getLabelId(state.context),
      htmlFor: dom.getInputId(state.context),
    }),

    controlProps: normalize.element({
      id: dom.getControlId(state.context),
      ...parts.control.attrs,
      tabIndex: isReadOnly ? 0 : undefined,
      "data-disabled": dataAttr(isDisabled),
      "data-readonly": dataAttr(isReadOnly),
      "data-invalid": dataAttr(isInvalid),
      "data-focus": dataAttr(isInputFocused),
    }),

    inputProps: normalize.input({
      ...parts.input.attrs,
      "data-invalid": dataAttr(isInvalid),
      "aria-invalid": ariaAttr(isInvalid),
      "data-readonly": dataAttr(isReadOnly),
      maxLength: state.context.maxLength,
      id: dom.getInputId(state.context),
      defaultValue: state.context.inputValue,
      autoComplete: "off",
      autoCorrect: "off",
      autoCapitalize: "none",
      disabled: isDisabled || isReadOnly,
      onChange(event) {
        const evt = getNativeEvent(event)

        if (evt.inputType === "insertFromPaste") return
        let value = event.target.value

        if (value.endsWith(state.context.delimiter!)) {
          send("DELIMITER_KEY")
        } else {
          send({ type: "TYPE", value, key: evt.inputType })
        }
      },
      onFocus() {
        send("FOCUS")
      },
      onPaste(event) {
        const value = event.clipboardData.getData("text/plain")
        send({ type: "PASTE", value })
      },
      onKeyDown(event) {
        // handle composition when used as combobox
        const target = event.currentTarget as HTMLElement
        const isCombobox = target.getAttribute("role") === "combobox"
        const isExpanded = target.ariaExpanded === "true"

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
          exec(event)
          return
        }
      },
    }),

    hiddenInputProps: normalize.input({
      ...parts.hiddenInput.attrs,
      type: "text",
      hidden: true,
      name: state.context.name,
      form: state.context.form,
      id: dom.getHiddenInputId(state.context),
      defaultValue: state.context.valueAsString,
    }),

    getTagProps(options: TagProps) {
      const { value } = options
      const id = dom.getTagId(state.context, options)
      return normalize.element({
        ...parts.tag.attrs,
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
      return normalize.input({
        ...parts.tagInput.attrs,
        "aria-label": translations.tagEdited(options.value),
        "aria-hidden": true,
        disabled: isDisabled,
        id: dom.getTagInputId(state.context, options),
        type: "text",
        tabIndex: -1,
        hidden: isEditingTag ? !active : true,
        defaultValue: active ? state.context.editedTagValue : "",
        onChange(event) {
          send({ type: "TAG_INPUT_TYPE", value: event.target.value })
        },
        onBlur(event) {
          send({ type: "TAG_INPUT_BLUR", target: event.relatedTarget, id })
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

    getTagDeleteTriggerProps(options: TagProps) {
      const id = dom.getTagId(state.context, options)
      return normalize.button({
        ...parts.tagDeleteTrigger.attrs,
        id: dom.getTagDeleteTriggerId(state.context, options),
        type: "button",
        disabled: isDisabled,
        "aria-label": translations.deleteTagTriggerLabel(options.value),
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
          send({ type: "CLEAR_TAG", id })
        },
      })
    },

    clearTriggerProps: normalize.button({
      ...parts.clearTrigger.attrs,
      id: dom.getClearTriggerId(state.context),
      type: "button",
      "data-readonly": dataAttr(isReadOnly),
      disabled: isDisabled,
      "aria-label": translations.clearTriggerLabel,
      hidden: isEmpty,
      onClick() {
        if (!isInteractive) return
        send("CLEAR_ALL")
      },
    }),
  }
}
