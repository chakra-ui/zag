import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine, guards } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { raf, scrollIntoView } from "@zag-js/dom-query"
import { observeAttributes, observeChildren } from "@zag-js/mutation-observer"
import { getPlacement } from "@zag-js/popper"
import { addOrRemove, compact, isEqual, match } from "@zag-js/utils"
import { collection } from "./combobox.collection"
import { dom } from "./combobox.dom"
import type { CollectionItem, MachineContext, MachineState, UserDefinedContext } from "./combobox.types"

const { and, not } = guards

const KEYDOWN_EVENT_REGEX = /(ARROW_UP|ARROW_DOWN|HOME|END|ENTER|ESCAPE)/

export function machine<T extends CollectionItem>(userContext: UserDefinedContext<T>) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "combobox",
      initial: ctx.autoFocus ? "focused" : "idle",
      context: {
        loop: true,
        openOnClick: false,
        composing: false,
        value: [],
        highlightedValue: null,
        inputValue: "",
        allowCustomValue: false,
        closeOnSelect: true,
        inputBehavior: "none",
        selectionBehavior: "replace",
        ...ctx,
        highlightedItem: null,
        selectedItems: [],
        valueAsString: "",
        collection: ctx.collection ?? collection.empty(),
        positioning: {
          placement: "bottom",
          flip: false,
          sameWidth: true,
          ...ctx.positioning,
        },
        translations: {
          triggerLabel: "Toggle suggestions",
          clearTriggerLabel: "Clear value",
          ...ctx.translations,
        },
      },

      created: ["initialize"],

      computed: {
        isInputValueEmpty: (ctx) => ctx.inputValue.length === 0,
        isInteractive: (ctx) => !(ctx.readOnly || ctx.disabled),
        autoComplete: (ctx) => ctx.inputBehavior === "autocomplete",
        autoHighlight: (ctx) => ctx.inputBehavior === "autohighlight",
        hasSelectedItems: (ctx) => ctx.value.length > 0,
      },

      watch: {
        value: ["syncSelectedItems"],
        inputValue: ["syncInputValue"],
        highlightedValue: ["autofillInputValue"],
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
        "INPUT_VALUE.SET": {
          actions: "setInputValue",
        },
        "VALUE.CLEAR": {
          target: "focused",
          actions: ["clearInputValue", "clearSelectedItems"],
        },
        "INPUT.COMPOSITION_START": {
          actions: ["setIsComposing"],
        },
        "INPUT.COMPOSITION_END": {
          actions: ["clearIsComposing"],
        },
        "COLLECTION.SET": {
          actions: ["setCollection"],
        },
        "POSITIONING.SET": {
          actions: ["reposition"],
        },
      },

      states: {
        idle: {
          tags: ["idle", "closed"],
          entry: ["scrollContentToTop", "clearHighlightedItem"],
          on: {
            "TRIGGER.CLICK": {
              target: "interacting",
              actions: ["focusInput", "highlightFirstSelectedItem", "invokeOnOpen"],
            },
            "INPUT.CLICK": {
              guard: "openOnClick",
              target: "interacting",
              actions: ["highlightFirstSelectedItem", "invokeOnOpen"],
            },
            "INPUT.FOCUS": {
              target: "focused",
            },
            OPEN: {
              target: "interacting",
              actions: ["invokeOnOpen"],
            },
          },
        },

        focused: {
          tags: ["focused", "closed"],
          entry: ["focusInput", "scrollContentToTop", "clearHighlightedItem"],
          on: {
            "INPUT.CHANGE": {
              target: "suggesting",
              actions: "setInputValue",
            },
            "LAYER.INTERACT_OUTSIDE": {
              target: "idle",
            },
            "INPUT.ESCAPE": {
              guard: and("isCustomValue", not("allowCustomValue")),
              actions: "revertInputValue",
            },
            "INPUT.BLUR": {
              target: "idle",
            },
            "INPUT.CLICK": {
              guard: "openOnClick",
              target: "interacting",
              actions: ["highlightFirstSelectedItem", "invokeOnOpen"],
            },
            "TRIGGER.CLICK": {
              target: "interacting",
              actions: ["focusInput", "highlightFirstSelectedItem", "invokeOnOpen"],
            },
            "INPUT.ARROW_DOWN": [
              {
                guard: "autoComplete",
                target: "interacting",
                actions: ["invokeOnOpen"],
              },
              {
                guard: "hasSelectedItems",
                target: "interacting",
                actions: ["highlightFirstSelectedItem", "invokeOnOpen"],
              },
              {
                target: "interacting",
                actions: ["highlightFirstItem", "invokeOnOpen"],
              },
            ],
            "INPUT.ARROW_DOWN+ALT": {
              target: "interacting",
              actions: "invokeOnOpen",
            },
            "INPUT.ARROW_UP": [
              {
                guard: "autoComplete",
                target: "interacting",
                actions: "invokeOnOpen",
              },
              {
                guard: "hasSelectedItems",
                target: "interacting",
                actions: ["highlightFirstSelectedItem", "invokeOnOpen"],
              },
              {
                target: "interacting",
                actions: ["highlightLastItem", "invokeOnOpen"],
              },
            ],
            OPEN: {
              target: "interacting",
              actions: ["invokeOnOpen"],
            },
          },
        },

        interacting: {
          tags: ["open", "focused"],
          activities: ["scrollIntoView", "trackDismissableLayer", "computePlacement", "hideOtherElements"],
          on: {
            "INPUT.HOME": {
              actions: ["highlightFirstItem"],
            },
            "INPUT.END": {
              actions: ["highlightLastItem"],
            },
            "INPUT.ARROW_DOWN": [
              {
                guard: and("autoComplete", "isLastItemHighlighted"),
                actions: ["clearHighlightedItem", "scrollContentToTop"],
              },
              {
                actions: ["highlightNextItem"],
              },
            ],
            "INPUT.ARROW_UP": [
              {
                guard: and("autoComplete", "isFirstItemHighlighted"),
                actions: "clearHighlightedItem",
              },
              {
                actions: "highlightPrevItem",
              },
            ],
            "INPUT.ARROW_UP+ALT": {
              target: "focused",
            },
            "INPUT.ENTER": [
              {
                guard: not("closeOnSelect"),
                actions: ["selectHighlightedItem"],
              },
              {
                target: "focused",
                actions: ["selectHighlightedItem", "invokeOnClose"],
              },
            ],
            "INPUT.CHANGE": [
              {
                guard: "autoComplete",
                target: "suggesting",
                actions: ["setInputValue"],
              },
              {
                target: "suggesting",
                actions: ["clearHighlightedItem", "setInputValue"],
              },
            ],
            "ITEM.POINTER_OVER": {
              actions: ["setHighlightedItem"],
            },
            "ITEM.POINTER_LEAVE": {
              actions: ["clearHighlightedItem"],
            },
            "ITEM.CLICK": [
              {
                guard: not("closeOnSelect"),
                actions: ["selectItem"],
              },
              {
                target: "focused",
                actions: ["selectItem", "invokeOnClose"],
              },
            ],
            "LAYER.ESCAPE": [
              {
                guard: "autoComplete",
                target: "focused",
                actions: ["syncInputValue", "invokeOnClose"],
              },
              {
                target: "focused",
                actions: ["invokeOnClose"],
              },
            ],
            "TRIGGER.CLICK": {
              target: "focused",
              actions: "invokeOnClose",
            },
            "LAYER.INTERACT_OUTSIDE": [
              {
                guard: and("isCustomValue", not("allowCustomValue")),
                target: "idle",
                actions: ["revertInputValue", "invokeOnClose"],
              },
              {
                target: "idle",
                actions: "invokeOnClose",
              },
            ],
            CLOSE: {
              target: "focused",
              actions: "invokeOnClose",
            },
          },
        },

        suggesting: {
          tags: ["open", "focused"],
          activities: [
            "trackDismissableLayer",
            "scrollIntoView",
            "computePlacement",
            "trackChildNodes",
            "hideOtherElements",
          ],
          entry: ["focusInput", "invokeOnOpen"],
          on: {
            CHILDREN_CHANGE: {
              guard: not("isHighlightedItemVisible"),
              actions: ["highlightFirstItem"],
            },
            "INPUT.ARROW_DOWN": {
              target: "interacting",
              actions: "highlightNextItem",
            },
            "INPUT.ARROW_UP": {
              target: "interacting",
              actions: "highlightPrevItem",
            },
            "INPUT.ARROW_UP+ALT": {
              target: "focused",
            },
            "INPUT.HOME": {
              target: "interacting",
              actions: ["highlightFirstItem"],
            },
            "INPUT.END": {
              target: "interacting",
              actions: ["highlightLastItem"],
            },
            "INPUT.ENTER": [
              {
                guard: not("closeOnSelect"),
                actions: ["selectHighlightedItem"],
              },
              {
                target: "focused",
                actions: ["selectHighlightedItem", "invokeOnClose"],
              },
            ],
            "INPUT.CHANGE": [
              {
                guard: "autoHighlight",
                actions: ["setInputValue", "highlightFirstItem"],
              },
              {
                actions: ["clearHighlightedItem", "setInputValue"],
              },
            ],
            "LAYER.ESCAPE": {
              target: "focused",
              actions: "invokeOnClose",
            },
            "ITEM.POINTER_OVER": {
              target: "interacting",
              actions: "setHighlightedItem",
            },
            "ITEM.POINTER_LEAVE": {
              actions: "clearHighlightedItem",
            },
            "LAYER.INTERACT_OUTSIDE": [
              {
                guard: and("isCustomValue", not("allowCustomValue")),
                target: "idle",
                actions: ["revertInputValue", "invokeOnClose"],
              },
              {
                target: "idle",
                actions: "invokeOnClose",
              },
            ],
            "TRIGGER.CLICK": {
              target: "focused",
              actions: "invokeOnClose",
            },
            "ITEM.CLICK": [
              {
                guard: not("closeOnSelect"),
                actions: ["selectItem"],
              },
              {
                target: "focused",
                actions: ["selectItem", "invokeOnClose"],
              },
            ],
            CLOSE: {
              target: "focused",
              actions: "invokeOnClose",
            },
          },
        },
      },
    },

    {
      guards: {
        openOnClick: (ctx) => !!ctx.openOnClick,
        isInputValueEmpty: (ctx) => ctx.isInputValueEmpty,
        autoComplete: (ctx) => ctx.autoComplete && !ctx.multiple,
        autoHighlight: (ctx) => ctx.autoHighlight,
        isFirstItemHighlighted: (ctx) => ctx.collection.first() === ctx.highlightedValue,
        isLastItemHighlighted: (ctx) => ctx.collection.last() === ctx.highlightedValue,
        isCustomValue: (ctx) => ctx.inputValue !== ctx.valueAsString,
        allowCustomValue: (ctx) => !!ctx.allowCustomValue,
        hasHighlightedItem: (ctx) => ctx.highlightedValue != null,
        hasSelectedItems: (ctx) => ctx.hasSelectedItems,
        closeOnSelect: (ctx) => (ctx.multiple ? false : !!ctx.closeOnSelect),
        isHighlightedItemVisible: (ctx) => ctx.collection.has(ctx.highlightedValue),
        isOpenControlled: (ctx) => !!ctx["open.controlled"],
      },

      activities: {
        trackDismissableLayer(ctx, _evt, { send }) {
          const contentEl = () => dom.getContentEl(ctx)
          return trackDismissableElement(contentEl, {
            defer: true,
            exclude: () => [dom.getInputEl(ctx), dom.getTriggerEl(ctx), dom.getClearTriggerEl(ctx)],
            onFocusOutside: ctx.onFocusOutside,
            onPointerDownOutside: ctx.onPointerDownOutside,
            onInteractOutside: ctx.onInteractOutside,
            onEscapeKeyDown(event) {
              event.preventDefault()
              event.stopPropagation()
              send("LAYER.ESCAPE")
            },
            onDismiss() {
              send("LAYER.INTERACT_OUTSIDE")
            },
          })
        },
        hideOtherElements(ctx) {
          return ariaHidden([dom.getInputEl(ctx), dom.getContentEl(ctx), dom.getTriggerEl(ctx)])
        },
        computePlacement(ctx) {
          const controlEl = () => dom.getControlEl(ctx)
          const positionerEl = () => dom.getPositionerEl(ctx)
          ctx.currentPlacement = ctx.positioning.placement
          return getPlacement(controlEl, positionerEl, {
            ...ctx.positioning,
            defer: true,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        // in event the options are fetched (async), we still want to auto-highlight the first option
        trackChildNodes(ctx, _evt, { send }) {
          if (!ctx.autoHighlight) return
          const exec = () => send("CHILDREN_CHANGE")
          exec()
          return observeChildren(dom.getContentEl(ctx), exec)
        },
        scrollIntoView(ctx, _evt, { getState }) {
          const inputEl = dom.getInputEl(ctx)

          const exec = () => {
            const state = getState()

            const isPointer = state.event.type.startsWith("ITEM.POINTER")
            if (isPointer || !ctx.highlightedValue) return

            const optionEl = dom.getHighlightedItemEl(ctx)
            const contentEl = dom.getContentEl(ctx)

            scrollIntoView(optionEl, { rootEl: contentEl, block: "nearest" })
          }

          raf(() => exec())
          return observeAttributes(inputEl, ["aria-activedescendant"], exec)
        },
      },

      actions: {
        reposition(ctx, evt) {
          const controlEl = () => dom.getControlEl(ctx)
          const positionerEl = () => dom.getPositionerEl(ctx)
          getPlacement(controlEl, positionerEl, {
            ...ctx.positioning,
            ...evt.options,
            defer: true,
            listeners: false,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        setIsComposing(ctx) {
          ctx.composing = true
        },
        clearIsComposing(ctx) {
          ctx.composing = false
        },
        setHighlightedItem(ctx, evt) {
          set.highlightedItem(ctx, evt.value)
        },
        clearHighlightedItem(ctx) {
          set.highlightedItem(ctx, null, true)
        },
        selectHighlightedItem(ctx) {
          set.selectedItem(ctx, ctx.highlightedValue)
        },
        selectItem(ctx, evt) {
          set.selectedItem(ctx, evt.value)
        },
        clearItem(ctx, evt) {
          const value = ctx.value.filter((v) => v !== evt.value)
          set.selectedItems(ctx, value)
        },
        focusInput(ctx) {
          if (dom.isInputFocused(ctx)) return
          dom.getInputEl(ctx)?.focus({ preventScroll: true })
        },
        syncInputValue(ctx, evt) {
          const isTyping = !KEYDOWN_EVENT_REGEX.test(evt.type)
          const inputEl = dom.getInputEl(ctx)

          if (!inputEl) return
          inputEl.value = ctx.inputValue

          raf(() => {
            if (isTyping) return

            const { selectionStart, selectionEnd } = inputEl

            if (Math.abs((selectionEnd ?? 0) - (selectionStart ?? 0)) !== 0) return
            if (selectionStart !== 0) return

            inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length)
          })
        },
        setInputValue(ctx, evt) {
          set.inputValue(ctx, evt.value)
        },
        clearInputValue(ctx) {
          set.inputValue(ctx, "")
        },
        revertInputValue(ctx) {
          const inputValue = match(ctx.selectionBehavior, {
            replace: ctx.hasSelectedItems ? ctx.valueAsString : "",
            preserve: ctx.inputValue,
            clear: "",
          })

          set.inputValue(ctx, inputValue)
        },
        initialize(ctx) {
          const selectedItems = ctx.collection.items(ctx.value)
          const valueAsString = ctx.collection.itemsToString(selectedItems)

          ctx.highlightedItem = ctx.collection.item(ctx.highlightedValue)
          ctx.selectedItems = selectedItems
          ctx.valueAsString = valueAsString

          ctx.inputValue = match(ctx.selectionBehavior, {
            preserve: ctx.inputValue || valueAsString,
            replace: valueAsString,
            clear: "",
          })
        },
        setSelectedItems(ctx, evt) {
          set.selectedItems(ctx, evt.value)
        },
        clearSelectedItems(ctx) {
          set.selectedItems(ctx, [])
        },
        scrollContentToTop(ctx) {
          const contentEl = dom.getContentEl(ctx)
          if (!contentEl) return
          contentEl.scrollTop = 0
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.({ open: true })
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.({ open: false })
        },
        highlightFirstItem(ctx) {
          const value = ctx.collection.first()
          set.highlightedItem(ctx, value)
        },
        highlightLastItem(ctx) {
          const value = ctx.collection.last()
          set.highlightedItem(ctx, value)
        },
        highlightNextItem(ctx) {
          const value = ctx.collection.next(ctx.highlightedValue) ?? (ctx.loop ? ctx.collection.first() : null)
          set.highlightedItem(ctx, value)
        },
        highlightPrevItem(ctx) {
          const value = ctx.collection.prev(ctx.highlightedValue) ?? (ctx.loop ? ctx.collection.last() : null)
          set.highlightedItem(ctx, value)
        },
        highlightFirstSelectedItem(ctx) {
          const [value] = ctx.collection.sort(ctx.value)
          set.highlightedItem(ctx, value)
        },
        autofillInputValue(ctx, evt) {
          const inputEl = dom.getInputEl(ctx)
          if (!ctx.autoComplete || !inputEl || !KEYDOWN_EVENT_REGEX.test(evt.type)) return
          const valueText = ctx.collection.valueToString(ctx.highlightedValue)
          raf(() => {
            inputEl.value = valueText || ctx.inputValue
          })
        },
        setCollection(ctx, evt) {
          ctx.collection = evt.value
        },
        syncSelectedItems(ctx) {
          const prevSelectedItems = ctx.selectedItems
          ctx.selectedItems = ctx.value.map((v) => {
            const foundItem = prevSelectedItems.find((item) => ctx.collection.itemToValue(item) === v)
            if (foundItem) return foundItem
            return ctx.collection.item(v)
          })
        },
      },
    },
  )
}

const invoke = {
  valueChange: (ctx: MachineContext) => {
    ctx.onValueChange?.({
      value: Array.from(ctx.value),
      items: ctx.selectedItems,
    })

    const prevSelectedItems = ctx.selectedItems

    // side effect
    ctx.selectedItems = ctx.value.map((v) => {
      const foundItem = prevSelectedItems.find((item) => ctx.collection.itemToValue(item) === v)
      if (foundItem) return foundItem
      return ctx.collection.item(v)
    })

    ctx.valueAsString = ctx.collection.itemsToString(ctx.selectedItems)

    ctx.inputValue = match(ctx.selectionBehavior, {
      replace: ctx.valueAsString,
      preserve: ctx.inputValue,
      clear: "",
    })

    invoke.inputChange(ctx)
  },
  highlightChange: (ctx: MachineContext) => {
    ctx.onHighlightChange?.({
      highlightedValue: ctx.highlightedValue,
      highligtedItem: ctx.highlightedItem,
    })

    // side effect
    ctx.highlightedItem = ctx.collection.item(ctx.highlightedValue)
  },
  inputChange: (ctx: MachineContext) => {
    ctx.onInputValueChange?.({ inputValue: ctx.inputValue })
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
    if (!value && !force) return
    ctx.highlightedValue = value || null
    invoke.highlightChange(ctx)
  },
  inputValue: (ctx: MachineContext, value: string) => {
    if (isEqual(ctx.inputValue, value)) return
    ctx.inputValue = value
    invoke.inputChange(ctx)
  },
}
