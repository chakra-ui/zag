import { LiveRegion } from "@ui-machines/dom-utils"
import type { Context } from "@ui-machines/types"

export type ValidateTagOptions = {
  inputValue: string
  values: string[]
}

export type TagsInputMachineContext = Context<{
  /**
   * The separator used to split/join the tag values.
   */
  separator: string
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
   * The live region to announce messages to the user
   */
  liveRegion: LiveRegion | null
  /**
   * The `id` of the currently focused tag
   */
  focusedId: string | null
  /**
   * The `id` of the currently edited tag
   */
  editedId: string | null
  /**
   * The value of the currently edited tag
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
   * Returns a boolean that determines whether a tag can be added.
   * Useful for preventing duplicates or invalid tag values.
   */
  validateTag?(options: ValidateTagOptions): boolean
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
  allowOutOfRange?: boolean
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
  readonly count: number
  readonly outOfRange: boolean
}>

export type TagsInputMachineState = {
  value: "unknown" | "idle" | "navigating:tag" | "focused:input" | "editing:tag"
}

export type InvalidReason = "outOfRange" | "invalidTag"
