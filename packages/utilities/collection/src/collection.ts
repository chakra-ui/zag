import type { CollectionItem, CollectionNode, CollectionOptions, CollectionSearchOptions } from "./types"

export class Collection<T extends CollectionItem = CollectionItem> {
  private nodes: Map<string, CollectionNode<T>> = new Map()
  private disabledKeys: Set<string> = new Set()

  private _firstKey: string | null = null
  private _lastKey: string | null = null

  constructor(private options: CollectionOptions<T>) {
    const { items, isItemDisabled } = options

    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      const key = this.getItemKey(item)
      const label = this.getItemLabel(item)

      const node: CollectionNode<T> = {
        item: { ...item, label },
        index: i,
        key: key,
        prevKey: this.getItemKey(items[i - 1]) ?? null,
        nextKey: this.getItemKey(items[i + 1]) ?? null,
      }

      this.nodes.set(key, node)

      if (isItemDisabled?.(item)) {
        this.disabledKeys.add(key)
      }

      if (i === 0) {
        this._firstKey = key
      }

      if (i === items.length - 1) {
        this._lastKey = key
      }
    }
  }

  getItem = (key: string | null) => {
    if (key === null) return null
    return this.nodes.get(key)?.item ?? null
  }

  getItems = (keys: string[]): T[] => {
    return keys.map((key) => this.getItem(key)!).filter(Boolean)
  }

  getItemAt = (index: number) => {
    for (const node of this.nodes.values()) {
      if (node.index === index) {
        return node.item
      }
    }
    return null
  }

  sortKeys = (keys: string[]) => {
    return keys.sort((a, b) => {
      const nodeA = this.nodes.get(a)
      const nodeB = this.nodes.get(b)
      return (nodeA?.index ?? 0) - (nodeB?.index ?? 0)
    })
  }

  getItemKey = (item: T) => {
    if (!item) return ""
    return this.options.getItemKey?.(item) ?? item?.value ?? ""
  }

  getItemKeys = (item: T[]) => {
    return item.map((item) => this.getItemKey(item)).filter(Boolean) as string[]
  }

  getItemLabel = (item: T | null) => {
    if (!item) return ""
    return this.options.getItemLabel?.(item) ?? item?.label ?? this.getItemKey(item)
  }

  getKeyLabel = (key: string | null) => {
    if (key == null) return ""
    return this.getItemLabel(this.getItem(key))
  }

  getItemLabels = (item: T[]) => {
    return item.map((item) => this.getItemLabel(item)).filter(Boolean) as string[]
  }

  has = (key: string | null) => {
    if (key == null) return false
    return this.nodes.has(key)
  }

  hasItemKey = (items: T[], key: string) => {
    const keys = this.getItemKeys(items)
    return keys.some((itemKey) => itemKey === key)
  }

  getCount = () => {
    return this.nodes.size
  }

  getFirstKey = () => {
    let firstKey = this._firstKey
    while (firstKey != null) {
      let item = this.nodes.get(firstKey)
      if (item != null && !this.disabledKeys.has(item.key)) {
        return firstKey
      }
      firstKey = item?.nextKey ?? null
    }
    return null
  }

  getLastKey = () => {
    let lastKey = this._lastKey
    while (lastKey != null) {
      let item = this.nodes.get(lastKey)
      if (item != null && !this.disabledKeys.has(item.key)) {
        return lastKey
      }
      lastKey = item?.prevKey ?? null
    }
    return null
  }

  getKeyAfter = (key: string | null) => {
    if (key == null) return null

    const item = this.nodes.get(key)
    let keyAfter = item?.nextKey ?? null

    while (keyAfter != null) {
      let item = this.nodes.get(keyAfter)
      if (item != null && !this.disabledKeys.has(item.key)) {
        return keyAfter
      }
      keyAfter = item?.nextKey ?? null
    }
    return null
  }

  getKeyBefore = (key: string | null) => {
    if (key == null) return null

    const item = this.nodes.get(key)
    let keyBefore = item?.prevKey ?? null

    while (keyBefore != null) {
      let item = this.nodes.get(keyBefore)
      if (item != null && !this.disabledKeys.has(item.key)) {
        return keyBefore
      }
      keyBefore = item?.prevKey ?? null
    }
    return null
  }

  isItemDisabled = (item: T) => {
    return this.disabledKeys.has(this.getItemKey(item))
  }

  private getKeyIndex = (key: string | null) => {
    if (key == null) return -1
    return this.nodes.get(key)?.index ?? -1
  }

  private getByText = (text: string, currentKey: string | null) => {
    const index = this.getKeyIndex(currentKey)
    let items = currentKey ? wrap(Array.from(this.nodes.values()), index) : Array.from(this.nodes.values())

    const isSingleKey = text.length === 1

    if (isSingleKey) {
      items = items.filter((item) => item.key !== currentKey)
    }

    return items.find(({ item }) => match(this.getItemLabel(item), text))
  }

  getKeyFromSearch = (options: CollectionSearchOptions) => {
    const { state, fromKey, eventKey, timeout = 350 } = options

    const search = state.keysSoFar + eventKey
    const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0])

    const query = isRepeated ? search[0] : search

    const nextKey = this.getByText(query, fromKey)?.key ?? null

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

    return nextKey
  }

  toJSON = () => {
    return {
      size: this.getCount(),
      firstKey: this.getFirstKey(),
      lastKey: this.getLastKey(),
    }
  }
}

const match = (label: string, query: string) => {
  return label.toLowerCase().startsWith(query.toLowerCase())
}

const wrap = <T>(v: T[], idx: number) => {
  return v.map((_, index) => v[(Math.max(idx, 0) + index) % v.length])
}
