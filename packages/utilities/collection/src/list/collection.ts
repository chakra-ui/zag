import { isEqual } from "@zag-js/utils/object"
import { typeahead } from "@zag-js/utils/search"
import type { CollectionItem, CollectionOptions, CollectionSearchOptions } from "../types"

const own = Object.prototype.hasOwnProperty
const has = (item: any, key: string) =>
  item != null && typeof item === "object" && !Array.isArray(item) && own.call(item, key)

const valueOf = (item: any): string => (typeof item === "string" ? item : has(item, "value") ? item.value : "")
const labelOf = (item: any): string =>
  typeof item === "string" ? item : has(item, "label") ? item.label : valueOf(item)
const disabledOf = (item: any): boolean => has(item, "disabled") && !!item.disabled

// Full linear passes allowed before building the lookup map
const MAP_SCAN_PASSES = 2

type Collection<T extends CollectionItem, Self> = [Self] extends [never] ? ListCollection<T> : Self

/** Derived data for one `items` array. */
interface ListCache<T> {
  source: T[]
  ordered?: T[]
  indexes?: Map<string, number>
  scanned: number
  text?: string
}

/** Pass `Self` (and override `createCollection`) to keep a subclass type through mutations. */
export class ListCollection<T extends CollectionItem = CollectionItem, Self = never> {
  /** The items in the collection. Treat as immutable. */
  items: T[]
  private cache: ListCache<T> | null = null

  constructor(protected options: CollectionOptions<T>) {
    this.items = [...options.items] as T[]
  }

  private getCache(): ListCache<T> {
    if (this.cache?.source !== this.items) this.cache = { source: this.items, scanned: 0 }
    return this.cache
  }

  /** Copy the collection, as the same subclass */
  copy(items?: T[]): Collection<T, Self> {
    return this.createCollection(items ?? this.items)
  }

  /** Creates the collection returned by `copy` and the mutation methods. */
  protected createCollection(items: T[]): Collection<T, Self> {
    return new ListCollection({ ...this.options, items }) as Collection<T, Self>
  }

  /** Check if the collection is equal to another collection */
  isEqual(other: ListCollection<T>): boolean {
    return isEqual(this.items, other.items)
  }

  /** Function to update the collection items */
  setItems(items: T[]): Collection<T, Self> {
    return this.copy(items)
  }

  /** Returns all the values in the collection */
  getValues(items: T[] = this.items): string[] {
    const values: string[] = []
    for (const item of items) {
      const value = this.getItemValue(item)
      if (value != null) values.push(value)
    }
    return values
  }

  /** Get the item based on its value */
  find(value: string | null | undefined): T | null {
    if (value == null) return null
    const index = this.indexOf(value)
    return index !== -1 ? this.at(index) : null
  }

  /** Get the items based on its values */
  findMany(values: string[]): T[] {
    const result: T[] = []
    for (const value of values) {
      const item = this.find(value)
      if (item != null) result.push(item)
    }
    return result
  }

  /** Get the item based on its index */
  at(index: number): T | null {
    return this.getOrderedItems()[index] ?? null
  }

  private isGrouped(): boolean {
    return !!(this.options.groupBy || this.options.groupSort)
  }

  protected getOrderedItems(): T[] {
    if (!this.isGrouped()) return this.items
    const cache = this.getCache()
    return (cache.ordered ??= this.group().flatMap(([, items]) => items))
  }

  /** Sort the values based on their index */
  sort(values: string[]): string[] {
    return [...values].sort((a, b) => this.indexOf(a) - this.indexOf(b))
  }

  /** Convert an item to a value */
  getItemValue(item: T | null | undefined): string | null {
    if (item == null) return null
    return this.options.itemToValue?.(item) ?? valueOf(item)
  }

  /** Whether an item is disabled */
  getItemDisabled(item: T | null): boolean {
    if (item == null) return false
    return this.options.isItemDisabled?.(item) ?? disabledOf(item)
  }

  /** Convert an item to a string */
  stringifyItem(item: T | null): string | null {
    if (item == null) return null
    return this.options.itemToString?.(item) ?? labelOf(item)
  }

