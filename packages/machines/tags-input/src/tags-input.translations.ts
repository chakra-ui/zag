import type { Required } from "@zag-js/types"
import type { IntlTranslations } from "./tags-input.types"

export const defaultTranslations: Required<IntlTranslations> = {
  clearTriggerLabel: "Clear all tags",
  deleteTagTriggerLabel: (value) => `Delete tag ${value}`,
  tagAdded: (value) => `Added tag ${value}`,
  tagsPasted: (values) => `Pasted ${values.length} tags`,
  tagEdited: (value) => `Editing tag ${value}. Press enter to save or escape to cancel.`,
  tagUpdated: (value) => `Tag update to ${value}`,
  tagDeleted: (value) => `Tag ${value} deleted`,
  tagSelected: (value) => `Tag ${value} selected. Press enter to edit, delete or backspace to remove.`,
  noTagsSelected: "No tags selected",
  inputLabel: (count) => (count === 1 ? "1 tag" : `${count} tags`),
}
