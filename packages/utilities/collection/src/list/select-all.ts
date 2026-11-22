import type { ListCollection } from "./collection"

export interface SelectAllCoverage {
  enabled: string[]
  checked: boolean
  indeterminate: boolean
}

/** Whether the selection covers every enabled item, some, or none. */
export function getSelectAllCoverage(collection: ListCollection<any>, value: string[]): SelectAllCoverage {
  const enabled = collection.getEnabledValues()
  const selected = new Set(value)
  let count = 0
  for (const v of enabled) if (selected.has(v)) count++
  const checked = enabled.length > 0 && count === enabled.length
  return { enabled, checked, indeterminate: count > 0 && !checked }
}

/** Adds every enabled item to the selection, keeping its order. */
export function selectAllValues(collection: ListCollection<any>, value: string[]): string[] {
  const selected = new Set(value)
  return [...value, ...collection.getEnabledValues().filter((v) => !selected.has(v))]
}

/** Deselects every enabled item when all are selected, otherwise selects them all. */
export function toggleSelectAll(collection: ListCollection<any>, value: string[]): string[] {
  const { enabled, checked } = getSelectAllCoverage(collection, value)
  if (!checked) return selectAllValues(collection, value)
  const enabledSet = new Set(enabled)
  return value.filter((v) => !enabledSet.has(v))
}
