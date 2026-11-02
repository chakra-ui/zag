export interface HighlightRegexOptions {
  /**
   * Whether to ignore case while matching
   */
  ignoreCase?: boolean | undefined
  /**
   * Whether to match multiple instances of the query
   */
  matchAll?: boolean | undefined
  /**
   * Whether to match whole words only
   */
  exactMatch?: boolean | undefined
}

export interface HighlightWordProps extends HighlightRegexOptions {
  /**
   * The text to highlight
   */
  text: string
  /**
   * The query to highlight in the text
   */
  query: string | string[]
}

export interface HighlightRange {
  /**
   * The start index of the range
   */
  start: number
  /**
   * The end index of the range (exclusive)
   */
  end: number
}

export interface HighlightRangesProps {
  /**
   * The text to highlight
   */
  text: string
  /**
   * The ranges of the text to mark as matches, e.g. from a fuzzy matcher
   */
  ranges: HighlightRange[]
}

export interface HighlightChunk {
  /**
   * The text to highlight
   */
  text: string
  /**
   * Whether the text is a match
   */
  match: boolean
}

export interface HighlightSpan {
  /**
   * The start index of the span
   */
  start: number
  /**
   * The end index of the span
   */
  end: number
  /**
   * Whether the span is a match
   */
  match?: boolean | undefined
}
