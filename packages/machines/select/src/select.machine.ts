import { createMachine } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { getByTypeahead, raf } from "@zag-js/dom-query"
import { setElementValue, trackFormControl } from "@zag-js/form-utils"
import { observeAttributes } from "@zag-js/mutation-observer"
import { getPlacement } from "@zag-js/popper"
import { proxyTabFocus } from "@zag-js/tabbable"
import { compact, json } from "@zag-js/utils"
import { dom } from "./select.dom"
import type { MachineContext, MachineState, Option, UserDefinedContext } from "./select.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "select",
      context: {
        selectOnTab: false,
        selectedOption: null,
        highlightedOption: null,
        loop: false,
        closeOnSelect: true,
        ...ctx,
        prevSelectedOption: null,
        prevHighlightedOption: null,
        typeahead: getByTypeahead.defaultOptions,
        positioning: {
          placement: "bottom-start",
          gutter: 8,
          ...ctx.positioning,
        },
      },

      computed: {
        hasSelectedOption: (ctx) => ctx.selectedOption != null,
        isTypingAhead: (ctx) => ctx.typeahead.keysSoFar !== "",
        isInteractive: (ctx) => !(ctx.disabled || ctx.readOnly),
        selectedId: (ctx) => (ctx.selectedOption ? dom.getOptionId(ctx, ctx.selectedOption.value) : null),
        highlightedId: (ctx) => (ctx.highlightedOption ? dom.getOptionId(ctx, ctx.highlightedOption.value) : null),
        hasSelectedChanged: (ctx) => ctx.selectedOption?.value !== ctx.prevSelectedOption?.value,
        hasHighlightedChanged: (ctx) => ctx.highlightedOption?.value !== ctx.prevHighlightedOption?.value,
      },

      initial: "idle",

      watch: {
        selectedOption: ["syncSelectElement"],
      },

      on: {
        HIGHLIGHT_OPTION: {
          actions: ["setHighlightedOption"],
        },
        SELECT_OPTION: {
          actions: ["setSelectedOption"],
        },
        CLEAR_SELECTED: {
          actions: ["clearSelectedOption"],
        },
      },

      activities: ["trackFormControlState"],

      states: {
        idle: {
          tags: ["closed"],
          on: {
            TRIGGER_CLICK: {
              target: "open",
            },
            TRIGGER_FOCUS: {
              target: "focused",
            },
            OPEN: {
              target: "open",
            },
          },
        },

        focused: {
          tags: ["closed"],
          entry: ["focusTrigger", "clearHighlightedOption"],
          on: {
            TRIGGER_CLICK: {
              target: "open",
            },
            TRIGGER_BLUR: {
              target: "idle",
              actions: ["clearHighlightedOption"],
            },
            TRIGGER_KEY: {
              target: "open",
            },
            ARROW_UP: {
              target: "open",
              actions: ["highlightLastOption"],
            },
            ARROW_DOWN: {
              target: "open",
              actions: ["highlightFirstOption"],
            },
            ARROW_LEFT: [
              {
                guard: "hasSelectedOption",
                actions: ["selectPreviousOption"],
              },
              {
                actions: ["selectLastOption"],
              },
            ],
            ARROW_RIGHT: [
              {
                guard: "hasSelectedOption",
                actions: ["selectNextOption"],
              },
              {
                actions: ["selectFirstOption"],
              },
            ],
            HOME: {
              actions: ["selectFirstOption"],
            },
            END: {
              actions: ["selectLastOption"],
            },
            TYPEAHEAD: {
              actions: ["selectMatchingOption"],
            },
            OPEN: {
              target: "open",
            },
          },
        },

        open: {
          tags: ["open"],
          entry: ["focusContent", "highlightSelectedOption", "invokeOnOpen"],
          exit: ["scrollContentToTop"],
          activities: ["trackInteractOutside", "computePlacement", "scrollToHighlightedOption", "proxyTabFocus"],
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
                target: "focused",
                actions: ["selectHighlightedOption", "invokeOnClose"],
                guard: "closeOnSelect",
              },
              {
                actions: ["selectHighlightedOption"],
              },
            ],
            TRIGGER_KEY: [
              {
                target: "focused",
                actions: ["selectHighlightedOption", "invokeOnClose"],
                guard: "closeOnSelect",
              },
              {
                actions: ["selectHighlightedOption"],
              },
            ],
            BLUR: {
              target: "focused",
              actions: ["invokeOnClose"],
            },
            HOME: {
              actions: ["highlightFirstOption"],
            },
            END: {
              actions: ["highlightLastOption"],
            },
            ARROW_DOWN: [
              {
                guard: "hasHighlightedOption",
                actions: ["highlightNextOption"],
              },
              {
                actions: ["highlightFirstOption"],
              },
            ],
            ARROW_UP: [
              {
                guard: "hasHighlightedOption",
                actions: ["highlightPreviousOption"],
              },
              {
                actions: ["highlightLastOption"],
              },
            ],
            TYPEAHEAD: {
              actions: ["highlightMatchingOption"],
            },
            POINTER_MOVE: {
              actions: ["highlightOption"],
            },
            POINTER_LEAVE: {
              actions: ["clearHighlightedOption"],
            },
            TAB: [
              {
                target: "idle",
                actions: ["selectHighlightedOption", "invokeOnClose", "clearHighlightedOption"],
                guard: "selectOnTab",
              },
              {
                target: "idle",
                actions: ["invokeOnClose", "clearHighlightedOption"],
              },
            ],
          },
        },
      },
    },
    {
      guards: {
        hasHighlightedOption: (ctx) => ctx.highlightedId != null,
        selectOnTab: (ctx) => !!ctx.selectOnTab,
        hasSelectedOption: (ctx) => ctx.hasSelectedOption,
        closeOnSelect: (ctx) => !!ctx.closeOnSelect,
      },
      activities: {
        proxyTabFocus(ctx) {
          return proxyTabFocus(dom.getContentElement(ctx), {
            defer: true,
            triggerElement: dom.getTriggerElement(ctx),
            onFocus(el: HTMLElement) {
              raf(() => el.focus({ preventScroll: true }))
            },
          })
        },
        trackFormControlState(ctx, _evt, { initialContext }) {
          return trackFormControl(dom.getHiddenSelectElement(ctx), {
            onFieldsetDisabled() {
              ctx.disabled = true
            },
            onFormReset() {
              set.selectedOption(ctx, initialContext.selectedOption)
            },
          })
        },
        trackInteractOutside(ctx, _evt, { send }) {
          let focusable = false
          return trackDismissableElement(dom.getContentElement(ctx), {
            defer: true,
            exclude: [dom.getTriggerElement(ctx)],
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
          return getPlacement(dom.getTriggerElement(ctx), dom.getPositionerElement(ctx), {
            defer: true,
            ...ctx.positioning,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        scrollToHighlightedOption(ctx, _evt, { getState }) {
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

          return observeAttributes(dom.getContentElement(ctx), ["aria-activedescendant"], exec)
        },
      },
      actions: {
        highlightPreviousOption(ctx) {
          if (!ctx.highlightedId) return
          const option = dom.getPreviousOption(ctx, ctx.highlightedId)
          set.highlightedOption(ctx, dom.getOptionData(option))
        },
        highlightNextOption(ctx) {
          if (!ctx.highlightedId) return
          const option = dom.getNextOption(ctx, ctx.highlightedId)
          set.highlightedOption(ctx, dom.getOptionData(option))
        },
        highlightFirstOption(ctx) {
          const option = dom.getFirstOption(ctx)
          set.highlightedOption(ctx, dom.getOptionData(option))
        },
        highlightLastOption(ctx) {
          const option = dom.getLastOption(ctx)
          set.highlightedOption(ctx, dom.getOptionData(option))
        },
        focusContent(ctx) {
          raf(() => {
            dom.getContentElement(ctx)?.focus({ preventScroll: true })
          })
        },
        focusTrigger(ctx, evt) {
          if (evt.focusable) return
          raf(() => {
            dom.getTriggerElement(ctx)?.focus({ preventScroll: true })
          })
        },
        selectHighlightedOption(ctx, evt) {
          const id = evt.id ?? ctx.highlightedId
          if (!id) return
          const option = dom.getById(ctx, id)
          set.selectedOption(ctx, dom.getOptionData(option))
        },
        selectFirstOption(ctx) {
          const option = dom.getFirstOption(ctx)
          set.selectedOption(ctx, dom.getOptionData(option))
        },
        selectLastOption(ctx) {
          const option = dom.getLastOption(ctx)
          set.selectedOption(ctx, dom.getOptionData(option))
        },
        selectNextOption(ctx) {
          if (!ctx.selectedId) return
          const option = dom.getNextOption(ctx, ctx.selectedId)
          set.selectedOption(ctx, dom.getOptionData(option))
        },
        selectPreviousOption(ctx) {
          if (!ctx.selectedId) return
          const option = dom.getPreviousOption(ctx, ctx.selectedId)
          set.selectedOption(ctx, dom.getOptionData(option))
        },
        highlightSelectedOption(ctx) {
          set.highlightedOption(ctx, ctx.selectedOption)
        },
        highlightOption(ctx, evt) {
          const option = evt.target ?? dom.getById(ctx, evt.id)
          set.highlightedOption(ctx, dom.getOptionData(option))
        },
        highlightMatchingOption(ctx, evt) {
          const option = dom.getMatchingOption(ctx, evt.key, ctx.highlightedId)
          set.highlightedOption(ctx, dom.getOptionData(option))
        },
        selectMatchingOption(ctx, evt) {
          const option = dom.getMatchingOption(ctx, evt.key, ctx.selectedId)
          set.selectedOption(ctx, dom.getOptionData(option))
        },
        setHighlightedOption(ctx, evt) {
          set.highlightedOption(ctx, evt.value)
        },
        clearHighlightedOption(ctx) {
          set.highlightedOption(ctx, null, true)
        },
        setSelectedOption(ctx, evt) {
          set.selectedOption(ctx, evt.value)
        },
        clearSelectedOption(ctx) {
          set.selectedOption(ctx, null, true)
        },
        scrollContentToTop(ctx) {
          dom.getContentElement(ctx)?.scrollTo(0, 0)
        },
        invokeOnOpen(ctx) {
          ctx.onOpen?.()
        },
        invokeOnClose(ctx) {
          ctx.onClose?.()
        },
        syncSelectElement(ctx) {
          const selectedOption = ctx.selectedOption
          const node = dom.getHiddenSelectElement(ctx)
          if (!node || !selectedOption) return
          setElementValue(node, selectedOption.value, { type: "HTMLSelectElement" })
        },
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
    ctx.onChange?.(json(ctx.selectedOption))
    dispatchChangeEvent(ctx)
  },
  highlightChange: (ctx: MachineContext) => {
    ctx.onHighlight?.(json(ctx.highlightedOption))
  },
}

const set = {
  selectedOption: (ctx: MachineContext, value: Option | null | undefined, force = false) => {
    // TODO: account for change
    if (!value && !force) return
    ctx.prevSelectedOption = ctx.selectedOption
    ctx.selectedOption = value || null
    invoke.change(ctx)
  },
  highlightedOption: (ctx: MachineContext, value: Option | null | undefined, force = false) => {
    // TODO: account for change
    if (!value && !force) return
    ctx.prevHighlightedOption = ctx.highlightedOption
    ctx.highlightedOption = value || null
    invoke.highlightChange(ctx)
  },
}