  /** Convert a value to a string */
  stringify(value: string | null): string | null {
    if (value == null) return null
    return this.stringifyItem(this.find(value))
  }

  /** Convert an array of items to a string */
  stringifyItems(items: T[], separator = ", "): string {
    const strs: string[] = []
    for (const item of items) {
      const str = this.stringifyItem(item)
      if (str != null) strs.push(str)
    }
    return strs.join(separator)
  }

  /** Convert an array of items to a string */
  stringifyMany(value: string[], separator?: string): string {
    return this.stringifyItems(this.findMany(value), separator)
  }

  /** Whether the collection has a value */
  has(value: string | null): boolean {
    return this.indexOf(value) !== -1
  }

  /** Whether the collection has an item */
  hasItem(item: T | null): boolean {
    if (item == null) return false
    return this.has(this.getItemValue(item))
  }

  /** Returns the number of items in the collection */
  get size(): number {
    return this.items.length
  }

  /**
   * Group items by the groupBy function provided in options
   * Returns an array of [groupKey, items] tuples
   */
  group(): [string, T[]][] {
    const { groupBy, groupSort } = this.options
    if (!groupBy) return [["", [...this.items]]]

    const groups = new Map<string, T[]>()
    this.items.forEach((item, index) => {
      const key = groupBy(item, index)
      const group = groups.get(key)
      if (group) group.push(item)
      else groups.set(key, [item])
    })

    const entries = Array.from(groups)
    if (groupSort) entries.sort(([a], [b]) => compareGroups(groupSort, a, b))
    return entries
  }

  /** Returns the first value in the collection */
  get firstValue(): string | null {
    let index = 0
    while (this.getItemDisabled(this.at(index))) index++
    return this.getItemValue(this.at(index))
  }

  /** Returns the last value in the collection */
  get lastValue(): string | null {
    let index = this.size - 1
    while (this.getItemDisabled(this.at(index))) index--
    return this.getItemValue(this.at(index))
  }

  /** Returns the next value in the collection. Passing `null` returns `null`. */
  getNextValue(value: string | null, step = 1, clamp = false): string | null {
    let index = this.indexOf(value)
    if (index === -1) return null
    index = clamp ? Math.min(index + step, this.size - 1) : index + step
    while (index <= this.size && this.getItemDisabled(this.at(index))) index++
    return this.getItemValue(this.at(index))
  }

  /** Returns the previous value in the collection. Passing `null` returns `null`. */
  getPreviousValue(value: string | null, step = 1, clamp = false): string | null {
    let index = this.indexOf(value)
    if (index === -1) return null
    index = clamp ? Math.max(index - step, 0) : index - step
    while (index >= 0 && this.getItemDisabled(this.at(index))) index--
    return this.getItemValue(this.at(index))
  }

  /** Returns the values of the enabled items */
  getEnabledValues(): string[] {
    return this.getValues(this.items.filter((item) => !this.getItemDisabled(item)))
  }

  /** Returns keyboard navigation over the enabled items, with extra values before and after them */
  navigate(options: ListNavigateOptions = {}): ListNavigation {
    const { before = [], after = [] } = options
    const firstValue = this.firstValue
    const lastValue = this.lastValue
    const first = before[0] ?? firstValue ?? after[0] ?? null
    const last = after[after.length - 1] ?? lastValue ?? before[before.length - 1] ?? null

    const step = (value: string, dir: 1 | -1): string | null => {
      const head = dir === 1 ? before : [...after].reverse()
      const tail = dir === 1 ? after : [...before].reverse()
      const i = head.indexOf(value)
      if (i !== -1) return head[i + 1] ?? (dir === 1 ? firstValue : lastValue) ?? tail[0] ?? null
      const j = tail.indexOf(value)
      if (j !== -1) return tail[j + 1] ?? null
      const next = dir === 1 ? this.getNextValue(value) : this.getPreviousValue(value)
      return next ?? tail[0] ?? null
    }

    return {
      first,
      last,
      has: (value) => value != null && (before.includes(value) || after.includes(value) || this.has(value)),
      next: (value, loop = false) => (value == null ? first : (step(value, 1) ?? (loop ? first : null))),
      prev: (value, loop = false) => (value == null ? last : (step(value, -1) ?? (loop ? last : null))),
    }
  }

