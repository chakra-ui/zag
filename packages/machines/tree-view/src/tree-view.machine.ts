import { createMachine, guards } from "@zag-js/core"
import { getByTypeahead } from "@zag-js/dom-query"
import { add, addOrRemove, compact, first, isEqual, remove, uniq } from "@zag-js/utils"
import { collection } from "./tree-view.collection"
import { dom } from "./tree-view.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./tree-view.types"
import { getVisibleNodes, skipFn } from "./tree-view.utils"

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
        collection: ctx.collection ?? collection.empty(),
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
            actions: ["selectAllNodes", "focusTreeLastNode"],
          },
          {
            guard: "isMultipleSelection",
            actions: ["selectAllNodes"],
          },
        ],
        "EXPANDED.ALL": {
          actions: ["expandAllBranches"],
        },
      },

      states: {
        idle: {
          on: {
            "NODE.FOCUS": {
              actions: ["setFocusedNode"],
            },
            "NODE.ARROW_DOWN": [
              {
                guard: and("isShiftKey", "isMultipleSelection"),
                actions: ["focusTreeNextNode", "extendSelectionToNextNode"],
              },
              {
                actions: ["focusTreeNextNode"],
              },
            ],
            "NODE.ARROW_UP": [
              {
                guard: and("isShiftKey", "isMultipleSelection"),
                actions: ["focusTreePrevNode", "extendSelectionToPrevNode"],
              },
              {
                actions: ["focusTreePrevNode"],
              },
            ],
            "NODE.ARROW_LEFT": {
              actions: ["focusBranchNode"],
            },
            "BRANCH_NODE.ARROW_LEFT": [
              {
                guard: "isBranchExpanded",
                actions: ["collapseBranch"],
              },
              {
                actions: ["focusBranchNode"],
              },
            ],
            "BRANCH_NODE.ARROW_RIGHT": [
              {
                guard: and("isBranchFocused", "isBranchExpanded"),
                actions: ["focusBranchFirstNode"],
              },
              {
                actions: ["expandBranch"],
              },
            ],
            "SIBLINGS.EXPAND": {
              actions: ["expandSiblingBranches"],
            },
            "NODE.HOME": [
              {
                guard: and("isShiftKey", "isMultipleSelection"),
                actions: ["extendSelectionToFirstNode", "focusTreeFirstNode"],
              },
              {
                actions: ["focusTreeFirstNode"],
              },
            ],
            "NODE.END": [
              {
                guard: and("isShiftKey", "isMultipleSelection"),
                actions: ["extendSelectionToLastNode", "focusTreeLastNode"],
              },
              {
                actions: ["focusTreeLastNode"],
              },
            ],
            "NODE.CLICK": [
              {
                guard: and("isCtrlKey", "isMultipleSelection"),
                actions: ["toggleNodeSelection"],
              },
              {
                guard: and("isShiftKey", "isMultipleSelection"),
                actions: ["extendSelectionToNode"],
              },
              {
                actions: ["selectNode"],
              },
            ],
            "BRANCH_NODE.CLICK": [
              {
                guard: and("isCtrlKey", "isMultipleSelection"),
                actions: ["toggleNodeSelection"],
              },
              {
                guard: and("isShiftKey", "isMultipleSelection"),
                actions: ["extendSelectionToNode"],
              },
              {
                guard: "openOnClick",
                actions: ["selectNode", "toggleBranchNode"],
              },
              {
                actions: ["selectNode"],
              },
            ],
            "BRANCH_TOGGLE.CLICK": {
              actions: ["toggleBranchNode"],
            },
            "TREE.TYPEAHEAD": {
              actions: ["focusMatchedNode"],
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
      actions: {
        selectNode(ctx, evt) {
          set.selected(ctx, [evt.id])
        },
        setFocusedNode(ctx, evt) {
          set.focused(ctx, evt.id)
        },
        clearFocusedNode(ctx) {
          set.focused(ctx, null)
        },
        clearSelectedItem(ctx) {
          set.selected(ctx, [])
        },
        toggleBranchNode(ctx, evt) {
          set.expanded(ctx, addOrRemove(ctx.expandedValue, evt.id))
        },
        expandBranch(ctx, evt) {
          set.expanded(ctx, add(ctx.expandedValue, evt.id))
        },
        collapseBranch(ctx, evt) {
          set.expanded(ctx, remove(ctx.expandedValue, evt.id))
        },
        setExpanded(ctx, evt) {
          set.expanded(ctx, evt.value)
        },
        setSelected(ctx, evt) {
          set.selected(ctx, evt.value)
        },
        focusTreeFirstNode(ctx) {
          const firstNode = ctx.collection.getFirstNode()
          const firstValue = ctx.collection.getNodeValue(firstNode)
          dom.focusNode(ctx, firstValue)
        },
        focusTreeLastNode(ctx) {
          const lastNode = ctx.collection.getLastNode()
          const lastValue = ctx.collection.getNodeValue(lastNode)
          dom.focusNode(ctx, lastValue)
        },
        focusBranchFirstNode(ctx, evt) {
          const branchNode = ctx.collection.findNode(evt.id)
          const firstNode = ctx.collection.getFirstNode(branchNode)
          const firstValue = ctx.collection.getNodeValue(firstNode)
          dom.focusNode(ctx, firstValue)
        },
        focusTreeNextNode(ctx, evt) {
          let nextNode = ctx.collection.getNextNode(evt.id, { skip: skipFn(ctx) })
          nextNode = nextNode ?? ctx.collection.getFirstNode()
          const nextValue = ctx.collection.getNodeValue(nextNode)
          dom.focusNode(ctx, nextValue)
        },
        focusTreePrevNode(ctx, evt) {
          let prevNode = ctx.collection.getPreviousNode(evt.id, { skip: skipFn(ctx) })
          prevNode = prevNode ?? ctx.collection.getLastNode()
          const prevValue = ctx.collection.getNodeValue(prevNode)
          dom.focusNode(ctx, prevValue)
        },
        focusBranchNode(ctx, evt) {
          const parentNode = ctx.collection.getParentNode(evt.id)
          const parentValue = parentNode ? ctx.collection.getNodeValue(parentNode) : undefined
          dom.focusNode(ctx, parentValue)
        },
        selectAllNodes(ctx) {
          set.selected(ctx, ctx.collection.getValues())
        },
        focusMatchedNode(ctx, evt) {
          const node = dom.getMatchingNode(ctx, evt.key)
          dom.focusNode(ctx, node?.id)
        },
        toggleNodeSelection(ctx, evt) {
          const selectedValue = addOrRemove(ctx.selectedValue, evt.id)
          set.selected(ctx, selectedValue)
        },
        expandAllBranches(ctx) {
          const nextValue = ctx.collection.getBranchValues()
          set.expanded(ctx, nextValue)
        },
        expandSiblingBranches(ctx, evt) {
          const indexPath = ctx.collection.getIndexPath(evt.id)
          if (!indexPath) return
          const nodes = ctx.collection.getSiblingNodes(indexPath)
          const values = nodes.map((node) => ctx.collection.getNodeValue(node))
          set.expanded(ctx, uniq(values))
        },
        extendSelectionToNode(ctx, evt) {
          const anchorValue = first(ctx.selectedValue) || ctx.collection.getNodeValue(ctx.collection.getFirstNode())
          const targetValue = evt.id

          let values: string[] = [anchorValue, targetValue]

          let hits = 0
          const visibleNodes = getVisibleNodes(ctx)
          visibleNodes.forEach(({ node }) => {
            const nodeValue = ctx.collection.getNodeValue(node)
            if (hits === 1) values.push(nodeValue)
            if (nodeValue === anchorValue || nodeValue === targetValue) hits++
          })
          set.selected(ctx, uniq(values))
        },
        extendSelectionToNextNode(ctx, evt) {
          const nextNode = ctx.collection.getNextNode(evt.id, { skip: skipFn(ctx) })
          if (!nextNode) return

          // extend selection to nextNode (preserve the anchor node)
          const values = new Set(ctx.selectedValue)
          const nextValue = ctx.collection.getNodeValue(nextNode)

          if (nextValue == null) return

          if (values.has(evt.id) && values.has(nextValue)) {
            values.delete(evt.id)
          } else if (!values.has(nextValue)) {
            values.add(nextValue)
          }

          set.selected(ctx, Array.from(values))
        },
        extendSelectionToPrevNode(ctx, evt) {
          const prevNode = ctx.collection.getPreviousNode(evt.id, { skip: skipFn(ctx) })
          if (!prevNode) return

          // extend selection to prevNode (preserve the anchor node)
          const values = new Set(ctx.selectedValue)
          const prevValue = ctx.collection.getNodeValue(prevNode)

          if (prevValue == null) return

          if (values.has(evt.id) && values.has(prevValue)) {
            values.delete(evt.id)
          } else if (!values.has(prevValue)) {
            values.add(prevValue)
          }

          set.selected(ctx, Array.from(values))
        },
        extendSelectionToFirstNode(ctx) {
          const currentSelection = first(ctx.selectedValue)
          const values: string[] = []

          ctx.collection.visit({
            skip: skipFn(ctx),
            onEnter: (node) => {
              const nodeValue = ctx.collection.getNodeValue(node)
              values.push(nodeValue)
              if (nodeValue === currentSelection) {
                return "stop"
              }
            },
          })

          set.selected(ctx, values)
        },
        extendSelectionToLastNode(ctx) {
          const currentSelection = first(ctx.selectedValue)
          const values: string[] = []
          let current = false

          ctx.collection.visit({
            skip: skipFn(ctx),
            onEnter: (node) => {
              const nodeValue = ctx.collection.getNodeValue(node)
              if (nodeValue === currentSelection) current = true
              if (current) values.push(nodeValue)
            },
          })

          set.selected(ctx, values)
        },
      },
    },
  )
}

const invoke = {
  focusChange(ctx: MachineContext) {
    ctx.onFocusChange?.({ focusedValue: ctx.focusedValue })
  },
  expandedChange(ctx: MachineContext) {
    ctx.onExpandedChange?.({
      expandedValue: Array.from(ctx.expandedValue),
      focusedValue: ctx.focusedValue,
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
    if (isEqual(ctx.selectedValue, value)) return
    ctx.selectedValue = value
    invoke.selectionChange(ctx)
  },
  focused(ctx: MachineContext, value: string | null) {
    if (isEqual(ctx.focusedValue, value)) return
    ctx.focusedValue = value
    invoke.focusChange(ctx)
  },
  expanded(ctx: MachineContext, value: string[]) {
    if (isEqual(ctx.expandedValue, value)) return
    ctx.expandedValue = value
    invoke.expandedChange(ctx)
  },
}
