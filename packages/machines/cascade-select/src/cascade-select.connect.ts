import {
  ariaAttr,
  dataAttr,
  getEventKey,
  isEditableElement,
  isLeftClick,
  isSelfTarget,
  isValidTabEvent,
} from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import type { Service } from "@zag-js/core"
import { isEqual } from "@zag-js/utils"
import { parts } from "./cascade-select.anatomy"
import { dom } from "./cascade-select.dom"
import type { CascadeSelectApi, CascadeSelectSchema, ItemProps, ItemState, TreeNode } from "./cascade-select.types"

export function connect<T extends PropTypes, V = TreeNode>(
  service: Service<CascadeSelectSchema>,
  normalize: NormalizeProps<T>,
): CascadeSelectApi<T, V> {
  const { send, context, prop, scope, computed, state } = service

  const collection = prop("collection")
  const value = context.get("value")
  const open = state.hasTag("open")
  const focused = state.matches("focused")
  const highlightedIndexPath = context.get("highlightedIndexPath")
  const highlightedValue = context.get("highlightedValue")
  const currentPlacement = context.get("currentPlacement")
  const disabled = prop("disabled") || context.get("fieldsetDisabled")
  const interactive = computed("isInteractive")
  const valueAsString = computed("valueAsString")

  const highlightedItem = context.get("highlightedItem")
  const selectedItems = context.get("selectedItems")

  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: currentPlacement,
  })

  const getItemState = (props: ItemProps<V>): ItemState => {
    const { item, indexPath, value: itemValue } = props
    const depth = indexPath ? indexPath.length : 0

    const highlighted = itemValue.every((v, i) => v === highlightedValue[i])
    const selected = value.some((v) => isEqual(v, itemValue))
    const children = collection.getNodeChildren(collection.at(indexPath))
    const highlightedChild = children[highlightedIndexPath[depth]] as V | undefined
    const highlightedIndex = highlightedIndexPath[depth]

    return {
      value: itemValue,
      disabled: collection.getNodeDisabled(item),
      highlighted,
      selected,
      hasChildren: collection.isBranchNode(item),
      depth,
      highlightedChild,
      highlightedIndex,
    }
  }

  const hasSelectedItems = value.length > 0

  return {
    collection,
    open,
    focused,
    multiple: !!prop("multiple"),
    disabled,
    value,
    highlightedValue,
    highlightedItem,
    selectedItems,
    hasSelectedItems,
    valueAsString,

    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options })
    },

    focus() {
      dom.getTriggerEl(scope)?.focus({ preventScroll: true })
    },

    setOpen(nextOpen) {
      if (nextOpen === open) return
      send({ type: nextOpen ? "OPEN" : "CLOSE" })
    },

    highlightValue(value) {
      send({ type: "HIGHLIGHTED_VALUE.SET", value })
    },

    setValue(value) {
      send({ type: "VALUE.SET", value })
    },

    selectValue(value) {
      send({ type: "ITEM.SELECT", value })
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
        id: dom.getRootId(scope),
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
        "data-state": open ? "open" : "closed",
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        id: dom.getLabelId(scope),
        dir: prop("dir"),
        htmlFor: dom.getHiddenInputId(scope),
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
        onClick(event) {
          if (event.defaultPrevented) return
          if (disabled) return
          const triggerEl = dom.getTriggerEl(scope)
          triggerEl?.focus({ preventScroll: true })
        },
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        dir: prop("dir"),
        id: dom.getControlId(scope),
        "data-disabled": dataAttr(disabled),
        "data-focused": dataAttr(focused),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
        "data-state": open ? "open" : "closed",
      })
    },

    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        dir: prop("dir"),
        id: dom.getTriggerId(scope),
        type: "button",
        role: "combobox",
        "aria-controls": dom.getContentId(scope),
        "aria-expanded": open,
        "aria-haspopup": "listbox",
        "aria-labelledby": dom.getLabelId(scope),
        "data-state": open ? "open" : "closed",
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
        "data-focused": dataAttr(focused),
        "data-placement": currentPlacement,
        disabled,
        onClick(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
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
            Enter() {
              send({ type: "TRIGGER.ENTER" })
            },
            Space() {
              send({ type: "TRIGGER.ENTER" })
            },
          }

          const exec = keyMap[getEventKey(event, { dir: prop("dir") })]
          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },
      })
    },

    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs,
        dir: prop("dir"),
        id: dom.getClearTriggerId(scope),
        type: "button",
        "aria-label": "Clear value",
        hidden: !hasSelectedItems,
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
        disabled,
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: "CLEAR_TRIGGER.CLICK" })
        },
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
      const highlightedItemId = highlightedValue ? dom.getItemId(scope, highlightedValue.toString()) : undefined

      return normalize.element({
        ...parts.content.attrs,
        id: dom.getContentId(scope),
        role: "listbox",
        "aria-labelledby": dom.getLabelId(scope),
        "aria-activedescendant": highlightedItemId,
        "data-activedescendant": highlightedItemId,
        "data-state": open ? "open" : "closed",
        "aria-multiselectable": prop("multiple"),
        "aria-required": prop("required"),
        "aria-readonly": prop("readOnly"),

        hidden: !open,
        tabIndex: 0,
        onKeyDown(event) {
          if (!interactive) return
          if (!isSelfTarget(event)) return

          // cascader should not be navigated using tab key so we prevent it
          if (event.key === "Tab") {
            const valid = isValidTabEvent(event)
            if (!valid) {
              event.preventDefault()
              return
            }
          }

          const keyMap: Record<string, () => void> = {
            ArrowDown() {
              send({ type: "CONTENT.ARROW_DOWN" })
            },
            ArrowUp() {
              send({ type: "CONTENT.ARROW_UP" })
            },
            ArrowRight() {
              send({ type: "CONTENT.ARROW_RIGHT" })
            },
            ArrowLeft() {
              send({ type: "CONTENT.ARROW_LEFT" })
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
            " "() {
              send({ type: "CONTENT.ENTER" })
            },
          }

          const exec = keyMap[getEventKey(event, { dir: prop("dir") })]
          if (exec) {
            exec()
            event.preventDefault()
            return
          }

          if (isEditableElement(event.target)) {
            return
          }
        },
        onPointerMove(event) {
          if (!interactive) return
          send({ type: "POINTER_MOVE", clientX: event.clientX, clientY: event.clientY, target: event.target })
        },
      })
    },

    getListProps(props: ItemProps<V>) {
      const itemState = getItemState(props)

      return normalize.element({
        ...parts.list.attrs,
        id: dom.getListId(scope, itemState.value.toString()),
        dir: prop("dir"),
        "data-depth": itemState.depth,
        "aria-level": itemState.depth,
        role: "group",
      })
    },

    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs,
        id: dom.getIndicatorId(scope),
        dir: prop("dir"),
        "aria-hidden": true,
        "data-state": open ? "open" : "closed",
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
      })
    },

    getItemProps(props: ItemProps<V>) {
      const { indexPath } = props
      const itemState = getItemState(props)

      return normalize.element({
        ...parts.item.attrs,
        id: dom.getItemId(scope, itemState.value.toString()),
        dir: prop("dir"),
        role: "treeitem",
        "aria-haspopup": itemState.hasChildren ? "menu" : undefined,
        "aria-expanded": itemState.hasChildren ? itemState.highlighted : false,
        "aria-controls": itemState.hasChildren ? dom.getListId(scope, itemState.value.toString()) : undefined,
        "aria-owns": itemState.hasChildren ? dom.getListId(scope, itemState.value.toString()) : undefined,
        "aria-disabled": ariaAttr(itemState.disabled),
        "data-value": itemState.value.toString(),
        "data-disabled": dataAttr(itemState.disabled),
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-selected": dataAttr(itemState.selected),
        "data-depth": itemState.depth,
        "aria-selected": itemState.selected,
        "data-type": itemState.hasChildren ? "branch" : "leaf",
        "data-index-path": indexPath.toString(),
        onDoubleClick() {
          if (itemState.disabled) return
          send({ type: "CLOSE" })
        },
        onClick(event) {
          if (!interactive) return
          if (!isLeftClick(event)) return
          if (itemState.disabled) return
          send({ type: "ITEM.CLICK", value: itemState.value, indexPath })
        },
        onPointerEnter(event) {
          if (!interactive) return
          if (itemState.disabled) return
          send({
            type: "ITEM.POINTER_ENTER",
            value: itemState.value,
            indexPath,
            clientX: event.clientX,
            clientY: event.clientY,
          })
        },
        onPointerLeave(event) {
          if (!interactive) return
          if (itemState.disabled) return
          if (props.persistFocus) return
          if (event.pointerType !== "mouse") return

          const pointerMoved = service.event.previous()?.type.includes("POINTER")
          if (!pointerMoved) return

          send({
            type: "ITEM.POINTER_LEAVE",
            value: itemState.value,
            indexPath,
            clientX: event.clientX,
            clientY: event.clientY,
          })
        },
        onTouchEnd(event) {
          // prevent clicking elements behind content
          event.preventDefault()
          event.stopPropagation()
        },
      })
    },

    getItemTextProps(props: ItemProps<V>) {
      const { item } = props
      const itemValue = collection.getNodeValue(item)
      const itemState = getItemState(props)
      return normalize.element({
        dir: prop("dir"),
        ...parts.itemText.attrs,
        "data-value": itemValue,
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-selected": dataAttr(itemState.selected),
        "data-disabled": dataAttr(itemState.disabled),
      })
    },

    getItemIndicatorProps(props: ItemProps<V>) {
      const { item } = props
      const itemValue = collection.getNodeValue(item)
      const itemState = getItemState(props)

      return normalize.element({
        ...parts.itemIndicator.attrs,
        dir: prop("dir"),
        "data-value": itemValue,
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-type": itemState.hasChildren ? "branch" : "leaf",
        hidden: !itemState.hasChildren,
      })
    },

    getHiddenInputProps() {
      const defaultValue = context.hash("value")

      return normalize.input({
        name: prop("name"),
        form: prop("form"),
        disabled,
        multiple: prop("multiple"),
        required: prop("required"),
        readOnly: prop("readOnly"),
        hidden: true,
        "aria-hidden": true,
        id: dom.getHiddenInputId(scope),

        defaultValue,
        "aria-labelledby": dom.getLabelId(scope),
      })
    },
  }
}
