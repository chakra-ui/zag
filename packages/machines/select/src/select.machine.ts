import { createMachine, guards } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { getByTypeahead, getInitialFocus, observeAttributes, raf, scrollIntoView } from "@zag-js/dom-query"
import { trackFormControl } from "@zag-js/form-utils"
import { getPlacement } from "@zag-js/popper"
import { addOrRemove, compact, isEqual } from "@zag-js/utils"
import { collection } from "./select.collection"
import { dom } from "./select.dom"
import type { CollectionItem, MachineContext, MachineState, UserDefinedContext } from "./select.types"

const { and, not, or } = guards

export function machine<T extends CollectionItem>(userContext: UserDefinedContext<T>) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "select",
      context: {
        value: [],
        highlightedValue: null,
        loopFocus: false,
        closeOnSelect: !ctx.multiple,
        disabled: false,
        readOnly: false,
        composite: true,
        ...ctx,
        highlightedItem: null,
        selectedItems: [],
        valueAsString: "",
        collection: ctx.collection ?? collection.empty(),
        typeahead: getByTypeahead.defaultOptions,
        fieldsetDisabled: false,
        restoreFocus: true,
        positioning: {
          placement: "bottom-start",
          gutter: 8,
          ...ctx.positioning,
        },
      },

      computed: {
        hasSelectedItems: (ctx) => ctx.value.length > 0,
        isTypingAhead: (ctx) => ctx.typeahead.keysSoFar !== "",
        isDisabled: (ctx) => !!ctx.disabled || ctx.fieldsetDisabled,
        isInteractive: (ctx) => !(ctx.isDisabled || ctx.readOnly),
      },

      initial: ctx.open ? "open" : "idle",

      created: ["syncCollection"],

      entry: ["syncSelectElement"],

      watch: {
        open: ["toggleVisibility"],
        value: ["syncSelectedItems", "syncSelectElement"],
        highlightedValue: ["syncHighlightedItem"],
        collection: ["syncCollection"],
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
        "COLLECTION.SET": {
          actions: ["setCollection"],
        },
      },

      activities: ["trackFormControlState"],

      states: {
        idle: {
          tags: ["closed"],
          on: {
            "CONTROLLED.OPEN": [
              {
                guard: "isTriggerClickEvent",
                target: "open",
                actions: ["highlightFirstSelectedItem"],
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
                actions: ["invokeOnOpen", "highlightFirstSelectedItem"],
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
          entry: ["focusTriggerEl"],
          on: {
            "CONTROLLED.OPEN": [
              {
                guard: "isTriggerClickEvent",
                target: "open",
                actions: ["highlightFirstSelectedItem"],
              },
              {
                guard: "isTriggerArrowUpEvent",
                target: "open",
                actions: ["highlightComputedLastItem"],
              },
              {
                guard: or("isTriggerArrowDownEvent", "isTriggerEnterEvent"),
                target: "open",
                actions: ["highlightComputedFirstItem"],
              },
              {
                target: "open",
              },
            ],
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
                actions: ["invokeOnOpen", "highlightFirstSelectedItem"],
              },
            ],
            "TRIGGER.ENTER": [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["invokeOnOpen", "highlightComputedFirstItem"],
              },
            ],
            "TRIGGER.ARROW_UP": [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["invokeOnOpen", "highlightComputedLastItem"],
              },
            ],
            "TRIGGER.ARROW_DOWN": [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["invokeOnOpen", "highlightComputedFirstItem"],
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
          entry: ["setInitialFocus"],
          exit: ["scrollContentToTop"],
          activities: ["trackDismissableElement", "computePlacement", "scrollToHighlightedItem"],
          on: {
            "CONTROLLED.CLOSE": [
              {
                guard: "shouldRestoreFocus",
                target: "focused",
                actions: ["clearHighlightedItem"],
              },
              {
                target: "idle",
                actions: ["clearHighlightedItem"],
              },
            ],
            CLOSE: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnClose"],
              },
              {
                target: "focused",
                actions: ["invokeOnClose", "clearHighlightedItem"],
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
                actions: ["selectHighlightedItem", "invokeOnClose", "clearHighlightedItem"],
              },
              {
                actions: ["selectHighlightedItem"],
              },
            ],
            "CONTENT.INTERACT_OUTSIDE": [
              // == group 1 ==
              {
                guard: and("shouldRestoreFocus", "isOpenControlled"),
                actions: ["invokeOnClose"],
              },
              {
                guard: "shouldRestoreFocus",
                target: "focused",
                actions: ["invokeOnClose", "clearHighlightedItem"],
              },

              // == group 2 ==
              {
                guard: "isOpenControlled",
                actions: ["invokeOnClose"],
              },
              {
                target: "idle",
                actions: ["invokeOnClose", "clearHighlightedItem"],
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
    },
    {
      guards: {
        loop: (ctx) => !!ctx.loopFocus,
        multiple: (ctx) => !!ctx.multiple,
        hasSelectedItems: (ctx) => !!ctx.hasSelectedItems,
        hasHighlightedItem: (ctx) => ctx.highlightedValue != null,
        isFirstItemHighlighted: (ctx) => ctx.highlightedValue === ctx.collection.firstValue,
        isLastItemHighlighted: (ctx) => ctx.highlightedValue === ctx.collection.lastValue,
        closeOnSelect: (ctx, evt) => !!(evt.closeOnSelect ?? ctx.closeOnSelect),
        shouldRestoreFocus: (ctx) => !!ctx.restoreFocus,
        // guard assertions (for controlled mode)
        isOpenControlled: (ctx) => !!ctx["open.controlled"],
        isTriggerClickEvent: (_ctx, evt) => evt.previousEvent?.type === "TRIGGER.CLICK",
        isTriggerEnterEvent: (_ctx, evt) => evt.previousEvent?.type === "TRIGGER.ENTER",
        isTriggerArrowUpEvent: (_ctx, evt) => evt.previousEvent?.type === "TRIGGER.ARROW_UP",
        isTriggerArrowDownEvent: (_ctx, evt) => evt.previousEvent?.type === "TRIGGER.ARROW_DOWN",
      },
      activities: {
        trackFormControlState(ctx, _evt, { initialContext }) {
          return trackFormControl(dom.getHiddenSelectEl(ctx), {
            onFieldsetDisabledChange(disabled) {
              ctx.fieldsetDisabled = disabled
            },
            onFormReset() {
              set.selectedItems(ctx, initialContext.value)
            },
          })
        },
        trackDismissableElement(ctx, _evt, { send }) {
          const contentEl = () => dom.getContentEl(ctx)
          return trackDismissableElement(contentEl, {
            defer: true,
            exclude: [dom.getTriggerEl(ctx), dom.getClearTriggerEl(ctx)],
            onFocusOutside: ctx.onFocusOutside,
            onPointerDownOutside: ctx.onPointerDownOutside,
            onInteractOutside(event) {
              ctx.onInteractOutside?.(event)
              ctx.restoreFocus = !event.detail.focusable
            },
            onDismiss() {
              send({ type: "CONTENT.INTERACT_OUTSIDE" })
            },
          })
        },
        computePlacement(ctx) {
          ctx.currentPlacement = ctx.positioning.placement
          const triggerEl = () => dom.getTriggerEl(ctx)
          const positionerEl = () => dom.getPositionerEl(ctx)
          return getPlacement(triggerEl, positionerEl, {
            defer: true,
            ...ctx.positioning,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        scrollToHighlightedItem(ctx, _evt, { getState }) {
          const exec = (immediate: boolean) => {
            if (ctx.highlightedValue == null) return
            const state = getState()

            // don't scroll into view if we're using the pointer
            if (state.event.type.includes("POINTER")) return

            const optionEl = dom.getHighlightedOptionEl(ctx)
            const contentEl = dom.getContentEl(ctx)

            if (ctx.scrollToIndexFn) {
              const highlightedIndex = ctx.collection.indexOf(ctx.highlightedValue)
              ctx.scrollToIndexFn({ index: highlightedIndex, immediate })
              return
            }

            scrollIntoView(optionEl, { rootEl: contentEl, block: "nearest" })
          }

          raf(() => exec(true))

          const contentEl = () => dom.getContentEl(ctx)
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
        reposition(ctx, evt) {
          const positionerEl = () => dom.getPositionerEl(ctx)
          getPlacement(dom.getTriggerEl(ctx), positionerEl, {
            ...ctx.positioning,
            ...evt.options,
            defer: true,
            listeners: false,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        toggleVisibility(ctx, evt, { send }) {
          send({ type: ctx.open ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: evt })
        },
        highlightPreviousItem(ctx) {
          if (ctx.highlightedValue == null) return
          const value = ctx.collection.getPreviousValue(ctx.highlightedValue)
          set.highlightedItem(ctx, value)
        },
        highlightNextItem(ctx) {
          if (ctx.highlightedValue == null) return
          const value = ctx.collection.getNextValue(ctx.highlightedValue)
          set.highlightedItem(ctx, value)
        },
        highlightFirstItem(ctx) {
          const value = ctx.collection.firstValue
          set.highlightedItem(ctx, value)
        },
        highlightLastItem(ctx) {
          const value = ctx.collection.lastValue
          set.highlightedItem(ctx, value)
        },
        setInitialFocus(ctx) {
          raf(() => {
            const element = getInitialFocus({
              root: dom.getContentEl(ctx),
            })
            element?.focus({ preventScroll: true })
          })
        },
        focusTriggerEl(ctx) {
          raf(() => {
            dom.getTriggerEl(ctx)?.focus({ preventScroll: true })
          })
        },
        selectHighlightedItem(ctx, evt) {
          const value = evt.value ?? ctx.highlightedValue
          if (value == null) return
          set.selectedItem(ctx, value)
        },
        highlightComputedFirstItem(ctx) {
          const value = ctx.hasSelectedItems ? ctx.collection.sort(ctx.value)[0] : ctx.collection.firstValue
          set.highlightedItem(ctx, value)
        },
        highlightComputedLastItem(ctx) {
          const value = ctx.hasSelectedItems ? ctx.collection.sort(ctx.value)[0] : ctx.collection.lastValue
          set.highlightedItem(ctx, value)
        },
        highlightFirstSelectedItem(ctx) {
          if (!ctx.hasSelectedItems) return
          const [value] = ctx.collection.sort(ctx.value)
          set.highlightedItem(ctx, value)
        },
        highlightItem(ctx, evt) {
          set.highlightedItem(ctx, evt.value)
        },
        highlightMatchingItem(ctx, evt) {
          const value = ctx.collection.search(evt.key, {
            state: ctx.typeahead,
            currentValue: ctx.highlightedValue,
          })

          if (value == null) return
          set.highlightedItem(ctx, value)
        },
        setHighlightedItem(ctx, evt) {
          set.highlightedItem(ctx, evt.value)
        },
        clearHighlightedItem(ctx) {
          set.highlightedItem(ctx, null, true)
        },
        selectItem(ctx, evt) {
          set.selectedItem(ctx, evt.value)
        },
        clearItem(ctx, evt) {
          const value = ctx.value.filter((v) => v !== evt.value)
          set.selectedItems(ctx, value)
        },
        setSelectedItems(ctx, evt) {
          set.selectedItems(ctx, evt.value)
        },
        clearSelectedItems(ctx) {
          set.selectedItems(ctx, [])
        },
        selectPreviousItem(ctx) {
          const value = ctx.collection.getPreviousValue(ctx.value[0])
          set.selectedItem(ctx, value)
        },
        selectNextItem(ctx) {
          const value = ctx.collection.getNextValue(ctx.value[0])
          set.selectedItem(ctx, value)
        },
        selectFirstItem(ctx) {
          const value = ctx.collection.firstValue
          set.selectedItem(ctx, value)
        },
        selectLastItem(ctx) {
          const value = ctx.collection.lastValue
          set.selectedItem(ctx, value)
        },
        selectMatchingItem(ctx, evt) {
          const value = ctx.collection.search(evt.key, {
            state: ctx.typeahead,
            currentValue: ctx.value[0],
          })
          if (value == null) return
          set.selectedItem(ctx, value)
        },
        scrollContentToTop(ctx) {
          if (ctx.scrollToIndexFn) {
            ctx.scrollToIndexFn({ index: 0, immediate: true })
          } else {
            dom.getContentEl(ctx)?.scrollTo(0, 0)
          }
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.({ open: true })
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.({ open: false })
        },
        syncSelectElement(ctx) {
          const selectEl = dom.getHiddenSelectEl(ctx)
          if (!selectEl) return

          if (ctx.value.length === 0 && !ctx.multiple) {
            selectEl.selectedIndex = -1
            return
          }

          for (const option of selectEl.options) {
            option.selected = ctx.value.includes(option.value)
          }
        },
        setCollection(ctx, evt) {
          ctx.collection = evt.value
        },
        syncCollection(ctx) {
          const selectedItems = ctx.collection.findMany(ctx.value)
          const valueAsString = ctx.collection.stringifyItems(selectedItems)

          ctx.highlightedItem = ctx.collection.find(ctx.highlightedValue)
          ctx.selectedItems = selectedItems
          ctx.valueAsString = valueAsString
        },
        syncSelectedItems(ctx) {
          sync.valueChange(ctx)
        },
        syncHighlightedItem(ctx) {
          sync.highlightChange(ctx)
        },
      },
    },
  )
}

function dispatchChangeEvent(ctx: MachineContext) {
  raf(() => {
    const node = dom.getHiddenSelectEl(ctx)
    if (!node) return
    const win = dom.getWin(ctx)
    const changeEvent = new win.Event("change", { bubbles: true, composed: true })
    node.dispatchEvent(changeEvent)
  })
}

const sync = {
  valueChange: (ctx: MachineContext) => {
    const prevSelectedItems = ctx.selectedItems
    ctx.selectedItems = ctx.value.map((value) => {
      const foundItem = prevSelectedItems.find((item) => ctx.collection.getItemValue(item) === value)
      if (foundItem) return foundItem
      return ctx.collection.find(value)
    })
    ctx.valueAsString = ctx.collection.stringifyItems(ctx.selectedItems)
  },

  highlightChange: (ctx: MachineContext) => {
    ctx.highlightedItem = ctx.collection.find(ctx.highlightedValue)
  },
}

const invoke = {
  valueChange: (ctx: MachineContext) => {
    sync.valueChange(ctx)
    ctx.onValueChange?.({
      value: Array.from(ctx.value),
      items: Array.from(ctx.selectedItems),
    })
    dispatchChangeEvent(ctx)
  },
  highlightChange: (ctx: MachineContext) => {
    sync.highlightChange(ctx)
    ctx.onHighlightChange?.({
      highlightedValue: ctx.highlightedValue,
      highlightedItem: ctx.highlightedItem,
      highlightedIndex: ctx.collection.indexOf(ctx.highlightedValue),
    })
  },
}

const set = {
  selectedItem: (ctx: MachineContext, value: string | null | undefined, force = false) => {
    if (isEqual(ctx.value, value)) return

    if (value == null && !force) return

    if (value == null && force) {
      ctx.value = []
      invoke.valueChange(ctx)
      return
    }

    ctx.value = ctx.multiple ? addOrRemove(ctx.value, value!) : [value!]
    invoke.valueChange(ctx)
  },
  selectedItems: (ctx: MachineContext, value: string[]) => {
    if (isEqual(ctx.value, value)) return

    ctx.value = value
    invoke.valueChange(ctx)
  },
  highlightedItem: (ctx: MachineContext, value: string | null | undefined, force = false) => {
    if (isEqual(ctx.highlightedValue, value)) return

    if (value == null && !force) return
    ctx.highlightedValue = value ?? null

    invoke.highlightChange(ctx)
  },
}
