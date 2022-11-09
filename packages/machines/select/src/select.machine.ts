import { createMachine } from "@zag-js/core"
import { contains, findByTypeahead, observeAttributes } from "@zag-js/dom-utils"
import { trackInteractOutside } from "@zag-js/interact-outside"
import { getPlacement } from "@zag-js/popper"
import { compact } from "@zag-js/utils"
import { dom } from "./select.dom"
import { MachineContext, MachineState, UserDefinedContext } from "./select.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "select",
      context: {
        placeholder: "Select option",
        selectedOption: null,
        highlightedId: null,
        highlightedData: null,
        selectOnTab: true,
        typeahead: findByTypeahead.defaultOptions,
        ...ctx,
        positioning: {
          placement: "bottom-start",
          gutter: 8,
          ...ctx.positioning,
        },
      },
      computed: {
        rendered: (ctx) => (!ctx.selectedOption ? ctx.placeholder : ctx.selectedOption.label),
        hasValue: (ctx) => !!ctx.selectedOption,
        isTypingAhead: (ctx) => ctx.typeahead.keysSoFar !== "",
      },

      initial: "idle",

      on: {
        SET_HIGHLIGHT: {
          actions: ["setHighlightOption"],
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
            ARROW_LEFT: {
              actions: ["selectPreviousOption", "invokeOnSelect"],
            },
            ARROW_RIGHT: {
              actions: ["selectNextOption", "invokeOnSelect"],
            },
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
          activities: ["trackInteractOutside", "computePlacement", "scrollIntoView"],
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
        scrollIntoView(ctx, _evt, { getState }) {
          const trigger = dom.getMenuElement(ctx)
          const scrollIntoView = () => {
            const state = getState()
            // don't scroll into view if we're using the pointer
            if (state.event.type === "POINTER_MOVE") return
            const option = dom.getHighlightedOption(ctx)
            option?.scrollIntoView({ block: "nearest" })
          }
          scrollIntoView()
          return observeAttributes(trigger, "aria-activedescendant", scrollIntoView)
        },
      },
      actions: {
        highlightPreviousOption(ctx) {
          if (!ctx.highlightedId) return
          const option = dom.getPreviousOption(ctx, ctx.highlightedId)
          if (!option) return
          ctx.highlightedId = option.id
          ctx.highlightedData = dom.getOptionDetails(option)
        },
        highlightNextOption(ctx) {
          if (!ctx.highlightedId) return
          const option = dom.getNextOption(ctx, ctx.highlightedId)
          if (!option) return
          ctx.highlightedId = option.id
          ctx.highlightedData = dom.getOptionDetails(option)
        },
        highlightFirstOption(ctx) {
          const option = dom.getFirstOption(ctx)
          if (!option) return
          ctx.highlightedId = option.id
          ctx.highlightedData = dom.getOptionDetails(option)
        },
        highlightLastOption(ctx) {
          const option = dom.getLastOption(ctx)
          if (!option) return
          ctx.highlightedId = option.id
          ctx.highlightedData = dom.getOptionDetails(option)
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
          if (!option) return

          const details = dom.getOptionDetails(option)
          ctx.selectedOption = details
        },
        selectFirstOption(ctx) {
          const option = dom.getFirstOption(ctx)
          if (!option) return
          const details = dom.getOptionDetails(option)
          ctx.selectedOption = details
        },
        selectLastOption(ctx) {
          const option = dom.getLastOption(ctx)
          if (!option) return
          const details = dom.getOptionDetails(option)
          ctx.selectedOption = details
        },
        selectNextOption(ctx) {
          if (!ctx.selectedOption) return
          const option = dom.getNextOption(ctx, ctx.selectedOption.id)
          if (!option) return
          ctx.selectedOption = dom.getOptionDetails(option)
        },
        selectPreviousOption(ctx) {
          if (!ctx.selectedOption) return
          const option = dom.getPreviousOption(ctx, ctx.selectedOption.id)
          if (!option) return
          ctx.selectedOption = dom.getOptionDetails(option)
        },
        highlightSelectedOption(ctx) {
          if (!ctx.selectedOption) return
          ctx.highlightedId = ctx.selectedOption.id
          ctx.highlightedData = ctx.selectedOption
        },
        highlightOption(ctx, evt) {
          ctx.highlightedId = evt.id
        },
        clearHighlightedOption(ctx) {
          ctx.highlightedId = null
          ctx.highlightedData = null
        },
        highlightMatchingOption(ctx, evt) {
          const option = dom.getMatchingOption(ctx, evt.key, ctx.highlightedId)
          if (!option) return
          ctx.highlightedId = option.id
          ctx.highlightedData = dom.getOptionDetails(option)
        },
        selectMatchingOption(ctx, evt) {
          const option = dom.getMatchingOption(ctx, evt.key, ctx.selectedOption?.id)
          if (!option) return
          const details = dom.getOptionDetails(option)
          ctx.selectedOption = details
          ctx.highlightedData = details
        },
        setHighlightOption(ctx, evt) {
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
          ctx.onHighlight?.(ctx.highlightedData)
        },
        invokeOnSelect(ctx) {
          ctx.onChange?.(ctx.selectedOption)
        },
      },
    },
  )
}
