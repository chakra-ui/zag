import type { StateMachine as S } from "@zag-js/core"
import type { Context, DirectionProperty } from "@zag-js/types"

//

export type ActivationMode = "focus" | "dblclick" | "none"

export type SubmitMode = "enter" | "blur" | "both" | "none"

//

type IntlMessages = {
  edit: string
  submit: string
  cancel: string
  input: string
}

//

type ElementIds = Partial<{
  root: string
  area: string
  label: string
  preview: string
  input: string
  controlGroup: string
  submitBtn: string
  cancelBtn: string
  editBtn: string
}>

//

type PublicContext = DirectionProperty & {
  /**
   * The ids of the elements in the editable. Useful for composition.
   */
  ids?: ElementIds
  /**
   * Whether the input's value is invalid.
   */
  invalid?: boolean
  /**
   * The name attribute of the editable component. Used for form submission.
   */
  name?: string
  /**
   * Whether the editable should auto-resize to fit the content.
   */
  autoResize?: boolean
  /**
   * The activation mode for the preview element.
   *
   * - "focus" - Enter edit mode when the preview element is focused
   * - "dblclick" - Enter edit mode when the preview element is double-clicked
   * - "none" - No interaction with the preview element will trigger edit mode.
   *
   * @default "focus"
   */
  activationMode: ActivationMode
  /**
   * The action that triggers submit in the edit mode:
   *
   * - "enter" - Trigger submit when the enter key is pressed
   * - "blur" - Trigger submit when the editable is blurred
   * - "none" - No action will trigger submit. You need to use the submit button
   * - "both" - Pressing `Enter` and blurring the input will trigger submit
   *
   * @default "enter"
   */
  submitMode: SubmitMode
  /**
   * Whether to start with the edit mode active.
   */
  startWithEditView: boolean
  /**
   * Whether to select the text in the input when it is focused.
   */
  selectOnFocus?: boolean
  /**
   * The value of the editable in both edit and preview mode
   */
  value: string
  /**
   * The maximum number of characters allowed in the editable
   */
  maxLength?: number
  /**
   * Whether the editable is disabled
   */
  disabled?: boolean
  /**
   * Whether the editable is readonly
   */
  readonly?: boolean
  /**
   * The callback that is called when the editable's value is changed
   */
  onChange?: (details: { value: string }) => void
  /**
   * The callback that is called when the esc key is pressed or the cancel button is clicked
   */
  onCancel?: (details: { value: string }) => void
  /**
   * The callback that is called when the editable's value is submitted.
   */
  onSubmit?: (details: { value: string }) => void
  /**
   * The callback that is called when in the edit mode.
   */
  onEdit?: () => void
  /**
   * The placeholder value to show when the `value` is empty
   */
  placeholder?: string
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  messages: IntlMessages
}

export type UserDefinedContext = Partial<PublicContext>

//

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the editable can be interacted with
   */
  isInteractive: boolean
  /**
   * @computed
   * Whether value is empty
   */
  isValueEmpty: boolean
  /**
   * @computed
   * Whether the preview element is focusable
   */
  isPreviewFocusable: boolean
  /**
   * @computed
   * Whether to submit on enter press
   */
  submitOnEnter: boolean
  /**
   * @computed
   * Whether to submit on blur
   */
  submitOnBlur: boolean
}>

//

type PrivateContext = Context<{
  /**
   * @internal
   * The previous value of the editable. Used to revert in case of cancel/escape
   */
  previousValue: string
}>

//

export type MachineContext = PublicContext & PrivateContext & ComputedContext

//

export type MachineState = {
  value: "unknown" | "preview" | "edit"
}

export type State = S.State<MachineContext, MachineState>

//

export type Send = S.Send<S.AnyEventObject>
