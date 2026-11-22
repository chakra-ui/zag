import type { CollectionItem, ListCollection } from "@zag-js/collection"

export const SELECT_ALL_VALUE = "@@select-all"

type Collection = ListCollection<CollectionItem>

export function getSelectAllState(collection: Collection, value: string[]) {
  const enabled = collection.getEnabledValues()
  const count = enabled.filter((v) => value.includes(v)).length
  const checked = enabled.length > 0 && count === enabled.length
  return { enabled, checked, indeterminate: count > 0 && !checked }
}

export function selectAllValues(collection: Collection, value: string[]) {
  return [...value, ...collection.getEnabledValues().filter((v) => !value.includes(v))]
}

export function toggleSelectAll(collection: Collection, value: string[]) {
  const { enabled, checked } = getSelectAllState(collection, value)
  return checked ? value.filter((v) => !enabled.includes(v)) : selectAllValues(collection, value)
}
