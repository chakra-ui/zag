import type { Scope } from "@zag-js/core"
import { parts } from "./infinite-scroll.anatomy"

// ID generators
export const getSentinelId = (ctx: Scope) => ctx.ids?.sentinel ?? `${ctx.id}:sentinel`

// Element lookups — use querySelector with merged data attributes
export const getSentinelEl = (ctx: Scope) => ctx.query<HTMLElement>(ctx.selector(parts.sentinel))
