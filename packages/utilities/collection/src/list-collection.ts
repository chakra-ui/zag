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

  /**
   * Copy the collection
   */
  copy = (items?: T[]) => {
    return new ListCollection({ ...this.options, items: items ?? [...this.items] })
  }

  /**
   * Check if the collection is equal to another collection
   */
  isEqual = (other: ListCollection<T>) => {
    return isEqual(this.items, other.items)
  }

  /**
   * Function to update the collection items
   */
  setItems = (items: T[]) => {
    return this.copy(items)
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
    const index = this.indexOf(value)
    return index != null ? this.at(index) : null
  }

  /**
   * Get the items based on its values
   */
  findMany = (values: string[]): T[] => {
    return Array.from(values)
      .map((value) => this.find(value))
      .filter((item) => item != null)
  }

  /**
   * Get the item based on its index
   */
  at = (index: number): T | null => {
    // If no grouping is used, use the simple array access
    if (!this.options.groupBy && !this.options.groupSort) {
      return this.items[index] ?? null
    }

    // When grouping is used, get item based on grouped structure
    let idx = 0
    const groups = this.group()

    for (const [, items] of groups) {
      for (const item of items) {
        if (idx === index) return item
        idx++
      }
    }

    return null
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
   * Group items by the groupBy function provided in options
   * Returns an array of [groupKey, items] tuples
   */
  group = (): [string, T[]][] => {
    const { groupBy, groupSort } = this.options
    if (!groupBy) return [["", [...this.items]]]

    const groups = new Map<string, T[]>()

    this.items.forEach((item, index) => {
      const groupKey = groupBy(item, index)
      if (!groups.has(groupKey)) {
        groups.set(groupKey, [])
      }
      groups.get(groupKey)!.push(item)
    })

    let entries = Array.from(groups.entries())

    // Handle group sorting
    if (groupSort) {
      entries.sort(([a], [b]) => {
        if (typeof groupSort === "function") return groupSort(a, b)
        if (Array.isArray(groupSort)) {
          const indexA = groupSort.indexOf(a)
          const indexB = groupSort.indexOf(b)
          if (indexA === -1) return 1
          if (indexB === -1) return -1
          return indexA - indexB
        }
        if (groupSort === "asc") return a.localeCompare(b)
        if (groupSort === "desc") return b.localeCompare(a)
        return 0
      })
    }

    return entries
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

    // If no grouping is used, use the simple findIndex
    if (!this.options.groupBy && !this.options.groupSort) {
      return this.items.findIndex((item) => this.getItemValue(item) === value)
    }

    // When grouping is used, calculate index based on grouped structure
    let idx = 0
    const groups = this.group()

    for (const [, items] of groups) {
      for (const item of items) {
        if (this.getItemValue(item) === value) return idx
        idx++
      }
    }

    return -1
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

  /**
   * Update an item in the collection
   */
  update = (value: string, item: T) => {
    let index = this.indexOf(value)
    if (index === -1) return this
    return this.copy([...this.items.slice(0, index), item, ...this.items.slice(index + 1)])
  }

  /**
   * Update an item in the collection if it exists, otherwise append it
   */
  upsert = (value: string, item: T) => {
    let index = this.indexOf(value)
    if (index === -1) return this.append(item)
    return this.copy([...this.items.slice(0, index), item, ...this.items.slice(index + 1)])
  }

  /**
   * Insert items at a specific index
   */
  insert = (index: number, ...items: T[]) => {
    return this.copy(insert(this.items, index, ...items))
  }

  /**
   * Insert items before a specific value
   */
  insertBefore = (value: string, ...items: T[]) => {
    let toIndex = this.indexOf(value)
    if (toIndex === -1) {
      if (this.items.length === 0) toIndex = 0
      else return this
    }
    return this.copy(insert(this.items, toIndex, ...items))
  }

  /**
   * Insert items after a specific value
   */
  insertAfter = (value: string, ...items: T[]) => {
    let toIndex = this.indexOf(value)
    if (toIndex === -1) {
      if (this.items.length === 0) toIndex = 0
      else return this
    }
    return this.copy(insert(this.items, toIndex + 1, ...items))
  }

  /**
   * Prepend items to the collection
   */
  prepend = (...items: T[]) => {
    return this.copy(insert(this.items, 0, ...items))
  }

  /**
   * Append items to the collection
   */
  append = (...items: T[]) => {
    return this.copy(insert(this.items, this.items.length, ...items))
  }

  /**
   * Filter the collection
   */
  filter = (fn: (itemString: string, index: number, item: T) => boolean) => {
    const filteredItems = this.items.filter((item, index) => fn(this.stringifyItem(item)!, index, item))
    return this.copy(filteredItems)
  }

  /**
   * Remove items from the collection
   */
  remove = (...itemsOrValues: Array<T | string>) => {
    const values = itemsOrValues.map((itemOrValue) =>
      typeof itemOrValue === "string" ? itemOrValue : this.getItemValue(itemOrValue),
    )
    return this.copy(
      this.items.filter((item) => {
        const value = this.getItemValue(item)
        if (value == null) return false
        return !values.includes(value)
      }),
    )
  }

  /**
   * Move an item to a specific index
   */
  move = (value: string, toIndex: number) => {
    const fromIndex = this.indexOf(value)
    if (fromIndex === -1) return this
    return this.copy(move(this.items, [fromIndex], toIndex))
  }

  /**
   * Move items before a specific value
   */
  moveBefore = (value: string, ...values: string[]) => {
    let toIndex = this.items.findIndex((item) => this.getItemValue(item) === value)
    if (toIndex === -1) return this
    let indices = values
      .map((value) => this.items.findIndex((item) => this.getItemValue(item) === value))
      .sort((a, b) => a - b)
    return this.copy(move(this.items, indices, toIndex))
  }

  /**
   * Move items after a specific value
   */
  moveAfter = (value: string, ...values: string[]) => {
    let toIndex = this.items.findIndex((item) => this.getItemValue(item) === value)
    if (toIndex === -1) return this
    let indices = values
      .map((value) => this.items.findIndex((item) => this.getItemValue(item) === value))
      .sort((a, b) => a - b)
    return this.copy(move(this.items, indices, toIndex + 1))
  }

  /**
   * Reorder items
   */
  reorder = (fromIndex: number, toIndex: number) => {
    return this.copy(move(this.items, [fromIndex], toIndex))
  }

  /**
   * Compare two values
   */
  compareValue = (a: string, b: string) => {
    const indexA = this.indexOf(a)
    const indexB = this.indexOf(b)
    if (indexA < indexB) return -1
    if (indexA > indexB) return 1
    return 0
  }

  /**
   * Get the range of values between two values
   */
  private range = (from: string | null, to: string | null) => {
    let keys: string[] = []
    let key: string | null = from
    while (key != null) {
      let item = this.find(key)
      if (item) keys.push(key)
      if (key === to) return keys
      key = this.getNextValue(key)
    }
    return []
  }

  /**
   * Get the range of values between two values
   */
  getValueRange = (from: string | null, to: string | null) => {
    if (from && to) {
      if (this.compareValue(from, to) <= 0) {
        return this.range(from, to)
      }
      return this.range(to, from)
    }
    return []
  }

  /**
   * Convert the collection to a string
   */
  toString = () => {
    let result = ""
    for (const item of this.items) {
      const value = this.getItemValue(item)
      const label = this.stringifyItem(item)
      const disabled = this.getItemDisabled(item)
      const itemString = [value, label, disabled].filter(Boolean).join(":")
      result += itemString + ","
    }
    return result
  }

  /**
   * Convert the collection to a JSON object
   */
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

export function isListCollection(v: unknown): v is ListCollection<any> {
  return v instanceof ListCollection
}

function insert<T>(items: T[], index: number, ...values: T[]): T[] {
  return [...items.slice(0, index), ...values, ...items.slice(index)]
}

function move<T>(items: T[], indices: number[], toIndex: number): T[] {
  indices = [...indices].sort((a, b) => a - b)
  const itemsToMove = indices.map((i) => items[i])
  for (let i = indices.length - 1; i >= 0; i--) {
    items = [...items.slice(0, indices[i]), ...items.slice(indices[i] + 1)]
  }
  toIndex = Math.max(0, toIndex - indices.filter((i) => i < toIndex).length)
  return [...items.slice(0, toIndex), ...itemsToMove, ...items.slice(toIndex)]
}
