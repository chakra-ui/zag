import {
  isGridCollection,
  type CollectionItem,
  type ListCollection,
  getSelectAllCoverage,
  selectAllValues,
} from "@zag-js/collection"
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
  isContextMenuEvent,
  isCtrlOrMetaKey,
  isDownloadingEvent,
  isEditableElement,
  isOpeningInNewTab,
} from "@zag-js/dom-query"
import { getInteractionModality } from "@zag-js/focus-visible"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { ensure } from "@zag-js/utils/guard"
import { parts } from "./listbox.anatomy"
import { SELECT_ALL_VALUE } from "./utils/select-all"
import * as dom from "./listbox.dom"
import type {
  ContentState,
  ItemProps,
  ItemState,
  ListboxApi,
  ListboxSchema,
  ListState,
  SelectAllState,
} from "./listbox.types"

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
  const inputState = refs.get("inputState")

  const value = context.get("value")
  const selectedItems = computed("selectedItems")

  const highlightedValue = context.get("highlightedValue")
  const highlightedItem = context.get("highlightedItem")

  const isTypingAhead = computed("isTypingAhead")
  const interactive = computed("isInteractive")

  const ariaActiveDescendant = highlightedValue ? dom.getItemId(scope, highlightedValue) : undefined

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  const listCollection = () => collection as ListCollection<CollectionItem>

  // Keyboard order: select-all (when rendered), then the items. Grids move by rows, so they skip it.
  function navigate() {
    const hasSelectAll = computed("multiple") && !isGridCollection(collection) && dom.isShown(dom.getSelectAllEl(scope))
    return listCollection().navigate({ before: hasSelectAll ? [SELECT_ALL_VALUE] : [] })
  }

  let selectAllState: SelectAllState | undefined
  function getSelectAllState(): SelectAllState {
    if (selectAllState) return selectAllState
    const { enabled, checked, indeterminate } = getSelectAllCoverage(listCollection(), value)
    selectAllState = {
      checked,
      indeterminate,
      highlighted: highlightedValue === SELECT_ALL_VALUE,
      disabled: !!disabled || enabled.length === 0,
    }
    return selectAllState
  }

  // Grids page by rows to keep the column
  function getPageStep() {
    const pageSize = prop("pageSize")
    return isGridCollection(collection) ? pageSize * collection.columnCount : pageSize
  }

  // Each part of an item asks for its state, so compute it once per item per render
  const itemStates = new Map<unknown, ItemState>()
  let selectedValues: Set<string> | undefined

  function getItemState(props: ItemProps): ItemState {
    const cached = itemStates.get(props.item)
    if (cached) return cached
    const itemDisabled = collection.getItemDisabled(props.item)
    const value = collection.getItemValue(props.item)
    ensure(value, () => `[zag-js] No value found for item ${JSON.stringify(props.item)}`)
    const highlighted = highlightedValue === value
    const state: ItemState = {
      value,
      disabled: Boolean(disabled || itemDisabled),
      focused: highlighted && focused,
      focusVisible: highlighted && focusVisible,
      // deprecated
      highlighted: highlighted && (inputState.focused ? focused : focusVisible),
      selected: (selectedValues ??= new Set(context.get("value"))).has(value),
    }
    itemStates.set(props.item, state)
    return state
  }

  function getContentState(): ContentState {
    return { orientation: prop("orientation") ?? "vertical", layout, empty: collection.size === 0 }
  }

  function getListState(): ListState {
    return {
      orientation: prop("orientation") ?? "vertical",
      layout,
      empty: collection.size === 0,
      multiple: computed("multiple"),
    }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    empty: value.length === 0,
    highlightedItem,
    highlightedValue,
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
      send({ type: "VALUE.SET", value: selectAllValues(listCollection(), value) })
    },
    setHighlightedValue(value) {
      send({ type: "HIGHLIGHTED_VALUE.SET", value })
    },
    highlightFirst() {
      send({ type: "HIGHLIGHT.FIRST" })
    },
    highlightLast() {
      send({ type: "HIGHLIGHT.LAST" })
    },
    highlightNext() {
      send({ type: "HIGHLIGHT.NEXT" })
    },
    highlightPrevious() {
      send({ type: "HIGHLIGHT.PREV" })
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
        ...parts.root.attrs(scope.id),
        dir: prop("dir"),
        "data-orientation": prop("orientation"),
        "data-disabled": dataAttr(disabled),
      })
    },

    getInputProps(props = {}) {
      const keyboardPriority = props.keyboardPriority ?? "caret"
      return normalize.input({
        ...parts.input.attrs(scope.id),
        dir: prop("dir"),
        disabled,
        "data-disabled": dataAttr(disabled),
        autoComplete: "off",
        autoCorrect: "off",
        "aria-haspopup": "listbox",
        "aria-controls": dom.getListId(scope),
        "aria-autocomplete": "list",
        "aria-activedescendant": ariaActiveDescendant,
        spellCheck: false,
        enterKeyHint: "go",
        onFocus() {
          queueMicrotask(() => {
            send({ type: "INPUT.FOCUS", autoHighlight: !!props?.autoHighlight })
          })
        },
        onBlur() {
          send({ type: "CONTENT.BLUR", src: "input" })
        },
        onInput(event) {
          if (!props?.autoHighlight) return
          if (event.currentTarget.value.trim()) return
          queueMicrotask(() => {
            send({ type: "HIGHLIGHTED_VALUE.SET", value: null })
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
            dom.getListEl(scope)?.dispatchEvent(keyboardEvent)
          }

          switch (nativeEvent.key) {
            case "ArrowLeft":
            case "ArrowRight": {
              if (!isGridCollection(collection)) return
              if (event.ctrlKey) return
              if (keyboardPriority !== "navigate") return
              forwardEvent()
              break
            }

            case "Home":
            case "End": {
              if (keyboardPriority !== "navigate") return
              if (highlightedValue == null && event.shiftKey) return
              forwardEvent()
              break
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
        ...parts.label.attrs(scope.id),
        "data-disabled": dataAttr(disabled),
      })
    },

    getValueTextProps() {
      return normalize.element({
        ...parts.valueText.attrs(scope.id),
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
      })
    },

    getItemProps(props) {
      const itemState = getItemState(props)

      return normalize.element({
        id: dom.getItemId(scope, itemState.value),
        role: "option",
        ...parts.item.attrs(scope.id),
        "data-type": "item",
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
          if (getInteractionModality() !== "pointer") return
          if (itemState.highlighted) return
          send({ type: "ITEM.POINTER_MOVE", value: itemState.value })
        },
        onMouseDown(event) {
          event.preventDefault()
          dom.getListEl(scope)?.focus()
        },
        onClick(event) {
          if (event.defaultPrevented) return
          if (isDownloadingEvent(event)) return
          if (isOpeningInNewTab(event)) return
          if (isContextMenuEvent(event)) return
          if (itemState.disabled) return
          send({
            type: "ITEM.CLICK",
            value: itemState.value,
            shiftKey: event.shiftKey,
            metaKey: isCtrlOrMetaKey(event),
          })
        },
      })
    },

    getSelectAllState,
    getSelectAllProps() {
      const selectAllState = getSelectAllState()
      const checkedState = selectAllState.checked
        ? "checked"
        : selectAllState.indeterminate
          ? "indeterminate"
          : "unchecked"
      return normalize.element({
        ...parts.item.attrs(scope.id),
        "data-type": "select-all",
        id: dom.getItemId(scope, SELECT_ALL_VALUE),
        role: "option",
        dir: prop("dir"),
        hidden: !computed("multiple") || isGridCollection(collection),
        "data-value": SELECT_ALL_VALUE,
        "aria-selected": selectAllState.checked,
        "aria-checked": selectAllState.indeterminate ? "mixed" : selectAllState.checked,
        "data-state": checkedState,
        "data-highlighted": dataAttr(selectAllState.highlighted),
        "data-disabled": dataAttr(selectAllState.disabled),
        "aria-disabled": ariaAttr(selectAllState.disabled),
        onPointerMove(event) {
          if (selectAllState.disabled || event.pointerType !== "mouse") return
          if (getInteractionModality() !== "pointer") return
          if (selectAllState.highlighted) return
          send({ type: "ITEM.POINTER_MOVE", value: SELECT_ALL_VALUE })
        },
        onMouseDown(event) {
          event.preventDefault()
          dom.getListEl(scope)?.focus()
        },
        onClick(event) {
          if (event.defaultPrevented || selectAllState.disabled) return
          send({ type: "ITEM.CLICK", value: SELECT_ALL_VALUE })
        },
      })
    },

    getItemTextProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemText.attrs(scope.id),
        "data-state": itemState.selected ? "checked" : "unchecked",
        "data-disabled": dataAttr(itemState.disabled),
        "data-highlighted": dataAttr(itemState.highlighted),
      })
    },

    getItemIndicatorProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemIndicator.attrs(scope.id),
        "aria-hidden": true,
        "data-state": itemState.selected ? "checked" : "unchecked",
        hidden: !itemState.selected,
      })
    },

    getItemGroupLabelProps(props) {
      const { htmlFor } = props
      return normalize.element({
        ...parts.itemGroupLabel.attrs(scope.id),
        id: dom.getItemGroupLabelId(scope, htmlFor),
        dir: prop("dir"),
        role: "presentation",
      })
    },

    getItemGroupProps(props) {
      const { id } = props
      return normalize.element({
        ...parts.itemGroup.attrs(scope.id),
        "data-disabled": dataAttr(disabled),
        "data-orientation": prop("orientation"),
        "data-empty": dataAttr(collection.size === 0),
        id: dom.getItemGroupId(scope, id),
        "aria-labelledby": dom.getItemGroupLabelId(scope, id),
        role: "group",
        dir: prop("dir"),
      })
    },

    getContentState,
    getContentProps() {
      const contentState = getContentState()
      return normalize.element({
        dir: prop("dir"),
        id: dom.getContentId(scope),
        ...parts.content.attrs(scope.id),
        "data-orientation": contentState.orientation,
        "data-layout": contentState.layout,
        "data-empty": dataAttr(contentState.empty),
        onKeyDown(event) {
          if (!interactive) return
          if (event.defaultPrevented) return
          const target = getEventTarget<Element>(event)
          if (!contains(event.currentTarget, getEventTarget(event))) return

          const shiftKey = event.shiftKey
          const loop = !!prop("loopFocus")

          // A grid moves by rows; a list moves through the select-all option too
          const keyMap: EventKeyMap = {
            ArrowUp(event) {
              if (!isGridCollection(collection) && prop("orientation") === "horizontal") return
              let nextValue: string | null = null
              if (isGridCollection(collection)) {
                if (highlightedValue) nextValue = collection.getPreviousRowValue(highlightedValue)
                if (!nextValue && (loop || !highlightedValue)) nextValue = collection.lastValue
              } else {
                nextValue = navigate().prev(highlightedValue, loop)
              }

              if (!nextValue) return

              event.preventDefault()
              send({ type: "NAVIGATE", value: nextValue, shiftKey })
            },

            ArrowDown(event) {
              if (!isGridCollection(collection) && prop("orientation") === "horizontal") return
              let nextValue: string | null = null
              if (isGridCollection(collection)) {
                if (highlightedValue) nextValue = collection.getNextRowValue(highlightedValue)
                if (!nextValue && (loop || !highlightedValue)) nextValue = collection.firstValue
              } else {
                nextValue = navigate().next(highlightedValue, loop)
              }

              if (!nextValue) return
              event.preventDefault()
              send({ type: "NAVIGATE", value: nextValue, shiftKey })
            },

            ArrowLeft() {
              if (!isGridCollection(collection) && prop("orientation") === "vertical") return
              const nextValue = navigate().prev(highlightedValue, loop)
              if (!nextValue) return
              event.preventDefault()
              send({ type: "NAVIGATE", value: nextValue, shiftKey })
            },

            ArrowRight() {
              if (!isGridCollection(collection) && prop("orientation") === "vertical") return
              const nextValue = navigate().next(highlightedValue, loop)
              if (!nextValue) return
              event.preventDefault()
              send({ type: "NAVIGATE", value: nextValue, shiftKey })
            },

            Home(event) {
              if (isEditableElement(target)) return
              event.preventDefault()
              const nextValue = navigate().first
              send({ type: "NAVIGATE", value: nextValue, shiftKey })
            },
            End(event) {
              if (isEditableElement(target)) return
              event.preventDefault()
              const nextValue = navigate().last
              send({ type: "NAVIGATE", value: nextValue, shiftKey })
            },
            PageDown(event) {
              event.preventDefault()
              const step = getPageStep()
              const nextValue = collection.has(highlightedValue)
                ? (collection.getNextValue(highlightedValue, step, true) ?? collection.lastValue)
                : collection.firstValue
              if (!nextValue) return
              send({ type: "NAVIGATE", value: nextValue, shiftKey })
            },
            PageUp(event) {
              event.preventDefault()
              const step = getPageStep()
              const nextValue = collection.has(highlightedValue)
                ? (collection.getPreviousValue(highlightedValue, step, true) ?? collection.firstValue)
                : collection.lastValue
              if (!nextValue) return
              send({ type: "NAVIGATE", value: nextValue, shiftKey })
            },
            Enter() {
              send({ type: "ITEM.CLICK", value: highlightedValue })
            },
            a(event) {
              if (isCtrlOrMetaKey(event) && computed("multiple") && !prop("disallowSelectAll")) {
                event.preventDefault()
                send({ type: "VALUE.SET", value: selectAllValues(listCollection(), value) })
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

          const key = getEventKey(event, { dir: prop("dir") })
          // `a` is only a shortcut with the ctrl or meta key (select all), otherwise let it reach typeahead
          const exec = key === "a" && !isCtrlOrMetaKey(event) ? undefined : keyMap[key]

          if (exec) {
            exec(event)
            return
          }

          if (isEditableElement(target)) return

          if (getByTypeahead.isValidEvent(event) && prop("typeahead")) {
            send({ type: "CONTENT.TYPEAHEAD", key: event.key })
            event.preventDefault()
          }
        },
      })
    },

    getListState,
    getEmptyProps() {
      return normalize.element({
        ...parts.empty.attrs(scope.id),
        dir: prop("dir"),
        role: "status",
        "aria-live": "polite",
        "aria-atomic": true,
      })
    },

    getListProps() {
      const listState = getListState()
      return normalize.element({
        dir: prop("dir"),
        id: dom.getListId(scope),
        role: "listbox",
        ...parts.list.attrs(scope.id),
        "data-activedescendant": ariaActiveDescendant,
        "aria-activedescendant": ariaActiveDescendant,
        "data-orientation": listState.orientation,
        "aria-multiselectable": listState.multiple ? true : undefined,
        "aria-labelledby": dom.getLabelId(scope),
        tabIndex: 0,
        "data-layout": listState.layout,
        "data-empty": dataAttr(listState.empty),
        style: {
          "--column-count": isGridCollection(collection) ? collection.columnCount : 1,
        },
        onFocus() {
          send({ type: "CONTENT.FOCUS" })
        },
        onBlur() {
          send({ type: "CONTENT.BLUR" })
        },
      })
    },
  }
}
