import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine, guards } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { observeAttributes, observeChildren, raf, scrollIntoView } from "@zag-js/dom-query"
import { getPlacement } from "@zag-js/popper"
import { addOrRemove, compact, isArray, isBoolean, isEqual, match } from "@zag-js/utils"
import { collection } from "./combobox.collection"
import { dom } from "./combobox.dom"
import type { CollectionItem, MachineContext, MachineState, UserDefinedContext } from "./combobox.types"

const { and, not } = guards

export function machine<T extends CollectionItem>(userContext: UserDefinedContext<T>) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "combobox",
      initial: ctx.open ? "suggesting" : "idle",
      context: {
        loopFocus: true,
        openOnClick: false,
        value: [],
        highlightedValue: null,
        inputValue: "",
        allowCustomValue: false,
        closeOnSelect: !ctx.multiple,
        inputBehavior: "none",
        selectionBehavior: "replace",
        openOnKeyPress: true,
        openOnChange: true,
        composite: true,
        readOnly: false,
        disabled: false,
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
        highlightedValue: ["syncHighlightedItem", "autofillInputValue"],
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
                actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"],
              },
              {
                target: "interacting",
                actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"],
              },
            ],
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
              actions: ["clearInputValue", "clearSelectedItems", "setInitialFocus"],
            },
          },
        },

        focused: {
          tags: ["focused", "closed"],
          entry: ["scrollContentToTop", "clearHighlightedItem"],
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
                actions: ["setInputValue", "invokeOnOpen", "highlightFirstItemIfNeeded"],
              },
              {
                guard: "openOnChange",
                target: "suggesting",
                actions: ["setInputValue", "invokeOnOpen", "highlightFirstItemIfNeeded"],
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
                actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"],
              },
              {
                target: "interacting",
                actions: ["setInitialFocus", "highlightFirstSelectedItem", "invokeOnOpen"],
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
          entry: ["setInitialFocus"],
          activities: ["scrollToHighlightedItem", "trackDismissableLayer", "computePlacement", "hideOtherElements"],
          on: {
            "CONTROLLED.CLOSE": [
              {
                guard: "restoreFocus",
                target: "focused",
                actions: ["setFinalFocus"],
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
                actions: ["selectHighlightedItem", "invokeOnClose", "setFinalFocus"],
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
                actions: ["selectItem", "invokeOnClose", "setFinalFocus"],
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
                actions: ["invokeOnClose", "setFinalFocus"],
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
                actions: ["invokeOnClose"],
              },
              {
                target: "focused",
                actions: ["invokeOnClose", "setFinalFocus"],
              },
            ],
            "VALUE.CLEAR": [
              {
                guard: "isOpenControlled",
                actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose"],
              },
              {
                target: "focused",
                actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose", "setFinalFocus"],
              },
            ],
          },
        },

        suggesting: {
          tags: ["open", "focused"],
          activities: [
            "trackDismissableLayer",
            "scrollToHighlightedItem",
            "computePlacement",
            "trackChildNodes",
            "hideOtherElements",
          ],
          entry: ["setInitialFocus"],
          on: {
            "CONTROLLED.CLOSE": [
              {
                guard: "restoreFocus",
                target: "focused",
                actions: ["setFinalFocus"],
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
              actions: ["highlightNextItem"],
            },
            "INPUT.ARROW_UP": {
              target: "interacting",
              actions: ["highlightPrevItem"],
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
                actions: ["selectHighlightedItem", "invokeOnClose", "setFinalFocus"],
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
                actions: ["invokeOnClose"],
              },
              {
                target: "focused",
                actions: ["invokeOnClose"],
              },
            ],
            "ITEM.POINTER_MOVE": {
              target: "interacting",
              actions: ["setHighlightedItem"],
            },
            "ITEM.POINTER_LEAVE": {
              actions: ["clearHighlightedItem"],
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
                actions: ["invokeOnClose"],
              },
              {
                target: "idle",
                actions: ["invokeOnClose"],
              },
            ],
            "TRIGGER.CLICK": [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnClose"],
              },
              {
                target: "focused",
                actions: ["invokeOnClose"],
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
                actions: ["selectItem", "invokeOnClose", "setFinalFocus"],
              },
              {
                actions: ["selectItem"],
              },
            ],
            CLOSE: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnClose"],
              },
              {
                target: "focused",
                actions: ["invokeOnClose", "setFinalFocus"],
              },
            ],
            "VALUE.CLEAR": [
              {
                guard: "isOpenControlled",
                actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose"],
              },
              {
                target: "focused",
                actions: ["clearInputValue", "clearSelectedItems", "invokeOnClose", "setFinalFocus"],
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
        isFirstItemHighlighted: (ctx) => ctx.collection.firstValue === ctx.highlightedValue,
        isLastItemHighlighted: (ctx) => ctx.collection.lastValue === ctx.highlightedValue,
        isCustomValue: (ctx) => ctx.inputValue !== ctx.valueAsString,
        allowCustomValue: (ctx) => !!ctx.allowCustomValue,
        hasHighlightedItem: (ctx) => ctx.highlightedValue != null,
        closeOnSelect: (ctx) => !!ctx.closeOnSelect,
        isOpenControlled: (ctx) => !!ctx["open.controlled"],
        openOnChange: (ctx, evt) => {
          if (isBoolean(ctx.openOnChange)) return ctx.openOnChange
          return !!ctx.openOnChange?.({ inputValue: evt.value })
        },
        restoreFocus: (_ctx, evt) => (evt.restoreFocus == null ? true : !!evt.restoreFocus),
        isChangeEvent: (_ctx, evt) => evt.previousEvent?.type === "INPUT.CHANGE",
      },

      activities: {
        trackDismissableLayer(ctx, _evt, { send }) {
          if (ctx.disableLayer) return
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
          const contentEl = () => dom.getContentEl(ctx)
          return observeChildren(contentEl, {
            callback: exec,
            defer: true,
          })
        },
        scrollToHighlightedItem(ctx, _evt, { getState }) {
          const inputEl = dom.getInputEl(ctx)

          let cleanups: VoidFunction[] = []

          const exec = (immediate: boolean) => {
            const state = getState()

            const pointer = state.event.type.includes("POINTER")
            if (pointer || !ctx.highlightedValue) return

            const itemEl = dom.getHighlightedItemEl(ctx)
            const contentEl = dom.getContentEl(ctx)

            if (ctx.scrollToIndexFn) {
              const highlightedIndex = ctx.collection.indexOf(ctx.highlightedValue)
              ctx.scrollToIndexFn({ index: highlightedIndex, immediate })
              return
            }

            const rafCleanup = raf(() => {
              scrollIntoView(itemEl, { rootEl: contentEl, block: "nearest" })
            })
            cleanups.push(rafCleanup)
          }

          const rafCleanup = raf(() => exec(true))
          cleanups.push(rafCleanup)

          const observerCleanup = observeAttributes(inputEl, {
            attributes: ["aria-activedescendant"],
            callback: () => exec(false),
          })
          cleanups.push(observerCleanup)

          return () => {
            cleanups.forEach((cleanup) => cleanup())
          }
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
          if (evt.value == null) return
          set.highlightedValue(ctx, evt.value)
        },
        clearHighlightedItem(ctx) {
          set.highlightedValue(ctx, null, true)
        },
        selectHighlightedItem(ctx) {
          set.value(ctx, ctx.highlightedValue)
        },
        selectItem(ctx, evt) {
          if (evt.value == null) return
          set.value(ctx, evt.value)
        },
        clearItem(ctx, evt) {
          if (evt.value == null) return
          const value = ctx.value.filter((v) => v !== evt.value)
          set.value(ctx, value)
        },
        setInitialFocus(ctx) {
          raf(() => {
            dom.focusInputEl(ctx)
          })
        },
        setFinalFocus(ctx) {
          raf(() => {
            const triggerEl = dom.getTriggerEl(ctx)
            if (triggerEl?.dataset.focusable == null) {
              dom.focusInputEl(ctx)
            } else {
              dom.focusTriggerEl(ctx)
            }
          })
        },
        syncInputValue(ctx) {
          const inputEl = dom.getInputEl(ctx)
          if (!inputEl) return

          inputEl.value = ctx.inputValue

          queueMicrotask(() => {
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
          const selectedItems = ctx.collection.findMany(ctx.value)
          const valueAsString = ctx.collection.stringifyMany(ctx.value)

          ctx.highlightedItem = ctx.collection.find(ctx.highlightedValue)
          ctx.selectedItems = selectedItems
          ctx.valueAsString = valueAsString

          if (ctx.inputValue.trim() || ctx.multiple) return

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
          if (!isArray(evt.value)) return
          set.value(ctx, evt.value)
        },
        clearSelectedItems(ctx) {
          set.value(ctx, [])
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
            const value = ctx.collection.firstValue
            set.highlightedValue(ctx, value)
          })
        },
        highlightFirstItemIfNeeded(ctx) {
          if (!ctx.autoHighlight) return
          raf(() => {
            const value = ctx.collection.firstValue
            set.highlightedValue(ctx, value)
          })
        },
        highlightLastItem(ctx) {
          raf(() => {
            const value = ctx.collection.lastValue
            set.highlightedValue(ctx, value)
          })
        },
        highlightNextItem(ctx) {
          let value: string | null = null
          if (ctx.highlightedValue) {
            value = ctx.collection.getNextValue(ctx.highlightedValue)
            if (!value && ctx.loopFocus) value = ctx.collection.firstValue
          } else {
            value = ctx.collection.firstValue
          }
          set.highlightedValue(ctx, value)
        },
        highlightPrevItem(ctx) {
          let value: string | null = null
          if (ctx.highlightedValue) {
            value = ctx.collection.getPreviousValue(ctx.highlightedValue)
            if (!value && ctx.loopFocus) value = ctx.collection.lastValue
          } else {
            value = ctx.collection.lastValue
          }
          set.highlightedValue(ctx, value)
        },
        highlightFirstSelectedItem(ctx) {
          raf(() => {
            const [value] = ctx.collection.sort(ctx.value)
            set.highlightedValue(ctx, value)
          })
        },
        highlightFirstOrSelectedItem(ctx) {
          raf(() => {
            let value: string | null = null
            if (ctx.hasSelectedItems) {
              value = ctx.collection.sort(ctx.value)[0]
            } else {
              value = ctx.collection.firstValue
            }
            set.highlightedValue(ctx, value)
          })
        },
        highlightLastOrSelectedItem(ctx) {
          raf(() => {
            let value: string | null = null
            if (ctx.hasSelectedItems) {
              value = ctx.collection.sort(ctx.value)[0]
            } else {
              value = ctx.collection.lastValue
            }
            set.highlightedValue(ctx, value)
          })
        },
        autofillInputValue(ctx, evt) {
          const inputEl = dom.getInputEl(ctx)
          if (!ctx.autoComplete || !inputEl || !evt.keypress) return
          const valueText = ctx.collection.stringify(ctx.highlightedValue)
          raf(() => {
            inputEl.value = valueText || ctx.inputValue
          })
        },
        setCollection(ctx, evt) {
          ctx.collection = evt.value
        },
        syncSelectedItems(ctx) {
          sync.valueChange(ctx)
        },
        syncHighlightedItem(ctx) {
          sync.highlightChange(ctx)
        },
        toggleVisibility(ctx, evt, { send }) {
          send({ type: ctx.open ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: evt })
        },
      },
    },
  )
}

