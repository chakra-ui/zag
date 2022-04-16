import type { MachineContext as Ctx } from "./editable.types"

type HTMLButtonEl = HTMLButtonElement | null
type HTMLInputEl = HTMLInputElement | null

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `editable:${ctx.uid}`,
  getAreaId: (ctx: Ctx) => ctx.ids?.area ?? `editable:${ctx.uid}:area`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `editable:${ctx.uid}:label`,
  getPreviewId: (ctx: Ctx) => ctx.ids?.preview ?? `editable:${ctx.uid}:preview`,
  getInputId: (ctx: Ctx) => ctx.ids?.input ?? `editable:${ctx.uid}:input`,
  getControlGroupId: (ctx: Ctx) => ctx.ids?.controlGroup ?? `editable:${ctx.uid}:controls`,
  getSubmitBtnId: (ctx: Ctx) => ctx.ids?.submitBtn ?? `editable:${ctx.uid}:submit-btn`,
  getCancelBtnId: (ctx: Ctx) => ctx.ids?.cancelBtn ?? `editable:${ctx.uid}:cancel-btn`,
  getEditBtnId: (ctx: Ctx) => ctx.ids?.editBtn ?? `editable:${ctx.uid}:edit-btn`,

  getInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getInputId(ctx)) as HTMLInputEl,
  getPreviewEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getPreviewId(ctx)) as HTMLInputEl,
  getSubmitBtnEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getSubmitBtnId(ctx)) as HTMLButtonEl,
  getCancelBtnEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getCancelBtnId(ctx)) as HTMLButtonEl,
  getEditBtnEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getEditBtnId(ctx)) as HTMLButtonEl,
}
