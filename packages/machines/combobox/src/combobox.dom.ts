import { nextById, prevById, queryElements } from "@ui-machines/dom-utils"
import { first, last } from "@ui-machines/utils"
import scrollIntoViewIfNeeded from "scroll-into-view-if-needed"
import type { ComboboxMachineContext as Ctx } from "./combobox.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getLabelId: (ctx: Ctx) => `combobox-${ctx.uid}-label`,
  getContainerId: (ctx: Ctx) => `combobox-${ctx.uid}`,
  getInputId: (ctx: Ctx) => `combobox-${ctx.uid}-input`,
  getListboxId: (ctx: Ctx) => `combobox-${ctx.uid}-listbox`,
  getToggleBtnId: (ctx: Ctx) => `combobox-${ctx.uid}-toggle-btn`,
  getClearBtnId: (ctx: Ctx) => `combobox-${ctx.uid}-clear-btn`,
  getOptionId: (ctx: Ctx, id: number | string, index?: number) =>
    [`combobox-${ctx.uid}-option-${id}`, index].filter(Boolean).join("-"),

  getActiveOptionEl: (ctx: Ctx) => (ctx.activeId ? dom.getDoc(ctx).getElementById(ctx.activeId) : null),
  getListboxEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getListboxId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getInputId(ctx)) as HTMLInputElement | null,
  getToggleBtnEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getToggleBtnId(ctx)),
  getClearBtnEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getClearBtnId(ctx)),

  getElements: (ctx: Ctx) => queryElements(dom.getListboxEl(ctx), "[role=option]:not([aria-disabled=true])"),
  getFocusedOptionEl: (ctx: Ctx) =>
    dom.getListboxEl(ctx)?.querySelector<HTMLElement>(`[role=option][id=${ctx.activeId}]`),

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
    const listboxEl = dom.getListboxEl(ctx)
    const setSize = listboxEl?.querySelector("[role-option]")?.getAttribute("aria-setsize")
    if (setSize != null) {
      return parseInt(setSize)
    }
    // else announce the number of options by querying the listbox
    return listboxEl?.querySelectorAll("[role=option]").length ?? 0
  },
  getMatchingOptionEl: (ctx: Ctx, value = ctx.trimmedInputValue) => {
    if (!value) return null
    return dom.getListboxEl(ctx)?.querySelector<HTMLElement>(`[role=option][data-label="${value}"`)
  },

  scrollIntoView: (ctx: Ctx, el: HTMLElement) => {
    scrollIntoViewIfNeeded(el, {
      boundary: dom.getListboxEl(ctx),
      block: "nearest",
      scrollMode: "if-needed",
    })
  },

  focusInput: (ctx: Ctx) => {
    const input = dom.getInputEl(ctx)
    if (dom.getDoc(ctx).activeElement !== input) {
      input?.focus()
    }
    if (ctx.selectOnFocus) {
      input?.select()
    }
  },
}
