import { createMachine, guards } from "@zag-js/core"
import { add, isString, remove, toArray, warn } from "@zag-js/utils"
import { dom } from "./accordion.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./accordion.types"

const { and, not } = guards

export function machine(ctx: UserDefinedContext) {
  return createMachine<MachineContext, MachineState>(
    {
      id: "accordion",
      initial: "unknown",

      context: {
        focusedValue: null,
        value: null,
        collapsible: false,
        multiple: false,
        ...ctx,
      },

      watch: {
        value: ["checkValue", "invokeOnChange"],
      },

      created: ["checkValue"],

      on: {
        SET_VALUE: {
          actions: "setValue",
        },
      },

      states: {
        unknown: {
          on: {
            SETUP: "idle",
          },
        },
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
                actions: "collapse",
              },
              {
                guard: not("isExpanded"),
                actions: "expand",
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
        invokeOnChange(ctx, evt) {
          if (evt.type !== "SETUP") {
            ctx.onChange?.({ value: ctx.value })

            const emit = dom.emitter(ctx)
            emit("change", { value: ctx.value })
          }
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
        checkValue(ctx) {
          if (ctx.multiple && isString(ctx.value)) {
            warn(
              `[accordion/invalid-value]
               Expected value for multiple accordion to be an 'array'
               but received 'string'. Value will be coarsed to 'array'`,
            )
            ctx.value = [ctx.value]
          } else if (!ctx.multiple && Array.isArray(ctx.value)) {
            ctx.value = ctx.value[0]
          }
        },
      },
    },
  )
}
