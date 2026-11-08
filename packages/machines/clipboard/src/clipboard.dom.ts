import type { Scope } from "@zag-js/core"
import { parts } from "./clipboard.anatomy"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getInputId = (ctx: Scope) => ctx.ids?.input ?? `${ctx.id}:input`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getInputEl = (ctx: Scope) => ctx.query<HTMLInputElement>(ctx.selector(parts.input))

export const writeToClipboard = (ctx: Scope, value: string): Promise<void> => {
  const clipboard = ctx.getWin().navigator.clipboard
  // Only available in secure contexts (https or localhost)
  if (!clipboard) return Promise.reject(new Error("The Clipboard API is not available"))
  return clipboard.writeText(value)
}
