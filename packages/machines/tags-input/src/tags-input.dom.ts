import { dispatchInputEvent, indexOfId, nextById, prevById, queryAll } from "@zag-js/dom-utils"
import { MachineContext as Ctx, TagProps } from "./tags-input.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,

  getRootId: (ctx: Ctx) => `tags-input-${ctx.uid}-root`,
  getInputId: (ctx: Ctx) => `tags-input-${ctx.uid}-input`,
  getEditInputId: (ctx: Ctx) => `${ctx.editedId}-input`,
  getClearButtonId: (ctx: Ctx) => `tags-input-${ctx.uid}-clear-btn`,
  getHiddenInputId: (ctx: Ctx) => `tags-input-${ctx.uid}-hidden-input`,
  getLabelId: (ctx: Ctx) => `tags-input-${ctx.uid}-label`,
  getControlId: (ctx: Ctx) => `tags-input-${ctx.uid}-control`,
  getTagId: (ctx: Ctx, opt: TagProps) => `tags-input-${ctx.uid}-tag-${opt.value}-${opt.index}`,
  getTagDeleteBtnId: (ctx: Ctx, opt: TagProps) => `${dom.getTagId(ctx, opt)}-delete-btn`,
  getTagInputId: (ctx: Ctx, opt: TagProps) => `${dom.getTagId(ctx, opt)}-input`,

  getTagInputEl: (ctx: Ctx, opt: TagProps) =>
    dom.getDoc(ctx)?.getElementById(dom.getTagInputId(ctx, opt)) as HTMLInputElement | null,
  getRootEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getRootId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getInputId(ctx)) as HTMLInputElement | null,
  getHiddenInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getHiddenInputId(ctx)) as HTMLInputElement | null,
  getEditInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getEditInputId(ctx)) as HTMLInputElement | null,
  getElements: (ctx: Ctx) => queryAll(dom.getRootEl(ctx), `[data-part=tag]:not([data-disabled])`),

  getIndexOfId: (ctx: Ctx, id: string) => indexOfId(dom.getElements(ctx), id),
  getElAtIndex: (ctx: Ctx, index: number) => dom.getElements(ctx)[index],
  isInputFocused: (ctx: Ctx) => dom.getDoc(ctx).activeElement === dom.getInputEl(ctx),
  getFirstEl: (ctx: Ctx) => dom.getElements(ctx)[0],
  getLastEl: (ctx: Ctx) => dom.getElements(ctx)[dom.getElements(ctx).length - 1],
  getPrevEl: (ctx: Ctx, id: string) => prevById(dom.getElements(ctx), id, false),
  getNextEl: (ctx: Ctx, id: string) => nextById(dom.getElements(ctx), id, false),

  getFocusedTagValue: (ctx: Ctx) => {
    if (!ctx.focusedId) return null
    const idx = dom.getIndexOfId(ctx, ctx.focusedId)
    if (idx === -1) return null
    return dom.getElements(ctx)[idx].dataset.value ?? null
  },
  setHoverIntent: (el: Element) => {
    const tag = el.closest<HTMLElement>("[data-part=tag]")
    if (!tag) return
    tag.dataset.deleteIntent = ""
  },
  clearHoverIntent: (el: Element) => {
    const tag = el.closest<HTMLElement>("[data-part=tag]")
    if (!tag) return
    delete tag.dataset.deleteIntent
  },
  dispatchInputEvent(ctx: Ctx) {
    const input = dom.getHiddenInputEl(ctx)
    if (!input) return
    dispatchInputEvent(input, ctx.valueAsString)
  },
}
