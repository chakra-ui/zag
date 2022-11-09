import { defineDomHelpers, findByTypeahead, isHTMLElement, nextById, prevById } from "@zag-js/dom-utils"
import type { MachineContext as Ctx, Option } from "./select.types"

export const dom = defineDomHelpers({
  getMenuId: (ctx: Ctx) => `${ctx.id}:menu`,
  getTriggerId: (ctx: Ctx) => `${ctx.id}:trigger`,
  getLabelId: (ctx: Ctx) => `${ctx.id}:label`,
  getOptionId: (ctx: Ctx, id: string | number) => `${ctx.id}:option:${id}`,
  getSelectId: (ctx: Ctx) => `${ctx.id}:select`,
  getPositionerId: (ctx: Ctx) => `${ctx.id}:positioner`,

  getMenuElement: (ctx: Ctx) => {
    const menu = dom.getById(ctx, dom.getMenuId(ctx))
    if (!menu) throw new Error("Could not find the menu element.")
    return menu
  },

  getTriggerElement: (ctx: Ctx) => {
    const trigger = dom.getById(ctx, dom.getTriggerId(ctx))
    if (!trigger) throw new Error("Could not find the trigger element.")
    return trigger
  },

  getPositionerElement: (ctx: Ctx) => {
    return dom.getById(ctx, dom.getPositionerId(ctx))
  },

  getOptionElements: (ctx: Ctx) => {
    const menu = dom.getMenuElement(ctx)
    return Array.from(menu.querySelectorAll<HTMLElement>("[role=option]:not([data-disabled])") ?? [])
  },

  getFirstOption: (ctx: Ctx) => {
    const menu = dom.getMenuElement(ctx)
    return menu.querySelector<HTMLElement>("[role=option]:not([data-disabled])")
  },

  getLastOption: (ctx: Ctx) => {
    const menu = dom.getMenuElement(ctx)
    return menu.querySelector<HTMLElement>("[role=option]:not([data-disabled]):last-of-type")
  },

  getNextOption: (ctx: Ctx, currentId: string) => {
    const options = dom.getOptionElements(ctx)
    return nextById(options, currentId, false)
  },

  getPreviousOption: (ctx: Ctx, currentId: string) => {
    const options = dom.getOptionElements(ctx)
    return prevById(options, currentId, false)
  },

  getOptionDetails(option: HTMLElement) {
    const { label, value } = option.dataset
    return { label, value, id: option.id } as Option
  },

  getMatchingOption(ctx: Ctx, key: string, current: any) {
    return findByTypeahead(dom.getOptionElements(ctx), { state: ctx.typeahead, key, activeId: current })
  },

  getHighlightedOption(ctx: Ctx) {
    return ctx.highlightedId ? dom.getById(ctx, ctx.highlightedId) : null
  },

  getClosestOption(target: EventTarget | HTMLElement | null) {
    return isHTMLElement(target) ? target.closest("[data-part=option]") : null
  },
})
