import { isGridCollection, type CollectionItem } from "@zag-js/collection"
import type { Service } from "@zag-js/core"
import {
  ariaAttr,
  dataAttr,
  getByTypeahead,
  getEventKey,
  getEventTarget,
  isCtrlOrMetaKey,
  isEditableElement,
  isSelfTarget,
} from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { ensure } from "@zag-js/utils"
import { parts } from "./listbox.anatomy"
import * as dom from "./listbox.dom"
import type { ItemProps, ItemState, ListboxApi, ListboxSchema } from "./listbox.types"

export function connect<T extends PropTypes, V extends CollectionItem = CollectionItem>(
  service: Service<ListboxSchema<V>>,
  normalize: NormalizeProps<T>,
): ListboxApi<T, V> {
  const { context, prop, scope, computed, send } = service

  const disabled = prop("disabled")
  const collection = prop("collection")
  const layout = isGridCollection(collection) ? "grid" : "list"

  const value = context.get("value")
  const highlightedValue = context.get("highlightedValue")
  const highlightedItem = context.get("highlightedItem")
  const selectedItems = context.get("selectedItems")

  const isTypingAhead = computed("isTypingAhead")
  const interactive = computed("isInteractive")

  const ariaActiveDescendant = highlightedValue ? dom.getItemId(scope, highlightedValue) : undefined

  function getItemState(props: ItemProps): ItemState {
    const itemDisabled = collection.getItemDisabled(props.item)
    const value = collection.getItemValue(props.item)
    ensure(value, () => `[zag-js] No value found for item ${JSON.stringify(props.item)}`)
    return {
      value,
      disabled: Boolean(disabled || itemDisabled),
      highlighted: highlightedValue === value,
      selected: context.get("value").includes(value),
    }
  }

  return {
    empty: value.length === 0,
    highlightedItem,
    highlightedValue,
    selectedItems,
    hasSelectedItems: computed("hasSelectedItems"),
    value,
    valueAsString: context.get("valueAsString"),
    collection,
    disabled: !!disabled,
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
        dir: prop("dir"),
        id: dom.getRootId(scope),
        "data-orientation": prop("orientation"),
        "data-disabled": dataAttr(disabled),
      })
    },

    getLabelProps() {
      return normalize.element({
        dir: prop("dir"),
        id: dom.getLabelId(scope),
        ...parts.label.attrs,
        "data-disabled": dataAttr(disabled),
      })
    },

    getValueTextProps() {
      return normalize.element({
        ...parts.valueText.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
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
        "data-layout": layout,
        "data-state": itemState.selected ? "checked" : "unchecked",
        "data-orientation": prop("orientation"),
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-disabled": dataAttr(itemState.disabled),
        "aria-disabled": ariaAttr(itemState.disabled),
        onPointerMove(event) {
          if (!props.highlightOnHover) return
          if (itemState.disabled || event.pointerType !== "mouse") return
          if (itemState.highlighted) return
          send({ type: "ITEM.POINTER_MOVE", value: itemState.value })
        },
        onMouseDown(event) {
          event.preventDefault()
        },
        onClick(event) {
          if (event.defaultPrevented) return
          if (itemState.disabled) return
          send({
            type: "ITEM.CLICK",
            value: itemState.value,
            shiftKey: event.shiftKey,
            anchorValue: highlightedValue,
            metaKey: isCtrlOrMetaKey(event),
          })
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
        role: "group",
        dir: prop("dir"),
      })
    },

    getItemGroupProps(props) {
      const { id } = props
      return normalize.element({
        ...parts.itemGroup.attrs,
        "data-disabled": dataAttr(disabled),
        "data-orientation": prop("orientation"),
        id: dom.getItemGroupId(scope, id),
        "aria-labelledby": dom.getItemGroupLabelId(scope, id),
        dir: prop("dir"),
      })
    },

    getContentProps() {
      return normalize.element({
        dir: prop("dir"),
        id: dom.getContentId(scope),
        role: "listbox",
        ...parts.content.attrs,
        "data-activedescendant": ariaActiveDescendant,
        "aria-activedescendant": ariaActiveDescendant,
        "data-orientation": prop("orientation"),
        "aria-multiselectable": prop("selectionMode") === "multiple" ? true : undefined,
        "aria-labelledby": dom.getLabelId(scope),
        tabIndex: 0,
        "data-layout": layout,
        style: {
          "--column-count": isGridCollection(collection) ? collection.columnCount : 1,
        },
        onKeyDown(event) {
          if (!interactive) return
          if (!isSelfTarget(event)) return
          const shiftKey = event.shiftKey

          const keyMap: EventKeyMap = {
            ArrowUp(event) {
              let nextValue: string | null = null
              if (isGridCollection(collection) && highlightedValue) {
                nextValue = collection.getPreviousRowValue(highlightedValue)
              } else if (highlightedValue) {
                nextValue = collection.getPreviousValue(highlightedValue)
              }

              nextValue ||= collection.lastValue
              if (!nextValue) return

              event.preventDefault()
              send({ type: "NAVIGATE", value: nextValue, shiftKey, anchorValue: highlightedValue })
            },

            ArrowDown(event) {
              let nextValue: string | null = null
              if (isGridCollection(collection) && highlightedValue) {
                nextValue = collection.getNextRowValue(highlightedValue)
              } else if (highlightedValue) {
                nextValue = collection.getNextValue(highlightedValue)
              }

              nextValue ||= collection.firstValue
              if (!nextValue) return

              event.preventDefault()
              send({ type: "NAVIGATE", value: nextValue, shiftKey, anchorValue: highlightedValue })
            },

            ArrowLeft() {
              if (!isGridCollection(collection) && prop("orientation") === "vertical") return
              let nextValue = highlightedValue ? collection.getPreviousValue(highlightedValue) : null
              if (!nextValue && prop("loopFocus")) {
                nextValue = collection.lastValue
              }
              if (!nextValue) return
              event.preventDefault()
              send({ type: "NAVIGATE", value: nextValue, shiftKey, anchorValue: highlightedValue })
            },

            ArrowRight() {
              if (!isGridCollection(collection) && prop("orientation") === "vertical") return
              let nextValue = highlightedValue ? collection.getNextValue(highlightedValue) : null
              if (!nextValue && prop("loopFocus")) {
                nextValue = collection.firstValue
              }
              if (!nextValue) return
              event.preventDefault()
              send({ type: "NAVIGATE", value: nextValue, shiftKey, anchorValue: highlightedValue })
            },

            Home(event) {
              event.preventDefault()
              let nextValue = collection.firstValue
              send({ type: "NAVIGATE", value: nextValue, shiftKey, anchorValue: highlightedValue })
            },
            End(event) {
              event.preventDefault()
              let nextValue = collection.lastValue
              send({ type: "NAVIGATE", value: nextValue, shiftKey, anchorValue: highlightedValue })
            },
            Enter() {
              send({ type: "ITEM.CLICK", value: highlightedValue })
            },
            a(event) {
              if (isCtrlOrMetaKey(event) && prop("selectionMode") === "multiple" && !prop("disallowSelectAll")) {
                event.preventDefault()
                send({ type: "VALUE.SET", value: collection.getValues() })
              }
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
  }
}
