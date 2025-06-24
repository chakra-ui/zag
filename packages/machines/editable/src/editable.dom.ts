import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `editable:${ctx.id}`
export const getAreaId = (ctx: Scope) => ctx.ids?.area ?? `editable:${ctx.id}:area`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `editable:${ctx.id}:label`
export const getPreviewId = (ctx: Scope) => ctx.ids?.preview ?? `editable:${ctx.id}:preview`
export const getInputId = (ctx: Scope) => ctx.ids?.input ?? `editable:${ctx.id}:input`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `editable:${ctx.id}:control`
export const getSubmitTriggerId = (ctx: Scope) => ctx.ids?.submitTrigger ?? `editable:${ctx.id}:submit`
export const getCancelTriggerId = (ctx: Scope) => ctx.ids?.cancelTrigger ?? `editable:${ctx.id}:cancel`
export const getEditTriggerId = (ctx: Scope) => ctx.ids?.editTrigger ?? `editable:${ctx.id}:edit`

export const getInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getInputId(ctx))
export const getPreviewEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getPreviewId(ctx))
export const getSubmitTriggerEl = (ctx: Scope) => ctx.getById<HTMLButtonElement>(getSubmitTriggerId(ctx))
export const getCancelTriggerEl = (ctx: Scope) => ctx.getById<HTMLButtonElement>(getCancelTriggerId(ctx))
export const getEditTriggerEl = (ctx: Scope) => ctx.getById<HTMLButtonElement>(getEditTriggerId(ctx))
