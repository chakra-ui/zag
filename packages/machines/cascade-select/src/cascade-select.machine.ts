import { createGuards, createMachine } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { raf, trackFormControl } from "@zag-js/dom-query"
import { getPlacement, type Placement } from "@zag-js/popper"
import { collection } from "./cascade-select.collection"
import { dom } from "./cascade-select.dom"
import type { CascadeSelectSchema } from "./cascade-select.types"

const { or, and } = createGuards<CascadeSelectSchema>()

export const machine = createMachine<CascadeSelectSchema>({
  props({ props }) {
    // Force "click highlighting mode" when parent selection is allowed
    const highlightTrigger = props.allowParentSelection ? "click" : (props.highlightTrigger ?? "hover")

    return {
      closeOnSelect: true,
      loop: false,
      defaultValue: [],
      defaultOpen: false,
      multiple: false,
      placeholder: "Select an option",
      allowParentSelection: false,
      positioning: {
        placement: "bottom-start",
        gutter: 8,
        ...props.positioning,
      },
      ...props,
      collection: props.collection ?? collection.empty(),
      highlightTrigger,
    }
  },

  context({ prop, bindable }) {
    return {
      value: bindable<string[][]>(() => ({
        defaultValue: prop("defaultValue") ?? [],
        value: prop("value"),
        onChange(value) {
          const collection = prop("collection")
          const valueText =
            prop("formatValue")?.(value) ??
            value.map((path) => path.map((v) => collection.stringify(v) || v).join(" / ")).join(", ")
          prop("onValueChange")?.({ value, valueText })
        },
      })),
      highlightedPath: bindable<string[] | null>(() => ({
        defaultValue: prop("highlightedPath") || null,
        value: prop("highlightedPath"),
        onChange(path) {
          prop("onHighlightChange")?.({ highlightedPath: path })
        },
      })),
      currentPlacement: bindable<Placement | undefined>(() => ({
        defaultValue: undefined,
      })),
      fieldsetDisabled: bindable<boolean>(() => ({
        defaultValue: false,
      })),
      levelValues: bindable<string[][]>(() => ({
        defaultValue: [],
      })),
      clearFocusTimer: bindable<(() => void) | null>(() => ({
        defaultValue: null,
      })),
    }
  },

  computed: {
    hasValue: ({ context }) => context.get("value").length > 0,
    isDisabled: ({ prop, context }) => !!prop("disabled") || !!context.get("fieldsetDisabled"),
    isInteractive: ({ prop }) => !(prop("disabled") || prop("readOnly")),
    selectedItems: ({ context, prop }) => {
      const value = context.get("value")
      const collection = prop("collection")
      return value.flatMap((path) => path.map((v) => collection.findNode(v)).filter(Boolean))
    },
    highlightedItem: ({ context, prop }) => {
      const highlightedPath = context.get("highlightedPath")
      return highlightedPath && highlightedPath.length > 0
        ? prop("collection").findNode(highlightedPath[highlightedPath.length - 1])
        : null
    },
    levelDepth: ({ context }) => {
      return Math.max(1, context.get("levelValues").length)
    },
    valueText: ({ context, prop }) => {
      const value = context.get("value")
      if (value.length === 0) return prop("placeholder") ?? ""
      const collection = prop("collection")
      return (
        prop("formatValue")?.(value) ??
        value.map((path) => path.map((v) => collection.stringify(v) || v).join(" / ")).join(", ")
      )
    },
  },

  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen")
    return open ? "open" : "idle"
  },

  entry: ["syncLevelValues"],

  watch({ context, prop, track, action }) {
    track([() => context.get("value").toString()], () => {
      action(["syncLevelValues"])
    })
    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })
    track([() => prop("collection").toString()], () => {
      action(["syncLevelValues"])
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
      actions: ["setHighlightedPath"],
    },
    "ITEM.SELECT": {
      actions: ["selectItem"],
    },
    SYNC_LEVELS: {
      actions: ["syncLevelValues"],
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
            guard: or("isTriggerArrowDownEvent", "isTriggerEnterEvent"),
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
      effects: ["trackDismissableElement", "computePlacement"],
      entry: ["setInitialFocus", "highlightLastSelectedValue"],
      exit: ["clearHighlightedPath"],
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
            actions: ["setHighlightedPathFromValue"],
          },
        ],
        "ITEM.POINTER_MOVE": [
          {
            guard: "isHoverHighlighting",
            actions: ["setHighlightedPathFromValue"],
          },
        ],
        "ITEM.POINTER_LEAVE": [
          {
            guard: "isHoverHighlighting",
            actions: ["scheduleDelayedClear"],
          },
        ],
        "CONTENT.ARROW_DOWN": [
          {
            guard: "hasHighlightedPath",
            actions: ["highlightNextItem"],
          },
          {
            actions: ["highlightFirstItem"],
          },
        ],
        "CONTENT.ARROW_UP": [
          {
            guard: "hasHighlightedPath",
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
        "DELAY.CLEAR_FOCUS": {
          actions: ["clearHighlightedPath"],
        },
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
      hasHighlightedPath: ({ context }) => context.get("highlightedPath") != null,
      loop: ({ prop }) => !!prop("loop"),
      isHoverHighlighting: ({ prop }) => prop("highlightTrigger") === "hover",
      shouldCloseOnSelect: ({ prop, event }) => {
        if (!prop("closeOnSelect")) return false

        const collection = prop("collection")
        const node = collection.findNode(event.value)

        // Only close if selecting a leaf node (no children)
        return node && !collection.isBranchNode(node)
      },
      shouldCloseOnSelectHighlighted: ({ prop, context }) => {
        if (!prop("closeOnSelect")) return false

        const highlightedPath = context.get("highlightedPath")
        if (!highlightedPath || highlightedPath.length === 0) return false

        const collection = prop("collection")
        const leafValue = highlightedPath[highlightedPath.length - 1]
        const node = collection.findNode(leafValue)

        // Only close if selecting a leaf node (no children)
        return node && !collection.isBranchNode(node)
      },
      canSelectItem: ({ prop, event }) => {
        const collection = prop("collection")
        const node = collection.findNode(event.value)

        if (!node) return false

        // If parent selection is not allowed, only allow leaf nodes
        if (!prop("allowParentSelection")) {
          return !collection.isBranchNode(node)
        }

        // Otherwise, allow any node
        return true
      },
      canSelectHighlightedItem: ({ prop, context }) => {
        const highlightedPath = context.get("highlightedPath")
        if (!highlightedPath || highlightedPath.length === 0) return false

        const collection = prop("collection")
        const leafValue = highlightedPath[highlightedPath.length - 1]
        const node = collection.findNode(leafValue)

        if (!node) return false

        // If parent selection is not allowed, only allow leaf nodes
        if (!prop("allowParentSelection")) {
          return !collection.isBranchNode(node)
        }

        // Otherwise, allow any node
        return true
      },
      canNavigateToChild: ({ prop, context }) => {
        const highlightedPath = context.get("highlightedPath")
        if (!highlightedPath || highlightedPath.length === 0) return false

        const collection = prop("collection")
        const leafValue = highlightedPath[highlightedPath.length - 1]
        const node = collection.findNode(leafValue)

        return node && collection.isBranchNode(node)
      },
      canNavigateToParent: ({ context }) => {
        const highlightedPath = context.get("highlightedPath")
        if (!highlightedPath || highlightedPath.length === 0) return false

        // We can navigate to parent if the path has more than one item
        return highlightedPath.length > 1
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
    },

    actions: {
      setValue({ context, event }) {
        context.set("value", event.value)
      },
      clearValue({ context }) {
        context.set("value", [])
      },
      setHighlightedPath({ context, event, prop }) {
        const { value } = event
        const collection = prop("collection")

        // Cancel any existing clear focus timer
        const existingTimer = context.get("clearFocusTimer")
        if (existingTimer) {
          existingTimer()
          context.set("clearFocusTimer", null)
        }

        context.set("highlightedPath", value)

        if (value && value.length > 0) {
          // Build level values to show the path to the highlighted item and its children
          const levelValues: string[][] = []

          // First level is always root children
          const rootNode = collection.rootNode
          if (rootNode && collection.isBranchNode(rootNode)) {
            levelValues[0] = collection.getNodeChildren(rootNode).map((child) => collection.getNodeValue(child))
          }

          // Build levels for the entire highlighted path
          for (let i = 0; i < value.length; i++) {
            const nodeValue = value[i]
            const node = collection.findNode(nodeValue)
            if (node && collection.isBranchNode(node)) {
              const children = collection.getNodeChildren(node)
              levelValues[i + 1] = children.map((child) => collection.getNodeValue(child))
            }
          }

          context.set("levelValues", levelValues)
        }
      },
      setHighlightedPathFromValue({ event, prop, send }) {
        const { value } = event
        const collection = prop("collection")

        if (!value) {
          send({ type: "HIGHLIGHTED_PATH.SET", value: null })
          return
        }

        // Find the full path to this value
        const indexPath = collection.getIndexPath(value)
        if (indexPath) {
          const fullPath = collection.getValuePath(indexPath)
          send({ type: "HIGHLIGHTED_PATH.SET", value: fullPath })
        }
      },
      clearHighlightedPath({ context, action }) {
        // Cancel any existing clear focus timer
        const existingTimer = context.get("clearFocusTimer")
        if (existingTimer) {
          existingTimer()
          context.set("clearFocusTimer", null)
        }

        // Clear the highlighted path
        context.set("highlightedPath", null)

        // Restore level values to match the actual selected values
        // (remove any preview levels that were showing due to highlighting)
        action(["syncLevelValues"])
      },
      selectItem({ context, prop, event }) {
        const collection = prop("collection")
        const node = collection.findNode(event.value)

        if (!node || prop("isItemDisabled")?.(event.value)) return

        const hasChildren = collection.isBranchNode(node)
        const indexPath = collection.getIndexPath(event.value)

        if (!indexPath) return

        const valuePath = collection.getValuePath(indexPath)
        const currentValues = context.get("value")
        const multiple = prop("multiple")

        if (prop("allowParentSelection")) {
          // When parent selection is allowed, always update the value to the selected item

          if (multiple) {
            // Remove any conflicting selections (parent/child conflicts)
            const filteredValues = currentValues.filter((existingPath) => {
              // Remove if this path is a parent of the new selection
              const isParentOfNew =
                valuePath.length > existingPath.length && existingPath.every((val, idx) => val === valuePath[idx])
              // Remove if this path is a child of the new selection
              const isChildOfNew =
                existingPath.length > valuePath.length && valuePath.every((val, idx) => val === existingPath[idx])
              // Remove if this is the exact same path
              const isSamePath =
                existingPath.length === valuePath.length && existingPath.every((val, idx) => val === valuePath[idx])

              return !isParentOfNew && !isChildOfNew && !isSamePath
            })

            // Add the new selection
            context.set("value", [...filteredValues, valuePath])
          } else {
            // Single selection mode
            context.set("value", [valuePath])
          }

          // Keep the selected item highlighted if it has children
          if (hasChildren) {
            context.set("highlightedPath", valuePath)
          } else {
            // Clear highlight for leaf items since they're now selected
            context.set("highlightedPath", null)
          }
        } else {
          // When parent selection is not allowed, only leaf items update the value
          if (hasChildren) {
            // For branch nodes, just navigate into them (update value path but don't "select")
            if (multiple && currentValues.length > 0) {
              // Use the most recent selection as base for navigation
              context.set("value", [...currentValues.slice(0, -1), valuePath])
            } else {
              context.set("value", [valuePath])
            }
            context.set("highlightedPath", valuePath)
          } else {
            // For leaf nodes, actually select them
            if (multiple) {
              // Check if this path already exists
              const existingIndex = currentValues.findIndex(
                (path) => path.length === valuePath.length && path.every((val, idx) => val === valuePath[idx]),
              )

              if (existingIndex >= 0) {
                // Remove existing selection (toggle off)
                const newValues = [...currentValues]
                newValues.splice(existingIndex, 1)
                context.set("value", newValues)
              } else {
                // Add new selection
                context.set("value", [...currentValues, valuePath])
              }
            } else {
              // Single selection mode
              context.set("value", [valuePath])
            }
            context.set("highlightedPath", null)
          }
        }
      },
      selectHighlightedItem({ context, send }) {
        const highlightedPath = context.get("highlightedPath")
        if (highlightedPath && highlightedPath.length > 0) {
          const leafValue = highlightedPath[highlightedPath.length - 1]
          send({ type: "ITEM.SELECT", value: leafValue })
        }
      },
      syncLevelValues({ context, prop }) {
        const values = context.get("value")
        const collection = prop("collection")
        const levelValues: string[][] = []

        // First level is always root children
        const rootNode = collection.rootNode
        if (rootNode && collection.isBranchNode(rootNode)) {
          levelValues[0] = collection.getNodeChildren(rootNode).map((child) => collection.getNodeValue(child))
        }

        // Use the most recent selection for building levels
        const mostRecentValue = values.length > 0 ? values[values.length - 1] : []

        // Build subsequent levels based on most recent value path
        for (let i = 0; i < mostRecentValue.length; i++) {
          const nodeValue = mostRecentValue[i]
          const node = collection.findNode(nodeValue)
          if (node && collection.isBranchNode(node)) {
            const children = collection.getNodeChildren(node)
            levelValues[i + 1] = children.map((child) => collection.getNodeValue(child))
          }
        }

        context.set("levelValues", levelValues)
      },
      highlightFirstItem({ context, send }) {
        const levelValues = context.get("levelValues")
        const value = context.get("value")
        // Use the current active level (value.length) or first level if empty
        const currentLevelIndex = Math.max(0, value.length)
        const currentLevel = levelValues[currentLevelIndex]

        if (currentLevel && currentLevel.length > 0) {
          const firstValue = currentLevel[0]
          send({ type: "HIGHLIGHTED_PATH.SET", value: [firstValue] })
        }
      },
      highlightLastItem({ context, send }) {
        const levelValues = context.get("levelValues")
        const value = context.get("value")
        // Use the current active level (value.length) or first level if empty
        const currentLevelIndex = Math.max(0, value.length)
        const currentLevel = levelValues[currentLevelIndex]

        if (currentLevel && currentLevel.length > 0) {
          const lastValue = currentLevel[currentLevel.length - 1]
          send({ type: "HIGHLIGHTED_PATH.SET", value: [lastValue] })
        }
      },
      highlightNextItem({ context, prop, send }) {
        const highlightedPath = context.get("highlightedPath")
        const levelValues = context.get("levelValues")
        const value = context.get("value")

        if (!highlightedPath) {
          // If nothing highlighted, highlight first item
          const currentLevelIndex = Math.max(0, value.length)
          const currentLevel = levelValues[currentLevelIndex]
          if (currentLevel && currentLevel.length > 0) {
            send({ type: "HIGHLIGHTED_PATH.SET", value: [currentLevel[0]] })
          }
          return
        }

        // Find which level contains the last item in the highlighted path
        const leafValue = highlightedPath[highlightedPath.length - 1]
        let targetLevel: string[] | undefined
        let levelIndex = -1

        for (let i = 0; i < levelValues.length; i++) {
          if (levelValues[i]?.includes(leafValue)) {
            targetLevel = levelValues[i]
            levelIndex = i
            break
          }
        }

        if (!targetLevel || targetLevel.length === 0) return

        const currentIndex = targetLevel.indexOf(leafValue)
        if (currentIndex === -1) return

        let nextIndex = currentIndex + 1
        if (nextIndex >= targetLevel.length) {
          nextIndex = prop("loop") ? 0 : currentIndex
        }

        const nextValue = targetLevel[nextIndex]

        // Build the correct path: parent path + next value
        if (levelIndex === 0) {
          // First level - just the value
          send({ type: "HIGHLIGHTED_PATH.SET", value: [nextValue] })
        } else {
          // Deeper level - parent path + next value
          const parentPath = highlightedPath.slice(0, levelIndex)
          send({ type: "HIGHLIGHTED_PATH.SET", value: [...parentPath, nextValue] })
        }
      },
      highlightPreviousItem({ context, prop, send }) {
        const highlightedPath = context.get("highlightedPath")
        const levelValues = context.get("levelValues")
        const value = context.get("value")

        if (!highlightedPath) {
          // If nothing highlighted, highlight first item
          const currentLevelIndex = Math.max(0, value.length)
          const currentLevel = levelValues[currentLevelIndex]
          if (currentLevel && currentLevel.length > 0) {
            send({ type: "HIGHLIGHTED_PATH.SET", value: [currentLevel[0]] })
          }
          return
        }

        // Find which level contains the last item in the highlighted path
        const leafValue = highlightedPath[highlightedPath.length - 1]
        let targetLevel: string[] | undefined
        let levelIndex = -1

        for (let i = 0; i < levelValues.length; i++) {
          if (levelValues[i]?.includes(leafValue)) {
            targetLevel = levelValues[i]
            levelIndex = i
            break
          }
        }

        if (!targetLevel || targetLevel.length === 0) return

        const currentIndex = targetLevel.indexOf(leafValue)
        if (currentIndex === -1) return

        let prevIndex = currentIndex - 1
        if (prevIndex < 0) {
          prevIndex = prop("loop") ? targetLevel.length - 1 : 0
        }

        const prevValue = targetLevel[prevIndex]

        // Build the correct path: parent path + prev value
        if (levelIndex === 0) {
          // First level - just the value
          send({ type: "HIGHLIGHTED_PATH.SET", value: [prevValue] })
        } else {
          // Deeper level - parent path + prev value
          const parentPath = highlightedPath.slice(0, levelIndex)
          send({ type: "HIGHLIGHTED_PATH.SET", value: [...parentPath, prevValue] })
        }
      },
      highlightFirstChild({ context, prop, send }) {
        const highlightedPath = context.get("highlightedPath")
        if (!highlightedPath || highlightedPath.length === 0) return

        const collection = prop("collection")
        const leafValue = highlightedPath[highlightedPath.length - 1]
        const node = collection.findNode(leafValue)

        if (!node || !collection.isBranchNode(node)) return

        const children = collection.getNodeChildren(node)
        if (children.length > 0) {
          const firstChildValue = collection.getNodeValue(children[0])
          // Build the new path by extending the current path
          const newPath = [...highlightedPath, firstChildValue]
          send({ type: "HIGHLIGHTED_PATH.SET", value: newPath })
        }
      },
      highlightParent({ context, send }) {
        const highlightedPath = context.get("highlightedPath")
        if (!highlightedPath || highlightedPath.length <= 1) return

        // Get the parent path by removing the last item
        const parentPath = highlightedPath.slice(0, -1)
        send({ type: "HIGHLIGHTED_PATH.SET", value: parentPath })
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
        const values = context.get("value")

        // Always start fresh - clear any existing highlighted path first
        if (values.length > 0) {
          // Use the most recent selection and highlight its full path
          const mostRecentSelection = values[values.length - 1]
          send({ type: "HIGHLIGHTED_PATH.SET", value: mostRecentSelection })
        } else {
          // No selections - start with no highlight so user sees all options
          send({ type: "HIGHLIGHTED_PATH.SET", value: null })
        }
      },
      scheduleDelayedClear({ context, send }) {
        // Cancel any existing timer first
        const existingTimer = context.get("clearFocusTimer")
        if (existingTimer) {
          existingTimer()
        }

        // Set up new timer with shorter delay for cascade-select (100ms vs menu's longer delays)
        const timer = setTimeout(() => {
          context.set("clearFocusTimer", null)
          send({ type: "DELAY.CLEAR_FOCUS" })
        }, 100) // Shorter delay for cascade-select UX

        // Store cancel function
        const cancelTimer = () => clearTimeout(timer)
        context.set("clearFocusTimer", cancelTimer)

        return cancelTimer
      },
    },
  },
})
