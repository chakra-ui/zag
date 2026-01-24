import type { CollectionItem } from "@zag-js/collection"
import { Selection } from "@zag-js/collection"
import { setup } from "@zag-js/core"
import { getByTypeahead, observeAttributes, raf, scrollIntoView } from "@zag-js/dom-query"
import { getInteractionModality, trackFocusVisible as trackFocusVisibleFn } from "@zag-js/focus-visible"
import { isEqual } from "@zag-js/utils"
import { collection } from "./listbox.collection"
import * as dom from "./listbox.dom"
import type { ListboxSchema, SelectionDetails } from "./listbox.types"

const { guards, createMachine } = setup<ListboxSchema>()

const { or } = guards

export const machine = createMachine({
  props({ props }) {
    return {
      loopFocus: false,
      composite: true,
      defaultValue: [],
      multiple: false,
      typeahead: true,
      collection: collection.empty(),
      orientation: "vertical",
      selectionMode: "single",
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
      inputState: { autoHighlight: false, focused: false },
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
    multiple: ({ prop }) => prop("selectionMode") === "multiple" || prop("selectionMode") === "extended",
    valueAsString: ({ context, prop }) => prop("collection").stringifyItems(context.get("selectedItems")),
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
      action(["syncHighlightedValue"])
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
  },

  states: {
    idle: {
      effects: ["scrollToHighlightedItem"],
      on: {
        "INPUT.FOCUS": {
          actions: ["setFocused", "setInputState"],
        },
        "CONTENT.FOCUS": [
          {
            guard: or("hasSelectedValue", "hasHighlightedValue"),
            actions: ["setFocused"],
          },
          {
            actions: ["setFocused", "setDefaultHighlightedValue"],
          },
        ],
        "CONTENT.BLUR": {
          actions: ["clearFocused", "clearInputState"],
        },
        "ITEM.CLICK": {
          actions: ["setHighlightedItem", "selectHighlightedItem"],
        },
        "CONTENT.TYPEAHEAD": {
          actions: ["setFocused", "highlightMatchingItem"],
        },
        "ITEM.POINTER_MOVE": {
          actions: ["highlightItem"],
        },
        "ITEM.POINTER_LEAVE": {
          actions: ["clearHighlightedItem"],
        },
        NAVIGATE: {
          actions: ["setFocused", "setHighlightedItem", "selectWithKeyboard"],
        },
      },
    },
  },

  implementations: {
    guards: {
      hasSelectedValue: ({ context }) => context.get("value").length > 0,
      hasHighlightedValue: ({ context }) => context.get("highlightedValue") != null,
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

      scrollToHighlightedItem({ context, prop, scope }) {
        const exec = (immediate: boolean) => {
          const highlightedValue = context.get("highlightedValue")
          if (highlightedValue == null) return

          const modality = getInteractionModality()

          // don't scroll into view if we're using the pointer
          if (modality !== "keyboard") return

          const contentEl = dom.getContentEl(scope)

          const scrollToIndexFn = prop("scrollToIndexFn")
          if (scrollToIndexFn) {
            const highlightedIndex = prop("collection").indexOf(highlightedValue)
            scrollToIndexFn?.({
              index: highlightedIndex,
              immediate,
              getElement() {
                return dom.getItemEl(scope, highlightedValue)
              },
            })
            return
          }

          const itemEl = dom.getItemEl(scope, highlightedValue)
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
      selectHighlightedItem({ context, prop, event, computed }) {
        const value = event.value ?? context.get("highlightedValue")

        const collection = prop("collection")
        if (value == null || !collection.has(value)) return

        const selection = computed("selection")

        if (event.shiftKey && computed("multiple") && event.anchorValue) {
          const next = selection.extendSelection(collection, event.anchorValue, value)
          invokeOnSelect(selection, next, prop("onSelect"))
          context.set("value", Array.from(next))
        } else {
          const next = selection.select(collection, value, event.metaKey)
          invokeOnSelect(selection, next, prop("onSelect"))
          context.set("value", Array.from(next))
        }
      },

      selectWithKeyboard({ context, prop, event, computed }) {
        const selection = computed("selection")
        const collection = prop("collection")

        if (event.shiftKey && computed("multiple") && event.anchorValue) {
          const next = selection.extendSelection(collection, event.anchorValue, event.value)
          invokeOnSelect(selection, next, prop("onSelect"))
          context.set("value", Array.from(next))
          return
        }

        if (prop("selectOnHighlight")) {
          const next = selection.replaceSelection(collection, event.value)
          invokeOnSelect(selection, next, prop("onSelect"))
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

        const next = selection.select(collection, event.value)
        invokeOnSelect(selection, next, prop("onSelect"))

        context.set("value", Array.from(next))
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

      syncSelectedItems({ context, prop }) {
        const collection = prop("collection")
        const prevSelectedItems = context.get("selectedItems")

        const value = context.get("value")
        const selectedItems = value.map((value) => {
          const item = prevSelectedItems.find((item) => collection.getItemValue(item) === value)
          return item || collection.find(value)
        })

        context.set("selectedItems", selectedItems)
      },

      syncHighlightedItem({ context, prop }) {
        const collection = prop("collection")
        const highlightedValue = context.get("highlightedValue")
        const highlightedItem = highlightedValue ? collection.find(highlightedValue) : null
        context.set("highlightedItem", highlightedItem)
      },

      syncHighlightedValue({ context, prop, refs }) {
        const collection = prop("collection")
        const highlightedValue = context.get("highlightedValue")
        const { autoHighlight } = refs.get("inputState")

        // when autoHighlight is enabled, always highlight first item on collection change
        if (autoHighlight) {
          queueMicrotask(() => {
            context.set("highlightedValue", prop("collection").firstValue ?? null)
          })
          return
        }

        // if highlighted value is no longer in collection, clear it
        if (highlightedValue != null && !collection.has(highlightedValue)) {
          queueMicrotask(() => {
            context.set("highlightedValue", null)
          })
        }
      },

      setFocused({ context }) {
        context.set("focused", true)
      },

      setDefaultHighlightedValue({ context, prop }) {
        const collection = prop("collection")
        const firstValue = collection.firstValue
        if (firstValue != null) {
          context.set("highlightedValue", firstValue)
        }
      },

      clearFocused({ context }) {
        context.set("focused", false)
      },

      setInputState({ refs, event }) {
        refs.set("inputState", { autoHighlight: !!event.autoHighlight, focused: true })
      },

      clearInputState({ refs }) {
        refs.set("inputState", { autoHighlight: false, focused: false })
      },
    },
  },
})

const diff = (a: Set<string>, b: Set<string>) => {
  const result = new Set(a)
  for (const item of b) result.delete(item)
  return result
}

function invokeOnSelect(current: Set<string>, next: Set<string>, onSelect?: (details: SelectionDetails) => void) {
  const added = diff(next, current)
  for (const item of added) {
    onSelect?.({ value: item })
  }
}
