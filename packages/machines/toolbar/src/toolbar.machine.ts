import { createGuards, createMachine } from "@zag-js/core"
import { observeChildren, raf } from "@zag-js/dom-query"
import * as dom from "./toolbar.dom"
import type { ToolbarSchema } from "./toolbar.types"

const { not } = createGuards<ToolbarSchema>()

export const machine = createMachine<ToolbarSchema>({
  props({ props }) {
    return {
      orientation: "horizontal",
      loopFocus: true,
      ...props,
    }
  },

  initialState() {
    return "idle"
  },

  effects: ["trackItemMutations"],

  context({ bindable }) {
    return {
      focusedValue: bindable<string | null>(() => ({
        defaultValue: null,
      })),
      hasInteracted: bindable<boolean>(() => ({
        defaultValue: false,
      })),
      isClickFocus: bindable<boolean>(() => ({
        defaultValue: false,
      })),
    }
  },

  on: {
    "ROOT.MOUSE_DOWN": {
      actions: ["setClickFocus"],
    },
    "ROOT.BLUR": {
      actions: ["clearClickFocus"],
    },
    // A nested composite's own item was focused directly, bypassing ITEM.FOCUS.
    "DESCENDANT.FOCUS": {
      target: "focused",
      actions: ["setHasInteracted"],
    },
    "ITEMS.CHANGE": {
      actions: ["syncHasInteracted"],
    },
  },

  states: {
    // Active only before the first successful focus — the root then permanently cedes its tabindex.
    idle: {
      on: {
        "ROOT.FOCUS": {
          target: "focused",
          guard: not("isClickFocus"),
          actions: ["focusFirstItem", "setHasInteracted", "clearClickFocus"],
        },
        "ITEM.FOCUS": {
          target: "focused",
          actions: ["setFocusedValue", "setHasInteracted"],
        },
      },
    },

    focused: {
      on: {
        "ROOT.FOCUS": {
          guard: not("isClickFocus"),
          actions: ["focusFirstItem", "clearClickFocus"],
        },
        "ITEM.FOCUS": {
          actions: ["setFocusedValue"],
        },
        "ITEM.FOCUS_NEXT": {
          actions: ["focusNextItem"],
        },
        "ITEM.FOCUS_PREV": {
          actions: ["focusPrevItem"],
        },
        "ITEM.FOCUS_FIRST": {
          actions: ["focusFirstItem"],
        },
        "ITEM.FOCUS_LAST": {
          actions: ["focusLastItem"],
        },
      },
    },
  },

  implementations: {
    guards: {
      isClickFocus: ({ context }) => context.get("isClickFocus"),
    },

    actions: {
      setClickFocus({ context }) {
        context.set("isClickFocus", true)
      },
      clearClickFocus({ context }) {
        context.set("isClickFocus", false)
      },
      setHasInteracted({ context }) {
        context.set("hasInteracted", true)
      },
      syncHasInteracted({ context, scope }) {
        if (!context.get("hasInteracted")) return
        if (dom.hasFocusableItem(scope)) return
        context.set("hasInteracted", false)
        context.set("focusedValue", null)
      },
      setFocusedValue({ context, event }) {
        context.set("focusedValue", event.value)
      },
      focusNextItem({ scope, prop }) {
        const before = scope.getActiveElement()
        raf(() => {
          if (scope.getActiveElement() !== before) return
          dom.getNextEl(scope, prop("loopFocus"))?.focus({ preventScroll: true })
        })
      },
      focusPrevItem({ scope, prop }) {
        const before = scope.getActiveElement()
        raf(() => {
          if (scope.getActiveElement() !== before) return
          dom.getPrevEl(scope, prop("loopFocus"))?.focus({ preventScroll: true })
        })
      },
      focusFirstItem({ scope }) {
        const before = scope.getActiveElement()
        raf(() => {
          if (scope.getActiveElement() !== before) return
          dom.getFirstEl(scope)?.focus({ preventScroll: true })
        })
      },
      focusLastItem({ scope }) {
        const before = scope.getActiveElement()
        raf(() => {
          if (scope.getActiveElement() !== before) return
          dom.getLastEl(scope)?.focus({ preventScroll: true })
        })
      },
    },

    effects: {
      trackItemMutations({ scope, send }) {
        const root = dom.getRootEl(scope)
        if (!root) return
        return observeChildren(root, {
          attributes: true,
          attributeFilter: ["disabled", "data-disabled"],
          callback() {
            send({ type: "ITEMS.CHANGE" })
          },
        })
      },
    },
  },
})
