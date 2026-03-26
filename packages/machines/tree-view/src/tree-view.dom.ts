import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `tree:${ctx.id}:root`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `tree:${ctx.id}:label`
export const getNodeId = (ctx: Scope, value: string) => ctx.ids?.node?.(value) ?? `tree:${ctx.id}:node:${value}`
export const getTreeId = (ctx: Scope) => ctx.ids?.tree ?? `tree:${ctx.id}:tree`
export const getTreeEl = (ctx: Scope) => ctx.getById(getTreeId(ctx))

export const focusNode = (ctx: Scope, value: string | null | undefined) => {
  if (value == null) return
  ctx.getById(getNodeId(ctx, value))?.focus()
}

export const getRenameInputId = (ctx: Scope, value: string) => `tree:${ctx.id}:rename-input:${value}`

export const getRenameInputEl = (ctx: Scope, value: string) => {
  return ctx.getById<HTMLInputElement>(getRenameInputId(ctx, value))
}
