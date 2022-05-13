import { dispatchInputValueEvent, indexOfId, nextById, prevById, queryAll } from "@zag-js/dom-utils"
import type { MachineContext as Ctx, TagProps } from "./tags-input.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getRootNode: (ctx: Ctx) => ctx.rootNode ?? dom.getDoc(ctx),

  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `tags-input:${ctx.uid}`,
  getInputId: (ctx: Ctx) => ctx.ids?.input ?? `tags-input:${ctx.uid}:input`,
  getClearButtonId: (ctx: Ctx) => ctx.ids?.clearBtn ?? `tags-input:${ctx.uid}:clear-btn`,
  getHiddenInputId: (ctx: Ctx) => `tags-input:${ctx.uid}:hidden-input`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `tags-input:${ctx.uid}:label`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `tags-input:${ctx.uid}:control`,
  getTagId: (ctx: Ctx, opt: TagProps) => ctx.ids?.tag?.(opt) ?? `tags-input:${ctx.uid}:tag:${opt.value}:${opt.index}`,
  getTagDeleteBtnId: (ctx: Ctx, opt: TagProps) =>
    ctx.ids?.tagDeleteBtn?.(opt) ?? `${dom.getTagId(ctx, opt)}:delete-btn`,
  getTagInputId: (ctx: Ctx, opt: TagProps) => ctx.ids?.tagInput?.(opt) ?? `${dom.getTagId(ctx, opt)}:input`,
  getEditInputId: (ctx: Ctx) => `${ctx.editedId}:input`,

  getTagInputEl: (ctx: Ctx, opt: TagProps) =>
    dom.getRootNode(ctx).getElementById(dom.getTagInputId(ctx, opt)) as HTMLInputElement | null,
  getRootEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getRootId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getInputId(ctx)) as HTMLInputElement | null,
  getHiddenInputEl: (ctx: Ctx) =>
    dom.getRootNode(ctx).getElementById(dom.getHiddenInputId(ctx)) as HTMLInputElement | null,
  getEditInputEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getEditInputId(ctx)) as HTMLInputElement | null,
  getElements: (ctx: Ctx) => queryAll(dom.getRootEl(ctx), `[data-part=tag]:not([data-disabled])`),
  getFirstEl: (ctx: Ctx) => dom.getElements(ctx)[0],
  getLastEl: (ctx: Ctx) => dom.getElements(ctx)[dom.getElements(ctx).length - 1],
  getPrevEl: (ctx: Ctx, id: string) => prevById(dom.getElements(ctx), id, false),
  getNextEl: (ctx: Ctx, id: string) => nextById(dom.getElements(ctx), id, false),
  getElAtIndex: (ctx: Ctx, index: number) => dom.getElements(ctx)[index],

  getIndexOfId: (ctx: Ctx, id: string) => indexOfId(dom.getElements(ctx), id),
  isInputFocused: (ctx: Ctx) => dom.getDoc(ctx).activeElement === dom.getInputEl(ctx),

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
    const el = dom.getHiddenInputEl(ctx)
    if (!el) return
    dispatchInputValueEvent(el, ctx.valueAsString)
  },
}
