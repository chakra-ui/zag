import type { MachineContext as Ctx } from "./editable.types"

type HTMLButtonEl = HTMLButtonElement | null
type HTMLInputEl = HTMLInputElement | null

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getRootId: (ctx: Ctx) => `editable-${ctx.uid}`,
  getLabelId: (ctx: Ctx) => `editable-label-${ctx.uid}`,
  getInputId: (ctx: Ctx) => `editable-input-${ctx.uid}`,
  getSubmitBtnId: (ctx: Ctx) => `editable-submit-btn-${ctx.uid}`,
  getCancelBtnId: (ctx: Ctx) => `editable-cancel-btn-${ctx.uid}`,
  getEditBtnId: (ctx: Ctx) => `editable-edit-btn-${ctx.uid}`,

  getLabelEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getLabelId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getInputId(ctx)) as HTMLInputEl,
  getSubmitBtnEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getSubmitBtnId(ctx)) as HTMLButtonEl,
  getCancelBtnEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getCancelBtnId(ctx)) as HTMLButtonEl,
  getEditBtnEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getEditBtnId(ctx)) as HTMLButtonEl,
}
