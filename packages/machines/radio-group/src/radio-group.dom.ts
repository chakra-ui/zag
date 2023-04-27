import { createScope, itemById, queryAll } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./radio-group.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `radio-group:${ctx.id}`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `radio-group:${ctx.id}:label`,
  getRadioId: (ctx: Ctx, value: string) => ctx.ids?.radio?.(value) ?? `radio-group:${ctx.id}:radio:${value}`,
  getRadioInputId: (ctx: Ctx, value: string) =>
    ctx.ids?.radioInput?.(value) ?? `radio-group:${ctx.id}:radio:input:${value}`,
  getRadioControlId: (ctx: Ctx, value: string) =>
    ctx.ids?.radioControl?.(value) ?? `radio-group:${ctx.id}:radio:control:${value}`,
  getRadioLabelId: (ctx: Ctx, value: string) =>
    ctx.ids?.radioLabel?.(value) ?? `radio-group:${ctx.id}:radio:label:${value}`,
  getIndicatorId: (ctx: Ctx) => ctx.ids?.indicator ?? `tabs:${ctx.id}:indicator`,

  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getRadioInputEl: (ctx: Ctx, value: string) => dom.getById<HTMLInputElement>(ctx, dom.getRadioInputId(ctx, value)),
  getIndicatorEl: (ctx: Ctx) => dom.getById(ctx, dom.getIndicatorId(ctx)),

  getFirstEnabledInputEl: (ctx: Ctx) => dom.getRootEl(ctx)?.querySelector<HTMLInputElement>("input:not(:disabled)"),
  getFirstEnabledAndCheckedInputEl: (ctx: Ctx) =>
    dom.getRootEl(ctx)?.querySelector<HTMLInputElement>("input:not(:disabled):checked"),

  getInputEls: (ctx: Ctx) => {
    const ownerId = CSS.escape(dom.getRootId(ctx))
    const selector = `input[type=radio][data-ownedby='${ownerId}']:not([disabled])`
    return queryAll<HTMLInputElement>(dom.getRootEl(ctx), selector)
  },

  getLabelEls: (ctx: Ctx) => {
    const selector = `[data-part='radio']:not([disabled])`
    return queryAll<HTMLInputElement>(dom.getRootEl(ctx), selector)
  },

  getRectById: (ctx: Ctx, id: string) => {
    const empty = {
      offsetLeft: 0,
      offsetTop: 0,
      offsetWidth: 0,
      offsetHeight: 0,
    }

    const input = itemById(dom.getLabelEls(ctx), dom.getRadioId(ctx, id)) ?? empty

    return {
      ...(ctx.isVertical ? { top: `${input.offsetTop}px` } : { left: `${input.offsetLeft}px` }),
      height: `${input.offsetHeight}px`,
      width: `${input.offsetWidth}px`,
    }
  },
})
