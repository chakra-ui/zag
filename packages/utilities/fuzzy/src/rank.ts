import { prepareFuzzyTarget } from "./prepare"
import { createFuzzyMatcher } from "./score"
import type { FuzzySearch, FuzzySearchOptions, PreparedTarget } from "./types"

interface Entry<T> {
  item: T
  index: number
  score: number
}

const byScore = <T>(a: Entry<T>, b: Entry<T>) => b.score - a.score || a.index - b.index

/**
 * Returns the items with a score above 0, highest first. Ties keep their original order.
 */
export function rankItems<T>(items: readonly T[], score: (item: T) => number): T[] {
  const entries: Entry<T>[] = []
  items.forEach((item, index) => {
    const value = score(item)
    if (value > 0) entries.push({ item, index, score: value })
  })
  return entries.sort(byScore).map((entry) => entry.item)
}

interface LastSearch<T> {
  items: readonly T[]
  length: number
  query: string
  // indexes into `items` of the matches
  matches: number[]
}

/**
 * Creates a fuzzy search that caches each object item's prepared text. When the query
 * only grows on the same items, it searches the previous matches instead of all items.
 * Pass a new array when the items change, or call `clear()` after changing them in place.
 */
export function createFuzzySearch<T>(options: FuzzySearchOptions<T>): FuzzySearch<T> {
  const { itemToString, itemToKeywords } = options

  let cache = new WeakMap<object, PreparedTarget>()
  let last: LastSearch<T> | null = null

  const prepare = (item: T) => {
    const cacheable = typeof item === "object" && item !== null
    let target = cacheable ? cache.get(item) : undefined
    if (!target) {
      target = prepareFuzzyTarget(itemToString(item), itemToKeywords?.(item))
      if (cacheable) cache.set(item, target)
    }
    return target
  }

  const search = (items: readonly T[], query: string): T[] => {
    const trimmed = query.trim()
    if (!trimmed) {
      last = null
      return [...items]
    }

    // a match for the longer query also matches the shorter one
    const narrow =
      last !== null && last.items === items && last.length === items.length && trimmed.startsWith(last.query)
    const pool = narrow ? last!.matches : items.map((_, index) => index)

    const match = createFuzzyMatcher(trimmed)
    const entries: Entry<number>[] = []
    for (const index of pool) {
      const score = match(prepare(items[index]))
      if (score > 0) entries.push({ item: index, index, score })
    }
    entries.sort(byScore)

    const matches = entries.map((entry) => entry.item)
    last = { items, length: items.length, query: trimmed, matches }
    return matches.map((index) => items[index])
  }

  const clear = () => {
    cache = new WeakMap()
    last = null
  }

  return { search, clear }
}
