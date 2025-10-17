import type { Service } from "@zag-js/core"
import { ariaAttr, dataAttr, getEventKey, getNativeEvent, isComposingEvent, isLeftClick } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./tags-input.anatomy"
import * as dom from "./tags-input.dom"
import type { ItemProps, ItemState, TagsInputApi, TagsInputSchema } from "./tags-input.types"

export function connect<T extends PropTypes>(
  service: Service<TagsInputSchema>,
  normalize: NormalizeProps<T>,
): TagsInputApi<T> {
  const { state, send, computed, prop, scope, context } = service

  const interactive = computed("isInteractive")
  const disabled = !!prop("disabled")
  const readOnly = !!prop("readOnly")
  const required = !!prop("required")
  const invalid = prop("invalid") || computed("isOverflowing")

  const translations = prop("translations")

  const focused = state.hasTag("focused")
  const editingTag = state.matches("editing:tag")
  const empty = computed("count") === 0

  function getItemState(options: ItemProps): ItemState {
    const id = dom.getItemId(scope, options)
    const editedTagId = context.get("editedTagId")
    const highlightedTagId = context.get("highlightedTagId")
    return {
      id,
      editing: editingTag && editedTagId === id,
      highlighted: id === highlightedTagId,
      disabled: Boolean(options.disabled || disabled),
    }
  }

  return {
    empty: empty,
    inputValue: computed("trimmedInputValue"),
    value: context.get("value"),
    valueAsString: computed("valueAsString"),
    count: computed("count"),
    atMax: computed("isAtMax"),
    setValue(value) {
      send({ type: "SET_VALUE", value })
    },
    clearValue(id) {
      if (id) {
        send({ type: "CLEAR_TAG", id })
      } else {
        send({ type: "CLEAR_VALUE" })
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
      dom.getInputEl(scope)?.focus()
    },
    getItemState,

    getRootProps() {
      return normalize.element({
        dir: prop("dir"),
        ...parts.root.attrs,
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        "data-disabled": dataAttr(disabled),
        "data-focus": dataAttr(focused),
        "data-empty": dataAttr(empty),
        id: dom.getRootId(scope),
        onPointerDown() {
          if (!interactive) return
          send({ type: "POINTER_DOWN" })
        },
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        "data-required": dataAttr(required),
        id: dom.getLabelId(scope),
        dir: prop("dir"),
        htmlFor: dom.getInputId(scope),
      })
    },

    getControlProps() {
      return normalize.element({
        id: dom.getControlId(scope),
        ...parts.control.attrs,
        dir: prop("dir"),
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
        dir: prop("dir"),
        "data-invalid": dataAttr(invalid),
        "aria-invalid": ariaAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        "data-empty": dataAttr(empty),
        maxLength: prop("maxLength"),
        id: dom.getInputId(scope),
        defaultValue: context.get("inputValue"),
        autoComplete: "off",
        autoCorrect: "off",
        autoCapitalize: "none",
        disabled: disabled || readOnly,
        onInput(event) {
          const evt = getNativeEvent(event)
          const value = event.currentTarget.value

          if (evt.inputType === "insertFromPaste") {
            send({ type: "PASTE", value })
            return
          }

          if (endsWith(value, prop("delimiter"))) {
            send({ type: "DELIMITER_KEY" })
            return
          }

          send({ type: "TYPE", value, key: evt.inputType })
        },
        onFocus() {
          queueMicrotask(() => {
            send({ type: "FOCUS" })
          })
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
              send({ type: "ARROW_DOWN" })
            },
            ArrowLeft() {
              if (isCombobox && isExpanded) return
              send({ type: "ARROW_LEFT" })
            },
            ArrowRight(event) {
              if (context.get("highlightedTagId")) {
                event.preventDefault()
              }
              if (isCombobox && isExpanded) return
              send({ type: "ARROW_RIGHT" })
            },
            Escape(event) {
              event.preventDefault()
              send({ type: "ESCAPE" })
            },
            Backspace() {
              send({ type: "BACKSPACE" })
            },
            Delete() {
              send({ type: "DELETE" })
            },
            Enter(event) {
              const hasHighlightedItem = target.getAttribute("aria-activedescendant")
              if (isCombobox && isExpanded && hasHighlightedItem) return
              send({ type: "ENTER" })
              event.preventDefault()
            },
          }

          const key = getEventKey(event, { dir: prop("dir") })
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
        name: prop("name"),
        form: prop("form"),
        disabled,
        readOnly,
        required: prop("required"),
        id: dom.getHiddenInputId(scope),
        defaultValue: computed("valueAsString"),
      })
    },

    getItemProps(props) {
      return normalize.element({
        ...parts.item.attrs,
        dir: prop("dir"),
        "data-value": props.value,
        "data-disabled": dataAttr(disabled),
      })
    },

    getItemPreviewProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemPreview.attrs,
        id: itemState.id,
        dir: prop("dir"),
        hidden: itemState.editing,
        "data-value": props.value,
        "data-disabled": dataAttr(disabled),
        "data-highlighted": dataAttr(itemState.highlighted),
        onPointerDown(event) {
          if (!interactive || itemState.disabled) return
          if (!isLeftClick(event)) return
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
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-highlighted": dataAttr(itemState.highlighted),
      })
    },

    getItemInputProps(props) {
      const itemState = getItemState(props)
      return normalize.input({
        ...parts.itemInput.attrs,
        dir: prop("dir"),
        "aria-label": translations?.tagEdited?.(props.value),
        disabled: disabled,
        id: dom.getItemInputId(scope, props),
        tabIndex: -1,
        hidden: !itemState.editing,
        maxLength: prop("maxLength"),
        defaultValue: itemState.editing ? context.get("editedTagValue") : "",
        onInput(event) {
          send({ type: "TAG_INPUT_TYPE", value: event.currentTarget.value })
        },
        onBlur(event) {
          queueMicrotask(() => {
            send({ type: "TAG_INPUT_BLUR", target: event.relatedTarget, id: itemState.id })
          })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (isComposingEvent(event)) return

          const keyMap: EventKeyMap = {
            Enter() {
              send({ type: "TAG_INPUT_ENTER" })
            },
            Escape() {
              send({ type: "TAG_INPUT_ESCAPE" })
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
      const id = dom.getItemId(scope, props)
      return normalize.button({
        ...parts.itemDeleteTrigger.attrs,
        dir: prop("dir"),
        id: dom.getItemDeleteTriggerId(scope, props),
        type: "button",
        disabled: disabled,
        "aria-label": translations?.deleteTagTriggerLabel?.(props.value),
        tabIndex: -1,
        onPointerDown(event) {
          if (!isLeftClick(event)) return
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
        onClick(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
          send({ type: "CLICK_DELETE_TAG", id })
        },
      })
    },

    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs,
        dir: prop("dir"),
        id: dom.getClearTriggerId(scope),
        type: "button",
        "data-readonly": dataAttr(readOnly),
        disabled: disabled,
        "aria-label": translations?.clearTriggerLabel,
        hidden: empty,
        onClick() {
          if (!interactive) return
          send({ type: "CLEAR_VALUE" })
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
