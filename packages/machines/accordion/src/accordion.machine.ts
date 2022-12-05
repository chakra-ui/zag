import { createMachine, guards } from "@zag-js/core"
import { add, compact, isString, remove, toArray, warn } from "@zag-js/utils"
import { dom } from "./accordion.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./accordion.types"

const { and, not } = guards

const VALUE_MISMATCH = `[accordion/invalid-value] Expected value for multiple accordion to be an 'array' but received 'string'. Value will be coarsed to 'array'`

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "accordion",
      initial: "idle",

      context: {
        focusedValue: null,
        value: null,
        collapsible: false,
        multiple: false,
        ...ctx,
      },

      watch: {
        value: "sanitizeValue",
        multiple: "sanitizeValue",
      },

      created: "sanitizeValue",

      on: {
        SET_VALUE: {
          actions: ["setValue", "invokeOnChange"],
        },
      },

      states: {
        idle: {
          on: {
            FOCUS: {
              target: "focused",
              actions: "setFocusedValue",
            },
          },
        },
        focused: {
          on: {
            ARROW_DOWN: {
              actions: "focusNext",
            },
            ARROW_UP: {
              actions: "focusPrev",
            },
            CLICK: [
              {
                guard: and("isExpanded", "canToggle"),
                actions: ["collapse", "invokeOnChange"],
              },
              {
                guard: not("isExpanded"),
                actions: ["expand", "invokeOnChange"],
              },
            ],
            HOME: {
              actions: "focusFirst",
            },
            END: {
              actions: "focusLast",
            },
            BLUR: {
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
        isExpanded: (ctx, evt) => {
          if (ctx.multiple && Array.isArray(ctx.value)) return ctx.value.includes(evt.value)
          return ctx.value === evt.value
        },
      },
      actions: {
        invokeOnChange(ctx) {
          ctx.onChange?.({ value: ctx.value })
        },
        collapse(ctx, evt) {
          ctx.value = ctx.multiple ? remove(toArray(ctx.value), evt.value) : null
        },
        expand(ctx, evt) {
          ctx.value = ctx.multiple ? add(toArray(ctx.value), evt.value) : evt.value
        },
        focusFirst(ctx) {
          dom.getFirstTriggerEl(ctx)?.focus()
        },
        focusLast(ctx) {
          dom.getLastTriggerEl(ctx)?.focus()
        },
        focusNext(ctx) {
          if (!ctx.focusedValue) return
          const el = dom.getNextTriggerEl(ctx, ctx.focusedValue)
          el?.focus()
        },
        focusPrev(ctx) {
          if (!ctx.focusedValue) return
          const el = dom.getPrevTriggerEl(ctx, ctx.focusedValue)
          el?.focus()
        },
        setFocusedValue(ctx, evt) {
          ctx.focusedValue = evt.value
        },
        clearFocusedValue(ctx) {
          ctx.focusedValue = null
        },
        setValue(ctx, evt) {
          ctx.value = evt.value
        },
        sanitizeValue(ctx) {
          if (ctx.multiple && isString(ctx.value)) {
            warn(VALUE_MISMATCH)
            ctx.value = [ctx.value]
          } else if (!ctx.multiple && Array.isArray(ctx.value) && ctx.value.length > 0) {
            ctx.value = ctx.value[0]
          }
        },
      },
    },
  )
}
