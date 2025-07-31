import type { Scope } from "@zag-js/core"
import { queryAll } from "@zag-js/dom-query"

export const getContentId = (scope: Scope) => `bottom-sheet:${scope.id}:content`
export const getContentEl = (scope: Scope) => scope.getById(getContentId(scope))

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
