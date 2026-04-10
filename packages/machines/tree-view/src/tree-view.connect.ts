import {
  ariaAttr,
  dataAttr,
  getByTypeahead,
  getEventKey,
  getEventTarget,
  getFocusables,
  isAnchorElement,
  isComposingEvent,
  isEditableElement,
  isLeftClick,
  isModifierKey,
} from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { add, match, uniq } from "@zag-js/utils"
import { parts } from "./tree-view.anatomy"
import * as dom from "./tree-view.dom"
import type {
  NodeIndicatorProps,
  NodeProps,
  NodeState,
  TreeNode,
  TreeViewApi,
  TreeViewService,
} from "./tree-view.types"
import { getCheckedState, getCheckedValueMap } from "./utils/checked-state"

export function connect<T extends PropTypes, V extends TreeNode = TreeNode>(
  service: TreeViewService<V>,
  normalize: NormalizeProps<T>,
): TreeViewApi<T, V> {
  const { context, scope, computed, prop, send } = service
  const collection = prop("collection")
  const translations = prop("translations")

  const expandedValue = Array.from(context.get("expandedValue"))
  const selectedValue = Array.from(context.get("selectedValue"))
  const checkedValue = Array.from(context.get("checkedValue"))

  const isTypingAhead = computed("isTypingAhead")
  const focusedValue = context.get("focusedValue")
  const loadingStatus = context.get("loadingStatus")
  const renamingValue = context.get("renamingValue")
  const isCheckboxMode = computed("isCheckboxMode")

  const skip = ({ indexPath }: { indexPath: number[] }) => {
    const paths = collection.getValuePath(indexPath).slice(0, -1)
    return paths.some((value) => !expandedValue.includes(value))
  }

  const firstNode = collection.getFirstNode(undefined, { skip })
  const firstNodeValue = firstNode ? collection.getNodeValue(firstNode) : null

  function getNodeState(props: NodeProps): NodeState {
    const { node, indexPath } = props
    const value = collection.getNodeValue(node)
    return {
      id: dom.getNodeId(scope, value),
      value,
      indexPath,
      valuePath: collection.getValuePath(indexPath),
      disabled: Boolean(node.disabled),
      focused: focusedValue == null ? firstNodeValue === value : focusedValue === value,
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
        ...parts.root.attrs(scope.id),
        dir: prop("dir"),
      })
    },

    getLabelProps() {
      return normalize.element({
        ...parts.label.attrs(scope.id),
        id: dom.getLabelId(scope),
        dir: prop("dir"),
      })
    },

    getTreeProps() {
      return normalize.element({
        ...parts.tree.attrs(scope.id),
        dir: prop("dir"),
        role: "treegrid",
        "aria-label": translations.treeLabel,
        "aria-labelledby": dom.getLabelId(scope),
        "aria-multiselectable": prop("selectionMode") === "multiple" || undefined,
        tabIndex: -1,
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (isComposingEvent(event)) return

          const target = getEventTarget<HTMLElement>(event)
          // allow typing in input elements within the tree
          if (isEditableElement(target)) return

          // Check if focus is inside a gridcell — handle cell navigation via DOM
          const cell = target?.closest<HTMLElement>('[role="gridcell"]')
          if (cell) {
            const row = cell.closest<HTMLElement>("[data-tree-view-node]")
            if (!row) return

            const nodeId = row.dataset.value

            // Only include cells that have focusable children (skip text-only cells)
            const interactiveCells = getInteractiveCells(row)
            const cellIndex = interactiveCells.indexOf(cell)

            const cellKeyMap: EventKeyMap = {
              ArrowRight(event) {
                event.preventDefault()
                const next = interactiveCells[cellIndex + 1]
                if (next) {
                  getFocusables(next)[0]?.focus()
                } else {
                  row.focus()
                }
              },
              ArrowLeft(event) {
                event.preventDefault()
                const prev = interactiveCells[cellIndex - 1]
                if (prev) {
                  getFocusables(prev)[0]?.focus()
                } else {
                  row.focus()
                }
              },
              ArrowUp(event) {
                event.preventDefault()
                if (nodeId) {
                  row.focus()
                  send({ type: "NODE.ARROW_UP", id: nodeId, shiftKey: event.shiftKey })
                }
              },
              ArrowDown(event) {
                event.preventDefault()
                if (nodeId) {
                  row.focus()
                  send({ type: "NODE.ARROW_DOWN", id: nodeId, shiftKey: event.shiftKey })
                }
              },
              Home(event) {
                event.preventDefault()
                getFocusables(interactiveCells[0])?.[0]?.focus()
              },
              End(event) {
                event.preventDefault()
                getFocusables(interactiveCells[interactiveCells.length - 1])?.[0]?.focus()
              },
              Escape(event) {
                event.preventDefault()
                row.focus()
              },
            }

            const key = getEventKey(event, { dir: prop("dir") })
            const exec = cellKeyMap[key]
            if (exec) {
              exec(event)
              return
            }
            // Let Tab/Shift+Tab pass through for within-cell focus
            return
          }

          // Row-mode keyboard handling
          const node = target?.closest<HTMLElement>("[data-tree-view-node]")
          if (!node) return

          const nodeId = node.dataset.value

          if (nodeId == null) {
            console.warn(`[zag-js/tree-view] Node id not found for node`, node)
            return
          }

          const isBranchNode = node.hasAttribute("data-branch")

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
              send({ type: "NODE.ARROW_LEFT", id: nodeId, isBranch: isBranchNode })
            },
            ArrowRight(event) {
              if (node.dataset.disabled) return
              event.preventDefault()

              // Collapsed branch → expand
              if (isBranchNode && node.getAttribute("aria-expanded") === "false") {
                send({ type: "NODE.ARROW_RIGHT", id: nodeId, isBranch: true })
                return
              }

              // Expanded branch or leaf → enter cell nav if interactive cells exist
              const interactiveCells = getInteractiveCells(node)
              if (interactiveCells.length > 0) {
                getFocusables(interactiveCells[0])[0]?.focus()
              }
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
                return
              }

              event.preventDefault()

              if (isCheckboxMode) {
                send({ type: "CHECKED.TOGGLE", value: nodeId, isBranch: isBranchNode })
              } else {
                keyMap.Enter?.(event)
              }
            },
            Enter(event) {
              if (node.dataset.disabled) return
              if (isAnchorElement(target) && isModifierKey(event)) return

              send({ type: "NODE.CLICK", id: nodeId, isBranch: isBranchNode, src: "keyboard" })

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

    getNodeGroupProps(props) {
      const nodeState = getNodeState(props)
      return normalize.element({
        ...parts.nodeGroup.attrs(scope.id),
        "data-depth": nodeState.depth,
        dir: prop("dir"),
        "data-value": nodeState.value,
        "data-path": props.indexPath.join("/"),
        "data-state": nodeState.expanded ? "open" : "closed",
        "data-disabled": dataAttr(nodeState.disabled),
        "data-loading": dataAttr(nodeState.loading),
        style: {
          "--depth": nodeState.depth,
        },
      })
    },

    getNodeProps(props) {
      const nodeState = getNodeState(props)
      const siblings = collection.getSiblingNodes(props.indexPath)
      const posInSet = props.indexPath[props.indexPath.length - 1] + 1
      return normalize.element({
        ...parts.node.attrs(scope.id),
        id: nodeState.id,
        dir: prop("dir"),
        role: "row",
        "data-path": props.indexPath.join("/"),
        "data-value": nodeState.value,
        tabIndex: nodeState.focused ? 0 : -1,
        "data-focus": dataAttr(nodeState.focused),
        "aria-level": nodeState.depth,
        "aria-setsize": siblings.length,
        "aria-posinset": posInSet,
        "aria-current": nodeState.selected ? "true" : undefined,
        "aria-selected": nodeState.disabled ? undefined : nodeState.selected,
        "data-selected": dataAttr(nodeState.selected),
        "aria-expanded": nodeState.isBranch ? nodeState.expanded : undefined,
        "data-state": nodeState.isBranch ? (nodeState.expanded ? "open" : "closed") : undefined,
        "aria-disabled": ariaAttr(nodeState.disabled),
        "data-disabled": dataAttr(nodeState.disabled),
        "data-renaming": dataAttr(nodeState.renaming),
        "data-checked": dataAttr(nodeState.checked === true),
        "data-indeterminate": dataAttr(nodeState.checked === "indeterminate"),
        "data-depth": nodeState.depth,
        "data-loading": dataAttr(nodeState.loading),
        "aria-busy": ariaAttr(nodeState.loading),
        "data-branch": dataAttr(nodeState.isBranch),
        style: {
          "--depth": nodeState.depth,
        },
        onFocus(event) {
          event.stopPropagation()
          send({ type: "NODE.FOCUS", id: nodeState.value })
        },
        onClick(event) {
          if (nodeState.disabled) return
          if (nodeState.loading) return
          if (!isLeftClick(event)) return
          if (isAnchorElement(event.currentTarget) && isModifierKey(event)) return

          const isMetaKey = event.metaKey || event.ctrlKey
          send({
            type: "NODE.CLICK",
            id: nodeState.value,
            isBranch: nodeState.isBranch,
            shiftKey: event.shiftKey,
            ctrlKey: isMetaKey,
          })
          event.stopPropagation()

          if (!isAnchorElement(event.currentTarget)) {
            event.preventDefault()
          }
        },
      })
    },

    getNodeExpandTriggerProps(props) {
      const nodeState = getNodeState(props)
      return normalize.element({
        ...parts.nodeExpandTrigger.attrs(scope.id),
        role: "button",
        dir: prop("dir"),
        tabIndex: -1,
        "aria-hidden": true,
        "data-disabled": dataAttr(nodeState.disabled),
        "data-state": nodeState.expanded ? "open" : "closed",
        "data-value": nodeState.value,
        "data-loading": dataAttr(nodeState.loading),
        disabled: nodeState.loading,
        onClick(event) {
          if (nodeState.disabled || nodeState.loading) return
          send({ type: "EXPAND_TRIGGER.CLICK", id: nodeState.value })
          event.stopPropagation()
        },
      })
    },

    getNodeTextProps(props) {
      const nodeState = getNodeState(props)
      return normalize.element({
        ...parts.nodeText.attrs(scope.id),
        dir: prop("dir"),
        "data-disabled": dataAttr(nodeState.disabled),
        "data-selected": dataAttr(nodeState.selected),
        "data-focus": dataAttr(nodeState.focused),
        "data-state": nodeState.isBranch ? (nodeState.expanded ? "open" : "closed") : undefined,
        "data-loading": dataAttr(nodeState.loading),
      })
    },

    getNodeIndicatorProps(props: NodeIndicatorProps) {
      const nodeState = getNodeState(props)
      const { type } = props

      const hidden = match(type, {
        expanded: false,
        selected: !nodeState.selected,
        checked: nodeState.checked !== true,
        indeterminate: nodeState.checked !== "indeterminate",
      })

      return normalize.element({
        ...parts.nodeIndicator.attrs(scope.id),
        "aria-hidden": true,
        "data-type": type,
        "data-state": type === "expanded" ? (nodeState.expanded ? "open" : "closed") : undefined,
        "data-disabled": dataAttr(nodeState.disabled),
        "data-selected": dataAttr(nodeState.selected),
        "data-focus": dataAttr(nodeState.focused),
        "data-loading": dataAttr(nodeState.loading),
        hidden,
      })
    },

    getNodeGroupContentProps(props) {
      const nodeState = getNodeState(props)
      return normalize.element({
        ...parts.nodeGroupContent.attrs(scope.id),
        role: "group",
        dir: prop("dir"),
        "data-state": nodeState.expanded ? "open" : "closed",
        "data-depth": nodeState.depth,
        "data-path": props.indexPath.join("/"),
        "data-value": nodeState.value,
        hidden: !nodeState.expanded,
      })
    },

    getIndentGuideProps(props) {
      const nodeState = getNodeState(props)
      return normalize.element({
        ...parts.indentGuide.attrs(scope.id),
        "data-depth": nodeState.depth,
      })
    },

    getNodeCheckboxProps(props) {
      const nodeState = getNodeState(props)
      const checkedState = nodeState.checked
      return normalize.element({
        ...parts.nodeCheckbox.attrs(scope.id),
        tabIndex: -1,
        role: "checkbox",
        "aria-checked": checkedState === true ? "true" : checkedState === false ? "false" : "mixed",
        "data-state": checkedState === true ? "checked" : checkedState === false ? "unchecked" : "indeterminate",
        "data-disabled": dataAttr(nodeState.disabled),
        onClick(event) {
          if (event.defaultPrevented) return
          if (nodeState.disabled) return
          if (!isLeftClick(event)) return

          send({ type: "CHECKED.TOGGLE", value: nodeState.value, isBranch: nodeState.isBranch })
          event.stopPropagation()
        },
        onKeyDown(event) {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault()
            event.stopPropagation()
            send({ type: "CHECKED.TOGGLE", value: nodeState.value, isBranch: nodeState.isBranch })
          }
        },
      })
    },

    getNodeRenameInputProps(props) {
      const nodeState = getNodeState(props)
      return normalize.input({
        ...parts.nodeRenameInput.attrs(scope.id),
        id: dom.getRenameInputId(scope, nodeState.value),
        type: "text",
        "aria-label": translations.renameInputLabel,
        hidden: !nodeState.renaming,
        onKeyDown(event) {
          if (isComposingEvent(event)) return

          if (event.key === "Escape") {
            send({ type: "RENAME.CANCEL" })
            event.preventDefault()
          }
          if (event.key === "Enter") {
            send({ type: "RENAME.SUBMIT", label: event.currentTarget.value })
            event.preventDefault()
          }
          event.stopPropagation()
        },
        onBlur(event) {
          send({ type: "RENAME.SUBMIT", label: event.currentTarget.value })
        },
      })
    },

    getCellProps(props) {
      const nodeState = getNodeState(props)
      return normalize.element({
        ...parts.cell.attrs(scope.id),
        role: "gridcell",
        "data-value": nodeState.value,
      })
    },
  }
}

function getInteractiveCells(row: HTMLElement): HTMLElement[] {
  const cells = Array.from(row.querySelectorAll<HTMLElement>('[role="gridcell"]'))
  return cells.filter((cell) => getFocusables(cell).length > 0)
}
