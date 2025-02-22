import { createGuards, createMachine } from "@zag-js/core"
import { add, remove, warn } from "@zag-js/utils"
import * as dom from "./accordion.dom"
import type { AccordionSchema } from "./accordion.types"

const { and, not } = createGuards<AccordionSchema>()

export const machine = createMachine<AccordionSchema>({
  props({ props }) {
    return {
      collapsible: false,
      multiple: false,
      orientation: "vertical",
      defaultValue: [],
      ...props,
    }
  },

  initialState() {
    return "idle"
  },

  context({ prop, bindable }) {
    return {
      focusedValue: bindable<string | null>(() => ({
        defaultValue: null,
        onChange(value) {
          prop("onFocusChange")?.({ value })
        },
      })),
      value: bindable<string[]>(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value) {
          prop("onValueChange")?.({ value })
        },
      })),
    }
  },

  computed: {
    isHorizontal: ({ prop }) => prop("orientation") === "horizontal",
  },

  on: {
    "VALUE.SET": {
      actions: ["setValue"],
    },
  },

  states: {
    idle: {
      on: {
        "TRIGGER.FOCUS": {
          target: "focused",
          actions: ["setFocusedValue"],
        },
      },
    },
    focused: {
      on: {
        "GOTO.NEXT": {
          actions: ["focusNextTrigger"],
        },
        "GOTO.PREV": {
          actions: ["focusPrevTrigger"],
        },
        "TRIGGER.CLICK": [
          {
            guard: and("isExpanded", "canToggle"),
            actions: ["collapse"],
          },
          {
            guard: not("isExpanded"),
            actions: ["expand"],
          },
        ],
        "GOTO.FIRST": {
          actions: ["focusFirstTrigger"],
        },
        "GOTO.LAST": {
          actions: ["focusLastTrigger"],
        },
        "TRIGGER.BLUR": {
          target: "idle",
          actions: ["clearFocusedValue"],
        },
      },
    },
  },

  implementations: {
    guards: {
      canToggle: ({ prop }) => !!prop("collapsible") || !!prop("multiple"),
      isExpanded: ({ context, event }) => context.get("value").includes(event.value),
    },

    actions: {
      collapse({ context, prop, event }) {
        const next = prop("multiple") ? remove<string>(context.get("value"), event.value) : []
        context.set("value", next)
      },
      expand({ context, prop, event }) {
        const next = prop("multiple") ? add<string>(context.get("value"), event.value) : [event.value]
        context.set("value", next)
      },
      focusFirstTrigger({ scope }) {
        dom.getFirstTriggerEl(scope)?.focus()
      },
      focusLastTrigger({ scope }) {
        dom.getLastTriggerEl(scope)?.focus()
      },
      focusNextTrigger({ context, scope }) {
        const focusedValue = context.get("focusedValue")
        if (!focusedValue) return
        const triggerEl = dom.getNextTriggerEl(scope, focusedValue)
        triggerEl?.focus()
      },
      focusPrevTrigger({ context, scope }) {
        const focusedValue = context.get("focusedValue")
        if (!focusedValue) return
        const triggerEl = dom.getPrevTriggerEl(scope, focusedValue)
        triggerEl?.focus()
      },
      setFocusedValue({ context, event }) {
        context.set("focusedValue", event.value)
      },
      clearFocusedValue({ context }) {
        context.set("focusedValue", null)
      },
      setValue({ context, event }) {
        context.set("value", event.value)
      },
      coarseValue({ context, prop }) {
        if (!prop("multiple") && context.get("value").length > 1) {
          warn(`The value of accordion should be a single value when multiple is false.`)
          context.set("value", [context.get("value")[0]])
        }
      },
    },
  },
})
