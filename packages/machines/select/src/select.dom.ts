import {
  defineDomHelpers,
  findByTypeahead,
  isHTMLElement,
  nextById,
  prevById,
  query,
  queryAll,
} from "@zag-js/dom-utils"
import type { MachineContext as Ctx, Option } from "./select.types"

export const dom = defineDomHelpers({
  getMenuId: (ctx: Ctx) => ctx.ids?.menu ?? `${ctx.id}:menu`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `${ctx.id}:trigger`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `${ctx.id}:label`,
  getOptionId: (ctx: Ctx, id: string | number) => ctx.ids?.option?.(id) ?? `${ctx.id}:option:${id}`,
  getHiddenSelectId: (ctx: Ctx) => `${ctx.id}:select`,
  getPositionerId: (ctx: Ctx) => `${ctx.id}:positioner`,
  getOptionGroupId: (ctx: Ctx, id: string | number) => `${ctx.id}:option-group:${id}`,
  getOptionGroupLabelId: (ctx: Ctx, id: string | number) => `${ctx.id}:option-group-label:${id}`,

  getHiddenSelectElement: (ctx: Ctx) => dom.getById(ctx, dom.getHiddenSelectId(ctx)),
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
    return queryAll(dom.getMenuElement(ctx), "[role=option]:not([data-disabled])")
  },
  getFirstOption: (ctx: Ctx) => {
    return query(dom.getMenuElement(ctx), "[role=option]:not([data-disabled])")
  },
  getLastOption: (ctx: Ctx) => {
    return query(dom.getMenuElement(ctx), "[role=option]:not([data-disabled]):last-of-type")
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
    return { label, value } as Option
  },
  getMatchingOption(ctx: Ctx, key: string, current: any) {
    return findByTypeahead(dom.getOptionElements(ctx), { state: ctx.typeahead, key, activeId: current })
  },
  getHighlightedOption(ctx: Ctx) {
    if (!ctx.highlightedId) return null
    return dom.getById(ctx, ctx.highlightedId)
  },
  getClosestOption(target: EventTarget | HTMLElement | null) {
    return isHTMLElement(target) ? target.closest<HTMLElement>("[data-part=option]") : null
  },
})
