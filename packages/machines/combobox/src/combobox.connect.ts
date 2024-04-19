import {
  clickIfLink,
  getEventKey,
  getNativeEvent,
  isContextMenuEvent,
  isLeftClick,
  type EventKeyMap,
} from "@zag-js/dom-event"
import { ariaAttr, dataAttr, isDownloadingEvent, isOpeningInNewTab, raf } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./combobox.anatomy"
import { dom } from "./combobox.dom"
import type { CollectionItem, ItemProps, MachineApi, Send, State } from "./combobox.types"

export function connect<T extends PropTypes, V extends CollectionItem>(
  state: State,
  send: Send,
  normalize: NormalizeProps<T>,
): MachineApi<T, V> {
  const translations = state.context.translations
  const collection = state.context.collection

  const isDisabled = state.context.disabled
  const isInteractive = state.context.isInteractive
  const isInvalid = state.context.invalid
  const isReadOnly = state.context.readOnly

  const isOpen = state.hasTag("open")
  const isFocused = state.hasTag("focused")
  const isDialogPopup = state.context.popup === "dialog"

  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: state.context.currentPlacement,
  })

  function getItemState(props: ItemProps) {
    const { item } = props
    const disabled = collection.isItemDisabled(item)
    const value = collection.itemToValue(item)
    return {
      value,
      isDisabled: Boolean(disabled || isDisabled),
      isHighlighted: state.context.highlightedValue === value,
      isSelected: state.context.value.includes(value),
    }
  }

  return {
    isFocused,
    isOpen,
    inputValue: state.context.inputValue,
    isInputValueEmpty: state.context.isInputValueEmpty,
    highlightedValue: state.context.highlightedValue,
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
    highlightValue(value) {
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
    open() {
      if (isOpen) return
      send("OPEN")
    },
    close() {
      if (!isOpen) return
      send("CLOSE")
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      dir: state.context.dir,
      id: dom.getRootId(state.context),
      "data-invalid": dataAttr(isInvalid),
      "data-readonly": dataAttr(isReadOnly),
    }),

    labelProps: normalize.label({
      ...parts.label.attrs,
      dir: state.context.dir,
      htmlFor: dom.getInputId(state.context),
      id: dom.getLabelId(state.context),
      "data-readonly": dataAttr(isReadOnly),
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "data-focus": dataAttr(isFocused),
      onClick(event) {
        if (!isDialogPopup) return
        event.preventDefault()
        dom.getTriggerEl(state.context)?.focus({ preventScroll: true })
      },
    }),

    controlProps: normalize.element({
      ...parts.control.attrs,
      dir: state.context.dir,
      id: dom.getControlId(state.context),
      "data-state": isOpen ? "open" : "closed",
      "data-focus": dataAttr(isFocused),
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
    }),

    positionerProps: normalize.element({
      ...parts.positioner.attrs,
      dir: state.context.dir,
      id: dom.getPositionerId(state.context),
      style: popperStyles.floating,
    }),

    inputProps: normalize.input({
      ...parts.input.attrs,
      dir: state.context.dir,
      "aria-invalid": ariaAttr(isInvalid),
      "data-invalid": dataAttr(isInvalid),
      name: state.context.name,
      form: state.context.form,
      disabled: isDisabled,
      autoFocus: state.context.autoFocus,
      autoComplete: "off",
      autoCorrect: "off",
      autoCapitalize: "none",
      spellCheck: "false",
      readOnly: isReadOnly,
      placeholder: state.context.placeholder,
      id: dom.getInputId(state.context),
      type: "text",
      role: "combobox",
      defaultValue: state.context.inputValue,
      "aria-autocomplete": state.context.autoComplete ? "both" : "list",
      "aria-controls": isDialogPopup ? dom.getListId(state.context) : dom.getContentId(state.context),
      "aria-expanded": isOpen,
      "data-state": isOpen ? "open" : "closed",
      "aria-activedescendant": state.context.highlightedValue
        ? dom.getItemId(state.context, state.context.highlightedValue)
        : undefined,
      onClick() {
        if (!state.context.openOnClick) return
        if (!isInteractive) return
        send("INPUT.CLICK")
      },
      onFocus() {
        if (isDisabled) return
        send("INPUT.FOCUS")
      },
      onBlur() {
        if (isDisabled) return
        send("INPUT.BLUR")
      },
      onChange(event) {
        send({ type: "INPUT.CHANGE", value: event.currentTarget.value })
      },
      onKeyDown(event) {
        if (!isInteractive) return

        const evt = getNativeEvent(event)
        if (evt.ctrlKey || evt.shiftKey || evt.isComposing) return

        const openOnKeyPress = state.context.openOnKeyPress
        const isModifierKey = event.ctrlKey || event.metaKey || event.shiftKey
        const keypress = true

        const keymap: EventKeyMap = {
          ArrowDown(event) {
            if (!openOnKeyPress && !isOpen) return
            send({ type: event.altKey ? "OPEN" : "INPUT.ARROW_DOWN", keypress })
            event.preventDefault()
          },
          ArrowUp() {
            if (!openOnKeyPress && !isOpen) return
            send({ type: event.altKey ? "CLOSE" : "INPUT.ARROW_UP", keypress })
            event.preventDefault()
          },
          Home(event) {
            if (isModifierKey) return
            send({ type: "INPUT.HOME", keypress })
            if (isOpen) {
              event.preventDefault()
            }
          },
          End(event) {
            if (isModifierKey) return
            send({ type: "INPUT.END", keypress })
            if (isOpen) {
              event.preventDefault()
            }
          },
          Enter(event) {
            if (evt.isComposing) return
            send({ type: "INPUT.ENTER", keypress })
            if (isOpen) {
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
    }),

    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      dir: state.context.dir,
      id: dom.getTriggerId(state.context),
      "aria-haspopup": isDialogPopup ? "dialog" : "listbox",
      type: "button",
      tabIndex: isDialogPopup ? 0 : -1,
      "aria-label": translations.triggerLabel,
      "aria-expanded": isOpen,
      "data-state": isOpen ? "open" : "closed",
      "aria-controls": isOpen ? dom.getContentId(state.context) : undefined,
      disabled: isDisabled,
      "data-readonly": dataAttr(isReadOnly),
      "data-disabled": dataAttr(isDisabled),
      onClick(event) {
        const evt = getNativeEvent(event)
        if (!isInteractive) return
        if (!isLeftClick(evt)) return
        send("TRIGGER.CLICK")
      },
      onPointerDown(event) {
        if (!isInteractive) return
        if (event.pointerType === "touch") return
        event.preventDefault()
        queueMicrotask(() => {
          dom.getInputEl(state.context)?.focus({ preventScroll: true })
        })
      },
      onKeyDown(event) {
        if (!isDialogPopup) return
        const keyMap: EventKeyMap = {
          ArrowDown() {
            send("INPUT.FOCUS")
            send("INPUT.ARROW_DOWN")
            raf(() => {
              dom.getInputEl(state.context)?.focus({ preventScroll: true })
            })
          },
          ArrowUp() {
            send("INPUT.FOCUS")
            send("INPUT.ARROW_UP")
            raf(() => {
              dom.getInputEl(state.context)?.focus({ preventScroll: true })
            })
          },
        }

        const key = getEventKey(event, state.context)
        const exec = keyMap[key]

        if (exec) {
          exec(event)
          event.preventDefault()
        }
      },
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      dir: state.context.dir,
      id: dom.getContentId(state.context),
      role: isDialogPopup ? "dialog" : "listbox",
      tabIndex: -1,
      hidden: !isOpen,
      "data-state": isOpen ? "open" : "closed",
      "aria-labelledby": dom.getLabelId(state.context),
      "aria-multiselectable": state.context.multiple && !isDialogPopup ? true : undefined,
      onPointerDown(event) {
        // prevent options or elements within listbox from taking focus
        event.preventDefault()
      },
    }),

    // only used when triggerOnly: true
    listProps: normalize.element({
      id: dom.getListId(state.context),
      role: isDialogPopup ? "listbox" : undefined,
      "aria-multiselectable": isDialogPopup && state.context.multiple ? true : undefined,
    }),

    clearTriggerProps: normalize.button({
      ...parts.clearTrigger.attrs,
      dir: state.context.dir,
      id: dom.getClearTriggerId(state.context),
      type: "button",
      tabIndex: -1,
      disabled: isDisabled,
      "aria-label": translations.clearTriggerLabel,
      "aria-controls": dom.getInputId(state.context),
      hidden: !state.context.value.length,
      onClick() {
        if (!isInteractive) return
        send({ type: "VALUE.CLEAR", src: "clear-trigger" })
      },
    }),

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
        "data-highlighted": dataAttr(itemState.isHighlighted),
        "data-state": itemState.isSelected ? "checked" : "unchecked",
        "aria-selected": itemState.isHighlighted,
        "aria-disabled": itemState.isDisabled,
        "data-disabled": dataAttr(itemState.isDisabled),
        "data-value": itemState.value,
        onPointerMove() {
          if (itemState.isDisabled) return
          send({ type: "ITEM.POINTER_MOVE", value })
        },
        onPointerLeave() {
          if (props.persistFocus) return
          if (itemState.isDisabled) return
          const mouseMoved = state.previousEvent.type === "ITEM.POINTER_MOVE"
          if (!mouseMoved) return
          send({ type: "ITEM.POINTER_LEAVE", value })
        },
        onPointerUp(event) {
          if (isDownloadingEvent(event)) return
          if (isOpeningInNewTab(event)) return
          if (isContextMenuEvent(event)) return
          if (itemState.isDisabled) return
          send({ type: "ITEM.CLICK", src: "pointerup", value })
        },
        onTouchEnd(event) {
          // prevent clicking elements behind content
          event.preventDefault()
          event.stopPropagation()
        },
      })
    },

    getItemTextProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemText.attrs,
        dir: state.context.dir,
        "data-disabled": dataAttr(itemState.isDisabled),
        "data-highlighted": dataAttr(itemState.isHighlighted),
      })
    },
    getItemIndicatorProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        "aria-hidden": true,
        ...parts.itemIndicator.attrs,
        dir: state.context.dir,
        "data-state": itemState.isSelected ? "checked" : "unchecked",
        hidden: !itemState.isSelected,
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
