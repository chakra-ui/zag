import { TreeCollection, type TreeNode, type TreeCollectionOptions } from "@zag-js/collection"

export type { TreeNode }

export const collection = <T extends TreeNode = TreeNode>(options: TreeCollectionOptions<T>): TreeCollection<T> => {
  return new TreeCollection(options)
}

collection.empty = <T extends TreeNode = TreeNode>(): TreeCollection<T> => {
  return new TreeCollection({
    rootNode: { value: "ROOT", children: [] } as T,
  })
}
