import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import { ariaAttr, dataAttr, getByTypeahead, isEditableElement, isSelfEvent } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { visuallyHiddenStyle } from "@zag-js/visually-hidden"
import { parts } from "./select.anatomy"
import { dom } from "./select.dom"
import type { CollectionItem, ItemProps, MachineApi, Send, State } from "./select.types"

export function connect<T extends PropTypes, V extends CollectionItem = CollectionItem>(
  state: State,
  send: Send,
  normalize: NormalizeProps<T>,
): MachineApi<T, V> {
  const isDisabled = state.context.isDisabled
  const isInvalid = state.context.invalid
  const isReadOnly = state.context.readOnly
  const isInteractive = state.context.isInteractive

  const isOpen = state.hasTag("open")
  const isFocused = state.matches("focused")

  const highlightedItem = state.context.highlightedItem
  const selectedItems = state.context.selectedItems
  const isTypingAhead = state.context.isTypingAhead

  function getItemState(props: ItemProps) {
    const { item } = props
    const disabled = state.context.collection.isItemDisabled(item)
    const value = state.context.collection.itemToValue(item)
    return {
      value,
      isDisabled: Boolean(disabled || isDisabled),
      isHighlighted: state.context.highlightedValue === value,
      isSelected: state.context.value.includes(value),
    }
  }

  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: state.context.currentPlacement,
  })

  return {
    isOpen,
    isFocused,
    highlightedItem,
    highlightedValue: state.context.highlightedValue,
    selectedItems,
    hasSelectedItems: state.context.hasSelectedItems,
    value: state.context.value,
    valueAsString: state.context.valueAsString,
    setCollection(collection) {
      send({ type: "COLLECTION.SET", value: collection })
    },
    focus() {
      dom.getTriggerEl(state.context)?.focus({ preventScroll: true })
    },
    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },
    selectValue(value) {
      send({ type: "ITEM.SELECT", value })
    },
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    highlightValue(value) {
      send({ type: "HIGHLIGHTED_VALUE.SET", value })
    },
    clearValue(value) {
      if (value) {
        send({ type: "ITEM.CLEAR", value })
      } else {
        send({ type: "VALUE.CLEAR" })
      }
    },

    getItemState,

    rootProps: normalize.element({
      ...parts.root.attrs,
      dir: state.context.dir,
      id: dom.getRootId(state.context),
      "data-invalid": dataAttr(isInvalid),
      "data-readonly": dataAttr(isReadOnly),
    }),

    labelProps: normalize.label({
      dir: state.context.dir,
      id: dom.getLabelId(state.context),
      ...parts.label.attrs,
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "data-readonly": dataAttr(isReadOnly),
      htmlFor: dom.getHiddenSelectId(state.context),
      onClick() {
        if (isDisabled) return
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

    triggerProps: normalize.button({
      id: dom.getTriggerId(state.context),
      disabled: isDisabled,
      dir: state.context.dir,
      type: "button",
      "aria-controls": dom.getContentId(state.context),
      "aria-expanded": isOpen,
      "data-state": isOpen ? "open" : "closed",
      "aria-haspopup": "listbox",
      "aria-labelledby": dom.getLabelId(state.context),
      ...parts.trigger.attrs,
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "aria-invalid": isInvalid,
      "data-readonly": dataAttr(isReadOnly),
      "data-placement": state.context.currentPlacement,
      "data-placeholder-shown": dataAttr(!state.context.hasSelectedItems),
      onPointerDown(event) {
        if (event.button || event.ctrlKey || !isInteractive) return
        event.currentTarget.dataset.pointerType = event.pointerType
        if (isDisabled || event.pointerType === "touch") return
        send({ type: "TRIGGER.CLICK" })
      },
      onClick(event) {
        if (!isInteractive || event.button) return
        if (event.currentTarget.dataset.pointerType === "touch") {
          send({ type: "TRIGGER.CLICK" })
        }
      },
      onFocus() {
        send("TRIGGER.FOCUS")
      },
      onBlur() {
        send("TRIGGER.BLUR")
      },
      onKeyDown(event) {
        if (!isInteractive) return
        const keyMap: EventKeyMap = {
          ArrowUp() {
            send({ type: "TRIGGER.ARROW_UP" })
          },
          ArrowDown(event) {
            send({ type: event.altKey ? "OPEN" : "TRIGGER.ARROW_DOWN" })
          },
          ArrowLeft() {
            send({ type: "TRIGGER.ARROW_LEFT" })
          },
          ArrowRight() {
            send({ type: "TRIGGER.ARROW_RIGHT" })
          },
          Home() {
            send({ type: "TRIGGER.HOME" })
          },
          End() {
            send({ type: "TRIGGER.END" })
          },
          Enter() {
            send({ type: "TRIGGER.ENTER" })
          },
          Space(event) {
            if (isTypingAhead) {
              send({ type: "TRIGGER.TYPEAHEAD", key: event.key })
            } else {
              send({ type: "TRIGGER.ENTER" })
            }
          },
        }

        const exec = keyMap[getEventKey(event, state.context)]

        if (exec) {
          exec(event)
          event.preventDefault()
          return
        }

        if (getByTypeahead.isValidEvent(event)) {
          send({ type: "TRIGGER.TYPEAHEAD", key: event.key })
          event.preventDefault()
        }
      },
    }),

    getItemProps(props) {
      const itemState = getItemState(props)

      return normalize.element({
        id: dom.getItemId(state.context, itemState.value),
        role: "option",
        ...parts.item.attrs,
        dir: state.context.dir,
        "data-value": itemState.value,
        "aria-selected": itemState.isSelected,
        "data-state": itemState.isSelected ? "checked" : "unchecked",
        "data-highlighted": dataAttr(itemState.isHighlighted),
        "data-disabled": dataAttr(itemState.isDisabled),
        "aria-disabled": ariaAttr(itemState.isDisabled),
        onPointerMove(event) {
          if (itemState.isDisabled || event.pointerType !== "mouse") return
          if (itemState.value === state.context.highlightedValue) return
          send({ type: "ITEM.POINTER_MOVE", value: itemState.value })
        },
        onPointerUp() {
          if (itemState.isDisabled) return
          send({ type: "ITEM.CLICK", src: "pointerup", value: itemState.value })
        },
        onPointerLeave(event) {
          if (itemState.isDisabled || event.pointerType !== "mouse") return
          send({ type: "ITEM.POINTER_LEAVE" })
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

    getItemGroupLabelProps(props) {
      const { htmlFor } = props
      return normalize.element({
        ...parts.itemGroupLabel.attrs,
        id: dom.getItemGroupId(state.context, htmlFor),
        role: "group",
        dir: state.context.dir,
      })
    },

    getItemGroupProps(props) {
      const { id } = props
      return normalize.element({
        ...parts.itemGroup.attrs,
        "data-disabled": dataAttr(isDisabled),
        id: dom.getItemGroupId(state.context, id),
        "aria-labelledby": dom.getItemGroupLabelId(state.context, id),
        dir: state.context.dir,
      })
    },

    clearTriggerProps: normalize.button({
      ...parts.clearTrigger.attrs,
      id: dom.getClearTriggerId(state.context),
      type: "button",
      "aria-label": "Clear value",
      hidden: !state.context.hasSelectedItems,
      dir: state.context.dir,
      onClick() {
        send("VALUE.CLEAR")
      },
    }),

    hiddenSelectProps: normalize.select({
      name: state.context.name,
      form: state.context.form,
      disabled: !isInteractive,
      multiple: state.context.multiple,
      "aria-hidden": true,
      id: dom.getHiddenSelectId(state.context),
      // defaultValue: state.context.selectedOption?.value,
      style: visuallyHiddenStyle,
      tabIndex: -1,
      // Some browser extensions will focus the hidden select.
      // Let's forward the focus to the trigger.
      onFocus() {
        dom.getTriggerEl(state.context)?.focus({ preventScroll: true })
      },
      "aria-labelledby": dom.getLabelId(state.context),
    }),

    positionerProps: normalize.element({
      ...parts.positioner.attrs,
      id: dom.getPositionerId(state.context),
      style: popperStyles.floating,
    }),

    contentProps: normalize.element({
      hidden: !isOpen,
      dir: state.context.dir,
      id: dom.getContentId(state.context),
      role: "listbox",
      ...parts.content.attrs,
      "data-state": isOpen ? "open" : "closed",
      "aria-activedescendant": state.context.highlightedValue || "",
      "aria-multiselectable": state.context.multiple ? "true" : undefined,
      "aria-labelledby": dom.getLabelId(state.context),
      tabIndex: 0,
      onKeyDown(event) {
        if (!isInteractive || !isSelfEvent(event)) return

        const keyMap: EventKeyMap = {
          ArrowUp() {
            send({ type: "CONTENT.ARROW_UP" })
          },
          ArrowDown() {
            send({ type: "CONTENT.ARROW_DOWN" })
          },
          Home() {
            send({ type: "CONTENT.HOME" })
          },
          End() {
            send({ type: "CONTENT.END" })
          },
          Enter() {
            send({ type: "CONTENT.ENTER" })
          },
          Space(event) {
            if (isTypingAhead) {
              send({ type: "CONTENT.TYPEAHEAD", key: event.key })
            } else {
              keyMap.Enter?.(event)
            }
          },
        }

        const exec = keyMap[getEventKey(event)]

        if (exec) {
          exec(event)
          event.preventDefault()
          return
        }

        if (isEditableElement(event.target)) {
          return
        }

        if (getByTypeahead.isValidEvent(event)) {
          send({ type: "CONTENT.TYPEAHEAD", key: event.key })
          event.preventDefault()
        }
      },
    }),
  }
}
