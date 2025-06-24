import type { TreeCollection, TreeNode } from "@zag-js/collection"
import { add, remove, uniq } from "@zag-js/utils"
import type { CheckedValueMap } from "../tree-view.types"

export function getCheckedState(collection: TreeCollection, node: TreeNode, checkedValue: string[]) {
  const value = collection.getNodeValue(node)
  if (!collection.isBranchNode(node)) {
    return checkedValue.includes(value)
  }

  const childValues = collection.getDescendantValues(value)
  const allChecked = childValues.every((v) => checkedValue.includes(v))
  const someChecked = childValues.some((v) => checkedValue.includes(v))
  return allChecked ? true : someChecked ? "indeterminate" : false
}

export function toggleBranchChecked(collection: TreeCollection, value: string, checkedValue: string[]) {
  const childValues = collection.getDescendantValues(value)
  const allChecked = childValues.every((child) => checkedValue.includes(child))
  return uniq(allChecked ? remove(checkedValue, ...childValues) : add(checkedValue, ...childValues))
}

export function getCheckedValueMap(collection: TreeCollection, checkedValue: string[]) {
  const map: CheckedValueMap = new Map()

  collection.visit({
    onEnter: (node) => {
      const value = collection.getNodeValue(node)
      const isBranch = collection.isBranchNode(node)
      const checked = getCheckedState(collection, node, checkedValue)

      map.set(value, {
        type: isBranch ? "branch" : "leaf",
        checked,
      })
    },
  })

  return map
}
