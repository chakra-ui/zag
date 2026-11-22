import {
  type CollectionItem,
  type CollectionOptions,
  createListCollection,
  type ListCollection,
} from "@zag-js/collection"

export const collection = <T extends CollectionItem>(options: CollectionOptions<T>): ListCollection<T> => {
  return createListCollection<T>(options)
}
