import type { MachineContext as Ctx } from "./editable.types"

type HTMLButtonEl = HTMLButtonElement | null
type HTMLInputEl = HTMLInputElement | null

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getRootId: (ctx: Ctx) => `editable-${ctx.uid}`,
  getAreaId: (ctx: Ctx) => `editable-${ctx.uid}-area`,
  getPreviewId: (ctx: Ctx) => `editable-${ctx.uid}-preview`,
  getInputId: (ctx: Ctx) => `editable-${ctx.uid}-input`,
  getSubmitBtnId: (ctx: Ctx) => `editable-${ctx.uid}-submit-btn`,
  getCancelBtnId: (ctx: Ctx) => `editable-${ctx.uid}-cancel-btn`,
  getEditBtnId: (ctx: Ctx) => `editable-${ctx.uid}-edit-btn`,

  getInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getInputId(ctx)) as HTMLInputEl,
  getSubmitBtnEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getSubmitBtnId(ctx)) as HTMLButtonEl,
  getCancelBtnEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getCancelBtnId(ctx)) as HTMLButtonEl,
  getEditBtnEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getEditBtnId(ctx)) as HTMLButtonEl,
}
