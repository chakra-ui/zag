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
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `select:${ctx.id}:content`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `select:${ctx.id}:trigger`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `select:${ctx.id}:label`,
  getOptionId: (ctx: Ctx, id: string | number) => ctx.ids?.option?.(id) ?? `select:${ctx.id}:option:${id}`,
  getHiddenSelectId: (ctx: Ctx) => `select:${ctx.id}:select`,
  getPositionerId: (ctx: Ctx) => `select:${ctx.id}:positioner`,
  getOptionGroupId: (ctx: Ctx, id: string | number) => `select:${ctx.id}:optgroup:${id}`,
  getOptionGroupLabelId: (ctx: Ctx, id: string | number) => `select:${ctx.id}:optgroup-label:${id}`,

  getHiddenSelectElement: (ctx: Ctx) => dom.getById(ctx, dom.getHiddenSelectId(ctx)),
  getContentElement: (ctx: Ctx) => {
    const content = dom.getById(ctx, dom.getContentId(ctx))
    if (!content) throw new Error("Could not find the select content element.")
    return content
  },
  getTriggerElement: (ctx: Ctx) => {
    const trigger = dom.getById(ctx, dom.getTriggerId(ctx))
    if (!trigger) throw new Error("Could not find the select trigger element.")
    return trigger
  },
  getPositionerElement: (ctx: Ctx) => {
    return dom.getById(ctx, dom.getPositionerId(ctx))
  },
  getOptionElements: (ctx: Ctx) => {
    return queryAll(dom.getContentElement(ctx), "[role=option]:not([data-disabled])")
  },
  getFirstOption: (ctx: Ctx) => {
    return query(dom.getContentElement(ctx), "[role=option]:not([data-disabled])")
  },
  getLastOption: (ctx: Ctx) => {
    return query(dom.getContentElement(ctx), "[role=option]:not([data-disabled]):last-of-type")
  },
  getNextOption: (ctx: Ctx, currentId: string) => {
    const options = dom.getOptionElements(ctx)
    return nextById(options, currentId, ctx.loop)
  },
  getPreviousOption: (ctx: Ctx, currentId: string) => {
    const options = dom.getOptionElements(ctx)
    return prevById(options, currentId, ctx.loop)
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
