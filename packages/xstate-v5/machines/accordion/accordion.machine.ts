import type { MachineContext, MachineEvent, MachineInput } from "./accordion.types"
import { dom } from "./accordion.dom"
import { assertEvent, assign, setup, and, not } from "xstate"
import { add, isEqual, remove, warn } from "@zag-js/utils"

function coarseValue(context: MachineContext, value: string[]): string[] {
  if (!context.multiple && context.value.length > 1) {
    warn(`The value of accordion should be a single value when multiple is false.`)
    return [value[0]]
  }

  return value
}

export const accordionMachine = setup({
  types: {
    context: {} as MachineContext,
    input: {} as MachineInput,
    events: {} as MachineEvent,
  },
  actions: {
    setFocusedValue: assign({
      focusedValue: ({ context, event }) => {
        assertEvent(event, "TRIGGER.FOCUS")

        if (isEqual(context.focusedValue, event.value)) {
          return context.focusedValue
        }

        context.onFocusChange?.({ value: event.value })

        return event.value
      },
    }),
    focusNextTrigger: ({ context }) => {
      if (!context.focusedValue) return
      const triggerEl = dom.getNextTriggerEl(context, context.focusedValue)
      triggerEl?.focus()
    },
    focusPrevTrigger: ({ context }) => {
      if (!context.focusedValue) return
      const triggerEl = dom.getPrevTriggerEl(context, context.focusedValue)
      triggerEl?.focus()
    },
    collapse: assign({
      value: ({ context, event }) => {
        assertEvent(event, "TRIGGER.CLICK")

        const next = context.multiple ? remove(context.value, event.value) : []
        const nextCoarsed = coarseValue(context, context.multiple ? next : [])

        if (isEqual(context.value, nextCoarsed)) {
          return context.value
        }

        context.onValueChange?.({ value: nextCoarsed })

        return nextCoarsed
      },
    }),
    expand: assign({
      value: ({ context, event }) => {
        assertEvent(event, "TRIGGER.CLICK")

        const next = context.multiple ? add(context.value, event.value) : [event.value]
        const nextCoarsed = coarseValue(context, next)

        if (isEqual(context.value, nextCoarsed)) {
          return context.value
        }

        context.onValueChange?.({ value: nextCoarsed })

        return nextCoarsed
      },
    }),
    focusFirstTrigger: ({ context }) => {
      dom.getFirstTriggerEl(context)?.focus()
    },
    focusLastTrigger: ({ context }) => {
      dom.getLastTriggerEl(context)?.focus()
    },
    clearFocusedValue: assign({
      focusedValue: ({ context }) => {
        if (isEqual(context.focusedValue, null)) {
          return context.focusedValue
        }

        context.onFocusChange?.({ value: null })

        return null
      },
    }),
    setValue: assign({
      value: ({ context, event }) => {
        assertEvent(event, "VALUE.SET")

        const nextValue = coarseValue(context, event.value)
        if (isEqual(context.value, nextValue)) {
          return context.value
        }

        context.onValueChange?.({ value: nextValue })

        return nextValue
      },
    }),
    syncContext: assign(({ context, event }) => {
      assertEvent(event, "CONTEXT.SYNC")

      const mergedContext = Object.assign({}, context, event.updatedContext)

      const nextContext = Object.assign(mergedContext, {
        value: coarseValue(mergedContext, mergedContext.value),
      })

      if (!isEqual(context.value, nextContext.value)) {
        context.onValueChange?.({ value: nextContext.value })
      }

      return nextContext
    }),
  },
  guards: {
    isExpanded: ({ context, event }) => {
      assertEvent(event, "TRIGGER.CLICK")

      return context.value.includes(event.value)
    },
    canToggle: ({ context }) => !!context.collapsible || !!context.multiple,
  },
}).createMachine({
  id: "accordion",

  context: ({ input }) => {
    const initialContext: MachineContext = {
      focusedValue: null,
      value: [],
      collapsible: false,
      multiple: false,
      orientation: "vertical",
      ...input,
    }

    return {
      ...initialContext,
      value: coarseValue(initialContext, input.value ?? []),
    }
  },

  initial: "idle",

  on: {
    "VALUE.SET": {
      actions: "setValue",
    },
    "CONTEXT.SYNC": {
      actions: "syncContext",
    },
  },

  states: {
    idle: {
      on: {
        "TRIGGER.FOCUS": {
          target: "focused",
          actions: "setFocusedValue",
        },
      },
    },
    focused: {
      on: {
        "GOTO.NEXT": {
          actions: "focusNextTrigger",
        },
        "GOTO.PREV": {
          actions: "focusPrevTrigger",
        },
        "TRIGGER.CLICK": [
          {
            guard: and(["isExpanded", "canToggle"]),
            actions: [
              () => {
                console.log("collapse")
              },
              "collapse",
            ],
          },
          {
            guard: not("isExpanded"),
            actions: [
              () => {
                console.log("expand")
              },
              "expand",
            ],
          },
        ],
        "GOTO.FIRST": {
          actions: "focusFirstTrigger",
        },
        "GOTO.LAST": {
          actions: "focusLastTrigger",
        },
        "TRIGGER.BLUR": {
          target: "idle",
          actions: "clearFocusedValue",
        },
      },
    },
  },
})
