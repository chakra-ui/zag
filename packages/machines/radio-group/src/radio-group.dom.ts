import { defineDomHelpers, queryAll } from "@zag-js/dom-utils"
import type { MachineContext as Ctx } from "./radio-group.types"

export const dom = defineDomHelpers({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `radio-group:${ctx.id}`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `radio-group:${ctx.id}:label`,
  getRadioId: (ctx: Ctx, value: string) => ctx.ids?.radio?.(value) ?? `radio-group:${ctx.id}:radio:${value}`,
  getRadioInputId: (ctx: Ctx, value: string) =>
    ctx.ids?.radioInput?.(value) ?? `radio-group:${ctx.id}:radio:input:${value}`,
  getRadioControlId: (ctx: Ctx, value: string) =>
    ctx.ids?.radioControl?.(value) ?? `radio-group:${ctx.id}:radio:control:${value}`,
  getRadioLabelId: (ctx: Ctx, value: string) =>
    ctx.ids?.radioLabel?.(value) ?? `radio-group:${ctx.id}:radio:label:${value}`,

  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getRadioInputEl: (ctx: Ctx, value: string) => dom.getById<HTMLInputElement>(ctx, dom.getRadioInputId(ctx, value)),

  getFirstEnabledInputEl: (ctx: Ctx) => dom.getRootEl(ctx)?.querySelector<HTMLInputElement>("input:not(:disabled)"),
  getFirstEnabledAndCheckedInputEl: (ctx: Ctx) =>
    dom.getRootEl(ctx)?.querySelector<HTMLInputElement>("input:not(:disabled):checked"),

  getInputEls: (ctx: Ctx) => {
    const ownerId = CSS.escape(dom.getRootId(ctx))
    const selector = `input[type=radio][data-ownedby='${ownerId}']:not([disabled])`
    return queryAll(dom.getRootEl(ctx), selector)
  },
})
