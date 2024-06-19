import { createScope, indexOfId, nextById, prevById, queryAll } from "@zag-js/dom-query"
import { dispatchInputValueEvent } from "@zag-js/form-utils"
import type { MachineContext as Ctx, ItemProps } from "./tags-input.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `tags-input:${ctx.id}`,
  getInputId: (ctx: Ctx) => ctx.ids?.input ?? `tags-input:${ctx.id}:input`,
  getClearTriggerId: (ctx: Ctx) => ctx.ids?.clearBtn ?? `tags-input:${ctx.id}:clear-btn`,
  getHiddenInputId: (ctx: Ctx) => ctx.ids?.hiddenInput ?? `tags-input:${ctx.id}:hidden-input`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `tags-input:${ctx.id}:label`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `tags-input:${ctx.id}:control`,
  getItemId: (ctx: Ctx, opt: ItemProps) => ctx.ids?.item?.(opt) ?? `tags-input:${ctx.id}:tag:${opt.value}:${opt.index}`,
  getItemDeleteTriggerId: (ctx: Ctx, opt: ItemProps) =>
    ctx.ids?.itemDeleteTrigger?.(opt) ?? `${dom.getItemId(ctx, opt)}:delete-btn`,
  getItemInputId: (ctx: Ctx, opt: ItemProps) => ctx.ids?.itemInput?.(opt) ?? `${dom.getItemId(ctx, opt)}:input`,
  getEditInputId: (ctx: Ctx) => `${ctx.editedTagId}:input`,

  getTagInputEl: (ctx: Ctx, opt: ItemProps) => dom.getById<HTMLInputElement>(ctx, dom.getItemInputId(ctx, opt)),
  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getInputId(ctx)),
  getHiddenInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getHiddenInputId(ctx)),
  getEditInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getEditInputId(ctx)),
  getTagElements: (ctx: Ctx) => queryAll(dom.getRootEl(ctx), `[data-part=item-preview]:not([data-disabled])`),
  getFirstEl: (ctx: Ctx) => dom.getTagElements(ctx)[0],
  getLastEl: (ctx: Ctx) => dom.getTagElements(ctx)[dom.getTagElements(ctx).length - 1],
  getPrevEl: (ctx: Ctx, id: string) => prevById(dom.getTagElements(ctx), id, false),
  getNextEl: (ctx: Ctx, id: string) => nextById(dom.getTagElements(ctx), id, false),
  getTagElAtIndex: (ctx: Ctx, index: number) => dom.getTagElements(ctx)[index],

  getIndexOfId: (ctx: Ctx, id: string) => indexOfId(dom.getTagElements(ctx), id),
  isInputFocused: (ctx: Ctx) => dom.getDoc(ctx).activeElement === dom.getInputEl(ctx),

  getHighlightedTagValue: (ctx: Ctx) => {
    if (!ctx.highlightedTagId) return null
    const tagEl = dom.getById(ctx, ctx.highlightedTagId)
    return tagEl?.dataset.value ?? null
  },
  setHoverIntent: (el: Element) => {
    const tagEl = el.closest<HTMLElement>("[data-part=item-preview]")
    if (!tagEl) return
    tagEl.dataset.deleteIntent = ""
  },
  clearHoverIntent: (el: Element) => {
    const tagEl = el.closest<HTMLElement>("[data-part=item-preview]")
    if (!tagEl) return
    delete tagEl.dataset.deleteIntent
  },
  dispatchInputEvent(ctx: Ctx) {
    const inputEl = dom.getHiddenInputEl(ctx)
    if (!inputEl) return
    dispatchInputValueEvent(inputEl, { value: ctx.valueAsString })
  },
})
