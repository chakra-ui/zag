import { createMachine } from "@zag-js/core"
import { dom } from "./select.dom"
import { MachineContext, MachineState } from "./select.types"

export const machine = createMachine<MachineContext, MachineState>(
  {
    id: "select",
    context: {
      id: "",
      placeholder: "Select...",
      selectedOption: null,
      focusedId: null,
      selectOnTab: true,
    },
    computed: {
      renderedValue(ctx) {
        return !ctx.selectedOption ? ctx.placeholder : ctx.selectedOption.label
      },
    },

    initial: "idle",
    states: {
      idle: {
        entry: ["clearFocusedOption"],
        on: {
          TRIGGER_CLICK: {
            target: "open",
          },
          FOCUS: {
            target: "focused",
          },
        },
      },
      focused: {
        entry: ["focusTrigger", "clearFocusedOption"],
        on: {
          TRIGGER_CLICK: { target: "open" },
          BLUR: { target: "idle" },
          TYPE_AHEAD: {
            guard: "isPrintableCharacter",
            actions: ["selectMatchingOption"],
          },
          TRIGGER_KEY: {
            target: "open",
          },
          ARROW_UP: {
            target: "open",
            actions: ["focusLastOption"],
          },
          ARROW_DOWN: {
            target: "open",
            actions: ["focusFirstOption"],
          },
        },
      },

      open: {
        entry: ["focusListbox", "focusSelectedOption"],
        on: {
          TRIGGER_CLICK: {
            target: "focused",
          },
          OPTION_CLICK: {
            target: "focused",
            actions: ["selectFocusedOption"],
          },
          TRIGGER_KEY: {
            target: "focused",
            actions: ["selectFocusedOption"],
          },
          ESC_KEY: {
            target: "focused",
          },
          BLUR: {
            target: "idle",
          },
          ARROW_DOWN: [
            {
              guard: "hasFocusedOption",
              actions: ["focusNextOption"],
            },
            { actions: ["focusFirstOption"] },
          ],
          ARROW_UP: [
            {
              guard: "hasFocusedOption",
              actions: ["focusPreviousOption"],
            },
            {
              actions: ["focusLastOption"],
            },
          ],
          TYPE_AHEAD: {
            guard: "isPrintableCharacter",
            actions: ["focusMatchingOption"],
          },
          HOVER: {
            actions: ["focusOption"],
          },
          TAB: [
            {
              target: "idle",
              actions: ["selectFocusedOption"],
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
      hasFocusedOption(context) {
        return Boolean(context.focusedId)
      },
      selectOnTab(context) {
        return Boolean(context.selectOnTab)
      },
      isPrintableCharacter(_context, event) {
        const { key } = event
        return /[0-9a-zA-Z]/g.test(key)
      },
    },
    actions: {
      focusPreviousOption(context) {
        if (!context.focusedId) {
          console.warn("Cannot find previous option elment. Focused id is null")
          return
        }
        const previousOption = dom.getPreviousOption(context, context.focusedId)
        context.focusedId = previousOption.id
      },

      focusNextOption(context) {
        if (!context.focusedId) {
          console.warn("Cannot find next option elment. Focused id is null")
          return
        }
        const nextOption = dom.getNextOption(context, context.focusedId)
        context.focusedId = nextOption.id
      },

      focusFirstOption(context) {
        const firstOption = dom.getFirstOption(context)
        if (firstOption) {
          context.focusedId = firstOption.id
        }
      },

      focusLastOption(context) {
        const lastOption = dom.getLastOption(context)

        if (lastOption) {
          context.focusedId = lastOption.id
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

      selectFocusedOption(context, event) {
        const id = event.id ?? context.focusedId
        if (!id) return
        const focusedOption = dom.getById(context, id)

        if (!focusedOption) return
        const details = dom.getOptionDetails(focusedOption)

        context.selectedOption = details
        // invoke onSelect
      },

      focusSelectedOption(context) {
        if (!context.selectedOption) return
        context.focusedId = context.selectedOption.id
      },

      focusOption(context, event) {
        context.focusedId = event.id
      },

      clearFocusedOption(context) {
        context.focusedId = null
      },

      focusMatchingOption(context, event) {
        const matchingOption = dom.getMatchingOption(context, event.key)
        if (matchingOption) {
          context.focusedId = matchingOption.id
        }
      },
    },
  },
)
