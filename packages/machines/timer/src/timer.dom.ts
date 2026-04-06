import type { Scope } from "@zag-js/core"
import { parts } from "./timer.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}:root`
export const getAreaId = (ctx: Scope) => ctx.ids?.area ?? `${ctx.id}:area`

// Element lookups — use querySelector with merged data attributes
export const getAreaEl = (ctx: Scope) => ctx.query(ctx.selector(parts.area))
