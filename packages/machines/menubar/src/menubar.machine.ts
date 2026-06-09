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
      activeId: bindable<string | null>(() => ({ defaultValue: null })),
      hasOpenMenu: bindable<boolean>(() => ({ defaultValue: false })),
    }
  },

  refs() {
    return {
      typeaheadState: { ...getByTypeahead.defaultOptions },
    }
  },

  // Always-on: keep the active trigger valid as triggers mount/change, and listen for the
  // menu coordination events dispatched on the root element.
  effects: ["trackTriggers", "trackMenuEvents"],

  on: {
    "TRIGGER.FOCUS": {
      actions: ["setActiveId"],
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
          actions: ["setActiveId"],
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
      // Reconcile activeId as triggers mount/unmount. Triggers render `role=menuitem`
      // synchronously (the menu is told it's in a menubar via props), so childList is enough.
      trackTriggers({ scope, context }) {
        const rootEl = dom.getRootEl(scope)
        if (!rootEl) return
        const reconcile = () => reconcileActiveId(context, scope)
        raf(reconcile)
        return observeChildren(rootEl, { callback: reconcile })
      },
      trackMenuEvents({ scope, send }) {
        const rootEl = dom.getRootEl(scope)
        if (!rootEl) return

        const onFocusIn = (event: FocusEvent) => {
          const target = event.target
          if (!dom.isTriggerEl(target)) return
          // `TRIGGER.FOCUS_IN` drives the idle -> focused transition; `TRIGGER.FOCUS`
          // (global) keeps activeId in sync in every state.
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
      setActiveId({ context, event }) {
        if (event.id == null) return
        context.set("activeId", event.id)
      },
      setHasOpenMenu({ context, event }) {
        context.set("hasOpenMenu", true)
        if (event.triggerId) {
          context.set("activeId", event.triggerId)
        }
      },
      clearHasOpenMenu({ context }) {
        context.set("hasOpenMenu", false)
      },
      focusNextTrigger({ context, scope, prop }) {
        const activeId = context.get("activeId")
        const nextEl = activeId
          ? dom.getNextTriggerEl(scope, activeId, prop("loopFocus"))
          : dom.getFirstTriggerEl(scope)
        focusTrigger(context, scope, nextEl)
      },
      focusPrevTrigger({ context, scope, prop }) {
        const activeId = context.get("activeId")
        const prevEl = activeId ? dom.getPrevTriggerEl(scope, activeId, prop("loopFocus")) : dom.getLastTriggerEl(scope)
        focusTrigger(context, scope, prevEl)
      },
      focusMatchingTrigger({ context, scope, event, refs }) {
        const matched = getByTypeahead(dom.getTriggerEls(scope), {
          state: refs.get("typeaheadState"),
          key: event.key,
          activeId: context.get("activeId"),
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
        const activeId = context.get("activeId")
        const nextEl = activeId
          ? dom.getNextTriggerEl(scope, activeId, prop("loopFocus"))
          : dom.getFirstTriggerEl(scope)
        if (!nextEl) return
        setActiveTrigger(context, nextEl.id)
        dom.requestOpenMenu(scope, nextEl.id)
      },
      switchToPrevMenu({ context, scope, prop }) {
        const activeId = context.get("activeId")
        const prevEl = activeId ? dom.getPrevTriggerEl(scope, activeId, prop("loopFocus")) : dom.getLastTriggerEl(scope)
        if (!prevEl) return
        setActiveTrigger(context, prevEl.id)
        dom.requestOpenMenu(scope, prevEl.id)
      },
    },
  },
})

function reconcileActiveId(context: Params<MenubarSchema>["context"], scope: Scope) {
  const activeId = context.get("activeId")
  const nextActiveId = dom.getValidActiveId(scope, activeId)
  if (nextActiveId !== activeId) context.set("activeId", nextActiveId)
}

function setActiveTrigger(context: Params<MenubarSchema>["context"], id: string) {
  context.set("activeId", id)
}

function focusTrigger(context: Params<MenubarSchema>["context"], scope: Scope, el: HTMLElement | null | undefined) {
  if (!el) return
  setActiveTrigger(context, el.id)
  raf(() => el.focus())
}
