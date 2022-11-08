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
        placeholder: "Select...",
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
        rendered(ctx) {
          return !ctx.selectedOption ? ctx.placeholder : ctx.selectedOption.label
        },
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
      states: {
        idle: {
          entry: ["clearHighlightedOption"],
          on: {
            TRIGGER_CLICK: {
              target: "open",
            },
            TRIGGER_FOCUS: {
              target: "focused",
            },
          },
        },

        focused: {
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
            HOME: {
              target: "open",
              actions: ["highlightFirstOption"],
            },
            END: {
              target: "open",
              actions: ["highlightLastOption"],
            },
            TYPEAHEAD: {
              actions: ["selectMatchingOption"],
            },
          },
        },

        open: {
          entry: ["focusListbox", "highlightSelectedOption"],
          activities: ["trackInteractOutside", "computePlacement", "scrollIntoView"],
          on: {
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
            HOVER: {
              actions: ["highlightOption"],
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
        hasHighlightedOption(context) {
          return Boolean(context.highlightedId)
        },
        selectOnTab(context) {
          return Boolean(context.selectOnTab)
        },
      },
      activities: {
        trackInteractOutside(ctx, _evt, { send }) {
          return trackInteractOutside(dom.getListboxElement(ctx), {
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
          const trigger = dom.getTriggerElement(ctx)
          return observeAttributes(trigger, "aria-activedescendant", () => {
            // if (!ctx.isKeyboardEvent) return
            const option = dom.getHighlightedOption(ctx)
            option?.scrollIntoView({ block: "nearest" })
          })
        },
      },
      actions: {
        focusPreviousOption(context) {
          if (!context.highlightedId) {
            console.warn("Cannot find previous option elment. Focused id is null")
            return
          }
          const previousOption = dom.getPreviousOption(context, context.highlightedId)
          context.highlightedId = previousOption.id
        },

        highlightNextOption(context) {
          if (!context.highlightedId) {
            console.warn("Cannot find next option elment. Focused id is null")
            return
          }
          const nextOption = dom.getNextOption(context, context.highlightedId)
          context.highlightedId = nextOption.id
        },

        highlightFirstOption(context) {
          const firstOption = dom.getFirstOption(context)
          if (firstOption) {
            context.highlightedId = firstOption.id
          }
        },

        highlightLastOption(context) {
          const lastOption = dom.getLastOption(context)

          if (lastOption) {
            context.highlightedId = lastOption.id
          }
        },

        focusListbox(context) {
          setTimeout(() => {
            dom.getListboxElement(context)?.focus()
          }, 0)
        },

        focusTrigger(context) {
          setTimeout(() => {
            dom.getTriggerElement(context).focus()
          }, 0)
        },

        selectHighlightedOption(context, event) {
          const id = event.id ?? context.highlightedId
          if (!id) return
          const focusedOption = dom.getById(context, id)

          if (!focusedOption) return
          const details = dom.getOptionDetails(focusedOption)

          context.selectedOption = details
          // invoke onSelect
        },

        highlightSelectedOption(context) {
          if (!context.selectedOption) return
          context.highlightedId = context.selectedOption.id
        },

        highlightOption(context, event) {
          context.highlightedId = event.id
        },

        clearHighlightedOption(context) {
          context.highlightedId = null
        },

        highlightMatchingOption(context, event) {
          const node = dom.getMatchingOption(context, event.key)
          if (node) {
            context.highlightedId = node.id
          }
        },

        selectMatchingOption(context, event) {
          const node = dom.getMatchingOption(context, event.key)
          if (node) {
            context.selectedOption = dom.getOptionDetails(node)
          }
        },
      },
    },
  )
}
