import { nextById, prevById, queryAll } from "@ui-machines/dom-utils"
import { first, last } from "@ui-machines/utils"
import scrollIntoViewIfNeeded from "scroll-into-view-if-needed"
import type { MachineContext as Ctx } from "./combobox.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getRootId: (ctx: Ctx) => `combobox-${ctx.uid}-root`,
  getLabelId: (ctx: Ctx) => `combobox-${ctx.uid}-label`,
  getContainerId: (ctx: Ctx) => `combobox-${ctx.uid}`,
  getInputId: (ctx: Ctx) => `combobox-${ctx.uid}-input`,
  getListboxId: (ctx: Ctx) => `combobox-${ctx.uid}-listbox`,
  getPositionerId: (ctx: Ctx) => `combobox-${ctx.uid}-popover`,
  getToggleBtnId: (ctx: Ctx) => `combobox-${ctx.uid}-toggle-btn`,
  getClearBtnId: (ctx: Ctx) => `combobox-${ctx.uid}-clear-btn`,
  getOptionId: (ctx: Ctx, id: number | string, index?: number) =>
    [`combobox-${ctx.uid}-option-${id}`, index].filter((v) => v != null).join("-"),

  getActiveOptionEl: (ctx: Ctx) => (ctx.activeId ? dom.getDoc(ctx).getElementById(ctx.activeId) : null),
  getListboxEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getListboxId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getInputId(ctx)) as HTMLInputElement | null,
  getPositionerEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getPositionerId(ctx)),
  getContainerEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getContainerId(ctx)),
  getToggleBtnEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getToggleBtnId(ctx)),
  getClearBtnEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getClearBtnId(ctx)),

  getElements: (ctx: Ctx) => queryAll(dom.getListboxEl(ctx), "[role=option]:not([aria-disabled=true])"),
  getFocusedOptionEl: (ctx: Ctx) => {
    if (!ctx.activeId) return null
    const selector = `[role=option][id=${CSS.escape(ctx.activeId)}]`
    return dom.getListboxEl(ctx)?.querySelector<HTMLElement>(selector)
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
    const listboxEl = dom.getListboxEl(ctx)
    const setSize = listboxEl?.querySelector("[role-option]")?.getAttribute("aria-setsize")
    if (setSize != null) {
      return parseInt(setSize)
    }
    // else announce the number of options by querying the listbox
    return listboxEl?.querySelectorAll("[role=option]").length ?? 0
  },
  getMatchingOptionEl: (ctx: Ctx, value = ctx.inputValue) => {
    if (!value) return null
    const selector = `[role=option][data-label="${CSS.escape(value)}"`
    return dom.getListboxEl(ctx)?.querySelector<HTMLElement>(selector)
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
