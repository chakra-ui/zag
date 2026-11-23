export interface HighlightWordProps {
  /**
   * The text to highlight
   */
  text: string
  /**
   * The query to highlight in the text
   */
  query: string | string[]
  /**
   * Whether to ignore case while matching
   */
  ignoreCase?: boolean | undefined
  /**
   * Whether to match every occurrence. Defaults to `true` for an array query.
   */
  matchAll?: boolean | undefined
  /**
   * Whether to match whole words only
   */
  exactMatch?: boolean | undefined
}

/**
 * A `[start, end)` range of matched characters.
 */
export interface HighlightRange {
  start: number
  end: number
}

export interface HighlightRangesProps {
  /**
   * The text to highlight
   */
  text: string
  /**
   * The ranges of the text to mark as matches, e.g. from `getFuzzyMatchRanges`
   */
  ranges: HighlightRange[]
}

export interface HighlightChunk {
  /**
   * The text of the chunk
   */
  text: string
  /**
   * Whether the chunk is a match
   */
  match: boolean
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
