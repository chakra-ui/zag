import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine, guards } from "@zag-js/core"
import { contains, raf } from "@zag-js/dom-query"
import { trackInteractOutside } from "@zag-js/interact-outside"
import { createLiveRegion } from "@zag-js/live-region"
import { observeAttributes, observeChildren } from "@zag-js/mutation-observer"
import { getPlacement } from "@zag-js/popper"
import { addOrRemove, compact } from "@zag-js/utils"
import { collection } from "./combobox.collection"
import { dom } from "./combobox.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./combobox.types"

const { and, not } = guards

const keydownEventRegex = /(ARROW_UP|ARROW_DOWN|HOME|END|ENTER|ESCAPE)/

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "combobox",
      initial: ctx.autoFocus ? "focused" : "idle",
      context: {
        loop: true,
        openOnClick: false,
        ariaHidden: true,
        collection: collection({ items: [] as any[] }),
        composing: false,
        value: [],
        highlightedValue: null,
        inputValue: "",
        liveRegion: null,
        focusOnClear: true,
        selectOnBlur: true,
        isHovering: false,
        allowCustomValue: false,
        closeOnSelect: true,
        inputBehavior: "none",
        selectionBehavior: "set",
        ...ctx,
        positioning: {
          placement: "bottom",
          flip: false,
          sameWidth: true,
          ...ctx.positioning,
        },
        translations: {
          triggerLabel: "Toggle suggestions",
          clearTriggerLabel: "Clear value",
          navigationHint: "use the up and down keys to navigate. Press the enter key to select",
          countAnnouncement: (count) => `${count} ${count === 1 ? "option" : "options"} available`,
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
        displayValue: (ctx) => ctx.collection.getItemLabels(ctx.selectedItems).join(", "),
        hasSelectedItems: (ctx) => ctx.value.length > 0,
      },

      watch: {
        inputValue: ["syncInputValue"],
      },

      activities: ["setupLiveRegion"],

      on: {
        SET_VALUE: {
          actions: ["setSelectedItems"],
        },
        SET_INPUT_VALUE: {
          actions: "setInputValue",
        },
        CLEAR_VALUE: [
          {
            guard: "focusOnClear",
            target: "focused",
            actions: ["clearInputValue", "clearSelectedItems"],
          },
          {
            actions: ["clearInputValue", "clearSelectedItems"],
          },
        ],
        POINTER_OVER: {
          actions: "setIsHovering",
        },
        POINTER_LEAVE: {
          actions: "clearIsHovering",
        },
        COMPOSITION_START: {
          actions: ["setIsComposing"],
        },
        COMPOSITION_END: {
          actions: ["clearIsComposing"],
        },
      },

      states: {
        idle: {
          tags: ["idle"],
          entry: ["scrollToTop", "clearHighlightedItem"],
          on: {
            CLICK_BUTTON: {
              target: "interacting",
              actions: ["focusInput", "invokeOnOpen"],
            },
            CLICK_INPUT: {
              guard: "openOnClick",
              target: "interacting",
              actions: "invokeOnOpen",
            },
            FOCUS: "focused",
          },
        },

        focused: {
          tags: ["focused"],
          entry: ["focusInput", "scrollToTop"],
          activities: ["trackInteractOutside"],
          on: {
            CHANGE: {
              target: "suggesting",
              actions: "setInputValue",
            },
            INTERACT_OUTSIDE: "idle",
            ESCAPE: {
              guard: and("isCustomValue", not("allowCustomValue")),
              actions: "revertInputValue",
            },
            CLICK_INPUT: {
              guard: "openOnClick",
              target: "interacting",
              actions: ["invokeOnOpen"],
            },
            CLICK_BUTTON: {
              target: "interacting",
              actions: ["focusInput", "invokeOnOpen"],
            },
            POINTER_OVER: {
              actions: "setIsHovering",
            },
            ARROW_DOWN: [
              {
                guard: "autoComplete",
                target: "interacting",
                actions: "invokeOnOpen",
              },
              {
                target: "interacting",
                actions: ["highlightFirstItem", "invokeOnOpen"],
              },
            ],
            ALT_ARROW_DOWN: {
              target: "interacting",
              actions: "invokeOnOpen",
            },
            ARROW_UP: [
              {
                guard: "autoComplete",
                target: "interacting",
                actions: "invokeOnOpen",
              },
              {
                target: "interacting",
                actions: ["highlightLastItem", "invokeOnOpen"],
              },
            ],
          },
        },

        interacting: {
          tags: ["open", "focused"],
          activities: ["scrollIntoView", "trackInteractOutside", "computePlacement", "hideOtherElements"],
          entry: "highlightFirstSelectedItem",
          on: {
            HOME: {
              actions: ["highlightFirstItem", "preventDefault"],
            },
            END: {
              actions: ["highlightLastItem", "preventDefault"],
            },
            ARROW_DOWN: [
              {
                guard: and("autoComplete", "isLastItemHighlighted"),
                actions: ["clearHighlightedItem", "scrollToTop"],
              },
              {
                guard: "hasHighlightedItem",
                actions: "highlightNextItem",
              },
              {
                actions: "highlightFirstItem",
              },
            ],
            ARROW_UP: [
              {
                guard: and("autoComplete", "isFirstItemHighlighted"),
                actions: "clearHighlightedItem",
              },
              {
                guard: "hasHighlightedItem",
                actions: "highlightPrevItem",
              },
              {
                actions: "highlightLastItem",
              },
            ],
            ENTER: [
              {
                guard: not("closeOnSelect"),
                actions: ["selectItem"],
              },
              {
                target: "focused",
                actions: ["selectItem", "invokeOnClose"],
              },
            ],
            CHANGE: [
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
            POINTEROVER_OPTION: {
              actions: ["setHighlightedItem"],
            },
            POINTERLEAVE_OPTION: {
              actions: ["clearHighlightedItem"],
            },
            CLICK_OPTION: [
              {
                guard: not("closeOnSelect"),
                actions: ["selectItem"],
              },
              {
                target: "focused",
                actions: ["selectItem", "invokeOnClose"],
              },
            ],
            ESCAPE: {
              target: "focused",
              actions: "invokeOnClose",
            },
            CLICK_BUTTON: {
              target: "focused",
              actions: "invokeOnClose",
            },
            INTERACT_OUTSIDE: [
              {
                guard: and("selectOnBlur", "hasHighlightedItem"),
                target: "idle",
                actions: ["selectItem", "invokeOnClose"],
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
              actions: ["highlightFirstItem", "announceOptionCount"],
            },
            ARROW_DOWN: {
              target: "interacting",
              actions: "highlightNextItem",
            },
            ARROW_UP: {
              target: "interacting",
              actions: "highlightPrevItem",
            },
            ALT_ARROW_UP: "focused",
            HOME: {
              target: "interacting",
              actions: ["highlightFirstItem", "preventDefault"],
            },
            END: {
              target: "interacting",
              actions: ["highlightLastItem", "preventDefault"],
            },
            ENTER: [
              {
                guard: and("hasHighlightedItem", "autoComplete"),
                target: "focused",
                actions: "selectHighlightedItem",
              },
              {
                guard: "hasHighlightedItem",
                target: "focused",
                actions: "selectItem",
              },
            ],
            CHANGE: [
              {
                guard: "autoHighlight",
                actions: ["clearHighlightedItem", "setInputValue", "highlightFirstItem"],
              },
              {
                actions: ["clearHighlightedItem", "setInputValue"],
              },
            ],
            ESCAPE: {
              target: "focused",
              actions: "invokeOnClose",
            },
            POINTEROVER_OPTION: {
              target: "interacting",
              actions: "setHighlightedItem",
            },
            POINTERLEAVE_OPTION: {
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
            CLICK_BUTTON: {
              target: "focused",
              actions: "invokeOnClose",
            },
            CLICK_OPTION: [
              {
                guard: not("closeOnSelect"),
                actions: ["selectItem"],
              },
              {
                target: "focused",
                actions: ["selectItem", "invokeOnClose"],
              },
            ],
          },
        },
      },
    },

    {
      guards: {
        openOnClick: (ctx) => !!ctx.openOnClick,
        isInputValueEmpty: (ctx) => ctx.isInputValueEmpty,
        focusOnClear: (ctx) => !!ctx.focusOnClear,
        autoFocus: (ctx) => !!ctx.autoFocus,
        autoComplete: (ctx) => ctx.autoComplete,
        autoHighlight: (ctx) => ctx.autoHighlight,
        isFirstItemHighlighted: (ctx) => ctx.value[0] === ctx.highlightedValue,
        isLastItemHighlighted: (ctx) => ctx.value[ctx.value.length - 1] === ctx.highlightedValue,
        isCustomValue: (ctx) => ctx.inputValue !== ctx.displayValue,
        allowCustomValue: (ctx) => !!ctx.allowCustomValue,
        hasHighlightedItem: (ctx) => !!ctx.highlightedValue,
        selectOnBlur: (ctx) => !!ctx.selectOnBlur,
        closeOnSelect: (ctx) => (!!ctx.multiple ? false : !!ctx.closeOnSelect),
      },

      activities: {
        setupLiveRegion(ctx) {
          ctx.liveRegion = createLiveRegion({
            level: "assertive",
            document: dom.getDoc(ctx),
          })
          return () => {
            ctx.liveRegion?.destroy()
          }
        },
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
          if (!ctx.ariaHidden) return
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
          return observeAttributes(inputEl, ["aria-activedescendant"], () => {
            const state = getState()

            const isTyping = !keydownEventRegex.test(state.event.type)
            if (isTyping || !ctx.highlightedValue) return

            const optionEl = dom.getHighlightedItemEl(ctx)
            optionEl?.scrollIntoView({ block: "nearest" })
          })
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
        selectItem(ctx, evt) {
          set.selectedItem(ctx, evt.value)
        },
        blurInputIfNeeded(ctx) {
          if (ctx.autoComplete || !ctx.blurOnSelect) return
          raf(() => {
            dom.getInputEl(ctx)?.blur()
          })
        },
        focusInput(ctx, evt) {
          if (evt.type === "CHANGE") return
          dom.focusInput(ctx)
        },
        syncInputValue(ctx, evt) {
          const isTyping = !keydownEventRegex.test(evt.type)
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
          if (ctx.hasSelectedItems) {
            set.inputValue(ctx, ctx.displayValue)
          } else {
            set.inputValue(ctx, "")
          }
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
          ctx.onOpenChange?.(true)
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.(false)
        },
        highlightFirstItem(ctx) {
          const firstKey = ctx.collection.getFirstKey()
          if (!firstKey) return
          set.highlightedItem(ctx, firstKey)
        },
        highlightLastItem(ctx) {
          const lastKey = ctx.collection.getLastKey()
          if (!lastKey) return
          set.highlightedItem(ctx, lastKey)
        },
        highlightNextItem(ctx) {
          const nextKey = ctx.collection.getKeysAfter(ctx.highlightedValue)
          if (!nextKey) return
          set.highlightedItem(ctx, nextKey)
        },
        highlightPrevItem(ctx) {
          const prevKey = ctx.collection.getKeysBefore(ctx.highlightedValue)
          if (!prevKey) return
          set.highlightedItem(ctx, prevKey)
        },
        highlightFirstSelectedItem(ctx) {
          const [firstKey] = ctx.collection.sortKeys(ctx.value)
          set.highlightedItem(ctx, firstKey)
        },
        announceOptionCount(ctx) {
          raf(() => {
            const count = ctx.collection.getCount()
            const text = ctx.translations.countAnnouncement(count)
            ctx.liveRegion?.announce(text)
          })
        },
        setIsHovering(ctx) {
          ctx.isHovering = true
        },
        clearIsHovering(ctx) {
          ctx.isHovering = false
        },
        preventDefault(_ctx, evt) {
          evt.preventDefault()
        },
        setSectionLabel(ctx) {
          // const label = dom.getClosestSectionLabel(ctx)
          // if (!label) return
          // ctx.sectionLabel = label
        },
      },
    },
  )
}

const invoke = {
  selectionChange: (ctx: MachineContext) => {
    ctx.onValueChange?.({ value: Array.from(ctx.value), items: ctx.selectedItems })
    ctx.inputValue = ctx.displayValue
  },
  highlightChange: (ctx: MachineContext) => {
    ctx.onHighlightChange?.({ value: ctx.highlightedValue, item: ctx.highlightedItem })
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

    const nextValue = ctx.multiple ? addOrRemove(ctx.value, value!) : [value!]
    ctx.value = nextValue
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
  inputDisplayValue: (ctx: MachineContext) => {
    ctx.inputValue = ctx.displayValue
  },
  inputValue: (ctx: MachineContext, value: string) => {
    ctx.inputValue = value
    invoke.inputChange(ctx)
  },
}
