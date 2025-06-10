import { createGuards, createMachine } from "@zag-js/core"
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
import type { CascadeSelectSchema, IndexPath } from "./cascade-select.types"
import { collection as cascadeSelectCollection } from "./cascade-select.collection"

const { or, and } = createGuards<CascadeSelectSchema>()

export const machine = createMachine<CascadeSelectSchema>({
  props({ props }) {
    return {
      closeOnSelect: true,
      loop: false,
      defaultValue: [],
      valueIndexPath: [],
      highlightedIndexPath: [],
      defaultOpen: false,
      multiple: false,
      highlightTrigger: "click",
      placeholder: "Select an option",
      allowParentSelection: false,
      separator: " / ",
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
      valueIndexPath: bindable<IndexPath[]>(() => ({
        defaultValue: [],
        // value: prop("value"),
        isEqual: isEqual,
        onChange(indexPaths) {
          prop("onValueChange")?.({ indexPath: indexPaths })
        },
      })),
      highlightedIndexPath: bindable<IndexPath>(() => ({
        defaultValue: [],
        // value: prop("highlightedIndexPath"),
        isEqual: isEqual,
        onChange(indexPath) {
          prop("onHighlightChange")?.({ indexPath })
        },
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
    isDisabled: ({ prop, context }) => !!prop("disabled") || !!context.get("fieldsetDisabled"),
    isInteractive: ({ prop }) => !(prop("disabled") || prop("readOnly")),
    value: ({ context, prop }) => {
      const valueIndexPath = context.get("valueIndexPath")
      const collection = prop("collection")

      return valueIndexPath.map((indexPath) => {
        return collection.getValuePath(indexPath)
      })
    },
    valueText: ({ context, prop }) => {
      const valueIndexPath = context.get("valueIndexPath")
      if (!valueIndexPath.length) return prop("placeholder") ?? ""

      const collection = prop("collection")
      const separator = prop("separator")

      return valueIndexPath
        .map((indexPath) => {
          return indexPath
            .map((_, depth) => {
              const partialPath = indexPath.slice(0, depth + 1)
              const node = collection.at(partialPath)
              return collection.stringifyNode(node) ?? collection.getNodeValue(node)
            })
            .join(separator)
        })
        .join(", ")
    },
  },

  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen")
    return open ? "open" : "idle"
  },

  watch({ context, prop, track, action }) {
    track([() => context.get("valueIndexPath")?.toString()], () => {
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
    "HIGHLIGHTED_PATH.SET": {
      actions: ["setHighlightedIndexPath"],
    },
    "ITEM.SELECT": {
      actions: ["selectItem"],
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
          },
          {
            target: "open",
          },
        ],
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen"],
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
            actions: ["invokeOnOpen"],
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
          },
          {
            guard: "isTriggerArrowUpEvent",
            target: "open",
            actions: ["highlightLastItem"],
          },
          {
            guard: or("isTriggerArrowDownEvent", "isTriggerEnterEvent", ""),
            target: "open",
            actions: ["highlightFirstItem"],
          },
          {
            target: "open",
          },
        ],
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen"],
          },
        ],
        "TRIGGER.ARROW_UP": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "highlightLastItem"],
          },
        ],
        "TRIGGER.ARROW_DOWN": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "highlightFirstItem"],
          },
        ],
        "TRIGGER.ENTER": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "highlightFirstItem"],
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
        "TRIGGER.BLUR": {
          target: "idle",
        },
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen"],
          },
        ],
      },
    },

    open: {
      tags: ["open"],
      effects: ["trackDismissableElement", "computePlacement", "scrollToHighlightedItems"],
      entry: ["setInitialFocus", "highlightLastSelectedValue"],
      exit: ["clearHighlightedIndexPath", "scrollContentToTop"],
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
        "ITEM.CLICK": [
          {
            guard: and("canSelectItem", "shouldCloseOnSelect", "isOpenControlled"),
            actions: ["selectItem", "invokeOnClose"],
          },
          {
            guard: and("canSelectItem", "shouldCloseOnSelect"),
            target: "focused",
            actions: ["selectItem", "invokeOnClose", "focusTriggerEl"],
          },
          {
            guard: "canSelectItem",
            actions: ["selectItem"],
          },
          {
            // If can't select, at least highlight for click-based highlighting
            actions: ["setHighlightedIndexPath"],
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
              "hasHighlightedIndexPath",
            ),
            actions: ["clearHighlightAndGraceArea"],
          },
        ],
        "GRACE_AREA.CLEAR": [
          {
            guard: "isHoverHighlight",
            actions: ["clearHighlightAndGraceArea"],
          },
        ],
        "CONTENT.ARROW_DOWN": [
          {
            guard: "hasHighlightedIndexPath",
            actions: ["highlightNextItem"],
          },
          {
            actions: ["highlightFirstItem"],
          },
        ],
        "CONTENT.ARROW_UP": [
          {
            guard: "hasHighlightedIndexPath",
            actions: ["highlightPreviousItem"],
          },
          {
            actions: ["highlightLastItem"],
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
        "CONTENT.HOME": {
          actions: ["highlightFirstItem"],
        },
        "CONTENT.END": {
          actions: ["highlightLastItem"],
        },
        "CONTENT.ENTER": [
          {
            guard: and("canSelectHighlightedItem", "shouldCloseOnSelectHighlighted", "isOpenControlled"),
            actions: ["selectHighlightedItem", "invokeOnClose"],
          },
          {
            guard: and("canSelectHighlightedItem", "shouldCloseOnSelectHighlighted"),
            target: "focused",
            actions: ["selectHighlightedItem", "invokeOnClose", "focusTriggerEl"],
          },
          {
            guard: "canSelectHighlightedItem",
            actions: ["selectHighlightedItem"],
          },
        ],
        "CONTENT.ESCAPE": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose", "focusTriggerEl"],
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
      },
    },
  },

  implementations: {
    guards: {
      restoreFocus: () => true,
      isOpenControlled: ({ prop }) => !!prop("open"),
      isTriggerClickEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.CLICK",
      isTriggerArrowUpEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ARROW_UP",
      isTriggerArrowDownEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ARROW_DOWN",
      isTriggerEnterEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ENTER",
      isTriggerArrowRightEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ARROW_RIGHT",
      hasHighlightedIndexPath: ({ context }) => !!context.get("highlightedIndexPath").length,
      shouldCloseOnSelect: ({ prop, event }) => {
        if (!prop("closeOnSelect")) return false

        const collection = prop("collection")
        const node = collection.at(event.indexPath)

        // Only close if selecting a leaf node (no children)
        return node && !collection.isBranchNode(node)
      },
      shouldCloseOnSelectHighlighted: ({ prop, context }) => {
        if (!prop("closeOnSelect")) return false

        const highlightedIndexPath = context.get("highlightedIndexPath")
        if (!highlightedIndexPath.length) return false

        const collection = prop("collection")
        const node = collection.at(highlightedIndexPath)

        // Only close if selecting a leaf node (no children)
        return node && !collection.isBranchNode(node)
      },
      canSelectItem: ({ prop, event }) => {
        const collection = prop("collection")
        const node = collection.at(event.indexPath)

        if (!node) return false

        // If parent selection is not allowed, only allow leaf nodes
        if (!prop("allowParentSelection")) {
          return !collection.isBranchNode(node)
        }

        // Otherwise, allow any node
        return true
      },
      canSelectHighlightedItem: ({ prop, context }) => {
        const highlightedIndexPath = context.get("highlightedIndexPath")
        if (!highlightedIndexPath.length) return false

        const collection = prop("collection")
        const node = collection.at(highlightedIndexPath)

        if (!node || collection.getNodeDisabled(node)) return false

        // If parent selection is not allowed, only allow leaf nodes
        if (!prop("allowParentSelection")) {
          return !collection.isBranchNode(node)
        }

        // Otherwise, allow any node
        return true
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
      isItemOutsideHighlightedIndexPath: ({ context, event }) => {
        const currentHighlightedIndexPath = context.get("highlightedIndexPath")

        if (!currentHighlightedIndexPath || currentHighlightedIndexPath.length === 0) {
          return false // No current highlighting, so don't clear
        }

        // Get the full path to the hovered item
        const indexPath = event.indexPath
        if (!indexPath) return true // Invalid item, clear highlighting

        // Check if the hovered item path is compatible with current highlighted path
        // Two cases:
        // 1. Hovered item is part of the highlighted path (child/descendant)
        // 2. Highlighted path is part of the hovered item path (parent/ancestor)

        const minLength = Math.min(indexPath.length, currentHighlightedIndexPath.length)

        // Check if the paths share a common prefix
        for (let i = 0; i < minLength; i++) {
          if (indexPath[i] !== currentHighlightedIndexPath[i]) {
            return true // Paths diverge, clear highlighting
          }
        }

        return false // Paths are compatible, don't clear
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
      trackFormControlState({ context, scope, prop: _prop }) {
        return trackFormControl(dom.getTriggerEl(scope), {
          onFieldsetDisabledChange(disabled: boolean) {
            context.set("fieldsetDisabled", disabled)
          },
          onFormReset() {
            // TODO: reset valueIndexPath
            // context.set("valueIndexPath", prop("defaultValue") ?? [])
          },
        })
      },
      trackDismissableElement({ scope, send }) {
        const contentEl = () => dom.getContentEl(scope)

        return trackDismissableElement(contentEl, {
          defer: true,
          onDismiss() {
            send({ type: "CLOSE" })
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
      scrollToHighlightedItems({ context, prop: _prop, scope, event }) {
        // let cleanups: VoidFunction[] = []

        const exec = (_immediate: boolean) => {
          const highlightedIndexPath = context.get("highlightedIndexPath")
          if (!highlightedIndexPath.length) return

          const collection = _prop("collection")

          // Don't scroll into view if we're using the pointer
          if (event.current().type.includes("POINTER")) return

          const listEls = dom.getListEls(scope)
          listEls.forEach((listEl, index) => {
            const itemPath = highlightedIndexPath.slice(0, index + 1)
            const node = collection.at(itemPath)
            if (!node) return

            const itemEl = dom.getItemEl(scope, collection.getNodeValue(node))

            scrollIntoView(itemEl, { rootEl: listEl, block: "nearest" })
          })
        }

        raf(() => exec(true))

        const contentEl = dom.getContentEl(scope)

        return observeAttributes(contentEl, {
          defer: true,
          attributes: ["data-activedescendant"],
          callback() {
            exec(false)
          },
        })
      },
    },

    actions: {
      // setValue({ context, event }) {
      //   context.set("value", event.indexPath)
      // },
      clearValue({ context }) {
        context.set("valueIndexPath", [])
      },
      setHighlightedIndexPath({ context, event }) {
        context.set("highlightedIndexPath", event.indexPath)
      },
      clearHighlightedIndexPath({ context }) {
        context.set("highlightedIndexPath", [])
      },
      selectItem({ context, prop, event }) {
        const collection = prop("collection")
        const indexPath = event.indexPath as IndexPath
        const node = collection.at(indexPath)

        const hasChildren = collection.isBranchNode(node)

        const currentValues = context.get("valueIndexPath") || []
        const multiple = prop("multiple")

        if (prop("allowParentSelection")) {
          // When parent selection is allowed, always update the value to the selected item

          if (multiple) {
            // Remove any conflicting selections (parent/child conflicts)
            const filteredValues = currentValues.filter((existingPath: IndexPath) => {
              // Remove if this path is a parent of the new selection
              const isParentOfNew =
                indexPath.length > existingPath.length && existingPath.every((val, idx) => val === indexPath[idx])
              // Remove if this path is a child of the new selection
              const isChildOfNew =
                existingPath.length > indexPath.length && indexPath.every((val, idx) => val === existingPath[idx])
              // Remove if this is the exact same path
              const isSamePath = isEqual(existingPath, indexPath)

              return !isParentOfNew && !isChildOfNew && !isSamePath
            })

            // Add the new selection
            context.set("valueIndexPath", [...filteredValues, indexPath])
          } else {
            // Single selection mode
            context.set("valueIndexPath", [indexPath])
          }

          // Keep the selected item highlighted if it has children
          if (hasChildren) {
            context.set("highlightedIndexPath", indexPath)
          } else {
            // Clear highlight for leaf items since they're now selected
            context.set("highlightedIndexPath", [])
          }
        } else {
          // When parent selection is not allowed, only leaf items update the value
          if (hasChildren) {
            // For branch nodes, just navigate into them (update value path but don't "select")
            if (multiple && currentValues.length > 0) {
              // Use the most recent selection as base for navigation
              context.set("valueIndexPath", [...currentValues.slice(0, -1), indexPath])
            } else {
              context.set("valueIndexPath", [indexPath])
            }
            context.set("highlightedIndexPath", indexPath)
          } else {
            // For leaf nodes, actually select them
            if (multiple) {
              // Check if this path already exists
              const existingIndex = currentValues.findIndex((path: IndexPath) => isEqual(path, indexPath))

              if (existingIndex >= 0) {
                // Remove existing selection (toggle off)
                const newValues = [...currentValues]
                newValues.splice(existingIndex, 1)
                context.set("valueIndexPath", newValues)
              } else {
                // Add new selection
                context.set("valueIndexPath", [...currentValues, indexPath])
              }
            } else {
              // Single selection mode
              context.set("valueIndexPath", [indexPath])
            }
            context.set("highlightedIndexPath", [])
          }
        }
      },
      selectHighlightedItem({ context, send }) {
        const highlightedIndexPath = context.get("highlightedIndexPath")
        if (highlightedIndexPath && highlightedIndexPath.length > 0) {
          send({ type: "ITEM.SELECT", indexPath: highlightedIndexPath })
        }
      },

      highlightFirstItem({ context, prop }) {
        const collection = prop("collection")

        let path = context.get("highlightedIndexPath")
        const node = !path || path.length <= 1 ? collection.rootNode : collection.getParentNode(path)

        // Use native JavaScript findIndex() to find first non-disabled child
        const children = collection.getNodeChildren(node)
        const firstEnabledIndex = children.findIndex((child) => !collection.getNodeDisabled(child))

        if (firstEnabledIndex !== -1) {
          let newPath: number[]
          if (!path || path.length === 0) {
            // No existing path, start at root level
            newPath = [firstEnabledIndex]
          } else if (path.length === 1) {
            // At root level, replace the single index
            newPath = [firstEnabledIndex]
          } else {
            // At deeper level, replace the last index
            newPath = [...path.slice(0, -1), firstEnabledIndex]
          }
          context.set("highlightedIndexPath", newPath)
        }
      },
      highlightLastItem({ context, prop }) {
        const collection = prop("collection")

        let path = context.get("highlightedIndexPath")
        const node = !path || path.length <= 1 ? collection.rootNode : collection.getParentNode(path)

        const children = collection.getNodeChildren(node)
        let lastEnabledIndex = -1
        for (let i = children.length - 1; i >= 0; i--) {
          if (!collection.getNodeDisabled(children[i])) {
            lastEnabledIndex = i
            break
          }
        }

        if (lastEnabledIndex !== -1) {
          let newPath: number[]
          if (!path || path.length === 0) {
            // No existing path, start at root level
            newPath = [lastEnabledIndex]
          } else if (path.length === 1) {
            // At root level, replace the single index
            newPath = [lastEnabledIndex]
          } else {
            // At deeper level, replace the last index
            newPath = [...path.slice(0, -1), lastEnabledIndex]
          }
          context.set("highlightedIndexPath", newPath)
        }
      },
      highlightNextItem({ context, prop }) {
        const collection = prop("collection")

        let path = context.get("highlightedIndexPath")
        if (!path || path.length === 0) {
          // No current highlight, highlight first item
          const children = collection.getNodeChildren(collection.rootNode)
          const firstEnabledIndex = children.findIndex((child) => !collection.getNodeDisabled(child))
          if (firstEnabledIndex !== -1) {
            context.set("highlightedIndexPath", [firstEnabledIndex])
          }
          return
        }

        const currentIndex = path[path.length - 1]
        const parentNode = path.length === 1 ? collection.rootNode : collection.getParentNode(path)
        const children = collection.getNodeChildren(parentNode)

        // Find next non-disabled child after current index
        let nextEnabledIndex = -1
        for (let i = currentIndex + 1; i < children.length; i++) {
          if (!collection.getNodeDisabled(children[i])) {
            nextEnabledIndex = i
            break
          }
        }

        // If loop is enabled and no next sibling found, wrap to first
        if (nextEnabledIndex === -1 && prop("loop")) {
          nextEnabledIndex = children.findIndex((child) => !collection.getNodeDisabled(child))
        }

        if (nextEnabledIndex !== -1) {
          let newPath: number[]
          if (path.length === 1) {
            // At root level, replace the single index
            newPath = [nextEnabledIndex]
          } else {
            // At deeper level, replace the last index
            newPath = [...path.slice(0, -1), nextEnabledIndex]
          }
          context.set("highlightedIndexPath", newPath)
        }
      },
      highlightPreviousItem({ context, prop }) {
        const collection = prop("collection")

        let path = context.get("highlightedIndexPath")
        if (!path || path.length === 0) {
          // No current highlight, highlight first item
          const children = collection.getNodeChildren(collection.rootNode)
          const firstEnabledIndex = children.findIndex((child) => !collection.getNodeDisabled(child))
          if (firstEnabledIndex !== -1) {
            context.set("highlightedIndexPath", [firstEnabledIndex])
          }
          return
        }

        const currentIndex = path[path.length - 1]
        const parentNode = path.length === 1 ? collection.rootNode : collection.getParentNode(path)
        const children = collection.getNodeChildren(parentNode)

        // Find previous non-disabled child before current index
        let previousEnabledIndex = -1
        for (let i = currentIndex - 1; i >= 0; i--) {
          if (!collection.getNodeDisabled(children[i])) {
            previousEnabledIndex = i
            break
          }
        }

        // If loop is enabled and no previous sibling found, wrap to last
        if (previousEnabledIndex === -1 && prop("loop")) {
          for (let i = children.length - 1; i >= 0; i--) {
            if (!collection.getNodeDisabled(children[i])) {
              previousEnabledIndex = i
              break
            }
          }
        }

        if (previousEnabledIndex !== -1) {
          let newPath: number[]
          if (path.length === 1) {
            // At root level, replace the single index
            newPath = [previousEnabledIndex]
          } else {
            // At deeper level, replace the last index
            newPath = [...path.slice(0, -1), previousEnabledIndex]
          }
          context.set("highlightedIndexPath", newPath)
        }
      },
      highlightFirstChild({ context, prop }) {
        const collection = prop("collection")

        const path = context.get("highlightedIndexPath")
        if (!path || path.length === 0) return

        // Get the currently highlighted node
        const currentNode = collection.at(path)
        if (!currentNode || !collection.isBranchNode(currentNode)) return

        // Find first non-disabled child
        const children = collection.getNodeChildren(currentNode)
        const firstEnabledIndex = children.findIndex((child) => !collection.getNodeDisabled(child))

        if (firstEnabledIndex !== -1) {
          // Extend the current path with the first child index
          const newPath = [...path, firstEnabledIndex]
          context.set("highlightedIndexPath", newPath)
        }
      },
      highlightParent({ context }) {
        const path = context.get("highlightedIndexPath")
        if (!path || path.length <= 1) return

        // Get the parent path by removing the last item
        const parentPath = path.slice(0, -1)
        context.set("highlightedIndexPath", parentPath)
      },

      setInitialFocus({ scope }) {
        raf(() => {
          const contentEl = dom.getContentEl(scope)
          contentEl?.focus({ preventScroll: true })
        })
      },
      focusTriggerEl({ scope }) {
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
      highlightLastSelectedValue({ context, send }) {
        const valueIndexPath = context.get("valueIndexPath")

        if (!valueIndexPath) return

        // Always start fresh - clear any existing highlighted path first
        if (!isEmpty(valueIndexPath)) {
          // Use the most recent selection and highlight its full path
          const mostRecentSelection = last(valueIndexPath)
          if (mostRecentSelection) {
            send({ type: "HIGHLIGHTED_PATH.SET", indexPath: mostRecentSelection })
          }
        } else {
          // No selections - start with no highlight so user sees all options
          send({ type: "HIGHLIGHTED_PATH.SET", indexPath: [] })
        }
      },

      createGraceArea({ context, event, scope, prop }) {
        const indexPath = event.indexPath as IndexPath
        const collection = prop("collection")

        const node = collection.at(indexPath)
        const value = collection.getNodeValue(node)
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
      clearHighlightAndGraceArea({ context }) {
        // Clear highlighted path
        context.set("highlightedIndexPath", [])

        // Clear grace area
        context.set("graceArea", null)
      },
      setHighlightingForHoveredItem({ context, prop, event }) {
        const collection = prop("collection")

        // Get the full path to the hovered item
        const indexPath = event.indexPath
        if (!indexPath) {
          // Invalid item, clear highlighting
          context.set("highlightedIndexPath", [])
          return
        }

        const node = collection.at(indexPath)

        let newHighlightedIndexPath: IndexPath

        if (node && collection.isBranchNode(node)) {
          // Item has children - highlight the full path including this item
          newHighlightedIndexPath = indexPath
        } else {
          // Item is a leaf - highlight path up to (but not including) this item
          newHighlightedIndexPath = indexPath.slice(0, -1)
        }

        context.set("highlightedIndexPath", !isEmpty(newHighlightedIndexPath) ? newHighlightedIndexPath : [])
      },
      syncInputValue({ context, scope }) {
        const inputEl = dom.getHiddenInputEl(scope)
        if (!inputEl) return
        // TODO: dispatch sync input
        // setElementValue(inputEl, context.get("valueAsString"))
      },
      dispatchChangeEvent({ scope }) {
        // TODO: dispatch change event
        // dispatchInputValueEvent(dom.getHiddenInputEl(scope), { value: computed("valueAsString") })
      },
      scrollContentToTop({ scope }) {
        // Scroll all lists to the top when closing
        raf(() => {
          const contentEl = dom.getContentEl(scope)
          const listEls = contentEl?.querySelectorAll('[data-part="list"]')
          listEls?.forEach((listEl) => ((listEl as HTMLElement).scrollTop = 0))
        })
      },
    },
  },
})
