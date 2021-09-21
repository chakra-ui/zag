import { focus } from "@core-dom/event"
import { List } from "@core-foundation/list"
import { is } from "@core-foundation/utils/is"
import { createMachine, guards, ref } from "@ui-machines/core"
import { WithDOM } from "../utils/types"
import { dom } from "./accordion.dom"

const { and, not } = guards

export type AccordionMachineContext = WithDOM<{
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
      uid: "testing",
      allowToggle: false,
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
            actions: "focusNextAccordion",
          },
          ARROW_UP: {
            actions: "focusPrevAccordion",
          },
          CLICK: [
            {
              cond: and("isExpanded", "canToggle"),
              actions: "collapseAccordion",
            },
            {
              cond: not("isExpanded"),
              actions: "expandAccordion",
            },
          ],
          HOME: {
            actions: "focusFirstAccordion",
          },
          END: {
            actions: "focusLastAccordion",
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
      isExpanded: (ctx, evt) => {
        const { activeId } = ctx
        return is.array(activeId) ? activeId.includes(evt.id) : activeId === evt.id
      },
    },
    actions: {
      collapseAccordion(ctx, evt) {
        if (ctx.allowMultiple) {
          ctx.activeId = List.from(ctx.activeId).remove(evt.id).value
        } else {
          ctx.activeId = null
        }
      },
      expandAccordion(ctx, evt) {
        if (ctx.allowMultiple) {
          ctx.activeId = List.from(ctx.activeId).add(evt.id).value
        } else {
          ctx.activeId = evt.id
        }
      },
      focusFirstAccordion(ctx) {
        const { first } = dom(ctx)
        if (!first) return
        focus.nextTick(first)
      },
      focusLastAccordion(ctx) {
        const { last } = dom(ctx)
        if (!last) return
        focus.nextTick(last)
      },
      focusNextAccordion(ctx) {
        const { next } = dom(ctx)
        if (!ctx.focusedId) return
        const el = next(ctx.focusedId)
        if (!el) return
        focus.nextTick(el)
      },
      focusPrevAccordion(ctx) {
        const { prev } = dom(ctx)
        if (!ctx.focusedId) return
        const el = prev(ctx.focusedId)
        if (!el) return
        focus.nextTick(el)
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
