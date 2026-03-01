import type { CollectionItem } from "./types"

export interface SelectionMapCollection<T extends CollectionItem = CollectionItem> {
  find: (value: string | null | undefined) => T | null
  getItemValue: (item: T | null | undefined) => string | null
}

export function resolveSelectedItems<T extends CollectionItem>({
  values,
  collection,
  selectedItemMap,
}: {
  values: string[]
  collection: SelectionMapCollection<T>
  selectedItemMap: Map<string, T>
}): T[] {
  const result: T[] = []
  for (const value of values) {
    const item = collection.find(value) ?? selectedItemMap.get(value)
    if (item != null) result.push(item)
  }
  return result
}

export function updateSelectedItemMap<T extends CollectionItem>({
  selectedItemMap,
  values,
  selectedItems,
  collection,
}: {
  selectedItemMap: Map<string, T>
  values: string[]
  selectedItems: T[]
  collection: SelectionMapCollection<T>
}): Map<string, T> {
  const nextMap = new Map(selectedItemMap)
  for (const item of selectedItems) {
    const value = collection.getItemValue(item)
    if (value != null) nextMap.set(value, item)
  }

  const allowedValues = new Set(values)
  for (const value of nextMap.keys()) {
    if (!allowedValues.has(value)) nextMap.delete(value)
  }

  return nextMap
}

export function deriveSelectionState<T extends CollectionItem>({
  values,
  collection,
  selectedItemMap,
}: {
  values: string[]
  collection: SelectionMapCollection<T>
  selectedItemMap: Map<string, T>
}) {
  const selectedItems = resolveSelectedItems({ values, collection, selectedItemMap })
  const nextSelectedItemMap = updateSelectedItemMap({
    selectedItemMap,
    values,
    selectedItems,
    collection,
  })

  return { selectedItems, nextSelectedItemMap }
}

export function createSelectedItemMap<T extends CollectionItem>({
  selectedItems,
  collection,
}: {
  selectedItems: T[]
  collection: SelectionMapCollection<T>
}): Map<string, T> {
  return updateSelectedItemMap({
    selectedItemMap: new Map(),
    values: selectedItems.map((item) => collection.getItemValue(item)!).filter(Boolean),
    selectedItems,
    collection,
  })
}
