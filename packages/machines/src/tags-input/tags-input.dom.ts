import { nextById, prevById, queryElements, indexOfId } from "tiny-nodelist"
import { TagsInputMachineContext as Ctx } from "./tags-input.machine"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getRootId: (ctx: Ctx) => `tags-input-${ctx.uid}-root`,
  getInputId: (ctx: Ctx) => `tags-input-${ctx.uid}-input`,
  getEditInputId: (ctx: Ctx) => `${ctx.editedId}-input`,
  getTagId: (ctx: Ctx, id: string | number) => `tags-input-${ctx.uid}-tag-${id}`,
  getTagDeleteBtnId: (ctx: Ctx, id: string | number) => `tags-input-${ctx.uid}-tag-${id}-delete-btn`,

  getRootEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getRootId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getInputId(ctx)) as HTMLInputElement | null,
  getEditInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getEditInputId(ctx)) as HTMLInputElement | null,
  getTag: (ctx: Ctx, id: string) => dom.getDoc(ctx).getElementById(dom.getTagId(ctx, id)),
  getElements: (ctx: Ctx) => queryElements(dom.getRootEl(ctx), `[data-ownedby=${dom.getRootId(ctx)}]`),

  getIndexOfId: (ctx: Ctx, id: string) => indexOfId(dom.getElements(ctx), id),
  isInputFocused: (ctx: Ctx) => dom.getDoc(ctx).activeElement === dom.getInputEl(ctx),
  getFirstEl: (ctx: Ctx) => dom.getElements(ctx)[0],
  getLastEl: (ctx: Ctx) => dom.getElements(ctx)[dom.getElements(ctx).length - 1],
  getPrevEl: (ctx: Ctx, id: string) => prevById(dom.getElements(ctx), id, false),
  getNextEl: (ctx: Ctx, id: string) => nextById(dom.getElements(ctx), id, false),
}
