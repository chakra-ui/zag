import {
  GridCollection,
  ListCollection,
  type CollectionItem,
  type CollectionOptions,
  type GridCollectionOptions,
} from "@zag-js/collection"

export const collection = <T extends CollectionItem>(options: CollectionOptions<T>): ListCollection<T> => {
  return new ListCollection<T>(options)
}

collection.empty = (): ListCollection<CollectionItem> => {
  return new ListCollection<CollectionItem>({ items: [] })
}

export const gridCollection = <T extends CollectionItem>(options: GridCollectionOptions<T>): GridCollection<T> => {
  return new GridCollection<T>(options)
}

gridCollection.empty = (): GridCollection<CollectionItem> => {
  return new GridCollection<CollectionItem>({ items: [], columnCount: 0 })
}
