import { createMachine, preserve, guards } from "@ui-machines/core"
import { isArray, ArrayCollection } from "@ui-machines/utils"
import { WithDOM } from "../type-utils"

const { and, not } = guards

export type AccordionMachineContext = WithDOM<{
  allowMultiple?: boolean
  allowToggle?: boolean
  focusedId?: string
  disabled?: boolean
  activeId?: string | string[]
  defaultActiveId?: string | string[]
  onChange?: (activeId: string | string[]) => void
}>

export type AccordionMachineState = {
  value: "idle" | "focused"
}

export const accordionMachine = createMachine<
  AccordionMachineContext,
  AccordionMachineState
>(
  {
    id: "accordion-machine",
    initial: "idle",
    context: {
      uid: "testing",
    },
    on: {
      MOUNT: {
        actions: ["setId", "setOwnerDocument"],
      },
    },
    states: {
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
            actions: "clearFocusedId",
          },
        },
      },
    },
  },
  {
    guards: {
      canShowMultiple(ctx) {
        return isArray(ctx.activeId) && !!ctx.allowMultiple
      },
      isAccordionActive(ctx, evt) {
        return isArray(ctx.activeId)
          ? ctx.activeId.includes(evt.id)
          : ctx.activeId === evt.id
      },
    },
    actions: {
      closeAccordion(ctx, evt) {
        if (isArray(ctx.activeId) && ctx.allowMultiple) {
          ctx.activeId = new ArrayCollection(ctx.activeId).remove(evt.id).value
        } else {
          ctx.activeId = undefined
        }
      },
      openAccordion(ctx, evt) {
        if (isArray(ctx.activeId) && ctx.allowMultiple) {
          ctx.activeId = new ArrayCollection(ctx.activeId).add(evt.id).value
        } else {
          ctx.activeId = evt.id
        }
      },
      focusFirstAccordion() {},
      focusLastAccordion() {},
      focusNextAccordion() {},
      focusPrevAccordion() {},
      setFocusedId(ctx, evt) {
        ctx.focusedId = evt.uid
      },
      clearFocusedId(ctx) {
        ctx.focusedId = undefined
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
