import type { MachineContext } from "./cascader.types"

export function getSiblings(ctx: MachineContext) {
  // Slice the last index off to get the parent’s index path
  const parentIndexPath = ctx.highlightedIndexPath.slice(0, -1)
  // Get the parent node
  const parentNode = ctx.collection.at(parentIndexPath)
  if (!parentNode) return

  // Get the parent's children (siblings of the highlighted node)
  const siblings = ctx.collection.getNodeChildren(parentNode)
  if (siblings.length <= 1) return
  return siblings
}

export function getNextSibling(ctx: MachineContext) {
  const siblings = getSiblings(ctx)
  if (!siblings) return
  const currentIndex = ctx.highlightedIndexPath[ctx.highlightedIndexPath.length - 1]

  // Find next enabled sibling
  for (let i = currentIndex + 1; i < siblings.length; i++) {
    if (!ctx.collection.getNodeDisabled(siblings[i])) {
      return [...ctx.highlightedIndexPath.slice(0, -1), i]
    }
  }

  // If loop is enabled, search from start
  if (ctx.loopFocus) {
    for (let i = 0; i < currentIndex; i++) {
      if (!ctx.collection.getNodeDisabled(siblings[i])) {
        return [...ctx.highlightedIndexPath.slice(0, -1), i]
      }
    }
  }

  return ctx.highlightedIndexPath
}

export function getPreviousSibling(ctx: MachineContext) {
  const siblings = getSiblings(ctx)
  if (!siblings) return
  const currentIndex = ctx.highlightedIndexPath[ctx.highlightedIndexPath.length - 1]

  // Find previous enabled sibling
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (!ctx.collection.getNodeDisabled(siblings[i])) {
      return [...ctx.highlightedIndexPath.slice(0, -1), i]
    }
  }

  // If loop is enabled, search from end
  if (ctx.loopFocus) {
    for (let i = siblings.length - 1; i > currentIndex; i--) {
      if (!ctx.collection.getNodeDisabled(siblings[i])) {
        return [...ctx.highlightedIndexPath.slice(0, -1), i]
      }
    }
  }

  return ctx.highlightedIndexPath
}
