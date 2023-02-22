import { createMachine } from "@zag-js/core"
import { contains, raf, getByTypeahead } from "@zag-js/dom-query"
import { setElementValue, trackFormControl } from "@zag-js/form-utils"
import { trackInteractOutside } from "@zag-js/interact-outside"
import { observeAttributes } from "@zag-js/mutation-observer"
import { getPlacement } from "@zag-js/popper"
import { compact, json } from "@zag-js/utils"
import { dom } from "./select.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./select.types"

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
        initialSelectedOption: null,
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
        selectedOption: ["syncSelectValue", "dispatchChangeEvent"],
      },

      on: {
        HIGHLIGHT_OPTION: {
          actions: ["setHighlightedOption", "invokeOnHighlight"],
        },
        SELECT_OPTION: {
          actions: ["setSelectedOption", "invokeOnSelect"],
        },
        CLEAR_SELECTED: {
          actions: ["clearSelectedOption", "invokeOnSelect"],
        },
      },

      entry: ["setInitialSelectedOption"],

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
              actions: ["highlightLastOption", "invokeOnHighlight"],
            },
            ARROW_DOWN: {
              target: "open",
              actions: ["highlightFirstOption", "invokeOnHighlight"],
            },
            ARROW_LEFT: [
              {
                guard: "hasSelectedOption",
                actions: ["selectPreviousOption", "invokeOnSelect"],
              },
              {
                actions: ["selectLastOption", "invokeOnSelect"],
              },
            ],
            ARROW_RIGHT: [
              {
                guard: "hasSelectedOption",
                actions: ["selectNextOption", "invokeOnSelect"],
              },
              {
                actions: ["selectFirstOption", "invokeOnSelect"],
              },
            ],
            HOME: {
              actions: ["selectFirstOption", "invokeOnSelect"],
            },
            END: {
              actions: ["selectLastOption", "invokeOnSelect"],
            },
            TYPEAHEAD: {
              actions: ["selectMatchingOption", "invokeOnSelect"],
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
          activities: ["trackInteractOutside", "computePlacement", "scrollToHighlightedOption"],
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
                actions: ["selectHighlightedOption", "invokeOnSelect", "invokeOnClose"],
                guard: "closeOnSelect",
              },
              {
                actions: ["selectHighlightedOption", "invokeOnSelect"],
              },
            ],
            TRIGGER_KEY: [
              {
                target: "focused",
                actions: ["selectHighlightedOption", "invokeOnSelect", "invokeOnClose"],
                guard: "closeOnSelect",
              },
              {
                actions: ["selectHighlightedOption", "invokeOnSelect"],
              },
            ],
            ESC_KEY: {
              target: "focused",
              actions: ["invokeOnClose"],
            },
            BLUR: {
              target: "focused",
              actions: ["invokeOnClose"],
            },
            HOME: {
              actions: ["highlightFirstOption", "invokeOnHighlight"],
            },
            END: {
              actions: ["highlightLastOption", "invokeOnHighlight"],
            },
            ARROW_DOWN: [
              {
                guard: "hasHighlightedOption",
                actions: ["highlightNextOption", "invokeOnHighlight"],
              },
              {
                actions: ["highlightFirstOption", "invokeOnHighlight"],
              },
            ],
            ARROW_UP: [
              {
                guard: "hasHighlightedOption",
                actions: ["highlightPreviousOption", "invokeOnHighlight"],
              },
              {
                actions: ["highlightLastOption", "invokeOnHighlight"],
              },
            ],
            TYPEAHEAD: {
              actions: ["highlightMatchingOption", "invokeOnHighlight"],
            },
            POINTER_MOVE: {
              actions: ["highlightOption", "invokeOnHighlight"],
            },
            POINTER_LEAVE: {
              actions: ["clearHighlightedOption"],
            },
            TAB: [
              {
                target: "idle",
                actions: ["selectHighlightedOption", "invokeOnClose", "invokeOnSelect", "clearHighlightedOption"],
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
        trackFormControlState(ctx) {
          return trackFormControl(dom.getHiddenSelectElement(ctx), {
            onFieldsetDisabled() {
              ctx.disabled = true
            },
            onFormReset() {
              ctx.prevSelectedOption = ctx.selectedOption
              ctx.selectedOption = ctx.initialSelectedOption
            },
          })
        },
        trackInteractOutside(ctx, _evt, { send }) {
          return trackInteractOutside(dom.getContentElement(ctx), {
            exclude(target) {
              const ignore = [dom.getTriggerElement(ctx)]
              return ignore.some((el) => contains(el, target))
            },
            onInteractOutside() {
              send({ type: "BLUR", src: "interact-outside" })
            },
          })
        },
        computePlacement(ctx) {
          ctx.currentPlacement = ctx.positioning.placement
          return getPlacement(dom.getTriggerElement(ctx), dom.getPositionerElement(ctx), {
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
        setInitialSelectedOption(ctx) {
          ctx.initialSelectedOption = ctx.selectedOption
        },
        highlightPreviousOption(ctx) {
          if (!ctx.highlightedId) return
          const option = dom.getPreviousOption(ctx, ctx.highlightedId)
          highlightOption(ctx, option)
        },
        highlightNextOption(ctx) {
          if (!ctx.highlightedId) return
          const option = dom.getNextOption(ctx, ctx.highlightedId)
          highlightOption(ctx, option)
        },
        highlightFirstOption(ctx) {
          const option = dom.getFirstOption(ctx)
          highlightOption(ctx, option)
        },
        highlightLastOption(ctx) {
          const option = dom.getLastOption(ctx)
          highlightOption(ctx, option)
        },
        focusContent(ctx) {
          raf(() => {
            dom.getContentElement(ctx)?.focus({ preventScroll: true })
          })
        },
        focusTrigger(ctx) {
          raf(() => {
            dom.getTriggerElement(ctx).focus({ preventScroll: true })
          })
        },
        selectHighlightedOption(ctx, evt) {
          const id = evt.id ?? ctx.highlightedId
          if (!id) return
          const option = dom.getById(ctx, id)
          selectOption(ctx, option)
        },
        selectFirstOption(ctx) {
          const option = dom.getFirstOption(ctx)
          selectOption(ctx, option)
        },
        selectLastOption(ctx) {
          const option = dom.getLastOption(ctx)
          selectOption(ctx, option)
        },
        selectNextOption(ctx) {
          if (!ctx.selectedId) return
          const option = dom.getNextOption(ctx, ctx.selectedId)
          selectOption(ctx, option)
        },
        selectPreviousOption(ctx) {
          if (!ctx.selectedId) return
          const option = dom.getPreviousOption(ctx, ctx.selectedId)
          selectOption(ctx, option)
        },
        highlightSelectedOption(ctx) {
          if (!ctx.selectedOption) return
          ctx.prevHighlightedOption = ctx.highlightedOption
          ctx.highlightedOption = ctx.selectedOption
        },
        highlightOption(ctx, evt) {
          const option = evt.target ?? dom.getById(ctx, evt.id)
          highlightOption(ctx, option)
        },
        highlightMatchingOption(ctx, evt) {
          const option = dom.getMatchingOption(ctx, evt.key, ctx.highlightedId)
          highlightOption(ctx, option)
        },
        selectMatchingOption(ctx, evt) {
          const option = dom.getMatchingOption(ctx, evt.key, ctx.selectedId)
          selectOption(ctx, option)
        },
        setHighlightedOption(ctx, evt) {
          if (!evt.value) return
          ctx.prevHighlightedOption = ctx.highlightedOption
          ctx.highlightedOption = evt.value
        },
        clearHighlightedOption(ctx) {
          ctx.highlightedOption = null
        },
        setSelectedOption(ctx, evt) {
          if (!evt.value) return
          ctx.prevSelectedOption = ctx.selectedOption
          ctx.selectedOption = evt.value
        },
        clearSelectedOption(ctx) {
          ctx.selectedOption = null
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
        invokeOnHighlight(ctx) {
          if (!ctx.hasHighlightedChanged) return
          ctx.onHighlight?.(json(ctx.highlightedOption))
        },
        invokeOnSelect(ctx) {
          if (!ctx.hasSelectedChanged) return
          ctx.onChange?.(json(ctx.selectedOption))
        },
        syncSelectValue(ctx) {
          const selectedOption = ctx.selectedOption
          const node = dom.getHiddenSelectElement(ctx)
          if (!node || !selectedOption) return
          setElementValue(node, selectedOption.value, { type: "HTMLSelectElement" })
        },
        dispatchChangeEvent(ctx) {
          const node = dom.getHiddenSelectElement(ctx)
          if (!node) return
          const win = dom.getWin(ctx)
          const changeEvent = new win.Event("change", { bubbles: true })
          node.dispatchEvent(changeEvent)
        },
      },
    },
  )
}

function highlightOption(ctx: MachineContext, option?: HTMLElement | null) {
  if (!option) return
  ctx.prevHighlightedOption = ctx.highlightedOption
  ctx.highlightedOption = dom.getOptionDetails(option)
}

function selectOption(ctx: MachineContext, option?: HTMLElement | null) {
  if (!option) return
  ctx.prevSelectedOption = ctx.selectedOption
  ctx.selectedOption = dom.getOptionDetails(option)
}
