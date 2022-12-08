import { defineDomHelpers, queryAll } from "@zag-js/dom-utils"
import type { MachineContext as Ctx } from "./radio-group.types"

export const dom = defineDomHelpers({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `radio:${ctx.id}`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `radio:${ctx.id}:label`,
  getRadioId: (ctx: Ctx, value: string) => ctx.ids?.radio?.(value) ?? `radio:${ctx.id}:item:${value}`,
  getItemInputId: (ctx: Ctx, value: string) => ctx.ids?.itemInput?.(value) ?? `radio:${ctx.id}:item:input:${value}`,
  getRadioControlId: (ctx: Ctx, value: string) =>
    ctx.ids?.radioControl?.(value) ?? `radio:${ctx.id}:item:control:${value}`,
  getRadioLabelId: (ctx: Ctx, value: string) => ctx.ids?.radioLabel?.(value) ?? `radio:${ctx.id}:item:label:${value}`,

  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getItemInputEl: (ctx: Ctx, value: string) => dom.getById<HTMLInputElement>(ctx, dom.getItemInputId(ctx, value)),

  getFirstEnabledInputEl: (ctx: Ctx) => dom.getRootEl(ctx)?.querySelector<HTMLInputElement>("input:not(:disabled)"),
  getFirstEnabledAndCheckedInputEl: (ctx: Ctx) =>
    dom.getRootEl(ctx)?.querySelector<HTMLInputElement>("input:not(:disabled):checked"),

  getInputEls: (ctx: Ctx) => {
    const ownerId = CSS.escape(dom.getRootId(ctx))
    const selector = `input[type=radio][data-ownedby='${ownerId}']:not([disabled])`
    return queryAll(dom.getRootEl(ctx), selector)
  },
})
