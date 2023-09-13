import { createMachine, guards } from "@zag-js/core"
import { add, compact, isEqual, remove, warn } from "@zag-js/utils"
import { dom } from "./accordion.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./accordion.types"

const { and, not } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "accordion",
      initial: "idle",

      context: {
        focusedValue: null,
        value: [],
        collapsible: false,
        multiple: false,
        orientation: "vertical",
        ...ctx,
      },

      watch: {
        value: "coarseValue",
        multiple: "coarseValue",
      },

      created: "coarseValue",

      computed: {
        isHorizontal: (ctx) => ctx.orientation === "horizontal",
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
                guard: and("isExpanded", "canToggle"),
                actions: ["collapse"],
              },
              {
                guard: not("isExpanded"),
                actions: ["expand"],
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
    },
    {
      guards: {
        canToggle: (ctx) => !!ctx.collapsible || !!ctx.multiple,
        isExpanded: (ctx, evt) => ctx.value.includes(evt.value),
      },
      actions: {
        collapse(ctx, evt) {
          const next = ctx.multiple ? remove(ctx.value, evt.value) : []
          set.value(ctx, ctx.multiple ? next : [])
        },
        expand(ctx, evt) {
          const next = ctx.multiple ? add(ctx.value, evt.value) : [evt.value]
          set.value(ctx, next)
        },
        focusFirstTrigger(ctx) {
          dom.getFirstTriggerEl(ctx)?.focus()
        },
        focusLastTrigger(ctx) {
          dom.getLastTriggerEl(ctx)?.focus()
        },
        focusNextTrigger(ctx) {
          if (!ctx.focusedValue) return
          const triggerEl = dom.getNextTriggerEl(ctx, ctx.focusedValue)
          triggerEl?.focus()
        },
        focusPrevTrigger(ctx) {
          if (!ctx.focusedValue) return
          const triggerEl = dom.getPrevTriggerEl(ctx, ctx.focusedValue)
          triggerEl?.focus()
        },
        setFocusedValue(ctx, evt) {
          set.focusedValue(ctx, evt.value)
        },
        clearFocusedValue(ctx) {
          set.focusedValue(ctx, null)
        },
        setValue(ctx, evt) {
          set.value(ctx, evt.value)
        },
        coarseValue(ctx) {
          if (!ctx.multiple && ctx.value.length > 1) {
            warn(`The value of accordion should be a single value when multiple is false.`)
            ctx.value = [ctx.value[0]]
          }
        },
      },
    },
  )
}

const invoke = {
  change(ctx: MachineContext) {
    ctx.onValueChange?.({ value: Array.from(ctx.value) })
  },
  focusChange(ctx: MachineContext) {
    ctx.onFocusChange?.({ value: ctx.focusedValue })
  },
}

const set = {
  value(ctx: MachineContext, value: string[]) {
    if (isEqual(ctx.value, value)) return
    ctx.value = value
    invoke.change(ctx)
  },
  focusedValue(ctx: MachineContext, value: string | null) {
    if (isEqual(ctx.focusedValue, value)) return
    ctx.focusedValue = value
    invoke.focusChange(ctx)
  },
}