  /** Get the index of an item based on its key. */
  indexOf(value: string | null): number {
    if (value == null) return -1
    const cache = this.getCache()

    // Short-lived collections (filtered per keystroke) scan instead of building the map
    if (!cache.indexes && !this.isGrouped() && cache.scanned < this.items.length * MAP_SCAN_PASSES) {
      const index = this.getItemIndex(value)
      cache.scanned += index === -1 ? this.items.length : index + 1
      return index
    }

    if (!cache.indexes) {
      const indexes = new Map<string, number>()
      this.getOrderedItems().forEach((item, index) => {
        const itemValue = this.getItemValue(item)
        if (itemValue != null && !indexes.has(itemValue)) indexes.set(itemValue, index)
      })
      cache.indexes = indexes
    }

    return cache.indexes.get(value) ?? -1
  }

  private getItemIndex(value: string): number {
    return this.items.findIndex((item) => this.getItemValue(item) === value)
  }

  /** Search for a value based on a query */
  search(queryString: string, options: CollectionSearchOptions): string | null {
    const { state, currentValue, timeout } = options
    const item = typeahead({
      state,
      key: queryString,
      items: this.getOrderedItems(),
      activeIndex: currentValue != null ? this.indexOf(currentValue) : -1,
      timeout,
      itemToString: (item) => this.stringifyItem(item) ?? "",
      isItemDisabled: (item) => this.getItemDisabled(item),
    })
    return this.getItemValue(item)
  }

  [Symbol.iterator](): Iterator<T> {
    return this.items[Symbol.iterator]()
  }

  /** Update an item in the collection */
  update(value: string, item: T): Collection<T, Self> {
    const index = this.getItemIndex(value)
    if (index === -1) return this.unchanged()
    return this.copy(splice(this.items, index, 1, item))
  }

  /** Update an item in the collection if it exists, otherwise append it */
  upsert(value: string, item: T, mode: "append" | "prepend" = "append"): Collection<T, Self> {
    const index = this.getItemIndex(value)
    if (index !== -1) return this.copy(splice(this.items, index, 1, item))
    return mode === "append" ? this.append(item) : this.prepend(item)
  }

  /** Insert items at a specific index */
  insert(index: number, ...items: T[]): Collection<T, Self> {
    return this.copy(splice(this.items, index, 0, ...items))
  }

  /** Insert items before a specific value */
  insertBefore(value: string, ...items: T[]): Collection<T, Self> {
    return this.insertAt(value, 0, items)
  }

  /** Insert items after a specific value */
  insertAfter(value: string, ...items: T[]): Collection<T, Self> {
    return this.insertAt(value, 1, items)
  }

  private insertAt(value: string, offset: number, items: T[]): Collection<T, Self> {
    const index = this.getItemIndex(value)
    if (index !== -1) return this.insert(index + offset, ...items)
    return this.items.length === 0 ? this.insert(0, ...items) : this.unchanged()
  }

  /** Prepend items to the collection */
  prepend(...items: T[]): Collection<T, Self> {
    return this.insert(0, ...items)
  }

  /** Append items to the collection */
  append(...items: T[]): Collection<T, Self> {
    return this.insert(this.items.length, ...items)
  }

  /** Filter the collection */
  filter(fn: (itemString: string, index: number, item: T) => boolean): Collection<T, Self> {
    return this.copy(this.items.filter((item, index) => fn(this.stringifyItem(item)!, index, item)))
  }

  /** Remove items from the collection */
  remove(...itemsOrValues: Array<T | string>): Collection<T, Self> {
    const values = new Set(itemsOrValues.map((v) => (typeof v === "string" ? v : this.getItemValue(v))))
    return this.copy(
      this.items.filter((item) => {
        const value = this.getItemValue(item)
        return value != null && !values.has(value)
      }),
    )
  }

  /** Move an item to a specific index in `items` (source order) */
  move(value: string, toIndex: number): Collection<T, Self> {
    const fromIndex = this.getItemIndex(value)
    if (fromIndex === -1) return this.unchanged()
    return this.copy(move(this.items, [fromIndex], toIndex))
  }

