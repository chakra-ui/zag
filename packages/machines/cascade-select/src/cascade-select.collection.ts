import {
  type TreeCollection,
  createTreeCollection,
  type TreeNode,
  type TreeCollectionOptions,
} from "@zag-js/collection"

export type { TreeNode }

export const collection = <T extends TreeNode = TreeNode>(options: TreeCollectionOptions<T>): TreeCollection<T> => {
  return createTreeCollection(options)
}

collection.empty = <T extends TreeNode = TreeNode>(): TreeCollection<T> => {
  return createTreeCollection({
    rootNode: { value: "ROOT", children: [] } as T,
  })
}
