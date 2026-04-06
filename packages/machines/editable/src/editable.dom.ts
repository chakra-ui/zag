import type { Scope } from "@zag-js/core"
import { parts } from "./editable.anatomy"

// ID generators — only for parts referenced by ARIA attributes
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getAreaId = (ctx: Scope) => ctx.ids?.area ?? `${ctx.id}:area`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getPreviewId = (ctx: Scope) => ctx.ids?.preview ?? `${ctx.id}:preview`
export const getInputId = (ctx: Scope) => ctx.ids?.input ?? `${ctx.id}:input`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `${ctx.id}:control`
export const getSubmitTriggerId = (ctx: Scope) => ctx.ids?.submitTrigger ?? `${ctx.id}:submit`
export const getCancelTriggerId = (ctx: Scope) => ctx.ids?.cancelTrigger ?? `${ctx.id}:cancel`
export const getEditTriggerId = (ctx: Scope) => ctx.ids?.editTrigger ?? `${ctx.id}:edit`

// Element lookups — use querySelector with merged data attributes
export const getInputEl = (ctx: Scope) => ctx.query<HTMLInputElement>(ctx.selector(parts.input))
export const getPreviewEl = (ctx: Scope) => ctx.query<HTMLInputElement>(ctx.selector(parts.preview))
export const getSubmitTriggerEl = (ctx: Scope) => ctx.query<HTMLButtonElement>(ctx.selector(parts.submitTrigger))
export const getCancelTriggerEl = (ctx: Scope) => ctx.query<HTMLButtonElement>(ctx.selector(parts.cancelTrigger))
export const getEditTriggerEl = (ctx: Scope) => ctx.query<HTMLButtonElement>(ctx.selector(parts.editTrigger))
