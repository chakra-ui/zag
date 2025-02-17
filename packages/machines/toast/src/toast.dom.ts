import type { Scope } from "@zag-js/core"
import type { Placement } from "./toast.types"

export const getRegionId = (placement: Placement) => `toast-group:${placement}`
export const getRegionEl = (ctx: Scope, placement: Placement) => ctx.getById(`toast-group:${placement}`)
export const getRootId = (ctx: Scope) => `toast:${ctx.id}`
export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getTitleId = (ctx: Scope) => `toast:${ctx.id}:title`
export const getDescriptionId = (ctx: Scope) => `toast:${ctx.id}:description`
export const getCloseTriggerId = (ctx: Scope) => `toast${ctx.id}:close`