const sync = {
  valueChange: (ctx: MachineContext) => {
    // side effect
    const prevSelectedItems = ctx.selectedItems

    ctx.selectedItems = ctx.value.map((v) => {
      const foundItem = prevSelectedItems.find((item) => ctx.collection.getItemValue(item) === v)
      if (foundItem) return foundItem
      return ctx.collection.find(v)
    })

    const valueAsString = ctx.collection.stringifyItems(ctx.selectedItems)
    ctx.valueAsString = valueAsString

    // set inputValue
    let inputValue: string | undefined
    if (ctx.getSelectionValue) {
      //
      inputValue = ctx.getSelectionValue({
        inputValue: ctx.inputValue,
        selectedItems: Array.from(ctx.selectedItems),
        valueAsString,
      })
      //
    } else {
      //
      inputValue = match(ctx.selectionBehavior, {
        replace: ctx.valueAsString,
        preserve: ctx.inputValue,
        clear: "",
      })
    }

    set.inputValue(ctx, inputValue)
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
  },
  highlightChange: (ctx: MachineContext) => {
    sync.highlightChange(ctx)
    ctx.onHighlightChange?.({
      highlightedValue: ctx.highlightedValue,
      highlightedItem: ctx.highlightedItem,
    })
  },
  inputChange: (ctx: MachineContext) => {
    ctx.onInputValueChange?.({ inputValue: ctx.inputValue })
  },
}

const set = {
  value: (ctx: MachineContext, value: string | string[] | null | undefined, force = false) => {
    if (isEqual(ctx.value, value)) return
    if (value == null && !force) return
    if (value == null && force) {
      ctx.value = []
      invoke.valueChange(ctx)
      return
    }
    if (isArray(value)) {
      ctx.value = value
    } else if (value != null) {
      ctx.value = ctx.multiple ? addOrRemove(ctx.value, value) : [value]
    }
    invoke.valueChange(ctx)
  },
  highlightedValue: (ctx: MachineContext, value: string | null | undefined, force = false) => {
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
