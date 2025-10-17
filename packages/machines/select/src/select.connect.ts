import type { Service } from "@zag-js/core"
import {
  ariaAttr,
  dataAttr,
  getByTypeahead,
  getEventKey,
  getEventTarget,
  isEditableElement,
  contains,
  isValidTabEvent,
  visuallyHiddenStyle,
} from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { ensure } from "@zag-js/utils"
import { parts } from "./select.anatomy"
import * as dom from "./select.dom"
import type { CollectionItem, ItemProps, ItemState, SelectApi, SelectSchema } from "./select.types"

export function connect<T extends PropTypes, V extends CollectionItem = CollectionItem>(
  service: Service<SelectSchema<V>>,
  normalize: NormalizeProps<T>,
): SelectApi<T, V> {
  const { context, prop, scope, state, computed, send } = service

  const disabled = prop("disabled") || context.get("fieldsetDisabled")
  const invalid = !!prop("invalid")
  const required = !!prop("required")
  const readOnly = !!prop("readOnly")
  const composite = prop("composite")
  const collection = prop("collection")

  const open = state.hasTag("open")
  const focused = state.matches("focused")

  const highlightedValue = context.get("highlightedValue")
  const highlightedItem = context.get("highlightedItem")
  const selectedItems = context.get("selectedItems")
  const currentPlacement = context.get("currentPlacement")

  const isTypingAhead = computed("isTypingAhead")
  const interactive = computed("isInteractive")

  const ariaActiveDescendant = highlightedValue ? dom.getItemId(scope, highlightedValue) : undefined

  function getItemState(props: ItemProps): ItemState {
    const _disabled = collection.getItemDisabled(props.item)
    const value = collection.getItemValue(props.item)
    ensure(value, () => `[zag-js] No value found for item ${JSON.stringify(props.item)}`)
    return {
      value,
      disabled: Boolean(disabled || _disabled),
      highlighted: highlightedValue === value,
      selected: context.get("value").includes(value),
    }
  }

  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: currentPlacement,
  })

  return {
    open: open,
    focused: focused,
    empty: context.get("value").length === 0,
    highlightedItem,
    highlightedValue,
    selectedItems,
    hasSelectedItems: computed("hasSelectedItems"),
    value: context.get("value"),
    valueAsString: computed("valueAsString"),
    collection,
    multiple: !!prop("multiple"),
    disabled: !!disabled,
    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options })
    },
    focus() {
      dom.getTriggerEl(scope)?.focus({ preventScroll: true })
    },
    setOpen(nextOpen) {
      const open = state.hasTag("open")
      if (open === nextOpen) return
      send({ type: nextOpen ? "OPEN" : "CLOSE" })
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
    setHighlightValue(value) {
      send({ type: "HIGHLIGHTED_VALUE.SET", value })
    },
    clearHighlightValue() {
      send({ type: "HIGHLIGHTED_VALUE.CLEAR" })
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
        dir: prop("dir"),
        id: dom.getRootId(scope),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
      })
    },

    getLabelProps() {
      return normalize.label({
        dir: prop("dir"),
        id: dom.getLabelId(scope),
        ...parts.label.attrs,
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        "data-required": dataAttr(required),
        htmlFor: dom.getHiddenSelectId(scope),
        onClick(event) {
          if (event.defaultPrevented) return
          if (disabled) return
          dom.getTriggerEl(scope)?.focus({ preventScroll: true })
        },
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        dir: prop("dir"),
        id: dom.getControlId(scope),
        "data-state": open ? "open" : "closed",
        "data-focus": dataAttr(focused),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
      })
    },

    getValueTextProps() {
      return normalize.element({
        ...parts.valueText.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-focus": dataAttr(focused),
      })
    },

    getTriggerProps() {
      return normalize.button({
        id: dom.getTriggerId(scope),
        disabled: disabled,
        dir: prop("dir"),
        type: "button",
        role: "combobox",
        "aria-controls": dom.getContentId(scope),
        "aria-expanded": open,
        "aria-haspopup": "listbox",
        "data-state": open ? "open" : "closed",
        "aria-invalid": invalid,
        "aria-required": required,
        "aria-labelledby": dom.getLabelId(scope),
        ...parts.trigger.attrs,
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        "data-placement": currentPlacement,
        "data-placeholder-shown": dataAttr(!computed("hasSelectedItems")),
        onClick(event) {
          if (!interactive) return
          if (event.defaultPrevented) return
          send({ type: "TRIGGER.CLICK" })
        },
        onFocus() {
          send({ type: "TRIGGER.FOCUS" })
        },
        onBlur() {
          send({ type: "TRIGGER.BLUR" })
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

          const exec =
            keyMap[
              getEventKey(event, {
                dir: prop("dir"),
                orientation: "vertical",
              })
            ]

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
        dir: prop("dir"),
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
        id: dom.getItemId(scope, itemState.value),
        role: "option",
        ...parts.item.attrs,
        dir: prop("dir"),
        "data-value": itemState.value,
        "aria-selected": itemState.selected,
        "data-state": itemState.selected ? "checked" : "unchecked",
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-disabled": dataAttr(itemState.disabled),
        "aria-disabled": ariaAttr(itemState.disabled),
        onPointerMove(event) {
          if (itemState.disabled || event.pointerType !== "mouse") return
          if (itemState.value === highlightedValue) return
          send({ type: "ITEM.POINTER_MOVE", value: itemState.value })
        },
        onClick(event) {
          if (event.defaultPrevented) return
          if (itemState.disabled) return
          send({ type: "ITEM.CLICK", src: "pointerup", value: itemState.value })
        },
        onPointerLeave(event) {
          if (itemState.disabled) return
          if (props.persistFocus) return
          if (event.pointerType !== "mouse") return

          const pointerMoved = service.event.previous()?.type.includes("POINTER")
          if (!pointerMoved) return

          send({ type: "ITEM.POINTER_LEAVE" })
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
        id: dom.getItemGroupLabelId(scope, htmlFor),
        dir: prop("dir"),
        role: "presentation",
      })
    },

    getItemGroupProps(props) {
      const { id } = props
      return normalize.element({
        ...parts.itemGroup.attrs,
        "data-disabled": dataAttr(disabled),
        id: dom.getItemGroupId(scope, id),
        "aria-labelledby": dom.getItemGroupLabelId(scope, id),
        role: "group",
        dir: prop("dir"),
      })
    },

    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs,
        id: dom.getClearTriggerId(scope),
        type: "button",
        "aria-label": "Clear value",
        "data-invalid": dataAttr(invalid),
        disabled: disabled,
        hidden: !computed("hasSelectedItems"),
        dir: prop("dir"),
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: "CLEAR.CLICK" })
        },
      })
    },

    getHiddenSelectProps() {
      const value = context.get("value")
      const defaultValue = prop("multiple") ? value : value?.[0]
      return normalize.select({
        name: prop("name"),
        form: prop("form"),
        disabled: disabled,
        multiple: prop("multiple"),
        required: prop("required"),
        "aria-hidden": true,
        id: dom.getHiddenSelectId(scope),
        defaultValue,
        style: visuallyHiddenStyle,
        tabIndex: -1,
        // Some browser extensions will focus the hidden select.
        // Let's forward the focus to the trigger.
        onFocus() {
          dom.getTriggerEl(scope)?.focus({ preventScroll: true })
        },
        "aria-labelledby": dom.getLabelId(scope),
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs,
        dir: prop("dir"),
        id: dom.getPositionerId(scope),
        style: popperStyles.floating,
      })
    },

    getContentProps() {
      return normalize.element({
        hidden: !open,
        dir: prop("dir"),
        id: dom.getContentId(scope),
        role: composite ? "listbox" : "dialog",
        ...parts.content.attrs,
        "data-state": open ? "open" : "closed",
        "data-placement": currentPlacement,
        "data-activedescendant": ariaActiveDescendant,
        "aria-activedescendant": composite ? ariaActiveDescendant : undefined,
        "aria-multiselectable": prop("multiple") && composite ? true : undefined,
        "aria-labelledby": dom.getLabelId(scope),
        tabIndex: 0,
        onKeyDown(event) {
          if (!interactive) return
          if (!contains(event.currentTarget, getEventTarget(event))) return

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

          const target = getEventTarget<Element>(event)

          if (isEditableElement(target)) {
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
        "aria-labelledby": dom.getTriggerId(scope),
        "aria-activedescendant": !composite ? ariaActiveDescendant : undefined,
        "aria-multiselectable": !composite && prop("multiple") ? true : undefined,
      })
    },
  }
}
