import type { TreeNode, TreeSkipFn } from "@zag-js/collection"
import { createGuards, createMachine, type Params } from "@zag-js/core"
import { getByTypeahead } from "@zag-js/dom-query"
import { add, addOrRemove, diff, ensure, first, isEqual, last, remove, toArray, uniq } from "@zag-js/utils"
import { collection } from "./tree-view.collection"
import * as dom from "./tree-view.dom"
import type { TreeLoadingStatusMap, TreeViewSchema } from "./tree-view.types"

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
          const ctx = getContext()
          const focusedValue = ctx.get("focusedValue")
          prop("onExpandedChange")?.({ expandedValue: value, focusedValue })
        },
      })),
      selectedValue: bindable(() => ({
        defaultValue: prop("defaultSelectedValue"),
        value: prop("selectedValue"),
        isEqual,
        onChange(value) {
          const ctx = getContext()
          const focusedValue = ctx.get("focusedValue")
          prop("onSelectionChange")?.({ selectedValue: value, focusedValue })
        },
      })),
      focusedValue: bindable(() => ({
        defaultValue: prop("focusedValue"),
        onChange(value) {
          prop("onFocusChange")?.({ focusedValue: value })
        },
      })),
      loadingStatus: bindable<TreeLoadingStatusMap>(() => ({
        defaultValue: {},
      })),
    }
  },

  refs() {
    return {
      typeaheadState: { ...getByTypeahead.defaultOptions },
      pendingAborts: new Map(),
    }
  },

  computed: {
    isMultipleSelection: ({ prop }) => prop("selectionMode") === "multiple",
    isTypingAhead: ({ refs }) => refs.get("typeaheadState").keysSoFar.length > 0,
    visibleNodes: ({ prop, context }) => {
      const nodes: { node: TreeNode; indexPath: number[] }[] = []
      prop("collection").visit({
        skip: skipFn({ prop, context }),
        onEnter: (node, indexPath) => {
          nodes.push({ node, indexPath })
        },
      })
      return nodes
    },
  },

  on: {
    "EXPANDED.SET": {
      actions: ["setExpanded"],
    },
    "EXPANDED.ALL": {
      actions: ["expandAllBranches"],
    },
    "BRANCH.EXPAND": {
      actions: ["expandBranches"],
    },
    "BRANCH.COLLAPSE": {
      actions: ["collapseBranches"],
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
    "NODE.SELECT": {
      actions: ["selectNode"],
    },
    "NODE.DESELECT": {
      actions: ["deselectNode"],
    },
  },

  exit: ["clearPendingAborts"],

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
            guard: "expandOnClick",
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
      expandOnClick: ({ prop }) => !!prop("expandOnClick"),
    },
    actions: {
      selectNode({ context, event, prop }) {
        const value = toArray(event.id || event.value)
        context.set("selectedValue", (prev) => {
          if (prop("selectionMode") === "single") {
            return [last(value)].filter(Boolean)
          } else {
            return uniq([...prev, ...value])
          }
        })
      },
      deselectNode({ context, event }) {
        const value = toArray(event.id || event.value)
        context.set("selectedValue", (prev) => remove(prev, ...value))
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
      toggleBranchNode({ context, event, action }) {
        const isExpanded = context.get("expandedValue").includes(event.id)
        action(isExpanded ? ["collapseBranch"] : ["expandBranch"])
      },
      expandBranch(params) {
        const { event } = params
        expandBranches(params, [event.id])
      },
      expandBranches(params) {
        const { context, event } = params
        const valuesToExpand = toArray(event.value)
        expandBranches(params, diff(valuesToExpand, context.get("expandedValue")))
      },
      collapseBranch({ context, event }) {
        context.set("expandedValue", (prev) => remove(prev, event.id))
      },
      collapseBranches(params) {
        const { context, event } = params
        const value = toArray(event.value)
        context.set("expandedValue", (prev) => remove(prev, ...value))
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
        const { context, prop, refs, event, scope, computed } = params
        const nodes = computed("visibleNodes")
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
      expandAllBranches(params) {
        const { context, prop } = params
        const branchValues = prop("collection").getBranchValues()
        const valuesToExpand = diff(branchValues, context.get("expandedValue"))
        expandBranches(params, valuesToExpand)
      },
      expandSiblingBranches(params) {
        const { context, event, prop } = params
        const collection = prop("collection")

        const indexPath = collection.getIndexPath(event.id)
        if (!indexPath) return

        const nodes = collection.getSiblingNodes(indexPath)
        const values = nodes.map((node) => collection.getNodeValue(node))

        const valuesToExpand = diff(values, context.get("expandedValue"))
        expandBranches(params, valuesToExpand)
      },
      extendSelectionToNode(params) {
        const { context, event, prop, computed } = params
        const collection = prop("collection")
        const anchorValue = first(context.get("selectedValue")) || collection.getNodeValue(collection.getFirstNode())
        const targetValue = event.id

        let values: string[] = [anchorValue, targetValue]

        let hits = 0
        const visibleNodes = computed("visibleNodes")
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
      clearPendingAborts({ refs }) {
        const aborts = refs.get("pendingAborts")
        aborts.forEach((abort) => abort.abort())
        aborts.clear()
      },
    },
  },
})

