import { ListCollection, type CollectionItem, type CollectionOptions } from "@zag-js/collection"

export const collection = <T extends CollectionItem>(options: CollectionOptions<T>): ListCollection<T> => {
  return new ListCollection(options)
}

collection.empty = (): ListCollection<CollectionItem> => {
  return new ListCollection<CollectionItem>({ items: [] })
}
