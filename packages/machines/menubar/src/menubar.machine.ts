import type { Params, Scope } from "@zag-js/core"
import { createMachine } from "@zag-js/core"
import { addDomEvent, getByTypeahead, observeChildren, raf } from "@zag-js/dom-query"
import * as dom from "./menubar.dom"
import type { MenubarSchema } from "./menubar.types"

export const machine = createMachine<MenubarSchema>({
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

  context({ bindable }) {
    return {
      value: bindable<string | null>(() => ({ defaultValue: null })),
      hasOpenMenu: bindable<boolean>(() => ({ defaultValue: false })),
    }
  },

  refs() {
    return {
      typeaheadState: { ...getByTypeahead.defaultOptions },
    }
  },

  // Always-on: keep roving tabindex in sync as triggers mount/change, and listen for the
  // menu coordination events dispatched on the root element.
  effects: ["trackTriggers", "trackMenuEvents"],

  on: {
    "TRIGGER.FOCUS": {
      actions: ["setValue", "syncTabIndex"],
    },
    TYPEAHEAD: {
      actions: ["focusMatchingTrigger"],
    },
  },

  states: {
    idle: {
      on: {
        "TRIGGER.FOCUS_IN": {
          target: "focused",
          actions: ["setValue", "syncTabIndex"],
        },
        "MENU.OPEN": {
          target: "open",
          actions: ["setHasOpenMenu"],
        },
      },
    },

    focused: {
      on: {
        "ROOT.BLUR": {
          target: "idle",
        },
        "TRIGGER.FOCUS_NEXT": {
          actions: ["focusNextTrigger"],
        },
        "TRIGGER.FOCUS_PREV": {
          actions: ["focusPrevTrigger"],
        },
        "TRIGGER.FOCUS_FIRST": {
          actions: ["focusFirstTrigger"],
        },
        "TRIGGER.FOCUS_LAST": {
          actions: ["focusLastTrigger"],
        },
        "MENU.OPEN": {
          target: "open",
          actions: ["setHasOpenMenu"],
        },
      },
    },

    open: {
      on: {
        // Arrow-switch to the sibling menu (move + request open).
        "TRIGGER.FOCUS_NEXT": {
          actions: ["switchToNextMenu"],
        },
        "TRIGGER.FOCUS_PREV": {
          actions: ["switchToPrevMenu"],
        },
        // Another menu opened (sibling switch) — stay open.
        "MENU.OPEN": {
          actions: ["setHasOpenMenu"],
        },
        "MENU.CLOSE": [
          {
            // Transient close: another menu is about to open. Keep `hasOpenMenu` active
            // so it doesn't flicker while switching siblings.
            guard: "isTransientClose",
          },
          {
            target: "focused",
            actions: ["clearHasOpenMenu"],
          },
        ],
        // No ROOT.BLUR: focus lives in the open menu's portalled content. The menu drives
        // close transitions via `menu:close`.
      },
    },
  },

  implementations: {
    guards: {
      isTransientClose: ({ event }) => event.reason === "sibling-open" || event.reason === "list-navigation",
    },

    effects: {
      // Re-sync roving tabindex as triggers mount/unmount. Triggers render `role=menuitem`
      // synchronously (the menu is told it's in a menubar via props), so childList is enough.
      trackTriggers({ scope, context }) {
        const rootEl = dom.getRootEl(scope)
        if (!rootEl) return
        const sync = () => dom.syncTabIndex(scope, context.get("value"))
        raf(sync)
        return observeChildren(rootEl, { callback: sync })
      },
      trackMenuEvents({ scope, send }) {
        const rootEl = dom.getRootEl(scope)
        if (!rootEl) return

        const onFocusIn = (event: FocusEvent) => {
          const target = event.target
          if (!dom.isTriggerEl(target)) return
          // `TRIGGER.FOCUS_IN` drives the idle -> focused transition; `TRIGGER.FOCUS`
          // (global) keeps value + tabindex in sync in every state.
          send({ type: "TRIGGER.FOCUS_IN", id: target.id })
          send({ type: "TRIGGER.FOCUS", id: target.id })
        }
        const onFocusOut = (event: FocusEvent) => {
          const related = event.relatedTarget as Node | null
          if (related && rootEl.contains(related)) return
          send({ type: "ROOT.BLUR" })
        }

        const cleanups = [
          addDomEvent(rootEl, "menu:open", (event: any) => {
            send({ type: "MENU.OPEN", id: event.detail?.menuId, triggerId: event.detail?.triggerId })
          }),
          addDomEvent(rootEl, "menu:close", (event: any) => {
            send({ type: "MENU.CLOSE", id: event.detail?.menuId, reason: event.detail?.reason })
          }),
          addDomEvent(rootEl, "menu:focus-next", () => send({ type: "TRIGGER.FOCUS_NEXT" })),
          addDomEvent(rootEl, "menu:focus-prev", () => send({ type: "TRIGGER.FOCUS_PREV" })),
          addDomEvent(rootEl, "focusin", onFocusIn),
          addDomEvent(rootEl, "focusout", onFocusOut),
        ]

        return () => {
          cleanups.forEach((fn) => fn())
        }
      },
    },

    actions: {
      syncTabIndex({ context, scope }) {
        dom.syncTabIndex(scope, context.get("value"))
      },
      setValue({ context, event }) {
        if (event.id == null) return
        context.set("value", event.id)
      },
      setHasOpenMenu({ context, scope, event }) {
        context.set("hasOpenMenu", true)
        if (event.triggerId) {
          context.set("value", event.triggerId)
          dom.syncTabIndex(scope, event.triggerId)
        }
      },
      clearHasOpenMenu({ context }) {
        context.set("hasOpenMenu", false)
      },
      focusNextTrigger({ context, scope, prop }) {
        const value = context.get("value")
        const nextEl = value ? dom.getNextTriggerEl(scope, value, prop("loopFocus")) : dom.getFirstTriggerEl(scope)
        focusTrigger(context, scope, nextEl)
      },
      focusPrevTrigger({ context, scope, prop }) {
        const value = context.get("value")
        const prevEl = value ? dom.getPrevTriggerEl(scope, value, prop("loopFocus")) : dom.getLastTriggerEl(scope)
        focusTrigger(context, scope, prevEl)
      },
      focusMatchingTrigger({ context, scope, event, refs }) {
        const matched = getByTypeahead(dom.getTriggerEls(scope), {
          state: refs.get("typeaheadState"),
          key: event.key,
          activeId: context.get("value"),
        })
        focusTrigger(context, scope, matched)
      },
      focusFirstTrigger({ context, scope }) {
        focusTrigger(context, scope, dom.getFirstTriggerEl(scope))
      },
      focusLastTrigger({ context, scope }) {
        focusTrigger(context, scope, dom.getLastTriggerEl(scope))
      },
      switchToNextMenu({ context, scope, prop }) {
        const value = context.get("value")
        const nextEl = value ? dom.getNextTriggerEl(scope, value, prop("loopFocus")) : dom.getFirstTriggerEl(scope)
        if (!nextEl) return
        setActiveTrigger(context, scope, nextEl.id)
        dom.requestOpenMenu(scope, nextEl.id)
      },
      switchToPrevMenu({ context, scope, prop }) {
        const value = context.get("value")
        const prevEl = value ? dom.getPrevTriggerEl(scope, value, prop("loopFocus")) : dom.getLastTriggerEl(scope)
        if (!prevEl) return
        setActiveTrigger(context, scope, prevEl.id)
        dom.requestOpenMenu(scope, prevEl.id)
      },
    },
  },
})

// Commit `value` + tabindex synchronously (so it doesn't race the focusin handler, and so
// the `trackTriggers` observer re-syncs against the right active id after a React re-render).
function setActiveTrigger(context: Params<MenubarSchema>["context"], scope: Scope, id: string) {
  context.set("value", id)
  dom.syncTabIndex(scope, id)
}

function focusTrigger(context: Params<MenubarSchema>["context"], scope: Scope, el: HTMLElement | null | undefined) {
  if (!el) return
  setActiveTrigger(context, scope, el.id)
  raf(() => el.focus())
}
