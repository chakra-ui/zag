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
        ...ctx,
        typeahead: getByTypeahead.defaultOptions,
      },

      computed: {
        isMultipleSelection: (ctx) => ctx.selectionMode === "multiple",
      },

      watch: {
        focusedId: ["setFocusableNode"],
      },

      on: {
        "EXPANDED.SET": {
          actions: ["setExpanded"],
        },
        "SELECTED.SET": {
          actions: ["setSelected"],
        },
      },

      activities: ["trackChildrenMutation"],

      entry: ["setFocusableNode"],

      states: {
        idle: {
          on: {
            "ITEM.REMOVE": {
              actions: ["setSelected", "setFocusedItem"],
            },
            "ITEM.SELECT_ALL": {
              actions: ["selectAllItems"],
            },
            "ITEM.FOCUS": {
              actions: ["setFocusedItem"],
            },
            "ITEM.ARROW_DOWN": {
              actions: ["focusTreeNextItem"],
            },
            "ITEM.ARROW_UP": {
              actions: ["focusTreePrevItem"],
            },
            "ITEM.ARROW_LEFT": {
              actions: ["focusBranchTrigger"],
            },
            "BRANCH.ARROW_LEFT": [
              {
                guard: "isBranchExpanded",
                actions: ["collapseBranch"],
              },
              {
                actions: ["focusBranchTrigger"],
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
            "ITEM.HOME": {
              actions: ["focusTreeFirstItem"],
            },
            "ITEM.END": {
              actions: ["focusTreeLastItem"],
            },
            "ITEM.CLICK": {
              actions: ["selectItem"],
            },
            "BRANCH.CLICK": {
              actions: ["selectItem", "toggleBranch"],
            },
            "BRANCH.TOGGLE": {
              actions: ["toggleBranch"],
            },
            TYPEAHEAD: {
              actions: "focusMatchedItem",
            },
            "TREE.BLUR": {
              actions: ["clearFocusedItem"],
            },
          },
        },
      },
    },
    {
      guards: {
        isBranchFocused: (ctx, evt) => ctx.focusedId === evt.id,
        isBranchExpanded: (ctx, evt) => ctx.expandedIds.has(evt.id),
        hasSelectedItems: (ctx) => ctx.selectedIds.size > 0,
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
              if (isHTMLElement(node)) {
                removedIds.add(node.dataset.branch ?? node.id)
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
          if (ctx.focusedId) {
            return
          }

          if (ctx.selectedIds.size > 0) {
            const firstSelectedId = Array.from(ctx.selectedIds)[0]
            ctx.focusedId = firstSelectedId
            return
          }

          const walker = dom.getTreeWalker(ctx)
          const firstItem = walker.firstChild()

          if (!isHTMLElement(firstItem)) return
          // don't use set.focused here because it will trigger focusChange event
          ctx.focusedId = firstItem.id
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
          collapseEffect(ctx, evt)
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
        focusTreeLastItem(ctx) {
          const walker = dom.getTreeWalker(ctx)
          dom.focusNode(walker.lastChild())
        },
        focusBranchFirstItem(ctx) {
          const walker = dom.getTreeWalker(ctx)
          walker.currentNode = document.activeElement as HTMLElement
          dom.focusNode(walker.nextNode())
        },
        focusTreeNextItem(ctx) {
          const walker = dom.getTreeWalker(ctx)
          const activeEl = dom.getActiveElement(ctx) as HTMLElement
          if (ctx.focusedId) {
            walker.currentNode = activeEl
            const nextNode = walker.nextNode()
            dom.focusNode(nextNode)
          } else {
            dom.focusNode(walker.firstChild())
          }
        },
        focusTreePrevItem(ctx) {
          const walker = dom.getTreeWalker(ctx)
          const activeEl = dom.getActiveElement(ctx) as HTMLElement
          if (ctx.focusedId) {
            walker.currentNode = activeEl
            const prevNode = walker.previousNode()
            dom.focusNode(prevNode)
          } else {
            dom.focusNode(walker.lastChild())
          }
        },
        focusBranchTrigger(ctx) {
          if (!ctx.focusedId) return
          const activeEl = dom.getActiveElement(ctx)
          if (!activeEl) return

          const parentDepth = Number(activeEl.dataset.depth) - 1
          if (parentDepth < 0) return

          const branchSelector = `[data-part=branch][data-depth="${parentDepth}"]`
          const closestBranch = activeEl.closest(branchSelector)

          const branchTrigger = closestBranch?.querySelector("[data-part=branch-trigger]")
          dom.focusNode(branchTrigger)
        },
        selectAllItems(ctx) {
          const nextSet = new Set<string>()
          const walker = dom.getTreeWalker(ctx)
          let node = walker.firstChild()
          while (node) {
            if (isHTMLElement(node)) {
              nextSet.add(node.dataset.branch ?? node.id)
            }
            node = walker.nextNode()
          }
          set.selected(ctx, nextSet)
        },
        focusMatchedItem(ctx, evt) {
          const node = dom.getMatchingEl(ctx, evt.key)
          dom.focusNode(node)
        },
      },
    },
  )
}

// if the branch is collapsed, we need to remove all its children from selectedIds
function collapseEffect(ctx: MachineContext, evt: any) {
  const walker = dom.getTreeWalker(ctx, {
    skipHidden: false,
    root: dom.getBranchEl(ctx, evt.id),
  })

  const idsToRemove = new Set<string>()
  let node = walker.firstChild()
  while (node) {
    if (isHTMLElement(node)) {
      idsToRemove.add(node.dataset.branch ?? node.id)
    }
    node = walker.nextNode()
  }

  const nextSelectedSet = new Set(ctx.selectedIds)
  idsToRemove.forEach((id) => nextSelectedSet.delete(id))
  set.selected(ctx, nextSelectedSet)
}

const invoke = {
  focusChange(ctx: MachineContext) {
    ctx.onFocusChange?.({ focusedId: ctx.focusedId! })
  },
  openChange(ctx: MachineContext) {
    ctx.onOpenChange?.({ ids: ctx.expandedIds })
  },
  selectionChange(ctx: MachineContext) {
    ctx.onSelectionChange?.({ ids: ctx.selectedIds })
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
    invoke.openChange(ctx)
  },
}
