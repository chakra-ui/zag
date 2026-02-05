import { createGuards, createMachine, type Params } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import {
  raf,
  trackFormControl,
  observeAttributes,
  scrollIntoView,
  dispatchInputValueEvent,
  setElementValue,
} from "@zag-js/dom-query"
import { getPlacement, type Placement } from "@zag-js/popper"
import type { Point } from "@zag-js/rect-utils"
import { last, isEmpty, isEqual } from "@zag-js/utils"
import { dom } from "./cascade-select.dom"
import { createGraceArea, isPointerInGraceArea } from "./cascade-select.utils"
import type { CascadeSelectSchema, IndexPath, TreeNode } from "./cascade-select.types"
import { collection as cascadeSelectCollection } from "./cascade-select.collection"

const { or, and, not } = createGuards<CascadeSelectSchema>()

export const machine = createMachine<CascadeSelectSchema>({
  props({ props }) {
    return {
      closeOnSelect: true,
      loopFocus: false,
      defaultValue: [],
      defaultHighlightedValue: [],
      defaultOpen: false,
      multiple: false,
      highlightTrigger: "click",
      allowParentSelection: false,
      positioning: {
        placement: "bottom-start",
        gutter: 8,
        ...props.positioning,
      },
      ...props,
      collection: props.collection ?? cascadeSelectCollection.empty(),
    }
  },

  context({ prop, bindable }) {
    return {
      value: bindable<string[][]>(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        isEqual: isEqual,
        hash(value) {
          return value.join(", ")
        },
      })),
      highlightedValue: bindable<string[]>(() => ({
        defaultValue: prop("defaultHighlightedValue"),
        value: prop("highlightedValue"),
        isEqual: isEqual,
      })),
      valueIndexPath: bindable(() => {
        const value = prop("value") ?? prop("defaultValue") ?? []
        const paths = value.map((v) => prop("collection").getIndexPath(v))
        return {
          defaultValue: paths,
        }
      }),
      highlightedIndexPath: bindable(() => {
        const value = prop("highlightedValue") ?? prop("defaultHighlightedValue") ?? null
        return {
          defaultValue: value ? prop("collection").getIndexPath(value) : [],
        }
      }),
      highlightedItem: bindable<TreeNode[] | null>(() => ({
        defaultValue: null,
      })),
      selectedItems: bindable<TreeNode[][]>(() => ({
        defaultValue: [],
      })),
      currentPlacement: bindable<Placement | undefined>(() => ({
        defaultValue: undefined,
      })),
      fieldsetDisabled: bindable<boolean>(() => ({
        defaultValue: false,
      })),
      graceArea: bindable<Point[] | null>(() => ({
        defaultValue: null,
      })),
      isPointerInTransit: bindable<boolean>(() => ({
        defaultValue: false,
      })),
    }
  },

  computed: {
    isInteractive: ({ prop }) => !(prop("disabled") || prop("readOnly")),

    valueAsString: ({ prop, context }) => {
      const collection = prop("collection")
      const items = context.get("selectedItems")
      const multiple = prop("multiple")

      const formatMultipleMode = (items: TreeNode[]) =>
        collection.stringifyNode(items.at(-1)) ?? collection.getNodeValue(items.at(-1))

      const formatSingleMode = (items: TreeNode[]) => {
        return items
          .map((item) => {
            return collection.stringifyNode(item) ?? collection.getNodeValue(item)
          })
          .join(" / ")
      }
      const defaultFormatValue = (items: TreeNode[][]) =>
        items.map(multiple ? formatMultipleMode : formatSingleMode).join(", ")

      const formatValue = prop("formatValue") ?? defaultFormatValue
      return formatValue(items)
    },
  },

  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen")
    return open ? "open" : "idle"
  },

  watch({ context, prop, track, action }) {
    track([() => context.get("value")?.toString()], () => {
      action(["syncInputValue", "dispatchChangeEvent"])
    })
    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })
  },

  on: {
    "VALUE.SET": {
      actions: ["setValue"],
    },
    "VALUE.CLEAR": {
      actions: ["clearValue"],
    },
    "CLEAR_TRIGGER.CLICK": {
      actions: ["clearValue", "focusTriggerEl"],
    },
    "HIGHLIGHTED_VALUE.SET": {
      actions: ["setHighlightedValue"],
    },
    "ITEM.SELECT": {
      actions: ["selectItem"],
    },
    "ITEM.CLEAR": {
      actions: ["clearItem"],
    },
  },

  effects: ["trackFormControlState"],

  states: {
    idle: {
      tags: ["closed"],
      on: {
        "CONTROLLED.OPEN": [
          {
            guard: "isTriggerClickEvent",
            target: "open",
            actions: ["setInitialFocus", "highlightFirstSelectedItem"],
          },
          {
            target: "open",
            actions: ["setInitialFocus"],
          },
        ],
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "setInitialFocus", "highlightFirstSelectedItem"],
          },
        ],
        "TRIGGER.FOCUS": {
          target: "focused",
        },
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setInitialFocus", "invokeOnOpen"],
          },
        ],
      },
    },

    focused: {
      tags: ["closed"],
      on: {
        "CONTROLLED.OPEN": [
          {
            guard: "isTriggerClickEvent",
            target: "open",
            actions: ["setInitialFocus", "highlightFirstSelectedItem"],
          },
          {
            guard: "isTriggerArrowUpEvent",
            target: "open",
            actions: ["setInitialFocus", "highlightLastItem"],
          },
          {
            guard: or("isTriggerArrowDownEvent", "isTriggerEnterEvent", ""),
            target: "open",
            actions: ["setInitialFocus", "highlightFirstItem"],
          },
          {
            target: "open",
            actions: ["setInitialFocus"],
          },
        ],
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setInitialFocus", "invokeOnOpen"],
          },
        ],
        "TRIGGER.BLUR": {
          target: "idle",
        },
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setInitialFocus", "invokeOnOpen", "highlightFirstSelectedItem"],
          },
        ],
        "TRIGGER.ENTER": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setInitialFocus", "invokeOnOpen", "highlightFirstItem"],
          },
        ],
        "TRIGGER.ARROW_UP": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setInitialFocus", "invokeOnOpen", "highlightLastItem"],
          },
        ],
        "TRIGGER.ARROW_DOWN": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setInitialFocus", "invokeOnOpen", "highlightFirstItem"],
          },
        ],
        "TRIGGER.ARROW_LEFT": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen"],
          },
        ],
        "TRIGGER.ARROW_RIGHT": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "highlightFirstItem"],
          },
        ],
      },
    },

    open: {
      tags: ["open"],
      exit: ["clearHighlightedValue", "scrollContentToTop"],
      effects: ["trackDismissableElement", "computePlacement", "scrollToHighlightedItems"],
      on: {
        "CONTROLLED.CLOSE": [
          {
            guard: "restoreFocus",
            target: "focused",
            actions: ["focusTriggerEl"],
          },
          {
            target: "idle",
          },
        ],
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            guard: "restoreFocus",
            target: "focused",
            actions: ["invokeOnClose", "focusTriggerEl"],
          },
          {
            target: "idle",
            actions: ["invokeOnClose"],
          },
        ],
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "focused",
            actions: ["invokeOnClose", "focusTriggerEl"],
          },
        ],
        "ITEM.CLICK": [
          {
            guard: and("canSelectItem", and("shouldCloseOnSelect", not("multiple")), "isOpenControlled"),
            actions: ["selectItem", "invokeOnClose"],
          },
          {
            guard: and("canSelectItem", and("shouldCloseOnSelect", not("multiple"))),
            target: "focused",
            actions: ["selectItem", "invokeOnClose", "focusTriggerEl"],
          },
          {
            guard: "canSelectItem",
            actions: ["selectItem"],
          },
          {
            // If can't select, at least highlight for click-based highlighting
            actions: ["setHighlightedValue"],
          },
        ],
        "ITEM.POINTER_ENTER": [
          {
            guard: "isHoverHighlight",
            actions: ["setHighlightingForHoveredItem"],
          },
        ],
        "ITEM.POINTER_LEAVE": [
          {
            guard: and("isHoverHighlight", "shouldHighlightOnHover"),
            actions: ["createGraceArea"],
          },
        ],
        POINTER_MOVE: [
          {
            guard: and(
              "isHoverHighlight",
              "hasGraceArea",
              "isPointerOutsideGraceArea",
              "isPointerNotInAnyItem",
              "hasHighlightedValue",
            ),
            actions: ["clearGraceArea"],
          },
        ],
        "GRACE_AREA.CLEAR": [
          {
            guard: "isHoverHighlight",
            actions: ["clearGraceArea"],
          },
        ],
        "CONTENT.HOME": {
          actions: ["highlightFirstItem"],
        },
        "CONTENT.END": {
          actions: ["highlightLastItem"],
        },
        "CONTENT.ARROW_DOWN": [
          {
            guard: or(not("hasHighlightedValue"), and("loop", "isHighlightedLastItem")),
            actions: ["highlightFirstItem"],
          },
          {
            actions: ["highlightNextItem"],
          },
        ],
        "CONTENT.ARROW_UP": [
          {
            guard: or(not("hasHighlightedValue"), and("loop", "isHighlightedFirstItem")),
            actions: ["highlightLastItem"],
          },
          {
            actions: ["highlightPreviousItem"],
          },
        ],
        "CONTENT.ARROW_RIGHT": [
          {
            guard: "canNavigateToChild",
            actions: ["highlightFirstChild"],
          },
        ],
        "CONTENT.ARROW_LEFT": [
          {
            guard: and("isAtRootLevel", "isOpenControlled"),
            actions: ["invokeOnClose", "focusTriggerEl"],
          },
          {
            guard: and("isAtRootLevel", "restoreFocus"),
            target: "focused",
            actions: ["invokeOnClose", "focusTriggerEl"],
          },
          {
            guard: "isAtRootLevel",
            target: "idle",
            actions: ["invokeOnClose"],
          },
          {
            guard: "canNavigateToParent",
            actions: ["highlightParent"],
          },
        ],
        "CONTENT.ENTER": [
          {
            guard: and(
              "canSelectHighlightedItem",
              and("shouldCloseOnSelectHighlighted", not("multiple")),
              "isOpenControlled",
            ),
            actions: ["selectHighlightedItem", "invokeOnClose"],
          },
          {
            guard: and("canSelectHighlightedItem", and("shouldCloseOnSelectHighlighted", not("multiple"))),
            target: "focused",
            actions: ["selectHighlightedItem", "invokeOnClose", "focusTriggerEl"],
          },
          {
            guard: "canSelectHighlightedItem",
            actions: ["selectHighlightedItem"],
          },
        ],
        "POSITIONING.SET": {
          actions: ["reposition"],
        },
      },
    },
  },

  implementations: {
    guards: {
      restoreFocus: ({ event }) => restoreFocusFn(event),
      multiple: ({ prop }) => !!prop("multiple"),
      loop: ({ prop }) => !!prop("loopFocus"),
      isOpenControlled: ({ prop }) => !!prop("open"),
      isTriggerClickEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.CLICK",
      isTriggerArrowUpEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ARROW_UP",
      isTriggerArrowDownEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ARROW_DOWN",
      isTriggerEnterEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ENTER",
      isTriggerArrowRightEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ARROW_RIGHT",
      hasHighlightedValue: ({ context }) => context.get("highlightedValue").length > 0,
      isHighlightedFirstItem: ({ context }) => context.get("highlightedIndexPath").at(-1) === 0,
      isHighlightedLastItem: ({ prop, context }) => {
        const path = context.get("highlightedIndexPath")
        const itemIndex = path.at(-1)
        if (!itemIndex && itemIndex !== 0) return false

        const parentIndexPath = path.slice(0, -1)
        const collection = prop("collection")
        const nextSibling = collection.at([...parentIndexPath, itemIndex + 1])

        return !nextSibling
      },
      shouldCloseOnSelect: ({ prop, event }) => {
        const collection = prop("collection")
        const node = collection.at(event.indexPath)
        return prop("closeOnSelect") && node && !collection.isBranchNode(node)
      },
      shouldCloseOnSelectHighlighted: ({ prop, context }) => {
        const collection = prop("collection")
        const node = context.get("highlightedItem")
        return prop("closeOnSelect") && !collection.isBranchNode(node)
      },

      canSelectItem: ({ prop, event }) => {
        const collection = prop("collection")
        const node = collection.at(event.indexPath)
        if (!node) return false
        return prop("allowParentSelection") || !collection.isBranchNode(node)
      },
      canSelectHighlightedItem: ({ prop, context }) => {
        const collection = prop("collection")
        const node = collection.at(context.get("highlightedIndexPath"))
        if (!node) return false
        return prop("allowParentSelection") || !collection.isBranchNode(node)
      },
      canNavigateToChild: ({ prop, context }) => {
        const highlightedIndexPath = context.get("highlightedIndexPath")
        if (!highlightedIndexPath.length) return false

        const collection = prop("collection")
        const node = collection.at(highlightedIndexPath)

        return node && collection.isBranchNode(node)
      },
      canNavigateToParent: ({ context }) => context.get("highlightedIndexPath").length > 1,
      isAtRootLevel: ({ context }) => context.get("highlightedIndexPath").length <= 1,
      isHoverHighlight: ({ prop }) => prop("highlightTrigger") === "hover",
      shouldHighlightOnHover: ({ prop, event }) => {
        const collection = prop("collection")
        const node = collection.at(event.indexPath)
        // Only highlight on hover if the item has children (is a parent)
        return node && collection.isBranchNode(node)
      },
      shouldUpdateHighlightedIndexPath: ({ prop, context, event }) => {
        const collection = prop("collection")
        const currentHighlightedIndexPath = context.get("highlightedIndexPath")

        if (!currentHighlightedIndexPath || currentHighlightedIndexPath.length === 0) {
          return false // No current highlighting
        }

        const node = collection.at(event.indexPath)

        // Only for leaf items (non-parent items)
        if (!node || collection.isBranchNode(node)) {
          return false
        }

        // Get the full path to the hovered item
        const indexPath = event.indexPath
        if (!indexPath) return false

        // Check if paths share a common prefix but diverge
        const minLength = Math.min(indexPath.length, currentHighlightedIndexPath.length)
        let commonPrefixLength = 0

        for (let i = 0; i < minLength; i++) {
          if (indexPath[i] === currentHighlightedIndexPath[i]) {
            commonPrefixLength = i + 1
          } else {
            break
          }
        }

        // If we have a common prefix and the paths diverge, we should update
        return (
          commonPrefixLength > 0 &&
          (commonPrefixLength < currentHighlightedIndexPath.length || commonPrefixLength < indexPath.length)
        )
      },
      hasGraceArea: ({ context }) => {
        return context.get("graceArea") != null
      },
      isPointerOutsideGraceArea: ({ context, event }) => {
        const graceArea = context.get("graceArea")
        if (!graceArea) return false

        const point = { x: event.clientX, y: event.clientY }
        return !isPointerInGraceArea(point, graceArea)
      },
      isPointerNotInAnyItem: ({ event }) => {
        const target = event.target as HTMLElement
        // Check if the pointer is over any item element or within the content area
        const itemElement = target.closest('[data-part="item"]')
        const contentElement = target.closest('[data-part="content"]')

        // Only consider the pointer "not in any item" if it's outside the content area entirely
        // or if it's in the content but not over any item
        return !contentElement || (!itemElement && !!contentElement)
      },
    },

    effects: {
      trackFormControlState({ context, scope, prop }) {
        return trackFormControl(dom.getTriggerEl(scope), {
          onFieldsetDisabledChange(disabled: boolean) {
            context.set("fieldsetDisabled", disabled)
          },
          onFormReset() {
            context.set("value", prop("defaultValue") ?? [])
          },
        })
      },
      trackDismissableElement({ scope, send, prop }) {
        const contentEl = () => dom.getContentEl(scope)
        let restoreFocus = true
        return trackDismissableElement(contentEl, {
          defer: true,
          exclude: [dom.getTriggerEl(scope), dom.getClearTriggerEl(scope)],
          onFocusOutside: prop("onFocusOutside"),
          onPointerDownOutside: prop("onPointerDownOutside"),
          onInteractOutside(event) {
            prop("onInteractOutside")?.(event)
            restoreFocus = !(event.detail.focusable || event.detail.contextmenu)
          },
          onDismiss() {
            send({ type: "CLOSE", src: "interact-outside", restoreFocus })
          },
        })
      },
      computePlacement({ context, prop, scope }) {
        const triggerEl = () => dom.getTriggerEl(scope)
        const positionerEl = () => dom.getPositionerEl(scope)

        return getPlacement(triggerEl, positionerEl, {
          ...prop("positioning"),
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },
      scrollToHighlightedItems({ context, prop, scope, event }) {
        let cleanups: VoidFunction[] = []

        const exec = (immediate: boolean) => {
          const highlightedValue = context.get("highlightedValue")
          const highlightedIndexPath = context.get("highlightedIndexPath")
          if (!highlightedIndexPath.length) return

          // Don't scroll into view if we're using the pointer
          if (event.current().type.includes("POINTER")) return

          const listEls = dom.getListEls(scope)
          listEls.forEach((listEl, index) => {
            const itemPath = highlightedIndexPath.slice(0, index + 1)

            const itemEl = dom.getItemEl(scope, highlightedValue.toString())

            const scrollToIndexFn = prop("scrollToIndexFn")
            if (scrollToIndexFn) {
              const itemIndexInList = itemPath[itemPath.length - 1]
              scrollToIndexFn({ index: itemIndexInList, immediate, depth: index })
              return
            }

            const raf_cleanup = raf(() => {
              scrollIntoView(itemEl, { rootEl: listEl, block: "nearest" })
            })
            cleanups.push(raf_cleanup)
          })
        }

        raf(() => exec(true))

        const rafCleanup = raf(() => exec(true))
        cleanups.push(rafCleanup)

        const contentEl = dom.getContentEl(scope)

        const observerCleanup = observeAttributes(contentEl, {
          attributes: ["data-activedescendant"],
          callback: () => exec(false),
        })
        cleanups.push(observerCleanup)

        return () => {
          cleanups.forEach((cleanup) => cleanup())
        }
      },
    },

    actions: {
      setValue(params) {
        set.value(params, params.event.value)
      },
      clearValue(params) {
        set.value(params, [])
      },
      setHighlightedValue(params) {
        const { event } = params
        set.highlightedValue(params, event.value)
      },
      clearHighlightedValue(params) {
        set.highlightedValue(params, [])
      },
      reposition({ context, prop, scope, event }) {
        const positionerEl = () => dom.getPositionerEl(scope)
        getPlacement(dom.getTriggerEl(scope), positionerEl, {
          ...prop("positioning"),
          ...event.options,
          defer: true,
          listeners: false,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },

      selectItem(params) {
        const { context, prop, event } = params
        const collection = prop("collection")
        const multiple = prop("multiple")
        const value = context.get("value")

        const itemValue = event.value as string[]
        const indexPath = (event.indexPath as IndexPath) ?? collection.getIndexPath(itemValue)

        const node = collection.at(indexPath)
        const hasChildren = collection.isBranchNode(node)

        if (prop("allowParentSelection")) {
          // When parent selection is allowed, always update the value to the selected item
          if (multiple) {
            // Remove any conflicting selections (parent/child conflicts)
            const filteredValue = value.filter((v) => {
              // Check if paths share any parent/child relationship
              const shortPath = v.length < itemValue.length ? v : itemValue
              const longPath = v.length < itemValue.length ? itemValue : v
              const hasRelation = longPath.slice(0, shortPath.length).every((val, i) => val === shortPath[i])

              // Keep only paths that have no relation and aren't identical
              return !hasRelation && !isEqual(v, itemValue)
            })

            set.value(params, [...filteredValue, itemValue])
          } else {
            // Single selection mode
            set.value(params, [itemValue])
          }
          // Keep the selected item highlighted if it has children
          if (hasChildren) set.highlightedValue(params, itemValue)
        } else {
          // When parent selection is not allowed, only leaf items update the value
          if (hasChildren) {
            // For branch nodes, just navigate into them (update value path but don't "select")
            if (multiple && value.length > 0) {
              // Use the most recent selection as base for navigation
              set.value(params, [...value.slice(0, -1), itemValue])
            } else {
              set.value(params, [itemValue])
            }
            set.highlightedValue(params, itemValue)
          } else {
            // For leaf nodes, actually select them
            if (multiple) {
              // Check if this path already exists
              const existingIndex = value.findIndex((path) => isEqual(path, itemValue))
              if (existingIndex >= 0) {
                // Remove existing selection (toggle off)
                const newValues = [...value]
                newValues.splice(existingIndex, 1)
                set.value(params, newValues)
              } else {
                // Add new selection
                set.value(params, [...value, itemValue])
              }
            } else {
              // Single selection mode
              set.value(params, [itemValue])
            }
          }
        }
      },
      clearItem(params) {
        const { context, event } = params
        const value = context.get("value")

        const newValue = value.filter((v) => !isEqual(v, event.value))
        set.value(params, newValue)
      },
      selectHighlightedItem({ context, send }) {
        const indexPath = context.get("highlightedIndexPath")
        const value = context.get("highlightedValue")
        if (value) {
          send({ type: "ITEM.SELECT", value, indexPath })
        }
      },

      highlightFirstItem(params) {
        const { context, prop } = params
        const collection = prop("collection")
        const highlightedValue = context.get("highlightedValue")

        // Determine the parent node - if no highlight, use root; otherwise use current level's parent
        let parentNode
        if (!highlightedValue.length) {
          parentNode = collection.rootNode
        } else {
          const indexPath = context.get("highlightedIndexPath")
          parentNode = collection.getParentNode(indexPath) ?? collection.rootNode
        }

        const firstChild = collection.getFirstNode(parentNode)
        if (!firstChild) return

        const firstValue = collection.getNodeValue(firstChild)

        // Build the new highlighted value
        if (!highlightedValue.length) {
          // No current highlight - highlight first root item
          set.highlightedValue(params, [firstValue])
        } else {
          // Current highlight exists - replace last segment
          const parentPath = highlightedValue.slice(0, -1)
          set.highlightedValue(params, [...parentPath, firstValue])
        }
      },
      highlightLastItem(params) {
        const { context, prop } = params
        const collection = prop("collection")
        const highlightedValue = context.get("highlightedValue")

        // Determine the parent node - if no highlight, use root; otherwise use current level's parent
        let parentNode
        if (!highlightedValue.length) {
          parentNode = collection.rootNode
        } else {
          const indexPath = context.get("highlightedIndexPath")
          parentNode = collection.getParentNode(indexPath) ?? collection.rootNode
        }

        const lastChild = collection.getLastNode(parentNode)
        if (!lastChild) return

        const lastValue = collection.getNodeValue(lastChild)

        // Build the new highlighted value
        if (!highlightedValue.length) {
          // No current highlight - highlight last root item
          set.highlightedValue(params, [lastValue])
        } else {
          // Current highlight exists - replace last segment
          const parentPath = highlightedValue.slice(0, -1)
          set.highlightedValue(params, [...parentPath, lastValue])
        }
      },
      highlightNextItem(params) {
        const { context, prop } = params
        const collection = prop("collection")
        const highlightedValue = context.get("highlightedValue")
        if (!highlightedValue.length) return

        const indexPath = context.get("highlightedIndexPath")
        const nextSibling = collection.getNextSibling(indexPath)
        if (!nextSibling) return

        const nextValue = collection.getNodeValue(nextSibling)

        if (highlightedValue.length === 1) {
          // Root level - just use the next value
          set.highlightedValue(params, [nextValue])
        } else {
          // Nested level - replace last segment
          const parentPath = highlightedValue.slice(0, -1)
          set.highlightedValue(params, [...parentPath, nextValue])
        }
      },
      highlightPreviousItem(params) {
        const { context, prop } = params
        const collection = prop("collection")

        const highlightedValue = context.get("highlightedValue")
        if (!highlightedValue.length) return

        const indexPath = context.get("highlightedIndexPath")
        const previousSibling = collection.getPreviousSibling(indexPath)
        if (!previousSibling) return

        const prevValue = collection.getNodeValue(previousSibling)

        if (highlightedValue.length === 1) {
          // Root level - just use the previous value
          set.highlightedValue(params, [prevValue])
        } else {
          // Nested level - replace last segment
          const parentPath = highlightedValue.slice(0, -1)
          set.highlightedValue(params, [...parentPath, prevValue])
        }
      },
      highlightFirstChild(params) {
        const { context, prop } = params
        const collection = prop("collection")

        const highlightedValue = context.get("highlightedValue")
        if (!highlightedValue.length) return

        const indexPath = context.get("highlightedIndexPath")
        const node = collection.getFirstNode(collection.at(indexPath))
        if (!node) return

        const childValue = collection.getNodeValue(node)
        set.highlightedValue(params, [...highlightedValue, childValue])
      },
      highlightParent(params) {
        const { context } = params
        const highlightedValue = context.get("highlightedValue")
        if (!highlightedValue.length) return

        const parentPath = highlightedValue.slice(0, -1)
        set.highlightedValue(params, parentPath)
      },

      setInitialFocus({ scope }) {
        raf(() => {
          const contentEl = dom.getContentEl(scope)
          contentEl?.focus({ preventScroll: true })
        })
      },
      focusTriggerEl({ event, scope }) {
        if (!restoreFocusFn(event)) return
        raf(() => {
          const triggerEl = dom.getTriggerEl(scope)
          triggerEl?.focus({ preventScroll: true })
        })
      },
      invokeOnOpen({ prop }) {
        prop("onOpenChange")?.({ open: true })
      },
      invokeOnClose({ prop }) {
        prop("onOpenChange")?.({ open: false })
      },
      toggleVisibility({ send, prop }) {
        if (prop("open") != null) {
          send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE" })
        }
      },
      highlightFirstSelectedItem(params) {
        const { context } = params
        const value = context.get("value")

        if (isEmpty(value)) return
        // Use the most recent selection and highlight its full path
        const mostRecentSelection = last(value)
        if (mostRecentSelection) {
          set.highlightedValue(params, mostRecentSelection)
        }
      },

      createGraceArea({ context, event, scope }) {
        const value = event.value.toString()
        const triggerElement = dom.getItemEl(scope, value)

        if (!triggerElement) return

        const exitPoint = { x: event.clientX, y: event.clientY }
        const triggerRect = triggerElement.getBoundingClientRect()

        // Find the next level that would contain children of this item
        const nextLevelEl = dom.getListEl(scope, value)

        if (!nextLevelEl) {
          // No next level, no grace area needed
          return
        }

        const targetRect = nextLevelEl.getBoundingClientRect()
        const graceArea = createGraceArea(exitPoint, triggerRect, targetRect)

        context.set("graceArea", graceArea)

        // Set a timer to clear the grace area after a short delay
        setTimeout(() => {
          context.set("graceArea", null)
        }, 300)
      },
      clearGraceArea({ context }) {
        context.set("graceArea", null)
      },
      setHighlightingForHoveredItem(params) {
        const { prop, event } = params
        const collection = prop("collection")

        const node = collection.at(event.indexPath)

        let newHighlightedValue: string[]

        if (node && collection.isBranchNode(node)) {
          // Item has children - highlight the full path including this item
          newHighlightedValue = event.value
        } else {
          // Item is a leaf - highlight path up to (but not including) this item
          newHighlightedValue = event.value.slice(0, -1)
        }

        set.highlightedValue(params, newHighlightedValue)
      },
      syncInputValue({ context, scope }) {
        const inputEl = dom.getHiddenInputEl(scope)
        if (!inputEl) return
        setElementValue(inputEl, context.hash("value"))
      },
      dispatchChangeEvent({ scope, context }) {
        dispatchInputValueEvent(dom.getHiddenInputEl(scope), { value: context.hash("value") })
      },
      scrollContentToTop({ scope, prop }) {
        const scrollToIndexFn = prop("scrollToIndexFn")
        // Scroll all lists to the top when closing
        raf(() => {
          const contentEl = dom.getContentEl(scope)
          const listEls = contentEl?.querySelectorAll('[data-part="list"]')
          listEls?.forEach((listEl, index) => {
            if (scrollToIndexFn) {
              scrollToIndexFn({ index: 0, immediate: true, depth: index })
            } else {
              listEl.scrollTop = 0
            }
          })
        })
      },
    },
  },
})

const set = {
  value({ context, prop }: Params<CascadeSelectSchema>, value: CascadeSelectSchema["context"]["value"]) {
    const collection = prop("collection")

    // Set Value
    context.set("value", value)

    // Set Index Path
    const valueIndexPath = value.map((v) => collection.getIndexPath(v))
    context.set("valueIndexPath", valueIndexPath)

    // Set Items
    const selectedItems = valueIndexPath.map((indexPath) => {
      // For each selected path, return all nodes that make up that path
      return indexPath.map((_, index) => {
        const partialPath = indexPath.slice(0, index + 1)
        return collection.at(partialPath)
      })
    })
    context.set("selectedItems", selectedItems)

    // Invoke onValueChange
    prop("onValueChange")?.({ value, items: selectedItems })
  },

  highlightedValue(
    { context, prop }: Params<CascadeSelectSchema>,
    value: CascadeSelectSchema["context"]["highlightedValue"],
  ) {
    const collection = prop("collection")

    // Set Value
    context.set("highlightedValue", value)

    // Set Index Path
    const highlightedIndexPath = value == null ? [] : collection.getIndexPath(value)
    context.set("highlightedIndexPath", highlightedIndexPath)

    // Set Items
    const highlightedItem = highlightedIndexPath.map((_, index) => {
      const partialPath = highlightedIndexPath.slice(0, index + 1)
      return collection.at(partialPath)
    })
    context.set("highlightedItem", highlightedItem)

    // Invoke onHighlightChange
    prop("onHighlightChange")?.({ value, items: highlightedItem })
  },
}

function restoreFocusFn(event: Record<string, any>) {
  const v = event.restoreFocus ?? event.previousEvent?.restoreFocus
  return v == null || !!v
}
