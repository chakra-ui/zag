import type { Scope } from "@zag-js/core"
import type { Placement } from "./toast.types"
import { parts } from "./toast.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getRegionId = (placement: Placement) => `toast-group-${placement}`
export const getRootId = (ctx: Scope) => `${ctx.id}`
export const getTitleId = (ctx: Scope) => `${ctx.id}:title`
export const getDescriptionId = (ctx: Scope) => `${ctx.id}:description`
export const getCloseTriggerId = (ctx: Scope) => `${ctx.id}:close`

// Element lookups — use querySelector with merged data attributes
export const getRegionEl = (ctx: Scope, placement: Placement) => ctx.getById(`toast-group-${placement}`)
export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
