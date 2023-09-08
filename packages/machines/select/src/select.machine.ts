import { createMachine, guards } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { getByTypeahead, raf } from "@zag-js/dom-query"
import { setElementValue, trackFormControl } from "@zag-js/form-utils"
import { observeAttributes } from "@zag-js/mutation-observer"
import { getPlacement } from "@zag-js/popper"
import { proxyTabFocus } from "@zag-js/tabbable"
import { addOrRemove, compact, isEqual } from "@zag-js/utils"
import { collection } from "./select.collection"
import { dom } from "./select.dom"
import type { CollectionItem, MachineContext, MachineState, UserDefinedContext } from "./select.types"

const { and, not } = guards

export function machine<T extends CollectionItem>(userContext: UserDefinedContext<T>) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "select",
      context: {
        value: [],
        highlightedValue: null,
        selectOnBlur: false,
        loop: false,
        closeOnSelect: true,
        disabled: false,
        ...ctx,
        collection: ctx.collection ?? collection.empty(),
        typeahead: getByTypeahead.defaultOptions,
        fieldsetDisabled: false,
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
        selectedItems: (ctx) => ctx.collection.items(ctx.value),
        highlightedItem: (ctx) => ctx.collection.item(ctx.highlightedValue),
        valueAsString: (ctx) => ctx.collection.itemsToString(ctx.selectedItems),
      },

      initial: "idle",

      watch: {
        open: ["toggleVisibility"],
        value: ["syncSelectElement"],
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
        "COLLECTION.SET": {
          actions: ["setCollection"],
        },
      },

      activities: ["trackFormControlState"],

      states: {
        idle: {
          tags: ["closed"],
          on: {
            "TRIGGER.CLICK": {
              target: "open",
              actions: ["invokeOnOpen", "highlightFirstSelectedItem"],
            },
            "TRIGGER.FOCUS": {
              target: "focused",
            },
            OPEN: {
              target: "open",
              actions: ["invokeOnOpen"],
            },
          },
        },

        focused: {
          tags: ["closed"],
          entry: ["focusTriggerEl"],
          on: {
            OPEN: {
              target: "open",
              actions: ["invokeOnOpen"],
            },
            "TRIGGER.BLUR": {
              target: "idle",
            },
            "TRIGGER.CLICK": {
              target: "open",
              actions: ["invokeOnOpen", "highlightFirstSelectedItem"],
            },
            "TRIGGER.ENTER": [
              {
                guard: "hasSelectedItems",
                target: "open",
                actions: ["highlightFirstSelectedItem", "invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["highlightFirstItem", "invokeOnOpen"],
              },
            ],
            "TRIGGER.ARROW_UP": [
              {
                guard: "hasSelectedItems",
                target: "open",
                actions: ["highlightFirstSelectedItem", "invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["highlightLastItem", "invokeOnOpen"],
              },
            ],
            "TRIGGER.ARROW_DOWN": [
              {
                guard: "hasSelectedItems",
                target: "open",
                actions: ["highlightFirstSelectedItem", "invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["highlightFirstItem", "invokeOnOpen"],
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
          entry: ["focusContentEl"],
          exit: ["scrollContentToTop"],
          activities: ["trackDismissableElement", "computePlacement", "scrollToHighlightedItem", "proxyTabFocus"],
          on: {
            CLOSE: {
              target: "focused",
              actions: ["clearHighlightedItem", "invokeOnClose"],
            },
            "TRIGGER.CLICK": {
              target: "focused",
              actions: ["clearHighlightedItem", "invokeOnClose"],
            },
            "ITEM.CLICK": [
              {
                guard: "closeOnSelect",
                target: "focused",
                actions: ["selectHighlightedItem", "clearHighlightedItem", "invokeOnClose"],
              },
              {
                guard: "multiple",
                actions: ["selectHighlightedItem"],
              },
              {
                actions: ["selectHighlightedItem", "clearHighlightedItem"],
              },
            ],
            "CONTENT.ENTER": [
              {
                guard: "closeOnSelect",
                target: "focused",
                actions: ["selectHighlightedItem", "clearHighlightedItem", "invokeOnClose"],
              },
              {
                guard: "multiple",
                actions: ["selectHighlightedItem"],
              },
              {
                actions: ["selectHighlightedItem", "clearHighlightedItem"],
              },
            ],
            "CONTENT.INTERACT_OUTSIDE": [
              {
                guard: and("selectOnBlur", "hasHighlightedItem"),
                target: "idle",
                actions: ["selectHighlightedItem", "invokeOnClose", "clearHighlightedItem"],
              },
              {
                guard: "isTargetFocusable",
                target: "idle",
                actions: ["clearHighlightedItem", "invokeOnClose"],
              },
              {
                target: "focused",
                actions: ["clearHighlightedItem", "invokeOnClose"],
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
                guard: "hasHighlightedItem",
                actions: ["highlightNextItem"],
              },
              {
                actions: ["highlightFirstItem"],
              },
            ],
            "CONTENT.ARROW_UP": [
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
          },
        },
      },
    },
    {
      guards: {
        multiple: (ctx) => !!ctx.multiple,
        hasSelectedItems: (ctx) => ctx.hasSelectedItems,
        hasHighlightedItem: (ctx) => ctx.highlightedValue != null,
        selectOnBlur: (ctx) => !!ctx.selectOnBlur,
        closeOnSelect: (ctx, evt) => {
          if (ctx.multiple) return false
          return !!(evt.closeOnSelect ?? ctx.closeOnSelect)
        },
        isTargetFocusable: (_ctx, evt) => !!evt.focusable,
      },
      activities: {
        proxyTabFocus(ctx) {
          const contentEl = () => dom.getContentEl(ctx)
          return proxyTabFocus(contentEl, {
            defer: true,
            triggerElement: dom.getTriggerEl(ctx),
            onFocus(el) {
              raf(() => el.focus({ preventScroll: true }))
            },
          })
        },
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
          let focusable = false
          const contentEl = () => dom.getContentEl(ctx)
          return trackDismissableElement(contentEl, {
            defer: true,
            exclude: [dom.getTriggerEl(ctx), dom.getClearTriggerEl(ctx)],
            onFocusOutside: ctx.onFocusOutside,
            onPointerDownOutside: ctx.onPointerDownOutside,
            onInteractOutside(event) {
              focusable = event.detail.focusable
              ctx.onInteractOutside?.(event)
            },
            onDismiss() {
              send({ type: "CONTENT.INTERACT_OUTSIDE", focusable })
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
          const exec = () => {
            const state = getState()

            // don't scroll into view if we're using the pointer
            if (state.event.type.startsWith("ITEM.POINTER")) return

            const optionEl = dom.getHighlightedOptionEl(ctx)
            optionEl?.scrollIntoView({ block: "nearest" })
          }

          raf(() => {
            exec()
          })

          return observeAttributes(dom.getContentEl(ctx), ["aria-activedescendant"], exec)
        },
      },
      actions: {
        toggleVisibility(ctx, _evt, { send }) {
          send({ type: ctx.open ? "OPEN" : "CLOSE", src: "controlled" })
        },
        highlightPreviousItem(ctx) {
          if (ctx.highlightedValue == null) return
          const value = ctx.collection.prev(ctx.highlightedValue)
          set.highlightedItem(ctx, value)
        },
        highlightNextItem(ctx) {
          if (ctx.highlightedValue == null) return
          const value = ctx.collection.next(ctx.highlightedValue)
          set.highlightedItem(ctx, value)
        },
        highlightFirstItem(ctx) {
          const value = ctx.collection.first()
          set.highlightedItem(ctx, value)
        },
        highlightLastItem(ctx) {
          const value = ctx.collection.last()
          set.highlightedItem(ctx, value)
        },
        focusContentEl(ctx) {
          raf(() => {
            dom.getContentEl(ctx)?.focus({ preventScroll: true })
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
          const value = ctx.collection.prev(ctx.value[0])
          set.selectedItem(ctx, value)
        },
        selectNextItem(ctx) {
          const value = ctx.collection.next(ctx.value[0])
          set.selectedItem(ctx, value)
        },
        selectFirstItem(ctx) {
          const value = ctx.collection.first()
          set.selectedItem(ctx, value)
        },
        selectLastItem(ctx) {
          const value = ctx.collection.last()
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
          dom.getContentEl(ctx)?.scrollTo(0, 0)
        },
        invokeOnOpen(ctx) {
          ctx.onOpen?.()
        },
        invokeOnClose(ctx) {
          ctx.onClose?.()
        },
        syncSelectElement(ctx) {
          const selectEl = dom.getHiddenSelectEl(ctx)
          if (!selectEl) return
          setElementValue(selectEl, ctx.value.join(","), { type: "HTMLSelectElement" })
        },
        setCollection(ctx, evt) {
          ctx.collection = evt.value
        },
      },
    },
  )
}

function dispatchChangeEvent(ctx: MachineContext) {
  const node = dom.getHiddenSelectEl(ctx)
  if (!node) return
  const win = dom.getWin(ctx)
  const changeEvent = new win.Event("change", { bubbles: true })
  node.dispatchEvent(changeEvent)
}

const invoke = {
  change: (ctx: MachineContext) => {
    ctx.onChange?.({ value: Array.from(ctx.value), items: ctx.selectedItems })
    dispatchChangeEvent(ctx)
  },
  highlightChange: (ctx: MachineContext) => {
    ctx.onHighlight?.({ value: ctx.highlightedValue, item: ctx.highlightedItem })
  },
}

const set = {
  selectedItem: (ctx: MachineContext, value: string | null | undefined, force = false) => {
    if (isEqual(ctx.value, value)) return

    if (value == null && !force) return

    if (value == null && force) {
      ctx.value = []
      invoke.change(ctx)
      return
    }

    const nextValue = ctx.multiple ? addOrRemove(ctx.value, value!) : [value!]
    ctx.value = nextValue
    invoke.change(ctx)
  },
  selectedItems: (ctx: MachineContext, value: string[]) => {
    if (isEqual(ctx.value, value)) return

    ctx.value = value
    invoke.change(ctx)
  },
  highlightedItem: (ctx: MachineContext, value: string | null | undefined, force = false) => {
    if (isEqual(ctx.highlightedValue, value)) return

    if (value == null && !force) return
    ctx.highlightedValue = value ?? null

    invoke.highlightChange(ctx)
  },
}
