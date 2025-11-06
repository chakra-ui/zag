import { isGridCollection, type CollectionItem } from "@zag-js/collection"
import type { Service } from "@zag-js/core"
import {
  ariaAttr,
  contains,
  dataAttr,
  getByTypeahead,
  getEventKey,
  getEventTarget,
  getNativeEvent,
  isComposingEvent,
  isCtrlOrMetaKey,
  isEditableElement,
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
  const { context, prop, scope, computed, send, refs } = service

  const disabled = prop("disabled")
  const collection = prop("collection")
  const layout = isGridCollection(collection) ? "grid" : "list"

  const focused = context.get("focused")
  const focusVisible = refs.get("focusVisible") && focused

  const value = context.get("value")
  const selectedItems = context.get("selectedItems")

  const highlightedValue = context.get("highlightedValue")
  const highlightedItem = context.get("highlightedItem")

  const isTypingAhead = computed("isTypingAhead")
  const interactive = computed("isInteractive")

  const ariaActiveDescendant = highlightedValue ? dom.getItemId(scope, highlightedValue) : undefined

  function getItemState(props: ItemProps): ItemState {
    const itemDisabled = collection.getItemDisabled(props.item)
    const value = collection.getItemValue(props.item)
    ensure(value, () => `[zag-js] No value found for item ${JSON.stringify(props.item)}`)
    const highlighted = highlightedValue === value
    return {
      value,
      disabled: Boolean(disabled || itemDisabled),
      focused: highlighted && focused,
      focusVisible: highlighted && focusVisible,
      // deprecated
      highlighted: highlighted && focusVisible,
      selected: context.get("value").includes(value),
    }
  }

  return {
    empty: value.length === 0,
    highlightedItem,
    highlightedValue,
    clearHighlightedValue() {
      send({ type: "HIGHLIGHTED_VALUE.SET", value: null })
    },
    selectedItems,
    hasSelectedItems: computed("hasSelectedItems"),
    value,
    valueAsString: computed("valueAsString"),
    collection,
    disabled: !!disabled,
    selectValue(value) {
      send({ type: "ITEM.SELECT", value })
    },
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    selectAll() {
      if (!computed("multiple")) {
        throw new Error("[zag-js] Cannot select all items in a single-select listbox")
      }
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

    getInputProps(props = {}) {
      return normalize.input({
        ...parts.input.attrs,
        dir: prop("dir"),
        disabled,
        "data-disabled": dataAttr(disabled),
        autoComplete: "off",
        autoCorrect: "off",
        "aria-haspopup": "listbox",
        "aria-controls": dom.getContentId(scope),
        "aria-autocomplete": "list",
        "aria-activedescendant": ariaActiveDescendant,
        spellCheck: false,
        enterKeyHint: "go",
        onFocus() {
          queueMicrotask(() => {
            send({ type: "INPUT.FOCUS" })
          })
        },
        onBlur() {
          send({ type: "CONTENT.BLUR", src: "input" })
        },
        onInput(event) {
          if (!props.autoHighlight) return
          const node = event.currentTarget
          queueMicrotask(() => {
            if (!node.isConnected) return
            send({
              type: "HIGHLIGHTED_VALUE.SET",
              value: node.value ? prop("collection").firstValue : null,
            })
          })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (isComposingEvent(event)) return
          const nativeEvent = getNativeEvent(event)

          const forwardEvent = () => {
            event.preventDefault()
            const win = scope.getWin()
            const keyboardEvent = new win.KeyboardEvent(nativeEvent.type, nativeEvent)
            dom.getContentEl(scope)?.dispatchEvent(keyboardEvent)
          }

          switch (nativeEvent.key) {
            case "ArrowLeft":
            case "ArrowRight": {
              if (!isGridCollection(collection)) return
              if (event.ctrlKey) return
              forwardEvent()
            }

            case "Home":
            case "End": {
              if (highlightedValue == null && event.shiftKey) return
              forwardEvent()
            }

            case "ArrowDown":
            case "ArrowUp": {
              forwardEvent()
              break
            }

            case "Enter":
              if (highlightedValue != null) {
                event.preventDefault()
                send({ type: "ITEM.CLICK", value: highlightedValue })
              }
              break
            default:
              break
          }
        },
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
        "data-selected": dataAttr(itemState.selected),
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
          dom.getContentEl(scope)?.focus()
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
        ...parts.itemIndicator.attrs,
        "aria-hidden": true,
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
        "data-orientation": prop("orientation"),
        "data-empty": dataAttr(collection.size === 0),
        id: dom.getItemGroupId(scope, id),
        "aria-labelledby": dom.getItemGroupLabelId(scope, id),
        role: "group",
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
        "aria-multiselectable": computed("multiple") ? true : undefined,
        "aria-labelledby": dom.getLabelId(scope),
        tabIndex: 0,
        "data-layout": layout,
        "data-empty": dataAttr(collection.size === 0),
        style: {
          "--column-count": isGridCollection(collection) ? collection.columnCount : 1,
        },
        onFocus() {
          send({ type: "CONTENT.FOCUS" })
        },
        onBlur() {
          send({ type: "CONTENT.BLUR" })
        },
        onKeyDown(event) {
          if (!interactive) return
          if (!contains(event.currentTarget, getEventTarget(event))) return

          const shiftKey = event.shiftKey

          const keyMap: EventKeyMap = {
            ArrowUp(event) {
              let nextValue: string | null = null
              if (isGridCollection(collection) && highlightedValue) {
                nextValue = collection.getPreviousRowValue(highlightedValue)
              } else if (highlightedValue) {
                nextValue = collection.getPreviousValue(highlightedValue)
              }

              if (!nextValue && (prop("loopFocus") || !highlightedValue)) {
                nextValue = collection.lastValue
              }

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

              if (!nextValue && (prop("loopFocus") || !highlightedValue)) {
                nextValue = collection.firstValue
              }

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
              if (isCtrlOrMetaKey(event) && computed("multiple") && !prop("disallowSelectAll")) {
                event.preventDefault()
                send({ type: "VALUE.SET", value: collection.getValues() })
              }
            },
            Space(event) {
              if (isTypingAhead && prop("typeahead")) {
                send({ type: "CONTENT.TYPEAHEAD", key: event.key })
              } else {
                keyMap.Enter?.(event)
              }
            },
            Escape(event) {
              if (prop("deselectable") && value.length > 0) {
                event.preventDefault()
                event.stopPropagation()
                send({ type: "VALUE.CLEAR" })
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

          if (getByTypeahead.isValidEvent(event) && prop("typeahead")) {
            send({ type: "CONTENT.TYPEAHEAD", key: event.key })
            event.preventDefault()
          }
        },
      })
    },
  }
}
