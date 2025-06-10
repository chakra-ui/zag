import { ariaAttr, dataAttr, getEventKey, isLeftClick, visuallyHiddenStyle } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { Service } from "@zag-js/core"
import { parts } from "./cascade-select.anatomy"
import { dom } from "./cascade-select.dom"
import type { CascadeSelectApi, CascadeSelectSchema, ItemProps, ItemState, TreeNode } from "./cascade-select.types"

export function connect<T extends PropTypes, V = TreeNode>(
  service: Service<CascadeSelectSchema>,
  normalize: NormalizeProps<T>,
): CascadeSelectApi<T, V> {
  const { send, context, prop, scope, computed, state } = service

  const collection = prop("collection")
  // const value = context.get("value")
  const value = computed("value")
  const open = state.hasTag("open")
  const focused = state.matches("focused")
  const highlightedIndexPath = context.get("highlightedIndexPath") ?? []
  const currentPlacement = context.get("currentPlacement")
  const isDisabled = computed("isDisabled")
  const isInteractive = computed("isInteractive")
  const valueText = computed("valueText")

  const separator = prop("separator")

  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: currentPlacement,
  })

  function isPrefixOfHighlight(indexPath: number[]) {
    // If indexPath is longer, it can't be a prefix.
    if (indexPath.length > highlightedIndexPath.length) return false

    // Check each element in indexPath against the corresponding element
    return indexPath.every((val, idx) => val === highlightedIndexPath[idx])
  }

  const getItemState = (props: ItemProps<V>): ItemState => {
    const { item, indexPath } = props
    const itemValue = collection.getNodeValue(item)
    const depth = indexPath ? indexPath.length : 0

    const highlighted = isPrefixOfHighlight(indexPath)

    // Check if item is selected (part of any selected path)
    // const isSelected = value.some((path) => path.includes(itemValue))

    return {
      value: itemValue,
      disabled: collection.getNodeDisabled(item),
      highlighted,
      selected: false,
      // selected: isSelected,
      hasChildren: collection.isBranchNode(item),
      depth,
    }
  }

  return {
    collection,
    value,
    valueText,
    highlightedIndexPath,
    open,
    focused,
    separator,

    // setValue(value: string[][]) {
    //   send({ type: "VALUE.SET", value })
    // },

    setOpen(open: boolean) {
      if (open) {
        send({ type: "OPEN" })
      } else {
        send({ type: "CLOSE" })
      }
    },

    highlight(path: string[] | null) {
      send({ type: "HIGHLIGHTED_PATH.SET", value: path })
    },

    // selectItem(value: string) {
    //   send({ type: "ITEM.SELECT", value })
    // },

    clearValue() {
      send({ type: "VALUE.CLEAR" })
    },

    getItemState,

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        "data-disabled": dataAttr(isDisabled),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
        "data-state": open ? "open" : "closed",
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        id: dom.getLabelId(scope),
        htmlFor: dom.getHiddenInputId(scope),
        "data-disabled": dataAttr(isDisabled),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
        onClick(event) {
          if (event.defaultPrevented) return
          if (isDisabled) return
          const triggerEl = dom.getTriggerEl(scope)
          triggerEl?.focus({ preventScroll: true })
        },
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        id: dom.getControlId(scope),
        "data-disabled": dataAttr(isDisabled),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
        "data-state": open ? "open" : "closed",
      })
    },

    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        id: dom.getTriggerId(scope),
        type: "button",
        role: "combobox",
        "aria-controls": dom.getContentId(scope),
        "aria-expanded": open,
        "aria-haspopup": "listbox",
        "aria-labelledby": dom.getLabelId(scope),
        "aria-describedby": dom.getValueTextId(scope),
        "data-state": open ? "open" : "closed",
        "data-disabled": dataAttr(isDisabled),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
        disabled: isDisabled,
        onClick(event) {
          if (!isInteractive) return
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
          if (!isInteractive) return
          const key = getEventKey(event)

          switch (key) {
            case "ArrowDown":
              event.preventDefault()
              send({ type: "TRIGGER.ARROW_DOWN" })
              break
            case "ArrowUp":
              event.preventDefault()
              send({ type: "TRIGGER.ARROW_UP" })
              break
            case "ArrowRight":
              event.preventDefault()
              send({ type: "TRIGGER.ARROW_RIGHT" })
              break
            case "Enter":
            case " ":
              event.preventDefault()
              send({ type: "TRIGGER.ENTER" })
              break
          }
        },
      })
    },

    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs,
        id: dom.getIndicatorId(scope),
        "data-state": open ? "open" : "closed",
        "data-disabled": dataAttr(isDisabled),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
      })
    },

    getValueTextProps() {
      return normalize.element({
        ...parts.valueText.attrs,
        id: dom.getValueTextId(scope),
        "data-disabled": dataAttr(isDisabled),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
        "data-placeholder": dataAttr(!value.length),
      })
    },

    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs,
        id: dom.getClearTriggerId(scope),
        type: "button",
        "aria-label": "Clear value",
        hidden: !value.length,
        "data-disabled": dataAttr(isDisabled),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
        disabled: isDisabled,
        onClick(event) {
          if (!isInteractive) return
          if (!isLeftClick(event)) return
          send({ type: "VALUE.CLEAR" })
        },
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs,
        id: dom.getPositionerId(scope),
        style: popperStyles.floating,
      })
    },

    getContentProps() {
      const highlightedValue = highlightedIndexPath.length
        ? collection.getNodeValue(collection.at(highlightedIndexPath))
        : undefined
      const highlightedItemId = highlightedValue ? dom.getItemId(scope, highlightedValue) : undefined

      return normalize.element({
        ...parts.content.attrs,
        id: dom.getContentId(scope),
        role: "listbox",
        "aria-labelledby": dom.getLabelId(scope),
        "aria-activedescendant": highlightedItemId,
        "data-activedescendant": highlightedItemId,
        "data-state": open ? "open" : "closed",
        hidden: !open,
        tabIndex: 0,
        onKeyDown(event) {
          if (!isInteractive) return
          const key = getEventKey(event)

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
            Escape() {
              send({ type: "CONTENT.ESCAPE" })
            },
          }

          const exec = keyMap[key]
          if (exec) {
            exec()
            event.preventDefault()
          }
        },
        onPointerMove(event) {
          if (!isInteractive) return
          send({ type: "POINTER_MOVE", clientX: event.clientX, clientY: event.clientY, target: event.target })
        },
      })
    },

    getListProps(props: ItemProps<V>) {
      const itemState = getItemState(props)

      return normalize.element({
        ...parts.list.attrs,
        id: dom.getListId(scope, itemState.value),
        dir: prop("dir"),
        "data-depth": itemState.depth,
        "aria-depth": itemState.depth,
        role: "group",
      })
    },

    getItemProps(props: ItemProps<V>) {
      const {
        item,
        indexPath,
        valuePath,
        // TODO closeOnSelect
      } = props
      const itemValue = collection.getNodeValue(item)
      const itemState = getItemState(props)

      return normalize.element({
        ...parts.item.attrs,
        id: dom.getItemId(scope, itemValue),
        role: "treeitem",
        "aria-haspopup": itemState.hasChildren ? "menu" : undefined,
        "aria-expanded": itemState.hasChildren ? itemState.highlighted : false,
        "aria-controls": itemState.hasChildren ? dom.getListId(scope, itemState.value) : undefined,
        "aria-owns": itemState.hasChildren ? dom.getListId(scope, itemState.value) : undefined,
        "aria-disabled": ariaAttr(itemState.disabled),
        "data-value": itemValue,
        "data-disabled": dataAttr(itemState.disabled),
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-selected": dataAttr(itemState.selected),
        "data-has-children": dataAttr(itemState.hasChildren),
        "data-depth": itemState.depth,
        "aria-selected": itemState.selected,
        "data-type": itemState.hasChildren ? "branch" : "leaf",
        "data-index-path": indexPath.join(separator),
        "data-value-path": valuePath.join(separator),
        onClick(event) {
          if (!isInteractive) return
          if (!isLeftClick(event)) return
          if (itemState.disabled) return
          send({ type: "ITEM.CLICK", indexPath })
        },
        onPointerEnter(event) {
          if (!isInteractive) return
          if (itemState.disabled) return
          send({ type: "ITEM.POINTER_ENTER", indexPath, clientX: event.clientX, clientY: event.clientY })
        },
        onPointerLeave(event) {
          if (!isInteractive) return
          if (itemState.disabled) return
          if (props.persistFocus) return
          if (event.pointerType !== "mouse") return

          const pointerMoved = service.event.previous()?.type.includes("POINTER")
          if (!pointerMoved) return

          send({ type: "ITEM.POINTER_LEAVE", indexPath, clientX: event.clientX, clientY: event.clientY })
        },
      })
    },

    getItemTextProps(props: ItemProps<V>) {
      const { item } = props
      const itemValue = collection.getNodeValue(item)
      const itemState = getItemState(props)
      return normalize.element({
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
        "data-value": itemValue,
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-has-children": dataAttr(itemState.hasChildren),
        hidden: !itemState.hasChildren,
      })
    },

    getHiddenInputProps() {
      // Create option values from the current selected paths
      // TODO: fix this
      const defaultValue = prop("multiple") ? value.map((path) => path.join(separator)) : value[0]?.join(separator)

      return normalize.input({
        name: prop("name"),
        form: prop("form"),
        disabled: isDisabled,
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
