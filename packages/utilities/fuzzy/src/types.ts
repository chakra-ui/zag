export interface PreparedText {
  codes: Uint16Array
  bonus: Float32Array
  mask: number
}

export interface PreparedQuery {
  codes: Uint16Array
  mask: number
}

/**
 * The prepared text and keywords of an item, from `prepareFuzzyTarget`.
 */
export interface PreparedTarget {
  text: PreparedText
  keywords: PreparedText[]
}

/**
 * Scores a prepared target from 0 (no match) to 1 (exact match).
 */
export type FuzzyMatcher = (target: PreparedTarget) => number

/**
 * A `[start, end)` range of matched characters.
 */
export interface FuzzyRange {
  start: number
  end: number
}

export interface FuzzySearchOptions<T> {
  /**
   * The text an item is matched against.
   */
  itemToString: (item: T) => string
  /**
   * Extra terms an item also matches, ranked slightly below its text.
   */
  itemToKeywords?: ((item: T) => readonly string[] | undefined) | undefined
}

export interface FuzzySearch<T> {
  /**
   * Returns the items that match the query, best match first.
   * Ties keep their original order.
   */
  search: (items: readonly T[], query: string) => T[]
  /**
   * Clears the cached prepared items and the last search.
   */
  clear: VoidFunction
}
