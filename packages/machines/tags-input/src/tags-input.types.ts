import type { StateMachine as S } from "@zag-js/core"
import type { LiveRegion } from "@zag-js/live-region"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { InteractOutsideHandlers } from "@zag-js/interact-outside"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: string[]
}

export interface HighlightChangeDetails {
  highlightedValue: string | null
}

export type ValidityState = "rangeOverflow" | "invalidTag"

export interface ValidityChangeDetails {
  reason: ValidityState
}

interface ValidateArgs {
  inputValue: string
  value: string[]
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface IntlTranslations {
  clearTriggerLabel: string
  deleteTagTriggerLabel(value: string): string
  tagSelected(value: string): string
  tagAdded(value: string): string
  tagsPasted(value: string[]): string
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

export type ElementIds = Partial<{
  root: string
  input: string
  clearBtn: string
  label: string
  control: string
  item(opts: ItemProps): string
  itemDeleteTrigger(opts: ItemProps): string
  itemInput(opts: ItemProps): string
}>

interface PublicContext extends DirectionProperty, CommonProperties, InteractOutsideHandlers {
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
  readOnly?: boolean
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
  onValueChange?(details: ValueChangeDetails): void
  /**
   * Callback fired when a tag is highlighted by pointer or keyboard navigation
   */
  onHighlightChange?(details: HighlightChangeDetails): void
  /**
   * Callback fired when the max tag count is reached or the `validateTag` function returns `false`
   */
  onValueInvalid?(details: ValidityChangeDetails): void
  /**
   * Returns a boolean that determines whether a tag can be added.
   * Useful for preventing duplicates or invalid tag values.
   */
  validate?(details: ValidateArgs): boolean
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
  /**
   * The associate form of the underlying input element.
   */
  form?: string
}

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * @computed
   * The string value of the tags input
   */
  valueAsString: string
  /**
   * @computed
   * The trimmed value of the input
   */
  trimmedInputValue: string
  /**
   * @computed
   * Whether the tags input is interactive
   */
  isInteractive: boolean
  /**
   * @computed
   * Whether the tags input is at the maximum allowed number of tags
   */
  isAtMax: boolean
  /**
   * @computed
   * The total number of tags
   */
  count: number
  /**
   * @computed
   * Whether the tags input is exceeding the max number of tags
   */
  isOverflowing: boolean
  /**
   * @computed
   * Whether the tags input is disabled
   */
  isDisabled: boolean
}>

type PrivateContext = Context<{
  /**
   * @internal
   * The output log for the screen reader to speak
   */
  log: { current: Log | null; prev: Log | null }
  /**
   * @internal
   * The live region to announce changes to the user
   */
  liveRegion: LiveRegion | null
  /**
   * @internal
   * The `id` of the currently highlighted tag
   */
  highlightedTagId: string | null
  /**
   * @internal
   * The index of the deleted tag. Used to determine the next tag to focus.
   */
  idx?: number
  /**
   * @internal
   * The `id` of the currently edited tag
   */
  editedTagId: string | null
  /**
   * @internal
   * The value of the currently edited tag
   */
  editedTagValue: string
  /**
   * @internal
   * Whether the fieldset is disabled
   */
  fieldsetDisabled: boolean
}>

export interface MachineContext extends PublicContext, ComputedContext, PrivateContext {}

export interface MachineState {
  value: "idle" | "navigating:tag" | "focused:input" | "editing:tag"
  tags: "focused" | "editing"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  index: string | number
  value: string
  disabled?: boolean
}

export interface ItemState {
  id: string
  isEditing: boolean
  isHighlighted: boolean
  isDisabled: boolean
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the tags are empty
   */
  isEmpty: boolean
  /**
   * The value of the tags entry input.
   */
  inputValue: string
  /**
   * The value of the tags as an array of strings.
   */
  value: string[]
  /**
   * The value of the tags as a string.
   */
  valueAsString: string
  /**
   * The number of the tags.
   */
  count: number
  /**
   * Whether the tags have reached the max limit.
   */
  isAtMax: boolean
  /**
   * Function to set the value of the tags.
   */
  setValue(value: string[]): void
  /**
   * Function to clear the value of the tags.
   */
  clearValue(id?: string): void
  /**
   * Function to add a tag to the tags.
   */
  addValue(value: string): void
  /**
   * Function to set the value of a tag at the given index.
   */
  setValueAtIndex(index: number, value: string): void
  /**
   * Function to set the value of the tags entry input.
   */
  setInputValue(value: string): void
  /**
   * Function to clear the value of the tags entry input.
   */
  clearInputValue(): void
  /**
   * Function to focus the tags entry input.
   */
  focus(): void
  /**
   * Returns the state of a tag
   */
  getItemState(props: ItemProps): ItemState

  rootProps: T["element"]
  labelProps: T["label"]
  controlProps: T["element"]
  inputProps: T["input"]
  hiddenInputProps: T["input"]
  clearTriggerProps: T["button"]
  getItemProps(options: ItemProps): T["element"]
  getItemPreviewProps(options: ItemProps): T["element"]
  getItemTextProps(options: ItemProps): T["element"]
  getItemInputProps(options: ItemProps): T["input"]
  getItemDeleteTriggerProps(options: ItemProps): T["button"]
}
