import { getTreeIndex, type TreeCollection } from "./collection"
import { createTreeNode, withTreeRoot } from "./edit"
import { getTreeIndexPathAt } from "./query"
import type { IndexPath } from "../types"

/** Keep matching nodes and their ancestors without recursive calls. */
export function filterTree<T>(
  tree: TreeCollection<T>,
  predicate: (node: T, indexPath: IndexPath) => boolean,
): TreeCollection<T> {
  const data = getTreeIndex(tree)
  const kept = new Map<number, T>()
  for (let index = data.nodes.length - 1; index >= 0; index--) {
    const node = data.nodes[index]
    const children: T[] = []
    for (let child = index + 1; child < data.subtreeEnd[index]; child = data.subtreeEnd[child]) {
      if (kept.has(child)) children.push(kept.get(child)!)
    }
    const matches = predicate(node, getTreeIndexPathAt(tree, index))
    if (index !== 0 && !matches && children.length === 0) continue
    const result = createTreeNode(tree, node, children)
    kept.set(index, result)
  }
  return withTreeRoot(tree, kept.get(0)!)
}
