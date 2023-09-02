import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import { ariaAttr, dataAttr, getByTypeahead, isEditableElement, isSelfEvent } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { visuallyHiddenStyle } from "@zag-js/visually-hidden"
import { parts } from "./select.anatomy"
import { dom } from "./select.dom"
import type {
  // MachineApi,
  ItemGroupLabelProps,
  ItemGroupProps,
  ItemProps,
  Send,
  State,
} from "./select.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isDisabled = state.context.isDisabled
  const isInvalid = state.context.invalid
  const isInteractive = state.context.isInteractive

  const isOpen = state.hasTag("open")

  const highlightedItem = state.context.highlightedItem
  const selectedItems = state.context.selectedItems
  const isTypingAhead = state.context.isTypingAhead

  function getItemState(props: ItemProps) {
    const { item } = props
    const disabled = state.context.collection.isItemDisabled(item)
    const key = state.context.collection.getItemKey(item)
    return {
      key,
      isDisabled: Boolean(disabled || isDisabled),
      isHighlighted: state.context.highlightedValue === key,
      isSelected: state.context.collection.hasItemKey(state.context.selectedItems, key),
    }
  }

  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: state.context.currentPlacement,
  })

  return {
    isOpen,
    highlightedItem,
    selectedItems,
    hasSelectedItems: state.context.hasSelectedItems,

    focus() {
      dom.getTriggerEl(state.context)?.focus({ preventScroll: true })
    },

    open() {
      send("OPEN")
    },

    close() {
      send("CLOSE")
    },

    selectValue(value: string) {
      send({ type: "SELECT_ITEM", value })
    },

    setValue(value: string[]) {
      send({ type: "SET_VALUE", value })
    },

    highlightValue(value: string) {
      send({ type: "HIGHLIGHT_ITEM", value })
    },

    clearValue(value?: string) {
      if (value) {
        send({ type: "CLEAR_ITEM", value })
      } else {
        send({ type: "CLEAR_VALUE" })
      }
    },

    getItemState,

    labelProps: normalize.label({
      dir: state.context.dir,
      id: dom.getLabelId(state.context),
      ...parts.label.attrs,
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "data-readonly": dataAttr(state.context.readOnly),
      htmlFor: dom.getHiddenSelectId(state.context),
      onClick() {
        if (isDisabled) return
        dom.getTriggerEl(state.context)?.focus({ preventScroll: true })
      },
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
      "data-readonly": dataAttr(state.context.readOnly),
      "data-placement": state.context.currentPlacement,
      "data-placeholder-shown": dataAttr(!state.context.hasSelectedItems),
      onPointerDown(event) {
        if (event.button || event.ctrlKey || !isInteractive) return
        event.currentTarget.dataset.pointerType = event.pointerType
        if (isDisabled || event.pointerType === "touch") return
        send({ type: "TRIGGER_CLICK" })
      },
      onClick(event) {
        if (!isInteractive || event.button) return
        if (event.currentTarget.dataset.pointerType === "touch") {
          send({ type: "TRIGGER_CLICK" })
        }
      },
      onFocus() {
        send("TRIGGER_FOCUS")
      },
      onBlur() {
        send("TRIGGER_BLUR")
      },
      onKeyDown(event) {
        if (!isInteractive) return
        const keyMap: EventKeyMap = {
          ArrowUp() {
            send({ type: "ARROW_UP" })
          },
          ArrowDown(event) {
            send({ type: event.altKey ? "OPEN" : "ARROW_DOWN" })
          },
          ArrowLeft() {
            send({ type: "ARROW_LEFT" })
          },
          ArrowRight() {
            send({ type: "ARROW_RIGHT" })
          },
          Home() {
            send({ type: "HOME" })
          },
          End() {
            send({ type: "END" })
          },
          Enter() {
            send({ type: "TRIGGER_KEY" })
          },
          Space(event) {
            if (isTypingAhead) {
              send({ type: "TYPEAHEAD", key: event.key })
            } else {
              send({ type: "TRIGGER_KEY" })
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
          send({ type: "TYPEAHEAD", key: event.key })
          event.preventDefault()
        }
      },
    }),

    getItemProps(props: ItemProps) {
      const optionState = getItemState(props)

      return normalize.element({
        id: dom.getItemId(state.context, optionState.key),
        role: "option",
        ...parts.item.attrs,
        dir: state.context.dir,
        "data-value": optionState.key,
        "aria-selected": optionState.isSelected,
        "data-state": optionState.isSelected ? "checked" : "unchecked",
        "data-highlighted": dataAttr(optionState.isHighlighted),
        "data-disabled": dataAttr(optionState.isDisabled),
        "aria-disabled": ariaAttr(optionState.isDisabled),
      })
    },

    getItemIndicatorProps(props: ItemProps) {
      const optionState = getItemState(props)
      return normalize.element({
        "aria-hidden": true,
        ...parts.itemIndicator.attrs,
        dir: state.context.dir,
        "data-state": optionState.isSelected ? "checked" : "unchecked",
        hidden: !optionState.isSelected,
      })
    },

    getItemGroupLabelProps(props: ItemGroupLabelProps) {
      const { htmlFor } = props
      return normalize.element({
        ...parts.itemGroupLabel.attrs,
        id: dom.getItemGroupId(state.context, htmlFor),
        role: "group",
        dir: state.context.dir,
      })
    },

    getItemGroupProps(props: ItemGroupProps) {
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
        send("CLEAR_VALUE")
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
      onPointerMove(event) {
        if (!isInteractive || event.pointerType !== "mouse") return
        const option = dom.getClosestOptionEl(event.target)
        if (!option || option.hasAttribute("data-disabled")) {
          send({ type: "POINTER_LEAVE" })
        } else {
          if (option.dataset.value === state.context.highlightedValue) return
          send({ type: "POINTER_MOVE", value: option.dataset.value })
        }
      },
      onPointerUp(event) {
        if (!isInteractive) return
        const option = dom.getClosestOptionEl(event.target)
        if (!option || option.hasAttribute("data-disabled")) return
        send({ type: "ITEM_CLICK", src: "pointerup", value: option.dataset.value })
      },
      onPointerLeave(event) {
        if (event.pointerType !== "mouse") return
        send({ type: "POINTER_LEAVE" })
      },
      onKeyDown(event) {
        if (!isInteractive || !isSelfEvent(event)) return

        const keyMap: EventKeyMap = {
          ArrowUp() {
            send({ type: "ARROW_UP" })
          },
          ArrowDown() {
            send({ type: "ARROW_DOWN" })
          },
          Home() {
            send({ type: "HOME" })
          },
          End() {
            send({ type: "END" })
          },
          Enter() {
            send({ type: "TRIGGER_KEY" })
          },
          Space(event) {
            if (isTypingAhead) {
              send({ type: "TYPEAHEAD", key: event.key })
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
          send({ type: "TYPEAHEAD", key: event.key })
          event.preventDefault()
        }
      },
    }),
  }
}
