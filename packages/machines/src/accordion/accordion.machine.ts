import { createMachine, guards, ref } from "@ui-machines/core"
import { add, remove, toArray } from "tiny-array"
import { isArray } from "tiny-guard"
import type { DOM } from "../utils"
import { uuid } from "../utils"
import { dom } from "./accordion.dom"

const { and, not } = guards

export type AccordionMachineContext = DOM.Context<{
  allowMultiple?: boolean
  allowToggle?: boolean
  focusedId: string | null
  disabled?: boolean
  activeId: string | string[] | null
  onChange?: (activeId: string | string[]) => void
}>

export type AccordionMachineState = {
  value: "unknown" | "idle" | "focused"
}

export const accordionMachine = createMachine<AccordionMachineContext, AccordionMachineState>(
  {
    id: "accordion-machine",
    initial: "unknown",
    context: {
      focusedId: null,
      activeId: null,
      uid: uuid(),
      allowToggle: false,
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
      canToggle: (ctx) => !!ctx.allowToggle || !!ctx.allowMultiple,
      isExpanded: (ctx, evt) => (isArray(ctx.activeId) ? ctx.activeId.includes(evt.id) : ctx.activeId === evt.id),
    },
    actions: {
      invokeOnChange(ctx) {
        if (ctx.activeId !== null) {
          ctx.onChange?.(ctx.activeId)
        }
      },
      collapse(ctx, evt) {
        ctx.activeId = ctx.allowMultiple ? remove(toArray(ctx.activeId), evt.id) : null
      },
      expand(ctx, evt) {
        ctx.activeId = ctx.allowMultiple ? add(toArray(ctx.activeId), evt.id) : evt.id
      },
      focusFirst(ctx) {
        const el = dom.getFirstEl(ctx)
        el?.focus()
      },
      focusLast(ctx) {
        const el = dom.getLastEl(ctx)
        el?.focus()
      },
      focusNext(ctx) {
        if (!ctx.focusedId) return
        const el = dom.getNextEl(ctx, ctx.focusedId)
        el?.focus()
      },
      focusPrev(ctx) {
        if (!ctx.focusedId) return
        const el = dom.getPrevEl(ctx, ctx.focusedId)
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
