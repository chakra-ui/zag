import type { Scope } from "@zag-js/core"
import { parts } from "./password-input.anatomy"

export const getInputId = (ctx: Scope) => ctx.ids?.input ?? `${ctx.id}:input`

export const getInputEl = (ctx: Scope) => ctx.query<HTMLInputElement>(ctx.selector(parts.input))
