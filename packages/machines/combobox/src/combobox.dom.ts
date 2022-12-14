import { defineDomHelpers, nextById, prevById, queryAll } from "@zag-js/dom-utils"
import { first, last } from "@zag-js/utils"
import type { MachineContext as Ctx } from "./combobox.types"

export const dom = defineDomHelpers({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `combobox:${ctx.id}`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `combobox:${ctx.id}:label`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `combobox:${ctx.id}:control`,
  getInputId: (ctx: Ctx) => ctx.ids?.input ?? `combobox:${ctx.id}:input`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `combobox:${ctx.id}:listbox`,
  getPositionerId: (ctx: Ctx) => `combobox:${ctx.id}:popper`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `combobox:${ctx.id}:toggle-btn`,
  getClearTriggerId: (ctx: Ctx) => ctx.ids?.clearTrigger ?? `combobox:${ctx.id}:clear-btn`,
  getOptionId: (ctx: Ctx, id: string, index?: number) =>
    ctx.ids?.option?.(id, index) ?? [`combobox:${ctx.id}:option:${id}`, index].filter((v) => v != null).join(":"),

  getActiveOptionEl: (ctx: Ctx) => (ctx.activeId ? dom.getById(ctx, ctx.activeId) : null),
  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getInputId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getControlEl: (ctx: Ctx) => dom.getById(ctx, dom.getControlId(ctx)),
  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getClearTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getClearTriggerId(ctx)),

  getElements: (ctx: Ctx) => queryAll(dom.getContentEl(ctx), "[role=option]:not([aria-disabled=true])"),
  getFocusedOptionEl: (ctx: Ctx) => {
    if (!ctx.activeId) return null
    const selector = `[role=option][id=${CSS.escape(ctx.activeId)}]`
    return dom.getContentEl(ctx)?.querySelector<HTMLElement>(selector)
  },

  getFirstEl: (ctx: Ctx) => first(dom.getElements(ctx)),
  getLastEl: (ctx: Ctx) => last(dom.getElements(ctx)),
  getPrevEl: (ctx: Ctx, id: string) => prevById(dom.getElements(ctx), id, ctx.loop),
  getNextEl: (ctx: Ctx, id: string) => nextById(dom.getElements(ctx), id, ctx.loop),

  isInputFocused: (ctx: Ctx) => dom.getDoc(ctx).activeElement === dom.getInputEl(ctx),
  getOptionData: (el: HTMLElement | null | undefined) => ({
    value: el?.getAttribute("data-value") ?? "",
    label: el?.getAttribute("data-label") ?? "",
  }),
  getOptionCount: (ctx: Ctx) => {
    // if option has `aria-setsize`, announce the number of options
    const listbox = dom.getContentEl(ctx)
    const count = listbox?.querySelector("[role-option]")?.getAttribute("aria-setsize")

    if (count != null) return parseInt(count)
    // else announce the number of options by querying the listbox
    return listbox?.querySelectorAll("[role=option]").length ?? 0
  },
  getMatchingOptionEl: (ctx: Ctx, value: string | null | undefined) => {
    if (!value) return null

    const selector = `[role=option][data-value="${CSS.escape(value)}"`

    const listbox = dom.getContentEl(ctx)
    if (!listbox) return null

    return listbox.querySelector<HTMLElement>(selector)
  },

  focusInput: (ctx: Ctx) => {
    const input = dom.getInputEl(ctx)
    if (dom.getDoc(ctx).activeElement !== input) {
      input?.focus()
    }
    if (ctx.selectInputOnFocus) {
      input?.select()
    }
  },

  getClosestSectionLabel(ctx: Ctx) {
    if (!ctx.activeId) return
    const group = dom.getActiveOptionEl(ctx)?.closest("[data-part=option-group]")
    return group?.getAttribute("aria-label")
  },

  getValueLabel: (ctx: Ctx, value: string) => {
    const el = dom.getMatchingOptionEl(ctx, value)
    return dom.getOptionData(el).label
  },
})
