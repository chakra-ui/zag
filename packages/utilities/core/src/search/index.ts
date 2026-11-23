export { createFilter, type FilterOptions, type FilterReturn } from "./filter"
export { createFuzzySearch, fuzzyScore, rankItems } from "./fuzzy"
export { getFuzzyMatchRanges } from "./fuzzy-ranges"
export { highlightRanges, highlightWord } from "./highlight"
export {
  createTypeaheadState,
  isTypeaheadKey,
  typeahead,
  type TypeaheadOptions,
  type TypeaheadState,
} from "./typeahead"
export type * from "./types"
