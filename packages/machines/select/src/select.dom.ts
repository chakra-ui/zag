import { defineDomHelpers } from "@zag-js/dom-utils"
import type { MachineContext as Ctx, Option } from "./select.types"

export const dom = defineDomHelpers({
  getListboxId: (ctx: Ctx) => `${ctx.id}:listbox`,
  getTriggerId: (ctx: Ctx) => `${ctx.id}:trigger`,
  getLabelId: (ctx: Ctx) => `${ctx.id}:label`,
  getOptionId: (ctx: Ctx, id: string) => `${ctx.id}:option:${id}`,

  getListboxElement: (ctx: Ctx) => {
    const listbox = dom.getById(ctx, dom.getListboxId(ctx))
    if (!listbox) throw new Error("Could not find the listbox element.")
    return listbox
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
    const currentIndex = options.findIndex((element) => element.id === currentId)
    const nextIndex = currentIndex + 1 >= options.length ? 0 : currentIndex + 1
    return options[nextIndex]
  },

  getPreviousOption: (ctx: Ctx, currentId: string) => {
    const options = dom.getOptionElements(ctx)
    const currentIndex = options.findIndex((element) => element.id === currentId)
    const nextIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1
    return options[nextIndex]
  },

  getTriggerElement: (ctx: Ctx) => {
    const trigger = dom.getById(ctx, "trigger")
    if (!trigger) throw new Error("Could not find the trigger element.")
    return trigger
  },

  getOptionDetails(option: HTMLElement) {
    const { label, value } = option.dataset
    return { label, value, id: option.id } as Option
  },

  getMatchingOption(ctx: Ctx, key: string) {
    const normalizedKey = key.toLowerCase()
    return dom
      .getOptionElements(ctx)
      .find((element) => element.dataset.label?.toLowerCase().includes(normalizedKey) && element.id !== ctx.focusedId)
  },
})
