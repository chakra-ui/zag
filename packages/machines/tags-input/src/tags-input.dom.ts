import { dispatchInputValueEvent, defineDomHelpers, indexOfId, nextById, prevById, queryAll } from "@zag-js/dom-utils"
import type { MachineContext as Ctx, TagProps } from "./tags-input.types"

export const dom = defineDomHelpers({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `tags-input:${ctx.id}`,
  getInputId: (ctx: Ctx) => ctx.ids?.input ?? `tags-input:${ctx.id}:input`,
  getClearButtonId: (ctx: Ctx) => ctx.ids?.clearBtn ?? `tags-input:${ctx.id}:clear-btn`,
  getHiddenInputId: (ctx: Ctx) => `tags-input:${ctx.id}:hidden-input`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `tags-input:${ctx.id}:label`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `tags-input:${ctx.id}:control`,
  getTagId: (ctx: Ctx, opt: TagProps) => ctx.ids?.tag?.(opt) ?? `tags-input:${ctx.id}:tag:${opt.value}:${opt.index}`,
  getTagDeleteBtnId: (ctx: Ctx, opt: TagProps) =>
    ctx.ids?.tagDeleteBtn?.(opt) ?? `${dom.getTagId(ctx, opt)}:delete-btn`,
  getTagInputId: (ctx: Ctx, opt: TagProps) => ctx.ids?.tagInput?.(opt) ?? `${dom.getTagId(ctx, opt)}:input`,
  getEditInputId: (ctx: Ctx) => `${ctx.editedId}:input`,

  getTagInputEl: (ctx: Ctx, opt: TagProps) => dom.getById(ctx, dom.getTagInputId(ctx, opt)) as HTMLInputElement | null,
  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getById(ctx, dom.getInputId(ctx)) as HTMLInputElement | null,
  getHiddenInputEl: (ctx: Ctx) => dom.getById(ctx, dom.getHiddenInputId(ctx)) as HTMLInputElement | null,
  getEditInputEl: (ctx: Ctx) => dom.getById(ctx, dom.getEditInputId(ctx)) as HTMLInputElement | null,
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
})
