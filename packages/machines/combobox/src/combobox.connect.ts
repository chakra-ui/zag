import { getEventKey, getNativeEvent, isContextMenuEvent, isLeftClick, type EventKeyMap } from "@zag-js/dom-event"
import { ariaAttr, dataAttr, raf } from "@zag-js/dom-query"
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

  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: state.context.currentPlacement,
  })

  function getItemState(props: ItemProps) {
    const { item } = props
    const value = collection.itemToValue(item)
    return {
      value,
      isDisabled: collection.isItemDisabled(item),
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
      send("OPEN")
    },
    close() {
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
      id: dom.getPositionerId(state.context),
      hidden: !isOpen,
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
      defaultValue: state.context.inputValue || state.context.valueAsString,
      "aria-autocomplete": state.context.autoComplete ? "both" : "list",
      "aria-controls": isOpen ? dom.getContentId(state.context) : undefined,
      "aria-expanded": isOpen,
      "data-state": isOpen ? "open" : "closed",
      "aria-activedescendant": state.context.highlightedValue
        ? dom.getItemId(state.context, state.context.highlightedValue)
        : undefined,
      onCompositionStart() {
        send("INPUT.COMPOSITION_START")
      },
      onCompositionEnd() {
        raf(() => {
          send("INPUT.COMPOSITION_END")
        })
      },
      onClick() {
        if (!isInteractive) return
        send("INPUT.CLICK")
      },
      onFocus() {
        if (isDisabled) return
        send("INPUT.FOCUS")
      },
      onChange(event) {
        send({ type: "INPUT.CHANGE", value: event.currentTarget.value })
      },
      onKeyDown(event) {
        if (!isInteractive) return

        const evt = getNativeEvent(event)
        if (evt.ctrlKey || evt.shiftKey || evt.isComposing) return

        const keymap: EventKeyMap = {
          ArrowDown(event) {
            send({ type: event.altKey ? "INPUT.ARROW_DOWN+ALT" : "INPUT.ARROW_DOWN" })
            event.preventDefault()
            event.stopPropagation()
          },
          ArrowUp() {
            send(event.altKey ? "INPUT.ARROW_UP+ALT" : "INPUT.ARROW_UP")
            event.preventDefault()
            event.stopPropagation()
          },
          Home(event) {
            const isModified = event.ctrlKey || event.metaKey || event.shiftKey
            if (isModified) return
            send("INPUT.HOME")
            if (isOpen) {
              event.preventDefault()
              event.stopPropagation()
            }
          },
          End(event) {
            const isModified = event.ctrlKey || event.metaKey || event.shiftKey
            if (isModified) return
            send("INPUT.END")
            if (isOpen) {
              event.preventDefault()
              event.stopPropagation()
            }
          },
          Enter() {
            if (state.context.composing) return
            send("INPUT.ENTER")
            event.preventDefault()
            event.stopPropagation()
          },
          Escape() {
            send("INPUT.ESCAPE")
            event.preventDefault()
            // don't stop propagation. this is handled by the dismissable layer
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
      "aria-haspopup": "listbox",
      type: "button",
      tabIndex: -1,
      "aria-label": translations.triggerLabel,
      "aria-expanded": isOpen,
      "data-state": isOpen ? "open" : "closed",
      "aria-controls": isOpen ? dom.getContentId(state.context) : undefined,
      disabled: isDisabled,
      "data-readonly": dataAttr(isReadOnly),
      "data-disabled": dataAttr(isDisabled),
      onPointerDown(event) {
        const evt = getNativeEvent(event)
        if (!isInteractive || !isLeftClick(evt) || evt.pointerType === "touch") return
        send("TRIGGER.CLICK")
        event.preventDefault()
      },
      onPointerUp(event) {
        if (event.pointerType !== "touch") return
        send("TRIGGER.CLICK")
      },
      style: { outline: 0 },
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      dir: state.context.dir,
      id: dom.getContentId(state.context),
      role: "listbox",
      tabIndex: -1,
      hidden: !isOpen,
      "data-state": isOpen ? "open" : "closed",
      "aria-labelledby": dom.getLabelId(state.context),
      "aria-multiselectable": state.context.multiple ? true : undefined,
      onPointerDown(event) {
        // prevent options or elements within listbox from taking focus
        event.preventDefault()
      },
    }),

    clearTriggerProps: normalize.button({
      ...parts.clearTrigger.attrs,
      dir: state.context.dir,
      id: dom.getClearTriggerId(state.context),
      type: "button",
      tabIndex: -1,
      disabled: isDisabled,
      "aria-label": translations.clearTriggerLabel,
      hidden: state.context.isInputValueEmpty,
      onPointerDown(event) {
        const evt = getNativeEvent(event)
        if (!isInteractive || !isLeftClick(evt)) return
        send({ type: "VALUE.CLEAR", src: "clear-trigger" })
        event.preventDefault()
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
          send({ type: "ITEM.POINTER_OVER", value })
        },
        onPointerLeave() {
          if (itemState.isDisabled) return
          send({ type: "ITEM.POINTER_LEAVE", value })
        },
        onPointerUp(event) {
          if (itemState.isDisabled || isContextMenuEvent(event)) return
          send({ type: "ITEM.CLICK", src: "pointerup", value })
        },
        onAuxClick(event) {
          if (itemState.isDisabled || isContextMenuEvent(event)) return
          event.preventDefault()
          send({ type: "ITEM.CLICK", src: "auxclick", value })
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
