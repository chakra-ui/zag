import type { ListCollection } from "@zag-js/collection"
import type { Scope } from "@zag-js/core"
import { isPointInPolygon, type Point } from "@zag-js/rect-utils"
import * as dom from "./menu.dom"
import type { MenuService, OpenChangeReason } from "./menu.types"

export function closeRootMenu(ctx: { parent: MenuService | null | undefined; src?: OpenChangeReason | undefined }) {
  let parent = ctx.parent
  while (parent && parent.context.get("isSubmenu")) {
    parent = parent.refs.get("parent")
  }
  parent?.send({ type: "CLOSE", src: ctx.src })
}

// Walks up to the root menu of the tree and returns its menubar element + orientation,
// so any menu (incl. a nested submenu) can reach the menubar its root menu lives in.
export function getTreeMenubar(service: MenuService): {
  rootEl: HTMLElement | null
  orientation: "horizontal" | "vertical"
} {
  let root = service
  while (root.context.get("isSubmenu")) {
    const parent = root.refs.get("parent")
    if (!parent) break
    root = parent
  }
  const menubar = root.prop("menubar")
  return {
    rootEl: dom.getMenubarEl(root.scope, menubar?.rootId),
    orientation: menubar?.orientation ?? "horizontal",
  }
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

// A collection reaches items that aren't rendered; without one, the rendered items are the list
type ItemList = ListCollection<any> | undefined

export function getEdgeValue(
  scope: Scope,
  triggerValue: string | null,
  collection: ItemList,
  edge: "first" | "last",
): string | null {
  if (collection) return edge === "first" ? collection.firstValue : collection.lastValue
  const items = dom.getElements(scope, triggerValue)
  return dom.getItemValue(edge === "first" ? items[0] : items[items.length - 1])
}

/** The enabled value next to `value`, or null past the end. An unknown `value` starts from the edge. */
export function getAdjacentValue(
  scope: Scope,
  triggerValue: string | null,
  collection: ItemList,
  value: string | null,
  step: 1 | -1,
) {
  const edge = step > 0 ? "first" : "last"
  if (collection) {
    if (!collection.has(value)) return getEdgeValue(scope, triggerValue, collection, edge)
    return step > 0 ? collection.getNextValue(value) : collection.getPreviousValue(value)
  }
  const items = dom.getElements(scope, triggerValue)
  const index = items.findIndex((el) => dom.getItemValue(el) === value)
  if (index === -1) return getEdgeValue(scope, triggerValue, collection, edge)
  return dom.getItemValue(items[index + step])
}

export function hasItemValue(scope: Scope, triggerValue: string | null, collection: ItemList, value: string | null) {
  if (value == null) return false
  if (collection) return collection.has(value)
  return dom.getElements(scope, triggerValue).some((el) => dom.getItemValue(el) === value)
}
