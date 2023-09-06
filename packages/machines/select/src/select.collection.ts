import { Collection, type CollectionItem, type CollectionOptions } from "@zag-js/collection"
import { ref } from "@zag-js/core"

export const collection = <T extends CollectionItem>(options: CollectionOptions<T>): Collection<T> => {
  return ref(new Collection(options))
}

collection.empty = (): Collection<CollectionItem> => {
  return ref(new Collection<CollectionItem>({ items: [] }))
}
