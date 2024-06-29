import { getEventKey, isLeftClick, type EventKeyMap } from "@zag-js/dom-event"
import {
  ariaAttr,
  dataAttr,
  getByTypeahead,
  isEditableElement,
  isSelfTarget,
  isValidTabEvent,
  visuallyHiddenStyle,
} from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./select.anatomy"
import { dom } from "./select.dom"
import type { CollectionItem, ItemProps, ItemState, MachineApi, Send, State } from "./select.types"

export function connect<T extends PropTypes, V extends CollectionItem = CollectionItem>(
  state: State,
  send: Send,
  normalize: NormalizeProps<T>,
): MachineApi<T, V> {
  const disabled = state.context.isDisabled
  const invalid = state.context.invalid
  const readOnly = state.context.readOnly
  const interactive = state.context.isInteractive
  const composite = state.context.composite

  const open = state.hasTag("open")
  const focused = state.matches("focused")

  const highlightedValue = state.context.highlightedValue
  const highlightedItem = state.context.highlightedItem
  const selectedItems = state.context.selectedItems
  const isTypingAhead = state.context.isTypingAhead
  const collection = state.context.collection

  const ariaActiveDescendant = highlightedValue ? dom.getItemId(state.context, highlightedValue) : undefined

  function getItemState(props: ItemProps): ItemState {
    const _disabled = collection.getItemDisabled(props.item)
    const value = collection.getItemValue(props.item)!
    return {
      value,
      disabled: Boolean(disabled || _disabled),
      highlighted: highlightedValue === value,
      selected: state.context.value.includes(value),
    }
  }

  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: state.context.currentPlacement,
  })

  return {
    open: open,
    focused: focused,
    empty: state.context.value.length === 0,
    highlightedItem,
    highlightedValue,
    selectedItems,
    hasSelectedItems: state.context.hasSelectedItems,
    value: state.context.value,
    valueAsString: state.context.valueAsString,
    collection,
    setCollection(collection) {
      send({ type: "COLLECTION.SET", value: collection })
    },
    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options })
    },
    focus() {
      dom.getTriggerEl(state.context)?.focus({ preventScroll: true })
    },
    setOpen(nextOpen) {
      if (nextOpen === open) return
      send(nextOpen ? "OPEN" : "CLOSE")
    },
    selectValue(value) {
      send({ type: "ITEM.SELECT", value })
    },
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    selectAll() {
      send({ type: "VALUE.SET", value: collection.getValues() })
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
        dir: state.context.dir,
        id: dom.getLabelId(state.context),
        ...parts.label.attrs,
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        htmlFor: dom.getHiddenSelectId(state.context),
        onClick(event) {
          if (event.defaultPrevented) return
          if (disabled) return
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

    getValueTextProps() {
      return normalize.element({
        ...parts.valueText.attrs,
        dir: state.context.dir,
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-focus": dataAttr(focused),
      })
    },

    getTriggerProps() {
      return normalize.button({
        id: dom.getTriggerId(state.context),
        disabled: disabled,
        dir: state.context.dir,
        type: "button",
        role: "combobox",
        "aria-controls": dom.getContentId(state.context),
        "aria-expanded": open,
        "aria-haspopup": "listbox",
        "data-state": open ? "open" : "closed",
        "aria-invalid": invalid,
        "aria-labelledby": dom.getLabelId(state.context),
        ...parts.trigger.attrs,
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        "data-placement": state.context.currentPlacement,
        "data-placeholder-shown": dataAttr(!state.context.hasSelectedItems),
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          if (!interactive) return
          event.currentTarget.dataset.pointerType = event.pointerType
          if (disabled || event.pointerType === "touch") return
          send({ type: "TRIGGER.CLICK" })
        },
        onClick(event) {
          if (!interactive || event.button) return
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
          if (event.defaultPrevented) return
          if (!interactive) return

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
      })
    },

    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs,
        dir: state.context.dir,
        "aria-hidden": true,
        "data-state": open ? "open" : "closed",
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
      })
    },

    getItemProps(props) {
      const itemState = getItemState(props)

      return normalize.element({
        id: dom.getItemId(state.context, itemState.value),
        role: "option",
        ...parts.item.attrs,
        dir: state.context.dir,
        "data-value": itemState.value,
        "aria-selected": itemState.selected,
        "data-state": itemState.selected ? "checked" : "unchecked",
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-disabled": dataAttr(itemState.disabled),
        "aria-disabled": ariaAttr(itemState.disabled),
        onPointerMove(event) {
          if (itemState.disabled || event.pointerType !== "mouse") return
          if (itemState.value === state.context.highlightedValue) return
          send({ type: "ITEM.POINTER_MOVE", value: itemState.value })
        },
        onPointerUp() {
          if (itemState.disabled) return
          send({ type: "ITEM.CLICK", src: "pointerup", value: itemState.value })
        },
        onPointerLeave(event) {
          if (itemState.disabled) return
          if (props.persistFocus) return
          if (event.pointerType !== "mouse") return
          const isArrowKey = ["CONTENT.ARROW_UP", "CONTENT.ARROW_DOWN"].includes(state.event.type)
          if (isArrowKey) return
          send({ type: "ITEM.POINTER_LEAVE" })
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
        "data-state": itemState.selected ? "checked" : "unchecked",
        hidden: !itemState.selected,
      })
    },

    getItemGroupLabelProps(props) {
      const { htmlFor } = props
      return normalize.element({
        ...parts.itemGroupLabel.attrs,
        id: dom.getItemGroupLabelId(state.context, htmlFor),
        role: "group",
        dir: state.context.dir,
      })
    },

    getItemGroupProps(props) {
      const { id } = props
      return normalize.element({
        ...parts.itemGroup.attrs,
        "data-disabled": dataAttr(disabled),
        id: dom.getItemGroupId(state.context, id),
        "aria-labelledby": dom.getItemGroupLabelId(state.context, id),
        dir: state.context.dir,
      })
    },

    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs,
        id: dom.getClearTriggerId(state.context),
        type: "button",
        "aria-label": "Clear value",
        "data-invalid": dataAttr(invalid),
        disabled: disabled,
        hidden: !state.context.hasSelectedItems,
        dir: state.context.dir,
        onClick(event) {
          if (event.defaultPrevented) return
          send("CLEAR.CLICK")
        },
      })
    },

    getHiddenSelectProps() {
      return normalize.select({
        name: state.context.name,
        form: state.context.form,
        disabled: disabled,
        multiple: state.context.multiple,
        required: state.context.required,
        "aria-hidden": true,
        id: dom.getHiddenSelectId(state.context),
        defaultValue: state.context.multiple ? state.context.value : state.context.value[0],
        style: visuallyHiddenStyle,
        tabIndex: -1,
        // Some browser extensions will focus the hidden select.
        // Let's forward the focus to the trigger.
        onFocus() {
          dom.getTriggerEl(state.context)?.focus({ preventScroll: true })
        },
        "aria-labelledby": dom.getLabelId(state.context),
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

    getContentProps() {
      return normalize.element({
        hidden: !open,
        dir: state.context.dir,
        id: dom.getContentId(state.context),
        role: composite ? "listbox" : "dialog",
        ...parts.content.attrs,
        "data-state": open ? "open" : "closed",
        "data-placement": state.context.currentPlacement,
        "data-activedescendant": ariaActiveDescendant,
        "aria-activedescendant": composite ? ariaActiveDescendant : undefined,
        "aria-multiselectable": state.context.multiple && composite ? true : undefined,
        "aria-labelledby": dom.getLabelId(state.context),
        tabIndex: 0,
        onKeyDown(event) {
          if (!interactive) return
          if (!isSelfTarget(event)) return

          // select should not be navigated using tab key so we prevent it
          // but, we want to allow tabbing within the content when composing
          // with widgets like tabs or trees
          if (event.key === "Tab") {
            const valid = isValidTabEvent(event)
            if (!valid) {
              event.preventDefault()
              return
            }
          }

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
              send({ type: "ITEM.CLICK", src: "keydown.enter" })
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
      })
    },

    getListProps() {
      return normalize.element({
        ...parts.list.attrs,
        tabIndex: 0,
        role: !composite ? "listbox" : undefined,
        "aria-labelledby": dom.getTriggerId(state.context),
        "aria-activedescendant": !composite ? ariaActiveDescendant : undefined,
        "aria-multiselectable": !composite && state.context.multiple ? true : undefined,
      })
    },
  }
}