  /** Move items before a specific value */
  moveBefore(value: string, ...values: string[]): Collection<T, Self> {
    return this.moveTo(value, 0, values)
  }

  /** Move items after a specific value */
  moveAfter(value: string, ...values: string[]): Collection<T, Self> {
    return this.moveTo(value, 1, values)
  }

  private moveTo(value: string, offset: number, values: string[]): Collection<T, Self> {
    // One pass for the target and every moved value, keeping the first match of each
    const wanted = new Set([value, ...values])
    const found = new Map<string, number>()
    for (let index = 0; index < this.items.length && found.size < wanted.size; index++) {
      const itemValue = this.getItemValue(this.items[index])
      if (itemValue != null && wanted.has(itemValue) && !found.has(itemValue)) found.set(itemValue, index)
    }
    const toIndex = found.get(value)
    if (toIndex == null) return this.unchanged()
    const indexes = values.flatMap((v) => found.get(v) ?? [])
    return this.copy(move(this.items, indexes, toIndex + offset))
  }

  /** Reorder items */
  reorder(fromIndex: number, toIndex: number): Collection<T, Self> {
    return this.copy(move(this.items, [fromIndex], toIndex))
  }

  private unchanged(): Collection<T, Self> {
    return this as unknown as Collection<T, Self>
  }

  /** Compare two values */
  compareValue(a: string, b: string): number {
    return Math.sign(this.indexOf(a) - this.indexOf(b))
  }

  /** Get the range of values between two values */
  getValueRange(from: string | null, to: string | null): string[] {
    if (!from || !to) return []
    let start = this.indexOf(from)
    let end = this.indexOf(to)
    if (start > end) [start, end] = [end, start]
    if (start === -1) return []

    // Matches the previous walk: the start is kept, disabled items are skipped, a disabled end yields []
    const values = [this.getItemValue(this.at(start))!]
    for (let index = start + 1; index <= end; index++) {
      const item = this.at(index)
      if (this.getItemDisabled(item)) {
        if (index === end) return []
        continue
      }
      values.push(this.getItemValue(item)!)
    }
    return values
  }

  /** Convert the collection to a string */
  toString(): string {
    const cache = this.getCache()
    if (cache.text == null) {
      let text = ""
      for (const item of this.items) {
        text += [this.getItemValue(item), this.stringifyItem(item), this.getItemDisabled(item)]
          .filter(Boolean)
          .join(":")
        text += ","
      }
      cache.text = text
    }
    return cache.text
  }

  /** Convert the collection to a JSON object */
  toJSON() {
    return {
      size: this.size,
      first: this.firstValue,
      last: this.lastValue,
    }
  }
}

function compareGroups(groupSort: NonNullable<CollectionOptions["groupSort"]>, a: string, b: string): number {
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
}

export function createListCollection<T extends CollectionItem = CollectionItem>(
  options: CollectionOptions<T>,
): ListCollection<T> {
  return new ListCollection(options)
}

export function isListCollection(v: unknown): v is ListCollection<any> {
  return v instanceof ListCollection
}

function splice<T>(items: T[], index: number, deleteCount: number, ...values: T[]): T[] {
  const result = items.slice()
  result.splice(index, deleteCount, ...values)
  return result
}

function move<T>(items: T[], indexes: number[], toIndex: number): T[] {
  const moving = new Set(indexes)
  const picked: T[] = []
  const rest: T[] = []
  items.forEach((item, index) => (moving.has(index) ? picked : rest).push(item))
  let target = toIndex
  for (const index of moving) if (index < toIndex) target--
  return splice(rest, Math.max(0, target), 0, ...picked)
}

export interface ListNavigateOptions {
  /** Values reached before the first item, such as a select-all option */
  before?: string[] | undefined
  /** Values reached after the last item, such as a create option */
  after?: string[] | undefined
}

export interface ListNavigation {
  first: string | null
  last: string | null
  has: (value: string | null) => boolean
  next: (value: string | null, loop?: boolean) => string | null
  prev: (value: string | null, loop?: boolean) => string | null
}
