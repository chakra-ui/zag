import { LiveRegion } from "@ui-machines/dom-utils"
import type { Context } from "@ui-machines/types"

export type ValidateTagOptions = {
  inputValue: string
  values: string[]
}

type IntlMessages = {
  clearButtonLabel: string
  deleteTagButtonLabel(value: string): string
  tagSelected(value: string): string
  tagAdded(value: string): string
  tagsPasted(values: string[]): string
  tagEdited(value: string): string
  tagUpdated(value: string): string
  tagDeleted(value: string): string
  noTagsSelected?: string
  inputLabel?(count: number): string
}

type Log =
  | { type: "add" | "update" | "delete" | "select"; value: string }
  | { type: "clear" }
  | { type: "paste"; values: string[] }
  | { type: "set"; values: string[] }

export type MachineContext = Context<{
  /**
   * The output log for the screen reader to speak
   */
  log: { current: Log | null; prev: Log | null }
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  messages: IntlMessages
  /**
   * The max length of the input.
   */
  maxLength?: number
  /**
   * The character that serves has:
   * - event key to trigger the addition of a new tag
   * - character used to split tags when pasting into the input
   *
   * @default "," (aka COMMA)
   */
  delimiter: string | null
  /**
   * Whether the input should be auto-focused
   */
  autoFocus?: boolean
  /**
   * Whether the tags input should be disabled
   */
  disabled?: boolean
  /**
   * Whether the tags input should be read-only
   */
  readonly?: boolean
  /**
   * Whether the tags input is invalid
   */
  invalid?: boolean
  /**
   * Whether a tag can be edited after creation.
   * If `true` and focus is on a tag, pressing `Enter`or double clicking will edit the tag.
   */
  allowEditTag?: boolean
  /**
   * @internal The live region to announce messages to the user
   */
  liveRegion: LiveRegion | null
  /**
   * @internal The `id` of the currently focused tag
   */
  focusedId: string | null
  /**
   * @internal The index of the deleted tag. Used to determine the next tag to focus.
   */
  __index?: number
  /**
   * @internal The `id` of the currently edited tag
   */
  editedId: string | null
  /**
   * @internal The value of the currently edited tag
   */
  editedTagValue?: string
  /**
   * The tag input's value
   */
  inputValue: string
  /**
   * The tag values
   */
  value: string[]
  /**
   * Callback fired when the tag values is updated
   */
  onChange?(values: string[]): void
  /**
   * Callback fired when a tag is focused by pointer or keyboard navigation
   */
  onHighlight?(value: string | null): void
  /**
   * Callback fired when the max tag count is reached or the `validateTag` function returns `false`
   */
  onInvalid?: (error: InvalidReason) => void
  /**
   * Callback fired when a tag's value is updated
   */
  onTagUpdate?(value: string, index: number): void
  /**
   * Returns a boolean that determines whether a tag can be added.
   * Useful for preventing duplicates or invalid tag values.
   */
  validate?(options: ValidateTagOptions): boolean
  /**
   * Whether to add a tag when the tag input is blurred
   */
  addOnBlur?: boolean
  /**
   * Whether to add a tag when you paste values into the tag input
   */
  addOnPaste?: boolean
  /**
   * The max number of tags
   */
  max: number
  /**
   * Whether to allow tags to exceed max. In this case,
   * we'll attach `data-invalid` to the root
   */
  allowOverflow?: boolean
  /**
   * The name attribute for the input. Useful for form submissions
   */
  name?: string
  /**
   * @computed the string value of the tags input
   */
  readonly valueAsString: string
  /**
   * @computed the trimmed value of the input
   */
  readonly trimmedInputValue: string
  /**
   * @computed whether the tags input is interactive
   */
  readonly isInteractive: boolean
  /**
   * @computed whether the tags input is at the maximum allowed number of tags
   */
  readonly isAtMax: boolean
  /**
   * @computed the total number of tags
   */
  readonly count: number
  /**
   * @computed whether the tags input is exceeding the max number of tags
   */
  readonly isOverflowing: boolean
}>

export type MachineState = {
  value: "unknown" | "idle" | "navigating:tag" | "focused:input" | "editing:tag"
  tags: "focused" | "editing"
}

export type InvalidReason = "rangeOverflow" | "invalidTag"

export type TagProps = {
  index: string | number
  value: string
  disabled?: boolean
}
