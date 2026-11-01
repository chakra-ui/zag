import { COMPLETE, type StepItem } from "../steps.types"

export const findItem = (items: StepItem[], value: string | null): StepItem | null =>
  value == null || value === COMPLETE ? null : (items.find((item) => item.value === value) ?? null)

export const findItemIndex = (items: StepItem[], value: string | null): number => {
  if (value === COMPLETE) return items.length
  if (value == null) return -1
  return items.findIndex((item) => item.value === value)
}

export const getEffectiveItems = (items: StepItem[]): StepItem[] => items.filter((item) => !item.disabled)

export const isItemDisabled = (item: StepItem): boolean => item.disabled === true

export const isItemOptional = (item: StepItem): boolean => item.optional === true

export const isItemCompleted = (completedValues: string[], value: string): boolean => completedValues.includes(value)

export const isItemInvalid = (item: StepItem): boolean => item.invalid === true

export const getFirstNavigableValue = (items: StepItem[]): string | null =>
  items.find((item) => !isItemDisabled(item))?.value ?? null

export const findEffectiveIndex = (items: StepItem[], value: string | null): number => {
  if (value == null) return -1
  if (value === COMPLETE) return getEffectiveItems(items).length
  let index = 0
  for (const item of items) {
    if (isItemDisabled(item)) continue
    if (item.value === value) return index
    index++
  }
  return -1
}

export const hashItems = (items: StepItem[]): string =>
  items
    .map((item) => `${item.value}:${item.disabled ? 1 : 0}${item.editable === false ? 1 : 0}${item.optional ? 1 : 0}`)
    .join("|")

export function validateItems(items: StepItem[]): void {
  const seen = new Set<string>()
  for (const item of items) {
    if (item.value === COMPLETE) {
      throw new Error(`[zag-js/steps] item value "${COMPLETE}" is reserved for the completed state`)
    }
    if (seen.has(item.value)) {
      throw new Error(`[zag-js/steps] duplicate item value: "${item.value}"`)
    }
    seen.add(item.value)
  }
}
