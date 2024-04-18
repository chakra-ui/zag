import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine, guards } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { contains, raf, scrollIntoView } from "@zag-js/dom-query"
import { observeAttributes, observeChildren } from "@zag-js/mutation-observer"
import { getPlacement } from "@zag-js/popper"
import { addOrRemove, compact, isBoolean, isEqual, match } from "@zag-js/utils"
import { collection } from "./combobox.collection"
import { dom } from "./combobox.dom"
import type { CollectionItem, MachineContext, MachineState, UserDefinedContext } from "./combobox.types"

const { and, not } = guards

export function machine<T extends CollectionItem>(userContext: UserDefinedContext<T>) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "combobox",
      initial: ctx.autoFocus ? "focused" : "idle",
      context: {
        loop: true,
        openOnClick: false,
        value: [],
        highlightedValue: null,
        inputValue: "",
        allowCustomValue: false,
        closeOnSelect: true,
        inputBehavior: "none",
        selectionBehavior: "replace",
        openOnKeyPress: true,
        openOnChange: true,
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

      created: ["syncInitialValues", "syncSelectionBehavior"],

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
        multiple: ["syncSelectionBehavior"],
        open: ["toggleVisibility"],
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
            "CONTROLLED.OPEN": {
              target: "interacting",
            },
            "TRIGGER.CLICK": [
              {
                guard: "isOpenControlled",
                actions: ["focusInput", "highlightFirstSelectedItem", "invokeOnOpen"],
              },
              {
                target: "interacting",
                actions: ["focusInput", "highlightFirstSelectedItem", "invokeOnOpen"],
              },
            ],
            "INPUT.CLICK": [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "interacting",
                actions: ["highlightFirstSelectedItem", "invokeOnOpen"],
              },
            ],
            "INPUT.FOCUS": {
              target: "focused",
            },
            OPEN: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "interacting",
                actions: ["invokeOnOpen"],
              },
            ],
            "VALUE.CLEAR": {
              target: "focused",
              actions: ["clearInputValue", "clearSelectedItems"],
            },
          },
        },

        focused: {
          tags: ["focused", "closed"],
          entry: ["focusInputOrTrigger", "scrollContentToTop", "clearHighlightedItem"],
          on: {
            "CONTROLLED.OPEN": [
              {
                guard: "isChangeEvent",
                target: "suggesting",
              },
              {
                target: "interacting",
              },
            ],
            "INPUT.CHANGE": [
              {
                guard: and("isOpenControlled", "openOnChange"),
                actions: ["setInputValue", "invokeOnOpen"],
              },
              {
                guard: "openOnChange",
                target: "suggesting",
                actions: ["setInputValue", "invokeOnOpen"],
              },
              {
                actions: "setInputValue",
              },
            ],
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
            "INPUT.CLICK": [
              {
                guard: "isOpenControlled",
                actions: ["highlightFirstSelectedItem", "invokeOnOpen"],
              },
              {
                target: "interacting",
                actions: ["highlightFirstSelectedItem", "invokeOnOpen"],
              },
            ],
            "TRIGGER.CLICK": [
              {
                guard: "isOpenControlled",
                actions: ["focusInput", "highlightFirstSelectedItem", "invokeOnOpen"],
              },
              {
                target: "interacting",
                actions: ["focusInput", "highlightFirstSelectedItem", "invokeOnOpen"],
              },
            ],
            "INPUT.ARROW_DOWN": [
              // == group 1 ==
              {
                guard: and("isOpenControlled", "autoComplete"),
                actions: ["invokeOnOpen"],
              },
              {
                guard: "autoComplete",
                target: "interacting",
                actions: ["invokeOnOpen"],
              },
              // == group 2 ==
              {
                guard: "isOpenControlled",
                actions: ["highlightFirstOrSelectedItem", "invokeOnOpen"],
              },
              {
                target: "interacting",
                actions: ["highlightFirstOrSelectedItem", "invokeOnOpen"],
              },
            ],
            "INPUT.ARROW_UP": [
              // == group 1 ==
              {
                guard: "autoComplete",
                target: "interacting",
                actions: "invokeOnOpen",
              },
              {
                guard: "autoComplete",
                target: "interacting",
                actions: "invokeOnOpen",
              },
              // == group 2 ==
              {
                target: "interacting",
                actions: ["highlightLastOrSelectedItem", "invokeOnOpen"],
              },
              {
                target: "interacting",
                actions: ["highlightLastOrSelectedItem", "invokeOnOpen"],
              },
            ],
            OPEN: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "interacting",
                actions: ["invokeOnOpen"],
              },
            ],
            "VALUE.CLEAR": {
              actions: ["clearInputValue", "clearSelectedItems"],
            },
          },
        },

        interacting: {
          tags: ["open", "focused"],
          activities: ["scrollIntoView", "trackDismissableLayer", "computePlacement", "hideOtherElements"],
          on: {
            "CONTROLLED.CLOSE": [
              {
                guard: "restoreFocus",
                target: "focused",
              },
              {
                target: "idle",
              },
            ],
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
            "INPUT.ENTER": [
              {
                guard: and("isOpenControlled", "closeOnSelect"),
                actions: ["selectHighlightedItem", "invokeOnClose"],
              },
              {
                guard: "closeOnSelect",
                target: "focused",
                actions: ["selectHighlightedItem", "invokeOnClose"],
              },
              {
                actions: ["selectHighlightedItem"],
              },
            ],
            "INPUT.CHANGE": [
              {
                guard: "autoComplete",
                target: "suggesting",
                actions: ["setInputValue", "invokeOnOpen"],
              },
              {
                target: "suggesting",
                actions: ["clearHighlightedItem", "setInputValue", "invokeOnOpen"],
              },
            ],
            "ITEM.POINTER_MOVE": {
              actions: ["setHighlightedItem"],
            },
            "ITEM.POINTER_LEAVE": {
              actions: ["clearHighlightedItem"],
            },
            "ITEM.CLICK": [
              {
                guard: and("isOpenControlled", "closeOnSelect"),
                actions: ["selectItem", "invokeOnClose"],
              },
              {
                guard: "closeOnSelect",
                target: "focused",
                actions: ["selectItem", "invokeOnClose"],
              },
              {
                actions: ["selectItem"],
              },
            ],
            "LAYER.ESCAPE": [
              {
                guard: and("isOpenControlled", "autoComplete"),
                actions: ["syncInputValue", "invokeOnClose"],
              },
              {
                guard: "autoComplete",
                target: "focused",
                actions: ["syncInputValue", "invokeOnClose"],
              },
              {
                guard: "isOpenControlled",
                actions: "invokeOnClose",
              },
              {
                target: "focused",
                actions: ["invokeOnClose"],
              },
            ],
            "TRIGGER.CLICK": [
              {
                guard: "isOpenControlled",
                actions: "invokeOnClose",
              },
              {
                target: "focused",
                actions: "invokeOnClose",
              },
            ],
            "LAYER.INTERACT_OUTSIDE": [
              // == group 1 ==
              {
                guard: and("isOpenControlled", "isCustomValue", not("allowCustomValue")),
                actions: ["revertInputValue", "invokeOnClose"],
              },
              {
                guard: and("isCustomValue", not("allowCustomValue")),
                target: "idle",
                actions: ["revertInputValue", "invokeOnClose"],
              },
              // == group 2 ==
              {
                guard: "isOpenControlled",
                actions: "invokeOnClose",
              },
              {
                target: "idle",
                actions: "invokeOnClose",
              },
            ],
            CLOSE: [
              {
                guard: "isOpenControlled",
                actions: "invokeOnClose",
              },
              {
                target: "focused",
                actions: "invokeOnClose",
              },
            ],
            "VALUE.CLEAR": [
              {
                guard: "isOpenControlled",
                actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose"],
              },
              {
                target: "focused",
                actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose"],
              },
            ],
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
          entry: ["focusInput"],
          on: {
            "CONTROLLED.CLOSE": [
              {
                guard: "restoreFocus",
                target: "focused",
              },
              {
                target: "idle",
              },
            ],
            CHILDREN_CHANGE: {
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
                guard: and("isOpenControlled", "closeOnSelect"),
                actions: ["selectHighlightedItem", "invokeOnClose"],
              },
              {
                guard: "closeOnSelect",
                target: "focused",
                actions: ["selectHighlightedItem", "invokeOnClose"],
              },
              {
                actions: ["selectHighlightedItem"],
              },
            ],
            "INPUT.CHANGE": [
              {
                guard: "autoHighlight",
                actions: ["setInputValue"],
              },
              {
                actions: ["setInputValue"],
              },
            ],
            "LAYER.ESCAPE": [
              {
                guard: "isOpenControlled",
                actions: "invokeOnClose",
              },
              {
                target: "focused",
                actions: "invokeOnClose",
              },
            ],
            "ITEM.POINTER_MOVE": {
              target: "interacting",
              actions: "setHighlightedItem",
            },
            "ITEM.POINTER_LEAVE": {
              actions: "clearHighlightedItem",
            },
            "LAYER.INTERACT_OUTSIDE": [
              // == group 1 ==
              {
                guard: and("isOpenControlled", "isCustomValue", not("allowCustomValue")),
                actions: ["revertInputValue", "invokeOnClose"],
              },
              {
                guard: and("isCustomValue", not("allowCustomValue")),
                target: "idle",
                actions: ["revertInputValue", "invokeOnClose"],
              },
              // == group 2 ==
              {
                guard: "isOpenControlled",
                actions: "invokeOnClose",
              },
              {
                target: "idle",
                actions: "invokeOnClose",
              },
            ],
            "TRIGGER.CLICK": [
              {
                guard: "isOpenControlled",
                actions: "invokeOnClose",
              },
              {
                target: "focused",
                actions: "invokeOnClose",
              },
            ],
            "ITEM.CLICK": [
              {
                guard: and("isOpenControlled", "closeOnSelect"),
                actions: ["selectItem", "invokeOnClose"],
              },
              {
                guard: "closeOnSelect",
                target: "focused",
                actions: ["selectItem", "invokeOnClose"],
              },
              {
                actions: ["selectItem"],
              },
            ],
            CLOSE: [
              {
                guard: "isOpenControlled",
                actions: "invokeOnClose",
              },
              {
                target: "focused",
                actions: "invokeOnClose",
              },
            ],
            "VALUE.CLEAR": [
              {
                guard: "isOpenControlled",
                actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose"],
              },
              {
                target: "focused",
                actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose"],
              },
            ],
          },
        },
      },
    },

    {
      guards: {
        isInputValueEmpty: (ctx) => ctx.isInputValueEmpty,
        autoComplete: (ctx) => ctx.autoComplete && !ctx.multiple,
        autoHighlight: (ctx) => ctx.autoHighlight,
        isFirstItemHighlighted: (ctx) => ctx.collection.first() === ctx.highlightedValue,
        isLastItemHighlighted: (ctx) => ctx.collection.last() === ctx.highlightedValue,
        isCustomValue: (ctx) => ctx.inputValue !== ctx.valueAsString,
        allowCustomValue: (ctx) => !!ctx.allowCustomValue,
        hasHighlightedItem: (ctx) => ctx.highlightedValue != null,
        closeOnSelect: (ctx) => (ctx.multiple ? false : !!ctx.closeOnSelect),
        isOpenControlled: (ctx) => !!ctx["open.controlled"],
        openOnChange: (ctx, evt) => {
          if (isBoolean(ctx.openOnChange)) return ctx.openOnChange
          return !!ctx.openOnChange?.({ inputValue: evt.target.value })
        },
        restoreFocus: (_ctx, evt) => (evt.restoreFocus == null ? true : !!evt.restoreFocus),
        isChangeEvent: (_ctx, evt) => evt.previousEvent?.type === "INPUT.CHANGE",
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
              send({ type: "LAYER.INTERACT_OUTSIDE", restoreFocus: false })
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

          const exec = (immediate: boolean) => {
            const state = getState()

            const pointer = state.event.type.startsWith("ITEM.POINTER")
            if (pointer || !ctx.highlightedValue) return

            const optionEl = dom.getHighlightedItemEl(ctx)
            const contentEl = dom.getContentEl(ctx)

            if (ctx.scrollToIndexFn) {
              const highlightedIndex = ctx.collection.indexOf(ctx.highlightedValue)
              ctx.scrollToIndexFn({ index: highlightedIndex, immediate })
              return
            }

            scrollIntoView(optionEl, { rootEl: contentEl, block: "nearest" })
          }

          raf(() => exec(true))
          return observeAttributes(inputEl, ["aria-activedescendant"], () => exec(false))
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
          // use raf since the input might be rendered in the content
          raf(() => {
            if (dom.isInputFocused(ctx)) return
            dom.getInputEl(ctx)?.focus({ preventScroll: true })
          })
        },
        focusInputOrTrigger(ctx) {
          queueMicrotask(() => {
            // if control does not have input, focus trigger
            if (!contains(dom.getControlEl(ctx), dom.getInputEl(ctx))) {
              dom.getTriggerEl(ctx)?.focus({ preventScroll: true })
              return
            } else {
              dom.getInputEl(ctx)?.focus({ preventScroll: true })
            }
          })
        },
        syncInputValue(ctx, evt) {
          const inputEl = dom.getInputEl(ctx)
          if (!inputEl) return

          inputEl.value = ctx.inputValue

          raf(() => {
            if (!evt.keypress) return
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
        syncInitialValues(ctx) {
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
        syncSelectionBehavior(ctx) {
          if (ctx.multiple) {
            ctx.selectionBehavior = "clear"
          }
        },
        setSelectedItems(ctx, evt) {
          set.selectedItems(ctx, evt.value)
        },
        clearSelectedItems(ctx) {
          set.selectedItems(ctx, [])
        },
        scrollContentToTop(ctx) {
          if (ctx.scrollToIndexFn) {
            ctx.scrollToIndexFn({ index: 0, immediate: true })
          } else {
            const contentEl = dom.getContentEl(ctx)
            if (!contentEl) return
            contentEl.scrollTop = 0
          }
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.({ open: true })
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.({ open: false })
        },
        highlightFirstItem(ctx) {
          raf(() => {
            const value = ctx.collection.first()
            set.highlightedItem(ctx, value)
          })
        },
        highlightLastItem(ctx) {
          raf(() => {
            const value = ctx.collection.last()
            set.highlightedItem(ctx, value)
          })
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
          raf(() => {
            const [value] = ctx.collection.sort(ctx.value)
            set.highlightedItem(ctx, value)
          })
        },
        highlightFirstOrSelectedItem(ctx) {
          raf(() => {
            let value: string | null = null
            if (ctx.hasSelectedItems) {
              value = ctx.collection.sort(ctx.value)[0]
            } else {
              value = ctx.collection.first()
            }
            set.highlightedItem(ctx, value)
          })
        },
        highlightLastOrSelectedItem(ctx) {
          raf(() => {
            let value: string | null = null
            if (ctx.hasSelectedItems) {
              value = ctx.collection.sort(ctx.value)[0]
            } else {
              value = ctx.collection.last()
            }
            set.highlightedItem(ctx, value)
          })
        },
        autofillInputValue(ctx, evt) {
          const inputEl = dom.getInputEl(ctx)
          if (!ctx.autoComplete || !inputEl || !evt.keypress) return
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
        toggleVisibility(ctx, evt, { send }) {
          send({ type: ctx.open ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: evt })
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

    const valueAsString = ctx.collection.itemsToString(ctx.selectedItems)

    ctx.valueAsString = valueAsString

    let nextInputValue: string | undefined

    if (ctx.getSelectionValue) {
      //
      nextInputValue = ctx.getSelectionValue({
        inputValue: ctx.inputValue,
        selectedItems: Array.from(ctx.selectedItems),
        valueAsString,
      })
      //
    } else {
      //
      nextInputValue = match(ctx.selectionBehavior, {
        replace: ctx.valueAsString,
        preserve: ctx.inputValue,
        clear: "",
      })
    }

    ctx.inputValue = nextInputValue

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
