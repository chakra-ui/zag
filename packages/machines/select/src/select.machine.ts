import { Collection } from "@zag-js/collection"
import { createMachine, guards, ref } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { getByTypeahead, raf } from "@zag-js/dom-query"
import { setElementValue, trackFormControl } from "@zag-js/form-utils"
import { observeAttributes } from "@zag-js/mutation-observer"
import { getPlacement } from "@zag-js/popper"
import { proxyTabFocus } from "@zag-js/tabbable"
import { addOrRemove, compact } from "@zag-js/utils"
import { dom } from "./select.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./select.types"

const { and, not } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "select",
      context: {
        items: [],
        value: [],
        highlightedValue: null,
        selectOnTab: false,
        loop: false,
        closeOnSelect: true,
        disabled: false,
        ...ctx,
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
        _itemCount: (ctx) => ctx.itemCount ?? ctx.items.length,
        collection: (ctx) =>
          new Collection({
            items: ctx.items,
            getItemKey: ctx.getItemKey,
            getItemLabel: ctx.getItemLabel,
            isItemDisabled: ctx.isItemDisabled,
          }),
        selectedItems: (ctx) => ctx.collection.getItems(ctx.value),
        highlightedItem: (ctx) => ctx.collection.getItem(ctx.highlightedValue),
      },

      initial: "idle",

      watch: {
        value: ["syncSelectElement"],
      },

      on: {
        HIGHLIGHT_OPTION: {
          actions: ["setHighlightedItem"],
        },
        SELECT_OPTION: {
          actions: ["selectItem"],
        },
        CLEAR_SELECTED: {
          actions: ["clearSelectedItems"],
        },
      },

      activities: ["trackFormControlState"],

      states: {
        idle: {
          tags: ["closed"],
          on: {
            TRIGGER_CLICK: {
              target: "open",
              actions: ["invokeOnOpen"],
            },
            TRIGGER_FOCUS: {
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
          entry: ["focusTrigger", "clearHighlightedItem"],
          on: {
            TRIGGER_BLUR: {
              target: "idle",
            },
            TRIGGER_CLICK: [
              { guard: "hasSelectedItems", target: "open", actions: ["invokeOnOpen"] },
              { target: "open", actions: ["highlightFirstItem", "invokeOnOpen"] },
            ],
            TRIGGER_KEY: [
              { guard: "hasSelectedItems", target: "open", actions: ["invokeOnOpen"] },
              { target: "open", actions: ["highlightFirstItem", "invokeOnOpen"] },
            ],
            ARROW_UP: [
              { guard: "hasSelectedItems", target: "open", actions: ["invokeOnOpen"] },
              { target: "open", actions: ["highlightLastItem", "invokeOnOpen"] },
            ],
            ARROW_DOWN: [
              { guard: "hasSelectedItems", target: "open", actions: ["invokeOnOpen"] },
              { target: "open", actions: ["highlightFirstItem", "invokeOnOpen"] },
            ],
            OPEN: {
              target: "open",
              actions: ["invokeOnOpen"],
            },
            ARROW_LEFT: [
              {
                guard: and(not("multiple"), "hasSelectedItems"),
                actions: ["selectPreviousItem"],
              },
              {
                guard: not("multiple"),
                actions: ["selectLastItem"],
              },
            ],
            ARROW_RIGHT: [
              {
                guard: and(not("multiple"), "hasSelectedItems"),
                actions: ["selectNextItem"],
              },
              {
                guard: not("multiple"),
                actions: ["selectFirstItem"],
              },
            ],
            HOME: {
              guard: not("multiple"),
              actions: ["selectFirstItem"],
            },
            END: {
              guard: not("multiple"),
              actions: ["selectLastItem"],
            },
            TYPEAHEAD: {
              guard: not("multiple"),
              actions: ["selectMatchingItem"],
            },
          },
        },

        open: {
          tags: ["open"],
          entry: ["focusContent", "highlightFirstSelectedItem"],
          exit: ["scrollContentToTop"],
          activities: ["trackInteractOutside", "computePlacement", "scrollToHighlightedItem", "proxyTabFocus"],
          on: {
            CLOSE: {
              target: "focused",
              actions: ["invokeOnClose"],
            },
            TRIGGER_CLICK: {
              target: "focused",
              actions: ["invokeOnClose"],
            },
            OPTION_CLICK: [
              {
                guard: "closeOnSelect",
                target: "focused",
                actions: ["selectHighlightedItem", "invokeOnClose"],
              },
              {
                actions: ["selectHighlightedItem"],
              },
            ],
            TRIGGER_KEY: [
              {
                guard: "closeOnSelect",
                target: "focused",
                actions: ["selectHighlightedItem", "invokeOnClose"],
              },
              {
                actions: ["selectHighlightedItem"],
              },
            ],
            BLUR: {
              target: "focused",
              actions: ["invokeOnClose"],
            },
            HOME: {
              actions: ["highlightFirstItem"],
            },
            END: {
              actions: ["highlightLastItem"],
            },
            ARROW_DOWN: [
              {
                guard: "hasHighlightedItem",
                actions: ["highlightNextOption"],
              },
              {
                actions: ["highlightFirstItem"],
              },
            ],
            ARROW_UP: [
              {
                guard: "hasHighlightedItem",
                actions: ["highlightPreviousItem"],
              },
              {
                actions: ["highlightLastItem"],
              },
            ],
            TYPEAHEAD: {
              actions: ["highlightMatchingItem"],
            },
            POINTER_MOVE: {
              actions: ["highlightItem"],
            },
            POINTER_LEAVE: {
              actions: ["clearHighlightedItem"],
            },
            TAB: [
              {
                guard: "selectOnTab",
                target: "idle",
                actions: ["selectHighlightedItem", "invokeOnClose", "clearHighlightedItem"],
              },
              {
                target: "idle",
                actions: ["invokeOnClose", "clearHighlightedItem"],
              },
            ],
          },
        },
      },
    },
    {
      guards: {
        hasSelectedItems: (ctx) => ctx.hasSelectedItems,
        hasHighlightedItem: (ctx) => ctx.highlightedValue != null,
        selectOnTab: (ctx) => !!ctx.selectOnTab,
        closeOnSelect: (ctx, evt) => !!(evt.closeOnSelect ?? ctx.closeOnSelect),
      },
      activities: {
        proxyTabFocus(ctx) {
          return proxyTabFocus(dom.getContentEl(ctx), {
            defer: true,
            triggerElement: dom.getTriggerEl(ctx),
            onFocus(el) {
              raf(() => el.focus({ preventScroll: true }))
            },
          })
        },
        trackFormControlState(ctx, _evt, { initialContext }) {
          return trackFormControl(dom.getHiddenSelectElement(ctx), {
            onFieldsetDisabledChange(disabled) {
              ctx.fieldsetDisabled = disabled
            },
            onFormReset() {
              set.selectedItems(ctx, initialContext.value)
            },
          })
        },
        trackInteractOutside(ctx, _evt, { send }) {
          let focusable = false
          return trackDismissableElement(dom.getContentEl(ctx), {
            defer: true,
            exclude: [dom.getTriggerEl(ctx)],
            onFocusOutside: ctx.onFocusOutside,
            onPointerDownOutside: ctx.onPointerDownOutside,
            onInteractOutside(event) {
              focusable = event.detail.focusable
              ctx.onInteractOutside?.(event)
            },
            onDismiss() {
              send({ type: "BLUR", src: "interact-outside", focusable })
            },
          })
        },
        computePlacement(ctx) {
          ctx.currentPlacement = ctx.positioning.placement
          return getPlacement(dom.getTriggerEl(ctx), dom.getPositionerEl(ctx), {
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
            if (state.event.type === "POINTER_MOVE") return
            const option = dom.getHighlightedOption(ctx)
            option?.scrollIntoView({ block: "nearest" })
          }

          raf(() => {
            exec()
          })

          return observeAttributes(dom.getContentEl(ctx), ["aria-activedescendant"], exec)
        },
      },
      actions: {
        highlightPreviousItem(ctx) {
          if (!ctx.highlightedValue) return
          const prevKey = ctx.collection.getKeysBefore(ctx.highlightedValue)
          set.highlightedItem(ctx, prevKey)
        },
        highlightNextOption(ctx) {
          if (!ctx.highlightedValue) return
          const nextKey = ctx.collection.getKeysAfter(ctx.highlightedValue)
          set.highlightedItem(ctx, nextKey)
        },
        highlightFirstItem(ctx) {
          const firstKey = ctx.collection.getFirstKey()
          set.highlightedItem(ctx, firstKey)
        },
        highlightLastItem(ctx) {
          const lastKey = ctx.collection.getLastKey()
          set.highlightedItem(ctx, lastKey)
        },
        focusContent(ctx) {
          raf(() => {
            dom.getContentEl(ctx)?.focus({ preventScroll: true })
          })
        },
        focusTrigger(ctx, evt) {
          if (evt.focusable) return
          raf(() => {
            dom.getTriggerEl(ctx)?.focus({ preventScroll: true })
          })
        },
        selectHighlightedItem(ctx, evt) {
          const key = evt.value ?? ctx.highlightedValue
          if (!key) return
          set.selectedItem(ctx, key)
        },
        highlightFirstSelectedItem(ctx) {
          if (!ctx.hasSelectedItems) return
          const firstItem = ctx.selectedItems[0]
          set.highlightedItem(ctx, firstItem?.value)
        },
        highlightItem(ctx, evt) {
          set.highlightedItem(ctx, evt.value)
        },
        highlightMatchingItem(ctx, evt) {
          const matchingKey = ctx.collection.getKeyForSearch({
            eventKey: evt.key,
            state: ctx.typeahead,
            fromKey: ctx.highlightedValue,
          })

          if (!matchingKey) return
          set.highlightedItem(ctx, matchingKey)
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
        clearSelectedItems(ctx) {
          set.selectedItems(ctx, [])
        },
        selectPreviousItem(ctx) {
          const prevKey = ctx.collection.getKeysBefore(ctx.value[0])
          set.selectedItem(ctx, prevKey)
        },
        selectNextItem(ctx) {
          const nextKey = ctx.collection.getKeysAfter(ctx.value[0])
          set.selectedItem(ctx, nextKey)
        },
        selectFirstItem(ctx) {
          const firstKey = ctx.collection.getFirstKey()
          set.selectedItem(ctx, firstKey)
        },
        selectLastItem(ctx) {
          const lastKey = ctx.collection.getLastKey()
          set.selectedItem(ctx, lastKey)
        },
        selectMatchingItem(ctx, evt) {
          const matchingKey = ctx.collection.getKeyForSearch({
            eventKey: evt.key,
            state: ctx.typeahead,
            fromKey: ctx.value[0],
          })
          if (!matchingKey) return
          set.selectedItem(ctx, matchingKey)
        },
        scrollContentToTop(ctx) {
          dom.getContentEl(ctx)?.scrollTo(0, 0)
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.(true)
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.(false)
        },
        syncSelectElement(ctx) {
          const node = dom.getHiddenSelectElement(ctx)
          if (!node) return
          const selectedValue = ctx.selectedItems.map((item) => item.value).join(",")
          setElementValue(node, selectedValue, { type: "HTMLSelectElement" })
        },
      },
      transformContext(ctx) {
        if (ctx.value) {
          ctx.value = ref(ctx.value)
        }
      },
    },
  )
}

function dispatchChangeEvent(ctx: MachineContext) {
  const node = dom.getHiddenSelectElement(ctx)
  if (!node) return
  const win = dom.getWin(ctx)
  const changeEvent = new win.Event("change", { bubbles: true })
  node.dispatchEvent(changeEvent)
}

const invoke = {
  change: (ctx: MachineContext) => {
    ctx.onChange?.({ value: ctx.value, items: ctx.selectedItems })
    dispatchChangeEvent(ctx)
  },
  highlightChange: (ctx: MachineContext) => {
    ctx.onHighlightChange?.({ value: ctx.highlightedValue, item: ctx.highlightedItem })
  },
}

const set = {
  selectedItem: (ctx: MachineContext, value: string | null | undefined, force = false) => {
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
    ctx.value = value
    invoke.change(ctx)
  },
  highlightedItem: (ctx: MachineContext, value: string | null | undefined, force = false) => {
    if (!value && !force) return
    ctx.highlightedValue = value || null
    invoke.highlightChange(ctx)
  },
}
