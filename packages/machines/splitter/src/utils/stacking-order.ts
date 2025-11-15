/**
 * Stacking order comparison utility.
 * Based on stacking-order@2.0.0 library
 * @see https://github.com/Rich-Harris/stacking-order
 * Background at https://github.com/Rich-Harris/stacking-order/issues/3
 * Background at https://github.com/Rich-Harris/stacking-order/issues/6
 */

import { getComputedStyle, isShadowRoot } from "@zag-js/dom-query"
import { ensure, hasProp } from "@zag-js/utils"

/**
 * Determine which of two nodes appears in front of the other —
 * if `a` is in front, returns 1, otherwise returns -1
 * @param a First element
 * @param b Second element
 */
export function compareStackingOrder(a: Element, b: Element): number {
  if (a === b) throw new Error("Cannot compare node with itself")

  const ancestors = {
    a: getAncestors(a),
    b: getAncestors(b),
  }

  let commonAncestor: Element | null = null

  // Remove shared ancestors
  while (ancestors.a.at(-1) === ancestors.b.at(-1)) {
    const currentA = ancestors.a.pop() as Element
    ancestors.b.pop() // Remove from b's ancestors but don't need to store
    commonAncestor = currentA
  }

  ensure(
    commonAncestor,
    () => "[stacking-order] Stacking order can only be calculated for elements with a common ancestor",
  )

  const zIndexes = {
    a: getZIndex(findStackingContext(ancestors.a)),
    b: getZIndex(findStackingContext(ancestors.b)),
  }

  if (zIndexes.a === zIndexes.b) {
    const children = commonAncestor!.childNodes

    const furthestAncestors = {
      a: ancestors.a.at(-1),
      b: ancestors.b.at(-1),
    }

    let i = children.length
    while (i--) {
      const child = children[i]
      if (child === furthestAncestors.a) return 1
      if (child === furthestAncestors.b) return -1
    }
  }

  return Math.sign(zIndexes.a - zIndexes.b)
}

const props = /\b(?:position|zIndex|opacity|transform|webkitTransform|mixBlendMode|filter|webkitFilter|isolation)\b/

function isFlexItem(node: Element) {
  const parent = getParent(node)
  const display = getComputedStyle(parent ?? node).display
  return display === "flex" || display === "inline-flex"
}

function createsStackingContext(node: Element) {
  const style = getComputedStyle(node)

  // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context
  if (style.position === "fixed") return true
  // Forked to fix upstream bug https://github.com/Rich-Harris/stacking-order/issues/3
  if (style.zIndex !== "auto" && (style.position !== "static" || isFlexItem(node))) return true
  if (+style.opacity < 1) return true
  if (hasProp(style, "transform") && style.transform !== "none") return true
  if (hasProp(style, "webkitTransform") && style.webkitTransform !== "none") return true
  if (hasProp(style, "mixBlendMode") && style.mixBlendMode !== "normal") return true
  if (hasProp(style, "filter") && style.filter !== "none") return true
  if (hasProp(style, "webkitFilter") && style.webkitFilter !== "none") return true
  if (hasProp(style, "isolation") && style.isolation === "isolate") return true
  if (props.test(style.willChange)) return true
  // @ts-expect-error
  if (style.webkitOverflowScrolling === "touch") return true
  return false
}

/** @param nodes */
function findStackingContext(nodes: Element[]) {
  let i = nodes.length
  while (i--) {
    const node = nodes[i]
    ensure(node, () => "[stacking-order] missing node in findStackingContext")
    if (createsStackingContext(node)) return node
  }
  return null
}

const getZIndex = (node: Element | null) => {
  return (node && Number(getComputedStyle(node).zIndex)) || 0
}

const getAncestors = (node: Element | null) => {
  const ancestors: Element[] = []
  while (node) {
    ancestors.push(node)
    node = getParent(node)
  }
  return ancestors // [ node, ... <body>, <html>, document ]
}

const getParent = (node: Element) => {
  const { parentNode } = node
  if (isShadowRoot(parentNode)) return parentNode.host
  return parentNode as Element | null
}
