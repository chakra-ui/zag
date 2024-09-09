import { clickIfLink, getEventKey, isContextMenuEvent, isLeftClick, type EventKeyMap } from "@zag-js/dom-event"
import { ariaAttr, dataAttr, isComposingEvent, isDownloadingEvent, isOpeningInNewTab } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./combobox.anatomy"
import { dom } from "./combobox.dom"
import type { CollectionItem, ItemProps, ItemState, MachineApi, Send, State } from "./combobox.types"

export function connect<T extends PropTypes, V extends CollectionItem>(
  state: State,
  send: Send,
  normalize: NormalizeProps<T>,
): MachineApi<T, V> {
  const translations = state.context.translations
  const collection = state.context.collection

  const disabled = state.context.disabled
  const interactive = state.context.isInteractive
  const invalid = state.context.invalid
  const readOnly = state.context.readOnly

  const open = state.hasTag("open")
  const focused = state.hasTag("focused")
  const composite = state.context.composite
  const highlightedValue = state.context.highlightedValue

  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: state.context.currentPlacement,
  })

  function getItemState(props: ItemProps): ItemState {
    const { item } = props
    const disabled = collection.getItemDisabled(item)
    const value = collection.getItemValue(item)!
    return {
      value,
      disabled: Boolean(disabled || disabled),
      highlighted: highlightedValue === value,
      selected: state.context.value.includes(value),
    }
  }

  return {
    focused,
    open,
    inputValue: state.context.inputValue,
    highlightedValue,
    highlightedItem: state.context.highlightedItem,
    value: state.context.value,
    valueAsString: state.context.valueAsString,
    hasSelectedItems: state.context.hasSelectedItems,
    selectedItems: state.context.selectedItems,
    collection: state.context.collection,
    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options })
    },
    setCollection(collection) {
      send({ type: "COLLECTION.SET", value: collection })
    },
    setHighlightValue(value) {
      send({ type: "HIGHLIGHTED_VALUE.SET", value })
    },
    selectValue(value) {
      send({ type: "ITEM.SELECT", value })
    },
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    setInputValue(value) {
      send({ type: "INPUT_VALUE.SET", value })
    },
    clearValue(value) {
      if (value != null) {
        send({ type: "ITEM.CLEAR", value })
      } else {
        send("VALUE.CLEAR")
      }
    },
    focus() {
      dom.getInputEl(state.context)?.focus()
    },
    setOpen(nextOpen) {
      if (nextOpen === open) return
      send(nextOpen ? "OPEN" : "CLOSE")
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        dir: state.context.dir,
        id: dom.getRootId(state.context),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        dir: state.context.dir,
        htmlFor: dom.getInputId(state.context),
        id: dom.getLabelId(state.context),
        "data-readonly": dataAttr(readOnly),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-focus": dataAttr(focused),
        onClick(event) {
          if (composite) return
          event.preventDefault()
          dom.getTriggerEl(state.context)?.focus({ preventScroll: true })
        },
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        dir: state.context.dir,
        id: dom.getControlId(state.context),
        "data-state": open ? "open" : "closed",
        "data-focus": dataAttr(focused),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs,
        dir: state.context.dir,
        id: dom.getPositionerId(state.context),
        style: popperStyles.floating,
      })
    },

    getInputProps() {
      return normalize.input({
        ...parts.input.attrs,
        dir: state.context.dir,
        "aria-invalid": ariaAttr(invalid),
        "data-invalid": dataAttr(invalid),
        name: state.context.name,
        form: state.context.form,
        disabled: disabled,
        autoFocus: state.context.autoFocus,
        required: state.context.required,
        autoComplete: "off",
        autoCorrect: "off",
        autoCapitalize: "none",
        spellCheck: "false",
        readOnly: readOnly,
        placeholder: state.context.placeholder,
        id: dom.getInputId(state.context),
        type: "text",
        role: "combobox",
        defaultValue: state.context.inputValue,
        "aria-autocomplete": state.context.autoComplete ? "both" : "list",
        "aria-controls": dom.getContentId(state.context),
        "aria-expanded": open,
        "data-state": open ? "open" : "closed",
        "aria-activedescendant": highlightedValue ? dom.getItemId(state.context, highlightedValue) : undefined,
        onClick(event) {
          if (event.defaultPrevented) return
          if (!state.context.openOnClick) return
          if (!interactive) return
          send("INPUT.CLICK")
        },
        onFocus() {
          if (disabled) return
          send("INPUT.FOCUS")
        },
        onBlur() {
          if (disabled) return
          send("INPUT.BLUR")
        },
        onChange(event) {
          send({ type: "INPUT.CHANGE", value: event.currentTarget.value })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!interactive) return

          if (event.ctrlKey || event.shiftKey || isComposingEvent(event)) return

          const openOnKeyPress = state.context.openOnKeyPress
          const isModifierKey = event.ctrlKey || event.metaKey || event.shiftKey
          const keypress = true

          const keymap: EventKeyMap = {
            ArrowDown(event) {
              if (!openOnKeyPress && !open) return
              send({ type: event.altKey ? "OPEN" : "INPUT.ARROW_DOWN", keypress })
              event.preventDefault()
            },
            ArrowUp() {
              if (!openOnKeyPress && !open) return
              send({ type: event.altKey ? "CLOSE" : "INPUT.ARROW_UP", keypress })
              event.preventDefault()
            },
            Home(event) {
              if (isModifierKey) return
              send({ type: "INPUT.HOME", keypress })
              if (open) {
                event.preventDefault()
              }
            },
            End(event) {
              if (isModifierKey) return
              send({ type: "INPUT.END", keypress })
              if (open) {
                event.preventDefault()
              }
            },
            Enter(event) {
              send({ type: "INPUT.ENTER", keypress })
              if (open) {
                event.preventDefault()
              }
              const itemEl = dom.getHighlightedItemEl(state.context)
              clickIfLink(itemEl)
            },
            Escape() {
              send({ type: "INPUT.ESCAPE", keypress })
              event.preventDefault()
            },
          }

          const key = getEventKey(event, state.context)
          const exec = keymap[key]
          exec?.(event)
        },
      })
    },

    getTriggerProps(props = {}) {
      return normalize.button({
        ...parts.trigger.attrs,
        dir: state.context.dir,
        id: dom.getTriggerId(state.context),
        "aria-haspopup": composite ? "listbox" : "dialog",
        type: "button",
        tabIndex: props.focusable ? undefined : -1,
        "aria-label": translations.triggerLabel,
        "aria-expanded": open,
        "data-state": open ? "open" : "closed",
        "aria-controls": open ? dom.getContentId(state.context) : undefined,
        disabled,
        "data-invalid": dataAttr(invalid),
        "data-focusable": dataAttr(props.focusable),
        "data-readonly": dataAttr(readOnly),
        "data-disabled": dataAttr(disabled),
        onFocus() {
          if (!props.focusable) return
          send({ type: "INPUT.FOCUS", src: "trigger" })
        },
        onClick(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
          if (!isLeftClick(event)) return
          send("TRIGGER.CLICK")
        },
        onPointerDown(event) {
          if (!interactive) return
          if (event.pointerType === "touch") return
          event.preventDefault()
          queueMicrotask(() => {
            dom.getInputEl(state.context)?.focus({ preventScroll: true })
          })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (composite) return

          const keyMap: EventKeyMap = {
            ArrowDown() {
              send({ type: "INPUT.ARROW_DOWN", src: "trigger" })
            },
            ArrowUp() {
              send({ type: "INPUT.ARROW_UP", src: "trigger" })
            },
          }

          const key = getEventKey(event, state.context)
          const exec = keyMap[key]

          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        dir: state.context.dir,
        id: dom.getContentId(state.context),
        role: !composite ? "dialog" : "listbox",
        tabIndex: -1,
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-placement": state.context.currentPlacement,
        "aria-labelledby": dom.getLabelId(state.context),
        "aria-multiselectable": state.context.multiple && composite ? true : undefined,
        onPointerDown(event) {
          // prevent options or elements within listbox from taking focus
          event.preventDefault()
        },
      })
    },

    getListProps() {
      return normalize.element({
        ...parts.list.attrs,
        role: !composite ? "listbox" : undefined,
        "aria-labelledby": dom.getLabelId(state.context),
        "aria-multiselectable": state.context.multiple && !composite ? true : undefined,
      })
    },

    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs,
        dir: state.context.dir,
        id: dom.getClearTriggerId(state.context),
        type: "button",
        tabIndex: -1,
        disabled: disabled,
        "data-invalid": dataAttr(invalid),
        "aria-label": translations.clearTriggerLabel,
        "aria-controls": dom.getInputId(state.context),
        hidden: !state.context.value.length,
        onPointerDown(event) {
          event.preventDefault()
        },
        onClick(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
          send({ type: "VALUE.CLEAR", src: "clear-trigger" })
        },
      })
    },

    getItemState,

    getItemProps(props) {
      const itemState = getItemState(props)
      const value = itemState.value

      return normalize.element({
        ...parts.item.attrs,
        dir: state.context.dir,
        id: dom.getItemId(state.context, value),
        role: "option",
        tabIndex: -1,
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-state": itemState.selected ? "checked" : "unchecked",
        "aria-selected": ariaAttr(itemState.highlighted),
        "aria-disabled": ariaAttr(itemState.disabled),
        "data-disabled": dataAttr(itemState.disabled),
        "data-value": itemState.value,
        onPointerMove() {
          if (itemState.disabled) return
          if (itemState.highlighted) return
          send({ type: "ITEM.POINTER_MOVE", value })
        },
        onPointerLeave() {
          if (props.persistFocus) return
          if (itemState.disabled) return
          const mouseMoved = state.previousEvent.type.includes("POINTER")
          if (!mouseMoved) return
          send({ type: "ITEM.POINTER_LEAVE", value })
        },
        onClick(event) {
          if (isDownloadingEvent(event)) return
          if (isOpeningInNewTab(event)) return
          if (isContextMenuEvent(event)) return
          if (itemState.disabled) return
          send({ type: "ITEM.CLICK", src: "click", value })
        },
      })
    },

    getItemTextProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemText.attrs,
        dir: state.context.dir,
        "data-state": itemState.selected ? "checked" : "unchecked",
        "data-disabled": dataAttr(itemState.disabled),
        "data-highlighted": dataAttr(itemState.highlighted),
      })
    },
    getItemIndicatorProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        "aria-hidden": true,
        ...parts.itemIndicator.attrs,
        dir: state.context.dir,
        "data-state": itemState.selected ? "checked" : "unchecked",
        hidden: !itemState.selected,
      })
    },

    getItemGroupProps(props) {
      const { id } = props
      return normalize.element({
        ...parts.itemGroup.attrs,
        dir: state.context.dir,
        id: dom.getItemGroupId(state.context, id),
        "aria-labelledby": dom.getItemGroupLabelId(state.context, id),
      })
    },

    getItemGroupLabelProps(props) {
      const { htmlFor } = props
      return normalize.element({
        ...parts.itemGroupLabel.attrs,
        dir: state.context.dir,
        id: dom.getItemGroupLabelId(state.context, htmlFor),
        role: "group",
      })
    },
  }
}
