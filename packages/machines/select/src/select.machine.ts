import { createMachine } from "@zag-js/core"
import { contains, findByTypeahead, observeAttributes } from "@zag-js/dom-utils"
import { trackInteractOutside } from "@zag-js/interact-outside"
import { getPlacement } from "@zag-js/popper"
import { compact, json } from "@zag-js/utils"
import { dom } from "./select.dom"
import { MachineContext, MachineState, UserDefinedContext } from "./select.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "select",
      context: {
        placeholder: "Select option",
        selectOnTab: true,
        ...ctx,
        selectedOption: null,
        previousSelectedId: null,
        highlightedId: null,
        previousHighlightedId: null,
        highlightedOption: null,
        typeahead: findByTypeahead.defaultOptions,
        positioning: {
          placement: "bottom-start",
          gutter: 8,
          ...ctx.positioning,
        },
      },

      computed: {
        rendered: (ctx) => (!ctx.selectedOption ? ctx.placeholder : ctx.selectedOption.label),
        hasValue: (ctx) => ctx.selectedOption != null,
        isTypingAhead: (ctx) => ctx.typeahead.keysSoFar !== "",
      },

      initial: "idle",

      on: {
        SET_HIGHLIGHT: {
          actions: ["setHighlighted"],
        },
      },

      states: {
        idle: {
          tags: ["closed"],
          entry: ["clearHighlightedOption"],
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
            TRIGGER_CLICK: { target: "open" },
            TRIGGER_BLUR: { target: "idle" },
            BLUR: { target: "idle" },
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
                guard: "hasValue",
                actions: ["selectPreviousOption", "invokeOnSelect"],
              },
              {
                actions: ["selectLastOption", "invokeOnSelect"],
              },
            ],
            ARROW_RIGHT: [
              {
                guard: "hasValue",
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
          entry: ["focusMenu", "highlightSelectedOption", "invokeOnOpen"],
          exit: ["scrollMenuToTop"],
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
            OPTION_CLICK: {
              target: "focused",
              actions: ["selectHighlightedOption", "invokeOnClose", "invokeOnSelect"],
            },
            TRIGGER_KEY: {
              target: "focused",
              actions: ["selectHighlightedOption", "invokeOnClose", "invokeOnSelect"],
            },
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
                actions: ["selectHighlightedOption", "invokeOnClose", "invokeOnSelect"],
                guard: "selectOnTab",
              },
              {
                target: "idle",
                actions: ["invokeOnClose"],
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
        hasValue: (ctx) => ctx.hasValue,
      },
      activities: {
        trackInteractOutside(ctx, _evt, { send }) {
          return trackInteractOutside(dom.getMenuElement(ctx), {
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
          const trigger = dom.getMenuElement(ctx)
          const exec = () => {
            const state = getState()
            // don't scroll into view if we're using the pointer
            if (state.event.type === "POINTER_MOVE") return
            const option = dom.getHighlightedOption(ctx)
            option?.scrollIntoView({ block: "nearest" })
          }
          exec()
          return observeAttributes(trigger, "aria-activedescendant", exec)
        },
      },
      actions: {
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
        focusMenu(ctx) {
          setTimeout(() => {
            dom.getMenuElement(ctx)?.focus({ preventScroll: true })
          }, 0)
        },
        focusTrigger(ctx) {
          setTimeout(() => {
            dom.getTriggerElement(ctx).focus({ preventScroll: true })
          }, 0)
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
          if (!ctx.selectedOption) return
          const option = dom.getNextOption(ctx, ctx.selectedOption.id)
          selectOption(ctx, option)
        },
        selectPreviousOption(ctx) {
          if (!ctx.selectedOption) return
          const option = dom.getPreviousOption(ctx, ctx.selectedOption.id)
          selectOption(ctx, option)
        },
        highlightSelectedOption(ctx) {
          if (!ctx.selectedOption) return
          ctx.previousHighlightedId = ctx.highlightedId
          ctx.highlightedId = ctx.selectedOption.id
          ctx.highlightedOption = ctx.selectedOption
        },
        highlightOption(ctx, evt) {
          const option = evt.target ?? dom.getById(ctx, evt.id)
          highlightOption(ctx, option)
        },
        clearHighlightedOption(ctx) {
          ctx.highlightedId = null
          ctx.highlightedOption = null
        },
        highlightMatchingOption(ctx, evt) {
          const option = dom.getMatchingOption(ctx, evt.key, ctx.highlightedId)
          highlightOption(ctx, option)
        },
        selectMatchingOption(ctx, evt) {
          const option = dom.getMatchingOption(ctx, evt.key, ctx.selectedOption?.id)
          selectOption(ctx, option)
        },
        setHighlighted(ctx, evt) {
          ctx.highlightedId = evt.id
        },
        scrollMenuToTop(ctx) {
          dom.getMenuElement(ctx)?.scrollTo(0, 0)
        },
        invokeOnOpen(ctx) {
          ctx.onOpen?.()
        },
        invokeOnClose(ctx) {
          ctx.onClose?.()
        },
        invokeOnHighlight(ctx) {
          if (ctx.previousHighlightedId === ctx.highlightedId) return
          ctx.onHighlight?.(json(ctx.highlightedOption))
        },
        invokeOnSelect(ctx) {
          if (ctx.previousSelectedId === ctx.selectedOption?.id) return
          ctx.onChange?.(json(ctx.selectedOption))
        },
      },
    },
  )
}

function highlightOption(ctx: MachineContext, option?: HTMLElement | null) {
  if (!option) return
  ctx.previousHighlightedId = ctx.highlightedId
  ctx.highlightedId = option.id
  ctx.highlightedOption = dom.getOptionDetails(option)
}

function selectOption(ctx: MachineContext, option?: HTMLElement | null) {
  if (!option) return
  if (ctx.selectedOption) {
    ctx.previousSelectedId = ctx.selectedOption.id
  }
  ctx.selectedOption = dom.getOptionDetails(option)
}
