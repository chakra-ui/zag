import { createMachine, guards, ref } from "@ui-machines/core"
import { add, remove, toArray } from "tiny-array"
import { isArray } from "tiny-guard"
import { uuid } from "../utils"
import { dom } from "./accordion.dom"
import { AccordionMachineContext, AccordionMachineState } from "./accordion.types"

const { and, not } = guards

export const accordionMachine = createMachine<AccordionMachineContext, AccordionMachineState>(
  {
    id: "accordion-machine",
    initial: "unknown",
    context: {
      focusedValue: null,
      value: null,
      uid: uuid(),
      collapsible: false,
      multiple: false,
    },
    watch: {
      value: "invokeOnChange",
    },
    states: {
      unknown: {
        on: {
          SETUP: {
            target: "idle",
            actions: ["setId", "setOwnerDocument"],
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
              cond: and("isExpanded", "canToggle"),
              actions: "collapse",
            },
            {
              cond: not("isExpanded"),
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
      isExpanded: (ctx, evt) => (isArray(ctx.value) ? ctx.value.includes(evt.value) : ctx.value === evt.value),
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
      setId(ctx, evt) {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = ref(evt.doc)
      },
    },
  },
)
