import type { TreeNode } from "@zag-js/collection"
import type { Params } from "@zag-js/core"
import { createGuards, createMachine } from "@zag-js/core"
import { getByTypeahead, raf, setElementValue } from "@zag-js/dom-query"
import { addOrRemove, diff, first, isArray, isEqual, last, remove, toArray, uniq } from "@zag-js/utils"
import { collection } from "./tree-view.collection"
import * as dom from "./tree-view.dom"
import type { TreeLoadingStatusMap, TreeViewSchema } from "./tree-view.types"
import { toggleBranchChecked } from "./utils/checked-state"
import { expandBranches } from "./utils/expand-branch"
import { skipFn } from "./utils/visit-skip"

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
        onChange(expandedValue) {
          const ctx = getContext()
          const focusedValue = ctx.get("focusedValue")
          prop("onExpandedChange")?.({
            expandedValue,
            focusedValue,
            get expandedNodes() {
              return prop("collection").findNodes(expandedValue)
            },
          })
        },
      })),
      selectedValue: bindable(() => ({
        defaultValue: prop("defaultSelectedValue"),
        value: prop("selectedValue"),
        isEqual,
        onChange(selectedValue) {
          const ctx = getContext()
          const focusedValue = ctx.get("focusedValue")
          prop("onSelectionChange")?.({
            selectedValue,
            focusedValue,
            get selectedNodes() {
              return prop("collection").findNodes(selectedValue)
            },
          })
        },
      })),
      focusedValue: bindable(() => ({
        defaultValue: prop("defaultFocusedValue") || null,
        value: prop("focusedValue"),
        onChange(focusedValue) {
          prop("onFocusChange")?.({
            focusedValue,
            get focusedNode() {
              return focusedValue ? prop("collection").findNode(focusedValue) : null
            },
          })
        },
      })),
      loadingStatus: bindable<TreeLoadingStatusMap>(() => ({
        defaultValue: {},
      })),
      checkedValue: bindable(() => ({
        defaultValue: prop("defaultCheckedValue") || [],
        value: prop("checkedValue"),
        isEqual,
        onChange(value) {
          prop("onCheckedChange")?.({ checkedValue: value })
        },
      })),
      renamingValue: bindable<string | null>(() => ({
        sync: true,
        defaultValue: null,
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
    "EXPANDED.CLEAR": {
      actions: ["clearExpanded"],
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
    "SELECTED.CLEAR": {
      actions: ["clearSelected"],
    },
    "NODE.SELECT": {
      actions: ["selectNode"],
    },
    "NODE.DESELECT": {
      actions: ["deselectNode"],
    },
    "CHECKED.TOGGLE": {
      actions: ["toggleChecked"],
    },
    "CHECKED.SET": {
      actions: ["setChecked"],
    },
    "CHECKED.CLEAR": {
      actions: ["clearChecked"],
    },
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

  exit: ["clearPendingAborts"],

  states: {
    idle: {
      on: {
        "NODE.RENAME": {
          target: "renaming",
          actions: ["setRenamingValue"],
        },
      },
    },
    renaming: {
      entry: ["syncRenameInput", "focusRenameInput"],
      on: {
        "RENAME.SUBMIT": {
          guard: "isRenameLabelValid",
          target: "idle",
          actions: ["submitRenaming"],
        },
        "RENAME.CANCEL": {
          target: "idle",
          actions: ["cancelRenaming"],
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
      isRenameLabelValid: ({ event }) => event.label.trim() !== "",
    },
    actions: {
      selectNode({ context, event }) {
        const value = (event.id || event.value) as string | string[] | undefined
        context.set("selectedValue", (prev) => {
          if (value == null) return prev
          if (!event.isTrusted && isArray(value)) return prev.concat(...value)
          return [isArray(value) ? last(value) : value].filter(Boolean) as string[]
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
        if (!isArray(event.value)) return
        context.set("expandedValue", event.value)
      },
      clearExpanded({ context }) {
        context.set("expandedValue", [])
      },
      setSelected({ context, event }) {
        if (!isArray(event.value)) return
        context.set("selectedValue", event.value)
      },
      clearSelected({ context }) {
        context.set("selectedValue", [])
      },
      focusTreeFirstNode(params) {
        const { prop, scope } = params
        const collection = prop("collection")
        const firstNode = collection.getFirstNode()
        const firstValue = collection.getNodeValue(firstNode)
        const scrolled = scrollToNode(params, firstValue)
        if (scrolled) raf(() => dom.focusNode(scope, firstValue))
        else dom.focusNode(scope, firstValue)
      },
      focusTreeLastNode(params) {
        const { prop, scope } = params
        const collection = prop("collection")
        const lastNode = collection.getLastNode(undefined, { skip: skipFn(params) })
        const lastValue = collection.getNodeValue(lastNode)
        const scrolled = scrollToNode(params, lastValue)
        if (scrolled) raf(() => dom.focusNode(scope, lastValue))
        else dom.focusNode(scope, lastValue)
      },
      focusBranchFirstNode(params) {
        const { event, prop, scope } = params
        const collection = prop("collection")
        const branchNode = collection.findNode(event.id)
        const firstNode = collection.getFirstNode(branchNode)
        const firstValue = collection.getNodeValue(firstNode)
        const scrolled = scrollToNode(params, firstValue)
        if (scrolled) raf(() => dom.focusNode(scope, firstValue))
        else dom.focusNode(scope, firstValue)
      },
      focusTreeNextNode(params) {
        const { event, prop, scope } = params
        const collection = prop("collection")
        const nextNode = collection.getNextNode(event.id, { skip: skipFn(params) })
        if (!nextNode) return
        const nextValue = collection.getNodeValue(nextNode)
        const scrolled = scrollToNode(params, nextValue)
        if (scrolled) raf(() => dom.focusNode(scope, nextValue))
        else dom.focusNode(scope, nextValue)
      },
      focusTreePrevNode(params) {
        const { event, prop, scope } = params
        const collection = prop("collection")
        const prevNode = collection.getPreviousNode(event.id, { skip: skipFn(params) })
        if (!prevNode) return
        const prevValue = collection.getNodeValue(prevNode)
        const scrolled = scrollToNode(params, prevValue)
        if (scrolled) raf(() => dom.focusNode(scope, prevValue))
        else dom.focusNode(scope, prevValue)
      },
      focusBranchNode(params) {
        const { event, prop, scope } = params
        const collection = prop("collection")
        const parentNode = collection.getParentNode(event.id)
        const parentValue = parentNode ? collection.getNodeValue(parentNode) : undefined
        if (!parentValue) return
        const scrolled = scrollToNode(params, parentValue)
        if (scrolled) raf(() => dom.focusNode(scope, parentValue))
        else dom.focusNode(scope, parentValue)
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

        if (!node?.id) return
        const scrolled = scrollToNode(params, node.id)
        if (scrolled) raf(() => dom.focusNode(scope, node.id))
        else dom.focusNode(scope, node.id)
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
      toggleChecked({ context, event, prop }) {
        const collection = prop("collection")
        context.set("checkedValue", (prev) =>
          event.isBranch ? toggleBranchChecked(collection, event.value, prev) : addOrRemove(prev, event.value),
        )
      },
      setChecked({ context, event }) {
        context.set("checkedValue", event.value)
      },
      clearChecked({ context }) {
        context.set("checkedValue", [])
      },
      setRenamingValue({ context, event, prop }) {
        context.set("renamingValue", event.value)

        // Call onRenameStart callback if provided
        const onRenameStartFn = prop("onRenameStart")
        if (onRenameStartFn) {
          const collection = prop("collection")
          const indexPath = collection.getIndexPath(event.value)
          if (indexPath) {
            const node = collection.at(indexPath)
            if (node) {
              onRenameStartFn({
                value: event.value,
                node,
                indexPath,
              })
            }
          }
        }
      },
      submitRenaming({ context, event, prop, scope }) {
        const renamingValue = context.get("renamingValue")
        if (!renamingValue) return

        const collection = prop("collection")
        const indexPath = collection.getIndexPath(renamingValue)
        if (!indexPath) return

        // Trim the label before passing to callbacks
        const trimmedLabel = event.label.trim()

        // Check onBeforeRename callback if provided
        const onBeforeRenameFn = prop("onBeforeRename")
        if (onBeforeRenameFn) {
          const details = {
            value: renamingValue,
            label: trimmedLabel,
            indexPath,
          }
          const shouldRename = onBeforeRenameFn(details)
          if (!shouldRename) {
            // Cancel rename without calling onRenameComplete
            context.set("renamingValue", null)
            dom.focusNode(scope, renamingValue)
            return
          }
        }

        prop("onRenameComplete")?.({
          value: renamingValue,
          label: trimmedLabel,
          indexPath,
        })

        context.set("renamingValue", null)
        dom.focusNode(scope, renamingValue)
      },
      cancelRenaming({ context, scope }) {
        const renamingValue = context.get("renamingValue")
        context.set("renamingValue", null)
        if (renamingValue) {
          dom.focusNode(scope, renamingValue)
        }
      },
      syncRenameInput({ context, scope, prop }) {
        const renamingValue = context.get("renamingValue")
        if (!renamingValue) return

        const collection = prop("collection")
        const node = collection.findNode(renamingValue)
        if (!node) return

        const label = collection.stringifyNode(node)

        const inputEl = dom.getRenameInputEl(scope, renamingValue)
        setElementValue(inputEl, label)
      },
      focusRenameInput({ context, scope }) {
        const renamingValue = context.get("renamingValue")
        if (!renamingValue) return

        const inputEl = dom.getRenameInputEl(scope, renamingValue)
        if (!inputEl) return
        inputEl.focus()
        inputEl.select()
      },
    },
  },
})

function scrollToNode(params: Params<TreeViewSchema>, value: string): boolean {
  const { prop, scope, computed } = params
  const scrollToIndexFn = prop("scrollToIndexFn")
  if (!scrollToIndexFn) return false

  const collection = prop("collection")
  const visibleNodes = computed("visibleNodes")

  for (let i = 0; i < visibleNodes.length; i++) {
    const { node, indexPath } = visibleNodes[i]
    if (collection.getNodeValue(node) !== value) continue
    scrollToIndexFn({
      index: i,
      node,
      indexPath,
      getElement: () => scope.getById(dom.getNodeId(scope, value)),
    })
    return true
  }

  return false
}
