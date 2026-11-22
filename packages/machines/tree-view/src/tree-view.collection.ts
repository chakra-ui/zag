import {
  type FilePathTreeNode,
  type TreeCollection,
  createTreeCollection,
  type TreeCollectionOptions,
  filePathToTree,
} from "@zag-js/collection"

export const collection = <T>(options: TreeCollectionOptions<T>): TreeCollection<T> => {
  return createTreeCollection(options)
}

collection.empty = (): TreeCollection => {
  return createTreeCollection({ rootNode: { children: [] } })
}

export function filePathCollection(paths: string[]): TreeCollection<FilePathTreeNode> {
  return filePathToTree(paths)
}
