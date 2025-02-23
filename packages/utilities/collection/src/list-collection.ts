import { hasProp, isEqual, isObject } from "@zag-js/utils"
import type { CollectionItem, CollectionMethods, CollectionOptions, CollectionSearchOptions } from "./types"

const fallback: CollectionMethods<any> = {
  itemToValue(item) {
    if (typeof item === "string") return item
    if (isObject(item) && hasProp(item, "value")) return item.value
    return ""
  },
  itemToString(item) {
    if (typeof item === "string") return item
    if (isObject(item) && hasProp(item, "label")) return item.label
    return fallback.itemToValue(item)
  },
  isItemDisabled(item) {
    if (isObject(item) && hasProp(item, "disabled")) return !!item.disabled
    return false
  },
}

export class ListCollection<T extends CollectionItem = CollectionItem> {
  /**
   * The items in the collection
   */
  items: T[]

  constructor(private options: CollectionOptions<T>) {
    this.items = [...options.items] as T[]
  }

  isEqual = (other: ListCollection<T>) => {
    return isEqual(this.items, other.items)
  }

  /**
   * Function to update the collection items
   */
  setItems = (items: T[] | readonly T[]) => {
    this.items = Array.from(items) as T[]
  }

  /**
   * Returns all the values in the collection
   */
  getValues = (items = this.items) => {
    return Array.from(items)
      .map((item) => this.getItemValue(item))
      .filter(Boolean) as string[]
  }

  /**
   * Get the item based on its value
   */
  find = (value: string | null | undefined): T | null => {
    if (value == null) return null
    const index = this.items.findIndex((item) => this.getItemValue(item) === value)
    return index != null ? this.items[index] : null
  }

  /**
   * Get the items based on its values
   */
  findMany = (values: string[]): T[] => {
    return Array.from(values)
      .map((value) => this.find(value)!)
      .filter(Boolean)
  }

  /**
   * Get the item based on its index
   */
  at = (index: number): T | null => {
    return this.items[index] ?? null
  }

  private sortFn = (valueA: string, valueB: string): number => {
    const indexA = this.indexOf(valueA)
    const indexB = this.indexOf(valueB)
    return (indexA ?? 0) - (indexB ?? 0)
  }

  /**
   * Sort the values based on their index
   */
  sort = (values: string[]): string[] => {
    return [...values].sort(this.sortFn.bind(this))
  }

  /**
   * Convert an item to a value
   */
  getItemValue = (item: T | null | undefined): string | null => {
    if (item == null) return null
    return this.options.itemToValue?.(item) ?? fallback.itemToValue(item)
  }

  /**
   * Whether an item is disabled
   */
  getItemDisabled = (item: T | null): boolean => {
    if (item == null) return false
    return this.options.isItemDisabled?.(item) ?? fallback.isItemDisabled(item)
  }

  /**
   * Convert an item to a string
   */
  stringifyItem = (item: T | null): string | null => {
    if (item == null) return null
    return this.options.itemToString?.(item) ?? fallback.itemToString(item)
  }

  /**
   * Convert a value to a string
   */
  stringify = (value: string | null): string | null => {
    if (value == null) return null
    return this.stringifyItem(this.find(value))
  }

  /**
   * Convert an array of items to a string
   */
  stringifyItems = (items: T[], separator = ", "): string => {
    return Array.from(items)
      .map((item) => this.stringifyItem(item))
      .filter(Boolean)
      .join(separator)
  }

  /**
   * Convert an array of items to a string
   */
  stringifyMany = (value: string[], separator?: string): string => {
    return this.stringifyItems(this.findMany(value), separator)
  }

  /**
   * Whether the collection has a value
   */
  has = (value: string | null): boolean => {
    return this.indexOf(value) !== -1
  }

  /**
   * Whether the collection has an item
   */
  hasItem = (item: T | null): boolean => {
    if (item == null) return false
    return this.has(this.getItemValue(item))
  }

  /**
   * Returns the number of items in the collection
   */
  get size(): number {
    return this.items.length
  }

  /**
   * Returns the first value in the collection
   */
  get firstValue(): string | null {
    let index = 0
    while (this.getItemDisabled(this.at(index))) index++
    return this.getItemValue(this.at(index))
  }

  /**
   * Returns the last value in the collection
   */
  get lastValue(): string | null {
    let index = this.size - 1
    while (this.getItemDisabled(this.at(index))) index--
    return this.getItemValue(this.at(index))
  }

  /**
   * Returns the next value in the collection
   */
  getNextValue = (value: string, step = 1, clamp = false): string | null => {
    let index = this.indexOf(value)
    if (index === -1) return null
    index = clamp ? Math.min(index + step, this.size - 1) : index + step
    while (index <= this.size && this.getItemDisabled(this.at(index))) index++
    return this.getItemValue(this.at(index))
  }

  /**
   * Returns the previous value in the collection
   */
  getPreviousValue = (value: string, step = 1, clamp = false): string | null => {
    let index = this.indexOf(value)
    if (index === -1) return null
    index = clamp ? Math.max(index - step, 0) : index - step
    while (index >= 0 && this.getItemDisabled(this.at(index))) index--
    return this.getItemValue(this.at(index))
  }

  /**
   * Get the index of an item based on its key
   */
  indexOf = (value: string | null): number => {
    if (value == null) return -1
    return this.items.findIndex((item) => this.getItemValue(item) === value)
  }

  private getByText = (text: string, current: string | null): T | undefined => {
    let items = current != null ? wrap(this.items, this.indexOf(current)) : this.items

    const isSingleKey = text.length === 1
    if (isSingleKey) items = items.filter((item) => this.getItemValue(item) !== current)

    return items.find((item) => match(this.stringifyItem(item), text))
  }

  /**
   * Search for a value based on a query
   */
  search = (queryString: string, options: CollectionSearchOptions): string | null => {
    const { state, currentValue, timeout = 350 } = options

    const search = state.keysSoFar + queryString
    const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0])

    const query = isRepeated ? search[0] : search

    const item = this.getByText(query, currentValue)
    const value = this.getItemValue(item)

    function cleanup() {
      clearTimeout(state.timer)
      state.timer = -1
    }

    function update(value: string) {
      state.keysSoFar = value
      cleanup()

      if (value !== "") {
        state.timer = +setTimeout(() => {
          update("")
          cleanup()
        }, timeout)
      }
    }

    update(search)

    return value
  };

  *[Symbol.iterator]() {
    yield* this.items
  }

  insertBefore = (value: string, item: T) => {
    const index = this.indexOf(value)
    if (index === -1) return
    this.items.splice(index, 0, item)
  }

  insertAfter = (value: string, item: T) => {
    const index = this.indexOf(value)
    if (index === -1) return
    this.items.splice(index + 1, 0, item)
  }

  reorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === -1 || toIndex === -1) return
    if (fromIndex === toIndex) return
    const [removed] = this.items.splice(fromIndex, 1)
    this.items.splice(toIndex, 0, removed)
  }

  toJSON = () => {
    return {
      size: this.size,
      first: this.firstValue,
      last: this.lastValue,
    }
  }
}

const match = (label: string | null, query: string) => {
  return !!label?.toLowerCase().startsWith(query.toLowerCase())
}

const wrap = <T>(v: T[] | readonly T[], idx: number) => {
  return v.map((_, index) => v[(Math.max(idx, 0) + index) % v.length])
}
