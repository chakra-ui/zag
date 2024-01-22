import { type EventKeyMap, getEventKey, getNativeEvent } from "@zag-js/dom-event"
import { ariaAttr, dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./tags-input.anatomy"
import { dom } from "./tags-input.dom"
import type { MachineApi, Send, State, ItemProps } from "./tags-input.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isInteractive = state.context.isInteractive
  const isDisabled = state.context.isDisabled
  const isReadOnly = state.context.readOnly
  const isInvalid = state.context.invalid || state.context.isOverflowing

  const translations = state.context.translations

  const isInputFocused = state.hasTag("focused")
  const isEditingTag = state.matches("editing:tag")
  const isEmpty = state.context.count === 0

  function getItemState(options: ItemProps) {
    const id = dom.getItemId(state.context, options)
    return {
      id,
      isEditing: isEditingTag && state.context.editedTagId === id,
      isHighlighted: id === state.context.highlightedTagId,
      isDisabled: options.disabled || isDisabled,
    }
  }

  return {
    isEmpty,
    inputValue: state.context.trimmedInputValue,
    value: state.context.value,
    valueAsString: state.context.valueAsString,
    count: state.context.count,
    isAtMax: state.context.isAtMax,
    setValue(value) {
      send({ type: "SET_VALUE", value })
    },
    clearValue(id) {
      if (id) {
        send({ type: "CLEAR_TAG", id })
      } else {
        send("CLEAR_VALUE")
      }
    },
    addValue(value) {
      send({ type: "ADD_TAG", value })
    },
    setValueAtIndex(index, value) {
      send({ type: "SET_VALUE_AT_INDEX", index, value })
    },
    setInputValue(value) {
      send({ type: "SET_INPUT_VALUE", value })
    },
    clearInputValue() {
      send({ type: "SET_INPUT_VALUE", value: "" })
    },
    focus() {
      dom.getInputEl(state.context)?.focus()
    },
    getItemState,

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
      dir: state.context.dir,
      htmlFor: dom.getInputId(state.context),
    }),

    controlProps: normalize.element({
      id: dom.getControlId(state.context),
      ...parts.control.attrs,
      dir: state.context.dir,
      tabIndex: isReadOnly ? 0 : undefined,
      "data-disabled": dataAttr(isDisabled),
      "data-readonly": dataAttr(isReadOnly),
      "data-invalid": dataAttr(isInvalid),
      "data-focus": dataAttr(isInputFocused),
    }),

    inputProps: normalize.input({
      ...parts.input.attrs,
      dir: state.context.dir,
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
        const evt = getNativeEvent(event)
        if (evt.isComposing) return

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
            if (state.context.highlightedTagId) {
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
      type: "text",
      hidden: true,
      name: state.context.name,
      form: state.context.form,
      id: dom.getHiddenInputId(state.context),
      defaultValue: state.context.valueAsString,
    }),

    getItemProps(props) {
      return normalize.element({
        ...parts.item.attrs,
        dir: state.context.dir,
        "data-value": props.value,
        "data-disabled": dataAttr(isDisabled),
      })
    },

    getItemPreviewProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemPreview.attrs,
        id: itemState.id,
        dir: state.context.dir,
        hidden: itemState.isEditing,
        "data-value": props.value,
        "data-disabled": dataAttr(isDisabled),
        "data-highlighted": dataAttr(itemState.isHighlighted),
        onPointerDown(event) {
          if (!isInteractive || itemState.isDisabled) return
          event.preventDefault()
          send({ type: "POINTER_DOWN_TAG", id: itemState.id })
        },
        onDoubleClick() {
          if (!isInteractive || itemState.isDisabled) return
          send({ type: "DOUBLE_CLICK_TAG", id: itemState.id })
        },
      })
    },

    getItemTextProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemText.attrs,
        dir: state.context.dir,
        "data-disabled": dataAttr(isDisabled),
        "data-highlighted": dataAttr(itemState.isHighlighted),
      })
    },

    getItemInputProps(props) {
      const itemState = getItemState(props)
      return normalize.input({
        ...parts.itemInput.attrs,
        dir: state.context.dir,
        "aria-label": translations.tagEdited(props.value),
        "aria-hidden": true,
        disabled: isDisabled,
        id: dom.getItemInputId(state.context, props),
        tabIndex: -1,
        hidden: !itemState.isEditing,
        defaultValue: itemState.isEditing ? state.context.editedTagValue : "",
        onChange(event) {
          send({ type: "TAG_INPUT_TYPE", value: event.target.value })
        },
        onBlur(event) {
          send({ type: "TAG_INPUT_BLUR", target: event.relatedTarget, id: itemState.id })
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

    getItemDeleteTriggerProps(props) {
      const id = dom.getItemId(state.context, props)
      return normalize.button({
        ...parts.itemDeleteTrigger.attrs,
        dir: state.context.dir,
        id: dom.getItemDeleteTriggerId(state.context, props),
        type: "button",
        disabled: isDisabled,
        "aria-label": translations.deleteTagTriggerLabel(props.value),
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
      dir: state.context.dir,
      id: dom.getClearTriggerId(state.context),
      type: "button",
      "data-readonly": dataAttr(isReadOnly),
      disabled: isDisabled,
      "aria-label": translations.clearTriggerLabel,
      hidden: isEmpty,
      onClick() {
        if (!isInteractive) return
        send("CLEAR_VALUE")
      },
    }),
  }
}
