import type { CollectionItem } from "@zag-js/collection"
import { Selection } from "@zag-js/collection"
import { setup } from "@zag-js/core"
import {
  AnimationFrame,
  contains,
  getByTypeahead,
  observeAttributes,
  raf,
  scrollIntoView,
  tryFocusElement,
} from "@zag-js/dom-query"
import { getInteractionModality, trackFocusVisible as trackFocusVisibleFn } from "@zag-js/focus-visible"
import { isEqual } from "@zag-js/utils"
import { collection } from "./gridlist.collection"
import * as dom from "./gridlist.dom"
import type { GridListSchema } from "./gridlist.types"

const { createMachine } = setup<GridListSchema>()

export const machine = createMachine({
  props({ props }) {
    return {
      loopFocus: false,
      defaultValue: [],
      typeahead: true,
      collection: collection.empty(),
      selectionMode: "none",
      selectionBehavior: "toggle",
      disabledBehavior: "all",
      deselectable: true,
      keyboardNavigationBehavior: "arrow",
      escapeKeyBehavior: "clearSelection",
      autoFocus: false,
      pageSize: 10,
      ...props,
    }
  },

  context({ prop, bindable }) {
    return {
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        isEqual,
        onChange(value) {
          const items = prop("collection").findMany(value)
          return prop("onValueChange")?.({ value, items })
        },
      })),

      focusedValue: bindable<string | null>(() => ({
        defaultValue: prop("defaultFocusedValue") || null,
        value: prop("focusedValue"),
        sync: true,
        onChange(value) {
          prop("onFocusChange")?.({
            focusedValue: value,
            focusedItem: prop("collection").find(value),
          })
        },
      })),

      focusedItem: bindable<CollectionItem | null>(() => ({
        defaultValue: null,
      })),

      selectedItems: bindable<CollectionItem[]>(() => {
        const value = prop("value") ?? prop("defaultValue") ?? []
        const items = prop("collection").findMany(value)
        return { defaultValue: items }
      }),

      focused: bindable(() => ({
        sync: true,
        defaultValue: false,
      })),
    }
  },

  refs() {
    return {
      typeahead: { ...getByTypeahead.defaultOptions },
      focusVisible: false,
    }
  },

  computed: {
    hasSelectedItems: ({ context }) => context.get("value").length > 0,
    isTypingAhead: ({ refs }) => refs.get("typeahead").keysSoFar !== "",
    isInteractive: ({ prop }) => !prop("disabled"),
    selection: ({ context, prop }) => {
      const selection = new Selection(context.get("value"))
      selection.selectionMode = prop("selectionMode")
      selection.deselectable = !!prop("deselectable")
      return selection
    },
    multiple: ({ prop }) => prop("selectionMode") === "multiple",
    valueAsString: ({ context, prop }) => prop("collection").stringifyItems(context.get("selectedItems")),
    showCheckboxes: ({ prop }) => {
      return prop("selectionMode") !== "none" && prop("selectionBehavior") === "toggle"
    },
  },

  initialState() {
    return "idle"
  },

  entry: ["applyAutoFocus"],

  watch({ context, prop, track, action }) {
    track([() => context.get("value").toString()], () => {
      action(["syncSelectedItems"])
    })
    track([() => context.get("focusedValue")], () => {
      action(["syncFocusedItem"])
    })
    track([() => prop("collection").toString()], () => {
      action(["syncFocusedValue"])
    })
  },

  effects: ["trackFocusVisible"],

  on: {
    "FOCUSED_VALUE.SET": {
      actions: ["setFocusedItem"],
    },
    "ITEM.SELECT": {
      actions: ["selectItem"],
    },
    "VALUE.SET": {
      actions: ["setSelectedItems"],
    },
    "VALUE.CLEAR": {
      actions: ["clearSelectedItems"],
    },
  },

  states: {
    idle: {
      effects: ["scrollToFocusedItem"],
      on: {
        "GRID.FOCUS": [
          {
            guard: "hasFocusedValue",
            actions: ["setFocused", "focusCurrentItem"],
          },
          {
            guard: "hasSelectedValue",
            actions: ["setFocused", "setFirstSelectedAsFocused"],
          },
          {
            actions: ["setFocused", "setDefaultFocusedValue"],
          },
        ],
        "GRID.BLUR": {
          actions: ["clearFocused"],
        },
        "ITEM.FOCUS": {
          actions: ["setFocused", "setFocusedItem"],
        },
        "ITEM.CLICK": {
          actions: ["setFocusedItem", "selectFocusedItem"],
        },
        "ITEM.DOUBLE_CLICK": {
          actions: ["invokeOnAction"],
        },
        TYPEAHEAD: {
          actions: ["setFocused", "focusMatchingItem"],
        },
        "ITEM.POINTER_MOVE": {
          actions: ["focusItem"],
        },
        "ITEM.POINTER_LEAVE": {
          actions: ["clearFocusedItem"],
        },
        NAVIGATE: {
          actions: ["setFocused", "setFocusedItem", "selectWithKeyboard"],
        },
        "ESCAPE.KEY": {
          actions: ["handleEscape"],
        },
      },
    },
  },

  implementations: {
    guards: {
      hasSelectedValue: ({ context }) => context.get("value").length > 0,
      hasFocusedValue: ({ context }) => context.get("focusedValue") != null,
    },

    effects: {
      trackFocusVisible: ({ scope, refs }) => {
        return trackFocusVisibleFn({
          root: scope.getRootNode?.(),
          onChange(details) {
            refs.set("focusVisible", details.isFocusVisible)
          },
        })
      },

      scrollToFocusedItem({ context, prop, scope }) {
        // Most recent pending focus retry; replaced on each nav.
        let cancelPendingFocus: VoidFunction | undefined

        const exec = () => {
          const focusedValue = context.get("focusedValue")
          if (focusedValue == null) return

          const modality = getInteractionModality()
          // don't scroll into view if we're using the pointer
          if (modality !== "keyboard") return

          const scrollToIndexFn = prop("scrollToIndexFn")
          if (scrollToIndexFn) {
            const index = prop("collection").indexOf(focusedValue)
            if (index < 0) return
            scrollToIndexFn({
              index,
              immediate: true,
              getElement: () => dom.getItemEl(scope, focusedValue),
            })
            // Retry focus across a few frames so the virtualizer has time to
            // render the target. Replaces any in-flight retry so a newer nav
            // cancels the older one automatically.
            cancelPendingFocus?.()
            cancelPendingFocus = tryFocusElement(() => dom.getItemEl(scope, focusedValue), {
              guard: () => context.get("focusedValue") === focusedValue,
              focusOptions: { preventScroll: true },
            })
            return
          }

          const contentEl = dom.getContentEl(scope)
          const rowEl = dom.getItemEl(scope, focusedValue)
          scrollIntoView(rowEl, { rootEl: contentEl, block: "nearest" })
        }

        // Coalesce rapid nav events into one exec per frame. AnimationFrame.request
        // cancels any previously pending frame, so successive schedule() calls
        // within one frame only result in one exec().
        const frame = AnimationFrame.create()
        const schedule = () => frame.request(exec)

        schedule()

        const contentEl = () => dom.getContentEl(scope)
        const stopObserver = observeAttributes(contentEl, {
          defer: true,
          attributes: ["data-focusedvalue"],
          callback: schedule,
        })

        return () => {
          cancelPendingFocus?.()
          frame.cleanup()
          stopObserver()
        }
      },
    },

    actions: {
      applyAutoFocus({ context, prop, scope }) {
        const autoFocus = prop("autoFocus")
        if (!autoFocus) return
        const coll = prop("collection")
        const nextValue = autoFocus === "last" ? coll.lastValue : coll.firstValue
        if (nextValue == null) return
        context.set("focusedValue", nextValue)
        context.set("focused", true)
        raf(() => {
          dom.getItemEl(scope, nextValue)?.focus({ preventScroll: true })
        })
      },

      selectFocusedItem({ context, prop, event, computed }) {
        const value = event.value ?? context.get("focusedValue")

        const collection = prop("collection")
        if (value == null || !collection.has(value)) return
        const item = collection.find(value)
        if (collection.getItemDisabled(item)) return

        const selectionMode = prop("selectionMode")
        if (selectionMode === "none") {
          prop("onAction")?.({ value, item })
          return
        }

        const selection = computed("selection")
        const selectionBehavior = prop("selectionBehavior")

        if (selectionBehavior === "replace" && !event.metaKey && !event.shiftKey) {
          // Replace mode without modifiers: treat click as action
          const onAction = prop("onAction")
          if (onAction) {
            onAction({ value, item })
            return
          }
        }

        if (event.shiftKey && computed("multiple") && event.anchorValue) {
          const next = selection.extendSelection(collection, event.anchorValue, value)
          context.set("value", Array.from(next))
        } else {
          const next = selection.select(collection, value, event.metaKey)
          context.set("value", Array.from(next))
        }
      },

      selectWithKeyboard({ context, prop, event, computed }) {
        const selection = computed("selection")
        const collection = prop("collection")
        const selectionBehavior = prop("selectionBehavior")

        if (event.shiftKey && computed("multiple") && event.anchorValue) {
          const next = selection.extendSelection(collection, event.anchorValue, event.value)
          context.set("value", Array.from(next))
          return
        }

        // In replace mode, arrow keys change selection
        if (selectionBehavior === "replace" && prop("selectionMode") !== "none") {
          const next = selection.replaceSelection(collection, event.value)
          context.set("value", Array.from(next))
        }
      },

      focusItem({ context, event }) {
        context.set("focusedValue", event.value)
      },

      focusMatchingItem({ context, prop, event, refs }) {
        const value = prop("collection").search(event.key, {
          state: refs.get("typeahead"),
          currentValue: context.get("focusedValue"),
        })

        if (value == null) return
        context.set("focusedValue", value)
      },

      setFocusedItem({ context, event, scope }) {
        context.set("focusedValue", event.value)

        if (event.value) {
          raf(() => {
            const itemEl = dom.getItemEl(scope, event.value)
            if (!itemEl) return

            const activeElement = scope.getActiveElement()

            // Don't move focus if it's already on an interactive child within this item
            if (activeElement && activeElement !== itemEl && contains(itemEl, activeElement)) {
              return
            }

            if (scope.getDoc().activeElement !== itemEl) {
              itemEl.focus({ preventScroll: true })
            }
          })
        }
      },

      clearFocusedItem({ context }) {
        context.set("focusedValue", null)
      },

      selectItem({ context, prop, event, computed }) {
        const collection = prop("collection")
        const selection = computed("selection")

        const next = selection.select(collection, event.value)
        context.set("value", Array.from(next))
      },

      setSelectedItems({ context, event }) {
        context.set("value", event.value)
      },

      clearSelectedItems({ context, prop, event }) {
        if (event.value) {
          const current = context.get("value")
          const next = current.filter((v) => v !== event.value)
          context.set("value", next)
        } else {
          if (prop("disallowEmptySelection")) return
          context.set("value", [])
        }
      },

      handleEscape({ context, prop }) {
        if (prop("escapeKeyBehavior") !== "clearSelection") return
        if (prop("disallowEmptySelection")) return
        if (context.get("value").length === 0) return
        context.set("value", [])
      },

      syncSelectedItems({ context, prop }) {
        const collection = prop("collection")
        const prevSelectedItems = context.get("selectedItems")

        const value = context.get("value")
        const selectedItems = value
          .map((v) => {
            const item = prevSelectedItems.find((it) => collection.getItemValue(it) === v)
            return item || collection.find(v)
          })
          .filter(Boolean) as CollectionItem[]

        context.set("selectedItems", selectedItems)
      },

      syncFocusedItem({ context, prop }) {
        const collection = prop("collection")
        const focusedValue = context.get("focusedValue")
        const focusedItem = focusedValue ? collection.find(focusedValue) : null
        context.set("focusedItem", focusedItem)
      },

      syncFocusedValue({ context, prop }) {
        const collection = prop("collection")
        const focusedValue = context.get("focusedValue")
        if (focusedValue != null && !collection.has(focusedValue)) {
          context.set("focusedValue", null)
        }
      },

      setFocused({ context }) {
        context.set("focused", true)
      },

      focusCurrentItem({ context, scope }) {
        const focusedValue = context.get("focusedValue")
        if (focusedValue) {
          raf(() => {
            const itemEl = dom.getItemEl(scope, focusedValue)
            itemEl?.focus({ preventScroll: true })
          })
        }
      },

      setDefaultFocusedValue({ context, prop, scope }) {
        const collection = prop("collection")
        const firstValue = collection.firstValue
        if (firstValue != null) {
          context.set("focusedValue", firstValue)
          raf(() => {
            dom.getItemEl(scope, firstValue)?.focus({ preventScroll: true })
          })
        }
      },

      setFirstSelectedAsFocused({ context, scope }) {
        const value = context.get("value")
        if (value.length > 0) {
          context.set("focusedValue", value[0])
          raf(() => {
            dom.getItemEl(scope, value[0])?.focus({ preventScroll: true })
          })
        }
      },

      clearFocused({ context }) {
        context.set("focused", false)
      },

      invokeOnAction({ prop, event }) {
        const collection = prop("collection")
        if (!collection.has(event.value)) return
        const item = collection.find(event.value)
        prop("onAction")?.({ value: event.value, item })
      },
    },
  },
})
