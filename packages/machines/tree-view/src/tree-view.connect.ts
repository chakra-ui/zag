import {
  dataAttr,
  getEventKey,
  getEventTarget,
  isComposingEvent,
  isEditableElement,
  isModifierKey,
} from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { add, isEqual, remove, uniq } from "@zag-js/utils"
import { parts } from "./tree-view.anatomy"
import * as dom from "./tree-view.dom"
import type { NodeProps, NodeState, TreeViewApi, TreeViewService } from "./tree-view.types"
import { getVisibleNodes } from "./tree-view.utils"

export function connect<T extends PropTypes>(service: TreeViewService, normalize: NormalizeProps<T>): TreeViewApi<T> {
  const { context, scope, computed, prop, send } = service
  const collection = prop("collection")
  const expandedValue = Array.from(context.get("expandedValue"))
  const selectedValue = Array.from(context.get("selectedValue"))
  const isTypingAhead = computed("isTypingAhead")
  const focusedValue = context.get("focusedValue")
  const loadingStatus = context.get("loadingStatus")

  function getNodeState(props: NodeProps): NodeState {
    const { node, indexPath } = props
    const value = collection.getNodeValue(node)
    return {
      value,
      indexPath,
      valuePath: collection.getValuePath(indexPath),
      disabled: Boolean(node.disabled),
      focused: focusedValue == null ? isEqual(indexPath, [0]) : focusedValue === value,
      selected: selectedValue.includes(value),
      expanded: expandedValue.includes(value),
      loading: loadingStatus[value] === "loading",
      depth: indexPath.length,
      isBranch: collection.isBranchNode(node),
    }
  }

  return {
    collection,
    expandedValue,
    selectedValue,
    expand(value) {
      if (!value) return send({ type: "EXPANDED.ALL" })
      const _expandedValue = uniq(expandedValue.concat(...value))
      send({ type: "EXPANDED.SET", value: _expandedValue, src: "expand" })
    },
    collapse(value) {
      if (!value) return send({ type: "EXPANDED.SET", value: [], src: "collapseAll" })
      const _expandedValue = uniq(remove(expandedValue, ...value))
      send({ type: "EXPANDED.SET", value: _expandedValue, src: "collapse" })
    },
    deselect(value) {
      if (!value) return send({ type: "SELECTED.SET", value: [], src: "deselectAll" })
      const _selectedValue = uniq(remove(selectedValue, ...value))
      send({ type: "SELECTED.SET", value: _selectedValue, src: "deselect" })
    },
    select(value) {
      if (!value) return send({ type: "SELECTED.ALL" })
      const nextValue: string[] = []
      if (prop("selectionMode") === "single") {
        // For single selection, only add the last item
        if (value.length > 0) nextValue.push(value[value.length - 1])
      } else {
        // For multiple selection, add all items
        nextValue.push(...selectedValue, ...value)
      }
      send({ type: "SELECTED.SET", value: nextValue, src: "select" })
    },
    getVisibleNodes() {
      return getVisibleNodes(service)
    },
    focus(value) {
      dom.focusNode(scope, value)
    },
    selectParent(value) {
      const parentNode = collection.getParentNode(value)
      if (!parentNode) return
      const _selectedValue = add(selectedValue, collection.getNodeValue(parentNode))
      send({ type: "SELECTED.SET", value: _selectedValue, src: "select.parent" })
    },
    expandParent(value) {
      const parentNode = collection.getParentNode(value)
      if (!parentNode) return
      const _expandedValue = add(expandedValue, collection.getNodeValue(parentNode))
      send({ type: "EXPANDED.SET", value: _expandedValue, src: "expand.parent" })
    },
    setExpandedValue(value) {
      const _expandedValue = uniq(value)
      send({ type: "EXPANDED.SET", value: _expandedValue })
    },
    setSelectedValue(value) {
      const _selectedValue = uniq(value)
      send({ type: "SELECTED.SET", value: _selectedValue })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        dir: prop("dir"),
      })
    },

    getLabelProps() {
      return normalize.element({
        ...parts.label.attrs,
        id: dom.getLabelId(scope),
        dir: prop("dir"),
      })
    },

    getTreeProps() {
      return normalize.element({
        ...parts.tree.attrs,
        id: dom.getTreeId(scope),
        dir: prop("dir"),
        role: "tree",
        "aria-label": "Tree View",
        "aria-labelledby": dom.getLabelId(scope),
        "aria-multiselectable": prop("selectionMode") === "multiple" || undefined,
        tabIndex: -1,
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (isComposingEvent(event)) return

          const target = getEventTarget<HTMLElement>(event)
          // allow typing in input elements within the tree
          if (isEditableElement(target)) return

          const node = target?.closest<HTMLElement>("[data-part=branch-control], [data-part=item]")
          if (!node) return

          const nodeId = node.dataset.value

          if (nodeId == null) {
            console.warn(`[zag-js/tree-view] Node id not found for node`, node)
            return
          }

          const isBranchNode = node.matches("[data-part=branch-control]")

          const keyMap: EventKeyMap = {
            ArrowDown(event) {
              if (isModifierKey(event)) return
              event.preventDefault()
              send({ type: "NODE.ARROW_DOWN", id: nodeId, shiftKey: event.shiftKey })
            },
            ArrowUp(event) {
              if (isModifierKey(event)) return
              event.preventDefault()
              send({ type: "NODE.ARROW_UP", id: nodeId, shiftKey: event.shiftKey })
            },
            ArrowLeft(event) {
              if (isModifierKey(event) || node.dataset.disabled) return
              event.preventDefault()
              send({ type: isBranchNode ? "BRANCH_NODE.ARROW_LEFT" : "NODE.ARROW_LEFT", id: nodeId })
            },
            ArrowRight(event) {
              if (!isBranchNode || node.dataset.disabled) return
              event.preventDefault()
              send({ type: "BRANCH_NODE.ARROW_RIGHT", id: nodeId })
            },
            Home(event) {
              if (isModifierKey(event)) return
              event.preventDefault()
              send({ type: "NODE.HOME", id: nodeId, shiftKey: event.shiftKey })
            },
            End(event) {
              if (isModifierKey(event)) return
              event.preventDefault()
              send({ type: "NODE.END", id: nodeId, shiftKey: event.shiftKey })
            },
            Space(event) {
              if (node.dataset.disabled) return

              if (isTypingAhead) {
                send({ type: "TREE.TYPEAHEAD", key: event.key })
              } else {
                keyMap.Enter?.(event)
              }
            },
            Enter(event) {
              if (node.dataset.disabled) return

              const isLink = target?.closest("a[href]")
              if (!isLink) event.preventDefault()

              send({ type: isBranchNode ? "BRANCH_NODE.CLICK" : "NODE.CLICK", id: nodeId, src: "keyboard" })
            },
            "*"(event) {
              if (node.dataset.disabled) return
              event.preventDefault()
              send({ type: "SIBLINGS.EXPAND", id: nodeId })
            },
            a(event) {
              if (!event.metaKey || node.dataset.disabled) return
              event.preventDefault()
              send({ type: "SELECTED.ALL", moveFocus: true })
            },
          }

          const key = getEventKey(event, { dir: prop("dir") })
          const exec = keyMap[key]

          if (exec) {
            exec(event)
            return
          }

          if (!isTypingAhead) return

          const isValidTypeahead = event.key.length === 1 && !isModifierKey(event)
          if (!isValidTypeahead) return

          send({ type: "TREE.TYPEAHEAD", key: event.key, id: nodeId })
          event.preventDefault()
        },
      })
    },

    getNodeState,

    getItemProps(props) {
      const itemState = getNodeState(props)
      return normalize.element({
        ...parts.item.attrs,
        id: dom.getNodeId(scope, itemState.value),
        dir: prop("dir"),
        "data-ownedby": dom.getTreeId(scope),
        "data-path": props.indexPath.join("/"),
        "data-value": itemState.value,
        tabIndex: itemState.focused ? 0 : -1,
        "data-focus": dataAttr(itemState.focused),
        role: "treeitem",
        "aria-current": itemState.selected ? "true" : undefined,
        "aria-selected": itemState.disabled ? undefined : itemState.selected,
        "data-selected": dataAttr(itemState.selected),
        "aria-disabled": itemState.disabled,
        "data-disabled": dataAttr(itemState.disabled),
        "aria-level": itemState.depth,
        "data-depth": itemState.depth,
        style: {
          "--depth": itemState.depth,
        },
        onFocus(event) {
          event.stopPropagation()
          send({ type: "NODE.FOCUS", id: itemState.value })
        },
        onClick(event) {
          if (itemState.disabled) return
          const isMetaKey = event.metaKey || event.ctrlKey
          send({ type: "NODE.CLICK", id: itemState.value, shiftKey: event.shiftKey, ctrlKey: isMetaKey })
          event.stopPropagation()

          const isLink = event.currentTarget.matches("a[href]")
          if (!isLink) event.preventDefault()
        },
      })
    },

    getItemTextProps(props) {
      const itemState = getNodeState(props)
      return normalize.element({
        ...parts.itemText.attrs,
        "data-disabled": dataAttr(itemState.disabled),
        "data-selected": dataAttr(itemState.selected),
        "data-focus": dataAttr(itemState.focused),
      })
    },

    getItemIndicatorProps(props) {
      const itemState = getNodeState(props)
      return normalize.element({
        ...parts.itemIndicator.attrs,
        "aria-hidden": true,
        "data-disabled": dataAttr(itemState.disabled),
        "data-selected": dataAttr(itemState.selected),
        "data-focus": dataAttr(itemState.focused),
        hidden: !itemState.selected,
      })
    },

    getBranchProps(props) {
      const nodeState = getNodeState(props)
      return normalize.element({
        ...parts.branch.attrs,
        "data-depth": nodeState.depth,
        dir: prop("dir"),
        "data-branch": nodeState.value,
        role: "treeitem",
        "data-ownedby": dom.getTreeId(scope),
        "data-value": nodeState.value,
        "aria-level": nodeState.depth,
        "aria-selected": nodeState.disabled ? undefined : nodeState.selected,
        "data-path": props.indexPath.join("/"),
        "data-selected": dataAttr(nodeState.selected),
        "aria-expanded": nodeState.expanded,
        "data-state": nodeState.expanded ? "open" : "closed",
        "aria-disabled": nodeState.disabled,
        "data-disabled": dataAttr(nodeState.disabled),
        "data-loading": dataAttr(nodeState.loading),
        "aria-busy": nodeState.loading,
        style: {
          "--depth": nodeState.depth,
        },
      })
    },

    getBranchIndicatorProps(props) {
      const nodeState = getNodeState(props)
      return normalize.element({
        ...parts.branchIndicator.attrs,
        "aria-hidden": true,
        "data-state": nodeState.expanded ? "open" : "closed",
        "data-disabled": dataAttr(nodeState.disabled),
        "data-selected": dataAttr(nodeState.selected),
        "data-focus": dataAttr(nodeState.focused),
        "data-loading": dataAttr(nodeState.loading),
      })
    },

    getBranchTriggerProps(props) {
      const nodeState = getNodeState(props)
      return normalize.element({
        ...parts.branchTrigger.attrs,
        role: "button",
        dir: prop("dir"),
        "data-disabled": dataAttr(nodeState.disabled),
        "data-state": nodeState.expanded ? "open" : "closed",
        "data-value": nodeState.value,
        "data-loading": dataAttr(nodeState.loading),
        disabled: nodeState.loading,
        onClick(event) {
          if (nodeState.disabled || nodeState.loading) return
          send({ type: "BRANCH_TOGGLE.CLICK", id: nodeState.value })
          event.stopPropagation()
        },
      })
    },

    getBranchControlProps(props) {
      const nodeState = getNodeState(props)
      return normalize.element({
        ...parts.branchControl.attrs,
        role: "button",
        id: dom.getNodeId(scope, nodeState.value),
        dir: prop("dir"),
        tabIndex: nodeState.focused ? 0 : -1,
        "data-path": props.indexPath.join("/"),
        "data-state": nodeState.expanded ? "open" : "closed",
        "data-disabled": dataAttr(nodeState.disabled),
        "data-selected": dataAttr(nodeState.selected),
        "data-focus": dataAttr(nodeState.focused),
        "data-value": nodeState.value,
        "data-depth": nodeState.depth,
        "data-loading": dataAttr(nodeState.loading),
        "aria-busy": nodeState.loading,
        onFocus(event) {
          send({ type: "NODE.FOCUS", id: nodeState.value })
          event.stopPropagation()
        },
        onClick(event) {
          if (nodeState.disabled || nodeState.loading) return
          const isMetaKey = event.metaKey || event.ctrlKey
          send({ type: "BRANCH_NODE.CLICK", id: nodeState.value, shiftKey: event.shiftKey, ctrlKey: isMetaKey })
          event.stopPropagation()
        },
      })
    },

    getBranchTextProps(props) {
      const nodeState = getNodeState(props)
      return normalize.element({
        ...parts.branchText.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(nodeState.disabled),
        "data-state": nodeState.expanded ? "open" : "closed",
        "data-loading": dataAttr(nodeState.loading),
      })
    },

    getBranchContentProps(props) {
      const nodeState = getNodeState(props)
      return normalize.element({
        ...parts.branchContent.attrs,
        role: "group",
        dir: prop("dir"),
        "data-state": nodeState.expanded ? "open" : "closed",
        "data-depth": nodeState.depth,
        "data-path": props.indexPath.join("/"),
        "data-value": nodeState.value,
        hidden: !nodeState.expanded,
      })
    },

    getBranchIndentGuideProps(props) {
      const nodeState = getNodeState(props)
      return normalize.element({
        ...parts.branchIndentGuide.attrs,
        "data-depth": nodeState.depth,
      })
    },
  }
}
