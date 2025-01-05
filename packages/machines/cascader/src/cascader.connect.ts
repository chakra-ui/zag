import type { NormalizeProps, PropTypes, EventKeyMap } from "@zag-js/types"
import { getEventKey, isLeftClick } from "@zag-js/dom-query"

import type { State, Send, MachineApi, NodeProps, NodeState } from "./cascader.types"
import { parts } from "./cascader.anatomy"
import { dom } from "./cascader.dom"
import { ariaAttr, dataAttr, isEditableElement, isSelfTarget, isValidTabEvent } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"

export function connect<T extends PropTypes, V = any>(
  state: State<V>,
  send: Send,
  normalize: NormalizeProps<T>,
): MachineApi<T, V> {
  const disabled = state.context.isDisabled
  const invalid = state.context.invalid
  const readOnly = state.context.readOnly
  const required = state.context.required
  const interactive = state.context.isInteractive

  const highlightedIndexPath = state.context.highlightedIndexPath
  const highlightedItem = state.context.highlightedItem
  const selectedItems = state.context.selectedItems
  const highlightedValue = state.context.highlightedValue

  const hasSelectedItems = state.context.hasSelectedItems

  const open = state.hasTag("open")
  const focused = state.matches("focused")

  const collection = state.context.collection

  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: state.context.currentPlacement,
  })

  function isPrefixOfHighlight(indexPath: number[], highlightedIndexPath: number[]) {
    // If indexPath is longer, it can't be a prefix.
    if (indexPath.length > highlightedIndexPath.length) return false

    // Check each element in indexPath against the corresponding element
    return indexPath.every((val, idx) => val === highlightedIndexPath[idx])
  }

  function getNodeState(props: NodeProps): NodeState {
    const { node, indexPath } = props
    const value = collection.getNodeValue(node)
    const isBranch = collection.isBranchNode(node)
    const highlighted = isPrefixOfHighlight(indexPath, highlightedIndexPath)
    const depth = indexPath.length + 1
    const selected = state.context.value.includes(value)

    return {
      value,
      valuePath: collection.getValuePath(indexPath),
      disabled: Boolean(node.disabled),
      depth,
      isBranch,
      highlighted,
      selected,
    }
  }

  return {
    open: open,
    collection: state.context.collection,
    disabled,
    focused,
    multiple: !!state.context.multiple,
    empty: state.context.value.length === 0,
    highlightedValue,
    highlightedItem,
    highlightedIndexPath,
    hasSelectedItems: state.context.hasSelectedItems,
    selectedItems,

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

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(state.context),
        dir: state.context.dir,
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
      })
    },

    getLabelProps() {
      return normalize.element({
        ...parts.label.attrs,
        id: dom.getLabelId(state.context),
        dir: state.context.dir,
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
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

    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        dir: state.context.dir,
        id: dom.getTriggerId(state.context),
        "data-state": open ? "open" : "closed",
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-readonly": dataAttr(readOnly),
        "data-focus": dataAttr(focused),
        type: "button",
        disabled: disabled,
        "aria-labelledby": dom.getLabelId(state.context),
        "aria-controls": dom.getContentId(state.context),
        "aria-expanded": open,
        "aria-haspopup": "listbox",
        "aria-invalid": invalid,
        "data-placement": state.context.currentPlacement,
        "data-placeholder-shown": dataAttr(!hasSelectedItems),

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
              send({ type: "OPEN" })
            },
            ArrowRight() {
              send({ type: "OPEN" })
            },
            Enter() {
              send({ type: "TRIGGER.ENTER" })
            },
            Space() {
              send({ type: "TRIGGER.ENTER" })
            },
          }

          const exec = keyMap[getEventKey(event, state.context)]

          if (exec) {
            exec(event)
            event.preventDefault()
            return
          }
        },
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
        hidden: !hasSelectedItems,
        dir: state.context.dir,
        onClick(event) {
          if (event.defaultPrevented) return
          send("CLEAR.CLICK")
        },
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
      const ariaActiveDescendant = highlightedValue ? dom.getItemId(state.context, highlightedValue) : undefined

      return normalize.element({
        hidden: !open,
        ...parts.content.attrs,
        dir: state.context.dir,
        id: dom.getContentId(state.context),
        role: "tree",
        "data-state": open ? "open" : "closed",
        "data-placement": state.context.currentPlacement,
        "data-activedescendant": ariaActiveDescendant,
        "aria-activedescendant": ariaActiveDescendant,
        "aria-multiselectable": state.context.multiple,
        "aria-labelledby": dom.getLabelId(state.context),
        "aria-required": required,
        "aria-readonly": readOnly,

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

          const keyMap: EventKeyMap = {
            ArrowRight() {
              send({ type: "CONTENT.ARROW_RIGHT" })
            },
            ArrowLeft() {
              send({ type: "CONTENT.ARROW_LEFT" })
            },
            Backspace() {
              send({ type: "CONTENT.ARROW_LEFT", src: "keydown.backspace" })
            },
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
              if (!highlightedValue) return
              send({ type: "ITEM.CLICK", src: "keydown.enter", indexPath: highlightedIndexPath })
            },
            Space() {
              if (!highlightedValue) return
              send({ type: "ITEM.CLICK", src: "keydown.space", indexPath: highlightedIndexPath })
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
        },
      })
    },

    getNodeState,

    getListProps(props) {
      const itemState = getNodeState(props)

      return normalize.element({
        ...parts.list.attrs,
        id: dom.getListId(state.context, itemState.value),
        dir: state.context.dir,
        role: "group",
        "aria-level": itemState.depth,
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
      const itemState = getNodeState(props)

      const { indexPath, closeOnSelect } = props

      return normalize.element({
        ...parts.item.attrs,
        id: dom.getItemId(state.context, itemState.value),
        dir: state.context.dir,
        role: "treeitem",
        "aria-haspopup": itemState.isBranch ? "menu" : undefined,
        "aria-expanded": itemState.isBranch ? itemState.highlighted : false,
        "aria-controls": itemState.isBranch ? dom.getListId(state.context, itemState.value) : undefined,
        "aria-owns": itemState.isBranch ? dom.getListId(state.context, itemState.value) : undefined,
        "aria-selected": itemState.selected,
        "aria-disabled": ariaAttr(itemState.disabled),
        "data-value": itemState.value,
        "data-state": itemState.selected ? "checked" : "unchecked",
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-disabled": dataAttr(itemState.disabled),
        "data-selected": dataAttr(itemState.selected),
        "data-type": itemState.isBranch ? "branch" : "leaf",
        "data-index-path": props.indexPath.join(","),
        onDoubleClick() {
          if (itemState.disabled) return
          send("CLOSE")
        },
        onPointerMove(event) {
          if (itemState.disabled || event.pointerType !== "mouse") return
          if (highlightedValue === itemState.value) return
          send({ type: "ITEM.POINTER_MOVE", indexPath })
        },
        onClick(event) {
          if (event.defaultPrevented) return
          if (itemState.disabled) return
          send({ type: "ITEM.CLICK", src: "pointerup", indexPath, closeOnSelect })
        },
        onTouchEnd(event) {
          // prevent clicking elements behind content
          event.preventDefault()
          event.stopPropagation()
        },
      })
    },

    getItemTextProps(props) {
      const itemState = getNodeState(props)
      return normalize.element({
        ...parts.itemText.attrs,
        "data-state": itemState.selected ? "checked" : "unchecked",
        "data-disabled": dataAttr(itemState.disabled),
        "data-highlighted": dataAttr(itemState.highlighted),
      })
    },
  }
}
