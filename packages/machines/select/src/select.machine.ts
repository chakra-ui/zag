import { createGuards, createMachine } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import {
  getByTypeahead,
  getInitialFocus,
  observeAttributes,
  raf,
  scrollIntoView,
  trackFormControl,
} from "@zag-js/dom-query"
import { getPlacement, type Placement } from "@zag-js/popper"
import { addOrRemove } from "@zag-js/utils"
import { collection } from "./select.collection"
import * as dom from "./select.dom"
import type { CollectionItem, SelectSchema } from "./select.types"

const { and, not, or } = createGuards<SelectSchema>()

export const machine = createMachine<SelectSchema>({
  props({ props }) {
    return {
      loopFocus: false,
      closeOnSelect: !props.multiple,
      composite: true,
      defaultValue: [],
      ...props,
      collection: props.collection ?? collection.empty(),
      positioning: {
        placement: "bottom-start",
        gutter: 8,
        ...props.positioning,
      },
    }
  },

  context({ prop, bindable }) {
    return {
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value) {
          const items = prop("collection").findMany(value)
          return prop("onValueChange")?.({ value, items })
        },
      })),
      highlightedValue: bindable<string | null>(() => ({
        defaultValue: prop("defaultHighlightedValue") || null,
        value: prop("highlightedValue"),
        onChange(value) {
          prop("onHighlightChange")?.({
            highlightedValue: value,
            highlightedItem: prop("collection").find(value),
            highlightedIndex: prop("collection").indexOf(value),
          })
        },
      })),
      currentPlacement: bindable<Placement | undefined>(() => ({
        defaultValue: undefined,
      })),
      fieldsetDisabled: bindable(() => ({
        defaultValue: false,
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
    isDisabled: ({ prop, context }) => !!prop("disabled") || !!context.get("fieldsetDisabled"),
    isInteractive: ({ prop }) => !(prop("disabled") || prop("readOnly")),
  },

  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen")
    return open ? "open" : "idle"
  },

  entry: ["syncSelectElement"],

  watch({ context, prop, track, action }) {
    track([() => context.get("value").toString()], () => {
      action(["syncSelectedItems", "syncSelectElement", "dispatchChangeEvent"])
    })
    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })
    track([() => context.get("highlightedValue")], () => {
      action(["syncHighlightedItem"])
    })
    track([() => prop("collection").getValues().toString()], () => {
      action(["syncCollection"])
    })
  },

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
      actions: ["clearSelectedItems", "focusTriggerEl"],
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
            actions: ["setInitialFocus", "highlightComputedLastItem"],
          },
          {
            guard: or("isTriggerArrowDownEvent", "isTriggerEnterEvent"),
            target: "open",
            actions: ["setInitialFocus", "highlightComputedFirstItem"],
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
            actions: ["setInitialFocus", "invokeOnOpen", "highlightComputedFirstItem"],
          },
        ],
        "TRIGGER.ARROW_UP": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setInitialFocus", "invokeOnOpen", "highlightComputedLastItem"],
          },
        ],
        "TRIGGER.ARROW_DOWN": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setInitialFocus", "invokeOnOpen", "highlightComputedFirstItem"],
          },
        ],
        "TRIGGER.ARROW_LEFT": [
          {
            guard: and(not("multiple"), "hasSelectedItems"),
            actions: ["selectPreviousItem"],
          },
          {
            guard: not("multiple"),
            actions: ["selectLastItem"],
          },
        ],
        "TRIGGER.ARROW_RIGHT": [
          {
            guard: and(not("multiple"), "hasSelectedItems"),
            actions: ["selectNextItem"],
          },
          {
            guard: not("multiple"),
            actions: ["selectFirstItem"],
          },
        ],
        "TRIGGER.HOME": {
          guard: not("multiple"),
          actions: ["selectFirstItem"],
        },
        "TRIGGER.END": {
          guard: not("multiple"),
          actions: ["selectLastItem"],
        },
        "TRIGGER.TYPEAHEAD": {
          guard: not("multiple"),
          actions: ["selectMatchingItem"],
        },
      },
    },

    open: {
      tags: ["open"],
      exit: ["scrollContentToTop"],
      effects: ["trackDismissableElement", "computePlacement", "scrollToHighlightedItem"],
      on: {
        "CONTROLLED.CLOSE": {
          target: "focused",
          actions: ["focusTriggerEl", "clearHighlightedItem"],
        },
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "focused",
            actions: ["invokeOnClose", "focusTriggerEl", "clearHighlightedItem"],
          },
        ],
        "TRIGGER.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "focused",
            actions: ["invokeOnClose", "clearHighlightedItem"],
          },
        ],
        "ITEM.CLICK": [
          {
            guard: and("closeOnSelect", "isOpenControlled"),
            actions: ["selectHighlightedItem", "invokeOnClose"],
          },
          {
            guard: "closeOnSelect",
            target: "focused",
            actions: ["selectHighlightedItem", "invokeOnClose", "focusTriggerEl", "clearHighlightedItem"],
          },
          {
            actions: ["selectHighlightedItem"],
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
            guard: and("hasHighlightedItem", "loop", "isLastItemHighlighted"),
            actions: ["highlightFirstItem"],
          },
          {
            guard: "hasHighlightedItem",
            actions: ["highlightNextItem"],
          },
          {
            actions: ["highlightFirstItem"],
          },
        ],
        "CONTENT.ARROW_UP": [
          {
            guard: and("hasHighlightedItem", "loop", "isFirstItemHighlighted"),
            actions: ["highlightLastItem"],
          },
          {
            guard: "hasHighlightedItem",
            actions: ["highlightPreviousItem"],
          },
          {
            actions: ["highlightLastItem"],
          },
        ],
        "CONTENT.TYPEAHEAD": {
          actions: ["highlightMatchingItem"],
        },
        "ITEM.POINTER_MOVE": {
          actions: ["highlightItem"],
        },
        "ITEM.POINTER_LEAVE": {
          actions: ["clearHighlightedItem"],
        },
        "POSITIONING.SET": {
          actions: ["reposition"],
        },
      },
    },
  },

  implementations: {
    guards: {
      loop: ({ prop }) => !!prop("loopFocus"),
      multiple: ({ prop }) => !!prop("multiple"),
      hasSelectedItems: ({ computed }) => !!computed("hasSelectedItems"),
      hasHighlightedItem: ({ context }) => context.get("highlightedValue") != null,
      isFirstItemHighlighted: ({ context, prop }) => context.get("highlightedValue") === prop("collection").firstValue,
      isLastItemHighlighted: ({ context, prop }) => context.get("highlightedValue") === prop("collection").lastValue,
      closeOnSelect: ({ prop, event }) => !!(event.closeOnSelect ?? prop("closeOnSelect")),
      // guard assertions (for controlled mode)
      isOpenControlled: ({ prop }) => prop("open") !== undefined,
      isTriggerClickEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.CLICK",
      isTriggerEnterEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ENTER",
      isTriggerArrowUpEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ARROW_UP",
      isTriggerArrowDownEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ARROW_DOWN",
    },

    effects: {
      trackFormControlState({ context, scope }) {
        return trackFormControl(dom.getHiddenSelectEl(scope), {
          onFieldsetDisabledChange(disabled) {
            context.set("fieldsetDisabled", disabled)
          },
          onFormReset() {
            const value = context.initial("value")
            context.set("value", value)
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
        const positioning = prop("positioning")
        context.set("currentPlacement", positioning.placement)
        const triggerEl = () => dom.getTriggerEl(scope)
        const positionerEl = () => dom.getPositionerEl(scope)
        return getPlacement(triggerEl, positionerEl, {
          defer: true,
          ...positioning,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },

      scrollToHighlightedItem({ context, prop, scope, event }) {
        const exec = (immediate: boolean) => {
          const highlightedValue = context.get("highlightedValue")
          if (highlightedValue == null) return

          // don't scroll into view if we're using the pointer
          if (event.current().type.includes("POINTER")) return

          const optionEl = dom.getItemEl(scope, highlightedValue)
          const contentEl = dom.getContentEl(scope)

          const scrollToIndexFn = prop("scrollToIndexFn")
          if (scrollToIndexFn) {
            const highlightedIndex = prop("collection").indexOf(highlightedValue)
            scrollToIndexFn?.({ index: highlightedIndex, immediate })
            return
          }

          scrollIntoView(optionEl, { rootEl: contentEl, block: "nearest" })
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

      toggleVisibility({ send, prop }) {
        send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE" })
      },

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

      setInitialFocus({ scope }) {
        raf(() => {
          const element = getInitialFocus({
            root: dom.getContentEl(scope),
          })
          element?.focus({ preventScroll: true })
        })
      },

      focusTriggerEl({ event, scope }) {
        const restoreFocus = event.restoreFocus ?? event.previousEvent?.restoreFocus
        if (restoreFocus != null && !restoreFocus) return
        raf(() => {
          const element = dom.getTriggerEl(scope)
          element?.focus({ preventScroll: true })
        })
      },

      selectHighlightedItem({ context, prop, event }) {
        let value = event.value ?? context.get("highlightedValue")
        if (value == null) return

        const nullable = prop("deselectable") && !prop("multiple") && context.get("value").includes(value)
        value = nullable ? null : value
        context.set("value", (prev) => {
          if (value == null) return []
          if (prop("multiple")) return addOrRemove(prev, value)
          return [value]
        })
      },

      highlightComputedFirstItem({ context, prop, computed }) {
        const collection = prop("collection")
        const value = computed("hasSelectedItems") ? collection.sort(context.get("value"))[0] : collection.firstValue
        context.set("highlightedValue", value)
      },

      highlightComputedLastItem({ context, prop, computed }) {
        const collection = prop("collection")
        const value = computed("hasSelectedItems") ? collection.sort(context.get("value"))[0] : collection.lastValue
        context.set("highlightedValue", value)
      },

      highlightFirstSelectedItem({ context, prop, computed }) {
        if (!computed("hasSelectedItems")) return
        const value = prop("collection").sort(context.get("value"))[0]
        context.set("highlightedValue", value)
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

      selectItem({ context, prop, event }) {
        const nullable = prop("deselectable") && !prop("multiple") && context.get("value").includes(event.value)
        const value = nullable ? null : event.value
        context.set("value", (prev) => {
          if (value == null) return []
          if (prop("multiple")) return addOrRemove(prev, value)
          return [value]
        })
      },

      clearItem({ context, event }) {
        context.set("value", (prev) => prev.filter((v) => v !== event.value))
      },

      setSelectedItems({ context, event }) {
        context.set("value", event.value)
      },

      clearSelectedItems({ context }) {
        context.set("value", [])
      },

      selectPreviousItem({ context, prop }) {
        const [firstItem] = context.get("value")
        const value = prop("collection").getPreviousValue(firstItem)
        if (value) context.set("value", [value])
      },

      selectNextItem({ context, prop }) {
        const [firstItem] = context.get("value")
        const value = prop("collection").getNextValue(firstItem)
        if (value) context.set("value", [value])
      },

      selectFirstItem({ context, prop }) {
        const value = prop("collection").firstValue
        if (value) context.set("value", [value])
      },

      selectLastItem({ context, prop }) {
        const value = prop("collection").lastValue
        if (value) context.set("value", [value])
      },

      selectMatchingItem({ context, prop, event, refs }) {
        const value = prop("collection").search(event.key, {
          state: refs.get("typeahead"),
          currentValue: context.get("value")[0],
        })
        if (value == null) return
        context.set("value", [value])
      },

      scrollContentToTop({ prop, scope }) {
        if (prop("scrollToIndexFn")) {
          prop("scrollToIndexFn")?.({ index: 0, immediate: true })
        } else {
          dom.getContentEl(scope)?.scrollTo(0, 0)
        }
      },

      invokeOnOpen({ prop }) {
        prop("onOpenChange")?.({ open: true })
      },

      invokeOnClose({ prop }) {
        prop("onOpenChange")?.({ open: false })
      },

      syncSelectElement({ context, prop, scope }) {
        const selectEl = dom.getHiddenSelectEl(scope)
        if (!selectEl) return

        if (context.get("value").length === 0 && !prop("multiple")) {
          selectEl.selectedIndex = -1
          return
        }

        for (const option of selectEl.options) {
          option.selected = context.get("value").includes(option.value)
        }
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

      dispatchChangeEvent({ scope }) {
        queueMicrotask(() => {
          const node = dom.getHiddenSelectEl(scope)
          if (!node) return
          const win = scope.getWin()
          const changeEvent = new win.Event("change", { bubbles: true, composed: true })
          node.dispatchEvent(changeEvent)
        })
      },
    },
  },
})
