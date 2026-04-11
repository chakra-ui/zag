import { isGridCollection, type CollectionItem } from "@zag-js/collection"
import type { Service } from "@zag-js/core"
import {
  ariaAttr,
  contains,
  dataAttr,
  getByTypeahead,
  getEventKey,
  getEventTarget,
  getFocusables,
  isCtrlOrMetaKey,
  isEditableElement,
  isFocusable,
} from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { ensure } from "@zag-js/utils"
import { parts } from "./gridlist.anatomy"
import * as dom from "./gridlist.dom"
import type {
  CellProps,
  GridListApi,
  GridListSchema,
  ItemCheckboxProps,
  ItemGroupLabelProps,
  ItemGroupProps,
  ItemProps,
  ItemState,
  NavigateDetails,
} from "./gridlist.types"

export function connect<T extends PropTypes, V extends CollectionItem = CollectionItem>(
  service: Service<GridListSchema<V>>,
  normalize: NormalizeProps<T>,
): GridListApi<T, V> {
  const { context, prop, scope, computed, send, refs } = service

  const disabled = prop("disabled")
  const collection = prop("collection")

  const focused = context.get("focused")
  const focusVisible = refs.get("focusVisible") && focused

  const value = context.get("value")
  const selectedItems = computed("selectedItems")

  const focusedValue = context.get("focusedValue")
  const focusedItem = context.get("focusedItem")

  const interactive = computed("isInteractive")
  const multiple = computed("multiple")
  const isEmpty = collection.size === 0
  const isGrid = isGridCollection(collection)
  const layout: "stack" | "grid" = isGrid ? "grid" : "stack"
  const columnCount = isGrid ? collection.columnCount : 1

  function getItemState(props: ItemProps): ItemState {
    const itemDisabled = collection.getItemDisabled(props.item)
    const v = collection.getItemValue(props.item)
    ensure(v, () => `[zag-js] No value found for item ${JSON.stringify(props.item)}`)
    const rowFocused = focusedValue === v
    return {
      value: v,
      disabled: Boolean(disabled || itemDisabled),
      focused: rowFocused && focused,
      focusVisible: rowFocused && focusVisible,
      selected: value.includes(v),
    }
  }

  function invokeNavigate(rowValue: string, href: string, node: HTMLElement): boolean {
    let defaultPrevented = false
    const details: NavigateDetails = {
      value: rowValue,
      href,
      node,
      preventDefault() {
        defaultPrevented = true
      },
    }
    prop("onNavigate")?.(details)
    return !defaultPrevented
  }

  return {
    empty: isEmpty,
    focusedItem,
    focusedValue,
    setFocusedValue(value) {
      send({ type: "FOCUSED_VALUE.SET", value })
    },
    selectedItems,
    hasSelectedItems: computed("hasSelectedItems"),
    value,
    valueAsString: computed("valueAsString"),
    collection,
    disabled: !!disabled,
    hasCheckbox: computed("hasCheckbox"),
    selectValue(value) {
      send({ type: "ITEM.SELECT", value })
    },
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    selectAll() {
      if (!multiple) {
        throw new Error("[zag-js] Cannot select all items when selectionMode is not 'multiple'")
      }
      send({ type: "VALUE.SET", value: collection.getValues() })
    },
    clearValue(value?) {
      if (value) {
        send({ type: "VALUE.CLEAR", value })
      } else {
        send({ type: "VALUE.CLEAR" })
      }
    },

    getItemState,

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getRootId(scope),
        "data-disabled": dataAttr(disabled),
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

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getContentId(scope),
        role: "grid",
        "data-disabled": dataAttr(disabled),
        "data-empty": dataAttr(isEmpty),
        "data-layout": layout,
        "data-focusedvalue": focusedValue ?? undefined,
        "aria-multiselectable": multiple ? true : undefined,
        "aria-labelledby": dom.getLabelId(scope),
        "aria-colcount": isGrid ? columnCount : undefined,
        tabIndex: isEmpty ? 0 : undefined,
        style: isGrid ? { "--column-count": columnCount } : undefined,
        onKeyDown(event) {
          if (!interactive) return
          if (!contains(event.currentTarget, getEventTarget(event))) return

          const shiftKey = event.shiftKey

          const keyMap: EventKeyMap = {
            ArrowUp(event) {
              event.preventDefault()
              const current = context.get("focusedValue")
              let nextValue: string | null = null
              if (current) {
                nextValue = isGrid
                  ? collection.getPreviousRowValue(current, prop("loopFocus"))
                  : collection.getPreviousValue(current)
              }

              if (!nextValue) {
                if (prop("loopFocus") || !current) {
                  nextValue = collection.lastValue
                }
              }

              if (!nextValue) return
              send({ type: "NAVIGATE", value: nextValue, shiftKey, anchorValue: current })
            },

            ArrowDown(event) {
              event.preventDefault()
              const current = context.get("focusedValue")
              let nextValue: string | null = null
              if (current) {
                nextValue = isGrid
                  ? collection.getNextRowValue(current, prop("loopFocus"))
                  : collection.getNextValue(current)
              }

              if (!nextValue) {
                if (prop("loopFocus") || !current) {
                  nextValue = collection.firstValue
                }
              }

              if (!nextValue) return
              send({ type: "NAVIGATE", value: nextValue, shiftKey, anchorValue: current })
            },

            ArrowLeft(event) {
              if (!isGrid) return
              event.preventDefault()
              const current = context.get("focusedValue")
              let nextValue = current ? collection.getPreviousValue(current) : null
              if (!nextValue && prop("loopFocus")) {
                nextValue = collection.lastValue
              }
              if (!nextValue) return
              send({ type: "NAVIGATE", value: nextValue, shiftKey, anchorValue: current })
            },

            ArrowRight(event) {
              if (!isGrid) return
              event.preventDefault()
              const current = context.get("focusedValue")
              let nextValue = current ? collection.getNextValue(current) : null
              if (!nextValue && prop("loopFocus")) {
                nextValue = collection.firstValue
              }
              if (!nextValue) return
              send({ type: "NAVIGATE", value: nextValue, shiftKey, anchorValue: current })
            },

            Home(event) {
              event.preventDefault()
              const current = context.get("focusedValue")
              const nextValue = collection.firstValue
              if (!nextValue) return
              send({ type: "NAVIGATE", value: nextValue, shiftKey, anchorValue: current })
            },
            End(event) {
              event.preventDefault()
              const current = context.get("focusedValue")
              const nextValue = collection.lastValue
              if (!nextValue) return
              send({ type: "NAVIGATE", value: nextValue, shiftKey, anchorValue: current })
            },
            PageUp(event) {
              event.preventDefault()
              const current = context.get("focusedValue")
              const nextValue = collection.getPreviousValue(current, prop("pageSize"), true) ?? collection.firstValue
              if (!nextValue) return
              send({ type: "NAVIGATE", value: nextValue, shiftKey, anchorValue: current })
            },
            PageDown(event) {
              event.preventDefault()
              const current = context.get("focusedValue")
              const nextValue = collection.getNextValue(current, prop("pageSize"), true) ?? collection.lastValue
              if (!nextValue) return
              send({ type: "NAVIGATE", value: nextValue, shiftKey, anchorValue: current })
            },
            Enter(event) {
              const target = getEventTarget<HTMLElement>(event)
              const isCheckbox = (target as HTMLElement | null)?.getAttribute?.("role") === "checkbox"
              const isRow = (target as HTMLElement | null)?.getAttribute?.("role") === "row"

              if (isCheckbox) return

              // Don't handle Enter on interactive children (but allow rows)
              if (target && target !== event.currentTarget && !isRow && isFocusable(target)) {
                return
              }

              const current = context.get("focusedValue")
              if (current == null) return

              // Link row: fire synthetic click so the row's onClick handles navigation once.
              const rowEl = dom.getItemEl(scope, current)
              if (rowEl?.dataset.link != null) {
                rowEl.click()
                return
              }

              const selectionBehavior = prop("selectionBehavior")
              if (selectionBehavior === "toggle") {
                send({ type: "ITEM.CLICK", value: current })
              } else {
                send({ type: "ITEM.DOUBLE_CLICK", value: current })
              }
            },
            Space(event) {
              const target = getEventTarget<HTMLElement>(event)
              const isCheckbox = target?.getAttribute?.("role") === "checkbox"
              const isRow = target?.getAttribute?.("role") === "row"

              if (isCheckbox) return

              if (target && target !== event.currentTarget && !isRow && isFocusable(target)) {
                return
              }

              const current = context.get("focusedValue")
              if (computed("isTypingAhead") && prop("typeahead")) {
                send({ type: "TYPEAHEAD", key: event.key })
              } else if (current && prop("selectionMode") !== "none") {
                event.preventDefault()
                send({ type: "ITEM.CLICK", value: current })
              }
            },
            a(event) {
              if (isCtrlOrMetaKey(event) && multiple) {
                event.preventDefault()
                send({ type: "VALUE.SET", value: collection.getValues() })
              }
            },
            Escape(event) {
              if (prop("escapeKeyBehavior") === "none") return
              if (context.get("value").length === 0) return
              event.preventDefault()
              event.stopPropagation()
              send({ type: "ESCAPE.KEY" })
            },
          }

          const exec = keyMap[getEventKey(event)]

          if (exec) {
            exec(event)
            return
          }

          const target = getEventTarget<Element>(event)

          if (target && isEditableElement(target)) {
            return
          }

          if (getByTypeahead.isValidEvent(event) && prop("typeahead")) {
            send({ type: "TYPEAHEAD", key: event.key })
            event.preventDefault()
          }
        },
      })
    },

    getItemGroupProps(props: ItemGroupProps) {
      const { id } = props
      return normalize.element({
        ...parts.itemGroup.attrs(scope.id),
        "data-disabled": dataAttr(disabled),
        id: dom.getItemGroupId(scope, id),
        role: "rowgroup",
        "aria-labelledby": dom.getItemGroupLabelId(scope, id),
        dir: prop("dir"),
      })
    },

    getItemGroupLabelProps(props: ItemGroupLabelProps) {
      return normalize.element({
        ...parts.itemGroupLabel.attrs(scope.id),
        id: dom.getItemGroupLabelId(scope, props.htmlFor),
        "data-disabled": dataAttr(disabled),
        dir: prop("dir"),
      })
    },

    getItemProps(props: ItemProps) {
      const itemState = getItemState(props)
      const keyboardNavigationBehavior = prop("keyboardNavigationBehavior")
      const href = props.href
      const isLink = !!href && !itemState.disabled
      const gridCell = isGrid ? collection.getValueCell(itemState.value) : null

      return normalize.element({
        id: dom.getItemId(scope, itemState.value),
        role: "row",
        ...parts.item.attrs(scope.id),
        dir: prop("dir"),
        tabIndex: itemState.focused ? 0 : -1,
        "data-value": itemState.value,
        "data-layout": layout,
        "data-href": isLink ? href : undefined,
        "data-column": gridCell?.column,
        "data-row": gridCell?.row,
        "aria-rowindex": gridCell ? gridCell.row + 1 : undefined,
        "aria-colindex": gridCell ? gridCell.column + 1 : undefined,
        "aria-selected": itemState.selected,
        "data-selected": dataAttr(itemState.selected),
        "data-disabled": dataAttr(itemState.disabled),
        "aria-disabled": ariaAttr(itemState.disabled),
        "data-focused": dataAttr(itemState.focused),
        "data-focus-visible": dataAttr(itemState.focusVisible),
        "data-link": dataAttr(isLink),
        "data-ownedby": dom.getRootId(scope),
        onPointerMove(event) {
          if (!props.focusOnHover) return
          if (itemState.disabled || event.pointerType !== "mouse") return
          if (itemState.focused) return
          send({ type: "ITEM.POINTER_MOVE", value: itemState.value })
        },
        onPointerLeave() {
          if (!props.focusOnHover) return
          send({ type: "ITEM.POINTER_LEAVE", value: itemState.value })
        },
        onClick(event) {
          if (event.defaultPrevented) return
          if (itemState.disabled) return
          if (isLink) {
            const shouldNavigate = invokeNavigate(itemState.value, href!, event.currentTarget as HTMLElement)
            if (!shouldNavigate) event.preventDefault()
            const win = scope.getWin()
            if (shouldNavigate && event.currentTarget === event.target) {
              const target = props.target
              if (target === "_blank") {
                win.open(href!, "_blank", props.rel)
              } else {
                win.location.href = href!
              }
            }
            return
          }
          send({
            type: "ITEM.CLICK",
            value: itemState.value,
            shiftKey: event.shiftKey,
            anchorValue: focusedValue,
            metaKey: isCtrlOrMetaKey(event),
          })
        },
        onDoubleClick(event) {
          if (event.defaultPrevented) return
          if (itemState.disabled) return
          if (isLink) return
          send({ type: "ITEM.DOUBLE_CLICK", value: itemState.value })
        },
        onFocus(event) {
          if (event.target !== event.currentTarget) return
          send({ type: "ITEM.FOCUS", value: itemState.value })
        },
        onBlur(event) {
          if (contains(event.currentTarget, event.relatedTarget)) return
          send({ type: "GRID.BLUR" })
        },
        onKeyDown(event) {
          if (itemState.disabled) return

          // In grid-collection mode, Left/Right are column navigation on the root.
          if (isGrid) return

          // Interactive-children walk: only when behavior = "arrow"
          if (keyboardNavigationBehavior !== "arrow") return

          const target = event.target as HTMLElement
          const row = event.currentTarget as HTMLElement
          const focusables = getFocusables(row)

          switch (event.key) {
            case "ArrowLeft": {
              if (focusables.length === 0) return
              event.preventDefault()
              event.stopPropagation()

              if (target === row) {
                focusables[focusables.length - 1].focus()
              } else {
                const currentIndex = focusables.indexOf(target)
                if (currentIndex > 0) {
                  focusables[currentIndex - 1].focus()
                } else {
                  row.focus()
                }
              }
              return
            }

            case "ArrowRight": {
              if (focusables.length === 0) return
              event.preventDefault()
              event.stopPropagation()

              if (target === row) {
                focusables[0].focus()
              } else {
                const currentIndex = focusables.indexOf(target)
                if (currentIndex < focusables.length - 1) {
                  focusables[currentIndex + 1].focus()
                } else {
                  row.focus()
                }
              }
              return
            }
          }
        },
      })
    },

    getCellProps(props: CellProps = {}) {
      const { index = 0 } = props
      return normalize.element({
        ...parts.cell.attrs(scope.id),
        role: "gridcell",
        "data-layout": layout,
        "aria-colindex": index + 1,
        dir: prop("dir"),
      })
    },

    getItemCheckboxProps(props: ItemCheckboxProps) {
      const itemState = getItemState(props)
      return normalize.button({
        ...parts.itemCheckbox.attrs(scope.id),
        type: "button",
        role: "checkbox",
        id: `${dom.getItemId(scope, itemState.value)}:checkbox`,
        "aria-labelledby": dom.getItemId(scope, itemState.value),
        "aria-checked": itemState.selected,
        "aria-disabled": itemState.disabled,
        disabled: itemState.disabled,
        tabIndex: -1,
        "data-state": itemState.selected ? "checked" : "unchecked",
        "data-disabled": dataAttr(itemState.disabled),
        onClick(event) {
          if (itemState.disabled) return
          // Prevent the parent item's onClick from double-firing ITEM.CLICK.
          // The item handler bails early on event.defaultPrevented.
          event.preventDefault()
          send({ type: "ITEM.CLICK", value: itemState.value })
        },
        onKeyDown(event) {
          if (itemState.disabled) return
          if (event.key !== " ") return
          event.preventDefault()
          send({ type: "ITEM.CLICK", value: itemState.value })
        },
      })
    },

    getItemTextProps(props: ItemProps) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemText.attrs(scope.id),
        "data-selected": dataAttr(itemState.selected),
        "data-disabled": dataAttr(itemState.disabled),
        "data-focused": dataAttr(itemState.focused),
      })
    },

    getItemIndicatorProps(props: ItemProps) {
      const itemState = getItemState(props)
      return normalize.svg({
        ...parts.itemIndicator.attrs(scope.id),
        "aria-hidden": true,
        "data-selected": dataAttr(itemState.selected),
        style: { display: itemState.selected ? undefined : "none" },
      })
    },

    getEmptyProps() {
      return normalize.element({
        ...parts.empty.attrs(scope.id),
        role: "row",
        hidden: !isEmpty,
        "data-empty": dataAttr(isEmpty),
      })
    },
  }
}
