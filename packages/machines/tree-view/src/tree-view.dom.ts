import type { Scope } from "@zag-js/core"
import { parts } from "./tree-view.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}:root`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getNodeId = (ctx: Scope, value: string) => ctx.ids?.node?.(value) ?? `${ctx.id}:node:${value}`
export const getTreeId = (ctx: Scope) => ctx.ids?.tree ?? `${ctx.id}:tree`
export const getRenameInputId = (ctx: Scope, value: string) => `${ctx.id}:rename-input:${value}`

// Element lookups — use querySelector with merged data attributes
export const getTreeEl = (ctx: Scope) => ctx.query(ctx.selector(parts.tree))

export const focusNode = (ctx: Scope, value: string | null | undefined) => {
  if (value == null) return
  ctx.getById(getNodeId(ctx, value))?.focus()
}

export const getRenameInputEl = (ctx: Scope, value: string) => {
  return ctx.getById<HTMLInputElement>(getRenameInputId(ctx, value))
}
