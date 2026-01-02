import {
  ariaAttr,
  dataAttr,
  getByTypeahead,
  getEventKey,
  getEventTarget,
  isAnchorElement,
  isComposingEvent,
  isEditableElement,
  isLeftClick,
  isModifierKey,
} from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { add, uniq } from "@zag-js/utils"
import { parts } from "./tree-view.anatomy"
import * as dom from "./tree-view.dom"
import type { NodeProps, NodeState, TreeNode, TreeViewApi, TreeViewService } from "./tree-view.types"
import { getCheckedState, getCheckedValueMap } from "./utils/checked-state"

export function connect<T extends PropTypes, V extends TreeNode = TreeNode>(
  service: TreeViewService<V>,
  normalize: NormalizeProps<T>,
): TreeViewApi<T, V> {
  const { context, scope, computed, prop, send } = service
  const collection = prop("collection")

  const expandedValue = Array.from(context.get("expandedValue"))
  const selectedValue = Array.from(context.get("selectedValue"))
  const checkedValue = Array.from(context.get("checkedValue"))

  const isTypingAhead = computed("isTypingAhead")
  const focusedValue = context.get("focusedValue")
  const loadingStatus = context.get("loadingStatus")
  const renamingValue = context.get("renamingValue")

  function getNodeState(props: NodeProps): NodeState {
    const { node, indexPath } = props
    const value = collection.getNodeValue(node)
    const firstNode = collection.getFirstNode()
    const firstNodeValue = firstNode ? collection.getNodeValue(firstNode) : null
    return {
      id: dom.getNodeId(scope, value),
      value,
      indexPath,
      valuePath: collection.getValuePath(indexPath),
      disabled: Boolean(node.disabled),
      focused: focusedValue == null ? firstNodeValue == value : focusedValue === value,
      selected: selectedValue.includes(value),
      expanded: expandedValue.includes(value),
      loading: loadingStatus[value] === "loading",
      depth: indexPath.length,
      isBranch: collection.isBranchNode(node),
      renaming: renamingValue === value,
      get checked() {
        return getCheckedState(collection, node, checkedValue)
      },
    }
  }

  return {
    collection,
    expandedValue,
    selectedValue,
    checkedValue,
    toggleChecked(value, isBranch) {
      send({ type: "CHECKED.TOGGLE", value, isBranch })
    },
    setChecked(value) {
      send({ type: "CHECKED.SET", value })
    },
    clearChecked() {
      send({ type: "CHECKED.CLEAR" })
    },
    getCheckedMap() {
      return getCheckedValueMap(collection, checkedValue)
    },
    expand(value) {
      send({ type: value ? "BRANCH.EXPAND" : "EXPANDED.ALL", value })
    },
    collapse(value) {
      send({ type: value ? "BRANCH.COLLAPSE" : "EXPANDED.CLEAR", value })
    },
    deselect(value) {
      send({ type: value ? "NODE.DESELECT" : "SELECTED.CLEAR", value })
    },
    select(value) {
      send({ type: value ? "NODE.SELECT" : "SELECTED.ALL", value, isTrusted: false })
    },
    getVisibleNodes() {
      return computed("visibleNodes")
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
    startRenaming(value) {
      send({ type: "NODE.RENAME", value })
    },
    submitRenaming(value, label) {
      send({ type: "RENAME.SUBMIT", value, label })
    },
    cancelRenaming() {
      send({ type: "RENAME.CANCEL" })
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
              if (isAnchorElement(target) && isModifierKey(event)) return

              send({ type: isBranchNode ? "BRANCH_NODE.CLICK" : "NODE.CLICK", id: nodeId, src: "keyboard" })

              if (!isAnchorElement(target)) {
                event.preventDefault()
              }
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
            F2(event) {
              if (node.dataset.disabled) return

              // Check canRename callback - return early if not provided (opt-in)
              const canRenameFn = prop("canRename")
              if (!canRenameFn) return

              const indexPath = collection.getIndexPath(nodeId)
              if (indexPath) {
                const node = collection.at(indexPath)
                if (node && !canRenameFn(node, indexPath)) {
                  return
                }
              }

              event.preventDefault()
              send({ type: "NODE.RENAME", value: nodeId })
            },
          }

          const key = getEventKey(event, { dir: prop("dir") })
          const exec = keyMap[key]

          if (exec) {
            exec(event)
            return
          }

          if (!getByTypeahead.isValidEvent(event)) return

          send({ type: "TREE.TYPEAHEAD", key: event.key, id: nodeId })
          event.preventDefault()
        },
      })
    },

    getNodeState,

    getItemProps(props) {
      const nodeState = getNodeState(props)
      return normalize.element({
        ...parts.item.attrs,
        id: nodeState.id,
        dir: prop("dir"),
        "data-ownedby": dom.getTreeId(scope),
        "data-path": props.indexPath.join("/"),
        "data-value": nodeState.value,
        tabIndex: nodeState.focused ? 0 : -1,
        "data-focus": dataAttr(nodeState.focused),
        role: "treeitem",
        "aria-current": nodeState.selected ? "true" : undefined,
        "aria-selected": nodeState.disabled ? undefined : nodeState.selected,
        "data-selected": dataAttr(nodeState.selected),
        "aria-disabled": ariaAttr(nodeState.disabled),
        "data-disabled": dataAttr(nodeState.disabled),
        "data-renaming": dataAttr(nodeState.renaming),
        "aria-level": nodeState.depth,
        "data-depth": nodeState.depth,
        style: {
          "--depth": nodeState.depth,
        },
        onFocus(event) {
          event.stopPropagation()
          send({ type: "NODE.FOCUS", id: nodeState.value })
        },
        onClick(event) {
          if (nodeState.disabled) return
          if (!isLeftClick(event)) return
          if (isAnchorElement(event.currentTarget) && isModifierKey(event)) return

          const isMetaKey = event.metaKey || event.ctrlKey
          send({ type: "NODE.CLICK", id: nodeState.value, shiftKey: event.shiftKey, ctrlKey: isMetaKey })
          event.stopPropagation()

          if (!isAnchorElement(event.currentTarget)) {
            event.preventDefault()
          }
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
        "aria-disabled": ariaAttr(nodeState.disabled),
        "data-disabled": dataAttr(nodeState.disabled),
        "data-loading": dataAttr(nodeState.loading),
        "aria-busy": ariaAttr(nodeState.loading),
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
        id: nodeState.id,
        dir: prop("dir"),
        tabIndex: nodeState.focused ? 0 : -1,
        "data-path": props.indexPath.join("/"),
        "data-state": nodeState.expanded ? "open" : "closed",
        "data-disabled": dataAttr(nodeState.disabled),
        "data-selected": dataAttr(nodeState.selected),
        "data-focus": dataAttr(nodeState.focused),
        "data-renaming": dataAttr(nodeState.renaming),
        "data-value": nodeState.value,
        "data-depth": nodeState.depth,
        "data-loading": dataAttr(nodeState.loading),
        "aria-busy": ariaAttr(nodeState.loading),
        onFocus(event) {
          send({ type: "NODE.FOCUS", id: nodeState.value })
          event.stopPropagation()
        },
        onClick(event) {
          if (nodeState.disabled) return
          if (nodeState.loading) return
          if (!isLeftClick(event)) return
          if (isAnchorElement(event.currentTarget) && isModifierKey(event)) return

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

    getNodeCheckboxProps(props) {
      const nodeState = getNodeState(props)
      const checkedState = nodeState.checked
      return normalize.element({
        ...parts.nodeCheckbox.attrs,
        tabIndex: -1,
        role: "checkbox",
        "data-state": checkedState === true ? "checked" : checkedState === false ? "unchecked" : "indeterminate",
        "aria-checked": checkedState === true ? "true" : checkedState === false ? "false" : "mixed",
        "data-disabled": dataAttr(nodeState.disabled),
        onClick(event) {
          if (event.defaultPrevented) return
          if (nodeState.disabled) return
          if (!isLeftClick(event)) return

          send({ type: "CHECKED.TOGGLE", value: nodeState.value, isBranch: nodeState.isBranch })
          event.stopPropagation()

          const node = event.currentTarget.closest("[role=treeitem]") as HTMLElement | null
          node?.focus({ preventScroll: true })
        },
      })
    },

    getNodeRenameInputProps(props) {
      const nodeState = getNodeState(props)
      return normalize.input({
        ...parts.nodeRenameInput.attrs,
        id: dom.getRenameInputId(scope, nodeState.value),
        type: "text",
        "aria-label": "Rename tree item",
        hidden: !nodeState.renaming,
        onKeyDown(event) {
          // CRITICAL: Ignore keyboard events during IME composition
          if (isComposingEvent(event)) return

          if (event.key === "Escape") {
            send({ type: "RENAME.CANCEL" })
            event.preventDefault()
          }
          if (event.key === "Enter") {
            send({ type: "RENAME.SUBMIT", label: event.currentTarget.value })
            event.preventDefault()
          }
          // Stop propagation to prevent tree navigation during renaming
          event.stopPropagation()
        },
        onBlur(event) {
          send({ type: "RENAME.SUBMIT", label: event.currentTarget.value })
        },
      })
    },
  }
}
