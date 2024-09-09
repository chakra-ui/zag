import { ListCollection, type CollectionItem, type CollectionOptions } from "@zag-js/collection"
import { ref } from "@zag-js/core"

export const collection = <T extends CollectionItem>(options: CollectionOptions<T>): ListCollection<T> => {
  return ref(new ListCollection(options))
}

collection.empty = (): ListCollection<CollectionItem> => {
  return ref(new ListCollection<CollectionItem>({ items: [] }))
}
