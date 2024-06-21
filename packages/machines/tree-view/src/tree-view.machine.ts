import { createMachine, guards } from "@zag-js/core"
import { getByTypeahead, isHTMLElement, observeChildren } from "@zag-js/dom-query"
import { compact } from "@zag-js/utils"
import { dom } from "./tree-view.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./tree-view.types"

const { and } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "tree-view",
      initial: "idle",
      context: {
        expandedValue: [],
        selectedValue: [],
        focusedValue: null,
        expandOnClick: true,
        selectionMode: "single",
        typeahead: true,
        ...ctx,
        typeaheadState: getByTypeahead.defaultOptions,
      },

      computed: {
        isMultipleSelection: (ctx) => ctx.selectionMode === "multiple",
      },

      on: {
        "EXPANDED.SET": {
          actions: ["setExpanded"],
        },
        "SELECTED.SET": {
          actions: ["setSelected"],
        },
        "SELECTED.ALL": [
          {
            guard: and("isMultipleSelection", "moveFocus"),
            actions: ["selectAllItems", "focusTreeLastItem"],
          },
          {
            guard: "isMultipleSelection",
            actions: ["selectAllItems"],
          },
        ],
        "EXPANDED.ALL": {
          actions: ["expandAllBranches"],
        },
      },

      activities: ["trackChildrenMutation"],

      entry: ["setFocusableNode"],

      states: {
        idle: {
          on: {
            "ITEM.FOCUS": {
              actions: ["setFocusedItem"],
            },
            "ITEM.ARROW_DOWN": [
              {
                guard: and("isShiftKey", "isMultipleSelection"),
                actions: ["focusTreeNextItem", "extendSelectionToNextItem"],
              },
              {
                actions: ["focusTreeNextItem"],
              },
            ],
            "ITEM.ARROW_UP": [
              {
                guard: and("isShiftKey", "isMultipleSelection"),
                actions: ["focusTreePrevItem", "extendSelectionToPrevItem"],
              },
              {
                actions: ["focusTreePrevItem"],
              },
            ],
            "ITEM.ARROW_LEFT": {
              actions: ["focusBranchControl"],
            },
            "BRANCH.ARROW_LEFT": [
              {
                guard: "isBranchExpanded",
                actions: ["collapseBranch"],
              },
              {
                actions: ["focusBranchControl"],
              },
            ],
            "BRANCH.ARROW_RIGHT": [
              {
                guard: and("isBranchFocused", "isBranchExpanded"),
                actions: ["focusBranchFirstItem"],
              },
              {
                actions: ["expandBranch"],
              },
            ],
            "EXPAND.SIBLINGS": {
              actions: ["expandSiblingBranches"],
            },
            "ITEM.HOME": [
              {
                guard: and("isShiftKey", "isMultipleSelection"),
                actions: ["extendSelectionToFirstItem", "focusTreeFirstItem"],
              },
              {
                actions: ["focusTreeFirstItem"],
              },
            ],
            "ITEM.END": [
              {
                guard: and("isShiftKey", "isMultipleSelection"),
                actions: ["extendSelectionToLastItem", "focusTreeLastItem"],
              },
              {
                actions: ["focusTreeLastItem"],
              },
            ],
            "ITEM.CLICK": [
              {
                guard: and("isCtrlKey", "isMultipleSelection"),
                actions: ["addOrRemoveItemFromSelection"],
              },
              {
                guard: and("isShiftKey", "isMultipleSelection"),
                actions: ["extendSelectionToItem"],
              },
              {
                actions: ["selectItem"],
              },
            ],
            "BRANCH.CLICK": [
              {
                guard: and("isCtrlKey", "isMultipleSelection"),
                actions: ["addOrRemoveItemFromSelection"],
              },
              {
                guard: and("isShiftKey", "isMultipleSelection"),
                actions: ["extendSelectionToItem"],
              },
              {
                guard: "openOnClick",
                actions: ["selectItem", "toggleBranch"],
              },
              {
                actions: ["selectItem"],
              },
            ],
            "BRANCH_TOGGLE.CLICK": {
              actions: ["toggleBranch"],
            },
            "TREE.TYPEAHEAD": {
              actions: ["focusMatchedItem"],
            },
            "TREE.BLUR": {
              actions: ["clearFocusedItem", "setFocusableNode"],
            },
          },
        },
      },
    },
    {
      guards: {
        isBranchFocused: (ctx, evt) => ctx.focusedValue === evt.id,
        isBranchExpanded: (ctx, evt) => ctx.expandedValue.includes(evt.id),
        isShiftKey: (_ctx, evt) => evt.shiftKey,
        isCtrlKey: (_ctx, evt) => evt.ctrlKey,
        hasSelectedItems: (ctx) => ctx.selectedValue.length > 0,
        isMultipleSelection: (ctx) => ctx.isMultipleSelection,
        moveFocus: (_ctx, evt) => !!evt.moveFocus,
        openOnClick: (ctx) => !!ctx.expandOnClick,
      },
      activities: {
        trackChildrenMutation(ctx, _evt, { send }) {
          const treeEl = dom.getTreeEl(ctx)
          return observeChildren(treeEl, {
            callback(records) {
              const removedNodes = records
                .flatMap((r) => Array.from(r.removedNodes))
                .filter((node) => {
                  if (!isHTMLElement(node)) return false
                  return node.matches("[role=treeitem]") || node.matches("[role=group]")
                })

              if (!removedNodes.length) return

              let elementToFocus: HTMLElement | null = null
              records.forEach((record) => {
                if (isHTMLElement(record.nextSibling)) {
                  elementToFocus = record.nextSibling
                } else if (isHTMLElement(record.previousSibling)) {
                  elementToFocus = record.previousSibling
                }
              })

              if (elementToFocus) {
                dom.focusNode(elementToFocus)
              }

              const removedIds: Set<string> = new Set()
              removedNodes.forEach((node) => {
                const nodeId = dom.getNodeId(node)
                if (isHTMLElement(node) && nodeId != null) {
                  removedIds.add(nodeId)
                }
              })

              const nextSet = new Set(ctx.selectedValue)
              removedIds.forEach((id) => nextSet.delete(id))
              send({ type: "SELECTED.SET", value: removedIds })
            },
          })
        },
      },
      actions: {
        setFocusableNode(ctx) {
          if (ctx.focusedValue) return

          if (ctx.selectedValue.length > 0) {
            const firstSelectedId = Array.from(ctx.selectedValue)[0]
            ctx.focusedValue = firstSelectedId
            return
          }

          const walker = dom.getTreeWalker(ctx)
          const firstItem = walker.firstChild()

          if (!isHTMLElement(firstItem)) return
          // don't use set.focused here because it will trigger focusChange event
          ctx.focusedValue = dom.getNodeId(firstItem)
        },
        selectItem(ctx, evt) {
          set.selected(ctx, [evt.id])
        },
        setFocusedItem(ctx, evt) {
          set.focused(ctx, evt.id)
        },
        clearFocusedItem(ctx) {
          set.focused(ctx, null)
        },
        clearSelectedItem(ctx) {
          set.selected(ctx, [])
        },
        toggleBranch(ctx, evt) {
          const nextSet = new Set(ctx.expandedValue)

          if (nextSet.has(evt.id)) {
            nextSet.delete(evt.id)
            // collapseEffect(ctx, evt)
          } else {
            nextSet.add(evt.id)
          }

          set.expanded(ctx, Array.from(nextSet))
        },
        expandBranch(ctx, evt) {
          const nextSet = new Set(ctx.expandedValue)
          nextSet.add(evt.id)
          set.expanded(ctx, Array.from(nextSet))
        },
        collapseBranch(ctx, evt) {
          const nextSet = new Set(ctx.expandedValue)
          nextSet.delete(evt.id)
          set.expanded(ctx, Array.from(nextSet))
        },
        setExpanded(ctx, evt) {
          set.expanded(ctx, evt.value)
        },
        setSelected(ctx, evt) {
          set.selected(ctx, evt.value)
        },
        focusTreeFirstItem(ctx) {
          const walker = dom.getTreeWalker(ctx)
          dom.focusNode(walker.firstChild())
        },
        focusTreeLastItem(ctx, evt) {
          const walker = dom.getTreeWalker(ctx)
          dom.focusNode(walker.lastChild(), { preventScroll: evt.preventScroll })
        },
        focusBranchFirstItem(ctx, evt) {
          const focusedEl = dom.getNodeEl(ctx, evt.id)
          if (!focusedEl) return

          const walker = dom.getTreeWalker(ctx)

          walker.currentNode = focusedEl
          dom.focusNode(walker.nextNode())
        },
        focusTreeNextItem(ctx, evt) {
          const focusedEl = dom.getNodeEl(ctx, evt.id)
          if (!focusedEl) return

          const walker = dom.getTreeWalker(ctx)

          if (ctx.focusedValue) {
            walker.currentNode = focusedEl
            const nextNode = walker.nextNode()
            dom.focusNode(nextNode)
          } else {
            dom.focusNode(walker.firstChild())
          }
        },
        focusTreePrevItem(ctx, evt) {
          const focusedEl = dom.getNodeEl(ctx, evt.id)
          if (!focusedEl) return

          const walker = dom.getTreeWalker(ctx)

          if (ctx.focusedValue) {
            walker.currentNode = focusedEl
            const prevNode = walker.previousNode()
            dom.focusNode(prevNode)
          } else {
            dom.focusNode(walker.lastChild())
          }
        },
        focusBranchControl(ctx, evt) {
          const focusedEl = dom.getNodeEl(ctx, evt.id)
          if (!focusedEl) return

          const parentDepth = Number(focusedEl.dataset.depth) - 1
          if (parentDepth < 0) return

          const branchSelector = `[data-part=branch][data-depth="${parentDepth}"]`
          const closestBranch = focusedEl.closest(branchSelector)

          const branchControl = closestBranch?.querySelector("[data-part=branch-control]")
          dom.focusNode(branchControl)
        },
        selectAllItems(ctx) {
          const nextSet = new Set<string>()
          const walker = dom.getTreeWalker(ctx)
          let node = walker.firstChild()
          while (node) {
            const nodeId = dom.getNodeId(node)
            if (isHTMLElement(node) && nodeId != null) {
              nextSet.add(nodeId)
            }
            node = walker.nextNode()
          }
          set.selected(ctx, Array.from(nextSet))
        },
        focusMatchedItem(ctx, evt) {
          dom.focusNode(dom.getMatchingEl(ctx, evt.key))
        },
        addOrRemoveItemFromSelection(ctx, evt) {
          const focusedEl = dom.getNodeEl(ctx, evt.id)
          if (!focusedEl) return

          const nextSet = new Set(ctx.selectedValue)

          const nodeId = dom.getNodeId(focusedEl)
          if (nodeId == null) return

          if (nextSet.has(nodeId)) {
            nextSet.delete(nodeId)
          } else {
            nextSet.add(nodeId)
          }

          set.selected(ctx, Array.from(nextSet))
        },
        expandAllBranches(ctx) {
          const nextSet = new Set<string>()
          const walker = dom.getTreeWalker(ctx, { skipHidden: false })
          while (walker.nextNode()) {
            const node = walker.currentNode
            const nodeId = dom.getNodeId(node)
            if (isHTMLElement(node) && node.dataset.part === "branch-control" && nodeId != null) {
              nextSet.add(nodeId)
            }
          }
          set.expanded(ctx, Array.from(nextSet))
        },
        expandSiblingBranches(ctx, evt) {
          const focusedEl = dom.getNodeEl(ctx, evt.id)
          const nodes = dom.getBranchNodes(ctx, dom.getNodeDepth(focusedEl))

          const nextSet = new Set<string>()
          nodes.forEach((node) => {
            const nodeId = dom.getNodeId(node)
            if (nodeId == null) return
            nextSet.add(nodeId)
          })

          set.expanded(ctx, Array.from(nextSet))
        },
        extendSelectionToItem(ctx, evt) {
          const focusedEl = dom.getNodeEl(ctx, evt.id)
          if (!focusedEl) return

          const nodes = dom.getTreeNodes(ctx)
          const selectedIds = Array.from(ctx.selectedValue)
          const anchorEl = dom.getNodeEl(ctx, selectedIds[0]) || nodes[0]

          const nextSet = dom.getNodesInRange(nodes, anchorEl, focusedEl)

          set.selected(ctx, nextSet)
        },
        extendSelectionToNextItem(ctx, evt) {
          const nodeId = evt.id

          const currentNode = dom.getNodeEl(ctx, nodeId)
          if (!currentNode) return

          const walker = dom.getTreeWalker(ctx)
          walker.currentNode = currentNode

          const nextNode = walker.nextNode()
          dom.focusNode(nextNode)

          // extend selection to nextNode (preserve the anchor node)
          const selectedIds = new Set(ctx.selectedValue)
          const nextNodeId = dom.getNodeId(nextNode)

          if (nextNodeId == null) return

          if (selectedIds.has(nodeId) && selectedIds.has(nextNodeId)) {
            selectedIds.delete(nodeId)
          } else if (!selectedIds.has(nextNodeId)) {
            selectedIds.add(nextNodeId)
          }

          set.selected(ctx, Array.from(selectedIds))
        },
        extendSelectionToPrevItem(ctx, evt) {
          const nodeId = evt.id

          const currentNode = dom.getNodeEl(ctx, nodeId)
          if (!currentNode) return

          const walker = dom.getTreeWalker(ctx)
          walker.currentNode = currentNode

          const prevNode = walker.previousNode()
          dom.focusNode(prevNode)

          // extend selection to prevNode (preserve the anchor node)
          const selectedIds = new Set(ctx.selectedValue)
          const prevNodeId = dom.getNodeId(prevNode)

          if (prevNodeId == null) return

          if (selectedIds.has(nodeId) && selectedIds.has(prevNodeId)) {
            selectedIds.delete(nodeId)
          } else if (!selectedIds.has(prevNodeId)) {
            selectedIds.add(prevNodeId)
          }

          set.selected(ctx, Array.from(selectedIds))
        },
        extendSelectionToFirstItem(ctx) {
          const nodes = dom.getTreeNodes(ctx)

          const anchorEl = dom.getNodeEl(ctx, [...ctx.selectedValue][0]) || nodes[0]
          const focusedEl = nodes[0]

          const selectedIds = dom.getNodesInRange(nodes, anchorEl, focusedEl)
          set.selected(ctx, selectedIds)
        },
        extendSelectionToLastItem(ctx) {
          const nodes = dom.getTreeNodes(ctx)

          const anchorEl = dom.getNodeEl(ctx, [...ctx.selectedValue][0]) || nodes[0]
          const focusedEl = nodes[nodes.length - 1]

          const selectedIds = dom.getNodesInRange(nodes, anchorEl, focusedEl)
          set.selected(ctx, selectedIds)
        },
      },
    },
  )
}

const invoke = {
  focusChange(ctx: MachineContext) {
    ctx.onFocusChange?.({ focusedValue: ctx.focusedValue! })
  },
  expandedChange(ctx: MachineContext) {
    ctx.onExpandedChange?.({
      expandedValue: Array.from(ctx.expandedValue),
      focusedValue: ctx.focusedValue!,
    })
  },
  selectionChange(ctx: MachineContext) {
    ctx.onSelectionChange?.({
      selectedValue: Array.from(ctx.selectedValue),
      focusedValue: ctx.focusedValue,
    })
  },
}

const set = {
  selected(ctx: MachineContext, value: string[]) {
    ctx.selectedValue = value
    invoke.selectionChange(ctx)
  },
  focused(ctx: MachineContext, value: string | null) {
    ctx.focusedValue = value
    invoke.focusChange(ctx)
  },
  expanded(ctx: MachineContext, value: string[]) {
    ctx.expandedValue = value
    invoke.expandedChange(ctx)
  },
}
