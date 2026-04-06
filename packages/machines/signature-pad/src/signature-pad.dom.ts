import { getDataUrl as dataUrl } from "@zag-js/dom-query"
import type { DataUrlOptions } from "./signature-pad.types"
import type { Scope } from "@zag-js/core"
import { parts } from "./signature-pad.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `${ctx.id}:control`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getHiddenInputId = (ctx: Scope) => ctx.ids?.hiddenInput ?? `${ctx.id}:input`

// Element lookups — use querySelector with merged data attributes
export const getControlEl = (ctx: Scope) => ctx.query(ctx.selector(parts.control))
export const getSegmentEl = (ctx: Scope) => ctx.query<SVGSVGElement>(ctx.selector(parts.segment))
export const getHiddenInputEl = (ctx: Scope) => ctx.getById(getHiddenInputId(ctx))

export const getDataUrl = (ctx: Scope, options: DataUrlOptions): Promise<string> => {
  return dataUrl(getSegmentEl(ctx), options)
}