function skipFn(params: Pick<Params<TreeViewSchema>, "prop" | "context">): TreeSkipFn<any> {
  const { prop, context } = params
  return function skip({ indexPath }) {
    const paths = prop("collection").getValuePath(indexPath).slice(0, -1)
    return paths.some((value) => !context.get("expandedValue").includes(value))
  }
}

function partition<T>(array: T[], predicate: (value: T) => boolean) {
  const pass: T[] = []
  const fail: T[] = []
  array.forEach((value) => {
    if (predicate(value)) pass.push(value)
    else fail.push(value)
  })
  return [pass, fail]
}

function expandBranches(params: Params<TreeViewSchema>, ids: string[]) {
  const { context, prop, refs } = params

  if (!prop("loadChildren")) {
    context.set("expandedValue", (prev) => uniq(add(prev, ...ids)))
    return
  }

  const [loadedValues, loadingValues] = partition(ids, (id) => context.get("loadingStatus")[id] === "loaded")

  if (loadedValues.length > 0) {
    context.set("expandedValue", (prev) => uniq(add(prev, ...loadedValues)))
  }

  if (loadingValues.length === 0) return

  const collection = prop("collection")
  const [nodeWithChildren, nodeWithoutChildren] = partition(loadingValues, (id) => {
    const node = collection.findNode(id)
    return collection.getNodeChildren(node).length > 0
  })

  // Check if node already has children (skip loading)
  if (nodeWithChildren.length > 0) {
    context.set("expandedValue", (prev) => uniq(add(prev, ...nodeWithChildren)))
  }

  if (nodeWithoutChildren.length === 0) return

  context.set("loadingStatus", (prev) => ({
    ...prev,
    ...nodeWithoutChildren.reduce((acc, id) => ({ ...acc, [id]: "loading" }), {}),
  }))

  const nodesToLoad = nodeWithoutChildren.map((id) => {
    const indexPath = collection.getIndexPath(id)!
    const valuePath = collection.getValuePath(indexPath)!
    const node = collection.findNode(id)!
    return { id, indexPath, valuePath, node }
  })

  const pendingAborts = refs.get("pendingAborts")

  // load children asynchronously
  const loadChildren = prop("loadChildren")
  ensure(loadChildren, () => "[zag-js/tree-view] `loadChildren` is required for async expansion")

  const proms = nodesToLoad.map(({ id, indexPath, valuePath, node }) => {
    const existingAbort = pendingAborts.get(id)
    if (existingAbort) {
      existingAbort.abort()
      pendingAborts.delete(id)
    }
    const abortController = new AbortController()
    pendingAborts.set(id, abortController)
    return loadChildren({
      valuePath,
      indexPath,
      node,
      signal: abortController.signal,
    })
  })

  // prefer `Promise.allSettled` over `Promise.all` to avoid early termination
  Promise.allSettled(proms).then((results) => {
    const loadedValues: string[] = []
    const nextLoadingStatus = context.get("loadingStatus")
    let collection = prop("collection")

    results.forEach((result, index) => {
      const { id, indexPath, node } = nodesToLoad[index]
      if (result.status === "fulfilled") {
        nextLoadingStatus[id] = "loaded"
        loadedValues.push(id)
        collection = collection.replace(indexPath, { ...node, children: result.value })
      } else {
        pendingAborts.delete(id)
        Reflect.deleteProperty(nextLoadingStatus, id)
      }
    })

    context.set("loadingStatus", nextLoadingStatus)

    if (loadedValues.length) {
      context.set("expandedValue", (prev) => uniq(add(prev, ...loadedValues)))
      prop("onLoadChildrenComplete")?.({ collection })
    }
  })
}
