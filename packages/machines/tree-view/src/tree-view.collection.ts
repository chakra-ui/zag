import { type FilePathTreeNode, TreeCollection, type TreeCollectionOptions, filePathToTree } from "@zag-js/collection"

export const collection = <T>(options: TreeCollectionOptions<T>): TreeCollection<T> => {
  return new TreeCollection(options)
}

collection.empty = (): TreeCollection => {
  return new TreeCollection({ rootNode: { children: [] } })
}

export function filePathCollection(paths: string[]): TreeCollection<FilePathTreeNode> {
  return filePathToTree(paths)
}
