import { getEventKey, getNativeEvent, type EventKeyMap } from "@zag-js/dom-event"
import { ariaAttr, dataAttr, isComposingEvent } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./tags-input.anatomy"
import { dom } from "./tags-input.dom"
import type { ItemProps, ItemState, MachineApi, Send, State } from "./tags-input.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const interactive = state.context.isInteractive
  const disabled = state.context.disabled
  const readOnly = state.context.readOnly
  const invalid = state.context.invalid || state.context.isOverflowing

  const translations = state.context.translations

  const focused = state.hasTag("focused")
  const editingTag = state.matches("editing:tag")
  const empty = state.context.count === 0

  function getItemState(options: ItemProps): ItemState {
    const id = dom.getItemId(state.context, options)
    return {
      id,
      editing: editingTag && state.context.editedTagId === id,
      highlighted: id === state.context.highlightedTagId,
      disabled: Boolean(options.disabled || disabled),
    }
  }

  return {
    empty: empty,
    inputValue: state.context.trimmedInputValue,
    value: state.context.value,
    valueAsString: state.context.valueAsString,
    count: state.context.count,
    atMax: state.context.isAtMax,
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

    getRootProps() {
      return normalize.element({
        dir: state.context.dir,
        ...parts.root.attrs,
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        "data-disabled": dataAttr(disabled),
        "data-focus": dataAttr(focused),
        "data-empty": dataAttr(empty),
        id: dom.getRootId(state.context),
        onPointerDown() {
          if (!interactive) return
          send("POINTER_DOWN")
        },
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        id: dom.getLabelId(state.context),
        dir: state.context.dir,
        htmlFor: dom.getInputId(state.context),
      })
    },

    getControlProps() {
      return normalize.element({
        id: dom.getControlId(state.context),
        ...parts.control.attrs,
        dir: state.context.dir,
        tabIndex: readOnly ? 0 : undefined,
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        "data-invalid": dataAttr(invalid),
        "data-focus": dataAttr(focused),
      })
    },

    getInputProps() {
      return normalize.input({
        ...parts.input.attrs,
        dir: state.context.dir,
        "data-invalid": dataAttr(invalid),
        "aria-invalid": ariaAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        maxLength: state.context.maxLength,
        id: dom.getInputId(state.context),
        defaultValue: state.context.inputValue,
        autoComplete: "off",
        autoCorrect: "off",
        autoCapitalize: "none",
        disabled: disabled || readOnly,
        onChange(event) {
          const evt = getNativeEvent(event)
          const value = event.target.value

          if (evt.inputType === "insertFromPaste") {
            send({ type: "PASTE", value })
            return
          }

          if (endsWith(value, state.context.delimiter)) {
            send("DELIMITER_KEY")
            return
          }

          send({ type: "TYPE", value, key: evt.inputType })
        },
        onFocus() {
          send("FOCUS")
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (isComposingEvent(event)) return

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
            ArrowRight(event) {
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
              if (isCombobox && isExpanded) return
              send("ENTER")
              event.preventDefault()
            },
          }

          const key = getEventKey(event, state.context)
          const exec = keyMap[key]

          if (exec) {
            exec(event)
            return
          }
        },
      })
    },

    getHiddenInputProps() {
      return normalize.input({
        type: "text",
        hidden: true,
        name: state.context.name,
        form: state.context.form,
        disabled,
        readOnly,
        required: state.context.required,
        id: dom.getHiddenInputId(state.context),
        defaultValue: state.context.valueAsString,
      })
    },

    getItemProps(props) {
      return normalize.element({
        ...parts.item.attrs,
        dir: state.context.dir,
        "data-value": props.value,
        "data-disabled": dataAttr(disabled),
      })
    },

    getItemPreviewProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemPreview.attrs,
        id: itemState.id,
        dir: state.context.dir,
        hidden: itemState.editing,
        "data-value": props.value,
        "data-disabled": dataAttr(disabled),
        "data-highlighted": dataAttr(itemState.highlighted),
        onPointerDown(event) {
          if (!interactive || itemState.disabled) return
          event.preventDefault()
          send({ type: "POINTER_DOWN_TAG", id: itemState.id })
        },
        onDoubleClick() {
          if (!interactive || itemState.disabled) return
          send({ type: "DOUBLE_CLICK_TAG", id: itemState.id })
        },
      })
    },

    getItemTextProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemText.attrs,
        dir: state.context.dir,
        "data-disabled": dataAttr(disabled),
        "data-highlighted": dataAttr(itemState.highlighted),
      })
    },

    getItemInputProps(props) {
      const itemState = getItemState(props)
      return normalize.input({
        ...parts.itemInput.attrs,
        dir: state.context.dir,
        "aria-label": translations.tagEdited(props.value),
        "aria-hidden": true,
        disabled: disabled,
        id: dom.getItemInputId(state.context, props),
        tabIndex: -1,
        hidden: !itemState.editing,
        defaultValue: itemState.editing ? state.context.editedTagValue : "",
        onChange(event) {
          send({ type: "TAG_INPUT_TYPE", value: event.target.value })
        },
        onBlur(event) {
          send({ type: "TAG_INPUT_BLUR", target: event.relatedTarget, id: itemState.id })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (isComposingEvent(event)) return

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
        disabled: disabled,
        "aria-label": translations.deleteTagTriggerLabel(props.value),
        tabIndex: -1,
        onPointerDown(event) {
          if (!interactive) {
            event.preventDefault()
          }
        },
        onPointerMove(event) {
          if (!interactive) return
          dom.setHoverIntent(event.currentTarget)
        },
        onPointerLeave(event) {
          if (!interactive) return
          dom.clearHoverIntent(event.currentTarget)
        },
        onClick() {
          if (!interactive) return
          send({ type: "CLICK_DELETE_TAG", id })
        },
      })
    },

    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs,
        dir: state.context.dir,
        id: dom.getClearTriggerId(state.context),
        type: "button",
        "data-readonly": dataAttr(readOnly),
        disabled: disabled,
        "aria-label": translations.clearTriggerLabel,
        hidden: empty,
        onClick() {
          if (!interactive) return
          send("CLEAR_VALUE")
        },
      })
    },
  }
}

function endsWith(str: string, del: string | RegExp | undefined) {
  if (!del) return false
  if (typeof del === "string") return str.endsWith(del)
  return new RegExp(`${del.source}$`).test(str)
}
