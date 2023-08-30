import { Collection, type CollectionOptions } from "@zag-js/collection"
import { ref } from "@zag-js/core"

export const collection = (options: CollectionOptions) => {
  return ref(new Collection(options))
}
