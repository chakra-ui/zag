import type { Scope } from "@zag-js/core"
import { queryAll } from "@zag-js/dom-query"

export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `bottom-sheet:${ctx.id}:content`
export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `bottom-sheet:${ctx.id}:trigger`
export const getCloseTriggerId = (ctx: Scope) => ctx.ids?.closeTrigger ?? `bottom-sheet:${ctx.id}:close-trigger`

export const getContentEl = (ctx: Scope) => ctx.getById(getContentId(ctx))
export const getTriggerEl = (ctx: Scope) => ctx.getById(getTriggerId(ctx))
export const getCloseTriggerEl = (ctx: Scope) => ctx.getById(getCloseTriggerId(ctx))

export const getScrollEls = (scope: Scope) => {
  const els: Record<"x" | "y", HTMLElement[]> = { x: [], y: [] }

  const contentEl = getContentEl(scope)
  if (!contentEl) return els

  const nodes = queryAll(contentEl, "*")
  nodes.forEach((node) => {
    const y = node.scrollHeight > node.clientHeight
    if (y) els.y.push(node)

    const x = node.scrollWidth > node.clientWidth
    if (x) els.x.push(node)
  })

  return els
}
