import { hash } from "./hash"
import type { CollectionItem, CollectionNode, CollectionOptions, CollectionSearchOptions } from "./types"

const isObject = (v: any): v is Record<string, any> => typeof v === "object" && v !== null && !Array.isArray(v)

const hasKey = <T>(obj: T, key: string): obj is T & Record<string, any> =>
  Object.prototype.hasOwnProperty.call(obj, key)

const fallback = {
  itemToValue(item: any) {
    if (typeof item === "string") return item
    if (isObject(item) && hasKey(item, "value")) return item.value
    return ""
  },
  itemToString(item: any) {
    if (typeof item === "string") return item
    if (isObject(item) && hasKey(item, "label")) return item.label
    return fallback.itemToValue(item)
  },
  itemToDisabled(item: any) {
    if (isObject(item) && hasKey(item, "disabled")) return !!item.disabled
    return false
  },
}

export class Collection<T extends CollectionItem = CollectionItem> {
  /**
   * The collection nodes
   */
  private nodes = new Map<string, CollectionNode<T>>()

  /**
   * The set of disabled values
   */
  private disabledValues = new Set<string>()

  /**
   * The first value in the collection (without accounting for disabled items)
   */
  private _firstValue: string | null = null

  /**
   * The last value in the collection (without accounting for disabled items)
   */
  private _lastValue: string | null = null

  private hash: string = ""

  constructor(private options: CollectionOptions<T>) {
    this.iterate()
  }

  isEqual = (other: Collection<T>) => {
    return this.hash === other.hash
  }

  /**
   * Iterate over the collection items and create a map of nodes
   */
  private iterate = (): Collection<T> => {
    const { items } = this.options

    const hashSet = new Set<string>()

    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      const value = this.itemToValue(item)
      const label = this.itemToString(item)
      const disabled = this.itemToDisabled(item)

      hashSet.add(value)

      const node: CollectionNode<T> = {
        // freeze item to prevent mutation by frameworks like Solid.js
        item: Object.freeze(item),
        index: i,
        label,
        value: value,
        previousValue: this.itemToValue(items[i - 1]) ?? null,
        nextValue: this.itemToValue(items[i + 1]) ?? null,
      }

      this.nodes.set(value, node)

      if (disabled) {
        this.disabledValues.add(value)
      }

      if (i === 0) {
        this._firstValue = value
      }

      if (i === items.length - 1) {
        this._lastValue = value
      }
    }

    this.hash = hash(Array.from(hashSet).join(""))

