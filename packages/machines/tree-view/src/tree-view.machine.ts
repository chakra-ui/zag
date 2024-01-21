import { createMachine, guards } from "@zag-js/core"
import { getByTypeahead, isHTMLElement } from "@zag-js/dom-query"
import { observeChildren } from "@zag-js/mutation-observer"
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
        expandedIds: new Set(),
        selectedIds: new Set(),
        focusedId: null,
        openOnClick: true,
        selectionMode: "single",
        ...ctx,
        typeahead: getByTypeahead.defaultOptions,
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
        isBranchFocused: (ctx, evt) => ctx.focusedId === evt.id,
        isBranchExpanded: (ctx, evt) => ctx.expandedIds.has(evt.id),
        isShiftKey: (_ctx, evt) => evt.shiftKey,
        isCtrlKey: (_ctx, evt) => evt.ctrlKey,
        hasSelectedItems: (ctx) => ctx.selectedIds.size > 0,
        isMultipleSelection: (ctx) => ctx.isMultipleSelection,
        moveFocus: (_ctx, evt) => !!evt.moveFocus,
        openOnClick: (ctx) => !!ctx.openOnClick,
      },
      activities: {
        trackChildrenMutation(ctx, _evt, { send }) {
          const treeEl = dom.getTreeEl(ctx)
          return observeChildren(treeEl, (records) => {
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

            const nextSet = new Set(ctx.selectedIds)
            removedIds.forEach((id) => nextSet.delete(id))
            send({ type: "SELECTED.SET", value: removedIds })
          })
        },
      },
      actions: {
        setFocusableNode(ctx) {
          if (ctx.focusedId) return

          if (ctx.selectedIds.size > 0) {
            const firstSelectedId = Array.from(ctx.selectedIds)[0]
            ctx.focusedId = firstSelectedId
            return
          }

          const walker = dom.getTreeWalker(ctx)
          const firstItem = walker.firstChild()

          if (!isHTMLElement(firstItem)) return
          // don't use set.focused here because it will trigger focusChange event
          ctx.focusedId = dom.getNodeId(firstItem)
        },
        selectItem(ctx, evt) {
          set.selected(ctx, new Set([evt.id]))
        },
        setFocusedItem(ctx, evt) {
          set.focused(ctx, evt.id)
        },
        clearFocusedItem(ctx) {
          set.focused(ctx, null)
        },
        clearSelectedItem(ctx) {
          set.selected(ctx, new Set())
        },
        toggleBranch(ctx, evt) {
          const nextSet = new Set(ctx.expandedIds)

          if (nextSet.has(evt.id)) {
            nextSet.delete(evt.id)
            // collapseEffect(ctx, evt)
          } else {
            nextSet.add(evt.id)
          }

          set.expanded(ctx, nextSet)
        },
        expandBranch(ctx, evt) {
          const nextSet = new Set(ctx.expandedIds)
          nextSet.add(evt.id)
          set.expanded(ctx, nextSet)
        },
        collapseBranch(ctx, evt) {
          const nextSet = new Set(ctx.expandedIds)
          nextSet.delete(evt.id)
          set.expanded(ctx, nextSet)
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

          if (ctx.focusedId) {
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

          if (ctx.focusedId) {
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
          set.selected(ctx, nextSet)
        },
        focusMatchedItem(ctx, evt) {
          dom.focusNode(dom.getMatchingEl(ctx, evt.key))
        },
        addOrRemoveItemFromSelection(ctx, evt) {
          const focusedEl = dom.getNodeEl(ctx, evt.id)
          if (!focusedEl) return

          const nextSet = new Set(ctx.selectedIds)

          const nodeId = dom.getNodeId(focusedEl)
          if (nodeId == null) return

          if (nextSet.has(nodeId)) {
            nextSet.delete(nodeId)
          } else {
            nextSet.add(nodeId)
          }

          set.selected(ctx, nextSet)
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
          set.expanded(ctx, nextSet)
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

          set.expanded(ctx, nextSet)
        },
        extendSelectionToItem(ctx, evt) {
          const focusedEl = dom.getNodeEl(ctx, evt.id)
          if (!focusedEl) return

          const nodes = dom.getTreeNodes(ctx)
          const selectedIds = Array.from(ctx.selectedIds)
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
          const selectedIds = new Set(ctx.selectedIds)
          const nextNodeId = dom.getNodeId(nextNode)

          if (nextNodeId == null) return

          if (selectedIds.has(nodeId) && selectedIds.has(nextNodeId)) {
            selectedIds.delete(nodeId)
          } else if (!selectedIds.has(nextNodeId)) {
            selectedIds.add(nextNodeId)
          }

          set.selected(ctx, selectedIds)
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
          const selectedIds = new Set(ctx.selectedIds)
          const prevNodeId = dom.getNodeId(prevNode)

          if (prevNodeId == null) return

          if (selectedIds.has(nodeId) && selectedIds.has(prevNodeId)) {
            selectedIds.delete(nodeId)
          } else if (!selectedIds.has(prevNodeId)) {
            selectedIds.add(prevNodeId)
          }

          set.selected(ctx, selectedIds)
        },
        extendSelectionToFirstItem(ctx) {
          const nodes = dom.getTreeNodes(ctx)

          const anchorEl = dom.getNodeEl(ctx, [...ctx.selectedIds][0]) || nodes[0]
          const focusedEl = nodes[0]

          const selectedIds = dom.getNodesInRange(nodes, anchorEl, focusedEl)
          set.selected(ctx, selectedIds)
        },
        extendSelectionToLastItem(ctx) {
          const nodes = dom.getTreeNodes(ctx)

          const anchorEl = dom.getNodeEl(ctx, [...ctx.selectedIds][0]) || nodes[0]
          const focusedEl = nodes[nodes.length - 1]

          const selectedIds = dom.getNodesInRange(nodes, anchorEl, focusedEl)
          set.selected(ctx, selectedIds)
        },
      },
    },
  )
}

// if the branch is collapsed, we need to remove all its children from selectedIds
// function collapseEffect(ctx: MachineContext, evt: any) {
//   const walker = dom.getTreeWalker(ctx, {
//     skipHidden: false,
//     root: dom.getBranchEl(ctx, evt.id),
//   })

//   const idsToRemove = new Set<string>()
//   let node = walker.firstChild()
//   while (node) {
//     if (isHTMLElement(node)) {
//       idsToRemove.add(dom.getNodeId(node))
//     }
//     node = walker.nextNode()
//   }

//   const nextSelectedSet = new Set(ctx.selectedIds)
//   idsToRemove.forEach((id) => nextSelectedSet.delete(id))
//   set.selected(ctx, nextSelectedSet)
// }

const invoke = {
  focusChange(ctx: MachineContext) {
    ctx.onFocusChange?.({ focusedId: ctx.focusedId! })
  },
  expandedChange(ctx: MachineContext) {
    ctx.onExpandedChange?.({
      expandedIds: ctx.expandedIds,
      focusedId: ctx.focusedId!,
    })
  },
  selectionChange(ctx: MachineContext) {
    ctx.onSelectionChange?.({
      selectedIds: ctx.selectedIds,
      focusedId: ctx.focusedId!,
    })
  },
}

const set = {
  selected(ctx: MachineContext, set: Set<string>) {
    ctx.selectedIds = set
    invoke.selectionChange(ctx)
  },
  focused(ctx: MachineContext, id: string | null) {
    ctx.focusedId = id
    invoke.focusChange(ctx)
  },
  expanded(ctx: MachineContext, set: Set<string>) {
    ctx.expandedIds = set
    invoke.expandedChange(ctx)
  },
}
