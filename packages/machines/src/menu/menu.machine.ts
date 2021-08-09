import { createMachine, preserve } from "@ui-machines/core"
import { nextTick } from "@core-foundation/utils/fn"
import { WithDOM } from "../type-utils"
import { trackPointerDown } from "../dom-utils"
import { dom, getElements } from "./menu.dom"

export type MenuMachineContext = WithDOM<{
  activeDescendantId: string | null
  onSelect?(value: string): void
}>

export type MenuMachineState = {
  value: "mounted" | "idle" | "open" | "close"
}

/**
 * State machine for the menu component
 *
 * @see Visualization https://xstate.js.org/viz/?gist=d00922675f3562f0d145367fa94b5080
 * @see Spec https://www.w3.org/TR/wai-aria-practices/examples/menu-button/menu-button-actions-active-descendant.html
 */

export const menuMachine = createMachine<MenuMachineContext, MenuMachineState>(
  {
    id: "menu-machine",
    initial: "idle",
    context: {
      activeDescendantId: null,
      uid: "testing",
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
          BUTTON_CLICK: {
            target: "open",
            actions: "focusFirstItem",
          },
          BUTTON_FOCUS: "close",
        },
      },
      close: {
        entry: ["resetId", "focusButton", "clearPointerDownNode"],
        on: {
          BUTTON_CLICK: {
            target: "open",
            actions: "focusFirstItem",
          },
          BUTTON_BLUR: "idle",
          ARROW_DOWN: {
            target: "open",
            actions: "focusFirstItem",
          },
          ARROW_UP: {
            target: "open",
            actions: "focusLastItem",
          },
        },
      },
      open: {
        activities: "trackPointerDown",
        entry: "focusMenu",
        on: {
          BUTTON_CLICK: "close",
          ARROW_UP: {
            actions: "focusPrevItem",
          },
          ARROW_DOWN: {
            actions: "focusNextItem",
          },
          HOME: {
            actions: "focusFirstItem",
          },
          END: {
            actions: "focusLastItem",
          },
          BLUR: "close",
          ENTER: {
            target: "close",
            actions: "selectCurrentItem",
          },
          ESCAPE: "close",
          ITEM_POINTEROVER: {
            actions: "focusItem",
          },
          ITEM_POINTERLEAVE: {
            actions: "resetId",
          },
          ITEM_CLICK: {
            target: "close",
            actions: "selectCurrentItem",
          },
          TYPEAHEAD: {
            actions: "focusMatchedItem",
          },
        },
      },
    },
  },
  {
    activities: {
      trackPointerDown: trackPointerDown,
    },
    actions: {
      setId: (ctx, evt) => {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = preserve(evt.doc)
      },
      resetId(ctx) {
        ctx.activeDescendantId = null
      },
      clearPointerDownNode(ctx) {
        ctx.pointerdownNode = null
      },
      focusMenu(ctx) {
        const { menu } = getElements(ctx)
        nextTick(() => menu?.focus())
      },
      focusFirstItem(ctx) {
        const menuitems = dom(ctx)
        ctx.activeDescendantId = menuitems.first.id
      },
      focusLastItem(ctx) {
        const menuitems = dom(ctx)
        ctx.activeDescendantId = menuitems.last.id
      },
      focusNextItem(ctx) {
        const menuitems = dom(ctx)
        const next = menuitems.next(ctx.activeDescendantId ?? "")
        ctx.activeDescendantId = next?.id ?? null
      },
      focusPrevItem(ctx) {
        const menuitems = dom(ctx)
        const prev = menuitems.prev(ctx.activeDescendantId ?? "")
        ctx.activeDescendantId = prev?.id ?? null
      },
      selectCurrentItem(ctx) {
        ctx.onSelect?.(ctx.activeDescendantId ?? "")
      },
      focusItem(ctx, event) {
        ctx.activeDescendantId = event.id
      },
      focusButton(ctx) {
        const { button } = getElements(ctx)
        nextTick(() => button?.focus())
      },
      focusMatchedItem(ctx, evt) {
        const menuitems = dom(ctx)
        const node = menuitems.searchByKey(evt.key)
        ctx.activeDescendantId = node?.id ?? ctx.activeDescendantId
      },
    },
  },
)
