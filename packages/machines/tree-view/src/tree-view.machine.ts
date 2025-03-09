import { createGuards, createMachine } from "@zag-js/core"
import { getByTypeahead } from "@zag-js/dom-query"
import { add, addOrRemove, first, isEqual, remove, uniq } from "@zag-js/utils"
import { collection } from "./tree-view.collection"
import * as dom from "./tree-view.dom"
import type { TreeViewSchema } from "./tree-view.types"
import { getVisibleNodes, skipFn } from "./tree-view.utils"

const { and } = createGuards<TreeViewSchema>()

export const machine = createMachine<TreeViewSchema>({
  props({ props }) {
    return {
      selectionMode: "single",
      collection: collection.empty(),
      typeahead: true,
      expandOnClick: true,
      defaultExpandedValue: [],
      defaultSelectedValue: [],
      ...props,
    }
  },

  initialState() {
    return "idle"
  },

  context({ prop, bindable, getContext }) {
    return {
      expandedValue: bindable(() => ({
        defaultValue: prop("defaultExpandedValue"),
        value: prop("expandedValue"),
        isEqual,
        onChange(value) {
          const focusedValue = getContext().get("focusedValue")
          prop("onExpandedChange")?.({ expandedValue: value, focusedValue })
        },
      })),
      selectedValue: bindable(() => ({
        defaultValue: prop("defaultSelectedValue"),
        value: prop("selectedValue"),
        isEqual,
        onChange(value) {
          const focusedValue = getContext().get("focusedValue")
          prop("onSelectionChange")?.({ selectedValue: value, focusedValue })
        },
      })),
      focusedValue: bindable(() => ({
        defaultValue: prop("focusedValue"),
        onChange(value) {
          prop("onFocusChange")?.({ focusedValue: value })
        },
      })),
    }
  },

  refs() {
    return {
      typeaheadState: { ...getByTypeahead.defaultOptions },
    }
  },

  computed: {
    isMultipleSelection: ({ prop }) => prop("selectionMode") === "multiple",
    isTypingAhead: ({ refs }) => refs.get("typeaheadState").keysSoFar.length > 0,
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

  implementations: {
    guards: {
      isBranchFocused: ({ context, event }) => context.get("focusedValue") === event.id,
      isBranchExpanded: ({ context, event }) => context.get("expandedValue").includes(event.id),
      isShiftKey: ({ event }) => event.shiftKey,
      isCtrlKey: ({ event }) => event.ctrlKey,
      hasSelectedItems: ({ context }) => context.get("selectedValue").length > 0,
      isMultipleSelection: ({ prop }) => prop("selectionMode") === "multiple",
      moveFocus: ({ event }) => !!event.moveFocus,
      openOnClick: ({ prop }) => !!prop("expandOnClick"),
    },
    actions: {
      selectNode({ context, event }) {
        context.set("selectedValue", [event.id])
      },
      setFocusedNode({ context, event }) {
        context.set("focusedValue", event.id)
      },
      clearFocusedNode({ context }) {
        context.set("focusedValue", null)
      },
      clearSelectedItem({ context }) {
        context.set("selectedValue", [])
      },
      toggleBranchNode({ context, event }) {
        context.set("expandedValue", (prev) => addOrRemove(prev, event.id))
      },
      expandBranch({ context, event }) {
        context.set("expandedValue", (prev) => add(prev, event.id))
      },
      collapseBranch({ context, event }) {
        context.set("expandedValue", (prev) => remove(prev, event.id))
      },
      setExpanded({ context, event }) {
        context.set("expandedValue", event.value)
      },
      setSelected({ context, event }) {
        context.set("selectedValue", event.value)
      },
      focusTreeFirstNode({ prop, scope }) {
        const collection = prop("collection")
        const firstNode = collection.getFirstNode()
        const firstValue = collection.getNodeValue(firstNode)
        dom.focusNode(scope, firstValue)
      },
      focusTreeLastNode({ prop, scope }) {
        const collection = prop("collection")
        const lastNode = collection.getLastNode()
        const lastValue = collection.getNodeValue(lastNode)
        dom.focusNode(scope, lastValue)
      },
      focusBranchFirstNode({ event, prop, scope }) {
        const collection = prop("collection")
        const branchNode = collection.findNode(event.id)
        const firstNode = collection.getFirstNode(branchNode)
        const firstValue = collection.getNodeValue(firstNode)
        dom.focusNode(scope, firstValue)
      },
      focusTreeNextNode(params) {
        const { event, prop, scope } = params
        const collection = prop("collection")
        const nextNode = collection.getNextNode(event.id, { skip: skipFn(params) })
        if (!nextNode) return
        const nextValue = collection.getNodeValue(nextNode)
        dom.focusNode(scope, nextValue)
      },
      focusTreePrevNode(params) {
        const { event, prop, scope } = params
        const collection = prop("collection")
        const prevNode = collection.getPreviousNode(event.id, { skip: skipFn(params) })
        if (!prevNode) return
        const prevValue = collection.getNodeValue(prevNode)
        dom.focusNode(scope, prevValue)
      },
      focusBranchNode({ event, prop, scope }) {
        const collection = prop("collection")
        const parentNode = collection.getParentNode(event.id)
        const parentValue = parentNode ? collection.getNodeValue(parentNode) : undefined
        dom.focusNode(scope, parentValue)
      },
      selectAllNodes({ context, prop }) {
        context.set("selectedValue", prop("collection").getValues())
      },
      focusMatchedNode(params) {
        const { context, prop, refs, event, scope } = params
        const nodes = getVisibleNodes(params)
        const elements = nodes.map(({ node }) => ({
          textContent: prop("collection").stringifyNode(node),
          id: prop("collection").getNodeValue(node),
        }))
        const node = getByTypeahead(elements, {
          state: refs.get("typeaheadState"),
          activeId: context.get("focusedValue"),
          key: event.key,
        })

        dom.focusNode(scope, node?.id)
      },
      toggleNodeSelection({ context, event }) {
        const selectedValue = addOrRemove(context.get("selectedValue"), event.id)
        context.set("selectedValue", selectedValue)
      },
      expandAllBranches({ context, prop }) {
        const nextValue = prop("collection").getBranchValues()
        context.set("expandedValue", nextValue)
      },
      expandSiblingBranches({ context, event, prop }) {
        const collection = prop("collection")
        const indexPath = collection.getIndexPath(event.id)
        if (!indexPath) return
        const nodes = collection.getSiblingNodes(indexPath)
        const values = nodes.map((node) => collection.getNodeValue(node))
        context.set("expandedValue", uniq(values))
      },
      extendSelectionToNode(params) {
        const { context, event, prop } = params
        const collection = prop("collection")
        const anchorValue = first(context.get("selectedValue")) || collection.getNodeValue(collection.getFirstNode())
        const targetValue = event.id

        let values: string[] = [anchorValue, targetValue]

        let hits = 0
        const visibleNodes = getVisibleNodes(params)
        visibleNodes.forEach(({ node }) => {
          const nodeValue = collection.getNodeValue(node)
          if (hits === 1) values.push(nodeValue)
          if (nodeValue === anchorValue || nodeValue === targetValue) hits++
        })
        context.set("selectedValue", uniq(values))
      },
      extendSelectionToNextNode(params) {
        const { context, event, prop } = params
        const collection = prop("collection")
        const nextNode = collection.getNextNode(event.id, { skip: skipFn(params) })
        if (!nextNode) return

        // extend selection to nextNode (preserve the anchor node)
        const values = new Set(context.get("selectedValue"))
        const nextValue = collection.getNodeValue(nextNode)

        if (nextValue == null) return

        if (values.has(event.id) && values.has(nextValue)) {
          values.delete(event.id)
        } else if (!values.has(nextValue)) {
          values.add(nextValue)
        }

        context.set("selectedValue", Array.from(values))
      },
      extendSelectionToPrevNode(params) {
        const { context, event, prop } = params
        const collection = prop("collection")
        const prevNode = collection.getPreviousNode(event.id, { skip: skipFn(params) })
        if (!prevNode) return

        // extend selection to prevNode (preserve the anchor node)
        const values = new Set(context.get("selectedValue"))
        const prevValue = collection.getNodeValue(prevNode)

        if (prevValue == null) return

        if (values.has(event.id) && values.has(prevValue)) {
          values.delete(event.id)
        } else if (!values.has(prevValue)) {
          values.add(prevValue)
        }

        context.set("selectedValue", Array.from(values))
      },
      extendSelectionToFirstNode(params) {
        const { context, prop } = params
        const collection = prop("collection")
        const currentSelection = first(context.get("selectedValue"))
        const values: string[] = []

        collection.visit({
          skip: skipFn(params),
          onEnter: (node) => {
            const nodeValue = collection.getNodeValue(node)
            values.push(nodeValue)
            if (nodeValue === currentSelection) {
              return "stop"
            }
          },
        })

        context.set("selectedValue", values)
      },
      extendSelectionToLastNode(params) {
        const { context, prop } = params
        const collection = prop("collection")
        const currentSelection = first(context.get("selectedValue"))
        const values: string[] = []
        let current = false

        collection.visit({
          skip: skipFn(params),
          onEnter: (node) => {
            const nodeValue = collection.getNodeValue(node)
            if (nodeValue === currentSelection) current = true
            if (current) values.push(nodeValue)
          },
        })

        context.set("selectedValue", values)
      },
    },
  },
})
