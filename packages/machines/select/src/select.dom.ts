import { defineDomHelpers, findByTypeahead, nextById, prevById } from "@zag-js/dom-utils"
import type { MachineContext as Ctx, Option } from "./select.types"

export const dom = defineDomHelpers({
  getListboxId: (ctx: Ctx) => `${ctx.id}:listbox`,
  getTriggerId: (ctx: Ctx) => `${ctx.id}:trigger`,
  getLabelId: (ctx: Ctx) => `${ctx.id}:label`,
  getOptionId: (ctx: Ctx, id: string | number) => `${ctx.id}:option:${id}`,
  getSelectId: (ctx: Ctx) => `${ctx.id}:select`,
  getPositionerId: (ctx: Ctx) => `${ctx.id}:positioner`,

  getListboxElement: (ctx: Ctx) => {
    const listbox = dom.getById(ctx, dom.getListboxId(ctx))
    if (!listbox) throw new Error("Could not find the listbox element.")
    return listbox
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
    const listbox = dom.getListboxElement(ctx)
    return Array.from(listbox.querySelectorAll<HTMLElement>("[role=option]:not([data-disabled])") ?? [])
  },

  getFirstOption: (ctx: Ctx) => {
    const listbox = dom.getListboxElement(ctx)
    return listbox.querySelector<HTMLElement>("[role=option]:not([data-disabled])")
  },

  getLastOption: (ctx: Ctx) => {
    const listbox = dom.getListboxElement(ctx)
    return listbox.querySelector<HTMLElement>("[role=option]:not([data-disabled]):last-of-type")
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

  getMatchingOption(ctx: Ctx, key: string) {
    return findByTypeahead(dom.getOptionElements(ctx), {
      state: ctx.typeahead,
      key,
      activeId: ctx.highlightedId,
    })
  },

  getHighlightedOption(ctx: Ctx) {
    return ctx.highlightedId ? dom.getById(ctx, ctx.highlightedId) : null
  },
})
