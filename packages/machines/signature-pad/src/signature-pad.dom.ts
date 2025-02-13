import { getDataUrl as dataUrl, query } from "@zag-js/dom-query"
import type { DataUrlOptions } from "./signature-pad.types"
import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `signature-${ctx.id}`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `signature-control-${ctx.id}`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `signature-label-${ctx.id}`
export const getHiddenInputId = (ctx: Scope) => ctx.ids?.hiddenInput ?? `signature-input-${ctx.id}`

export const getControlEl = (ctx: Scope) => ctx.getById(getControlId(ctx))
export const getSegmentEl = (ctx: Scope) => query<SVGSVGElement>(getControlEl(ctx), "[data-part=segment]")
export const getHiddenInputEl = (ctx: Scope) => ctx.getById(getHiddenInputId(ctx))

export const getDataUrl = (ctx: Scope, options: DataUrlOptions): Promise<string> => {
  return dataUrl(getSegmentEl(ctx), options)
}
