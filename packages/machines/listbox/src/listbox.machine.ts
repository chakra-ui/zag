import type { CollectionItem } from "@zag-js/collection"
import { Selection } from "@zag-js/collection"
import { createMachine } from "@zag-js/core"
import { getByTypeahead, observeAttributes, raf, scrollIntoView } from "@zag-js/dom-query"
import { getInteractionModality, trackFocusVisible as trackFocusVisibleFn } from "@zag-js/focus-visible"
import { isEqual } from "@zag-js/utils"
import { collection } from "./listbox.collection"
import * as dom from "./listbox.dom"
import type { ListboxSchema } from "./listbox.types"

export const machine = createMachine<ListboxSchema>({
  props({ props }) {
    return {
      loopFocus: false,
      composite: true,
      defaultValue: [],
      selectionBehavior: "toggle",
      selectionMode: "single",
      collection: collection.empty(),
      orientation: "vertical",
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

      highlightedValue: bindable<string | null>(() => ({
        defaultValue: prop("defaultHighlightedValue") || null,
        value: prop("highlightedValue"),
        sync: true,
        onChange(value) {
          prop("onHighlightChange")?.({
            highlightedValue: value,
            highlightedItem: prop("collection").find(value),
            highlightedIndex: prop("collection").indexOf(value),
          })
        },
      })),

      highlightedItem: bindable<CollectionItem | null>(() => ({
        defaultValue: null,
      })),

      selectedItems: bindable<CollectionItem[]>(() => {
        const value = prop("value") ?? prop("defaultValue") ?? []
        const items = prop("collection").findMany(value)
        return { defaultValue: items }
      }),

      valueAsString: bindable(() => {
        const value = prop("value") ?? prop("defaultValue") ?? []
        return { defaultValue: prop("collection").stringifyMany(value) }
      }),
    }
  },

  refs() {
    return {
      typeahead: { ...getByTypeahead.defaultOptions },
    }
  },

  computed: {
    hasSelectedItems: ({ context }) => context.get("value").length > 0,
    isTypingAhead: ({ refs }) => refs.get("typeahead").keysSoFar !== "",
    isInteractive: ({ prop }) => !prop("disabled"),
    multiple: ({ prop }) => prop("selectionMode") === "multiple",
    selection: ({ context, prop }) => {
      const selection = new Selection(context.get("value"))
      selection.selectionMode = prop("selectionMode")
      selection.selectionBehavior = prop("selectionBehavior")
      return selection
    },
  },

  initialState() {
    return "idle"
  },

  watch({ context, prop, track, action }) {
    track([() => context.get("value").toString()], () => {
      action(["syncSelectedItems"])
    })
    track([() => context.get("highlightedValue")], () => {
      action(["syncHighlightedItem"])
    })
    track([() => prop("collection").toString()], () => {
      action(["syncCollection"])
    })
  },

  effects: ["trackFocusVisible"],

  on: {
    "HIGHLIGHTED_VALUE.SET": {
      actions: ["setHighlightedItem"],
    },
    "ITEM.SELECT": {
      actions: ["selectItem"],
    },
    "ITEM.CLEAR": {
      actions: ["clearItem"],
    },
    "VALUE.SET": {
      actions: ["setSelectedItems"],
    },
    "VALUE.CLEAR": {
      actions: ["clearSelectedItems"],
    },
    "CLEAR.CLICK": {
      actions: ["clearSelectedItems"],
    },
  },

  states: {
    idle: {
      effects: ["scrollToHighlightedItem"],
      on: {
        "CONTENT.FOCUS": {
          actions: ["scrollIntoView"],
        },
        "ITEM.CLICK": {
          actions: ["setHighlightedItem", "selectHighlightedItem"],
        },
        "CONTENT.TYPEAHEAD": {
          actions: ["highlightMatchingItem"],
        },
        "ITEM.POINTER_MOVE": {
          actions: ["highlightItem"],
        },
        "ITEM.POINTER_LEAVE": {
          actions: ["clearHighlightedItem"],
        },
        NAVIGATE: {
          actions: ["setHighlightedItem", "extendOrReplaceSelection"],
        },
      },
    },
  },

  implementations: {
    effects: {
      trackFocusVisible: ({ scope }) => {
        return trackFocusVisibleFn({ root: scope.getRootNode?.() })
      },

      scrollToHighlightedItem({ context, prop, scope }) {
        const exec = (immediate: boolean) => {
          const highlightedValue = context.get("highlightedValue")
          if (highlightedValue == null) return

          const modality = getInteractionModality()

          // don't scroll into view if we're using the pointer
          if (modality !== "keyboard") return

          const itemEl = dom.getItemEl(scope, highlightedValue)
          const contentEl = dom.getContentEl(scope)

          const scrollToIndexFn = prop("scrollToIndexFn")
          if (scrollToIndexFn) {
            const highlightedIndex = prop("collection").indexOf(highlightedValue)
            scrollToIndexFn?.({ index: highlightedIndex, immediate })
            return
          }

          scrollIntoView(itemEl, { rootEl: contentEl, block: "nearest" })
        }

        raf(() => exec(true))

        const contentEl = () => dom.getContentEl(scope)
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
      highlightPreviousItem({ context, prop }) {
        const highlightedValue = context.get("highlightedValue")
        if (highlightedValue == null) return
        const value = prop("collection").getPreviousValue(highlightedValue, 1, prop("loopFocus"))
        context.set("highlightedValue", value)
      },

      highlightNextItem({ context, prop }) {
        const highlightedValue = context.get("highlightedValue")
        if (highlightedValue == null) return
        const value = prop("collection").getNextValue(highlightedValue, 1, prop("loopFocus"))
        context.set("highlightedValue", value)
      },

      highlightFirstItem({ context, prop }) {
        const value = prop("collection").firstValue
        context.set("highlightedValue", value)
      },

      highlightLastItem({ context, prop }) {
        const value = prop("collection").lastValue
        context.set("highlightedValue", value)
      },

      selectHighlightedItem({ context, prop, event, computed }) {
        const value = event.value ?? context.get("highlightedValue")
        if (value == null) return

        const selection = computed("selection")
        const collection = prop("collection")

        if (event.shiftKey && computed("multiple") && event.anchorValue) {
          const next = selection.extendSelection(collection, event.anchorValue, value)
          context.set("value", Array.from(next))
        } else {
          const next = selection.select(collection, value)
          context.set("value", Array.from(next))
        }
      },

      extendOrReplaceSelection({ context, prop, event, computed }) {
        const selection = computed("selection")
        const collection = prop("collection")

        if (event.shiftKey && computed("multiple") && event.anchorValue) {
          const next = selection.extendSelection(collection, event.anchorValue, event.value)
          context.set("value", Array.from(next))
          return
        }

        if (prop("selectOnHighlight")) {
          const next = selection.replaceSelection(collection, event.value)
          context.set("value", Array.from(next))
        }
      },

      highlightItem({ context, event }) {
        context.set("highlightedValue", event.value)
      },

      highlightMatchingItem({ context, prop, event, refs }) {
        const value = prop("collection").search(event.key, {
          state: refs.get("typeahead"),
          currentValue: context.get("highlightedValue"),
        })

        if (value == null) return
        context.set("highlightedValue", value)
      },

      setHighlightedItem({ context, event }) {
        context.set("highlightedValue", event.value)
      },

      clearHighlightedItem({ context }) {
        context.set("highlightedValue", null)
      },

      selectItem({ context, prop, event, computed }) {
        const collection = prop("collection")
        const selection = computed("selection")
        const value = selection.select(collection, event.value)
        context.set("value", Array.from(value))
      },

      clearItem({ context, event, computed }) {
        const selection = computed("selection")
        const value = selection.deselect(event.value)
        context.set("value", Array.from(value))
      },

      setSelectedItems({ context, event }) {
        context.set("value", event.value)
      },

      clearSelectedItems({ context }) {
        context.set("value", [])
      },

      syncCollection({ context, prop }) {
        const collection = prop("collection")

        const highlightedItem = collection.find(context.get("highlightedValue"))
        if (highlightedItem) context.set("highlightedItem", highlightedItem)

        const selectedItems = collection.findMany(context.get("value"))
        context.set("selectedItems", selectedItems)

        const valueAsString = collection.stringifyItems(selectedItems)
        context.set("valueAsString", valueAsString)
      },

      syncSelectedItems({ context, prop }) {
        const collection = prop("collection")
        const prevSelectedItems = context.get("selectedItems")

        const value = context.get("value")
        const selectedItems = value.map((value) => {
          const item = prevSelectedItems.find((item) => collection.getItemValue(item) === value)
          return item || collection.find(value)
        })

        context.set("selectedItems", selectedItems)
        context.set("valueAsString", collection.stringifyItems(selectedItems))
      },

      syncHighlightedItem({ context, prop }) {
        const collection = prop("collection")
        const highlightedValue = context.get("highlightedValue")
        const highlightedItem = highlightedValue ? collection.find(highlightedValue) : null
        context.set("highlightedItem", highlightedItem)
      },

      scrollIntoView({ context, prop, scope }) {
        const highlightedValue = context.get("highlightedValue")
        if (highlightedValue == null) return

        const modality = getInteractionModality()
        if (modality !== "keyboard") return

        const itemEl = dom.getItemEl(scope, highlightedValue)
        const contentEl = dom.getContentEl(scope)

        const scrollToIndexFn = prop("scrollToIndexFn")
        if (scrollToIndexFn) {
          const highlightedIndex = prop("collection").indexOf(highlightedValue)
          scrollToIndexFn?.({ index: highlightedIndex, immediate: false })
          return
        }

        scrollIntoView(itemEl, { rootEl: contentEl, block: "nearest" })
      },
    },
  },
})
