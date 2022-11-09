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
        data: [],
        placeholder: "Select option",
        selectedOption: null,
        highlightedId: null,
        selectOnTab: true,
        __itemCount: null,
        isPlacementComplete: false,
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
        hasValue: (ctx) => Boolean(ctx.selectedOption),
        isTypingAhead: (ctx) => ctx.typeahead.keysSoFar !== "",
        itemCount(ctx) {
          let itemCount = ctx.data.length
          if (ctx.__itemCount != null) {
            itemCount = ctx.__itemCount
          } else if (ctx.count !== undefined) {
            itemCount = ctx.count
          }
          return itemCount
        },
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
              actions: ["highlightLastOption"],
            },
            ARROW_DOWN: {
              target: "open",
              actions: ["highlightFirstOption"],
            },
            ARROW_LEFT: {
              actions: ["selectPreviousOption"],
            },
            ARROW_RIGHT: {
              actions: ["selectNextOption"],
            },
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
          entry: ["focusMenu", "highlightSelectedOption"],
          exit: ["scrollMenuToTop"],
          activities: ["trackInteractOutside", "computePlacement", "scrollIntoView"],
          on: {
            CLOSE: {
              // should close go to idle?
              target: "focused",
            },
            TRIGGER_CLICK: {
              target: "focused",
            },
            OPTION_CLICK: {
              target: "focused",
              actions: ["selectHighlightedOption"],
            },
            TRIGGER_KEY: {
              target: "focused",
              actions: ["selectHighlightedOption"],
            },
            ESC_KEY: {
              target: "focused",
            },
            BLUR: {
              target: "focused",
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
              { actions: ["highlightFirstOption"] },
            ],
            ARROW_UP: [
              {
                guard: "hasHighlightedOption",
                actions: ["focusPreviousOption"],
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
                actions: ["selectHighlightedOption"],
                guard: "selectOnTab",
              },
              {
                target: "idle",
              },
            ],
          },
        },
      },
    },
    {
      guards: {
        hasHighlightedOption(ctx) {
          return Boolean(ctx.highlightedId)
        },
        selectOnTab(ctx) {
          return Boolean(ctx.selectOnTab)
        },
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
              ctx.isPlacementComplete = true
            },
          })
        },
        scrollIntoView(ctx, _evt) {
          const trigger = dom.getMenuElement(ctx)
          const scrollIntoView = () => {
            const option = dom.getHighlightedOption(ctx)
            option?.scrollIntoView({ block: "nearest" })
          }
          scrollIntoView()
          return observeAttributes(trigger, "aria-activedescendant", scrollIntoView)
        },
      },
      actions: {
        focusPreviousOption(ctx) {
          if (!ctx.highlightedId) return
          const previousOption = dom.getPreviousOption(ctx, ctx.highlightedId)
          if (previousOption) {
            ctx.highlightedId = previousOption.id
          }
        },
        highlightNextOption(ctx) {
          if (!ctx.highlightedId) return
          const nextOption = dom.getNextOption(ctx, ctx.highlightedId)
          if (nextOption) {
            ctx.highlightedId = nextOption.id
          }
        },
        highlightFirstOption(ctx) {
          const firstOption = dom.getFirstOption(ctx)
          if (firstOption) {
            ctx.highlightedId = firstOption.id
          }
        },
        highlightLastOption(ctx) {
          const lastOption = dom.getLastOption(ctx)
          if (lastOption) {
            ctx.highlightedId = lastOption.id
          }
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
          const focusedOption = dom.getById(ctx, id)

          if (!focusedOption) return
          const details = dom.getOptionDetails(focusedOption)

          ctx.selectedOption = details
          // invoke onSelect
        },
        selectFirstOption(ctx) {
          const firstOption = dom.getFirstOption(ctx)
          if (firstOption) {
            const details = dom.getOptionDetails(firstOption)
            ctx.selectedOption = details
          }
        },
        selectLastOption(ctx) {
          const lastOption = dom.getLastOption(ctx)
          if (lastOption) {
            const details = dom.getOptionDetails(lastOption)
            ctx.selectedOption = details
          }
        },
        selectNextOption(ctx) {
          if (!ctx.selectedOption) return
          const nextOption = dom.getNextOption(ctx, ctx.selectedOption.id)
          console.log(nextOption)
          if (nextOption) {
            ctx.selectedOption = dom.getOptionDetails(nextOption)
          }
        },
        selectPreviousOption(ctx) {
          if (!ctx.selectedOption) return
          const previousOption = dom.getPreviousOption(ctx, ctx.selectedOption.id)
          if (previousOption) {
            ctx.selectedOption = dom.getOptionDetails(previousOption)
          }
        },
        highlightSelectedOption(ctx) {
          if (!ctx.selectedOption) return
          ctx.highlightedId = ctx.selectedOption.id
        },
        highlightOption(ctx, evt) {
          ctx.highlightedId = evt.id
        },
        clearHighlightedOption(ctx) {
          ctx.highlightedId = null
        },
        highlightMatchingOption(ctx, evt) {
          const node = dom.getMatchingOption(ctx, evt.key, ctx.highlightedId)
          if (node) {
            ctx.highlightedId = node.id
          }
        },
        selectMatchingOption(ctx, evt) {
          const node = dom.getMatchingOption(ctx, evt.key, ctx.selectedOption?.id)
          if (node) {
            ctx.selectedOption = dom.getOptionDetails(node)
          }
        },
        setHighlightOption(ctx, evt) {
          ctx.highlightedId = evt.id
        },
        scrollMenuToTop(ctx) {
          dom.getMenuElement(ctx)?.scrollTo(0, 0)
        },
      },
    },
  )
}
