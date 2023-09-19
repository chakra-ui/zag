import { createScope, queryAll } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./radio-group.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `radio-group:${ctx.id}`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `radio-group:${ctx.id}:label`,
  getItemId: (ctx: Ctx, value: string) => ctx.ids?.item?.(value) ?? `radio-group:${ctx.id}:radio:${value}`,
  getItemHiddenInputId: (ctx: Ctx, value: string) =>
    ctx.ids?.itemHiddenInput?.(value) ?? `radio-group:${ctx.id}:radio:input:${value}`,
  getItemControlId: (ctx: Ctx, value: string) =>
    ctx.ids?.itemControl?.(value) ?? `radio-group:${ctx.id}:radio:control:${value}`,
  getItemLabelId: (ctx: Ctx, value: string) =>
    ctx.ids?.itemLabel?.(value) ?? `radio-group:${ctx.id}:radio:label:${value}`,
  getIndicatorId: (ctx: Ctx) => ctx.ids?.indicator ?? `radio-group:${ctx.id}:indicator`,

  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getItemHiddenInputEl: (ctx: Ctx, value: string) =>
    dom.getById<HTMLInputElement>(ctx, dom.getItemHiddenInputId(ctx, value)),
  getIndicatorEl: (ctx: Ctx) => dom.getById(ctx, dom.getIndicatorId(ctx)),

  getFirstEnabledInputEl: (ctx: Ctx) => dom.getRootEl(ctx)?.querySelector<HTMLInputElement>("input:not(:disabled)"),
  getFirstEnabledAndCheckedInputEl: (ctx: Ctx) =>
    dom.getRootEl(ctx)?.querySelector<HTMLInputElement>("input:not(:disabled):checked"),

  getInputEls: (ctx: Ctx) => {
    const ownerId = CSS.escape(dom.getRootId(ctx))
    const selector = `input[type=radio][data-ownedby='${ownerId}']:not([disabled])`
    return queryAll<HTMLInputElement>(dom.getRootEl(ctx), selector)
  },

  getActiveRadioEl: (ctx: Ctx) => {
    if (!ctx.value) return
    return dom.getById(ctx, dom.getItemId(ctx, ctx.value))
  },

  getOffsetRect: (el: HTMLElement | undefined) => ({
    left: el?.offsetLeft ?? 0,
    top: el?.offsetTop ?? 0,
    width: el?.offsetWidth ?? 0,
    height: el?.offsetHeight ?? 0,
  }),

  getRectById: (ctx: Ctx, id: string) => {
    const radioEl = dom.getById(ctx, dom.getItemId(ctx, id))
    if (!radioEl) return
    return dom.resolveRect(dom.getOffsetRect(radioEl))
  },

  resolveRect: (rect: Record<"width" | "height" | "left" | "top", number>) => ({
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    left: `${rect.left}px`,
    top: `${rect.top}px`,
  }),
})
