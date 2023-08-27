import { createScope, isHTMLElement, nextById, prevById, query, queryAll, getByTypeahead } from "@zag-js/dom-query"
import type { MachineContext as Ctx, Option } from "./select.types"

export const dom = createScope({
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `select:${ctx.id}:content`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `select:${ctx.id}:trigger`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `select:${ctx.id}:label`,
  getOptionId: (ctx: Ctx, id: string | number) => ctx.ids?.option?.(id) ?? `select:${ctx.id}:option:${id}`,
  getHiddenSelectId: (ctx: Ctx) => ctx.ids?.hiddenSelect ?? `select:${ctx.id}:select`,
  getPositionerId: (ctx: Ctx) => ctx.ids?.positioner ?? `select:${ctx.id}:positioner`,
  getOptionGroupId: (ctx: Ctx, id: string | number) => ctx.ids?.optionGroup?.(id) ?? `select:${ctx.id}:optgroup:${id}`,
  getOptionGroupLabelId: (ctx: Ctx, id: string | number) =>
    ctx.ids?.optionGroupLabel?.(id) ?? `select:${ctx.id}:optgroup-label:${id}`,

  getHiddenSelectElement: (ctx: Ctx) => dom.getById(ctx, dom.getHiddenSelectId(ctx)),
  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getOptionElements: (ctx: Ctx) => {
    return queryAll(dom.getContentEl(ctx), "[role=option]:not([data-disabled])")
  },
  getFirstOption: (ctx: Ctx) => {
    return query(dom.getContentEl(ctx), "[role=option]:not([data-disabled])")
  },
  getLastOption: (ctx: Ctx) => {
    return query(dom.getContentEl(ctx), "[role=option]:not([data-disabled]):last-of-type")
  },
  getNextOption: (ctx: Ctx, currentId: string) => {
    const options = dom.getOptionElements(ctx)
    return nextById(options, currentId, ctx.loop)
  },
  getPreviousOption: (ctx: Ctx, currentId: string) => {
    const options = dom.getOptionElements(ctx)
    return prevById(options, currentId, ctx.loop)
  },
  getOptionData(option: HTMLElement | null | undefined) {
    if (!option) return null
    const { label, value } = option.dataset
    return { label, value } as Option
  },
  getMatchingOption(ctx: Ctx, key: string, current: string | null) {
    return getByTypeahead(dom.getOptionElements(ctx), { state: ctx.typeahead, key, activeId: current })
  },
  getHighlightedOption(ctx: Ctx) {
    if (!ctx.highlightedValue) return null
    return dom.getById(ctx, dom.getOptionId(ctx, ctx.highlightedValue))
  },
  getClosestOption(target: EventTarget | HTMLElement | null) {
    return isHTMLElement(target) ? target.closest<HTMLElement>("[role=option]") : null
  },
})
