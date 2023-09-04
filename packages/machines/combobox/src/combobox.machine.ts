import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine, guards } from "@zag-js/core"
import { contains, raf } from "@zag-js/dom-query"
import { trackInteractOutside } from "@zag-js/interact-outside"
import { observeAttributes, observeChildren } from "@zag-js/mutation-observer"
import { getPlacement } from "@zag-js/popper"
import { addOrRemove, compact, match } from "@zag-js/utils"
import { collection } from "./combobox.collection"
import { dom } from "./combobox.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./combobox.types"

const { and, not } = guards

const KEYDOWN_EVENT_REGEX = /(ARROW_UP|ARROW_DOWN|HOME|END|ENTER|ESCAPE)/

export function machine(userContext: UserDefinedContext) {
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
        selectOnBlur: true,
        allowCustomValue: false,
        closeOnSelect: true,
        inputBehavior: "none",
        selectionBehavior: "replace",
        ...ctx,
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

      computed: {
        isInputValueEmpty: (ctx) => ctx.inputValue.length === 0,
        isInteractive: (ctx) => !(ctx.readOnly || ctx.disabled),
        autoComplete: (ctx) => ctx.inputBehavior === "autocomplete",
        autoHighlight: (ctx) => ctx.inputBehavior === "autohighlight",
        selectedItems: (ctx) => ctx.collection.getItems(ctx.value),
        highlightedItem: (ctx) => ctx.collection.getItem(ctx.highlightedValue),
        valueAsString: (ctx) => ctx.collection.getItemLabels(ctx.selectedItems).join(", "),
        hasSelectedItems: (ctx) => ctx.value.length > 0,
      },

      watch: {
        inputValue: ["syncInputValue"],
        highlightedValue: ["autofillInputValue"],
      },

      on: {
        "HIGHLIGHTED_VALUE.SET": {
          actions: ["setHighlightedItem"],
        },
        "VALUE.SET": {
          actions: ["setSelectedItems"],
        },
        "VALUE.SELECT": {
          actions: ["setSelectedItem"],
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
      },

      states: {
        idle: {
          tags: ["idle", "closed"],
          entry: ["scrollToTop", "clearHighlightedItem"],
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
          entry: ["focusInput", "scrollToTop", "clearHighlightedItem"],
          activities: ["trackInteractOutside"],
          on: {
            "INPUT.CHANGE": {
              target: "suggesting",
              actions: "setInputValue",
            },
            INTERACT_OUTSIDE: {
              target: "idle",
            },
            "INPUT.ESCAPE": {
              guard: and("isCustomValue", not("allowCustomValue")),
              actions: "revertInputValue",
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
                actions: ["highlightNextItem", "invokeOnOpen"],
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
          activities: ["scrollIntoView", "trackInteractOutside", "computePlacement", "hideOtherElements"],
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
                actions: ["clearHighlightedItem", "scrollToTop"],
              },
              {
                guard: "hasSelectedItems",
                actions: ["highlightFirstSelectedItem"],
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
                guard: "hasSelectedItems",
                actions: ["highlightFirstSelectedItem"],
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
            "OPTION.POINTER_OVER": {
              actions: ["setHighlightedItem"],
            },
            "OPTION.POINTER_LEAVE": {
              actions: ["clearHighlightedItem"],
            },
            "OPTION.CLICK": [
              {
                guard: not("closeOnSelect"),
                actions: ["setSelectedItem"],
              },
              {
                target: "focused",
                actions: ["setSelectedItem", "invokeOnClose"],
              },
            ],
            "INPUT.ESCAPE": [
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
            INTERACT_OUTSIDE: [
              {
                guard: and("selectOnBlur", "hasHighlightedItem"),
                target: "idle",
                actions: ["setSelectedItem", "invokeOnClose"],
              },
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
            "trackInteractOutside",
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
            "INPUT.ESCAPE": {
              target: "focused",
              actions: "invokeOnClose",
            },
            "OPTION.POINTER_OVER": {
              target: "interacting",
              actions: "setHighlightedItem",
            },
            "OPTION.POINTER_LEAVE": {
              actions: "clearHighlightedItem",
            },
            INTERACT_OUTSIDE: [
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
            "OPTION.CLICK": [
              {
                guard: not("closeOnSelect"),
                actions: ["setSelectedItem"],
              },
              {
                target: "focused",
                actions: ["setSelectedItem", "invokeOnClose"],
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
        isFirstItemHighlighted: (ctx) => ctx.collection.getFirstKey() === ctx.highlightedValue,
        isLastItemHighlighted: (ctx) => ctx.collection.getLastKey() === ctx.highlightedValue,
        isCustomValue: (ctx) => ctx.inputValue !== ctx.valueAsString,
        allowCustomValue: (ctx) => !!ctx.allowCustomValue,
        hasHighlightedItem: (ctx) => ctx.highlightedValue == null,
        hasSelectedItems: (ctx) => ctx.hasSelectedItems,
        selectOnBlur: (ctx) => !!ctx.selectOnBlur,
        closeOnSelect: (ctx) => (!!ctx.multiple ? false : !!ctx.closeOnSelect),
        isHighlightedItemVisible: (ctx) => ctx.collection.has(ctx.highlightedValue),
      },

      activities: {
        trackInteractOutside(ctx, _evt, { send }) {
          return trackInteractOutside(dom.getInputEl(ctx), {
            exclude(target) {
              const ignore = [dom.getContentEl(ctx), dom.getTriggerEl(ctx)]
              return ignore.some((el) => contains(el, target))
            },
            onFocusOutside: ctx.onFocusOutside,
            onPointerDownOutside: ctx.onPointerDownOutside,
            onInteractOutside(event) {
              ctx.onInteractOutside?.(event)
              if (event.defaultPrevented) return
              send({ type: "INTERACT_OUTSIDE", src: "interact-outside" })
            },
          })
        },
        hideOtherElements(ctx) {
          return ariaHidden([dom.getInputEl(ctx), dom.getContentEl(ctx), dom.getTriggerEl(ctx)])
        },
        computePlacement(ctx) {
          ctx.currentPlacement = ctx.positioning.placement
          return getPlacement(dom.getControlEl(ctx), dom.getPositionerEl(ctx), {
            ...ctx.positioning,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
            onCleanup() {
              ctx.currentPlacement = undefined
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

            const isPointer = state.event.type.startsWith("OPTION.POINTER")
            if (isPointer || !ctx.highlightedValue) return

            const optionEl = dom.getHighlightedItemEl(ctx)
            optionEl?.scrollIntoView({ block: "nearest" })
          }

          raf(() => exec())
          return observeAttributes(inputEl, ["aria-activedescendant"], exec)
        },
      },

      actions: {
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
        setSelectedItem(ctx, evt) {
          set.selectedItem(ctx, evt.value)
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
          set.inputValue(ctx, ctx.hasSelectedItems ? ctx.valueAsString : "")
        },
        setSelectedItems(ctx, evt) {
          set.selectedItems(ctx, evt.value)
        },
        clearSelectedItems(ctx) {
          set.selectedItems(ctx, [])
        },
        scrollToTop(ctx) {
          const contentEl = dom.getContentEl(ctx)
          if (!contentEl) return
          contentEl.scrollTop = 0
        },
        invokeOnOpen(ctx) {
          ctx.onOpen?.()
        },
        invokeOnClose(ctx) {
          ctx.onClose?.()
        },
        highlightFirstItem(ctx) {
          const firstKey = ctx.collection.getFirstKey()
          set.highlightedItem(ctx, firstKey)
        },
        highlightLastItem(ctx) {
          const lastKey = ctx.collection.getLastKey()
          set.highlightedItem(ctx, lastKey)
        },
        highlightNextItem(ctx) {
          const nextKey = ctx.collection.getKeyAfter(ctx.highlightedValue) ?? ctx.collection.getFirstKey()
          set.highlightedItem(ctx, nextKey)
        },
        highlightPrevItem(ctx) {
          const prevKey = ctx.collection.getKeyBefore(ctx.highlightedValue) ?? ctx.collection.getLastKey()
          set.highlightedItem(ctx, prevKey)
        },
        highlightFirstSelectedItem(ctx) {
          const [firstKey] = ctx.collection.sortKeys(ctx.value)
          set.highlightedItem(ctx, firstKey)
        },
        autofillInputValue(ctx, evt) {
          const inputEl = dom.getInputEl(ctx)
          if (!ctx.autoComplete || !inputEl || !KEYDOWN_EVENT_REGEX.test(evt.type)) return
          const valueText = ctx.collection.getKeyLabel(ctx.highlightedValue)
          inputEl.value = valueText || ctx.inputValue
        },
      },
    },
  )
}

const invoke = {
  selectionChange: (ctx: MachineContext) => {
    ctx.onChange?.({ value: Array.from(ctx.value), items: ctx.selectedItems })

    // side effect: sync inputValue
    ctx.inputValue = match(ctx.selectionBehavior, {
      replace: ctx.valueAsString,
      clear: "",
      preserve: ctx.inputValue,
    })
  },
  highlightChange: (ctx: MachineContext) => {
    ctx.onHighlight?.({ value: ctx.highlightedValue, item: ctx.highlightedItem })
  },
  inputChange: (ctx: MachineContext) => {
    ctx.onInputChange?.({ value: ctx.inputValue })
  },
}

const set = {
  selectedItem: (ctx: MachineContext, value: string | null | undefined, force = false) => {
    if (value == null && !force) return

    if (value == null && force) {
      ctx.value = []
      invoke.selectionChange(ctx)
      return
    }

    ctx.value = ctx.multiple ? addOrRemove(ctx.value, value!) : [value!]
    invoke.selectionChange(ctx)
  },
  selectedItems: (ctx: MachineContext, value: string[]) => {
    ctx.value = value
    invoke.selectionChange(ctx)
  },
  highlightedItem: (ctx: MachineContext, value: string | null | undefined, force = false) => {
    if (!value && !force) return
    ctx.highlightedValue = value || null
    invoke.highlightChange(ctx)
  },
  inputValue: (ctx: MachineContext, value: string) => {
    ctx.inputValue = value
    invoke.inputChange(ctx)
  },
}
