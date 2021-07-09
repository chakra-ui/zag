export type MaybeArray<T> = T | T[]

export function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

export class ArrayUtil<T> {
  value: T[]

  // static method to convert value to array instance
  static from<T>(value: T | T[]) {
    const result = toArray(value)
    return new ArrayUtil(result)
  }

  constructor(array: T[]) {
    this.value = array
  }

  // Get the length of the array
  get length() {
    return this.value.length
  }

  // Get the first item in the array
  get first(): T {
    return this.value[0]
  }

  // Get the last item in the array
  get last(): T {
    return this.value[this.length - 1]
  }

  // Check if the array instance is empty
  get isEmpty(): boolean {
    return this.length === 0
  }

  // get an item at index
  itemAt(index: number) {
    return this.value[index]
  }

  // Update the array
  set(array: T[]) {
    this.value = array
    return this
  }

  // Add an item to the end of the array
  push(...items: T[]) {
    this.value.push(...items)
    return this
  }

  // remove item from array at index
  removeAt(index: number) {
    const arr = [...this.value]
    if (index > -1) {
      arr.splice(index, 1)
    }
    return this
  }

  // remove an item from the array
  remove(item: T) {
    const index = this.value.indexOf(item)
    return this.removeAt(index)
  }

  // clone instance
  clone(): ArrayUtil<T> {
    return new ArrayUtil([...this.value])
  }

  // Faster version `Array.prototype.find`
  find(fn: (value: T, key: number, arr: T[]) => boolean): T | undefined {
    for (let i = 0, len = this.length; i < len; ++i) {
      if (fn(this.value[i], i, this.value)) {
        return this.value[i]
      }
    }
  }

  // Faster version `Array.prototype.filter`
  filter(fn: (value: T, key: number, arr: T[]) => boolean) {
    const filteredArr = []

    for (let i = 0, len = this.length; i < len; ++i) {
      const value = this.value[i]

      if (fn(value, i, this.value)) {
        filteredArr.push(value)
      }
    }

    return this.set(filteredArr)
  }

  // Given an index, get the next index in the array
  nextIndex(index: number, step = 1, loop = true): number {
    const nextIndex = index + step

    const length = this.value.length
    const lastIndex = length - 1

    if (index === -1) {
      return step > 0 ? 0 : lastIndex
    }

    if (nextIndex < 0) {
      return loop ? lastIndex : 0
    }

    if (nextIndex >= length) {
      return loop ? 0 : index > length ? length : index
    }

    return nextIndex
  }

  // Get the next item in the array
  next(index: number, step = 1, loop = true): T {
    const nextIndex = this.nextIndex(index, step, loop)
    return this.value[nextIndex]
  }

  // Given an index, returns the index of the previous item
  prevIndex(index: number, step = 1, loop = true) {
    return this.nextIndex(index, -step, loop)
  }

  // Get the previous item in the array
  prev(index: number, step = 1, loop = true): T {
    const prevIndex = this.prevIndex(index, step, loop)
    return this.value[prevIndex]
  }

  // Search for an item in the array by query
  search(
    query: string | null | undefined,
    toString: (item: T) => string,
    current: T | undefined,
  ): T | undefined {
    if (query === null || query === undefined) {
      return current
    }

    // If current item doesn't exist, find the item that matches the search string
    if (!current) {
      return this.find((item) => {
        const itemString = toString(item)
        return itemString.toLowerCase().startsWith(query.toLowerCase())
      })
    }

    // Filter items for ones that match the search string (case insensitive)
    const filtered = this.filter((item) => {
      const itemString = toString(item)
      return itemString.toLowerCase().startsWith(query.toLowerCase())
    })

    // If there are no matches, return the current item
    if (filtered.isEmpty) {
      return current
    }

    // If there is only one match, return it
    if (filtered.length === 1) {
      return filtered.first
    }

    // If there are multiple matches, return the next one after the current item
    return filtered.next(this.value.indexOf(current))
  }
}