    return this
  }

  /**
   * Function to update the collection items
   */
  setItems = (items: T[]) => {
    this.options.items = items
    return this.iterate()
  }

  /**
   * Get the item based on its value
   */
  item = (value: string | null): T | null => {
    if (value === null) return null
    return this.nodes.get(value)?.item ?? null
  }

  /**
   * Get the items based on its values
   */
  items = (values: string[]): T[] => {
    return values.map((value) => this.item(value)!).filter(Boolean)
  }

  /**
   * Get the item based on its index
   */
  at = (index: number): T | null => {
    for (const node of this.nodes.values()) {
      if (node.index === index) {
        return node.item
      }
    }
    return null
  }

  private sortFn = (valueA: string, valueB: string): number => {
    const nodeA = this.nodes.get(valueA)
    const nodeB = this.nodes.get(valueB)
    return (nodeA?.index ?? 0) - (nodeB?.index ?? 0)
  }

  /**
   * Sort the values based on their index
   */
  sort = (values: string[]): string[] => {
    return values.sort(this.sortFn)
  }

  /**
   * Convert an item to a value
   */
  itemToValue = (item: T): string => {
    if (!item) return ""
    return this.options.itemToValue?.(item) ?? fallback.itemToValue(item)
  }

  /**
   * Convert an item to a string
   */
  itemToString = (item: T | null): string => {
    if (!item) return ""
    return this.options.itemToString?.(item) ?? fallback.itemToString(item)
  }

  /**
   * Whether an item is disabled
   */
  itemToDisabled = (item: T | null): boolean => {
    if (!item) return false
    return this.options.isItemDisabled?.(item) ?? fallback.itemToDisabled(item)
  }

  /**
   * Convert a value to a string
   */
  valueToString = (value: string | null): string => {
    if (value == null) return ""
    return this.nodes.get(value)?.label ?? ""
  }

  /**
   * Convert an array of items to a string
   */
  itemsToString = (item: T[], separator = ", "): string => {
    return item
      .map((item) => this.itemToString(item))
      .filter(Boolean)
      .join(separator)
  }

  /**
   * Whether the collection has a value
   */
  has = (value: string | null): boolean => {
    if (value == null) return false
    return this.nodes.has(value)
  }

  /**
   * Returns the number of items in the collection
   */
  count = (): number => {
    return this.nodes.size
  }

  /**
   * Returns the first value in the collection
   */
  first = (): string | null => {
    let firstValue = this._firstValue
    while (firstValue != null) {
      let item = this.nodes.get(firstValue)
      if (item != null && !this.disabledValues.has(item.value)) {
        return firstValue
      }
      firstValue = item?.nextValue ?? null
    }
    return null
  }

  /**
   * Returns the last value in the collection
   */
  last = (): string | null => {
    let lastValue = this._lastValue
    while (lastValue != null) {
      let item = this.nodes.get(lastValue)
      if (item != null && !this.disabledValues.has(item.value)) {
        return lastValue
      }
      lastValue = item?.previousValue ?? null
    }
    return null
  }

  /**
   * Returns the next value in the collection
   */
  next = (value: string | null): string | null => {
    if (value == null) return null

    const item = this.nodes.get(value)
    let nextValue = item?.nextValue ?? null

    while (nextValue != null) {
      let item = this.nodes.get(nextValue)
      if (item != null && !this.disabledValues.has(item.value)) {
        return nextValue
      }
      nextValue = item?.nextValue ?? null
    }
    return null
  }

  /**
   * Returns the previous value in the collection
   */
  prev = (value: string | null): string | null => {
    if (value == null) return null

    const item = this.nodes.get(value)
    let previousValue = item?.previousValue ?? null

    while (previousValue != null) {
      let item = this.nodes.get(previousValue)
      if (item != null && !this.disabledValues.has(item.value)) {
        return previousValue
      }
      previousValue = item?.previousValue ?? null
    }
    return null
  }

  /**
   * Whether an item is disabled
   */
  isItemDisabled = (item: T): boolean => {
    return this.disabledValues.has(this.itemToValue(item))
  }

  /**
   * Returns the array of collection nodes
   */
  toArray = (): CollectionNode<T>[] => {
    return Array.from(this.nodes.values())
  }

  /**
   * Get the index of an item based on its key
   */
  indexOf = (value: string | null): number => {
    if (value == null) return -1
    return this.nodes.get(value)?.index ?? -1
  }

  private getByText = (text: string, currentValue: string | null): CollectionNode<T> | undefined => {
    const index = this.indexOf(currentValue)
    let nodes = currentValue != null ? wrap(this.toArray(), index) : this.toArray()

    const isSingleKey = text.length === 1

    if (isSingleKey) {
      nodes = nodes.filter((node) => node.value !== currentValue)
    }

    return nodes.find((node) => match(node.label, text))
  }

  /**
   * Search for a value based on a query
   */
  search = (queryString: string, options: CollectionSearchOptions): string | null => {
    const { state, currentValue, timeout = 350 } = options

    const search = state.keysSoFar + queryString
    const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0])

    const query = isRepeated ? search[0] : search

    const value = this.getByText(query, currentValue)?.value ?? null

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
  }

  toJSON = () => {
    return {
      size: this.count(),
      first: this.first(),
      last: this.last(),
    }
  }
}

const match = (label: string, query: string) => {
  return label.toLowerCase().startsWith(query.toLowerCase())
}

const wrap = <T>(v: T[], idx: number) => {
  return v.map((_, index) => v[(Math.max(idx, 0) + index) % v.length])
}
