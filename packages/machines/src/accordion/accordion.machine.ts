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
      focusedId: null,
      activeId: null,
      uid: uuid(),
      collapsible: false,
      multiple: false,
    },
    watch: {
      // when the `activeId` changes, we need to call the `onChange` callback
      activeId: "invokeOnChange",
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
            actions: "setFocusedId",
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
            actions: "clearFocusedId",
          },
        },
      },
    },
  },
  {
    guards: {
      canToggle: (ctx) => !!ctx.collapsible || !!ctx.multiple,
      isExpanded: (ctx, evt) => (isArray(ctx.activeId) ? ctx.activeId.includes(evt.id) : ctx.activeId === evt.id),
    },
    actions: {
      invokeOnChange(ctx) {
        ctx.onChange?.(ctx.activeId)
      },
      collapse(ctx, evt) {
        ctx.activeId = ctx.multiple ? remove(toArray(ctx.activeId), evt.id) : null
      },
      expand(ctx, evt) {
        ctx.activeId = ctx.multiple ? add(toArray(ctx.activeId), evt.id) : evt.id
      },
      focusFirst(ctx) {
        dom.getFirstTriggerEl(ctx)?.focus()
      },
      focusLast(ctx) {
        dom.getLastTriggerEl(ctx)?.focus()
      },
      focusNext(ctx) {
        if (!ctx.focusedId) return
        const el = dom.getNextTriggerEl(ctx, ctx.focusedId)
        el?.focus()
      },
      focusPrev(ctx) {
        if (!ctx.focusedId) return
        const el = dom.getPrevTriggerEl(ctx, ctx.focusedId)
        el?.focus()
      },
      setFocusedId(ctx, evt) {
        ctx.focusedId = evt.id
      },
      clearFocusedId(ctx) {
        ctx.focusedId = null
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
