import { createMachine, guards, ref } from "@ui-machines/core"
import { add, remove, toArray } from "tiny-array"
import { isArray } from "tiny-guard"
import type { DOM } from "../utils"
import { uuid } from "../utils"
import { dom } from "./accordion.dom"

const { and, not } = guards

export type AccordionMachineContext = DOM.Context<{
  /**
   * Whether multple accordion items can be open at the same time.
   * @default false
   */
  multiple?: boolean
  /**
   * Whether an accordion item can be collapsed after it has been opened.
   * @default false
   */
  collapsible?: boolean
  /**
   * @internal - The `id` of the focused accordion item.
   */
  focusedId: string | null
  /**
   * Whether the accordion items are disabled
   */
  disabled?: boolean
  /**
   * The `id` of the accordion item that is currently being opened.
   */
  activeId: string | string[] | null
  /**
   * The callback fired when the state of opened/closed accordion items changes.
   */
  onChange?: (activeId: string | string[] | null) => void
}>

/**
 * The `Accordion` machine states:
 *
 * unknown: The state before the accordion machine is initialized.
 * idle: The state after the accordion machine is initialized and not interacted with.
 * focused: The state when an accordion item's trigger is focused (with keyboard or pointer down)
 */
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
