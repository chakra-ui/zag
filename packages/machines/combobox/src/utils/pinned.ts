import type { CollectionItem, ListCollection } from "@zag-js/collection"
import { SELECT_ALL_VALUE } from "./select-all"

export const CREATE_VALUE = "@@create"

export const isPinnedValue = (value: string | null | undefined) => value === SELECT_ALL_VALUE || value === CREATE_VALUE

/** Whether `text` is an item's label, ignoring case */
export function isItemLabel(collection: ListCollection<CollectionItem>, text: string) {
  const needle = text.toLocaleLowerCase()
  return collection.items.some((item) => collection.stringifyItem(item)?.toLocaleLowerCase() === needle)
}
