import { getTreeCheckedStates, type TreeCheckedState, type TreeCollection, type TreeNode } from "@zag-js/collection"
import { createVisibleTreeCache } from "./visible-tree"

const sameValues = (previous: readonly string[], next: readonly string[]) =>
  previous.length === next.length && next.every((value, index) => value === previous[index])

function createMembershipCache() {
  let previous: string[] = []
  let values = new Set<string>()
  return (next: readonly string[]) => {
    if (!sameValues(previous, next)) {
      previous = Array.from(next)
      values = new Set(next)
    }
    return values
  }
}

/** Each derived value has its own inputs; moving focus invalidates none of them. */
export function createTreeState<T extends TreeNode = TreeNode>() {
  let checkedTree: TreeCollection<T> | undefined
  let checkedValues: string[] = []
  let checkedStates = new Map<string, TreeCheckedState>()

  return {
    visible: createVisibleTreeCache<T>(),
    expanded: createMembershipCache(),
    selected: createMembershipCache(),
    checked(tree: TreeCollection<T>, values: readonly string[]) {
      if (tree !== checkedTree || !sameValues(checkedValues, values)) {
        checkedStates = getTreeCheckedStates(tree, values)
        checkedValues = Array.from(values)
        checkedTree = tree
      }
      return checkedStates
    },
  }
}
