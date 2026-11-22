import type { Required } from "@zag-js/types"
import type { IntlTranslations } from "./combobox.types"

export const defaultTranslations: Required<IntlTranslations> = {
  triggerLabel: "Toggle suggestions",
  clearTriggerLabel: "Clear value",
  deleteChipTriggerLabel: (label) => `Delete ${label}`,
  chipDeleted: (label) => `${label} deleted`,
  resultsCount: (count) => (count === 1 ? "1 result" : `${count} results`),
  noResults: "No results",
  loading: "Loading results",
  highlightedItem: ({ label, selected }) => (selected ? `${label}, selected` : label),
  creatingItem: (inputValue) => `Creating "${inputValue}"`,
  createItemFailed: ({ inputValue }) => `Couldn't create "${inputValue}"`,
}
