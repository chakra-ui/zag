import type { TreeNode, TreeSkipFn } from "@zag-js/collection"
import type { MachineContext } from "./tree-view.types"

export function skipFn(ctx: MachineContext): TreeSkipFn<any> {
  return function skip({ indexPath }) {
    const paths = ctx.collection.getValuePath(indexPath).slice(0, -1)
    return paths.some((value) => !ctx.expandedValue.includes(value))
  }
}

export function getVisibleNodes(ctx: MachineContext) {
  const nodes: { node: TreeNode; indexPath: number[] }[] = []
  ctx.collection.visit({
    skip: skipFn(ctx),
    onEnter: (node, indexPath) => {
      nodes.push({ node, indexPath })
    },
  })
  return nodes
}
