import { focus } from "@core-dom/event"
import { ArrayList } from "@core-foundation/array-list"
import { is } from "@core-foundation/utils/is"
import { createMachine, guards, preserve } from "@ui-machines/core"

import { WithDOM } from "../type-utils"
import { dom } from "./accordion.dom"

const { and, not } = guards

export type AccordionMachineContext = WithDOM<{
  allowMultiple?: boolean
  allowToggle?: boolean
  focusedId: string | null
  disabled?: boolean
  activeId: string | string[] | null
  defaultActiveId?: string | string[]
  onChange?: (activeId: string | string[]) => void
}>

export type AccordionMachineState = {
  value: "mounted" | "idle" | "focused"
}

export const accordionMachine = createMachine<
  AccordionMachineContext,
  AccordionMachineState
>(
  {
    id: "accordion-machine",
    initial: "mounted",
    context: {
      focusedId: null,
      activeId: null,
      uid: "testing",
      allowToggle: false,
    },
    states: {
      mounted: {
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
              cond: and("isAccordionActive", "canToggle"),
              actions: "closeAccordion",
            },
            {
              cond: not("isAccordionActive"),
              actions: "openAccordion",
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
      canToggle(ctx) {
        return !!ctx.allowToggle || !!ctx.allowMultiple
      },
      isAccordionActive(ctx, evt) {
        return is.array(ctx.activeId)
          ? ctx.activeId.includes(evt.id)
          : ctx.activeId === evt.id
      },
    },
    actions: {
      closeAccordion(ctx, evt) {
        if (ctx.allowMultiple) {
          ctx.activeId = ArrayList.from(ctx.activeId).remove(evt.id).value
        } else {
          ctx.activeId = null
        }
      },
      openAccordion(ctx, evt) {
        if (ctx.allowMultiple) {
          ctx.activeId = ArrayList.from(ctx.activeId).add(evt.id).value
        } else {
          ctx.activeId = evt.id
        }
      },
      focusFirstAccordion(ctx) {
        const { first } = dom(ctx)
        focus.nextTick(first)
      },
      focusLastAccordion(ctx) {
        const { last } = dom(ctx)
        focus.nextTick(last)
      },
      focusNextAccordion(ctx) {
        const { next } = dom(ctx)
        if (ctx.focusedId) {
          focus.nextTick(next(ctx.focusedId))
        }
      },
      focusPrevAccordion(ctx) {
        const { prev } = dom(ctx)
        if (ctx.focusedId) {
          focus.nextTick(prev(ctx.focusedId))
        }
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
        ctx.doc = preserve(evt.doc)
      },
    },
  },
)
