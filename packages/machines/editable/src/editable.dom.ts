import { withRootHelpers } from "@zag-js/dom-utils"
import type { MachineContext as Ctx } from "./editable.types"

type HTMLButtonEl = HTMLButtonElement | null
type HTMLInputEl = HTMLInputElement | null

export const dom = withRootHelpers({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `editable:${ctx.id}`,
  getAreaId: (ctx: Ctx) => ctx.ids?.area ?? `editable:${ctx.id}:area`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `editable:${ctx.id}:label`,
  getPreviewId: (ctx: Ctx) => ctx.ids?.preview ?? `editable:${ctx.id}:preview`,
  getInputId: (ctx: Ctx) => ctx.ids?.input ?? `editable:${ctx.id}:input`,
  getControlGroupId: (ctx: Ctx) => ctx.ids?.controlGroup ?? `editable:${ctx.id}:controls`,
  getSubmitBtnId: (ctx: Ctx) => ctx.ids?.submitBtn ?? `editable:${ctx.id}:submit-btn`,
  getCancelBtnId: (ctx: Ctx) => ctx.ids?.cancelBtn ?? `editable:${ctx.id}:cancel-btn`,
  getEditBtnId: (ctx: Ctx) => ctx.ids?.editBtn ?? `editable:${ctx.id}:edit-btn`,

  getInputEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getInputId(ctx)) as HTMLInputEl,
  getPreviewEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getPreviewId(ctx)) as HTMLInputEl,
  getSubmitBtnEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getSubmitBtnId(ctx)) as HTMLButtonEl,
  getCancelBtnEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getCancelBtnId(ctx)) as HTMLButtonEl,
  getEditBtnEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getEditBtnId(ctx)) as HTMLButtonEl,
})
