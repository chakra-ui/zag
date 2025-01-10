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
