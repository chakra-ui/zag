import { createMachine, guards, ref } from "@ui-machines/core"
import { add, isString, remove, toArray, warn } from "@ui-machines/utils"
import { dom } from "./accordion.dom"
import { MachineContext, MachineState } from "./accordion.types"

const { and, not } = guards

const MULTIPLE_AND_VALUE_MISMATCH_WARNING = `[accordion/invalid-value] Expected value for multiple accordion to be an 'array' but received 'string'. Value will be coarsed to 'array'`

export const machine = createMachine<MachineContext, MachineState>(
  {
    id: "accordion-machine",
    initial: "unknown",

    context: {
      focusedValue: null,
      value: null,
      uid: "",
      collapsible: false,
      multiple: false,
    },

    watch: {
      value: "invokeOnChange",
    },

    created(ctx) {
      if (ctx.multiple && isString(ctx.value)) {
        warn(MULTIPLE_AND_VALUE_MISMATCH_WARNING)
        ctx.value = [ctx.value]
      }
    },

    on: {
      SET_VALUE: {
        actions: "setValue",
      },
    },

    states: {
      unknown: {
        on: {
          SETUP: {
            target: "idle",
            actions: "setupDocument",
          },
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
      invokeOnChange(ctx) {
        ctx.onChange?.(ctx.value)
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
      setupDocument(ctx, evt) {
        if (evt.doc) ctx.doc = ref(evt.doc)
        ctx.uid = evt.id
      },
      setValue(ctx, evt) {
        ctx.value = evt.value
      },
    },
  },
)
