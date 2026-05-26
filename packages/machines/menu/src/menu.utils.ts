import type { Scope } from "@zag-js/core"
import { isPointInPolygon, type Point } from "@zag-js/rect-utils"
import * as dom from "./menu.dom"
import type { MenuService } from "./menu.types"

export function closeRootMenu(ctx: { parent: MenuService | null | undefined }) {
  let parent = ctx.parent
  while (parent && parent.context.get("isSubmenu")) {
    parent = parent.refs.get("parent")
  }
  parent?.send({ type: "CLOSE" })
}

export function isWithinPolygon(polygon: Point[] | null, point: Point) {
  if (!polygon) return false
  return isPointInPolygon(polygon, point)
}

export function resolveItemId(children: Record<string, MenuService>, value: string | null, scope: Scope) {
  const hasChildren = Object.keys(children).length > 0
  if (!value) return null
  if (!hasChildren) {
    return dom.getItemId(scope, value)
  }
  for (const id in children) {
    const childMenu = children[id]
    const childTriggerId = dom.getTriggerId(childMenu.scope)
    if (childTriggerId === value) {
      return childTriggerId
    }
  }
  return dom.getItemId(scope, value)
}

export function setParentRoutingLock(parent: MenuService | null | undefined, locked: boolean) {
  if (!parent) return
  parent.refs.set("pointerRoutingLocked", locked)
  parent.context.set("pointerRoutingMode", locked ? "locked" : "interactive")
}

function isHighlightedItemSubmenuOpen(parent: MenuService): boolean {
  const highlighted = parent.context.get("highlightedValue")
  if (!highlighted) return false
  const children = parent.refs.get("children")
  for (const id in children) {
    const child = children[id]
    if (!child.state.hasTag("open")) continue
    if (dom.getTriggerId(child.scope) === highlighted) return true
  }
  return false
}

export function unlockParentAfterChildClose(parent: MenuService | null | undefined, childIsSubmenu: boolean) {
  if (!parent) return
  if (parent.refs.get("pointerRoutingLocked")) return
  if (childIsSubmenu && isHighlightedItemSubmenuOpen(parent)) return
  setParentRoutingLock(parent, false)
}

export function unlockParentOnSubmenuClose(parent: MenuService | null | undefined) {
  if (!parent) return
  if (!isHighlightedItemSubmenuOpen(parent)) {
    setParentRoutingLock(parent, false)
  }
}
