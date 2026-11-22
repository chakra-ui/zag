import { getTreeIndex, type TreeCollection } from "./collection"
import { isTreeBranchNode } from "./query"
import type { TreeNode } from "../types"

export type TreeCheckedState = boolean | "indeterminate"

/** Aggregate leaf counts toward parents in reverse preorder, without recursion. */
export function getTreeCheckedStates<T = TreeNode>(
  tree: TreeCollection<T>,
  checkedValue: Iterable<string>,
): Map<string, TreeCheckedState> {
  const data = getTreeIndex(tree)
  const checked = new Set(checkedValue)
  const states = new Map<string, TreeCheckedState>()
  const total = new Array<number>(data.nodes.length).fill(0)
  const on = new Array<number>(data.nodes.length).fill(0)
  for (let index = data.nodes.length - 1; index > 0; index--) {
    if (data.subtreeEnd[index] === index + 1 && tree.getNodeChildrenCount(data.nodes[index]) == null) {
      total[index] = 1
      on[index] = checked.has(data.values[index]) ? 1 : 0
    }
    states.set(data.values[index], on[index] === 0 ? false : on[index] === total[index] ? true : "indeterminate")
    const parent = data.parent[index]
    total[parent] += total[index]
    on[parent] += on[index]
  }
  return states
}

/** A toggle visits only the target subtree. Public checked values contain leaves. */
export function toggleTreeChecked<T = TreeNode>(
  tree: TreeCollection<T>,
  checkedValue: string[],
  value: string,
): string[] {
  const data = getTreeIndex(tree)
  const checked = new Set(checkedValue)
  const index = data.byValue.get(value)
  if (index == null || !isTreeBranchNode(tree, data.nodes[index])) {
    if (checked.has(value)) checked.delete(value)
    else checked.add(value)
    return [...checked]
  }
  const leaves: string[] = []
  for (let child = index + 1; child < data.subtreeEnd[index]; child++) {
    if (data.subtreeEnd[child] === child + 1 && tree.getNodeChildrenCount(data.nodes[child]) == null)
      leaves.push(data.values[child])
  }
  const allChecked = leaves.length > 0 && leaves.every((leaf) => checked.has(leaf))
  for (const leaf of leaves) {
    if (allChecked) checked.delete(leaf)
    else checked.add(leaf)
  }
  return [...checked]
}
