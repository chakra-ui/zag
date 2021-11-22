import { nextById, prevById, queryElements } from "@ui-machines/dom-utils"
import { first, last } from "@ui-machines/utils"
import type { ComboboxMachineContext as Ctx } from "./combobox.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getLabelId: (ctx: Ctx) => `combobox-${ctx.uid}-label`,
  getContainerId: (ctx: Ctx) => `combobox-${ctx.uid}`,
  getInputId: (ctx: Ctx) => `combobox-${ctx.uid}-input`,
  getListboxId: (ctx: Ctx) => `combobox-${ctx.uid}-listbox`,
  getToggleBtnId: (ctx: Ctx) => `combobox-${ctx.uid}-toggle-btn`,
  getClearBtnId: (ctx: Ctx) => `combobox-${ctx.uid}-clear-btn`,
  getSrHintId: (ctx: Ctx) => `combobox-${ctx.uid}-sr-hint`,
  getOptionId: (ctx: Ctx, id: number | string) => `combobox-${ctx.uid}-option-${id}`,

  getActiveOptionEl: (ctx: Ctx) => (ctx.activeId ? dom.getDoc(ctx).getElementById(ctx.activeId) : null),
  getListboxEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getListboxId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getInputId(ctx)) as HTMLInputElement | null,
  getToggleBtnEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getToggleBtnId(ctx)),
  getClearBtnEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getClearBtnId(ctx)),

  getElements: (ctx: Ctx) => queryElements(dom.getListboxEl(ctx), "[role=option]:not([disabled])"),
  getFocusedOptionEl: (ctx: Ctx) =>
    dom.getListboxEl(ctx)?.querySelector<HTMLElement>(`[role=option][id=${ctx.activeId}]`),

  getFirstEl: (ctx: Ctx) => first(dom.getElements(ctx)),
  getLastEl: (ctx: Ctx) => last(dom.getElements(ctx)),
  getPrevEl: (ctx: Ctx, id: string) => prevById(dom.getElements(ctx), id),
  getNextEl: (ctx: Ctx, id: string) => nextById(dom.getElements(ctx), id),

  isInputFocused: (ctx: Ctx) => dom.getDoc(ctx).activeElement === dom.getInputEl(ctx),
  getOptionData: (el: HTMLElement | null | undefined) => ({
    value: el?.getAttribute("data-value") ?? "",
    label: el?.getAttribute("data-label") ?? "",
  }),
}
