import type { Required } from "@zag-js/types"
import type { IntlTranslations } from "./combobox.types"

export const defaultTranslations: Required<IntlTranslations> = {
  triggerLabel: "Toggle suggestions",
  clearTriggerLabel: "Clear value",
  resultsCount: (count) => (count === 1 ? "1 result" : `${count} results`),
  noResults: "No results",
  loading: "Loading results",
}
