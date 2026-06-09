import type { Scope } from "@zag-js/core"
import { getWindow, isHTMLElement, nextById, prevById } from "@zag-js/dom-query"
import { first, last } from "@zag-js/utils"
import { parts } from "./menubar.anatomy"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `menubar:${ctx.id}`

export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))

/**
 * The menubar's items are the menu triggers rendered inside it. Because menus are
 * portalled, only the top-level triggers (role=menuitem) live within the root subtree.
 */
export const getTriggerEls = (ctx: Scope): HTMLElement[] => {
  const rootEl = getRootEl(ctx)
  if (!rootEl) return []
  const els = rootEl.querySelectorAll<HTMLElement>("[role=menuitem]")
  return Array.from(els).filter(
    (el) => !el.hasAttribute("data-disabled") && el.getAttribute("aria-disabled") !== "true",
  )
}

export const isTriggerEl = (el: EventTarget | null): el is HTMLElement => {
  return isHTMLElement(el) && el.getAttribute("role") === "menuitem"
}

export const getFirstTriggerEl = (ctx: Scope) => first(getTriggerEls(ctx))
export const getLastTriggerEl = (ctx: Scope) => last(getTriggerEls(ctx))
export const getNextTriggerEl = (ctx: Scope, id: string, loop: boolean) => nextById(getTriggerEls(ctx), id, loop)
export const getPrevTriggerEl = (ctx: Scope, id: string, loop: boolean) => prevById(getTriggerEls(ctx), id, loop)

export const getValidActiveId = (ctx: Scope, activeId: string | null) => {
  const triggers = getTriggerEls(ctx)
  if (!triggers.length) return null
  return triggers.some((el) => el.id === activeId) ? activeId : triggers[0].id
}

// Ask the menu owning a trigger to open (arrow-switching between open menus).
export const requestOpenMenu = (ctx: Scope, triggerId: string) => {
  const rootEl = getRootEl(ctx)
  if (!rootEl) return
  const win = getWindow(rootEl)
  rootEl.dispatchEvent(new win.CustomEvent("menubar:open-request", { detail: { triggerId } }))
}
