import { TreeCollection, type TreeCollectionOptions } from "@zag-js/collection"
import { ref } from "@zag-js/core"

export const collection = <T>(options: TreeCollectionOptions<T>): TreeCollection<T> => {
  return ref(new TreeCollection(options))
}

collection.empty = (): TreeCollection => {
  return ref(new TreeCollection({ rootNode: { children: [] } }))
}
