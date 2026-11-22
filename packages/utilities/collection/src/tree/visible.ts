import { getTreeIndex, type TreeCollection } from "./collection"
import { getTreeIndexPathAt } from "./query"
import type { IndexPath } from "../types"

/** Visit only visible ordinals. Defer paths until a caller uses them. */
export function getVisibleTreeNodes<T>(
  tree: TreeCollection<T>,
  expandedValue: Iterable<string>,
): { node: T; indexPath: IndexPath }[] {
  const { nodes, values, subtreeEnd } = getTreeIndex(tree)
  const expanded = new Set(expandedValue)
  const rows: { node: T; indexPath: IndexPath }[] = []

  for (let index = 1; index < nodes.length; index = expanded.has(values[index]) ? index + 1 : subtreeEnd[index]) {
    const ordinal = index
    let path: IndexPath | undefined
    rows.push({
      node: nodes[ordinal],
      get indexPath() {
        return (path ??= getTreeIndexPathAt(tree, ordinal))
      },
    })
  }
  return rows
}
