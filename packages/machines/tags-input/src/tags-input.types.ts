import type { StateMachine as S } from "@zag-js/core"
import type { LiveRegion } from "@zag-js/live-region"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

type IntlTranslations = {
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

type ElementIds = Partial<{
  root: string
  input: string
  clearBtn: string
  label: string
  control: string
  tag(opts: TagProps): string
  tagDeleteBtn(opts: TagProps): string
  tagInput(opts: TagProps): string
}>

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The ids of the elements in the tags input. Useful for composition.
     */
    ids?: ElementIds
    /**
     * Specifies the localized strings that identifies the accessibility elements and their states
     */
    translations: IntlTranslations
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
    onChange?(details: { values: string[] }): void
    /**
     * Callback fired when a tag is focused by pointer or keyboard navigation
     */
    onHighlight?(details: { value: string | null }): void
    /**
     * Callback fired when the max tag count is reached or the `validateTag` function returns `false`
     */
    onInvalid?: (details: { reason: ValidityState }) => void
    /**
     * Callback fired when a tag's value is updated
     */
    onTagUpdate?(details: { value: string; index: number }): void
    /**
     * Returns a boolean that determines whether a tag can be added.
     * Useful for preventing duplicates or invalid tag values.
     */
    validate?(details: { inputValue: string; values: string[] }): boolean
    /**
     * The behavior of the tags input when the input is blurred
     * - `"add"`: add the input value as a new tag
     * - `"none"`: do nothing
     * - `"clear"`: clear the input value
     *
     * @default "none"
     */
    blurBehavior?: "clear" | "add"
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
  }

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * @computed
   * The string value of the tags input
   */
  readonly valueAsString: string
  /**
   * @computed
   * The trimmed value of the input
   */
  readonly trimmedInputValue: string
  /**
   * @computed
   * Whether the tags input is interactive
   */
  readonly isInteractive: boolean
  /**
   * @computed
   * Whether the tags input is at the maximum allowed number of tags
   */
  readonly isAtMax: boolean
  /**
   * @computed
   * The total number of tags
   */
  readonly count: number
  /**
   * @computed
   * Whether the tags input is exceeding the max number of tags
   */
  readonly isOverflowing: boolean
}>

type PrivateContext = Context<{
  /**
   * @internal
   * The intial values of the tags input
   */
  initialValue: string[]
  /**
   * @internal
   * The output log for the screen reader to speak
   */
  log: { current: Log | null; prev: Log | null }
  /**
   * @internal
   * The live region to announce translations to the user
   */
  liveRegion: LiveRegion | null
  /**
   * @internal
   * The `id` of the currently focused tag
   */
  focusedId: string | null
  /**
   * @internal
   * The index of the deleted tag. Used to determine the next tag to focus.
   */
  idx?: number
  /**
   * @internal
   * The `id` of the currently edited tag
   */
  editedId: string | null
  /**
   * @internal
   * The value of the currently edited tag
   */
  editedTagValue?: string
}>

export type MachineContext = PublicContext & ComputedContext & PrivateContext

export type MachineState = {
  value: "unknown" | "idle" | "navigating:tag" | "focused:input" | "editing:tag"
  tags: "focused" | "editing"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type ValidityState = "rangeOverflow" | "invalidTag"

export type TagProps = {
  index: string | number
  value: string
  disabled?: boolean
}
