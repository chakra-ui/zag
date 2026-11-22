import {
  type CollectionItem,
  type CollectionOptions,
  type GridCollectionOptions,
  createGridCollection,
  createListCollection,
  type GridCollection,
  type ListCollection,
} from "@zag-js/collection"

export const collection = <T extends CollectionItem>(options: CollectionOptions<T>): ListCollection<T> => {
  return createListCollection<T>(options)
}

collection.empty = (): ListCollection<CollectionItem> => {
  return createListCollection<CollectionItem>({ items: [] })
}

export const gridCollection = <T extends CollectionItem>(options: GridCollectionOptions<T>): GridCollection<T> => {
  return createGridCollection<T>(options)
}

gridCollection.empty = (): GridCollection<CollectionItem> => {
  return createGridCollection<CollectionItem>({ items: [], columnCount: 0 })
}
