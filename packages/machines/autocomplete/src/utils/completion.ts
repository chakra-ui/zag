import type { CollectionItem, ListCollection } from "@zag-js/collection"

export interface Completion {
  value: string
  label: string
}

/** The first enabled item whose label starts with the text */
export function findCompletion<T extends CollectionItem>(
  collection: ListCollection<T>,
  text: string,
): Completion | null {
  if (!text) return null
  const query = text.toLocaleLowerCase()
  for (const item of collection.items) {
    if (collection.getItemDisabled(item)) continue
    const label = collection.stringifyItem(item)
    const value = collection.getItemValue(item)
    if (label && value != null && label.toLocaleLowerCase().startsWith(query)) return { value, label }
  }
  return null
}
