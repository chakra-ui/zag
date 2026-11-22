import type { Required } from "@zag-js/types"
import type { IntlTranslations } from "./autocomplete.types"

export const defaultTranslations: Required<IntlTranslations> = {
  triggerLabel: "Show suggestions",
  clearTriggerLabel: "Clear",
  resultsCount: (count) => (count === 1 ? "1 suggestion" : `${count} suggestions`),
  noResults: "No suggestions",
  loading: "Loading suggestions",
  highlightedItem: ({ label }) => label,
}
